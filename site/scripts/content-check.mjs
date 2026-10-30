import assert from "node:assert/strict";
import { content, validateContent } from "../src/content.ts";

const problem = validateContent(content);
assert.equal(problem, null);
assert.equal(content.startDate, "2026-07-01T00:00:00+07:00");
assert.equal(content.firstMeeting, null);
assert.equal(content.birth.when, "2002-11-18T16:45:00+07:00");
assert.equal(content.birth.timeConfirmed, true);

// Memory deck must remain playable after Galaxy assets change.
assert.equal(content.memoryPhotoIds.length, 6);
assert.equal(new Set(content.memoryPhotoIds).size, 6);
assert.deepEqual(content.photos.filter((photo) => photo.pair).map((photo) => photo.id), content.eras.flatMap((era) => era.photos).filter((photo) => content.memoryPhotoIds.includes(photo.id)).map((photo) => photo.id));

const chapters = [
  {
    "id": "g-childhood",
    "title": {
      "vi": "Em hồi bé",
      "en": "Little you"
    },
    "kind": "her-life",
    "color": "#c5dff5",
    "count": 1,
    "caption": {
      "vi": "Tóc buộc hai bên, nhìn máy ảnh rất nghiêm túc. Hồi bé em có hay nghịch không? Hôm nào kể anh nghe nhé.",
      "en": "Pigtails and such a serious look at the camera. Were you mischievous as a kid? Tell me sometime."
    }
  },
  {
    "id": "g-selfies",
    "title": {
      "vi": "Mấy tấm selfie",
      "en": "Your selfies"
    },
    "kind": "together",
    "color": "#e8c98a",
    "count": 7,
    "caption": {
      "vi": "Anh định chọn vài tấm thôi, mà cứ chọn xong lại muốn giữ thêm. Em thấy anh hơi tham cũng đúng.",
      "en": "I meant to pick just a few, but I keep wanting to save more. Fair to say I am a little greedy."
    }
  },
  {
    "id": "g-flowers",
    "title": {
      "vi": "Em và hoa",
      "en": "You and flowers"
    },
    "kind": "together",
    "color": "#c5dfc8",
    "count": 5,
    "caption": {
      "vi": "Hoa giấy hay những bó hoa em ôm, tấm nào anh cũng muốn giữ. Lần sau em thích được tặng hoa gì?",
      "en": "Bougainvillea or the bouquets in your arms, I want to keep every photo. What flowers would you like next time?"
    }
  },
  {
    "id": "g-streets",
    "title": {
      "vi": "Em đi phố",
      "en": "Out and about"
    },
    "kind": "together",
    "color": "#f4b4cf",
    "count": 6,
    "caption": {
      "vi": "Một góc cầu thang, một kệ sách, một con phố. Hôm nào mình đi bộ, thấy góc nào thích thì dừng lại chụp nhé.",
      "en": "A staircase, a bookshelf, a street. Next time we take a walk, let us stop for a photo wherever you like."
    }
  },
  {
    "id": "g-camera",
    "title": {
      "vi": "Đang chụp gì đấy?",
      "en": "What are you photographing?"
    },
    "kind": "together",
    "color": "#c5dff5",
    "count": 12,
    "caption": {
      "vi": "Áo trắng, cây xanh và chiếc máy ảnh nhỏ. Anh thích bộ này. Còn em đang ngắm chụp gì, kể anh nghe với.",
      "en": "A white shirt, green trees and a little camera. I like this set. Tell me what you were framing."
    }
  },
  {
    "id": "g-red-flags",
    "title": {
      "vi": "Em với cờ đỏ",
      "en": "You with the red flags"
    },
    "kind": "together",
    "color": "#e8c98a",
    "count": 45,
    "caption": {
      "vi": "Áo dài trắng với khăn đỏ, nhìn em nổi bật thật. Cả bộ 45 tấm, bảo anh chọn ít thôi thì hơi khó.",
      "en": "You really stand out in that white ao dai and red scarf. With 45 photos, picking just a few is hard."
    }
  },
  {
    "id": "g-travels",
    "title": {
      "vi": "Những chuyến đi của em",
      "en": "Your travels"
    },
    "kind": "together",
    "color": "#c5dfc8",
    "count": 14,
    "caption": {
      "vi": "Anh xem cảnh một lúc lại quay sang nhìn em. Mong sau này có thêm ảnh chuyến châu Âu hai đứa vẫn nhắc đến.",
      "en": "I look at the scenery, then back at you. I hope we add photos from that Europe trip we keep talking about."
    }
  },
  {
    "id": "g-white-dress",
    "title": {
      "vi": "Em dưới cổng xanh",
      "en": "Under the green arch"
    },
    "kind": "together",
    "color": "#f4b4cf",
    "count": 8,
    "caption": {
      "vi": "Váy trắng, cổng xanh, những mái ngói đỏ. Anh thích bộ này. Hôm nào em kể anh nghe về chỗ này nhé.",
      "en": "A white dress, a green arch, red tiled roofs. I like this set. Tell me about this place sometime."
    }
  },
  {
    "id": "g-birthdays",
    "title": {
      "vi": "Những mùa sinh nhật",
      "en": "Birthday moments"
    },
    "kind": "together",
    "color": "#c5dff5",
    "count": 8,
    "caption": {
      "vi": "Anh gom mấy tấm sinh nhật để em xem lại. Đến tuổi 24, anh muốn góp thêm một món quà của mình.",
      "en": "I gathered these birthday photos for you to revisit. For your 24th, I want to add a gift of my own."
    }
  },
  {
    "id": "g-together",
    "title": {
      "vi": "Có cả hai đứa",
      "en": "Both of us"
    },
    "kind": "together",
    "color": "#e8c98a",
    "count": 2,
    "caption": {
      "vi": "Một tấm bên hồ, một tấm nắm tay. Mới có hai ảnh thôi, mình chụp thêm dần nhé.",
      "en": "One by the lake, one holding hands. Just two photos so far. Let us keep adding more."
    }
  },
  {
    "id": "g-cafes",
    "title": {
      "vi": "Em chọn quán nhé",
      "en": "You pick the place"
    },
    "kind": "together",
    "color": "#c5dfc8",
    "count": 41,
    "caption": {
      "vi": "Xem ảnh xong anh lại muốn rủ em đi ăn. Em chọn quán nhé, món thì cho anh góp ý với.",
      "en": "These photos make me want to take you out for food. You pick the place, but let me help choose the dishes."
    }
  },
  {
    "id": "g-christmas",
    "title": {
      "vi": "Mấy mùa Giáng sinh",
      "en": "Christmas moments"
    },
    "kind": "together",
    "color": "#f4b4cf",
    "count": 7,
    "caption": {
      "vi": "Có tấm em ôm quà, có tấm ôm gấu bông. Giáng sinh năm nay, cho anh xin một chỗ cạnh em trong ảnh nhé.",
      "en": "In one you hug a gift, in another a teddy bear. Save me a spot beside you in this year’s Christmas photos."
    }
  },
  {
    "id": "g-creative",
    "title": {
      "vi": "Thử một kiểu khác",
      "en": "Trying another look"
    },
    "kind": "together",
    "color": "#c5dff5",
    "count": 6,
    "caption": {
      "vi": "Mấy phiên bản ảnh thử anh để riêng ở đây. Có kiểu nào em muốn chụp ngoài đời không? Mình chọn thử một kiểu nhé.",
      "en": "I kept these creative versions separate. Is there a look you want to photograph in real life? Let us pick one."
    }
  }
];

