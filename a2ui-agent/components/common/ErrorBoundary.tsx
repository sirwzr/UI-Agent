"use client";

import React from "react";
import { Result, Button } from "antd";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Result
          status="error"
          title="页面出现了异常"
          subTitle={this.state.error?.message ?? "未知错误"}
          extra={[
            <Button
              type="primary"
              key="retry"
              onClick={() => {
                this.handleReset();
                window.location.reload();
              }}
            >
              刷新页面
            </Button>,
            <Button
              key="back"
              onClick={() => {
                this.handleReset();
                window.location.href = "/";
              }}
            >
              返回首页
            </Button>,
          ]}
        />
      );
    }

    return this.props.children;
  }
}
