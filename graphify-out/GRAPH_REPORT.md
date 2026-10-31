# Graph Report - lil.j  (2026-10-31)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 915 nodes · 2094 edges · 41 communities (38 shown, 3 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 11 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b283c940`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 38
- Community 39
- Community 40

## God Nodes (most connected - your core abstractions)
1. `App()` - 55 edges
2. `useI18n()` - 50 edges
3. `useReducedMotion()` - 37 edges
4. `react` - 35 edges
5. `content` - 28 edges
6. `Reveal()` - 22 edges
7. `fullPlay()` - 22 edges
8. `fillTemplate()` - 21 edges
9. `fail()` - 21 edges
10. `skipPlay()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `main()` --indirect_call--> `base()`  [INFERRED]
  site/scripts/overlap-check.mjs → site/scripts/progress-check.mjs
- `Dreams()` --calls--> `queueDreams()`  [EXTRACTED]
  site/src/chapters/Dreams.tsx → site/src/lib/sheet-sync.ts
- `buildDeck()` --calls--> `buildMemoryDeck()`  [EXTRACTED]
  site/src/chapters/Memory.tsx → site/src/lib/memory-deck.ts
- `Memory()` --calls--> `cloudinaryUrl()`  [EXTRACTED]
  site/src/chapters/Memory.tsx → site/src/lib/images.ts
- `BirthSky()` --calls--> `projectSky()`  [EXTRACTED]
  site/src/components/BirthSky.tsx → site/src/lib/stars.ts

## Import Cycles
- None detected.

## Communities (41 total, 3 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (84): react, Counter(), OdoDigit(), Reel(), Dreams(), Friends(), TONES, buildDeck() (+76 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (69): framer-motion, App(), BirthSky, Cake, CANDLES, Counter, Dreams, Finale (+61 more)

### Community 2 - "Community 2"
Cohesion: 0.12
Nodes (50): base(), advance(), audio(), chapterList(), chromePath(), content, currentStep(), enterGate() (+42 more)

### Community 3 - "Community 3"
Cohesion: 0.10
Nodes (41): devModeAllowed, devQuery(), BROWSERS, detectSheetDevice(), PLATFORMS, readSheetDevice(), SheetDevice, Delivery (+33 more)

### Community 4 - "Community 4"
Cohesion: 0.06
Nodes (42): @fontsource/inter, oxlint, react-dom, @types/node, @types/react, @types/react-dom, typescript, vite (+34 more)

### Community 5 - "Community 5"
Cohesion: 0.06
Nodes (40): runs-on, steps, timeout-minutes, concurrency, cancel-in-progress, group, defaults, run (+32 more)

### Community 6 - "Community 6"
Cohesion: 0.13
Nodes (32): ease(), glide(), SpiralGalaxy(), SpiralGalaxyHandle, BLUSH, buildCluster(), buildStars(), CORE (+24 more)

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (26): afterLetters, afterMemory, afterScratch, cake, cursor, explicit, explicitLoaded, filtered (+18 more)

### Community 8 - "Community 8"
Cohesion: 0.11
Nodes (27): allViewports, audit(), boxOf(), clips(), intersection(), scrolls(), unscrollableClip(), visibleBox() (+19 more)

### Community 9 - "Community 9"
Cohesion: 0.13
Nodes (22): decoded, delivered(), Fullscreen(), Gallery(), guideDone(), idleControl, markGuide(), Mode (+14 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (16): Boundary, BoundaryProps, BoundaryState, OPTIONS, collectCopyProblems(), isCopy(), Locale, LOCALE_KEY (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.12
Nodes (19): captionBlank(), flattenPhotos(), musicTrackProblem(), raw, RawContent, REQUIRED_CHAPTERS, validateContent(), Chapter (+11 more)

### Community 12 - "Community 12"
Cohesion: 0.21
Nodes (21): assertFacebook(), buildFilename(), collectFromDom(), ensurePanel(), extFromUrlOrType(), extractDate(), extractFbid(), gmFetchBinary() (+13 more)

### Community 13 - "Community 13"
Cohesion: 0.22
Nodes (19): clampToLength(), derivedUnlocked(), futureSession(), isStepId(), liveEraIds, liveIds(), livePhotoIds, migrateHistorical() (+11 more)

### Community 14 - "Community 14"
Cohesion: 0.10
Nodes (19): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+11 more)

### Community 15 - "Community 15"
Cohesion: 0.11
Nodes (18): if, runs-on, steps, BASE, HEAD, jobs, context, name (+10 more)

### Community 16 - "Community 16"
Cohesion: 0.24
Nodes (18): buildFilename(), collectFromDom(), ensurePanel(), extFromUrlOrType(), extractDate(), extractFbid(), fetchBinary(), fetchText() (+10 more)

### Community 17 - "Community 17"
Cohesion: 0.12
Nodes (16): description, name, runs, steps, using, id, name, run (+8 more)

### Community 18 - "Community 18"
Cohesion: 0.13
Nodes (8): playwright-core, playwright-core@^1.58.2, content, server, unlockAt, server, shotsArg, FLOW

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (16): birthSky, birthUp, blank, born, content, eraPhotos, finaleLater, future (+8 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (14): BUBBLE_SHAPES, clamp01(), ease(), hashOf(), HUES, Particle, quad(), sampleWords() (+6 more)

### Community 21 - "Community 21"
Cohesion: 0.12
Nodes (16): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+8 more)

### Community 22 - "Community 22"
Cohesion: 0.16
Nodes (6): chapters, problem, pool, raw, fakeSheet(), loadScript()

### Community 23 - "Community 23"
Cohesion: 0.20
Nodes (12): deckSeed(), Copy, buildMemoryDeck(), MEMORY_PAIR_COUNT, MemoryCard, MemoryPhotoInput, mulberry32(), parseMemorySeed() (+4 more)

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (12): LockScreen(), LockScreenProps, OdoDigit(), Reel(), Countdown, countdownParts(), isBeforeUnlock(), lockProblem() (+4 more)

### Community 25 - "Community 25"
Cohesion: 0.16
Nodes (14): clampHistorical(), FLOW_V1, FLOW_V2, FLOW_V3, FLOW_V4, FLOW_V5, FLOW_WITH_FRIENDS, FLOW_WITHOUT_FRIENDS (+6 more)

### Community 26 - "Community 26"
Cohesion: 0.19
Nodes (14): altAz(), clip(), Constellation, CONSTELLATION_IDS, gmstDegrees(), Horizontal, mod(), PlottedLine (+6 more)

### Community 27 - "Community 27"
Cohesion: 0.15
Nodes (13): sharp, dependencies, sharp@^0.33.5, description, engines, node, name, private (+5 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (11): fade, header, looped, musicDir, notes, pcm, photos, photosDir (+3 more)

### Community 29 - "Community 29"
Cohesion: 0.22
Nodes (10): JourneyMenu(), JourneyMenuProps, sceneCopy(), LanguageToggle(), StoryChapterLabel(), StepId, CHAPTER_BY_SCENE, chapterFor() (+2 more)

### Community 30 - "Community 30"
Cohesion: 0.23
Nodes (11): compressOne(), __dirname, ensureDir(), formatBytes(), IMAGE_EXT, INPUT, listImages(), main() (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.32
Nodes (7): FLOW_VERSION, emptyProgress(), isPlainObject(), loadProgress(), restartedProgress(), saveProgress(), useProgress()

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (7): buildCommand, framework, headers, installCommand, outputDirectory, rewrites, $schema

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (3): content, server, shotsArg

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (3): best, pickBestImageUrl(), unescapeJsonUrl()

### Community 35 - "Community 35"
Cohesion: 0.33
Nodes (5): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema

### Community 36 - "Community 36"
Cohesion: 0.40
Nodes (4): framework, headers, rewrites, $schema

### Community 38 - "Community 38"
Cohesion: 0.67
Nodes (4): unlock(), clampStep(), moveTo(), sameSteps()

## Knowledge Gaps
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `Community 0` to `Community 1`, `Community 4`, `Community 6`, `Community 9`, `Community 10`, `Community 20`, `Community 24`, `Community 29`, `Community 31`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05083996463306808 - nodes in this community are weakly interconnected._
- **Why does `FLOW` connect `Community 18` to `Community 33`, `Community 2`, `Community 1`, `Community 8`, `Community 11`, `Community 13`, `Community 19`, `Community 25`, `Community 29`?**
  _High betweenness centrality (0.032) - this node is a cross-community bridge._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06350877192982456 - nodes in this community are weakly interconnected._
- **Why does `useI18n()` connect `Community 0` to `Community 1`, `Community 6`, `Community 9`, `Community 10`, `Community 20`, `Community 24`, `Community 29`?**
  _High betweenness centrality (0.027) - this node is a cross-community bridge._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.11538461538461539 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.09595959595959595 - nodes in this community are weakly interconnected._