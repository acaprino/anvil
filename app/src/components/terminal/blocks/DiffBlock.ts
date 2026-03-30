import type { Block } from "./Block";
import type { TerminalPalette } from "../themes";
import { fg, DIM, RESET, ICON, boxDraw } from "../AnsiUtils";

export class DiffBlock implements Block {
  readonly type = "diff";
  readonly timestamp = Date.now();
  startLine = 0;
  lineCount = 0;
  frozen = false;
  status: "pending" | "success" | "fail" = "pending";
  additions = 0;
  deletions = 0;

  constructor(
    public readonly id: string,
    public tool: string,
    public filePath: string,
    public diffContent: string,
  ) {
    this.countChanges();
  }

  private countChanges(): void {
    let add = 0, del = 0;
    for (const line of this.diffContent.split("\n")) {
      if (line.startsWith("+") && !line.startsWith("+++")) add++;
      else if (line.startsWith("-") && !line.startsWith("---")) del++;
    }
    this.additions = add;
    this.deletions = del;
  }

  update(data: { success?: boolean }): boolean {
    if (data.success !== undefined) this.status = data.success ? "success" : "fail";
    return true;
  }

  private statusIcon(palette: TerminalPalette): string {
    switch (this.status) {
      case "pending": return `${fg(palette.yellow)}${ICON.pending}${RESET}`;
      case "success": return `${fg(palette.green)}${ICON.success}${RESET}`;
      case "fail": return `${fg(palette.red)}${ICON.fail}${RESET}`;
    }
  }

  render(cols: number, palette: TerminalPalette): string {
    const icon = this.statusIcon(palette);
    // Show basename instead of full path for readability
    const fileName = this.filePath.split(/[/\\]/).pop() || this.filePath;
    const stats = this.additions || this.deletions
      ? ` ${fg(palette.green)}+${this.additions}${RESET} ${fg(palette.red)}-${this.deletions}${RESET}`
      : "";
    const title = `${this.tool} ${fileName}${stats} ${icon}`;
    const content: string[] = [];

    const diffLines = this.diffContent.split("\n");
    const maxLines = 40;
    const displayLines = diffLines.slice(0, maxLines);

    for (const line of displayLines) {
      const maxLen = cols - 6;
      const truncated = line.length > maxLen ? line.slice(0, maxLen - 3) + "..." : line;
      if (line.startsWith("+") && !line.startsWith("+++")) {
        content.push(`${fg(palette.green)}${truncated}${RESET}`);
      } else if (line.startsWith("-") && !line.startsWith("---")) {
        content.push(`${fg(palette.red)}${truncated}${RESET}`);
      } else if (line.startsWith("@@")) {
        content.push(`${fg(palette.accent)}${truncated}${RESET}`);
      } else {
        content.push(`${DIM}${truncated}${RESET}`);
      }
    }

    if (diffLines.length > maxLines) {
      content.push(`${DIM}... ${diffLines.length - maxLines} more lines${RESET}`);
    }

    const borderColor = this.status === "fail" ? palette.red
      : this.status === "success" ? palette.green
      : palette.textDim;

    const lines = boxDraw(title, content, cols, borderColor, palette);
    return lines.join("\r\n") + "\r\n";
  }
}
