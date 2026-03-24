"use client";

import { ToolInvocation } from "ai";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function getToolMessage(toolName: string, args: Record<string, unknown>): string {
  const path = typeof args?.path === "string" ? args.path : null;
  const filename = path ? path.split("/").pop() || path : null;

  if (toolName === "str_replace_editor") {
    if (!filename) return toolName;
    switch (args?.command) {
      case "create": return `Creating ${filename}`;
      case "str_replace": return `Editing ${filename}`;
      case "insert": return `Editing ${filename}`;
      case "view": return `Reading ${filename}`;
      case "undo_edit": return `Undoing edit to ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    if (!filename) return toolName;
    switch (args?.command) {
      case "delete": return `Deleting ${filename}`;
      case "rename": {
        const newPath = typeof args?.new_path === "string" ? args.new_path : null;
        const newFilename = newPath ? newPath.split("/").pop() || newPath : null;
        return newFilename ? `Renaming ${filename} → ${newFilename}` : `Renaming ${filename}`;
      }
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  toolInvocation: ToolInvocation;
}

export function ToolInvocationBadge({ toolInvocation }: ToolInvocationBadgeProps) {
  const { toolName, args, state } = toolInvocation;
  const message = getToolMessage(toolName, args as Record<string, unknown>);
  const isDone = state === "result" && "result" in toolInvocation && toolInvocation.result;

  return (
    <div className={cn(
      "inline-flex items-center gap-2 mt-2 px-3 py-1.5",
      "bg-neutral-50 rounded-lg text-xs font-mono border border-neutral-200"
    )}>
      {isDone ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
      )}
      <span className="text-neutral-700">{message}</span>
    </div>
  );
}
