import type { A2UIEnvelope } from "./types";

const CATALOG_URL = "https://a2ui.org/specification/v0_9/basic_catalog.json";

/**
 * 生成标准错误界面
 */
export function createErrorSurface(
  surfaceId: string,
  errorMessage: string,
  retryAction?: string,
): A2UIEnvelope[] {
  const messages: A2UIEnvelope[] = [
    {
      version: "v0.9",
      createSurface: { surfaceId, catalogId: CATALOG_URL },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId,
        components: [
          { id: "root", component: "Column", children: ["error-modal"] },
          {
            id: "error-modal",
            component: "Modal",
            title: "操作失败",
            children: retryAction ? ["error-msg", "retry-btn"] : ["error-msg", "close-btn"],
          },
          { id: "error-msg", component: "Text", text: errorMessage },
        ],
      },
    },
  ];

  if (retryAction) {
    messages[1].updateComponents!.components.push(
      {
        id: "retry-btn",
        component: "Button",
        child: "retry-text",
        action: { name: retryAction },
        primary: true,
      },
      { id: "retry-text", component: "Text", text: "重试" },
    );
  } else {
    messages[1].updateComponents!.components.push(
      {
        id: "close-btn",
        component: "Button",
        child: "close-text",
        action: { name: "close_dialog" },
      },
      { id: "close-text", component: "Text", text: "关闭" },
    );
  }

  return messages;
}

/**
 * 生成加载指示器界面
 */
export function createSpinnerSurface(
  surfaceId: string,
  message: string,
): A2UIEnvelope[] {
  return [
    {
      version: "v0.9",
      createSurface: { surfaceId, catalogId: CATALOG_URL },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId,
        components: [
          { id: "root", component: "Column", children: ["spinner"], align: "center" },
          { id: "spinner", component: "Spinner", text: message },
        ],
      },
    },
  ];
}

/**
 * 生成成功提示界面
 */
export function createSuccessDialog(
  surfaceId: string,
  title: string,
  bodyText: string,
): A2UIEnvelope[] {
  return [
    {
      version: "v0.9",
      createSurface: { surfaceId, catalogId: CATALOG_URL },
    },
    {
      version: "v0.9",
      updateComponents: {
        surfaceId,
        components: [
          { id: "root", component: "Column", children: ["result-dialog"] },
          {
            id: "result-dialog",
            component: "Modal",
            title,
            children: ["dialog-body", "dialog-close"],
          },
          { id: "dialog-body", component: "Text", text: bodyText },
          {
            id: "dialog-close",
            component: "Button",
            child: "close-text",
            action: { name: "close_dialog" },
          },
          { id: "close-text", component: "Text", text: "关闭" },
        ],
      },
    },
  ];
}
