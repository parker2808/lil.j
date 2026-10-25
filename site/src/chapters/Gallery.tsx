import { content } from "../content.ts";
import { ChapterFrame } from "../components/ChapterFrame.tsx";
import type { ChapterProps } from "../types.ts";

export function Gallery({ progress, update, onBack }: ChapterProps) {
  const chapter = content.chapters.find((item) => item.id === "gallery");

  function toggle(id: string) {
    update((current) => {
      const has = current.flippedPhotos.includes(id);
      return {
        ...current,
        flippedPhotos: has
          ? current.flippedPhotos.filter((item) => item !== id)
          : [...current.flippedPhotos, id],
      };
    });
  }

  return (
    <ChapterFrame
      kicker={chapter?.kicker ?? ""}
      title={chapter?.title ?? ""}
      lede={chapter?.lede ?? ""}
      onBack={onBack}
    >
      <div className="polaroids">
        {content.photos.map((photo, index) => {
          const flipped = progress.flippedPhotos.includes(photo.id);
          return (
            <div key={photo.id} className="tilt">
              <div className={flipped ? "polaroid is-flipped" : "polaroid"}>
                <div className="polaroid-inner" aria-hidden="true">
                  <div className="face face-front">
                    <img
                      src={photo.src}
                      alt=""
                      width={800}
                      height={1000}
                      loading={index < 2 ? "eager" : "lazy"}
                      decoding="async"
                    />
                    <span className="caption">{photo.caption}</span>
                  </div>
                  <div className="face face-back">
                    <span>{photo.compliment}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="hit"
                  aria-pressed={flipped}
                  aria-label={
                    flipped ? `${photo.caption}. ${photo.compliment}` : `${photo.caption}. Chạm để lật`
                  }
                  onClick={() => toggle(photo.id)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </ChapterFrame>
  );
}
