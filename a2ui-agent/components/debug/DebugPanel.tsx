"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Drawer, Tabs, Table, Tag, Button, Typography, Space, Empty, Badge } from "antd";
import {
  BugOutlined,
  ApiOutlined,
  DatabaseOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ReloadOutlined,
} from "@ant-design/icons";
import { useAppStore } from "@/stores/app";

const { Text, Title } = Typography;

interface ServerLogEntry {
  ts: number;
  type: "tool_call" | "api_call" | "llm_call";
  detail: string;
  duration: number;
  success: boolean;
}

export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const [serverLogs, setServerLogs] = useState<ServerLogEntry[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);

  const surfaces = useAppStore((s) => s.surfaces);
  const conversations = useAppStore((s) => s.conversations);
  const currentId = useAppStore((s) => s.currentConversationId);
  const agentError = useAppStore((s) => s.agentError);
  const isAgentThinking = useAppStore((s) => s.isAgentThinking);

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true);
    try {
      const res = await fetch("/api/debug/logs");
      if (res.ok) {
        const data = await res.json();
        setServerLogs(data.logs ?? []);
      }
    } catch {
      // 静默失败
    } finally {
      setLogsLoading(false);
    }
  }, []);

  const clearLogs = useCallback(async () => {
    try {
      await fetch("/api/debug/logs", { method: "DELETE" });
      setServerLogs([]);
    } catch {
      // 静默失败
    }
  }, []);

  useEffect(() => {
    if (open) fetchLogs();
  }, [open, fetchLogs]);

  if (process.env.NODE_ENV !== "development") return null;

  const logColumns = [
    { title: "时间", dataIndex: "ts", key: "ts", width: 90,
      render: (ts: number) => new Date(ts).toLocaleTimeString("zh-CN"),
    },
    { title: "类型", dataIndex: "type", key: "type", width: 90,
      render: (t: string) => {
        const color = t === "tool_call" ? "blue" : t === "api_call" ? "orange" : "purple";
        const label = t === "tool_call" ? "工具" : t === "api_call" ? "API" : "LLM";
        return <Tag color={color}>{label}</Tag>;
      },
    },
    { title: "详情", dataIndex: "detail", key: "detail",
      render: (d: string) => (
        <Text style={{ fontSize: 12, wordBreak: "break-all" }}>{d}</Text>
      ),
    },
    { title: "耗时", dataIndex: "duration", key: "duration", width: 70,
      render: (d: number) => <Text>{d}ms</Text>,
    },
    { title: "状态", dataIndex: "success", key: "success", width: 60,
      render: (ok: boolean) =>
        ok ? <CheckCircleOutlined style={{ color: "#52c41a" }} /> : <CloseCircleOutlined style={{ color: "#ff4d4f" }} />,
    },
  ];

  return (
    <>
      <Button
        type="text"
        icon={<BugOutlined />}
        onClick={() => setOpen(true)}
        style={{
          position: "fixed",
          bottom: 16,
          right: 16,
          zIndex: 1000,
          background: "rgba(0,0,0,0.75)",
          color: "#fff",
          borderRadius: 20,
          height: 36,
          fontSize: 12,
          boxShadow: "0 2px 12px rgba(0,0,0,0.3)",
        }}
      >
        调试
      </Button>

      <Drawer
        title={
          <Space>
            <BugOutlined />
            <span>调试面板</span>
            <Tag color="purple">dev</Tag>
          </Space>
        }
        placement="right"
        width={620}
        open={open}
        onClose={() => setOpen(false)}
        extra={
          <Space>
            <Button size="small" icon={<ReloadOutlined />} onClick={fetchLogs} loading={logsLoading}>
              刷新
            </Button>
            <Button size="small" icon={<DeleteOutlined />} danger onClick={clearLogs}>
              清空
            </Button>
          </Space>
        }
      >
        <Tabs
          defaultActiveKey="logs"
          items={[
            {
              key: "logs",
              label: (
                <span>
                  <ApiOutlined /> 服务端日志 ({serverLogs.length})
                </span>
              ),
              children: serverLogs.length === 0 ? (
                <Empty description="暂无日志记录（执行一次搜索或对话后刷新）" image={Empty.PRESENTED_IMAGE_SIMPLE} />
              ) : (
                <Table
                  dataSource={serverLogs.map((l, i) => ({ ...l, key: i }))}
                  columns={logColumns}
                  size="small"
                  pagination={{ pageSize: 30, size: "small" }}
                  scroll={{ x: 520 }}
                />
              ),
            },
            {
              key: "store",
              label: (
                <span>
                  <DatabaseOutlined /> 状态检查
                </span>
              ),
              children: (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <Title level={5} style={{ margin: "0 0 8px" }}>
                      会话状态
                    </Title>
                    <Text>正在思考：<Tag color={isAgentThinking ? "processing" : "default"}>{isAgentThinking ? "是" : "否"}</Tag></Text>
                    <br />
                    <Text>当前对话：<Tag>{currentId ?? "无"}</Tag></Text>
                    <br />
                    <Text>错误：<Tag color={agentError ? "red" : "green"}>{agentError ?? "无"}</Tag></Text>
                    <br />
                    <Text>对话列表：{conversations.length} 个</Text>
                    <br />
                    <Text>对话摘要：</Text>
                    <pre style={{ fontSize: 10, maxHeight: 120, overflow: "auto", background: "#f5f5f5", padding: 8, borderRadius: 6 }}>
                      {JSON.stringify(conversations.slice(0, 5).map((c) => ({ id: c.id, title: c.title, status: c.status, msgCount: c._count.messages })), null, 2)}
                    </pre>
                  </div>
                  <div>
                    <Title level={5} style={{ margin: "0 0 8px" }}>
                      Surface 渲染 ({surfaces.length})
                    </Title>
                    {surfaces.length === 0 ? (
                      <Empty description="暂无渲染表面" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    ) : (
                      surfaces.map((surface) => (
                        <div key={surface.surfaceId} style={{ marginBottom: 12 }}>
                          <Text strong>Surface: {surface.surfaceId}</Text>
                          <br />
                          <Text type="secondary">组件数: {surface.components.length}</Text>
                          <pre style={{ fontSize: 10, maxHeight: 200, overflow: "auto", background: "#f5f5f5", padding: 8, borderRadius: 6 }}>
                            {JSON.stringify(surface.components.slice(0, 10), null, 2)}
                          </pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </Drawer>
    </>
  );
}
