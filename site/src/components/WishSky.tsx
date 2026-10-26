import { useState, type FormEvent } from "react";
import { content } from "../content.ts";
import { useI18n } from "../lib/locale-context.ts";
import type { Wish } from "../types.ts";

type WishSkyProps = {
  wishes: Wish[];
  onSend: (text: string) => void;
};

export function WishSky({ wishes, onSend }: WishSkyProps) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [empty, setEmpty] = useState(false);
  const [flight, setFlight] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);
  const sent = wishes.length > 0;
  const reading = wishes.find((wish) => wish.id === openId);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = value.trim().slice(0, 180);
    if (!text) {
      setEmpty(true);
      return;
    }
    setEmpty(false);
    onSend(text);
    setValue("");
    setOpenId(null);
    setFlight((count) => count + 1);
    window.scrollTo({ top: 0 });
  }

  return (
    <section className="scene wish-scene">
      <p className="kicker">{t(content.wish.kicker)}</p>
      <h1>{t(content.wish.title)}</h1>
      <p className="lede">{t(content.wish.lede)}</p>
      <div className="wish-sky">
        {wishes.map((wish) => {
          const spot = slot(wish.id);
          return (
            <button
              key={wish.id}
              type="button"
              className={wish.id === openId ? "wish-star is-on" : "wish-star"}
              style={{ left: `${spot.left}%`, top: `${spot.top}%` }}
              aria-label={wish.text}
              onClick={() => setOpenId(wish.id)}
            />
          );
        })}
        {flight > 0 && <span key={flight} className="wish-shot" aria-hidden="true" />}
      </div>
      <p className="hint" role="status">
        {empty ? t(content.wish.empty) : reading ? reading.text : sent ? t(content.wish.sent) : "\u00a0"}
      </p>
      <form className="wish-card" onSubmit={submit}>
        <label className="field">
          <input
            value={value}
            placeholder=" "
            maxLength={180}
            autoComplete="off"
            enterKeyHint="send"
            onChange={(event) => {
              setValue(event.target.value);
              setEmpty(false);
            }}
          />
          <span>{t(content.wish.placeholder)}</span>
        </label>
        <button type="submit" className="btn btn-gold">
          {sent ? t(content.wish.more) : t(content.wish.send)}
        </button>
      </form>
    </section>
  );
}

function slot(id: string): { left: number; top: number } {
  let hash = 0;
  for (const char of id) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return {
    left: 14 + (hash % 72),
    top: 16 + ((hash >>> 8) % 64),
  };
}
