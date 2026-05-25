// ===== 单元测试：A2UI Validator =====
import { describe, it, expect } from "vitest";
import { validateA2UIEnvelope, validateA2UILine, validateA2UIStream } from "@/lib/a2ui/validator";

describe("validateA2UIEnvelope", () => {
  // ---- createSurface ----
  it("should accept valid createSurface", () => {
    const result = validateA2UIEnvelope({
      version: "v0.9",
      createSurface: { surfaceId: "main", catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json" },
    });
    expect(result.ok).toBe(true);
  });

  it("should reject missing version", () => {
    const result = validateA2UIEnvelope({
      createSurface: { surfaceId: "main", catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json" },
    });
    expect(result.ok).toBe(false);
    expect(result.errorType).toBe("schema");
  });

  it("should reject v0.8 format", () => {
    const result = validateA2UIEnvelope({
      version: "v0.8",
      surfaceUpdate: { surfaceId: "main", components: [] },
    });
    expect(result.ok).toBe(false);
  });

  it("should reject multiple message types", () => {
    const result = validateA2UIEnvelope({
      version: "v0.9",
      createSurface: { surfaceId: "main", catalogId: "https://a2ui.org/specification/v0_9/basic_catalog.json" },
      deleteSurface: { surfaceId: "main" },
    });
    expect(result.ok).toBe(false);
  });

  it("should reject empty envelope", () => {
    const result = validateA2UIEnvelope({ version: "v0.9" });
    expect(result.ok).toBe(false);
  });

  // ---- updateComponents ----
  it("should accept valid updateComponents", () => {
    const result = validateA2UIEnvelope({
      version: "v0.9",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["header"] },
          { id: "header", component: "Text", text: "Hello" },
        ],
      },
    });
    expect(result.ok).toBe(true);
  });

  it("should reject updateComponents without root", () => {
    const result = validateA2UIEnvelope({
      version: "v0.9",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "not-root", component: "Text", text: "Hello" },
        ],
      },
    });
    expect(result.ok).toBe(false);
    expect(result.errorType).toBe("no_root");
  });

  it("should reject duplicate component IDs", () => {
    const result = validateA2UIEnvelope({
      version: "v0.9",
      updateComponents: {
        surfaceId: "main",
        components: [
          { id: "root", component: "Column", children: ["dup"] },
          { id: "dup", component: "Text", text: "A" },
          { id: "dup", component: "Text", text: "B" },
        ],
      },
    });
    expect(result.ok).toBe(false);
    expect(result.errorType).toBe("duplicate_id");
  });

  // ---- updateDataModel ----
  it("should accept valid updateDataModel", () => {
    const result = validateA2UIEnvelope({
      version: "v0.9",
      updateDataModel: {
        surfaceId: "main",
        path: "/booking",
        value: { date: "2026-05-20", count: 2 },
      },
    });
    expect(result.ok).toBe(true);
  });

  // ---- deleteSurface ----
  it("should accept valid deleteSurface", () => {
    const result = validateA2UIEnvelope({
      version: "v0.9",
      deleteSurface: { surfaceId: "main" },
    });
    expect(result.ok).toBe(true);
  });
});

describe("validateA2UILine", () => {
  it("should parse valid JSONL line", () => {
    const line = '{"version":"v0.9","createSurface":{"surfaceId":"s1","catalogId":"https://a2ui.org/specification/v0_9/basic_catalog.json"}}';
    const result = validateA2UILine(line);
    expect(result.ok).toBe(true);
  });

  it("should reject empty line", () => {
    const result = validateA2UILine("");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("empty");
    }
  });

  it("should reject invalid JSON", () => {
    const result = validateA2UILine("{not valid json}");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.errorType).toBe("json_parse");
    }
  });

  it("should reject v0.8 style surfaceUpdate", () => {
    const line = '{"surfaceUpdate":{"surfaceId":"s1","components":[]}}';
    const result = validateA2UILine(line);
    expect(result.ok).toBe(false);
  });
});

describe("validateA2UIStream", () => {
  it("should validate correct sequence", () => {
    const lines = [
      '{"version":"v0.9","createSurface":{"surfaceId":"form","catalogId":"https://a2ui.org/specification/v0_9/basic_catalog.json"}}',
      '{"version":"v0.9","updateComponents":{"surfaceId":"form","components":[{"id":"root","component":"Column","children":["btn"]},{"id":"btn","component":"Button","child":"txt"},{"id":"txt","component":"Text","text":"OK"}]}}',
      '{"version":"v0.9","updateDataModel":{"surfaceId":"form","path":"/","value":{}}}',
    ];
    const result = validateA2UIStream(lines);
    expect(result.ok).toBe(true);
    expect(result.envelopes.length).toBe(3);
  });

  it("should detect unreferenced surfaceId", () => {
    const lines = [
      '{"version":"v0.9","updateComponents":{"surfaceId":"ghost","components":[{"id":"root","component":"Text","text":"?"}]}}',
    ];
    const result = validateA2UIStream(lines);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.includes("未经过 createSurface"))).toBe(true);
  });
});
