import type { ReactNode } from "react";
import { Reveal } from "./Reveal.tsx";

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
      <Reveal text={title} />
      <p className="lede">{lede}</p>
      {children}
    </section>
  );
}
