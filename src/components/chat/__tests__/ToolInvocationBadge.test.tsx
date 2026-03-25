import { test, expect, afterEach, describe } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { ToolInvocationBadge, getToolMessage } from "../ToolInvocationBadge";

afterEach(() => {
  cleanup();
});

describe("getToolMessage", () => {
  describe("str_replace_editor", () => {
    test("create", () => {
      expect(getToolMessage("str_replace_editor", { command: "create", path: "/src/Card.jsx" }))
        .toBe("Creating Card.jsx");
    });

    test("str_replace", () => {
      expect(getToolMessage("str_replace_editor", { command: "str_replace", path: "/src/App.tsx" }))
        .toBe("Editing App.tsx");
    });

    test("insert", () => {
      expect(getToolMessage("str_replace_editor", { command: "insert", path: "/src/App.tsx" }))
        .toBe("Editing App.tsx");
    });

    test("view", () => {
      expect(getToolMessage("str_replace_editor", { command: "view", path: "/src/utils.ts" }))
        .toBe("Reading utils.ts");
    });

    test("undo_edit", () => {
      expect(getToolMessage("str_replace_editor", { command: "undo_edit", path: "/src/index.js" }))
        .toBe("Undoing edit to index.js");
    });
  });

  describe("file_manager", () => {
    test("delete", () => {
      expect(getToolMessage("file_manager", { command: "delete", path: "/src/old.jsx" }))
        .toBe("Deleting old.jsx");
    });

    test("rename", () => {
      expect(getToolMessage("file_manager", {
        command: "rename",
        path: "/src/Button.jsx",
        new_path: "/src/components/Button.jsx",
      })).toBe("Renaming Button.jsx → Button.jsx");
    });

    test("rename with different new filename", () => {
      expect(getToolMessage("file_manager", {
        command: "rename",
        path: "/src/Btn.jsx",
        new_path: "/src/Button.jsx",
      })).toBe("Renaming Btn.jsx → Button.jsx");
    });

    test("rename without new_path", () => {
      expect(getToolMessage("file_manager", { command: "rename", path: "/src/Btn.jsx" }))
        .toBe("Renaming Btn.jsx");
    });
  });

  test("falls back to toolName for unknown tool", () => {
    expect(getToolMessage("some_other_tool", { command: "foo" })).toBe("some_other_tool");
  });

  test("falls back to toolName when path is missing", () => {
    expect(getToolMessage("str_replace_editor", { command: "create" })).toBe("str_replace_editor");
  });

  test("falls back to toolName when args are empty", () => {
    expect(getToolMessage("file_manager", {})).toBe("file_manager");
  });
});

describe("ToolInvocationBadge", () => {
  test("shows message in in-progress state", () => {
    render(
      <ToolInvocationBadge
        part={{
          type: "dynamic-tool",
          toolCallId: "1",
          toolName: "str_replace_editor",
          input: { command: "create", path: "/src/Card.jsx" },
          state: "input-available",
        }}
      />
    );
    expect(screen.getByText("Creating Card.jsx")).toBeDefined();
  });

  test("shows message in completed state", () => {
    render(
      <ToolInvocationBadge
        part={{
          type: "dynamic-tool",
          toolCallId: "1",
          toolName: "str_replace_editor",
          input: { command: "str_replace", path: "/src/App.tsx" },
          state: "output-available",
          output: "OK",
        }}
      />
    );
    expect(screen.getByText("Editing App.tsx")).toBeDefined();
  });

  test("shows spinner when in-progress", () => {
    const { container } = render(
      <ToolInvocationBadge
        part={{
          type: "dynamic-tool",
          toolCallId: "1",
          toolName: "str_replace_editor",
          input: { command: "create", path: "/src/Card.jsx" },
          state: "input-available",
        }}
      />
    );
    expect(container.querySelector(".animate-spin")).toBeDefined();
    expect(container.querySelector(".bg-emerald-500")).toBeNull();
  });

  test("shows green dot when completed", () => {
    const { container } = render(
      <ToolInvocationBadge
        part={{
          type: "dynamic-tool",
          toolCallId: "1",
          toolName: "file_manager",
          input: { command: "delete", path: "/src/old.js" },
          state: "output-available",
          output: "OK",
        }}
      />
    );
    expect(container.querySelector(".bg-emerald-500")).toBeDefined();
    expect(container.querySelector(".animate-spin")).toBeNull();
  });

  test("shows file_manager delete message", () => {
    render(
      <ToolInvocationBadge
        part={{
          type: "dynamic-tool",
          toolCallId: "2",
          toolName: "file_manager",
          input: { command: "delete", path: "/src/old.js" },
          state: "input-available",
        }}
      />
    );
    expect(screen.getByText("Deleting old.js")).toBeDefined();
  });

  test("falls back to toolName for unknown tools", () => {
    render(
      <ToolInvocationBadge
        part={{
          type: "dynamic-tool",
          toolCallId: "3",
          toolName: "unknown_tool",
          input: {},
          state: "input-available",
        }}
      />
    );
    expect(screen.getByText("unknown_tool")).toBeDefined();
  });
});
