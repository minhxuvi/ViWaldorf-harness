import { WaldorfData, StoryScene } from "./types";

export function createScene(
  ord: number,
  title: string,
  summary: string,
  keywords: string[],
  artStyle: "wet-on-wet" | "crayon" | "chalkboard",
  imagePrompt: string
): StoryScene {
  return {
    id: `scene-${ord}-${Math.random().toString(36).substring(2, 9)}`,
    ord,
    title,
    summary,
    keywords,
    artStyle,
    imagePrompt,
    imageSourceLabel: "",
  };
}

export function getSeedData(): WaldorfData {
  const moneyStoryTextEn = `Long ago in a small village beside the Thu Bồn River, rice farmers, pottery makers from Thanh Hà, and bamboo weavers would exchange the fruits of their honest labor. Those with rice traded for earthen pots; those with bamboo baskets traded for crisp green vegetables.

One autumn morning, Master Carpenter from Kim Bồng spent three patient days carving a sturdy wooden bench. He hoped to trade it for lamp oil and sea salt, but the salt merchant had no need for a bench, and trading an entire bench for a single cup of salt was not fair to the artisan's craft.

The village elders and artisans gathered by the peaceful docks of Hội An. Together, they selected smooth white sea shells, and later minted round copper coins with square holes at their centers, strung together on hemp cords. A coin in itself could not be eaten, but it carried the solemn promise and shared trust of the whole community for the value of honest labor.

When the morning marketplace opened, merchants counted coins, added sums, and returned change transparently. Yet the gentle grandmother beside the river still reminded little Cloud: "Coins help us trade with justice, but trust, keeping our promises, and a gift crafted with our own hands remain the true treasures that no money can ever buy."`;

  const moneyStoryTextVi = `Xưa ở xóm nhỏ ven sông Thu Bồn, người trồng lúa, bác thợ gốm Thanh Hà và cô đan rổ tre thường mang phần mình làm ra sang biếu hoặc đổi cho nhau. Nhà có thóc đổi lấy nồi đất, nhà có rổ tre đổi lấy bó rau xanh tươi.

Một hôm, bác thợ mộc Kim Bồng đẽo suốt ba ngày mới xong chiếc ghế gỗ chắc chắn. Bác muốn đổi lấy ít muối và dầu thắp đèn, nhưng người có muối lại chưa cần ghế, còn đổi cả chiếc ghế lấy một bát muối thì không tương xứng với công sức.

Mọi người cùng ngồi lại bên bến thuyền Hội An, chọn những chiếc vỏ sò trắng nhẵn, rồi về sau đúc đồng xu tròn có lỗ vuông ở giữa để xâu thành từng chuỗi. Đồng xu tự nó không ăn được, nhưng giữ lời ước hẹn và niềm tin chung của cả cộng đồng về giá trị sức lao động.

Khi phiên chợ mở ra, người mua người bán đếm tiền, cộng giá và trả lại tiền thừa thật minh bạch. Nhưng bà cụ hiền hậu bên bến sông vẫn nhắc bé Mây và các cháu nhỏ: đồng tiền giúp ta trao đổi công bằng, còn lòng tin, lời giữ hẹn và món quà tự tay làm tặng bạn mới là kho báu không đồng xu nào mua được.`;

  const abrahamStoryTextEn = `In ancient days, Abraham lived with his family in the prosperous city of Ur beside the great river. One quiet night, he listened to the gentle voice within his heart and set out across the vast desert with his wife Sarah and nephew Lot, leading their flocks with faith toward a distant promised land.

As their sheep multiplied, the grazing hills became dry and scarce. The shepherds began to quarrel over limited cool springs and patches of grass, casting sadness over the wandering encampment.

Abraham gently called Lot forward. He proposed they should never let brotherly harmony be broken by land. He lovingly offered Lot the first choice: the fertile Jordan valley, while Abraham remained on the drier rugged hills.

That night, standing alone under a sea of desert stars, Abraham looked up into the quiet heavens. He remembered that peace in the family and faith in the journey were worth far more than the richest pastures.`;

  const cloudSeedTextEn = `Once upon a time in a tranquil riverside village, a little girl named Cloud loved listening to her grandmother tell stories.

One spring morning, her grandmother gave Cloud a tiny seed and whispered: "Plant this gently in the earth, water it each dawn, and wait with your whole heart."

Cloud planted the seed, watered it every day, and sang songs to the warm soil. One morning, the first tender green shoot uncurled into the sunlight.

When the plant grew tall and fragrant blossoms bloomed, Cloud brought the sweetest flower to her grandmother. Her grandmother smiled: "Patience and love turn the tiniest seed into beauty."`;

  const moneyScenes: StoryScene[] = [
    createScene(
      1,
      "Scene 1: Peaceful River Trade by Thu Bồn",
      "Farmers, Thanh Hà potters, and weavers sharing goods beside the river.",
      ["river", "pottery", "trade", "Thu Bồn"],
      "wet-on-wet",
      "Waldorf wet-on-wet watercolor painting of a serene Vietnamese river village beside Thu Bồn, warm ochre and leaf green washes, peaceful riverside market, soft edges, no outlines"
    ),
    createScene(
      2,
      "Scene 2: The Carpenter's Dilemma",
      "Master carpenter from Kim Bồng crafts a bench but cannot easily trade for salt.",
      ["carpenter", "wood", "salt", "bench"],
      "crayon",
      "Waldorf crayon drawing on cream paper, warm golden amber and rich earth tones, a wooden bench under a tropical banyan tree, broad textured strokes"
    ),
    createScene(
      3,
      "Scene 3: Sea Shells and Copper Coins of Hội An",
      "Artisans gathering by the lantern-lit docks of Hội An, stringing shells and minted coins.",
      ["Hội An", "shells", "coins", "trust"],
      "chalkboard",
      "Waldorf teacher chalkboard drawing on dark slate, luminous pastel colors, soft glowing golden light of lantern reflections on river water, traditional round coins with square holes"
    ),
    createScene(
      4,
      "Scene 4: The True Treasure",
      "Grandmother reminding little Cloud that honest trust is a treasure money cannot buy.",
      ["grandmother", "trust", "love", "Cloud"],
      "wet-on-wet",
      "Waldorf watercolor illustration of an elderly Vietnamese grandmother smiling beside a young girl, warm golden sunset glow, soft gentle rose and amber hues"
    ),
  ];

  const abrahamScenes: StoryScene[] = [
    createScene(
      1,
      "Scene 1: Leaving the City of Ur",
      "Journeying across the golden desert dunes under the wide morning sky.",
      ["desert", "journey", "Ur", "faith"],
      "crayon",
      "Waldorf crayon art of desert caravan, soft golden dunes, warm peach sky, gentle silhouetted camels"
    ),
    createScene(
      2,
      "Scene 2: Peace Over Pasture",
      "Abraham graciously offers Lot the fertile green valley to keep brotherhood intact.",
      ["peace", "Jordan", "generosity"],
      "wet-on-wet",
      "Waldorf wet-on-wet watercolor of green river valley meeting warm desert hills, flowing blended tones"
    ),
    createScene(
      3,
      "Scene 3: Under the Desert Stars",
      "Abraham standing under the infinite canopy of radiant desert stars.",
      ["stars", "night", "sky", "faith"],
      "chalkboard",
      "Waldorf chalkboard pastel drawing of deep indigo slate night sky with countless luminous radiant golden stars"
    ),
  ];

  const cloudScenes: StoryScene[] = [
    createScene(
      1,
      "Scene 1: The Grandmother's Seed",
      "Grandmother gifting Cloud a tiny brown seed of patience.",
      ["seed", "spring", "garden"],
      "wet-on-wet",
      "Soft watercolor washes of warm lemon yellow and gentle rose, a seed nestled in soil"
    ),
    createScene(
      2,
      "Scene 2: Singing to the Earth",
      "Cloud singing quietly to the soil as a tender green shoot appears.",
      ["shoot", "singing", "morning"],
      "crayon",
      "Beeswax crayon strokes showing a bright green seedling emerging from warm brown earth"
    ),
    createScene(
      3,
      "Scene 3: The Fragrant Flower",
      "A radiant fragrant blossom offered with a smile.",
      ["flower", "patience", "smile"],
      "chalkboard",
      "Pastel drawing on slate of a glowing blossom with soft yellow light"
    ),
  ];

  // Timetable entries: Mon (2) to Fri (6)
  const timetable = [];
  for (let day = 2; day <= 6; day++) {
    timetable.push(
      {
        id: `tt-${day}-1`,
        day,
        startMinutes: 480, // 08:00
        endMinutes: 600, // 10:00 (120m)
        title: "Main Lesson: Storytelling & Writing",
        teacher: "Teacher Lan",
        objective: "Listen, absorb, illustrate, and write the story",
        kind: "hoc" as const,
      },
      {
        id: `tt-${day}-2`,
        day,
        startMinutes: 600, // 10:00
        endMinutes: 660, // 11:00 (60m)
        title: "Morning Snack & Free Outdoor Play",
        teacher: "Community",
        objective: "Nutritious snack, free sensory movement, and rhythm",
        kind: "sinh-hoat" as const,
      },
      {
        id: `tt-${day}-3`,
        day,
        startMinutes: 660, // 11:00
        endMinutes: 780, // 13:00 (120m)
        title: "Artistic Expression: Watercolor & Beeswax",
        teacher: "Teacher Lan",
        objective: "Color experience through Wet-on-Wet & Crayon techniques",
        kind: "hoc" as const,
      },
      {
        id: `tt-${day}-4`,
        day,
        startMinutes: 780, // 13:00
        endMinutes: 900, // 15:00 (120m)
        title: "Nature Rhythm & Closing Circle",
        teacher: "Class Team",
        objective: "Garden care, songs, reflective verse, and day closing",
        kind: "sinh-hoat" as const,
      }
    );
  }

  return {
    programPhilosophy:
      "Waldorf-inspired education rooted in Vietnam: natural rhythm, spoken storytelling, living arts, and honoring child development. (Illustrative model — not state GDPT or international Waldorf certification).",
    programGoals:
      "Nurture imaginative wonder, rich storytelling language, practical confidence, emotional empathy, and communal reverence.",
    gradeLevel: "Grade 3",
    ageRange: "8–9 years old",
    students: [
      { id: "student-1", name: "An (Illustrative)", birthYear: 2017, className: "Grade 3", illustrative: true },
      { id: "student-2", name: "Bình (Illustrative)", birthYear: 2017, className: "Grade 3", illustrative: true },
      { id: "student-3", name: "Mây (Illustrative)", birthYear: 2017, className: "Grade 3", illustrative: true },
    ],
    stories: [
      {
        id: "story-hoian-money",
        title: "The Sea Shells and Copper Coins of Hội An (Block 11 — Trade & Trust)",
        titleVi: "Vỏ sò và đồng xu bên bến Hội An (Khối 11 — Tiền tệ)",
        sourceText: moneyStoryTextEn,
        sourceTextVi: moneyStoryTextVi,
        sourceInfo: "Grade 3 Block 11 Curriculum (Money & Trade, post-autumn break) rooted in Central Vietnam heritage",
        ageRange: "8–9",
        goal: "Narrate the progression from barter to shells and coins, concluding with trust as the unbuyable treasure",
        defaultArtStyle: "wet-on-wet",
        scenes: moneyScenes,
      },
      {
        id: "story-abraham-stars",
        title: "Abraham and the Desert Stars (Block 10–11 Journey)",
        titleVi: "Abraham và bầu trời sao (Mạch Khối 10–11)",
        sourceText: abrahamStoryTextEn,
        sourceInfo: "Grade 3 Old Testament narrative: Journey, generous pasture choice, and faith under the stars",
        ageRange: "8–9",
        goal: "Cultivate steady calm pacing, desert imagery, and peaceful resolution over disputed land",
        defaultArtStyle: "chalkboard",
        scenes: abrahamScenes,
      },
      {
        id: "story-cloud-seed",
        title: "Cloud's Seed of Patience",
        titleVi: "Hạt giống của Mây (minh họa)",
        sourceText: cloudSeedTextEn,
        sourceInfo: "Gentle nature allegory on patience, seasonal care, and loving dedication",
        ageRange: "6–9",
        goal: "Warm imagery of gentle growth, singing to seeds, and blooming beauty",
        defaultArtStyle: "crayon",
        scenes: cloudScenes,
      },
    ],
    attempts: [],
    timetable,
    yearThemes: [
      "Autumn: Seed, Patience & Harvest Rhythms",
      "Late Autumn (Block 11): Money, Measurement & Communal Trust",
      "Winter: Inner Light, Kindling Warmth & Lantern Walk",
      "Spring: Rebirth, Green Shoots & Traditional New Year (Tết)",
    ],
    dialectRules: [
      {
        id: "rule-1",
        rawPhrase: "giỏ sò",
        correctedPhrase: "vỏ sò",
        regionNote: "Central / Quảng Nam & Southern dialect (v → d/gi)",
        occurrences: 2,
        updatedAt: "2026-11-04",
      },
      {
        id: "rule-2",
        rawPhrase: "đồng su",
        correctedPhrase: "đồng xu",
        regionNote: "Northern & Central dialect (x → s)",
        occurrences: 1,
        updatedAt: "2026-11-04",
      },
      {
        id: "rule-3",
        rawPhrase: "cấy lúa",
        correctedPhrase: "cấy lúa",
        regionNote: "Agricultural folklore term (planting seedlings)",
        occurrences: 1,
        updatedAt: "2026-11-04",
      },
    ],
    journalEntries: [
      {
        id: "journal-1",
        date: "2026-11-04",
        contentDelivered: "Introduction to The Sea Shells and Copper Coins of Hội An with Wet-on-Wet painting",
        attendanceNote: "3/3 illustrative students present",
        observationNote: "Children listened with wide eyes to the story of the Thu Bồn river trade. Eagerly painted soft golden and blue river reflections.",
        assignmentNote: "Ask grandparents about traditional village market days",
        artifactNote: "Wet-on-Wet watercolor paintings (warm yellow and Prussian blue)",
        periodicReportNote: "Spoken language recall showed strong engagement with rhythm and natural breath pauses",
      },
    ],
  };
}
