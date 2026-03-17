import { memo } from "react";
import { fmtTokens } from "../../utils/format";

interface Props {
  cost: number;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  turns: number;
  durationMs: number;
}

export default memo(function ResultBar({ cost, inputTokens, outputTokens, cacheReadTokens, turns, durationMs }: Props) {
  const safe = (n: number) => (Number.isFinite(n) ? n : 0);
  const totalTokens = safe(inputTokens) + safe(outputTokens);
  const cached = safe(cacheReadTokens) > 0 ? ` (${fmtTokens(safe(cacheReadTokens))} cached)` : "";

  return (
    <div className="result-bar">
      <span className="rule" />
      <span>${safe(cost).toFixed(3)}</span>
      <span className="result-sep">·</span>
      <span>{fmtTokens(totalTokens)} tokens{cached}</span>
      <span className="result-sep">·</span>
      <span>{safe(turns)} turn{safe(turns) !== 1 ? "s" : ""}</span>
      <span className="result-sep">·</span>
      <span>{(safe(durationMs) / 1000).toFixed(1)}s</span>
      <span className="rule" />
    </div>
  );
});
