import type { ChatMessage } from "../types";

/** Format a chat session as a readable markdown document. */
export function messagesToMarkdown(messages: ChatMessage[], projectName: string): string {
  const lines: string[] = [];
  const now = new Date();
  const date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  lines.push(`# ${projectName} — Session Export`);
  lines.push(`\n*Exported on ${date}*\n`);
  lines.push("---\n");

  for (const msg of messages) {
    switch (msg.role) {
      case "user":
        lines.push(`## User\n\n${msg.text}\n`);
        break;

      case "assistant":
        lines.push(`## Assistant\n\n${msg.text}\n`);
        break;

      case "tool": {
        const inputStr = typeof msg.input === "string"
          ? msg.input
          : JSON.stringify(msg.input, null, 2);
        const status = msg.success === undefined ? "pending" : msg.success ? "ok" : "failed";
        lines.push(`### Tool: ${msg.tool} (${status})\n`);
        lines.push("```json");
        lines.push(inputStr);
        lines.push("```\n");
        if (msg.output) {
          lines.push("**Output:**\n");
          lines.push("```");
          lines.push(msg.output);
          lines.push("```\n");
        }
        break;
      }

      case "result":
        lines.push("---\n");
        lines.push(`**Session complete** — $${msg.cost.toFixed(4)} | ${msg.turns} turns | ${(msg.durationMs / 1000).toFixed(0)}s\n`);
        break;

      case "error":
        lines.push(`> **Error (${msg.code}):** ${msg.message}\n`);
        break;

      case "thinking":
        // Skip thinking blocks in export
        break;

      default:
        break;
    }
  }

  return lines.join("\n");
}
