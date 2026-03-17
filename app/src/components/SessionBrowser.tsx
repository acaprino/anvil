import { memo, useState, useEffect, useCallback, useRef } from "react";
import { listAgentSessions } from "../hooks/useAgentSession";
import { Banner, Box, Sep } from "./GsdPrimitives";
import type { SessionInfo } from "../types";
import "./GsdLayout.css";

interface SessionBrowserProps {
  tabId: string;
  isActive: boolean;
  onRequestClose: (tabId: string) => void;
  onResumeSession: (sessionId: string, cwd: string) => void;
  onForkSession: (sessionId: string, cwd: string) => void;
  onViewSession: (sessionId: string) => void;
}

function fmtDate(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function pad(s: string, len: number): string {
  return s.length >= len ? s.slice(0, len) : s + " ".repeat(len - s.length);
}

function extractProjectName(cwd: string): string {
  if (!cwd) return "—";
  const parts = cwd.replace(/\\/g, "/").split("/").filter(Boolean);
  return parts[parts.length - 1] || cwd;
}

function SessionBrowser({
  tabId,
  isActive,
  onRequestClose,
  onResumeSession,
  onForkSession,
  onViewSession,
}: SessionBrowserProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filter, setFilter] = useState("");
  const selectedIdxRef = useRef(selectedIdx);
  const filterRef = useRef(filter);

  useEffect(() => { selectedIdxRef.current = selectedIdx; }, [selectedIdx]);
  useEffect(() => { filterRef.current = filter; }, [filter]);

  // Fetch sessions on mount and when tab becomes active
  useEffect(() => {
    if (!isActive) return;
    setLoading(true);
    listAgentSessions()
      .then((list) => {
        // Sort by lastModified descending
        const sorted = [...list].sort((a, b) => b.lastModified - a.lastModified);
        setSessions(sorted);
        setError(null);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  }, [isActive]);

  const filtered = filter
    ? sessions.filter((s) => {
        const q = filter.toLowerCase();
        return (
          s.summary.toLowerCase().includes(q) ||
          extractProjectName(s.cwd).toLowerCase().includes(q) ||
          (s.firstPrompt || "").toLowerCase().includes(q)
        );
      })
    : sessions;

  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isActive) return;
      const idx = selectedIdxRef.current;
      const list = filteredRef.current;

      switch (e.key) {
        case "ArrowUp":
          e.preventDefault();
          setSelectedIdx(Math.max(0, idx - 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          setSelectedIdx(Math.min(list.length - 1, idx + 1));
          break;
        case "Home":
          e.preventDefault();
          setSelectedIdx(0);
          break;
        case "End":
          e.preventDefault();
          setSelectedIdx(Math.max(0, list.length - 1));
          break;
        case "Enter":
          e.preventDefault();
          if (list[idx]) onViewSession(list[idx].id);
          break;
        case "r":
        case "R":
          if (!e.ctrlKey && !e.altKey) {
            e.preventDefault();
            if (list[idx]) onResumeSession(list[idx].id, list[idx].cwd);
          }
          break;
        case "f":
        case "F":
          if (!e.ctrlKey && !e.altKey) {
            e.preventDefault();
            if (list[idx]) onForkSession(list[idx].id, list[idx].cwd);
          }
          break;
        case "Escape":
          e.preventDefault();
          if (filterRef.current) {
            setFilter("");
          } else {
            onRequestClose(tabId);
          }
          break;
        case "Backspace":
          e.preventDefault();
          setFilter((prev) => prev.slice(0, -1));
          break;
        default:
          if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            // Only filter on letter/number keys, not R/F which are actions
            if (e.key !== "r" && e.key !== "R" && e.key !== "f" && e.key !== "F") {
              setFilter((prev) => prev + e.key);
              setSelectedIdx(0);
            }
          }
          break;
      }
    },
    [isActive, tabId, onRequestClose, onResumeSession, onForkSession, onViewSession],
  );

  useEffect(() => {
    if (!isActive) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, handleKeyDown]);

  if (error) {
    return (
      <div className="static-page">
        <div className="static-page-inner">
          <Banner title="SESSION HISTORY" />
          <Box>{`  ${error}`}</Box>
        </div>
      </div>
    );
  }

  const header = `  ${pad("Date", 18)} ${pad("Project", 20)} ${pad("Summary", 30)}`;
  const sep = "  " + "\u2500".repeat(header.length - 2);

  const rows = filtered.map((s, i) => {
    const selected = i === selectedIdx;
    const prefix = selected ? "\u25b8 " : "  ";
    const date = fmtDate(s.lastModified);
    const project = extractProjectName(s.cwd);
    const summary = (s.customTitle || s.summary || s.firstPrompt || "—").slice(0, 30);
    return `${prefix}${pad(date, 18)} ${pad(project, 20)} ${summary}`;
  });

  return (
    <div className="static-page">
      <div className="static-page-inner">
        <div className="usage-header">SESSION HISTORY</div>

        {filter && (
          <>
            <Banner title="FILTER" />
            <Box>{`  ${filter}`}</Box>
          </>
        )}

        <Banner title={`SESSIONS (${filtered.length})`} />
        {loading ? (
          <Box>{"  Loading..."}</Box>
        ) : filtered.length === 0 ? (
          <Box>{"  No sessions found"}</Box>
        ) : (
          <pre className="gsd-text">{[header, sep, ...rows].join("\n")}</pre>
        )}

        <div className="gsd-footer">
          <Sep />
          <div className="gsd-footer-text">
            [Enter] View  [R] Resume  [F] Fork  [Esc] Close
          </div>
          <Sep />
        </div>
      </div>
    </div>
  );
}

export default memo(SessionBrowser);
