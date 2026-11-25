# Graph Report - lil.j  (2026-11-22)

## Corpus Check
- 104 files · ~89,901 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .woff2 1, .css 1)

## Summary
- 1042 nodes · 2235 edges · 56 communities (50 shown, 6 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `38e2d8ea`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- useReducedMotion
- music.ts
- story-v2-check.mjs
- sheet-sync.ts
- site/package.json
- steps
- galaxy.ts
- progress-check.mjs
- overlap-check.mjs
- Gallery.tsx
- i18n.ts
- App.tsx
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
- useI18n
- Memory.tsx
- LockScreen.tsx
- useI18n
- stars.ts
- compress.mjs
- make-placeholders.mjs
- ref_node_fs
- FinalLetter.tsx
- pure.ts
- vercel.json
- content.ts
- selftest.mjs
- .oxlintrc.json
- site/vercel.json
- FB Photo Downloader
- tsconfig.json
- context-check.sh
- Cake.tsx
- types.ts
- Even the Stars Know Your Name
- compress.mjs
- JourneyMenu.tsx
- Lưu lựa chọn và điều ước lên Google Sheet
- Even the Stars Know Your Name
- story-v2-screenshots.mjs
- LESSONS.md
- UI và Sheet — 2026-10-31
- Story V2 acceptance
- lessons.md
- lock-check.mjs
- i18n.ts

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
- `CI Story V2 nhanh hơn (2026-10-31, nhánh `chore/faster-story-v2-ci`)` --references--> `push()`  [INFERRED]
  tasks/todo.md → site/scripts/overlap-check.mjs
- `Frozen history` --references--> `dreams()`  [INFERRED]
  docs/story-v2/implementation.md → site/scripts/sheet-sync.test.mjs
- `Migration` --references--> `dreams()`  [INFERRED]
  docs/story-v2/implementation.md → site/scripts/sheet-sync.test.mjs
- `Kết quả CI thật (PR #34)` --references--> `journey()`  [INFERRED]
  tasks/todo.md → site/scripts/story-v2-check.mjs

## Import Cycles
- None detected.

## Communities (56 total, 6 thin omitted)

### Community 0 - "useReducedMotion"
Cohesion: 0.14
Nodes (20): react, ChapterFrameProps, Envelope(), EnvelopeProps, Finale(), FinaleProps, Gate(), onSubmit() (+12 more)

### Community 1 - "music.ts"
Cohesion: 0.17
Nodes (30): MusicButton(), onClick(), MusicButtonProps, MusicCredit(), musicWasHeard(), rememberMusic(), activePlayer(), bindMusicVisibility() (+22 more)

### Community 2 - "story-v2-check.mjs"
Cohesion: 0.09
Nodes (59): Changelog archive — lil.j, push(), base(), advance(), audio(), chapterList(), chromePath(), content (+51 more)

### Community 3 - "sheet-sync.ts"
Cohesion: 0.10
Nodes (41): devModeAllowed, devQuery(), BROWSERS, detectSheetDevice(), PLATFORMS, readSheetDevice(), SheetDevice, Delivery (+33 more)

### Community 4 - "site/package.json"
Cohesion: 0.06
Nodes (42): @fontsource/inter, oxlint, react-dom, @types/node, @types/react, @types/react-dom, typescript, vite (+34 more)

### Community 5 - "steps"
Cohesion: 0.06
Nodes (40): runs-on, steps, timeout-minutes, concurrency, cancel-in-progress, group, defaults, run (+32 more)

### Community 6 - "galaxy.ts"
Cohesion: 0.14
Nodes (31): ease(), glide(), SpiralGalaxy(), BLUSH, buildCluster(), buildStars(), CORE, DUST (+23 more)

### Community 7 - "progress-check.mjs"
Cohesion: 0.06
Nodes (26): afterLetters, afterMemory, afterScratch, cake, cursor, explicit, explicitLoaded, filtered (+18 more)

### Community 8 - "overlap-check.mjs"
Cohesion: 0.12
Nodes (27): allViewports, audit(), boxOf(), clips(), intersection(), scrolls(), unscrollableClip(), visibleBox() (+19 more)

### Community 9 - "Gallery.tsx"
Cohesion: 0.12
Nodes (23): decoded, delivered(), Fullscreen(), Gallery(), guideDone(), idleControl, markGuide(), Mode (+15 more)

### Community 10 - "i18n.ts"
Cohesion: 0.19
Nodes (10): Boundary, BoundaryProps, BoundaryState, LOCALE_KEY, readLocale(), text(), LocaleContext, LocaleContextValue (+2 more)

### Community 11 - "App.tsx"
Cohesion: 0.11
Nodes (28): framer-motion, App(), BirthSky, Cake, CANDLES, Counter, Dreams, Finale (+20 more)

### Community 12 - "fb-photo-downloader.user.js"
Cohesion: 0.21
Nodes (21): assertFacebook(), buildFilename(), collectFromDom(), ensurePanel(), extFromUrlOrType(), extractDate(), extractFbid(), gmFetchBinary() (+13 more)

### Community 13 - "selfcheck.mjs"
Cohesion: 0.06
Nodes (64): State, birthSky, birthUp, blank, born, content, eraPhotos, finaleLater (+56 more)

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
Nodes (34): Content facts that are not invented, Frozen history, Migration, Pull request order, Rules, Shape, Story V2 contract, Bố cục trang (+26 more)

### Community 20 - "WishSky.tsx"
Cohesion: 0.17
Nodes (14): BUBBLE_SHAPES, clamp01(), ease(), hashOf(), HUES, Particle, quad(), sampleWords() (+6 more)

### Community 21 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 22 - "useI18n"
Cohesion: 0.27
Nodes (9): Scratch(), ScratchCard(), Letters(), LettersProps, StoryChapterLabel(), useI18n(), skipAhead(), todayKey() (+1 more)

### Community 23 - "Memory.tsx"
Cohesion: 0.18
Nodes (14): buildDeck(), deckSeed(), again(), memoryPool(), buildMemoryDeck(), MEMORY_PAIR_COUNT, MemoryCard, MemoryPhotoInput (+6 more)

### Community 24 - "LockScreen.tsx"
Cohesion: 0.10
Nodes (27): 10. Git, PR and deploy workflow, 11. Multi-agent coordination rules, 12. Current status and open items (as of 2026-10-31), 12a. Deferred (phát triển sau), 13. Changelog, 1. Project overview, 2. People and confirmed facts, 3. Unverified and forbidden facts (+19 more)

### Community 25 - "useI18n"
Cohesion: 0.16
Nodes (16): Dreams(), Memory(), onFlip(), showMatchToast(), Quiz(), ChapterFrame(), Bit, COLORS (+8 more)

### Community 26 - "stars.ts"
Cohesion: 0.17
Nodes (15): Copy, altAz(), clip(), Constellation, CONSTELLATION_IDS, gmstDegrees(), Horizontal, mod() (+7 more)

### Community 27 - "compress.mjs"
Cohesion: 0.15
Nodes (13): sharp, dependencies, sharp@^0.33.5, description, engines, node, name, private (+5 more)

### Community 28 - "make-placeholders.mjs"
Cohesion: 0.14
Nodes (11): fade, header, looped, musicDir, notes, pcm, photos, photosDir (+3 more)

### Community 29 - "ref_node_fs"
Cohesion: 0.19
Nodes (6): chapters, problem, pool, raw, fakeSheet(), loadScript()

### Community 30 - "FinalLetter.tsx"
Cohesion: 0.15
Nodes (19): BirthSky(), BirthSkyProps, HERO, layoutGroup(), NOTE_SLOTS, ClosingConstellation(), delayFor(), FinalLetter() (+11 more)

### Community 31 - "pure.ts"
Cohesion: 0.21
Nodes (12): Counter(), OdoDigit(), Reel(), Friends(), TONES, CHAPTER_IDS, Elapsed, elapsedParts() (+4 more)

### Community 32 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 33 - "content.ts"
Cohesion: 0.28
Nodes (7): captionBlank(), flattenPhotos(), musicTrackProblem(), raw, RawContent, REQUIRED_CHAPTERS, validateContent()

### Community 34 - "selftest.mjs"
Cohesion: 0.33
Nodes (3): best, pickBestImageUrl(), unescapeJsonUrl()

### Community 35 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 36 - "site/vercel.json"
Cohesion: 0.40
Nodes (4): framework, headers, rewrites, $schema

### Community 38 - "FB Photo Downloader"
Cohesion: 0.15
Nodes (12): Bạn cần gì, Checklist nhanh, Chạy, Cài đặt, Cách 1 — Tampermonkey (khuyến nghị), Cách 2 — Console snippet (không cần extension), Cấu trúc thư mục, FB Photo Downloader (+4 more)

### Community 41 - "Cake.tsx"
Cohesion: 0.23
Nodes (9): Cake(), CakeArt(), CakeProps, COLORS, Confetti(), SPRINKLES, Typewriter(), TypewriterProps (+1 more)

### Community 42 - "types.ts"
Cohesion: 0.15
Nodes (12): Chapter, ChapterId, Content, Dream, Era, EraKind, FriendNote, Letter (+4 more)

### Community 43 - "Even the Stars Know Your Name"
Cohesion: 0.11
Nodes (15): AGENTS.md — lil.j rules, Facts and content, Full decision authority, PRs, Stack and checks, Start and scope, Agent rules, `?dev=1` (+7 more)

### Community 44 - "compress.mjs"
Cohesion: 0.23
Nodes (11): compressOne(), __dirname, ensureDir(), formatBytes(), IMAGE_EXT, INPUT, listImages(), main() (+3 more)

### Community 45 - "JourneyMenu.tsx"
Cohesion: 0.25
Nodes (8): JourneyMenu(), JourneyMenuProps, sceneCopy(), LanguageToggle(), StepId, CHAPTER_BY_SCENE, STORY_CHAPTERS, StoryChapterId

### Community 46 - "Lưu lựa chọn và điều ước lên Google Sheet"
Cohesion: 0.22
Nodes (8): Bật dev mode (cờ Vercel), Bật/tắt công tắc "Giữ điều ước cho riêng em" (cờ Vercel), Cài đặt (khoảng 5 phút), Ghi chú kỹ thuật, Khi sửa đoạn mã sau này, Lưu lựa chọn và điều ước lên Google Sheet, Nâng cấp Sheet đang có (bản định dạng bảng và thiết bị), Tắt tính năng

### Community 47 - "Even the Stars Know Your Name"
Cohesion: 0.25
Nodes (7): Challenges and solutions, Even the Stars Know Your Name, Not merged yet, Not Parker's, Project overview, Results, What Parker built

### Community 48 - "story-v2-screenshots.mjs"
Cohesion: 0.25
Nodes (7): auditMemoryLayout(), content, memoryCardsFullyVisible(), output, paths, report, STORY_V2_MEMORY_SEED

### Community 51 - "UI và Sheet — 2026-10-31"
Cohesion: 0.33
Nodes (5): Giới hạn, Kiểm tra, Phạm vi, Sửa sau review (2026-10-31), UI và Sheet — 2026-10-31

### Community 52 - "Story V2 acceptance"
Cohesion: 0.40
Nodes (4): Facts still open, Matrix, Results, Story V2 acceptance

### Community 54 - "lock-check.mjs"
Cohesion: 0.25
Nodes (3): content, server, unlockAt

### Community 55 - "i18n.ts"
Cohesion: 0.36
Nodes (6): OPTIONS, collectCopyProblems(), isCopy(), Locale, PLAIN, walk()

## Knowledge Gaps
- **6 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useReducedMotion` to `music.ts`, `site/package.json`, `galaxy.ts`, `Gallery.tsx`, `i18n.ts`, `App.tsx`, `Cake.tsx`, `JourneyMenu.tsx`, `selfcheck.mjs`, `WishSky.tsx`, `useI18n`, `LockScreen.tsx`, `useI18n`, `FinalLetter.tsx`, `pure.ts`?**
  _High betweenness centrality (0.043) - this node is a cross-community bridge._
- **Should `useReducedMotion` be split into smaller, more focused modules?**
  _Cohesion score 0.14112903225806453 - nodes in this community are weakly interconnected._
- **Why does `useI18n()` connect `useI18n` to `useReducedMotion`, `music.ts`, `galaxy.ts`, `Gallery.tsx`, `Cake.tsx`, `App.tsx`, `JourneyMenu.tsx`, `WishSky.tsx`, `i18n.ts`, `LockScreen.tsx`, `useI18n`, `FinalLetter.tsx`, `pure.ts`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Should `story-v2-check.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0893707033315706 - nodes in this community are weakly interconnected._
- **Should `sheet-sync.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09595959595959595 - nodes in this community are weakly interconnected._
- **Should `site/package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.05647840531561462 - nodes in this community are weakly interconnected._
- **Should `steps` be split into smaller, more focused modules?**
  _Cohesion score 0.06097560975609756 - nodes in this community are weakly interconnected._