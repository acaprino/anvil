import type { ITheme } from "@xterm/xterm";
import type { ThemeColors, Theme } from "../../types";
import type { IconSet } from "./AnsiUtils";
import { resolveIconSet, ICON } from "./AnsiUtils";

/**
 * Convert ThemeColors to xterm.js ITheme.
 * Uses hex colors directly — xterm supports them natively.
 */
export function themeColorsToXterm(c: ThemeColors): ITheme {
  return {
    background: c.bg,
    foreground: c.text,
    cursor: c.cursor,
    cursorAccent: c.bg,
    selectionBackground: c.selection,
    selectionForeground: c.text,

    // Standard ANSI palette (0-7)
    black: c.crust,
    red: c.red,
    green: c.green,
    yellow: c.yellow,
    blue: c.accent,
    magenta: c.overlay1,
    cyan: c.overlay0,
    white: c.text,

    // Bright ANSI palette (8-15)
    brightBlack: c.overlay0,
    brightRed: c.red,
    brightGreen: c.green,
    brightYellow: c.yellow,
    brightBlue: c.accent,
    brightMagenta: c.overlay1,
    brightCyan: c.textDim,
    brightWhite: c.text,
  };
}

/**
 * Color palette extracted from ThemeColors for use in AnsiUtils.
 * Cached per theme change to avoid repeated CSS reads.
 */
export interface TerminalPalette {
  text: string;
  textDim: string;
  accent: string;
  red: string;
  green: string;
  yellow: string;
  surface: string;
  overlay0: string;
  overlay1: string;
  bg: string;
  crust: string;
  icons: IconSet;
}

export function themeColorsToPalette(c: ThemeColors, theme?: Theme): TerminalPalette {
  // Resolve icon set: theme can specify preset name or individual overrides
  // Retro themes default to "retro" icon set unless explicitly overridden
  const iconPreset = theme?.iconSet || (theme?.retro ? "retro" : "default");
  const icons = resolveIconSet(iconPreset, theme?.icons);

  return {
    text: c.text,
    textDim: c.textDim,
    accent: c.accent,
    red: c.red,
    green: c.green,
    yellow: c.yellow,
    surface: c.surface,
    overlay0: c.overlay0,
    overlay1: c.overlay1,
    bg: c.bg,
    crust: c.crust,
    icons,
  };
}

/** Build a default palette without a theme (used as fallback) */
export function defaultPalette(): TerminalPalette {
  return {
    text: "#cdd6f4", textDim: "#6c7086", accent: "#89b4fa", red: "#f38ba8",
    green: "#a6e3a1", yellow: "#f9e2af", surface: "#313244", overlay0: "#6c7086",
    overlay1: "#7f849c", bg: "#1e1e2e", crust: "#11111b",
    icons: ICON,
  };
}
