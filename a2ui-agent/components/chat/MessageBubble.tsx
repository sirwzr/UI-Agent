"use client";

import React from "react";
import { Typography, Skeleton } from "antd";
import { RobotOutlined, UserOutlined } from "@ant-design/icons";

const { Text } = Typography;

interface MessageBubbleProps {
  message: {
    role: "user" | "assistant" | "system";
    content?: string;
    isLoading?: boolean;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        gap: 12,
        padding: "12px 16px",
        flexDirection: isUser ? "row-reverse" : "row",
      }}
    >
      {/* 头像 */}
      <div style={{ flexShrink: 0 }}>
        {isUser ? (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#1677ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <UserOutlined style={{ color: "#fff" }} />
          </div>
        ) : (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              background: "#52c41a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <RobotOutlined style={{ color: "#fff" }} />
          </div>
        )}
      </div>

      {/* 内容 */}
      <div
        style={{
          maxWidth: "75%",
          padding: "10px 16px",
          borderRadius: 12,
          background: isUser ? "#1677ff" : "#f5f5f5",
          color: isUser ? "#fff" : "#333",
        }}
      >
        {message.isLoading ? (
          <Skeleton active paragraph={{ rows: 1 }} title={false} />
        ) : (
          <Text style={{ color: isUser ? "#fff" : "#333", whiteSpace: "pre-wrap" }}>
            {message.content}
          </Text>
        )}
      </div>
    </div>
  );
}
