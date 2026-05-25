"use client";

import React from "react";
import { Layout, Button, Avatar, Dropdown, Typography, Space, Badge } from "antd";
import { LogoutOutlined, MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, RightOutlined, LeftOutlined } from "@ant-design/icons";
import { signOut } from "next-auth/react";
import { useAppStore } from "@/stores/app";

const { Header } = Layout;
const { Text } = Typography;

interface AppHeaderProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function AppHeader({ user }: AppHeaderProps) {
  const sidebarOpen = useAppStore((s) => s.sidebarOpen);
  const toggleSidebar = useAppStore((s) => s.toggleSidebar);
  const rightPanelOpen = useAppStore((s) => s.rightPanelOpen);
  const toggleRightPanel = useAppStore((s) => s.toggleRightPanel);

  const userMenuItems = [
    { key: "email", label: user.email, disabled: true },
    { type: "divider" as const },
    {
      key: "logout",
      label: "退出登录",
      icon: <LogoutOutlined />,
      danger: true,
      onClick: () => signOut({ callbackUrl: "/auth/signin" }),
    },
  ];

  return (
    <Header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(255,255,255,0.8)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
        padding: "0 24px",
        height: 60,
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}
    >
      <Space>
        <Button
          type="text"
          icon={sidebarOpen ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          onClick={toggleSidebar}
          style={{ color: "#64748b" }}
        />
        <Text
          strong
          className="gradient-text"
          style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.3px" }}
        >
          A2UI Agent
        </Text>
      </Space>

      <Space>
        <Button
          type="text"
          icon={rightPanelOpen ? <RightOutlined /> : <LeftOutlined />}
          onClick={toggleRightPanel}
          title={rightPanelOpen ? "收起思考面板" : "展开思考面板"}
          style={{ color: "#64748b" }}
        />
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Space style={{ cursor: "pointer" }}>
            <Badge status="success" dot offset={[-2, 4]}>
              <Avatar
                src={user.image}
                icon={!user.image ? <UserOutlined /> : undefined}
                size={32}
                style={{ border: "2px solid #e2e8f0" }}
              />
            </Badge>
            <Text style={{ fontSize: 13, color: "#475569" }}>{user.name ?? user.email}</Text>
          </Space>
        </Dropdown>
      </Space>
    </Header>
  );
}
