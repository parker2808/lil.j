import type { ReactNode } from "react";

type ChapterFrameProps = {
  kicker: string;
  title: string;
  lede: string;
  children: ReactNode;
};

export function ChapterFrame({ kicker, title, lede, children }: ChapterFrameProps) {
  return (
    <section className="scene chapter">
      <p className="kicker">{kicker}</p>
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      {children}
    </section>
  );
}