assert.equal(content.eras.length, chapters.length);
assert.equal(content.galleryCopy.eraProgress.vi, "Chương {n}/{total} · ảnh {photo}/{photos}");
assert.equal(content.galleryCopy.eraProgress.en, "Chapter {n} of {total} · photo {photo}/{photos}");
assert.equal(content.galleryCopy.nextEra.vi, "Chương tiếp theo");
assert.equal(content.galleryCopy.nextEra.en, "Next chapter");
assert.equal(content.galleryCopy.empty.vi, "Hết chương này rồi.");
assert.equal(content.galleryCopy.empty.en, "That's the end of this chapter.");

let photos = 0;
for (const [index, era] of content.eras.entries()) {
  const expect = chapters[index];
  assert.equal(era.id, expect.id);
  assert.deepEqual(era.title, expect.title);
  assert.equal(era.kind, expect.kind);
  assert.equal(era.color, expect.color);
  assert.equal(era.date, undefined);
  assert.equal(era.photos.length, expect.count);
  era.photos.forEach((photo, photoIndex) => {
    photos += 1;
    assert.equal(photo.date, undefined);
    assert.match(photo.src, /^lilj\/galaxy-v3\/[a-z0-9-]+\/[a-z0-9-]+$/);
    assert.equal(photo.compliment.vi, "Anh muốn giữ tấm này để sau này còn xem lại.");
    assert.equal(photo.compliment.en, "I want to keep this one to look back on.");
    if (photoIndex === 0) assert.deepEqual(photo.caption, expect.caption);
    else assert.deepEqual(photo.caption, { vi: "", en: "" });
  });
}
assert.equal(photos, 162);

console.log("content-check ok");
