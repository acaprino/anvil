import type { Block } from "./Block";
import type { TerminalPalette } from "../themes";
import type { PermissionSuggestion } from "../../../types";
import { fg, BOLD, RESET, sanitizeAgentText } from "../AnsiUtils";

export class PermissionBlock implements Block {
  readonly type = "permission";
  readonly timestamp = Date.now();
  startLine = 0;
  lineCount = 0;
  frozen = false;
  resolved = false;
  allowed?: boolean;

  constructor(
    public readonly id: string,
    public tool: string,
    public description: string,
    public toolUseId: string,
    public suggestions?: PermissionSuggestion[],
  ) {}

  update(data: { resolved?: boolean; allowed?: boolean }): boolean {
    if (data.resolved !== undefined) this.resolved = data.resolved;
    if (data.allowed !== undefined) this.allowed = data.allowed;
    return true;
  }

  render(_cols: number, palette: TerminalPalette): string {
    if (this.resolved) {
      const icon = this.allowed
        ? `${fg(palette.green)}${palette.icons.success}${RESET}`
        : `${fg(palette.red)}${palette.icons.fail}${RESET}`;
      const label = this.allowed ? "Allowed" : "Denied";
      return `  ${icon} ${label}: ${sanitizeAgentText(this.tool)} ${sanitizeAgentText(this.description)}\r\n`;
    }

    const warn = `${fg(palette.yellow)}${palette.icons.warning}${RESET}`;
    const prompt = `${BOLD}Allow ${this.tool}${RESET}: ${sanitizeAgentText(this.description)}`;
    const keys = this.suggestions?.length
      ? `    ${fg(palette.green)}[Y]${RESET}es  ${fg(palette.accent)}[A]${RESET}llow session  ${fg(palette.red)}[N]${RESET}o`
      : `    ${fg(palette.green)}[Y]${RESET}es  ${fg(palette.red)}[N]${RESET}o`;

    return `  ${warn} ${prompt}\r\n${keys}\r\n`;
  }
}
