"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Layout, Typography, Card, Statistic, Row, Col, Spin, Result, Button, Table } from "antd";
import {
  UserOutlined,
  MessageOutlined,
  ThunderboltOutlined,
  DashboardOutlined,
} from "@ant-design/icons";
import { AppHeader } from "@/components/common/AppHeader";

const { Content } = Layout;
const { Title } = Typography;

interface ConversationRow {
  id: string;
  title: string | null;
  status: string;
  messageCount: number;
  createdAt: string;
  userEmail: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [stats, setStats] = useState({
    users: 0,
    conversations: 0,
    messages: 0,
    surfaces: 0,
  });
  const [recentConversations, setRecentConversations] = useState<ConversationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/conversations");
        if (res.ok) {
          const data = await res.json();
          const convs = data.conversations ?? [];
          setStats({
            users: 1, // 简化：当前只统计用户登录
            conversations: convs.length,
            messages: convs.reduce(
              (sum: number, c: { _count: { messages: number } }) => sum + c._count.messages,
              0,
            ),
            surfaces: convs.length, // 每个对话至少一个 surface
          });
        }
      } catch {
        // 静默
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (status === "loading") {
    return (
      <Layout style={{ minHeight: "100vh", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" />
      </Layout>
    );
  }

  if (!session?.user) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="请先登录"
        extra={<Button type="primary" href="/auth/signin">去登录</Button>}
      />
    );
  }

  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return (
      <Result
        status="403"
        title="403"
        subTitle="您没有管理员权限"
        extra={<Button type="primary" href="/">返回首页</Button>}
      />
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <AppHeader user={session.user} />
      <Content style={{ padding: "24px 48px" }}>
        <Title level={3}>
          <DashboardOutlined /> 管理后台
        </Title>

        {loading ? (
          <Spin size="large" />
        ) : (
          <>
            {/* 统计卡片 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic title="用户数" value={stats.users} prefix={<UserOutlined />} />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="对话数"
                    value={stats.conversations}
                    prefix={<MessageOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="消息数"
                    value={stats.messages}
                    prefix={<ThunderboltOutlined />}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Surface 数"
                    value={stats.surfaces}
                    prefix={<DashboardOutlined />}
                  />
                </Card>
              </Col>
            </Row>

            {/* 系统信息 */}
            <Card title="系统状态" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic title="LLM 提供商" value={process.env.NODE_ENV === "development" ? "DeepSeek V4" : "Production"} />
                </Col>
                <Col span={8}>
                  <Statistic title="运行环境" value="Development" />
                </Col>
                <Col span={8}>
                  <Statistic title="应用版本" value="0.1.0" />
                </Col>
              </Row>
            </Card>
          </>
        )}
      </Content>
    </Layout>
  );
}
