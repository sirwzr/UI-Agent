// ===== Zustand 全局应用状态 =====
import { create } from "zustand";
import type { A2UIComponent } from "@/lib/a2ui/render-surface";

// ---- 对话类型 ----
export interface ConversationSummary {
  id: string;
  title: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

export interface ConversationDetail {
  id: string;
  title: string | null;
  status: string;
  messages: {
    id: string;
    role: string;
    content: string;
    textContent: string | null;
    createdAt: string;
  }[];
  surfaceStates: {
    id: string;
    surfaceId: string;
    dataModel: unknown;
    componentTree: unknown;
  }[];
}

// ---- 思考阶段 ----
export interface ThinkingStage {
  id: string;
  label: string;
  status: "pending" | "in-progress" | "done";
}

export interface AppState {
  // 左侧边栏
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // 右侧思考面板
  rightPanelOpen: boolean;
  toggleRightPanel: () => void;
  setRightPanelOpen: (open: boolean) => void;

  // ---- 对话状态 ----
  conversations: ConversationSummary[];
  conversationLoading: boolean;
  conversationError: string | null;
  currentConversationId: string | null;
  currentConversationDetail: ConversationDetail | null;

  fetchConversationList: () => Promise<void>;
  createConversation: (title?: string) => Promise<ConversationSummary | null>;
  loadConversation: (id: string) => Promise<void>;
  archiveConversation: (id: string) => Promise<void>;
  removeConversation: (id: string) => Promise<void>;
  updateConversationTitle: (id: string, title: string) => Promise<void>;

  // ---- 导航 ----
  goHome: () => void;

  // ---- pendingPrompt（模板点击 → 聊天输入）----
  pendingPrompt: { prompt: string; title: string } | null;
  setPendingPrompt: (p: { prompt: string; title: string } | null) => void;

  // ---- Wizard 向导 ----
  activeWizard: { template: { prompt: string; title: string; category: string } } | null;
  setActiveWizard: (w: { template: { prompt: string; title: string; category: string } } | null) => void;

  // ---- Agent 取消 ----
  abortController: AbortController | null;
  cancelAgent: () => void;

  // ---- 搜索状态 ----
  searchStatus: { status: "idle" | "searching" | "done" | "fallback"; message?: string } | null;
  setSearchStatus: (s: { status: "idle" | "searching" | "done" | "fallback"; message?: string } | null) => void;

  // ---- A2UI 渲染数据（A2UICustomRenderer 桥接）----
  surfaces: { surfaceId: string; catalogId?: string; components: A2UIComponent[] }[];
  setSurfaces: (surfaces: AppState["surfaces"]) => void;

  // ---- 思考阶段 ----
  thinkingStages: ThinkingStage[];
  setThinkingStages: (stages: ThinkingStage[]) => void;
  updateThinkingStage: (id: string, partial: Partial<ThinkingStage>) => void;

  // ---- Agent 回调（A2UICustomRenderer 桥接）----
  runAgentAction: ((action: { name: string; context: Record<string, unknown> }) => void) | null;
  setRunAgentAction: (fn: AppState["runAgentAction"]) => void;

  // ---- Agent 错误 ----
  agentError: string | null;
  setAgentError: (msg: string | null) => void;

  // ---- 加载状态 ----
  isAgentThinking: boolean;
  setAgentThinking: (thinking: boolean) => void;

  // ---- 思考阶段推进 ----
  advanceThinkingStage: () => void;

  // ---- 组件编辑 ----
  selectedComponentId: string | null;
  setSelectedComponentId: (id: string | null) => void;
  editorOpen: boolean;
  toggleEditor: () => void;
  updateComponentProp: (surfaceId: string, componentId: string, key: string, value: unknown) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  rightPanelOpen: true,
  toggleRightPanel: () => set((s) => ({ rightPanelOpen: !s.rightPanelOpen })),
  setRightPanelOpen: (open) => set({ rightPanelOpen: open }),

  // ---- 对话状态 ----
  conversations: [],
  conversationLoading: false,
  conversationError: null,
  currentConversationId: null,
  currentConversationDetail: null,

