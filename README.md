# Even the Stars Know Your Name

A private birthday website for J. It stays behind a countdown until midnight on 18 November 2026, Vietnam time (UTC+7), then opens into a one-way story: a birth sky, a galaxy of photo eras, a few small games, and a letter at the end.

**Live:** [https://lil-j.vercel.app](https://lil-j.vercel.app)

The Vietnamese title is *Đến những vì sao cũng biết tên em*. English is the default language. A VI / EN switch in the header changes every line.

## The idea

The page is a gift, not a product with accounts. Before the birthday it shows only a countdown. After midnight it asks for a nickname, then walks through the story one step at a time. Nothing in the path is a menu. You move forward when the moment is finished, and you can step back only as far as you have already opened.

The visit, in order:

1. **Countdown.** Days, hours, minutes, and seconds until the unlock instant.
2. **Gate.** A nickname. The right answer continues on its own.
3. **Sky.** Stars light up and join into a heart, then a name appears in the middle.
4. **Birth sky.** The bright stars as they stood on the afternoon she was born, drawn in the browser from the time and place in `content.json`. Tap a constellation to read its name.
5. **Galaxy.** Photo eras arranged as a spiral. Open an era and the pictures become a stack of cards you can flip.
6. **Quiz.**
7. **Together-clock.** Time since a date stored in the same file.
8. **Cake.** Candles go out from a breath on the microphone, or from a tap. A short letter types itself out. The playlist crossfades to a birthday loop.
9. **Envelope.** A wax seal opens a note.
10. **Pairs.** A memory game made from the first two photos of each era.
11. **Scratch cards.** A foil layer reveals a line underneath.
12. **Open when…** Letters you can open once each day, on the phone’s own calendar, then they seal again until tomorrow.
13. **Dreams.** Tick at least one.
14. **The question.** The “no” button slips away. “Yes” is what opens the next step.
15. **Wish.** A sentence leaves the field and becomes a star. It is still there if you come back.
16. **Final letter.** The lines arrive in turn, and the music fades down. You can read it again. There is no step after this.

Friend notes still live in the content file and have a screen in the repo. They are off this path until `INCLUDE_FRIENDS` in `site/src/lib/flow.ts` is turned on.

## Product decisions

**Mobile first, checked on an iPhone 14 Pro Max.** The layout is tuned for 430×932, and for 430×739 when the browser toolbar is open. Wide phones use a 59px top and 34px bottom safe area. The header and footer heights are measured into the page so the story sits between them. On a phone, focusing the gate or the wish field scrolls the stage so the heading and the field stay above the keyboard. Desktop windows leave that behavior alone.

**Words arrive one at a time.** Headings use a small mask animation, one word after another. Compliments on the photo cards and the final letter use the same rhythm. The cake letter is a typewriter, character by character. `prefers-reduced-motion` skips the choreography and shows the text at once. The same preference stops the galaxy spin, the fireworks, and the other canvas loops.

**Next waits.** The footer button stays hidden until that step is actually done: an era opened, every quiz answer chosen, every candle out, the pairs finished, the foil cleared, a wish sent, “yes” pressed. The gate moves forward by itself. The last letter has no Next. Progress dots are not buttons. Back returns only to a step already unlocked.

**Both languages come from one file.** Visitor-facing copy is a pair:

```json
{ "vi": "Câu tiếng Việt", "en": "The English line" }
```

The build fails if either side is missing. The language choice is stored on its own (`lilj.locale.v1`) and survives a progress reset. English is the default when nothing has been chosen.

**Music is a playlist, and autoplay is allowed to fail.** Each visit picks a track at random. When a song ends, the next one is a different track whenever there is a choice. The first visit stays quiet, because a browser will refuse `play()` with no gesture. If playback is blocked, a short note explains it, fades after three seconds, and also disappears if the music button is tapped or audio actually starts. It does not return on every step. After that note, the text hint stays away and the music button keeps a soft pink-lavender ring until music is playing.

**The gate is a keepsake.** The nickname sits in `content.json` in plain text. Anyone who can read the repository can see it. The page also sends `noindex, nofollow`, so the privacy is social, not cryptographic. There is no account and no server.

## Stack

Versions are the ones in [`site/package.json`](site/package.json).

| Piece | Where it shows up |
| --- | --- |
| React 19 and React DOM | The whole interface. |
| Vite 8 | Dev server, production build, and the HTML title pulled from `content.json`. |
| TypeScript | Application code, checked by `tsc -b` before each production build. |
| Framer Motion | Step transitions, word reveals, the sticky Next button, countdown reels. |
| WebGL | The photo galaxy in `site/src/lib/galaxy-gl.ts`. If the context is missing, the same canvas draws with the 2D API. |
| Canvas 2D | Birth sky, wish sky, starfield, fireworks, scratch foil, and the cake. |
| Cloudinary | Photo `src` values are public ids. Delivery URLs add `c_limit`, `f_auto`, and `q_auto` at the width the layout needs. |
| Web Audio and `getUserMedia` | Blowing out the candles. A tap does the same job when the mic is unavailable. |
| `HTMLAudioElement` | The playlist, the crossfade, and the birthday loop. No audio library. |
| Fontsource Inter | Latin and Vietnamese, weights 400–700, bundled with the app. |
| Great Vibes | Self-hosted from `site/public/fonts` (SIL Open Font License) for the signature. |
| Vercel | Static deploy of `site/dist`, with an SPA rewrite to `index.html`. |
| oxlint | `npm run lint`. |
| Playwright Core | The overlap suite drives the Chrome already installed on the machine. |

There is no database, no API, and no UI kit. Progress and language live in `localStorage`.

## Project structure

```
vercel.json                 repo-root deploy: install and build inside site/
site/
  content.json              every line, photo id, track, and date
  index.html                viewport, noindex, font preload
  package.json
  vercel.json               same SPA rewrite when the Vercel root is site/
  vite.config.ts
  public/
    fonts/                  Great Vibes
    music/                  playlist files
  scripts/
    overlap-check.mjs       layout matrix
    selfcheck.mjs           small assertions for the pure helpers
    make-placeholders.mjs   stand-in art; the live photos are Cloudinary ids
  src/
    App.tsx                 the path, the lock, the music notice
    main.tsx
    styles.css
    content.ts              loads JSON, flattens photos, validates
    types.ts
    components/             gate, sky, cake, letter, galaxy, lock screen
    chapters/               gallery, quiz, pairs, scratch, dreams, clock
    lib/                    flow, i18n, music, stars, images, progress, viewport
tools/fb-photo-downloader/  optional local helper for saving photos
```

## Run, build, test

Vite 8 needs Node `^20.19.0` or `>=22.12.0`.

```bash
cd site
npm install
npm run dev
```

Open the URL Vite prints. On a phone on the same network, or in a narrow desktop window, you are looking at the layout the page is built for.

```bash
npm run build      # tsc -b && vite build
npm run preview    # serve site/dist
npm run lint       # oxlint
node scripts/selfcheck.mjs
npm run overlap    # production build, then the layout matrix
```

`npm run overlap` needs Chrome (`google-chrome`, `google-chrome-stable`, `chromium`, or `CHROME_PATH`). It walks every step in Vietnamese and English, with the dev jump row on and off, and with each step both finished and still waiting. Viewports run from a 320px phone through iPad sizes to a 1920×1080 desktop, including 430×932 and the shorter 430×739 iPhone 14 Pro Max frame, plus a phone toolbar that steals 80px of height. The command fails if text or controls collide with the header or footer, if a line is clipped, or if the page overflows sideways.

Useful limits, all optional: `OVERLAP_VIEWPORTS`, `OVERLAP_LOCALES`, `OVERLAP_STEPS`, `OVERLAP_DEV`, `OVERLAP_STATES`, `OVERLAP_URL`.

Deploy is a static Vite build. From this repository, the root [`vercel.json`](vercel.json) installs and builds inside `site/` and publishes `site/dist`. Pointing a Vercel project at `site/` also works. `site/vercel.json` sets the framework to Vite and repeats the SPA fallback. The microphone needs HTTPS, which the Vercel URL has. `localhost` is fine too.

## `?dev=1`

Add `?dev=1` to skip the countdown and to show a numbered row in the header. Each number jumps straight to that step. The × at the end clears saved progress and reloads. The flag is read from the query string only. It is not written to `localStorage`.

`?dev=1&lock=1` keeps the countdown up before the birthday. The jump row stays hidden until the real unlock instant, so the lock can be reviewed on its own.

Saved progress is `lilj.progress.v1`: the current step, the furthest step unlocked, and the flags for everything the visitor has already done. An older save is mapped onto the current path by step name. Deleting the key starts the story over and leaves the language choice alone.

## Editing the story

Change [`site/content.json`](site/content.json), then refresh the dev server or rebuild. Components read that file. They do not hold the copy.

Both languages are required on anything a visitor reads. A few fields stay plain strings or numbers: ids, `src`, `startDate`, `lock.unlockAt`, `birth.when`, `birth.lat`, `birth.lon`, music titles, the gate answer, and the short names in `meta`. `npm run build` reports a missing translation, a bad unlock timestamp, an empty era, or a quiz answer that does not point at an option.

Photos are Cloudinary public ids, for example `lilj/galaxy-v3/childhood/g-childhood-02cb6fb950`. The page builds the delivery URL. Image files do not belong in the repo. `memoryPhotoIds` chooses the memory-game pairs.

`lock.unlockAt` has to be an ISO timestamp with a `+07:00` offset. The countdown uses that instant as an absolute time, so the phone’s timezone does not move the birthday.

Music files go in `site/public/music/` and are listed under `music.tracks`. `music.birthday` is the loop the cake fades in. Paths start with `/music/`.
