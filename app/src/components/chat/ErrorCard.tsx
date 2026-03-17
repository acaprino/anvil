import { memo } from "react";

interface Props {
  code: string;
  message: string;
}

const FRIENDLY_LABELS: Record<string, string> = {
  rate_limit: "rate limited",
  overloaded_error: "overloaded",
  context_length_exceeded: "context full",
  max_tokens: "context full",
  query_error: "error",
  handler_error: "error",
  not_found: "session lost",
};

function extractResetTime(message: string): string | null {
  const timeMatch = message.match(/resets?\s+at\s+(\d{1,2}:\d{2}:\d{2})/i);
  if (timeMatch) return timeMatch[1];
  const isoMatch = message.match(/resets?\s+at\s+(\d{4}-\d{2}-\d{2}T[\d:.]+Z?)/i);
  if (isoMatch) {
    const d = new Date(isoMatch[1]);
    if (!isNaN(d.getTime())) return d.toLocaleTimeString();
  }
  const secMatch = message.match(/retry\s+after\s+(\d+)\s*s/i);
  if (secMatch) {
    const secs = parseInt(secMatch[1], 10);
    return new Date(Date.now() + secs * 1000).toLocaleTimeString();
  }
  return null;
}

export default memo(function ErrorCard({ code, message }: Props) {
  const label = FRIENDLY_LABELS[code] || "error";

  if (code === "rate_limit") {
    const resetTime = extractResetTime(message);
    return (
      <div className="error-card">
        <span className="error-card-label">{label}</span>
        {resetTime
          ? <span className="error-card-msg">resets at {resetTime}</span>
          : <span className="error-card-msg">{message}</span>}
      </div>
    );
  }

  return (
    <div className="error-card">
      <span className="error-card-label">{label}</span>
      <span className="error-card-msg">{message}</span>
    </div>
  );
});