  fetchConversationList: async () => {
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) return;
      const data = await res.json();
      set({ conversations: data.conversations ?? [] });
    } catch {
      // 静默失败
    }
  },

  createConversation: async (title) => {
    set({ conversationLoading: true, conversationError: null, surfaces: [], agentError: null });
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (!res.ok) throw new Error("创建失败");
      const data = await res.json();
      set({
        currentConversationId: data.conversation.id,
        currentConversationDetail: data.conversation,
      });
      get().fetchConversationList();
      return data.conversation;
    } catch (e) {
      set({ conversationError: e instanceof Error ? e.message : "创建失败" });
      return null;
    } finally {
      set({ conversationLoading: false });
    }
  },

  loadConversation: async (id) => {
    set({ conversationLoading: true, conversationError: null, surfaces: [], agentError: null });
    try {
      const res = await fetch(`/api/conversations/${id}`);
      if (!res.ok) throw new Error("加载失败");
      const data = await res.json();
      set({
        currentConversationId: id,
        currentConversationDetail: data.conversation,
      });
    } catch (e) {
      set({ conversationError: e instanceof Error ? e.message : "加载失败" });
    } finally {
      set({ conversationLoading: false });
    }
  },

  archiveConversation: async (id) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "archived" }),
      });
      if (!res.ok) throw new Error("归档失败");
      if (get().currentConversationId === id) {
        set({ currentConversationId: null, currentConversationDetail: null });
      }
      get().fetchConversationList();
    } catch (e) {
      set({ conversationError: e instanceof Error ? e.message : "归档失败" });
    }
  },

  removeConversation: async (id) => {
    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("删除失败");
      if (get().currentConversationId === id) {
        set({ currentConversationId: null, currentConversationDetail: null });
      }
      get().fetchConversationList();
    } catch (e) {
      set({ conversationError: e instanceof Error ? e.message : "删除失败" });
    }
  },

  updateConversationTitle: async (id, title) => {
    try {
      await fetch(`/api/conversations/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      get().fetchConversationList();
    } catch {
      // 静默失败，标题更新不影响核心功能
    }
  },

  // ---- 导航 ----
  goHome: () =>
    set({
      currentConversationId: null,
      currentConversationDetail: null,
      surfaces: [],
      agentError: null,
    }),

  // ---- Agent 错误 ----
  agentError: null,
  setAgentError: (msg) => set({ agentError: msg }),

  // ---- pendingPrompt ----
  pendingPrompt: null,
  setPendingPrompt: (p) => set({ pendingPrompt: p }),

  // ---- Wizard ----
  activeWizard: null,
  setActiveWizard: (w) => set({ activeWizard: w }),

  // ---- Agent 取消 ----
  abortController: null,
  cancelAgent: () => {
    const ctrl = get().abortController;
    if (ctrl) {
      ctrl.abort();
      set({ abortController: null, isAgentThinking: false, agentError: "已取消生成" });
    }
  },

  // ---- 搜索状态 ----
  searchStatus: null,
  setSearchStatus: (s) => set({ searchStatus: s }),

  // ---- A2UI ----
  surfaces: [],
  setSurfaces: (surfaces) => set({ surfaces }),

  thinkingStages: [
    { id: "analyze", label: "分析需求", status: "pending" },
    { id: "search", label: "搜索数据", status: "pending" },
    { id: "design", label: "设计布局", status: "pending" },
    { id: "generate", label: "生成组件", status: "pending" },
  ],
  setThinkingStages: (stages) => set({ thinkingStages: stages }),
  updateThinkingStage: (id, partial) =>
    set((s) => ({
      thinkingStages: s.thinkingStages.map((st) =>
        st.id === id ? { ...st, ...partial } : st,
      ),
    })),

  runAgentAction: null,
  setRunAgentAction: (fn) => set({ runAgentAction: fn }),

  isAgentThinking: false,
  setAgentThinking: (thinking) => set({ isAgentThinking: thinking }),

  // ---- 思考阶段推进 ----
  advanceThinkingStage: () =>
    set((s) => {
      const stages = [...s.thinkingStages];
      const inProgressIdx = stages.findIndex((st) => st.status === "in-progress");
      if (inProgressIdx >= 0) {
        stages[inProgressIdx] = { ...stages[inProgressIdx], status: "done" };
        const nextIdx = inProgressIdx + 1;
        if (nextIdx < stages.length) {
          stages[nextIdx] = { ...stages[nextIdx], status: "in-progress" };
        }
      } else {
        const firstPending = stages.findIndex((st) => st.status === "pending");
        if (firstPending >= 0) {
          stages[firstPending] = { ...stages[firstPending], status: "in-progress" };
        }
      }
      return { thinkingStages: stages };
    }),

  // ---- 组件编辑 ----
  selectedComponentId: null,
  setSelectedComponentId: (id) => set({ selectedComponentId: id }),
  editorOpen: false,
  toggleEditor: () => set((s) => ({ editorOpen: !s.editorOpen })),
  updateComponentProp: (surfaceId, componentId, key, value) =>
    set((s) => ({
      surfaces: s.surfaces.map((surface) =>
        surface.surfaceId === surfaceId
          ? {
              ...surface,
              components: surface.components.map((comp) =>
                comp.id === componentId ? { ...comp, [key]: value } : comp,
              ),
            }
          : surface,
      ),
    })),
}));

// 初始化：页面加载时拉取对话列表
if (typeof window !== "undefined") {
  useAppStore.getState().fetchConversationList();
}
