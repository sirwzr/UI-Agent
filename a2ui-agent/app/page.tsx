"use client";

import React from "react";
import { Layout, Spin } from "antd";
import { useSession } from "next-auth/react";
import { LoginPage } from "@/components/auth/LoginPage";
import { AppHeader } from "@/components/common/AppHeader";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LeftPanel } from "@/components/layout/LeftPanel";
import { CenterPanel } from "@/components/layout/CenterPanel";
import { DebugPanel } from "@/components/debug/DebugPanel";
import { registerCustomComponents } from "@/lib/a2ui/catalog";

registerCustomComponents();

export default function HomePage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <Layout style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
        <Spin size="large" tip="加载中...">
          <div style={{ minHeight: 80 }} />
        </Spin>
      </Layout>
    );
  }

  if (!session?.user) {
    return <LoginPage />;
  }

  return (
    <Layout style={{ height: "100vh", width: "100%" }}>
      <AppHeader user={session.user} />

      <Layout style={{ flex: 1, overflow: "hidden" }}>
        <ErrorBoundary>
          <LeftPanel />
        </ErrorBoundary>

        <ErrorBoundary>
          <CenterPanel />
        </ErrorBoundary>
      </Layout>

      <DebugPanel />
    </Layout>
  );
}
