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

export interface AppState {
  // 左侧边栏
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

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
  conversationVersion: number;
  goHome: () => void;

  // ---- pendingPrompt（模板点击 → 聊天输入）----
  pendingPrompt: { prompt: string; title: string } | null;
  setPendingPrompt: (p: { prompt: string; title: string } | null) => void;

  // ---- Agent 取消 ----
  abortController: AbortController | null;
  cancelAgent: () => void;

  // ---- A2UI 渲染数据（A2UICustomRenderer 桥接）----
  surfaces: { surfaceId: string; catalogId?: string; components: A2UIComponent[] }[];
  setSurfaces: (surfaces: AppState["surfaces"]) => void;

  // ---- Agent 回调（A2UICustomRenderer 桥接）----
  runAgentAction: ((action: { name: string; context: Record<string, unknown> }) => void) | null;
  setRunAgentAction: (fn: AppState["runAgentAction"]) => void;

  // ---- Agent 错误 ----
  agentError: string | null;
  setAgentError: (msg: string | null) => void;

  // ---- 加载状态 ----
  isAgentThinking: boolean;
  setAgentThinking: (thinking: boolean) => void;

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
    set((s) => ({ conversationLoading: true, conversationError: null, surfaces: [], agentError: null, conversationVersion: s.conversationVersion + 1 }));
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
    set((s) => ({ conversationLoading: true, conversationError: null, surfaces: [], agentError: null, conversationVersion: s.conversationVersion + 1 }));
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
  conversationVersion: 0,
  goHome: () =>
    set((s) => ({
      currentConversationId: null,
      currentConversationDetail: null,
      surfaces: [],
      agentError: null,
      conversationVersion: s.conversationVersion + 1,
    })),

  // ---- Agent 错误 ----
  agentError: null,
  setAgentError: (msg) => set({ agentError: msg }),

  // ---- pendingPrompt ----
  pendingPrompt: null,
  setPendingPrompt: (p) => set({ pendingPrompt: p }),

  // ---- Agent 取消 ----
  abortController: null,
  cancelAgent: () => {
    const ctrl = get().abortController;
    if (ctrl) {
      ctrl.abort();
      set({ abortController: null, isAgentThinking: false, agentError: "已取消生成" });
    }
  },

  // ---- A2UI ----
  surfaces: [],
  setSurfaces: (surfaces) => set({ surfaces }),

  runAgentAction: null,
  setRunAgentAction: (fn) => set({ runAgentAction: fn }),

  isAgentThinking: false,
  setAgentThinking: (thinking) => set({ isAgentThinking: thinking }),

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
