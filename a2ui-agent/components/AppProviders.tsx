"use client";

import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider, App as AntApp } from "antd";
import zhCN from "antd/locale/zh_CN";
import { SessionProvider } from "next-auth/react";
import { CopilotKitProvider } from "@copilotkitnext/react";
import "@copilotkitnext/react/styles.css";
import { customA2UIActivityRenderer } from "@/components/chat/A2UICustomRenderer";
import { FrontendToolsProvider } from "@/components/chat/FrontendToolsProvider";

const activityRenderers = [customA2UIActivityRenderer];

const antdTheme = {
  token: {
    colorPrimary: "#3b82f6",
    borderRadius: 10,
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
};

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AntdRegistry>
        <ConfigProvider theme={antdTheme} locale={zhCN}>
          <AntApp>
            <CopilotKitProvider
              runtimeUrl="/api/copilotkit"
              useSingleEndpoint={true}
              renderActivityMessages={activityRenderers}
              showDevConsole={process.env.NODE_ENV === "development"}
            >
              <FrontendToolsProvider />
              {children}
            </CopilotKitProvider>
          </AntApp>
        </ConfigProvider>
      </AntdRegistry>
    </SessionProvider>
  );
}
