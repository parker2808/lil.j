# Story V2 acceptance

The live path is 15 scenes in five chapters. Lock is before the path and is not a scene. `friends` stays off the path. The seven stars stay an animation.

| Chapter | Scenes |
| --- | --- |
| I Một vũ trụ mang tên em | gate, sky, birth |
| II Những điều anh nhớ | gallery, memory, quiz, scratch |
| III Từ ngày có hai đứa mình | counter, dreams, letters |
| IV Ngày đặc biệt của em | cake, wish |
| V Còn nhiều điều phía trước | envelope, finale, letter |

## Matrix

| Area | What is checked |
| --- | --- |
| Flow | One full play from the gate to the letter, then one play that skips memory, scratch, letters, and the finale. |
| Migration | A v3 memory save opens memory. A v3 cake save does not grant memory. A future version is not overwritten. A JSON array becomes an empty v4 save. Reload does not move a migrated save. |
| Interactions | Quiz answers every question, including a wrong one. Gallery completes one era. Wish can be sent or kept private. Envelope opens the invitation. The letter has no Next. |
| Lock | Before 18 November 2026 00:00 UTC+7 the countdown shows. At that instant, and after it, the gate shows. |
| VI / EN | A visit with no saved language starts in Vietnamese. A saved English choice stays. |
| A11y | The journey menu focuses the current scene, closes on Escape, and returns focus. It does not grant scenes. |
| Audio | Unmute on the cake is still unmuted on the wish and the envelope. |
| Storage | Reloading the finished letter twice keeps the same step. |
| Layout | 320×568, 390×844, 430×932, 430×739, 844×390 landscape, and 1280×800 desktop do not scroll sideways on the letter. |

`npm run overlap` covers the same phone, tablet, and desktop sizes, both languages, dev on and off, and pending and done scenes.

## Facts still open

Parker has not said which photos are `her-life` or `first-meeting`, so every era stays `together`. Captions for the 39 photos are empty. Photo dates are unset. The date invitation has no time and no place.

## Results

`npm run story-v2-check` on this branch, against the production preview:

| Check | Result |
| --- | --- |
| Migration | A v3 memory save opens memory and keeps `memoryBest`. A v3 cake save does not grant memory. A future version stays in storage. A JSON array becomes an empty v4 save. Two reloads leave the migrated save in place. |
| VI / EN | No saved language starts in Vietnamese. A saved English choice stays. |
| Flow | One full play runs from the gate to the letter. Two reloads stay on the letter. One play skips memory, scratch, letters, and the finale without writing `memoryBest`, `scratched`, `openWhen`, or `saidYes`. |
| Interactions | The quiz is answered, including a wrong answer. One gallery era is completed. A wish is sent on the full play and kept private on the skip play, with no sent line. The envelope opens with no RSVP button. The letter shows 18.11.2026, the signature Parker, and no Next. |
| Lock | Before 18 November 2026 00:00 UTC+7 the countdown shows. At that instant, and one minute after, the gate shows. |
| A11y | The journey menu focuses the current scene, Escape returns focus to Hành trình, and `accessibleSteps` is unchanged. |
| Audio | Unmute on the cake is still unmuted on the wish and the envelope. |
| Layout | 320×568, 390×844, 430×932, 430×739, 844×390, and 1280×800 do not scroll sideways on the finished letter. |

`npm run overlap` is recorded with this branch's run.
