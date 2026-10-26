import { useEffect, useRef, useState } from "react";

type TypewriterProps = {
  text: string;
  skip: boolean;
  skipLabel: string;
};

export function Typewriter({ text, skip, skipLabel }: TypewriterProps) {
  const [count, setCount] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const shown = skip ? text.length : count;
  const done = shown >= text.length;

  useEffect(() => {
    if (skip || done) return;
    const delay = text[shown] === "\n" ? 90 : 26;
    const timer = window.setTimeout(() => setCount((value) => value + 1), delay);
    return () => window.clearTimeout(timer);
  }, [done, shown, skip, text]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    box.scrollTop = box.scrollHeight;
  }, [shown]);

  return (
    <div className="typewriter">
      <div ref={boxRef} className="typewriter-paper">
        <p>{text.slice(0, shown)}</p>
      </div>
      {!done && (
        <button type="button" className="btn btn-quiet" onClick={() => setCount(text.length)}>
          {skipLabel}
        </button>
      )}
    </div>
  );
}
