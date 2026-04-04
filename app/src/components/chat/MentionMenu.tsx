import { memo, useState, useEffect, useLayoutEffect, useRef, useMemo, forwardRef, useImperativeHandle } from "react";
import { createPortal } from "react-dom";
import type { AgentInfoSDK } from "../../types";

export interface Mention {
  name: string;
  display: string;
}

interface Props {
  filter: string;
  agents?: AgentInfoSDK[];
  onSelect: (mention: Mention) => void;
  onDismiss: () => void;
}

export interface MentionMenuHandle {
  handleKeyDown: (key: string) => void;
}

export default memo(forwardRef<MentionMenuHandle, Props>(function MentionMenu({ filter, agents = [], onSelect, onDismiss }: Props, ref) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const selectedIdxRef = useRef(0);
  selectedIdxRef.current = selectedIdx;
  const listRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({ visibility: "hidden", position: "fixed" });

  const filtered = useMemo(() => {
    const options: Mention[] = agents.map((a) => ({
      name: `@${a.name}`,
      display: a.description,
    }));
    const lf = filter.replace(/^@/, "").toLowerCase();
    if (!lf) return options;
    const matches = options.filter(
      (m) => m.name.toLowerCase().includes(lf) || m.display.toLowerCase().includes(lf),
    );
    const starts: Mention[] = [];
    const rest: Mention[] = [];
    for (const m of matches) {
      (m.name.slice(1).toLowerCase().startsWith(lf) ? starts : rest).push(m);
    }
    return [...starts, ...rest];
  }, [agents, filter]);

  useEffect(() => { setSelectedIdx(0); }, [filter]);

  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const update = () => {
      const rect = wrapper.getBoundingClientRect();
      const spaceAbove = rect.top - 8;
      const spaceBelow = window.innerHeight - rect.bottom - 8;
      const maxH = Math.max(120, Math.min(Math.max(spaceAbove, spaceBelow), 400));
      if (spaceAbove >= spaceBelow) {
        setStyle({ position: "fixed", bottom: window.innerHeight - rect.top + 2, top: "auto", left: rect.left, right: "auto", width: rect.width, maxHeight: maxH });
      } else {
        setStyle({ position: "fixed", top: rect.bottom + 2, bottom: "auto", left: rect.left, right: "auto", width: rect.width, maxHeight: maxH });
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [filtered.length]);

  const filteredRef = useRef(filtered);
  filteredRef.current = filtered;
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useImperativeHandle(ref, () => ({
    handleKeyDown: (key: string) => {
      if (key === "ArrowDown") {
        setSelectedIdx((i) => Math.min(i + 1, filteredRef.current.length - 1));
      } else if (key === "ArrowUp") {
        setSelectedIdx((i) => Math.max(i - 1, 0));
      } else if (key === "Enter" && filteredRef.current.length > 0) {
        onSelectRef.current(filteredRef.current[selectedIdxRef.current]);
      } else if (key === "Escape") {
        onDismissRef.current();
      }
    }
  }), []);

  useEffect(() => {
    const el = listRef.current?.children[selectedIdx] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [selectedIdx]);

  if (filtered.length === 0) return null;

  const menu = (
    <div className="command-menu" ref={listRef} style={style}>
      {filtered.map((m, i) => (
        <div
          key={m.name}
          className={`command-item${i === selectedIdx ? " selected" : ""}`}
          onClick={() => onSelect(m)}
          onMouseEnter={() => setSelectedIdx(i)}
        >
          <span className="command-name">{m.name}</span>
          <span className="command-desc">{m.display}</span>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <div ref={wrapperRef} style={{ height: 0, overflow: "hidden" }} />
      {createPortal(menu, document.body)}
    </>
  );
}));
