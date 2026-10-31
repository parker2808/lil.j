# Graph Report - lil.j  (2026-10-31)

## Corpus Check
- 101 files · ~89,223 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: (none) 3, .woff2 1, .css 1)

## Summary
- 1036 nodes · 2232 edges · 54 communities (51 shown, 3 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `fa5e7dda`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useReducedMotion
- App.tsx
- story-v2-check.mjs
- sheet-sync.ts
- site/package.json
- steps
- galaxy.ts
- progress-check.mjs
- overlap-check.mjs
- Gallery.tsx
- locale.tsx
- types.ts
- fb-photo-downloader.user.js
- selfcheck.mjs
- compilerOptions
- steps
- console-snippet.js
- steps
- sheet-ui-check.mjs
- Vũ trụ của em
- WishSky.tsx
- compilerOptions
- ref_node_fs
- Memory.tsx
- PROJECT_CONTEXT — MJ Universe (lil.j)
- useI18n
- stars.ts
- compress.mjs
- make-placeholders.mjs
- JourneyMenu.tsx
- FinalLetter.tsx
- pure.ts
- vercel.json
- content.ts
- selftest.mjs
- .oxlintrc.json
- site/vercel.json
- lock-check.mjs
- FB Photo Downloader
- tsconfig.json
- context-check.sh
- Cake.tsx
- BirthSky.tsx
- Even the Stars Know Your Name
- story-v2-screenshots.mjs
- i18n.ts
- Lưu lựa chọn và điều ước lên Google Sheet
- Even the Stars Know Your Name
- audit
- Fireworks.tsx
- Letters.tsx
- UI và Sheet — 2026-10-31
- Story V2 acceptance
- lessons.md

## God Nodes (most connected - your core abstractions)
1. `App()` - 55 edges
2. `useI18n()` - 50 edges
3. `useReducedMotion()` - 37 edges
4. `react` - 35 edges
5. `content` - 28 edges
6. `fullPlay()` - 22 edges
7. `Reveal()` - 22 edges
8. `fail()` - 21 edges
9. `fillTemplate()` - 21 edges
10. `skipPlay()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `5. Tech stack and architecture (verified from code on `main`)` --references--> `journey()`  [INFERRED]
  PROJECT_CONTEXT.md → site/scripts/story-v2-check.mjs
- `6. Story V2 — the 15 scenes (`FLOW_V4` in `src/lib/flow.ts`)` --references--> `LockScreen()`  [INFERRED]
  PROJECT_CONTEXT.md → site/src/components/LockScreen.tsx
- `CI Story V2 nhanh hơn (2026-10-31, nhánh `chore/faster-story-v2-ci`)` --references--> `push()`  [INFERRED]
  tasks/todo.md → site/scripts/overlap-check.mjs
- `Frozen history` --references--> `dreams()`  [INFERRED]
  docs/story-v2/implementation.md → site/scripts/sheet-sync.test.mjs
- `Migration` --references--> `dreams()`  [INFERRED]
  docs/story-v2/implementation.md → site/scripts/sheet-sync.test.mjs

## Import Cycles
- None detected.

## Communities (54 total, 3 thin omitted)

### Community 0 - "useReducedMotion"
Cohesion: 0.17
Nodes (17): framer-motion, react, Envelope(), EnvelopeProps, Finale(), FinaleProps, GateProps, Hearts() (+9 more)

### Community 1 - "App.tsx"
Cohesion: 0.08
Nodes (56): App(), unlock(), CANDLES, Counter, Dreams, Finale, LETTER_IDS, Quiz (+48 more)

### Community 2 - "story-v2-check.mjs"
Cohesion: 0.09
Nodes (58): push(), base(), advance(), audio(), chapterList(), chromePath(), content, currentStep() (+50 more)

### Community 3 - "sheet-sync.ts"
Cohesion: 0.09
Nodes (42): devModeAllowed, devQuery(), BROWSERS, detectSheetDevice(), PLATFORMS, readSheetDevice(), SheetDevice, Delivery (+34 more)

### Community 4 - "site/package.json"
Cohesion: 0.06
Nodes (42): @fontsource/inter, oxlint, react-dom, @types/node, @types/react, @types/react-dom, typescript, vite (+34 more)

### Community 5 - "steps"
Cohesion: 0.06
Nodes (40): runs-on, steps, timeout-minutes, concurrency, cancel-in-progress, group, defaults, run (+32 more)

### Community 6 - "galaxy.ts"
Cohesion: 0.13
Nodes (32): ease(), glide(), SpiralGalaxy(), SpiralGalaxyHandle, BLUSH, buildCluster(), buildStars(), CORE (+24 more)

### Community 7 - "progress-check.mjs"
Cohesion: 0.06
Nodes (26): afterLetters, afterMemory, afterScratch, cake, cursor, explicit, explicitLoaded, filtered (+18 more)

### Community 8 - "overlap-check.mjs"
Cohesion: 0.15
Nodes (20): allViewports, chromePath(), content, deviceKind(), devModes, extras(), locales, main() (+12 more)

### Community 9 - "Gallery.tsx"
Cohesion: 0.13
Nodes (20): Gallery, decoded, delivered(), Fullscreen(), Gallery(), guideDone(), idleControl, markGuide() (+12 more)

### Community 10 - "locale.tsx"
Cohesion: 0.19
Nodes (10): Trình duyệt nhớ gì, Boundary, BoundaryProps, BoundaryState, readLocale(), text(), LocaleContext, LocaleContextValue (+2 more)

### Community 11 - "types.ts"
Cohesion: 0.15
Nodes (12): Chapter, ChapterId, Content, Dream, EraKind, EraPhoto, FriendNote, Letter (+4 more)

### Community 12 - "fb-photo-downloader.user.js"
Cohesion: 0.21
Nodes (21): assertFacebook(), buildFilename(), collectFromDom(), ensurePanel(), extFromUrlOrType(), extractDate(), extractFbid(), gmFetchBinary() (+13 more)

### Community 13 - "selfcheck.mjs"
Cohesion: 0.05
Nodes (68): State, birthSky, birthUp, blank, born, content, eraPhotos, finaleLater (+60 more)

### Community 14 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 15 - "steps"
Cohesion: 0.11
Nodes (18): if, runs-on, steps, BASE, HEAD, jobs, context, name (+10 more)

### Community 16 - "console-snippet.js"
Cohesion: 0.24
Nodes (18): buildFilename(), collectFromDom(), ensurePanel(), extFromUrlOrType(), extractDate(), extractFbid(), fetchBinary(), fetchText() (+10 more)

### Community 17 - "steps"
Cohesion: 0.12
Nodes (16): description, name, runs, steps, using, id, name, run (+8 more)

### Community 18 - "sheet-ui-check.mjs"
Cohesion: 0.14
Nodes (8): playwright-core, playwright-core@^1.58.2, server, shotsArg, content, server, shotsArg, FLOW

### Community 19 - "Vũ trụ của em"
Cohesion: 0.07
Nodes (33): Content facts that are not invented, Frozen history, Migration, Pull request order, Rules, Shape, Story V2 contract, Bố cục trang (+25 more)

### Community 20 - "WishSky.tsx"
Cohesion: 0.17
Nodes (14): WishSky, BUBBLE_SHAPES, clamp01(), ease(), hashOf(), HUES, Particle, quad() (+6 more)

### Community 21 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 22 - "ref_node_fs"
Cohesion: 0.27
Nodes (4): pool, raw, fakeSheet(), loadScript()

### Community 23 - "Memory.tsx"
Cohesion: 0.17
Nodes (18): Memory, buildDeck(), deckSeed(), Memory(), again(), onFlip(), showMatchToast(), memoryPool() (+10 more)

### Community 24 - "PROJECT_CONTEXT — MJ Universe (lil.j)"
Cohesion: 0.08
Nodes (22): AGENT_RULES: lil.j, Checks (from `site/` after `npm ci`, paste results), Forbidden, PRs, Stack, Start (token flow), Where things live, 10. Git, PR and deploy workflow (+14 more)

### Community 25 - "useI18n"
Cohesion: 0.20
Nodes (15): Friends, Dreams(), Friends(), TONES, Quiz(), Scratch(), ScratchCard(), ChapterFrame() (+7 more)

### Community 26 - "stars.ts"
Cohesion: 0.19
Nodes (14): altAz(), clip(), Constellation, CONSTELLATION_IDS, gmstDegrees(), Horizontal, mod(), PlottedLine (+6 more)

### Community 27 - "compress.mjs"
Cohesion: 0.09
Nodes (24): sharp, compressOne(), __dirname, ensureDir(), formatBytes(), IMAGE_EXT, INPUT, listImages() (+16 more)

### Community 28 - "make-placeholders.mjs"
Cohesion: 0.14
Nodes (11): fade, header, looped, musicDir, notes, pcm, photos, photosDir (+3 more)

### Community 29 - "JourneyMenu.tsx"
Cohesion: 0.22
Nodes (10): JourneyMenu(), JourneyMenuProps, sceneCopy(), LanguageToggle(), StoryChapterLabel(), StepId, CHAPTER_BY_SCENE, chapterFor() (+2 more)

### Community 30 - "FinalLetter.tsx"
Cohesion: 0.18
Nodes (16): FinalLetter, Stack(), tiltOf(), Words(), ClosingConstellation(), delayFor(), FinalLetter(), FinalLetterProps (+8 more)

### Community 31 - "pure.ts"
Cohesion: 0.21
Nodes (12): Counter(), OdoDigit(), Reel(), Gate(), onSubmit(), CHAPTER_IDS, Elapsed, elapsedParts() (+4 more)

### Community 32 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 33 - "content.ts"
Cohesion: 0.21
Nodes (10): chapters, problem, captionBlank(), flattenPhotos(), musicTrackProblem(), raw, RawContent, REQUIRED_CHAPTERS (+2 more)

### Community 34 - "selftest.mjs"
Cohesion: 0.33
Nodes (3): best, pickBestImageUrl(), unescapeJsonUrl()

### Community 35 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 36 - "site/vercel.json"
Cohesion: 0.40
Nodes (4): framework, headers, rewrites, $schema

### Community 37 - "lock-check.mjs"
Cohesion: 0.17
Nodes (3): content, server, unlockAt

### Community 38 - "FB Photo Downloader"
Cohesion: 0.15
Nodes (12): Bạn cần gì, Checklist nhanh, Chạy, Cài đặt, Cách 1 — Tampermonkey (khuyến nghị), Cách 2 — Console snippet (không cần extension), Cấu trúc thư mục, FB Photo Downloader (+4 more)

### Community 41 - "Cake.tsx"
Cohesion: 0.23
Nodes (9): Cake, Cake(), CakeArt(), CakeProps, COLORS, Confetti(), SPRINKLES, Typewriter() (+1 more)

### Community 42 - "BirthSky.tsx"
Cohesion: 0.22
Nodes (9): BirthSky, BirthSky(), BirthSkyProps, HERO, layoutGroup(), NOTE_SLOTS, formatZoned(), CATALOG (+1 more)

### Community 43 - "Even the Stars Know Your Name"
Cohesion: 0.22
Nodes (8): `?dev=1`, Editing the story, Even the Stars Know Your Name, Product decisions, Project structure, Run, build, test, Stack, The idea

### Community 44 - "story-v2-screenshots.mjs"
Cohesion: 0.25
Nodes (7): auditMemoryLayout(), content, memoryCardsFullyVisible(), output, paths, report, STORY_V2_MEMORY_SEED

### Community 45 - "i18n.ts"
Cohesion: 0.28
Nodes (7): OPTIONS, Copy, isCopy(), Locale, LOCALE_KEY, PLAIN, walk()

### Community 46 - "Lưu lựa chọn và điều ước lên Google Sheet"
Cohesion: 0.22
Nodes (8): Bật dev mode (cờ Vercel), Bật/tắt công tắc "Giữ điều ước cho riêng em" (cờ Vercel), Cài đặt (khoảng 5 phút), Ghi chú kỹ thuật, Khi sửa đoạn mã sau này, Lưu lựa chọn và điều ước lên Google Sheet, Nâng cấp Sheet đang có (bản định dạng bảng và thiết bị), Tắt tính năng

### Community 47 - "Even the Stars Know Your Name"
Cohesion: 0.25
Nodes (7): Challenges and solutions, Even the Stars Know Your Name, Not merged yet, Not Parker's, Project overview, Results, What Parker built

### Community 48 - "audit"
Cohesion: 0.46
Nodes (7): audit(), boxOf(), clips(), intersection(), scrolls(), unscrollableClip(), visibleBox()

### Community 49 - "Fireworks.tsx"
Cohesion: 0.29
Nodes (7): Bit, COLORS, Fireworks(), GateBurst(), mountCanvas(), PASTEL, softenEdges()

### Community 50 - "Letters.tsx"
Cohesion: 0.38
Nodes (5): Letters, Letters(), LettersProps, skipAhead(), todayKey()

### Community 51 - "UI và Sheet — 2026-10-31"
Cohesion: 0.33
Nodes (5): Giới hạn, Kiểm tra, Phạm vi, Sửa sau review (2026-10-31), UI và Sheet — 2026-10-31

### Community 52 - "Story V2 acceptance"
Cohesion: 0.40
Nodes (4): Facts still open, Matrix, Results, Story V2 acceptance

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useReducedMotion` to `App.tsx`, `site/package.json`, `galaxy.ts`, `Gallery.tsx`, `BirthSky.tsx`, `locale.tsx`, `Cake.tsx`, `selfcheck.mjs`, `Fireworks.tsx`, `Letters.tsx`, `WishSky.tsx`, `Memory.tsx`, `useI18n`, `JourneyMenu.tsx`, `FinalLetter.tsx`, `pure.ts`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.08038914490527393 - nodes in this community are weakly interconnected._
- **Why does `useI18n()` connect `useI18n` to `useReducedMotion`, `App.tsx`, `galaxy.ts`, `Gallery.tsx`, `BirthSky.tsx`, `Cake.tsx`, `i18n.ts`, `selfcheck.mjs`, `Letters.tsx`, `WishSky.tsx`, `Memory.tsx`, `JourneyMenu.tsx`, `FinalLetter.tsx`, `pure.ts`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `story-v2-check.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09435028248587571 - nodes in this community are weakly interconnected._
- **Should `sheet-sync.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0927536231884058 - nodes in this community are weakly interconnected._
- **Should `site/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05647840531561462 - nodes in this community are weakly interconnected._
- **Should `steps` be split into smaller, more focused modules?**
  _Cohesion score 0.06097560975609756 - nodes in this community are weakly interconnected._