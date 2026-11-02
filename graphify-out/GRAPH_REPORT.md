# Graph Report - lil.j  (2026-11-01)

## Corpus Check
- 104 files · ~89,611 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 4, .woff2 1, .css 1)

## Summary
- 1040 nodes · 2232 edges · 54 communities (49 shown, 5 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f149a119`
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
- i18n.ts
- progress.ts
- fb-photo-downloader.user.js
- selfcheck.mjs
- compilerOptions
- steps
- console-snippet.js
- steps
- sheet-ui-check.mjs
- Vũ trụ của em
- types.ts
- compilerOptions
- scripts
- Memory.tsx
- PROJECT_CONTEXT — MJ Universe (lil.j)
- useI18n
- stars.ts
- compress.mjs
- make-placeholders.mjs
- AGENTS.md — lil.j rules
- FinalLetter.tsx
- pure.ts
- vercel.json
- content.ts
- selftest.mjs
- .oxlintrc.json
- site/vercel.json
- ref_node_url
- FB Photo Downloader
- tsconfig.json
- context-check.sh
- Cake.tsx
- BirthSky.tsx
- Even the Stars Know Your Name
- useProgress.ts
- react-dom
- Lưu lựa chọn và điều ước lên Google Sheet
- Even the Stars Know Your Name
- moveTo
- LESSONS.md
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
- `6. Story V2 — the 15 scenes (`FLOW_V4` in `src/lib/flow.ts`)` --references--> `LockScreen()`  [INFERRED]
  PROJECT_CONTEXT.md → site/src/components/LockScreen.tsx
- `CI Story V2 nhanh hơn (2026-10-31, nhánh `chore/faster-story-v2-ci`)` --references--> `push()`  [INFERRED]
  tasks/todo.md → site/scripts/overlap-check.mjs
- `Frozen history` --references--> `dreams()`  [INFERRED]
  docs/story-v2/implementation.md → site/scripts/sheet-sync.test.mjs
- `Migration` --references--> `dreams()`  [INFERRED]
  docs/story-v2/implementation.md → site/scripts/sheet-sync.test.mjs
- `Changelog archive — lil.j` --references--> `journey()`  [INFERRED]
  docs/CHANGELOG_ARCHIVE.md → site/scripts/story-v2-check.mjs

## Import Cycles
- None detected.

## Communities (54 total, 5 thin omitted)

### Community 0 - "useReducedMotion"
Cohesion: 0.16
Nodes (18): react, Envelope(), EnvelopeProps, Finale(), FinaleProps, Gate(), onSubmit(), GateProps (+10 more)

### Community 1 - "App.tsx"
Cohesion: 0.06
Nodes (76): App(), BirthSky, Cake, CANDLES, Counter, Dreams, Finale, FinalLetter (+68 more)

### Community 2 - "story-v2-check.mjs"
Cohesion: 0.09
Nodes (59): 5. Tech stack and architecture (verified from code on `main`), push(), base(), advance(), audio(), chapterList(), chromePath(), content (+51 more)

### Community 3 - "sheet-sync.ts"
Cohesion: 0.10
Nodes (41): devModeAllowed, devQuery(), BROWSERS, detectSheetDevice(), PLATFORMS, readSheetDevice(), SheetDevice, Delivery (+33 more)

### Community 4 - "site/package.json"
Cohesion: 0.17
Nodes (15): oxlint, @types/node, @types/react, @types/react-dom, typescript, devDependencies, oxlint@^1.88.0, @types/node@^24.19.2 (+7 more)

### Community 5 - "steps"
Cohesion: 0.06
Nodes (40): runs-on, steps, timeout-minutes, concurrency, cancel-in-progress, group, defaults, run (+32 more)

### Community 6 - "galaxy.ts"
Cohesion: 0.13
Nodes (32): ease(), glide(), SpiralGalaxy(), SpiralGalaxyHandle, BLUSH, buildCluster(), buildStars(), CORE (+24 more)

### Community 7 - "progress-check.mjs"
Cohesion: 0.05
Nodes (32): chapters, problem, pool, raw, afterLetters, afterMemory, afterScratch, cake (+24 more)

### Community 8 - "overlap-check.mjs"
Cohesion: 0.12
Nodes (27): allViewports, audit(), boxOf(), clips(), intersection(), scrolls(), unscrollableClip(), visibleBox() (+19 more)

### Community 9 - "Gallery.tsx"
Cohesion: 0.13
Nodes (22): decoded, delivered(), Fullscreen(), Gallery(), guideDone(), idleControl, markGuide(), Mode (+14 more)

### Community 10 - "i18n.ts"
Cohesion: 0.11
Nodes (20): Boundary, BoundaryProps, BoundaryState, JourneyMenu(), JourneyMenuProps, sceneCopy(), LanguageToggle(), OPTIONS (+12 more)

### Community 11 - "progress.ts"
Cohesion: 0.19
Nodes (21): mapSceneId(), pathForVersion(), clampToLength(), derivedUnlocked(), futureSession(), isStepId(), liveEraIds, liveIds() (+13 more)

### Community 12 - "fb-photo-downloader.user.js"
Cohesion: 0.21
Nodes (21): assertFacebook(), buildFilename(), collectFromDom(), ensurePanel(), extFromUrlOrType(), extractDate(), extractFbid(), gmFetchBinary() (+13 more)

### Community 13 - "selfcheck.mjs"
Cohesion: 0.08
Nodes (28): birthSky, birthUp, blank, born, content, eraPhotos, finaleLater, future (+20 more)

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
Cohesion: 0.10
Nodes (13): playwright-core, playwright-core@^1.58.2, content, server, unlockAt, server, shotsArg, content (+5 more)

### Community 19 - "Vũ trụ của em"
Cohesion: 0.07
Nodes (34): Content facts that are not invented, Frozen history, Migration, Pull request order, Rules, Shape, Story V2 contract, Bố cục trang (+26 more)

### Community 20 - "types.ts"
Cohesion: 0.07
Nodes (30): BUBBLE_SHAPES, clamp01(), ease(), hashOf(), HUES, Particle, quad(), sampleWords() (+22 more)

### Community 21 - "compilerOptions"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 22 - "scripts"
Cohesion: 0.12
Nodes (16): scripts, build, content-check, dev, lint, lock-check, memory-deck-test, overlap (+8 more)

### Community 23 - "Memory.tsx"
Cohesion: 0.10
Nodes (22): auditMemoryLayout(), content, memoryCardsFullyVisible(), output, paths, report, buildDeck(), deckSeed() (+14 more)

### Community 24 - "PROJECT_CONTEXT — MJ Universe (lil.j)"
Cohesion: 0.13
Nodes (14): 10. Git, PR and deploy workflow, 11. Multi-agent coordination rules, 12. Current status and open items (as of 2026-10-31), 12a. Deferred (phát triển sau), 13. Changelog, 1. Project overview, 2. People and confirmed facts, 3. Unverified and forbidden facts (+6 more)

### Community 25 - "useI18n"
Cohesion: 0.23
Nodes (14): Dreams(), Memory(), onFlip(), showMatchToast(), Quiz(), Scratch(), ScratchCard(), ChapterFrame() (+6 more)

### Community 26 - "stars.ts"
Cohesion: 0.16
Nodes (16): altAz(), CATALOG, clip(), Constellation, CONSTELLATION_IDS, CONSTELLATIONS, gmstDegrees(), Horizontal (+8 more)

### Community 27 - "compress.mjs"
Cohesion: 0.09
Nodes (24): sharp, compressOne(), __dirname, ensureDir(), formatBytes(), IMAGE_EXT, INPUT, listImages() (+16 more)

### Community 28 - "make-placeholders.mjs"
Cohesion: 0.14
Nodes (11): fade, header, looped, musicDir, notes, pcm, photos, photosDir (+3 more)

### Community 29 - "AGENTS.md — lil.j rules"
Cohesion: 0.25
Nodes (5): AGENTS.md — lil.j rules, Facts and content, PRs, Stack and checks, Start and scope

### Community 30 - "FinalLetter.tsx"
Cohesion: 0.15
Nodes (17): Changelog archive — lil.j, ClosingConstellation(), delayFor(), FinalLetter(), FinalLetterProps, layoutScorpio(), Token, tokenize() (+9 more)

### Community 31 - "pure.ts"
Cohesion: 0.25
Nodes (10): Counter(), OdoDigit(), Reel(), Friends(), TONES, CHAPTER_IDS, Elapsed, elapsedParts() (+2 more)

### Community 32 - "vercel.json"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 33 - "content.ts"
Cohesion: 0.14
Nodes (13): framer-motion, Letters(), LettersProps, LockScreenProps, OdoDigit(), Reel(), captionBlank(), content (+5 more)

### Community 34 - "selftest.mjs"
Cohesion: 0.33
Nodes (3): best, pickBestImageUrl(), unescapeJsonUrl()

### Community 35 - ".oxlintrc.json"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 36 - "site/vercel.json"
Cohesion: 0.40
Nodes (4): framework, headers, rewrites, $schema

### Community 37 - "ref_node_url"
Cohesion: 0.25
Nodes (4): vite, @vitejs/plugin-react, vite@^8.3.4, @vitejs/plugin-react@^6.1.2

### Community 38 - "FB Photo Downloader"
Cohesion: 0.15
Nodes (12): Bạn cần gì, Checklist nhanh, Chạy, Cài đặt, Cách 1 — Tampermonkey (khuyến nghị), Cách 2 — Console snippet (không cần extension), Cấu trúc thư mục, FB Photo Downloader (+4 more)

### Community 41 - "Cake.tsx"
Cohesion: 0.25
Nodes (8): Cake(), CakeArt(), CakeProps, COLORS, Confetti(), SPRINKLES, Typewriter(), TypewriterProps

### Community 42 - "BirthSky.tsx"
Cohesion: 0.31
Nodes (7): BirthSky(), BirthSkyProps, HERO, layoutGroup(), NOTE_SLOTS, formatZoned(), starRadius()

### Community 43 - "Even the Stars Know Your Name"
Cohesion: 0.22
Nodes (8): `?dev=1`, Editing the story, Even the Stars Know Your Name, Product decisions, Project structure, Run, build, test, Stack, The idea

### Community 44 - "useProgress.ts"
Cohesion: 0.32
Nodes (7): State, FLOW_VERSION, isPlainObject(), loadProgress(), saveProgress(), useProgress(), Progress

### Community 45 - "react-dom"
Cohesion: 0.29
Nodes (7): @fontsource/inter, react-dom, dependencies, @fontsource/inter@^5.3.0, framer-motion@^14.6.0, react@^19.3.1, react-dom@^19.3.1

### Community 46 - "Lưu lựa chọn và điều ước lên Google Sheet"
Cohesion: 0.22
Nodes (8): Bật dev mode (cờ Vercel), Bật/tắt công tắc "Giữ điều ước cho riêng em" (cờ Vercel), Cài đặt (khoảng 5 phút), Ghi chú kỹ thuật, Khi sửa đoạn mã sau này, Lưu lựa chọn và điều ước lên Google Sheet, Nâng cấp Sheet đang có (bản định dạng bảng và thiết bị), Tắt tính năng

### Community 47 - "Even the Stars Know Your Name"
Cohesion: 0.25
Nodes (7): Challenges and solutions, Even the Stars Know Your Name, Not merged yet, Not Parker's, Project overview, Results, What Parker built

### Community 48 - "moveTo"
Cohesion: 0.67
Nodes (4): unlock(), clampStep(), moveTo(), sameSteps()

### Community 51 - "UI và Sheet — 2026-10-31"
Cohesion: 0.33
Nodes (5): Giới hạn, Kiểm tra, Phạm vi, Sửa sau review (2026-10-31), UI và Sheet — 2026-10-31

### Community 52 - "Story V2 acceptance"
Cohesion: 0.40
Nodes (4): Facts still open, Matrix, Results, Story V2 acceptance

## Knowledge Gaps
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `useReducedMotion` to `App.tsx`, `content.ts`, `site/package.json`, `galaxy.ts`, `Gallery.tsx`, `BirthSky.tsx`, `i18n.ts`, `Cake.tsx`, `react-dom`, `useProgress.ts`, `types.ts`, `useI18n`, `FinalLetter.tsx`, `pure.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._
- **Should `App.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.056862745098039215 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `scripts` to `site/package.json`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Should `story-v2-check.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.09180327868852459 - nodes in this community are weakly interconnected._
- **Why does `useI18n()` connect `useI18n` to `useReducedMotion`, `App.tsx`, `content.ts`, `galaxy.ts`, `Cake.tsx`, `BirthSky.tsx`, `Gallery.tsx`, `i18n.ts`, `types.ts`, `FinalLetter.tsx`, `pure.ts`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Should `sheet-sync.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.09595959595959595 - nodes in this community are weakly interconnected._
- **Should `steps` be split into smaller, more focused modules?**
  _Cohesion score 0.06097560975609756 - nodes in this community are weakly interconnected._