import type { ReactNode } from "react";
import { content } from "../content.ts";

type ChapterFrameProps = {
  kicker: string;
  title: string;
  lede: string;
  onBack: () => void;
  children: ReactNode;
};

export function ChapterFrame({ kicker, title, lede, onBack, children }: ChapterFrameProps) {
  return (
    <section className="scene chapter">
      <div className="chapter-top">
        <button type="button" className="back" onClick={onBack}>
          ← {content.ui.back}
        </button>
      </div>
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      {children}
    </section>
  );
}
