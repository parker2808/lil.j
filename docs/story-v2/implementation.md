# Story V2 contract

Integration branch: `story-v2`, cut from `3fdc2db`. Production `main` is not the base of these pull requests.

This file is the plan. Pull request A freezes the historical flows and adds the progress fixture harness. It does not change what a visitor can do.

## Shape

Still 15 scenes. No 16th scene. `friends` stays off the path (`INCLUDE_FRIENDS` remains false). The seven stars stay an animation in `Universe`, not a menu. No new framework.

`LockScreen` stays in front of the path and is not one of the 15.

Five chapters, in order:

| Chapter | Vietnamese title | Scenes |
| --- | --- | --- |
| I | Một vũ trụ mang tên em | `gate`, `sky`, `birth` |
| II | Những điều anh nhớ | `gallery`, `memory`, `quiz`, `scratch` |
| III | Từ ngày có hai đứa mình | `counter`, `dreams`, `letters` |
| IV | Ngày đặc biệt của em | `cake`, `wish` |
| V | Còn nhiều điều phía trước | `envelope`, `finale`, `letter` |

Live order once V4 ships:

`gate`, `sky`, `birth`, `gallery`, `memory`, `quiz`, `scratch`, `counter`, `dreams`, `letters`, `cake`, `wish`, `envelope`, `finale`, `letter`.

## Rules

- Memory, Scratch, and Letters each get one later action: “Chơi sau”, “Khám phá sau”, “Để dành những lá thư”. A later action records a skip and moves one scene forward in the same update. It does not write `memoryBest`, `scratched`, or `openWhen`.
- Quiz still requires an answer on every question. A wrong answer still counts.
- Gallery still completes after one fully viewed era.
- `sky` waits for `skyDone`. `counter` waits for `counterSeen` (the existing 2 second timer). Reduced motion, and a revisit of a scene that is already done, pass immediately.
- A wish may stay private (`wishPrivate`) with no fake wish and no “sent” line.
- Opening a scene that was already opened does not force the interaction again.
- An open letter sheet holds Next.
- Leaving mid-flip or mid-scratch must clear timers.
- Dev jump still jumps. A locked jump from the story itself is refused. Two clicks cannot advance two scenes.
- Back, then forward into an opened scene, does not ask for the interaction again.

## State

Key stays `lilj.progress.v1`.

Keep every existing field: `wishes`, `openWhen`, `quiz`, `memoryBest`, `scratched`, `candlesOut`, `muted`, and the rest of today’s `Progress`.

Add:

- `accessibleSteps: StepId[]`
- `skippedSteps: StepId[]`
- `wishPrivate: boolean`

`unlocked` becomes a derived compatibility number (the highest current-flow index present in `accessibleSteps`). Permission checks use `accessibleSteps`, not a prefix of `unlocked`.

Do not reuse `openedChapters`.

Three separate ideas:

- completed: real interaction data (`stepDone`)
- skipped: an id in `skippedSteps`
- may-continue: completed, skipped, or the next scene is already in `accessibleSteps`

## Frozen history

`FLOW_V1`, `FLOW_V2`, and `FLOW_V3` are fixed name lists. Reordering the live `FLOW` must not edit them.

| Version | Length | Notes |
| --- | --- | --- |
| v1 or missing | 9 | `FLOW_V1` (`PREVIOUS_FLOW`): gate, sky, birth, gallery, quiz, counter, cake, wish, letter |
| v2 | 16 | `FLOW_V2`: v3 order with `friends` between `letters` and `dreams` |
| v3 | 15 | `FLOW_V3`: today’s order, no friends |
| v4 | 15 | the chapter order above |

## Migration

1. Unreadable storage (`{`, `null`, or a JSON array) returns the empty state.
2. An unknown version greater than the version this build writes runs for the session and is never written back.
3. Invalid indexes clamp. If `unlocked < step`, keep that step as the current scene. Do not raise `unlocked` before mapping, because that would grant extra old scenes.
4. Resolve the current scene by id on the frozen flow for that version.
5. Map that id onto V4. `friends` drops. Standing on `friends` lands on `dreams`.
6. The old prefix `0..unlocked` becomes a set of accessible ids. Never grant “the first N scenes of the new order”.
7. Add the current scene to that set.
8. Keep interaction data as stored. Do not invent skips or completion.
9. The next save writes `flowVersion: 4`.
10. Loading a v4 record twice does not move the visitor.

Checks that must stay true after the migration lands:

- A v3 save on memory (index 8) opens memory, which is index 4 on V4.
- A v3 save on wish (index 13) opens wish, which is index 11 on V4.
- A v3 save that has reached cake (index 6) and not memory does not make memory accessible, even though memory now sits earlier in the path.
- Reload twice, same step and same accessible set.

## Content facts that are not invented

- Birth time `2002-11-18T16:45:00+07:00` is confirmed. The birth sky is that time. No “illustrative sky” disclaimer.
- Relationship counter keeps `startDate` `2026-07-01T00:00:00+07:00`. At `2026-11-18T00:00:00+07:00` that is 140 days.
- First meeting is a separate milestone, `2022-11-18`. It does not replace `startDate`.
- Photo captions stay empty until Parker writes them. Photo dates stay unset.
- Which eras are `her-life` or `first-meeting` is unknown. Until Parker says, every era stays `together`.
- The date invitation uses `envelope.*` and must not invent a time or a place, and has no RSVP.
- `finalLetter.date` is `2026-11-18`.

## Pull request order

A freeze and this document. B V4 flow and migration. C skip versus complete. D chapter label and sky/counter gates. E content model. F copy for chapters I–III. G cake, private wish, mute, mic. H invitation, lighter finale, letter climax. I journey menu and Vietnamese default. J browser acceptance and overlap fixtures.
