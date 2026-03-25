"use client";

import { DynamicToolUIPart } from "ai";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function getToolMessage(toolName: string, input: Record<string, unknown>): string {
  const path = typeof input?.path === "string" ? input.path : null;
  const filename = path ? path.split("/").pop() || path : null;

  if (toolName === "str_replace_editor") {
    if (!filename) return toolName;
    switch (input?.command) {
      case "create": return `Creating ${filename}`;
      case "str_replace": return `Editing ${filename}`;
      case "insert": return `Editing ${filename}`;
      case "view": return `Reading ${filename}`;
      case "undo_edit": return `Undoing edit to ${filename}`;
    }
  }

  if (toolName === "file_manager") {
    if (!filename) return toolName;
    switch (input?.command) {
      case "delete": return `Deleting ${filename}`;
      case "rename": {
        const newPath = typeof input?.new_path === "string" ? input.new_path : null;
        const newFilename = newPath ? newPath.split("/").pop() || newPath : null;
        return newFilename ? `Renaming ${filename} → ${newFilename}` : `Renaming ${filename}`;
      }
    }
  }

  return toolName;
}

interface ToolInvocationBadgeProps {
  part: DynamicToolUIPart;
}

export function ToolInvocationBadge({ part }: ToolInvocationBadgeProps) {
  const { toolName, input, state } = part;
  const message = getToolMessage(toolName, input as Record<string, unknown>);
  const isDone = state === "output-available" && "output" in part && part.output;

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
