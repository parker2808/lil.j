# Even the Stars Know Your Name

## Project overview

| | |
| --- | --- |
| Role | Solo developer and designer, Parker |
| Dates | October 2026 |
| Live | [https://lil-j.vercel.app](https://lil-j.vercel.app) |
| Contact | \<email\> · \<phone\> |

**Stack:** React 19, TypeScript, Vite 8, Framer Motion, a small WebGL galaxy with a canvas 2D fallback, canvas 2D for the other skies and games, Cloudinary image delivery, the platform audio element, Web Audio for the candles, Fontsource Inter, self-hosted Great Vibes, Vercel static hosting. Layout checks use Playwright Core against system Chrome. Lint is oxlint.

A private birthday site for J. Until midnight on 18 November 2026, Vietnam time (UTC+7), the public page is a countdown. After that instant it becomes a one-way story: a nickname gate, an opening sky, a birth-sky chart, a galaxy of photo eras, a quiz, a together-clock, a cake, a sealed note, pairs, scratch cards, daily “open when” letters, a short list of dreams, a yes/no question, a wish that turns into a star, and a final letter. Vietnamese and English come from one JSON file. English is the default. There is no account and no server. The page sends `noindex, nofollow`.

## What Parker built

The work landed in nine pull requests, all merged to `main`.

**[#1](https://github.com/parker2808/lil.j/pull/1) — Facebook photo downloader.** A Tampermonkey userscript and a DevTools fallback that, in a browser session already logged into Facebook, scroll a visible album, collect photo links, resolve a higher-resolution URL, and zip the files. An optional Node script compresses them to WebP at about 1200px. This tool gathered source photos. It is not part of the site runtime.

**[#2](https://github.com/parker2808/lil.j/pull/2) — The path.** The React app in `site/`: a single route through gate, sky, birth chart, photos, quiz, together-clock, cake, envelope, pairs, scratch cards, open-when letters, friend notes, dreams, the yes/no question, the wish, and the final letter. Next stays hidden until that step is done. Progress dots are not buttons. Back only returns to a step already opened. `?dev=1` adds a numbered jump row. Copy for the visit started in `content.json`. Placeholder art and a stand-in loop stood in for the real photos and music.

**[#3](https://github.com/parker2808/lil.j/pull/3) — Era planets and a flickable stack.** Photos grouped into eras. Opening an era flies into a tilted stack: a flick throws the top card, a tap flips it, a long-press opens the picture. Compliments arrive word by word. This pull request also added `npm run overlap`, the Playwright layout matrix.

**[#4](https://github.com/parker2808/lil.j/pull/4) — Spiral galaxy.** The planet map became a logarithmic spiral. Each era is a star cluster. A tap flies the camera in, then the same polaroid stack opens. The scene is WebGL1 (a disc plus additive points) and falls back to canvas 2D if the shaders do not start. Reduced motion freezes the spin and skips the fly-in.

**[#5](https://github.com/parker2808/lil.j/pull/5) — The rest of the copy.** Constellation names, the VI / EN labels, quiz marks, the tab title, and the last hard-coded visitor strings moved into `content.json`. The Vite build writes the English title and description into `index.html`, and the build fails if a translation, the unlock timestamp, an era, or a quiz answer is wrong.

**[#6](https://github.com/parker2808/lil.j/pull/6) — The real story and the real photos.** Placeholder drawings came out. Photo `src` values are Cloudinary public ids, delivered with `c_limit`, `f_auto`, and `q_auto` at the width the layout asks for. The bilingual copy for the visit is the finished text. The pairs game uses the first two photos of the eras that feed it.

**[#7](https://github.com/parker2808/lil.j/pull/7) — The birthday lock, and the playlist.** Before 00:00 on 18 November 2026, UTC+7, visitors see only the countdown. The instant is absolute, so the phone’s timezone cannot move it. At zero the countdown fades into the gate. `?dev=1` skips the lock and keeps the jump row. `?dev=1&lock=1` shows the countdown and keeps the jump row hidden until the real instant. The same pull request replaced the stand-in loop with the visit playlist (a random track per visit, no immediate repeat) and a birthday loop that crossfades in on the cake, and it set the letter signature in Great Vibes.

**[#8](https://github.com/parker2808/lil.j/pull/8) — iPhone 14 Pro Max.** Layout pass for 430×932 and for 430×739 with the browser toolbar open. Wide phones use a 59px top and 34px bottom safe area. The era stack and the pairs grid use the height they actually have, scratch-card titles draw at 18px, and a focused field on a phone scrolls the stage so the heading stays above the keyboard. The overlap matrix gained the 430×739 frame. Desktop scrollbars are a thin pink-lavender thumb. Mobile overlay scrollbars stay as the browser draws them.

**[#9](https://github.com/parker2808/lil.j/pull/9) — The blocked-music notice.** On iPhone the autoplay toast sat on the era title and never left. It now fades after three seconds, and it hides immediately when the music button is tapped or playback starts. A step change does not bring it back. A later tap can show it again only if `play()` fails again. After the toast, the “tap for music” label stays off. The button keeps a rounded pink-lavender ring until music is actually playing.

## Not merged yet

No feature work is waiting. [#1](https://github.com/parker2808/lil.j/pull/1) through [#9](https://github.com/parker2808/lil.j/pull/9) are merged to `main`. The remote `cursor/*` branches are the pre-squash histories of those same pull requests.

## Not Parker's

**Libraries and hosts.** React, React DOM, Vite, TypeScript, Framer Motion, oxlint, Playwright Core, and Fontsource are dependencies. The photo downloader zips with JSZip from a CDN and can compress with sharp. Images are delivered by Cloudinary. The site is hosted on Vercel. Parker wrote the app, the shaders, the star chart, the overlap harness, and the userscript around those tools.

**Music.** The files in `site/public/music/` are recordings Parker did not write or perform. Laufey: “From The Start”, “Bewitched”, “Valentine”. beabadoobee: “Glue Song”. Also on the playlist: “Echoes of the Stars” (sleepvolume), “Twinkle Twinkle Little Star (Grand Piano)”, and “Happy Birthday Music Box Loop”. Parker chose the order and the playback behavior.

**Fonts.** Inter ships through Fontsource (Latin and Vietnamese). Great Vibes is the SIL Open Font License face in `site/public/fonts`, from The Great Vibes Project. Parker did not design either face.

**Galaxy references.** The spiral’s density, arm shape, and additive points follow public WebGL and three.js galaxy studies (an 80k-particle spiral, Bruno Simon’s galaxy lesson, and a few point-sprite demos). Those projects are not in this repo. The shader in `site/src/lib/galaxy-gl.ts` is code written for this site.

**Assistance.** The implementation was written with Cursor’s AI coding agents, under Parker’s direction and review. The merged commits are co-authored by Cursor Agent. The product decisions, the copy in `content.json`, and what shipped are Parker’s.

## Challenges and solutions

**The page had to stay a surprise.** A client-side countdown is the whole public site until the birthday instant. It reads one ISO timestamp with a `+07:00` offset, so a phone set to another zone still unlocks at Vietnam midnight. `?dev=1` is how the later steps were reviewed without publishing them early. The nickname that opens the gate lives in the content file in plain text. That is a keepsake for J, and it is not an access-control system. `noindex, nofollow` is the other half of keeping the URL quiet.

**A long story had to fit a phone whose chrome moves.** 430×932 and 430×739 are different pages. The header grows when a hint is showing, and the footer is a fixed band. Header and footer heights are measured into CSS variables. On a phone, focusing the gate or the wish field scrolls the stage, not the window, so the heading and the field stay above the keyboard. [#8](https://github.com/parker2808/lil.j/pull/8) is that pass. `npm run overlap` then walks every step in Vietnamese and English, finished and unfinished, with the dev row on and off, from a 320px phone through tablet sizes to a desktop, including those two iPhone frames and an 80px toolbar. The command fails on a collision, a clipped line, or sideways overflow.

**Autoplay is a refusal.** The first visit stays muted. If `play()` rejects, a toast explains it and then leaves, on a timer or on the tap that can actually start audio. [#9](https://github.com/parker2808/lil.j/pull/9) stopped that toast covering the era title for the rest of the visit. The lasting cue is the ring on the music button, and the ring goes away when audio is playing. The cake can still crossfade to the birthday loop after a successful start.

**Two languages in one tree.** Visitor copy is `{ vi, en }` in `site/content.json`. The production build rejects a missing side. [#5](https://github.com/parker2808/lil.j/pull/5) pulled the last strings out of the components so a wording change does not require a component edit. The language key is separate from story progress.

**A sky without a graphics framework or an astronomy API.** The galaxy is two shaders and a camera. If WebGL is missing, the same canvas uses the 2D context. The birth sky projects a bright-star J2000 list from the time and place stored in the content file. Precession is left out, so the chart is a portrait of that afternoon. Reduced motion holds the canvases still and shows every word at once. Candles listen for a breath and also go out on a tap.

**Progress without an account.** One `localStorage` record remembers the step and what she has already done. When the path gained and lost a chapter, the save kept a flow version and was remapped by step name, so an old visit does not reopen on the wrong screen.

## Results

- Live at [https://lil-j.vercel.app](https://lil-j.vercel.app). Before the birthday instant the public page is the countdown.
- The shipped visit is a 15-step path on a phone. Next waits for the step to be finished. A refresh resumes from the device.
- Vietnamese and English ship from `site/content.json`. `npm run build` is also the copy check.
- Photos, the playlist, the birth instant, and the unlock instant change in that file.
- [#8](https://github.com/parker2808/lil.j/pull/8) and [#9](https://github.com/parker2808/lil.j/pull/9) each closed with the overlap suite at 2880 cases and 0 failures, covering phones, tablets, and desktops in both languages.
- Music, motion, and the candle mic each have a direct fallback: a ring instead of a stuck banner, still text instead of a reveal, a tap instead of a breath.
