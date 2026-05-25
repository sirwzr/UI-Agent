"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { Layout, Button, List, Popconfirm, Badge, Typography, message } from "antd";
import {
  PlusOutlined,
  InboxOutlined,
  MessageOutlined,
} from "@ant-design/icons";
import { CopilotChat } from "@copilotkitnext/react";
import { useConversation } from "@/hooks/useConversation";
import { useAppStore } from "@/stores/app";

const { Sider } = Layout;
const { Text } = Typography;

export function LeftPanel() {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const pendingPrompt = useAppStore((s) => s.pendingPrompt);
  const setPendingPrompt = useAppStore((s) => s.setPendingPrompt);
  const createConversation = useAppStore((s) => s.createConversation);

  const siderRef = useRef<HTMLDivElement>(null);

  const {
    conversations,
    currentId,
    loading: convLoading,
    create: createConv,
    load: loadConv,
    archive: archiveConv,
  } = useConversation();

  const handleNewConversation = useCallback(async () => {
    const conv = await createConv("新对话");
    if (conv) message.success("已创建新对话");
  }, [createConv]);

  const handleSelectConversation = useCallback(
    (id: string) => loadConv(id),
    [loadConv],
  );

  const handleArchiveConversation = useCallback(
    async (id: string) => {
      await archiveConv(id);
      message.success("已归档对话");
    },
    [archiveConv],
  );

  // 模板点击 → 创建新对话 → 注入文本 → 发送
  useEffect(() => {
    if (!pendingPrompt) return;

    const send = async () => {
      const conv = await createConversation(pendingPrompt.title);
      if (!conv) {
        setPendingPrompt(null);
        return;
      }

      const container = siderRef.current;
      if (!container) {
        setPendingPrompt(null);
        return;
      }

      const input = container.querySelector('[contenteditable="true"]') as HTMLElement;
      if (input) {
        input.textContent = pendingPrompt.prompt;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        setTimeout(() => {
          const sendBtn = container.querySelector('[aria-label="Send"]') as HTMLElement;
          if (sendBtn) sendBtn.click();
          setPendingPrompt(null);
        }, 100);
      } else {
        setPendingPrompt(null);
      }
    };

    send();
  }, [pendingPrompt, setPendingPrompt, createConversation]);

  if (!sidebarOpen) return null;

  return (
    <Sider
      width={280}
      style={{
        background: "var(--sidebar-gradient, linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%))",
        borderRight: "1px solid var(--border-color, #e2e8f0)",
        overflow: "auto",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div ref={siderRef} style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div style={{ padding: "16px 12px 12px" }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block
            onClick={handleNewConversation}
            loading={convLoading}
            style={{
              background: "linear-gradient(135deg, #3b82f6, #6366f1)",
              border: "none",
              height: 42,
              fontSize: 14,
              fontWeight: 600,
              borderRadius: 10,
              boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
            }}
          >
            新建对话
          </Button>
        </div>

        <List
          dataSource={conversations}
          locale={{ emptyText: "暂无对话记录" }}
          style={{ flex: 1, overflow: "auto", padding: "0 8px" }}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleSelectConversation(item.id)}
              style={{
                cursor: "pointer",
                padding: "12px 14px",
                borderRadius: 10,
                margin: "0 2px 3px",
                background: item.id === currentId
                  ? "rgba(59,130,246,0.08)"
                  : undefined,
                border: "none",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (item.id !== currentId) {
                  (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.03)";
                }
              }}
              onMouseLeave={(e) => {
                if (item.id !== currentId) {
                  (e.currentTarget as HTMLElement).style.background = "";
                }
              }}
              actions={[
                <Popconfirm
                  key="archive"
                  title="确认归档此对话？"
                  onConfirm={(e) => {
                    e?.stopPropagation();
                    handleArchiveConversation(item.id);
                  }}
                  onCancel={(e) => e?.stopPropagation()}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<InboxOutlined />}
                    onClick={(e) => e.stopPropagation()}
                    style={{ color: "#94a3b8" }}
                  />
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Badge count={item._count.messages} size="small" overflowCount={99}>
                    <div style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: item.id === currentId
                        ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                        : "linear-gradient(135deg, #e2e8f0, #cbd5e1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}>
                      <MessageOutlined style={{ fontSize: 16, color: item.id === currentId ? "#fff" : "#64748b" }} />
                    </div>
                  </Badge>
                }
                title={
                  <Text ellipsis style={{ maxWidth: 140, fontSize: 13, fontWeight: item.id === currentId ? 600 : 400 }}>
                    {item.title ?? "未命名对话"}
                  </Text>
                }
                description={
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {new Date(item.updatedAt).toLocaleDateString("zh-CN")}
                  </Text>
                }
              />
            </List.Item>
          )}
        />

        <div
          style={{
            borderTop: "1px solid var(--border-color, #e2e8f0)",
            flexShrink: 0,
            padding: "4px",
          }}
        >
          <CopilotChat
            key={currentId ?? "default"}
            threadId={currentId ?? undefined}
            labels={{
              modalHeaderTitle: "AI 界面助手",
              chatInputPlaceholder: "描述您需要的界面...",
              welcomeMessageText: "",
            }}
          />
        </div>
      </div>
    </Sider>
  );
}
