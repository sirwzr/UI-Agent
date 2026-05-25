"use client";

import React from "react";
import { Spin } from "antd";

export function AppSpin({ tip = "加载中..." }: { tip?: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
      }}
    >
      <Spin size="large" tip={tip}>
        <div style={{ minHeight: 80 }} />
      </Spin>
    </div>
  );
}
