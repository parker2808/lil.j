import type { ReactNode } from "react";
import { Reveal } from "./Reveal.tsx";

type ChapterFrameProps = {
  kicker: string;
  title: string;
  lede: string;
  className?: string;
  children: ReactNode;
};

export function ChapterFrame({ kicker, title, lede, className, children }: ChapterFrameProps) {
  return (
    <section className={className ? `scene chapter ${className}` : "scene chapter"}>
      <p className="kicker">{kicker}</p>
      <Reveal text={title} />
      <p className="lede">{lede}</p>
      {children}
    </section>
  );
}
