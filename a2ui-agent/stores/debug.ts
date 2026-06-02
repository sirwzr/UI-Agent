// ===== 调试可观测性 Store（仅 dev 模式使用）=====
import { create } from "zustand";

export interface ToolCallEntry {
  ts: number;
  tool: string;
  params: Record<string, unknown>;
  duration: number;
  success: boolean;
  error?: string;
}

export interface ApiCallEntry {
  ts: number;
  endpoint: string;
  method: string;
  status: number;
  duration: number;
}

const MAX_ENTRIES = 50;

export interface DebugState {
  toolCalls: ToolCallEntry[];
  addToolCall: (entry: ToolCallEntry) => void;
  apiCalls: ApiCallEntry[];
  addApiCall: (entry: ApiCallEntry) => void;
  clearAll: () => void;
}

export const useDebugStore = create<DebugState>((set) => ({
  toolCalls: [],
  addToolCall: (entry) =>
    set((s) => ({
      toolCalls: [entry, ...s.toolCalls].slice(0, MAX_ENTRIES),
    })),
  apiCalls: [],
  addApiCall: (entry) =>
    set((s) => ({
      apiCalls: [entry, ...s.apiCalls].slice(0, MAX_ENTRIES),
    })),
  clearAll: () => set({ toolCalls: [], apiCalls: [] }),
}));
