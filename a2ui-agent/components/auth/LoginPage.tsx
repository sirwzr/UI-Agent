"use client";

import React from "react";
import { Layout, Card, Button, Typography, Space, Divider, message } from "antd";
import { GoogleOutlined, UserOutlined } from "@ant-design/icons";
import { signIn } from "next-auth/react";

const { Title, Text } = Typography;

export function LoginPage() {
  const isDev = process.env.NODE_ENV === "development";

  const handleGoogleLogin = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  const handleDevLogin = async () => {
    try {
      const result = await signIn("dev", {
        redirect: false,
        email: "dev@example.com",
        name: "Developer",
      });
      if (result?.error) {
        message.error("登录失败: " + result.error);
      } else {
        window.location.href = "/";
      }
    } catch {
      message.error("登录异常");
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5" }}>
      <Card style={{ width: 400, textAlign: "center", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
        <Title level={3} style={{ marginBottom: 4 }}>
          A2UI Agent
        </Title>
        <Text type="secondary">AI 界面生成助手</Text>

        <Divider />

        <Space direction="vertical" size="middle" style={{ width: "100%" }}>
          {/* Google OAuth 登录 */}
          <Button
            block
            size="large"
            icon={<GoogleOutlined />}
            onClick={handleGoogleLogin}
          >
            使用 Google 账号登录
          </Button>

          {/* 开发环境快速登录 */}
          {isDev && (
            <>
              <Divider>开发环境</Divider>
              <Button
                block
                type="primary"
                icon={<UserOutlined />}
                onClick={handleDevLogin}
              >
                开发环境一键登录
              </Button>
            </>
          )}
        </Space>

        <Text type="secondary" style={{ display: "block", marginTop: 24, fontSize: 12 }}>
          登录即表示您同意服务条款和隐私政策
        </Text>
      </Card>
    </Layout>
  );
}
