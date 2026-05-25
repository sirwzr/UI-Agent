"use client";

import { useAppStore } from "@/stores/app";

/**
 * 对话 Hook — 从 Zustand store 读取状态，保持与旧接口兼容。
 * 所有 API 调用逻辑已移入 store actions。
 */
export function useConversation() {
  const conversations = useAppStore((s) => s.conversations);
  const currentId = useAppStore((s) => s.currentConversationId);
  const current = useAppStore((s) => s.currentConversationDetail);
  const loading = useAppStore((s) => s.conversationLoading);
  const error = useAppStore((s) => s.conversationError);

  const create = useAppStore((s) => s.createConversation);
  const load = useAppStore((s) => s.loadConversation);
  const archive = useAppStore((s) => s.archiveConversation);
  const remove = useAppStore((s) => s.removeConversation);
  const refresh = useAppStore((s) => s.fetchConversationList);

  return {
    conversations,
    currentId,
    current,
    loading,
    error,
    create,
    load,
    remove,
    archive,
    refresh,
    setCurrentId: useAppStore.getState().loadConversation,
  };
}
