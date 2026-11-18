import {
  AncientBookItem,
  SceneLevelPaths,
  StoryBookMeta,
  StoryIllustration,
  StoryScene,
  StorySoulContext,
  WaldorfArtStyle,
  WaldorfData,
  WaldorfStory,
} from "./types";
import { Language } from "./i18n";
import {
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_REPO_URL,
  GENESIS_STORY_ID,
} from "./repoStoryLoader";

interface SeedBookConfig {
  id: string;
  number: number;
  slug: string;
  title: Record<Language, string>;
  subtitle: Record<Language, string>;
  isEpilogue: boolean;
  illustrationStyle: string;
  totalChapters: number;
  fileSlug: string;
}

const GENESIS_BOOK_CONFIGS: SeedBookConfig[] = [
  {
    id: "quyen-1",
    number: 1,
    slug: "quyen-1-khoi-nguyen-va-anh-sang",
    title: {
      vi: "Quyển I: Khởi Nguyên Và Ánh Sáng Đầu Tiên",
      en: "Book I: In the Beginning and the First Light",
      zh: "第一卷：创世之初与最初的光明",
    },
    subtitle: {
      vi: "Từ Sáng Thế Đến Đại Hồng Thủy (theo And There Was Light)",
      en: "From Creation to the Great Flood (after And There Was Light)",
      zh: "从创世到大洪水（参考《光之初现》）",
    },
    isEpilogue: false,
    illustrationStyle: "charcoal_and_golden_ochre_chalk_pastel",
    totalChapters: 67,
    fileSlug: "book-1-genesis-and-light.md",
  },
  {
    id: "quyen-2",
    number: 2,
    slug: "quyen-2-hanh-trinh-ve-dat-hua",
    title: {
      vi: "Quyển II: Hành Trình Về Đất Hứa",
      en: "Book II: Journey to the Promised Land",
      zh: "第二卷：前往应许之地的旅程",
    },
    subtitle: {
      vi: "Từ Tháp Babel & Abraham Đến Giấc Mơ Vua David (theo Journey to the Promised Land)",
      en: "From the Tower of Babel & Abraham to King David's Dream (after Journey to the Promised Land)",
      zh: "从巴别塔与亚伯拉罕到大卫王之梦（参考《前往应许之地》）",
    },
    isEpilogue: false,
    illustrationStyle: "monochrome_sepia_watercolor_and_pencil_oval_vignette",
    totalChapters: 56,
    fileSlug: "book-2-journey-to-the-promised-land.md",
  },
  {
    id: "quyen-3",
    number: 3,
    slug: "quyen-3-chung-ta-se-xay-mot-den-tho",
    title: {
      vi: "Quyển III: Chúng Ta Sẽ Xây Một Đền Thờ",
      en: "Book III: We Will Build a Temple",
      zh: "第三卷：我们将建造一座圣殿",
    },
    subtitle: {
      vi: "Từ Vua Solomon Đến Judas Maccabeus (theo We Will Build a Temple)",
      en: "From King Solomon to Judas Maccabeus (after We Will Build a Temple)",
      zh: "从所罗门王到犹大·马加比（参考《我们将建造一座圣殿》）",
    },
    isEpilogue: false,
    illustrationStyle: "monochrome_sepia_watercolor_and_pencil_oval_vignette",
    totalChapters: 32,
    fileSlug: "book-3-we-will-build-a-temple.md",
  },
  {
    id: "quyen-4",
    number: 4,
    slug: "quyen-4-hai-dua-tre-giang-sinh",
    title: {
      vi: "Quyển IV: Hai Đứa Trẻ Giáng Sinh Và Bình Minh Bên Sông Jordan",
      en: "Book IV: The Two Christmas Children and Dawn on the Jordan",
      zh: "第四卷：两个圣诞孩童与约旦河畔的黎明",
    },
    subtitle: {
      vi: "Hai Dòng Dõi Tại Nazareth Và John Người Làm Phép Rửa",
      en: "Two Lineages in Nazareth and John the Baptist",
      zh: "拿撒勒的两支血脉与施洗约翰",
    },
    isEpilogue: false,
    illustrationStyle: "monochrome_sepia_watercolor_and_pencil_oval_vignette",
    totalChapters: 15,
    fileSlug: "book-4-the-two-christmas-children.md",
  },
  {
    id: "quyen-5",
    number: 5,
    slug: "quyen-5-ngoai-truyen-ong-gia-noel",
    title: {
      vi: "Quyển V (Ngoại Truyện): Hạt Giống Yêu Thương Đêm Đông",
      en: "Book V (Epilogue): Seeds of Love in the Winter Night",
      zh: "第五卷（外传）：冬夜里爱的种子",
    },
    subtitle: {
      vi: "Từ Thánh Nicholas Thành Myra Đến Ông Già Noel",
      en: "From Saint Nicholas of Myra to Santa Claus",
      zh: "从米拉城的圣尼古拉到圣诞老人",
    },
    isEpilogue: true,
    illustrationStyle: "monochrome_sepia_watercolor_and_pencil_oval_vignette",
    totalChapters: 10,
    fileSlug: "book-5-epilogue-saint-nicholas.md",
  },
];

function buildBooksForLang(lang: Language): StoryBookMeta[] {
  return GENESIS_BOOK_CONFIGS.map((cfg) => ({
    id: cfg.id,
    number: cfg.number,
    slug: cfg.slug,
    title: cfg.title[lang],
    subtitle: cfg.subtitle[lang],
    isEpilogue: cfg.isEpilogue,
    illustrationStyle: cfg.illustrationStyle,
    totalChapters: cfg.totalChapters,
    level0File: `locales/${lang}/level-0-context/${cfg.fileSlug}`,
    level1File: `locales/${lang}/level-1-full-text/${cfg.fileSlug}`,
    level2File: `locales/${lang}/level-2-detailed-outline/${cfg.fileSlug}`,
  }));
}

interface SeedAncientBookConfig {
  id: string;
  category: "cuu-uoc" | "tan-uoc" | "co-thu";
  fileName: string;
  title: Record<Language, string>;
}

const GENESIS_ANCIENT_BOOK_CONFIGS: SeedAncientBookConfig[] = [
  { id: "sach-sang-the", category: "cuu-uoc", fileName: "book-of-genesis.md", title: { vi: "Sách Sáng Thế", en: "Book of Genesis", zh: "创世记" } },
  { id: "sach-xuat-hanh", category: "cuu-uoc", fileName: "book-of-exodus.md", title: { vi: "Sách Xuất Hành", en: "Book of Exodus", zh: "出埃及记" } },
  { id: "sach-dan-so", category: "cuu-uoc", fileName: "book-of-numbers.md", title: { vi: "Sách Dân Số", en: "Book of Numbers", zh: "民数记" } },
  { id: "sach-phuc-truyen-luat-le-ky", category: "cuu-uoc", fileName: "book-of-deuteronomy.md", title: { vi: "Sách Phục Truyền Luật Lệ Ký", en: "Book of Deuteronomy", zh: "申命记" } },
  { id: "sach-gio-sue", category: "cuu-uoc", fileName: "book-of-joshua.md", title: { vi: "Sách Giô-suê", en: "Book of Joshua", zh: "约书亚记" } },
  { id: "sach-sa-mu-en", category: "cuu-uoc", fileName: "book-of-samuel.md", title: { vi: "Sách Sa-mu-en", en: "Books of Samuel", zh: "撒母耳记" } },
  { id: "sach-cac-vua", category: "cuu-uoc", fileName: "book-of-kings.md", title: { vi: "Sách Các Vua", en: "Books of Kings", zh: "列王纪" } },
  { id: "sach-to-bit", category: "cuu-uoc", fileName: "book-of-tobit.md", title: { vi: "Sách Tô-bít", en: "Book of Tobit", zh: "多比传" } },
  { id: "sach-i-sai-a", category: "cuu-uoc", fileName: "book-of-isaiah.md", title: { vi: "Sách Tiên Tri I-sai-a", en: "Book of the Prophet Isaiah", zh: "以赛亚书" } },
  { id: "sach-gie-re-mi-a", category: "cuu-uoc", fileName: "book-of-jeremiah.md", title: { vi: "Sách Tiên Tri Giê-rê-mi-a", en: "Book of the Prophet Jeremiah", zh: "耶利米书" } },
  { id: "sach-da-ni-en", category: "cuu-uoc", fileName: "book-of-daniel.md", title: { vi: "Sách Tiên Tri Đa-ni-en", en: "Book of the Prophet Daniel", zh: "但以理书" } },
  { id: "sach-gio-na", category: "cuu-uoc", fileName: "book-of-jonah.md", title: { vi: "Sách Tiên Tri Giô-na", en: "Book of the Prophet Jonah", zh: "约拿书" } },
  { id: "sach-ne-he-mi-a", category: "cuu-uoc", fileName: "book-of-nehemiah.md", title: { vi: "Sách Nê-hê-mi-a", en: "Book of Nehemiah", zh: "尼希米记" } },
  { id: "sach-giop", category: "cuu-uoc", fileName: "book-of-job.md", title: { vi: "Sách Gióp", en: "Book of Job", zh: "约伯记" } },
  { id: "sach-ma-ca-be", category: "cuu-uoc", fileName: "book-of-maccabees.md", title: { vi: "Sách Ma-ca-bê", en: "Books of Maccabees", zh: "马加比书" } },
  { id: "tin-mung-ma-thi-o", category: "tan-uoc", fileName: "gospel-of-matthew.md", title: { vi: "Sách Tin Mừng Theo Ma-thi-ơ", en: "Gospel According to Matthew", zh: "马太福音" } },
  { id: "tin-mung-lu-ca", category: "tan-uoc", fileName: "gospel-of-luke.md", title: { vi: "Sách Tin Mừng Theo Lu-ca", en: "Gospel According to Luke", zh: "路加福音" } },
  { id: "tin-mung-ma-ko", category: "tan-uoc", fileName: "gospel-of-mark.md", title: { vi: "Sách Tin Mừng Theo Ma-kô", en: "Gospel According to Mark", zh: "马可福音" } },
  { id: "sach-khai-huyen-va-khoi-nguyen-co", category: "co-thu", fileName: "revelation-and-ancient-genesis.md", title: { vi: "Sách Khải Huyền Và Cổ Thư Khởi Nguyên", en: "Book of Revelation and Ancient Creation Writings", zh: "启示录与上古创世文献" } },
  { id: "co-thu-tu-nhien-buoi-dau", category: "co-thu", fileName: "early-nature-legends.md", title: { vi: "Cổ Thư Tự Nhiên Buổi Đầu", en: "Early Nature Legends", zh: "上古自然神话选编" } },
  { id: "sach-cuoc-doi-adam-va-eve", category: "co-thu", fileName: "life-of-adam-and-eve.md", title: { vi: "Sách Cuộc Đời Adam Và Eve", en: "The Life of Adam and Eve", zh: "亚当与夏娃生平书" } },
  { id: "sach-e-noc", category: "co-thu", fileName: "book-of-enoch.md", title: { vi: "Sách Ê-nóc", en: "The Book of Enoch", zh: "以诺书" } },
  { id: "co-su-luong-ha-va-ai-cap", category: "co-thu", fileName: "mesopotamia-and-egypt-chronicles.md", title: { vi: "Cổ Sử Lưỡng Hà Và Ai Cập", en: "Ancient Chronicles of Mesopotamia and Egypt", zh: "古代美索不达米亚与埃及史略" } },
  { id: "co-truyen-nazareth-va-bien-chet", category: "co-thu", fileName: "nazareth-and-dead-sea-traditions.md", title: { vi: "Cổ Truyền Nazareth Và Cộng Đồng Biển Chết", en: "Ancient Traditions of Nazareth and the Dead Sea Community", zh: "拿撒勒古传与死海社区文献" } },
  { id: "su-truyen-thanh-nicholas", category: "co-thu", fileName: "legend-of-saint-nicholas.md", title: { vi: "Sử Truyền Thánh Nicholas Thành Myra Và Huyền Thoại Mùa Đông", en: "Chronicles of Saint Nicholas of Myra and Winter Legends", zh: "米拉城圣尼古拉传记与冬日传说" } },
];

function buildAncientBooksForLang(lang: Language): AncientBookItem[] {
  return GENESIS_ANCIENT_BOOK_CONFIGS.map((ab) => ({
    id: ab.id,
    title: ab.title[lang],
    category: ab.category,
    file: `locales/${lang}/level-0-context/ancient-texts/${ab.fileName}`,
  }));
}

const SEED_BOOK_SOULS: Record<string, StorySoulContext> = {
  "quyen-1": {
    culturalSpirit:
      "Quyển I đưa người nghe trở về thời đại huyền thoại sơ khai nhất: thuở thế giới chưa phải là khối vật chất lạnh lẽo mà là một công trình đang thở của Ánh Sáng và Âm Nhạc, nối từ bình minh Sáng Thế qua Vườn Địa Đàng, Cain–Abel–Seth, Enoch tới Con Tàu Noah và Cầu Vồng Giao Ước.",
    storytellingRhythm:
      "• Giọng mở màn (Chương 1–6): Vang, rộng, tròn hơi theo điệp khúc sáng tạo.\n• Giọng giàu chất thơ tự nhiên (Chương 7–17): Mềm mại khi kể về hoa nhung tuyết, nụ hồng và Vườn Địa Đàng.\n• Giọng ấm áp đời thường pha kịch tính (Chương 18–45): Jabal, Jubal, Thubal-Cain và Enoch.\n• Nhịp sóng nước (Chương 46–67): Náo nức đóng tàu, dồn dập mưa bão 40 ngày và lặng ngắt thanh bình dưới cầu vồng.",
    ageMetaphor:
      "• Điểm chạm: Sức mạnh thật sự nằm ở đôi tay biết xây dựng (Jabal), tiếng đàn cảm hóa thú dữ (Jubal), lòng dũng cảm nói sự thật (Enoch) và sự trung tín của Noah.\n• Ẩn dụ cốt lõi: Con người đứng giữa sáng và tối như bông hoa: bằng đóa hoa nó mở ra đón ánh sáng, và bằng bộ rễ nó bám giữ đất tối để đứng thẳng lên.",
    pronunciations: [
      { term: "Michael", pronunciation: "Mi-kha-en", meaning: "Tổng lãnh thiên thần cầm gươm ánh sáng đẩy lùi Con Rồng (Chương 1–2)" },
      { term: "Adam – Eve", pronunciation: "A-đam – Ê-va", meaning: "Hai con người đầu tiên trong Vườn Địa Đàng và trên mặt đất (Chương 13–26)" },
      { term: "Enoch", pronunciation: "Ê-nóc", meaning: "Vị thánh áo trắng tìm lại Sách Sự Sống và thăng thiên (Chương 40–45)" },
      { term: "Noah", pronunciation: "Nô-a", meaning: "Người đóng Con Tàu gỗ tuyết tùng vượt Đại Hồng Thủy (Chương 48–67)" },
    ],
  },
  "quyen-2": {
    culturalSpirit:
      "Sau cơn Đại Hồng Thủy, loài người tụ tập quanh vua Nimrod xây Tháp Babel. Khi ngôn ngữ chia rẽ, lịch sử bước sang hành trình của một dòng tộc lữ hành rời bỏ thành phố tường cao để sống dưới mái lều giữa sa mạc, ngước nhìn các vì sao và lắng nghe tiếng gọi bên trong lương tâm.",
    storytellingRhythm:
      "• Nhịp lữ hành chậm mà vững (Chương 1–17): Nhịp chân lạc đà giữa thảo nguyên và giấc mơ Thang Trời tại Beth-El.\n• Nhịp chuyển biến tâm lý sâu sắc (Chương 18–24): Hành trình Joseph từ chiếc áo ngũ sắc tới cuộc đoàn tụ nước mắt.\n• Nhịp sử thi hùng tráng (Chương 25–44): Bụi gai cháy, Biển Đỏ rẽ đôi, Mười Điều Răn trên đỉnh Sinai.\n• Nhịp thơ mộng và anh hùng ca (Chương 45–56): Tiếng đàn hạc chăn cừu và giấc mơ Cây Thế Giới của David.",
    ageMetaphor:
      "• Điểm chạm: Mỗi nhân vật đều học cách sửa lỗi và trưởng thành — Jacob làm hòa với Esau, anh em Joseph hối cải trước chiếc cốc bạc, David chọn cây ná giản dị thay vì áo giáp nặng.\n• Ẩn dụ cốt lõi: Hành trình tìm tự do nội tâm, giữ giao ước và biến oán thù thành lòng bao dung.",
    pronunciations: [
      { term: "Abram / Abraham", pronunciation: "Áp-ram / Áp-ra-ham", meaning: "Tổ phụ bước ra khỏi lò lửa và lên đường theo ánh sao (Chương 3–9)" },
      { term: "Jacob", pronunciation: "Gia-cốp", meaning: "Người mơ thấy Chiếc Thang Ánh Sáng tại Beth-El (Chương 13–17)" },
      { term: "Moses", pronunciation: "Mô-sê", meaning: "Người dẫn dân vượt Biển Đỏ và nhận Mười Điều Răn (Chương 25–40)" },
      { term: "David", pronunciation: "Đa-vít", meaning: "Cậu mục đồng gảy đàn hạc và giấc mơ Cây Thế Giới (Chương 47–56)" },
    ],
  },
  "quyen-3": {
    culturalSpirit:
      "Quyển III mở ra từ đỉnh cao chói lọi nhất với Ngôi Đền Thờ tráng lệ của Vua Solomon rồi đi qua cơn giông bão lưu đày Babylon và công cuộc dựng lại tường thành, chứng minh ngôi đền bền vững nhất nằm trong trái tim thông tuệ và lòng trung thực.",
    storytellingRhythm:
      "• Trang nghiêm rực rỡ (Cụm 1: Vua Solomon): Không gian tĩnh lặng xây Đền Thờ không tiếng búa.\n• Sâu lắng nhân hậu (Cụm 2–5: Elijah, Tobias, Isaiah, Jeremiah): Tiếng thì thầm làn gió thoảng và hành trình cất giấu Hòm Giao Ước.\n• Kịch tính và thức tỉnh (Cụm 6–11: Daniel, Nehemiah, Jonah, Job, Maccabeus): Lò lửa, hang sư tử và ngọn đèn phục hưng.",
    ageMetaphor:
      "• Điểm chạm: Lòng can đảm nói thật và giữ vững điều đúng giữa số đông sai lạc.\n• Ẩn dụ cốt lõi: Đền thờ bền vững nhất không làm từ vàng đá bên ngoài mà ở trái tim biết lắng nghe và ngọn lửa hy vọng giữa tro tàn.",
    pronunciations: [
      { term: "Solomon", pronunciation: "Sa-lô-môn", meaning: "Vị vua xin trái tim thông tuệ xây Đền Thờ Jerusalem (Chương 1–6)" },
      { term: "Elijah", pronunciation: "Ê-li-gia", meaning: "Tiên tri nghe tiếng gió thoảng trên núi Horeb (Chương 7–9)" },
      { term: "Daniel", pronunciation: "Đa-ni-en", meaning: "Người giữ lòng thanh sạch trong lò lửa và hang sư tử (Chương 18–24)" },
      { term: "Job", pronunciation: "Gióp", meaning: "Người công chính giữ vững niềm tin giữa mất mát tận cùng (Chương 29–30)" },
    ],
  },
  "quyen-4": {
    culturalSpirit:
      "Quyển IV đưa toàn bộ sử thi đổ dồn về vùng đất bình dị bên bờ Địa Trung Hải: hai dòng dõi của Vua David hội tụ tại ngôi làng Nazareth êm đềm, song hành với hành trình trưởng thành của John nơi cộng đồng áo trắng Essenes bên Biển Chết tới bình minh trên sông Jordan.",
    storytellingRhythm:
      "• Giọng ấm ánh nến và tinh khôi (Chương 1–4): Chậm, êm như tuyết đêm đông trên đồng cỏ Bethlehem.\n• Giọng trong trẻo tình bạn (Chương 5–8): Ngôi làng Nazareth, chim non bị thương và xưởng mộc.\n• Giọng trầm sâu trang nghiêm (Chương 9–15): Hoang địa Biển Chết và bầu trời mở ra trên sông Jordan.",
    ageMetaphor:
      "• Điểm chạm: Sự kết hợp đẹp đẽ giữa trí tuệ biết quan sát (trong Đền Thờ) và trái tim biết yêu thương (nhặt chú chim non, đóng chiếc ghế tặng bà cụ).\n• Ẩn dụ cốt lõi: Ánh sáng lớn lao nhất sinh ra trong hang đá khiêm nhường và lớn lên giữa tình bạn thuần khiết.",
    pronunciations: [
      { term: "Zechariah – Elizabeth", pronunciation: "Xa-ca-ri-a – Ê-li-da-bét", meaning: "Cha mẹ của John Người Làm Phép Rửa (Chương 9–10)" },
      { term: "Nazareth", pronunciation: "Na-da-rét", meaning: "Ngôi làng đồi nhỏ nơi hai gia đình Giuse–Maria sống cạnh nhau (Chương 3–8)" },
      { term: "Essenes", pronunciation: "Ét-xen", meaning: "Cộng đồng áo trắng bên bờ Biển Chết (Chương 11–12)" },
      { term: "Jordan", pronunciation: "Giô-đan", meaning: "Dòng sông diễn ra lễ rửa và bình minh chim bồ câu (Chương 14)" },
    ],
  },
  "quyen-5": {
    culturalSpirit:
      "Quyển V (Ngoại Truyện) nối tinh thần Giáng sinh sang thế kỷ III–IV bên bờ Địa Trung Hải qua cuộc đời vị Giám mục nhân hậu Nicholas thành Myra — người âm thầm thả ba túi vàng qua cửa sổ, rồi hóa thân qua bao mùa tuyết châu Âu thành Ông già Noel quen thuộc với tuổi thơ hôm nay.",
    storytellingRhythm:
      "• Giọng mở nối dịu dàng bên bếp lửa cuối thu đầu đông tại thành cảng Patara.\n• Nhịp bí mật háo hức khi ba túi vàng rơi trúng chiếc tất hong cạnh lò sưởi.\n• Hào sảng giữa sóng biển cứu đói thành Myra và ấm áp tiếng chuông đêm Giáng sinh.",
    ageMetaphor:
      "• Điểm chạm: Niềm vui cho đi âm thầm không cần ghi công để giữ trọn phẩm giá cho người nhận.\n• Ẩn dụ cốt lõi: Ông già Noel có thật mỗi khi có một bàn tay âm thầm đặt điều tốt lành vào cuộc đời người khác.",
    pronunciations: [
      { term: "Nicholas", pronunciation: "Ni-cô-la", meaning: "Vị giám mục nhân hậu thành Myra thế kỷ IV (Chương 1–9)" },
      { term: "Patara – Myra", pronunciation: "Pa-ta-ra – My-ra", meaning: "Hai thành cảng Địa Trung Hải gắn với cuộc đời Thánh Nicholas (Chương 1–9)" },
      { term: "Sinterklaas", pronunciation: "Xin-tơ-clát", meaning: "Tên gọi dân gian Hà Lan tiền thân của Santa Claus (Chương 10)" },
    ],
  },
};

interface SeedIllustrationInput {
  id: string;
  number: number;
  bookId: string;
  chaptersRef: string;
  title: string;
  image: string;
  imageGenerated: boolean;
}

const GENESIS_ILLUSTRATIONS_META: SeedIllustrationInput[] = [
  { id: "tranh-01", number: 1, bookId: "quyen-1", chaptersRef: "Chương 1–2", title: "Khởi Nguyên Thế Giới Và Cuộc Chiến Giữa Ánh Sáng Với Bóng Tối", image: "assets/images/canh-01-khoi-nguyen-va-cuoc-chien-anh-sang.png", imageGenerated: true },
  { id: "tranh-02", number: 2, bookId: "quyen-1", chaptersRef: "Chương 3–6, 10–11, 13–14", title: "Bảy Ngày Sáng Thế Và Sự Tạo Dựng Con Người Đầu Tiên", image: "assets/images/canh-02-bay-ngay-sang-the.png", imageGenerated: true },
  { id: "tranh-03", number: 3, bookId: "quyen-1", chaptersRef: "Chương 7–9, 12", title: "Muôn Hoa, Cây Cỏ Và Loài Vật Giữa Ánh Sáng Và Bóng Tối", image: "assets/images/canh-03-muon-hoa-va-muon-thu-buoi-dau.png", imageGenerated: true },
  { id: "tranh-04", number: 4, bookId: "quyen-1", chaptersRef: "Chương 15–17", title: "Vườn Địa Đàng, Trái Cấm Và Những Giọt Nước Mắt Đầu Tiên Trên Mặt Đất", image: "assets/images/canh-04-vuon-dia-dang-va-buoc-chan-xuong-tran.png", imageGenerated: true },
  { id: "tranh-05", number: 5, bookId: "quyen-1", chaptersRef: "Chương 18–26", title: "Cain, Abel, Người Em Mới Seth Và Ba Hạt Giống Cây Sự Sống", image: "assets/images/canh-05-cain-abel-va-hat-giong-su-song.png", imageGenerated: true },
  { id: "tranh-06", number: 6, bookId: "quyen-1", chaptersRef: "Chương 27–37", title: "Ba Con Trai Của Cain: Thuần Hóa Muôn Thú, Tiếng Đàn Thiên Giới, Lò Rèn Sắt Và Bi Kịch Kenos", image: "assets/images/canh-06-con-chau-cain-va-ngon-lua-van-minh.png", imageGenerated: true },
  { id: "tranh-07", number: 7, bookId: "quyen-1", chaptersRef: "Chương 38–45", title: "Ánh Sáng Của Enoch Giữa Đêm Tối Ngẫu Tượng", image: "assets/images/canh-07-enoch-nguoi-giu-anh-sang.png", imageGenerated: true },
  { id: "tranh-08", number: 8, bookId: "quyen-1", chaptersRef: "Chương 46–67", title: "Con Tàu Của Noah, Cơn Đại Hồng Thủy Và Chiếc Cầu Vồng Giao Ước", image: "assets/images/canh-08-con-tau-noah-va-cau-vong-giao-uoc.png", imageGenerated: true },
  { id: "tranh-09", number: 9, bookId: "quyen-2", chaptersRef: "Chương 1–5", title: "Ngai Bảy Tầng Của Nimrod, Tháp Babel Và Chàng Trai Abram Bước Ra Khỏi Lò Lửa", image: "assets/images/canh-09-thap-babel-va-abram-buoc-ra-khoi-lua.png", imageGenerated: true },
  { id: "tranh-10", number: 10, bookId: "quyen-2", chaptersRef: "Chương 6–12", title: "Lời Hứa Dưới Trời Sao, Cây Cổ Thụ Của Abraham, Phép Thử Trên Núi Moriah Và Cô Dâu Rebecca", image: "assets/images/canh-10-abraham-goc-cay-thieng-va-le-hien-te-isaac.png", imageGenerated: true },
  { id: "tranh-11", number: 11, bookId: "quyen-2", chaptersRef: "Chương 13–17", title: "Hai Anh Em Esau – Jacob, Chiếc Thang Ánh Sáng Và Cuộc Hòa Giải", image: "assets/images/canh-11-chiec-thang-anh-sang-cua-jacob.png", imageGenerated: true },
  { id: "tranh-12", number: 12, bookId: "quyen-2", chaptersRef: "Chương 18–24", title: "Chiếc Áo Ngũ Sắc Của Joseph, Giấc Mơ Pharaoh Và Cuộc Đoàn Tụ Nước Mắt", image: "assets/images/canh-12-joseph-chiec-ao-ngu-sac-va-nguoi-ban-banh-mi.png", imageGenerated: true },
  { id: "tranh-13", number: 13, bookId: "quyen-2", chaptersRef: "Chương 25–30", title: "Hài Nhi Moses Trên Sông Nile, Bụi Gai Bốc Cháy Và Biển Đỏ Rẽ Đôi", image: "assets/images/canh-13-moses-bui-gai-chay-va-bien-do-re-nuoc.png", imageGenerated: true },
  { id: "tranh-14", number: 14, bookId: "quyen-2", chaptersRef: "Chương 31–44", title: "Mười Điều Răn Trên Đỉnh Sinai, Ngôi Đền Tạm, Cái Nhìn Từ Núi Nebo Và Joshua Vượt Sông Jordan", image: "assets/images/canh-14-muoi-dieu-ran-den-tam-va-cai-nhin-tu-nui-nebo.png", imageGenerated: true },
  { id: "tranh-15", number: 15, bookId: "quyen-2", chaptersRef: "Chương 45–56", title: "Vua Saul, Tiếng Đàn Chăn Cừu Của David Và Giấc Mơ Cây Thế Giới", image: "assets/images/canh-15-vua-saul-tieng-dan-david-va-giac-mo-cay-the-gioi.png", imageGenerated: true },
  { id: "tranh-16", number: 16, bookId: "quyen-3", chaptersRef: "Chương 1–6", title: "Trái Tim Thông Tuệ Của Vua Solomon Và Ngôi Đền Thờ Jerusalem", image: "assets/images/canh-16-solomon-trai-tim-thong-tue-va-ngoi-den-tho.png", imageGenerated: true },
  { id: "tranh-17", number: 17, bookId: "quyen-3", chaptersRef: "Chương 7–9", title: "Tiên Tri Elijah: Hũ Bột Không Vơi, Ngọn Lửa Trên Núi Carmel Và Cỗ Xe Lửa", image: "assets/images/canh-17-tien-tri-elijah-ngon-lua-trung-thuc-va-co-xe-lua.png", imageGenerated: true },
  { id: "tranh-18", number: 18, bookId: "quyen-3", chaptersRef: "Chương 10–11", title: "Chuyến Đi Của Chàng Trẻ Tobias Và Thiên Thần Chữa Lành Raphael", image: "assets/images/canh-18-hanh-trinh-cua-tobias-va-thien-than-chua-lanh.png", imageGenerated: true },
  { id: "tranh-19", number: 19, bookId: "quyen-3", chaptersRef: "Chương 12–17", title: "Đôi Môi Chạm Lửa Của Isaiah Và Jeremiah Giấu Hòm Giao Ước Trước Giờ Đền Thờ Sụp Đổ", image: "assets/images/canh-19-isaiah-va-jeremiah-loi-tien-tri-giua-tro-tan.png", imageGenerated: true },
  { id: "tranh-20", number: 20, bookId: "quyen-3", chaptersRef: "Chương 18–24", title: "Daniel Và Các Bạn Trẻ Nơi Xứ Lưu Đày: Lò Lửa Và Hang Sư Tử Babylon", image: "assets/images/canh-20-daniel-lo-lua-va-hang-su-tu-babylon.png", imageGenerated: true },
  { id: "tranh-21", number: 21, bookId: "quyen-3", chaptersRef: "Chương 27", title: "Tiên Tri Jonah Trong Bụng Cá Khổng Lồ Và Bài Học Về Lòng Thương Xót", image: "assets/images/canh-21-jonah-con-ca-khong-lo-va-long-bao-dung.png", imageGenerated: true },
  { id: "tranh-22", number: 22, bookId: "quyen-3", chaptersRef: "Chương 25–26, 28–32", title: "Xây Lại Tường Thành, Lòng Kiên Trung Của Job Và Ngọn Lửa Phục Hưng Đền Thờ", image: "assets/images/canh-22-xay-lai-thanh-quach-job-va-ngon-lua-maccabeus.png", imageGenerated: true },
  { id: "tranh-23", number: 23, bookId: "quyen-4", chaptersRef: "Chương 1, 9–10", title: "Hai Ngọn Sáng Đêm Đông, Lời Báo Tin Trong Đền Thờ Và Cuộc Hội Ngộ Của Hai Người Mẹ", image: "assets/images/canh-23-loi-bao-tin-trong-den-tho-va-cuoc-gap-go-hai-nguoi-me.png", imageGenerated: true },
  { id: "tranh-24", number: 24, bookId: "quyen-4", chaptersRef: "Chương 2", title: "Đứa Trẻ Dòng Dõi Vua, Ba Nhà Thông Thái Phương Đông Và Cuộc Chạy Trốn Trong Đêm", image: "assets/images/canh-24-dua-tre-dong-doi-vua-va-nhung-nha-thong-thai.png", imageGenerated: true },
  { id: "tranh-25", number: 25, bookId: "quyen-4", chaptersRef: "Chương 3–4", title: "Đứa Trẻ Dòng Dõi Mục Đồng, Tiếng Hát Trên Đồng Cỏ Và Hai Gia Đình Ở Nazareth", image: "assets/images/canh-25-dua-tre-muc-dong-va-tinh-ban-o-nazareth.png", imageGenerated: true },
  { id: "tranh-26", number: 26, bookId: "quyen-4", chaptersRef: "Chương 5–8", title: "Năm Thứ Mười Hai Trong Đền Thờ, Nỗi Đau Mùa Đông Và Người Thợ Mộc Khôn Ngoan", image: "assets/images/canh-26-nam-thu-muoi-hai-trong-den-tho-va-xuong-moc-nazareth.png", imageGenerated: true },
  { id: "tranh-27", number: 27, bookId: "quyen-4", chaptersRef: "Chương 11–15", title: "John Giữa Cộng Đồng Áo Trắng, Tiếng Gọi Hoang Địa Và Bình Minh Trên Sông Jordan", image: "assets/images/canh-27-john-ben-bo-bien-chet-va-phep-rua-tren-song-jordan.png", imageGenerated: true },
  { id: "tranh-28", number: 28, bookId: "quyen-5", chaptersRef: "Chương 1–10", title: "Ngoại Truyện: Từ Chiếc Áo Choàng Đỏ Của Thánh Nicholas Đến Ông Già Noel Đêm Giáng Sinh", image: "assets/images/canh-28-ngoai-truyen-thanh-nicholas-va-ong-gia-noel.png", imageGenerated: true },
];

// [globalNumber, bookId, chapterNumber, section, title, illustrationId]
const GENESIS_CHAPTERS_SEED: Array<[number, string, number, string, string, string]> = [
  [1, "quyen-1", 1, "Phần I: Bảy Ngày Sáng Thế", "Khởi Nguyên Của Thế Giới", "tranh-01"],
  [2, "quyen-1", 2, "Phần I: Bảy Ngày Sáng Thế", "Michael Và Con Rồng", "tranh-01"],
  [3, "quyen-1", 3, "Phần I: Bảy Ngày Sáng Thế", "Ngày Sáng Tạo Thứ Nhất", "tranh-02"],
  [4, "quyen-1", 4, "Phần I: Bảy Ngày Sáng Thế", "Ngày Thứ Hai", "tranh-02"],
  [5, "quyen-1", 5, "Phần I: Bảy Ngày Sáng Thế", "Ngày Thứ Ba", "tranh-02"],
  [6, "quyen-1", 6, "Phần I: Bảy Ngày Sáng Thế", "Ngày Thứ Tư", "tranh-02"],
  [7, "quyen-1", 7, "Phần I: Bảy Ngày Sáng Thế", "Hoa Nhung Tuyết Và Các Loài Hoa Trên Đỉnh Núi Cao", "tranh-03"],
  [8, "quyen-1", 8, "Phần I: Bảy Ngày Sáng Thế", "Chuyện Về Các Loài Cây Có Độc", "tranh-03"],
  [9, "quyen-1", 9, "Phần I: Bảy Ngày Sáng Thế", "Vì Sao Hoa Hồng Có Gai", "tranh-03"],
  [10, "quyen-1", 10, "Phần I: Bảy Ngày Sáng Thế", "Ngày Thứ Năm", "tranh-02"],
  [11, "quyen-1", 11, "Phần I: Bảy Ngày Sáng Thế", "Ngày Thứ Sáu", "tranh-02"],
  [12, "quyen-1", 12, "Phần I: Bảy Ngày Sáng Thế", "Chim Bồ Câu Và Chú Cừu Non", "tranh-03"],
  [13, "quyen-1", 13, "Phần I: Bảy Ngày Sáng Thế", "Sự Tạo Dựng Con Người", "tranh-02"],
  [14, "quyen-1", 14, "Phần I: Bảy Ngày Sáng Thế", "Ngày Thứ Bảy", "tranh-02"],
  [15, "quyen-1", 15, "Phần I: Bảy Ngày Sáng Thế", "Trong Vườn Địa Đàng", "tranh-04"],
  [16, "quyen-1", 16, "Phần I: Bảy Ngày Sáng Thế", "Sự Sa Ngã", "tranh-04"],
  [17, "quyen-1", 17, "Phần I: Bảy Ngày Sáng Thế", "Trên Mặt Đất", "tranh-04"],
  [18, "quyen-1", 18, "Phần II: Con Cháu Của Cain", "Cain Và Abel", "tranh-05"],
  [19, "quyen-1", 19, "Phần II: Con Cháu Của Cain", "Giấc Mơ Của Cain Và Abel", "tranh-05"],
  [20, "quyen-1", 20, "Phần II: Con Cháu Của Cain", "Cain Hạ Gục Con Sói", "tranh-05"],
  [21, "quyen-1", 21, "Phần II: Con Cháu Của Cain", "Khi Eve Khóc", "tranh-05"],
  [22, "quyen-1", 22, "Phần II: Con Cháu Của Cain", "Cain Đã Giết Abel Như Thế Nào", "tranh-05"],
  [23, "quyen-1", 23, "Phần II: Con Cháu Của Cain", "Adam Chôn Abel Trong Ngôi Mộ Đầu Tiên Trên Mặt Đất", "tranh-05"],
  [24, "quyen-1", 24, "Phần II: Con Cháu Của Cain", "Seth, Người Em Mới Của Cain", "tranh-05"],
  [25, "quyen-1", 25, "Phần II: Con Cháu Của Cain", "Thiên Thần Trao Cuốn Sách Sự Sống Cho Adam", "tranh-05"],
  [26, "quyen-1", 26, "Phần II: Con Cháu Của Cain", "Cái Chết Của Adam", "tranh-05"],
  [27, "quyen-1", 27, "Phần II: Con Cháu Của Cain", "Các Con Trai Của Cain", "tranh-06"],
  [28, "quyen-1", 28, "Phần II: Con Cháu Của Cain", "Jabal, Người Thuần Hóa Loài Vật", "tranh-06"],
  [29, "quyen-1", 29, "Phần II: Con Cháu Của Cain", "Jubal Mang Âm Nhạc Đến Cho Loài Người", "tranh-06"],
  [30, "quyen-1", 30, "Phần II: Con Cháu Của Cain", "Thubal-Cain, Nhà Phát Minh Và Thợ Rèn", "tranh-06"],
  [31, "quyen-1", 31, "Phần II: Con Cháu Của Cain", "Các Con Trai Của Cain Và Những Ngôi Nhà Đầu Tiên", "tranh-06"],
  [32, "quyen-1", 32, "Phần II: Con Cháu Của Cain", "Ba Con Dao", "tranh-06"],
  [33, "quyen-1", 33, "Phần II: Con Cháu Của Cain", "Jubal Chơi Nhạc Cho Muôn Thú", "tranh-06"],
  [34, "quyen-1", 34, "Phần II: Con Cháu Của Cain", "Jubal Chơi Nhạc Cho Loài Người", "tranh-06"],
  [35, "quyen-1", 35, "Phần II: Con Cháu Của Cain", "Chuyện Về Những Kẻ Đồng Hành Gian Ác Và Việc Làm Tội Lỗi", "tranh-06"],
  [36, "quyen-1", 36, "Phần II: Con Cháu Của Cain", "Kenos Trong Hang Rừng", "tranh-06"],
  [37, "quyen-1", 37, "Phần II: Con Cháu Của Cain", "Jubal Thoát Khỏi Hiểm Nguy Lớn Như Thế Nào", "tranh-06"],
  [38, "quyen-1", 38, "Phần II: Con Cháu Của Cain", "Cái Chết Của Seth", "tranh-07"],
  [39, "quyen-1", 39, "Phần II: Con Cháu Của Cain", "Enos Đã Mang Việc Thờ Ngẫu Tượng Đến Cho Loài Người Như Thế Nào", "tranh-07"],
  [40, "quyen-1", 40, "Phần II: Con Cháu Của Cain", "Ánh Sáng Thiện Lương Trở Lại Mặt Đất Nhờ Enoch", "tranh-07"],
  [41, "quyen-1", 41, "Phần II: Con Cháu Của Cain", "Enoch Dâng Lễ Vật Đầu Tiên", "tranh-07"],
  [42, "quyen-1", 42, "Phần II: Con Cháu Của Cain", "Enoch Tìm Thấy Hang Động Sách Thánh", "tranh-07"],
  [43, "quyen-1", 43, "Phần II: Con Cháu Của Cain", "Những Chuyến Du Hành Của Enoch", "tranh-07"],
  [44, "quyen-1", 44, "Phần II: Con Cháu Của Cain", "Ngọn Núi Của Chúa Và Các Tư Tế", "tranh-07"],
  [45, "quyen-1", 45, "Phần II: Con Cháu Của Cain", "Enoch Thăng Thiên", "tranh-07"],
  [46, "quyen-1", 46, "Phần III: Con Tàu Của Noah", "Ông Lão Methusala", "tranh-08"],
  [47, "quyen-1", 47, "Phần III: Con Tàu Của Noah", "Đâu Là Ngôi Nhà Của Người Công Chính?", "tranh-08"],
  [48, "quyen-1", 48, "Phần III: Con Tàu Của Noah", "Sự Ra Đời Của Noah", "tranh-08"],
  [49, "quyen-1", 49, "Phần III: Con Tàu Của Noah", "Cơn Giận Của Cậu Bé Noah", "tranh-08"],
  [50, "quyen-1", 50, "Phần III: Con Tàu Của Noah", "Thành Phố Trăm Ngẫu Tượng", "tranh-08"],
  [51, "quyen-1", 51, "Phần III: Con Tàu Của Noah", "Mệnh Lệnh", "tranh-08"],
  [52, "quyen-1", 52, "Phần III: Con Tàu Của Noah", "Vị Vua Đội Vương Miện Đen", "tranh-08"],
  [53, "quyen-1", 53, "Phần III: Con Tàu Của Noah", "Raphael Dẫn Noah Tới Cuốn Sách Sự Sống", "tranh-08"],
  [54, "quyen-1", 54, "Phần III: Con Tàu Của Noah", "Mệnh Lệnh Đóng Con Tàu", "tranh-08"],
  [55, "quyen-1", 55, "Phần III: Con Tàu Của Noah", "Sem, Ham, Jafet Và Các Loài Vật", "tranh-08"],
  [56, "quyen-1", 56, "Phần III: Con Tàu Của Noah", "Liệu Con Tàu Có Bị Phá Hủy Không?", "tranh-08"],
  [57, "quyen-1", 57, "Phần III: Con Tàu Của Noah", "Tập Hợp Các Loài Vật", "tranh-08"],
  [58, "quyen-1", 58, "Phần III: Con Tàu Của Noah", "Bước Vào Con Tàu", "tranh-08"],
  [59, "quyen-1", 59, "Phần III: Con Tàu Của Noah", "Chiếc Quan Tài Của Adam", "tranh-08"],
  [60, "quyen-1", 60, "Phần III: Con Tàu Của Noah", "Con Tàu Được Niêm Phong Và Mưa Bắt Đầu Rơi", "tranh-08"],
  [61, "quyen-1", 61, "Phần III: Con Tàu Của Noah", "Cơn Đại Hồng Thủy", "tranh-08"],
  [62, "quyen-1", 62, "Phần III: Con Tàu Của Noah", "Nỗi Khốn Khổ Trong Con Tàu", "tranh-08"],
  [63, "quyen-1", 63, "Phần III: Con Tàu Của Noah", "Chuyến Bay Của Quạ Và Thông Điệp Của Bồ Câu", "tranh-08"],
  [64, "quyen-1", 64, "Phần III: Con Tàu Của Noah", "Thế Giới Mới", "tranh-08"],
  [65, "quyen-1", 65, "Phần III: Con Tàu Của Noah", "Lễ Tạ Ơn", "tranh-08"],
  [66, "quyen-1", 66, "Phần III: Con Tàu Của Noah", "Ác Quỷ Trong Vườn Nho Của Noah", "tranh-08"],
  [67, "quyen-1", 67, "Phần III: Con Tàu Của Noah", "Sem Và Các Thiên Thần", "tranh-08"],
  [68, "quyen-2", 1, "Phần I: Abraham", "Vua Nimrod", "tranh-09"],
  [69, "quyen-2", 2, "Phần I: Abraham", "Tháp Babel", "tranh-09"],
  [70, "quyen-2", 3, "Phần I: Abraham", "Sự Ra Đời Của Abram", "tranh-09"],
  [71, "quyen-2", 4, "Phần I: Abraham", "Abram Và Nimrod", "tranh-09"],
  [72, "quyen-2", 5, "Phần I: Abraham", "Sự Hỗn Loạn Ngôn Ngữ", "tranh-09"],
  [73, "quyen-2", 6, "Phần I: Abraham", "Abram Hành Hương Tới Canaan", "tranh-10"],
  [74, "quyen-2", 7, "Phần I: Abraham", "Cây Của Abraham", "tranh-10"],
  [75, "quyen-2", 8, "Phần I: Abraham", "Cuộc Viếng Thăm Của Ba Vị Khách", "tranh-10"],
  [76, "quyen-2", 9, "Phần I: Abraham", "Sự Hủy Diệt Thành Sodom", "tranh-10"],
  [77, "quyen-2", 10, "Phần II: Isaac", "Cậu Bé Isaac", "tranh-10"],
  [78, "quyen-2", 11, "Phần II: Isaac", "Lễ Hiến Tế Isaac", "tranh-10"],
  [79, "quyen-2", 12, "Phần II: Isaac", "Isaac Và Rebecca", "tranh-10"],
  [80, "quyen-2", 13, "Phần III: Jacob", "Jacob Và Esau", "tranh-11"],
  [81, "quyen-2", 14, "Phần III: Jacob", "Lời Chúc Phúc Của Isaac", "tranh-11"],
  [82, "quyen-2", 15, "Phần III: Jacob", "Cuộc Chạy Trốn Của Jacob", "tranh-11"],
  [83, "quyen-2", 16, "Phần III: Jacob", "Jacob Nơi Xứ Lạ", "tranh-11"],
  [84, "quyen-2", 17, "Phần III: Jacob", "Đất Canaan – Cuộc Hòa Giải", "tranh-11"],
  [85, "quyen-2", 18, "Phần IV: Joseph", "Joseph Bị Bán", "tranh-12"],
  [86, "quyen-2", 19, "Phần IV: Joseph", "Joseph Ở Ai Cập", "tranh-12"],
  [87, "quyen-2", 20, "Phần IV: Joseph", "Joseph Trong Ngục Tối", "tranh-12"],
  [88, "quyen-2", 21, "Phần IV: Joseph", "Giấc Mơ Của Pharaoh", "tranh-12"],
  [89, "quyen-2", 22, "Phần IV: Joseph", "Những Năm Tháng Đói Kém", "tranh-12"],
  [90, "quyen-2", 23, "Phần IV: Joseph", "Hành Trình Dài Tới Ai Cập", "tranh-12"],
  [91, "quyen-2", 24, "Phần IV: Joseph", "Một Pharaoh Mới", "tranh-12"],
  [92, "quyen-2", 25, "Phần V: Moses", "Chào Đời Và Thời Thơ Ấu", "tranh-13"],
  [93, "quyen-2", 26, "Phần V: Moses", "Những Hòn Than Hồng", "tranh-13"],
  [94, "quyen-2", 27, "Phần V: Moses", "Moses Và Người Ai Cập", "tranh-13"],
  [95, "quyen-2", 28, "Phần V: Moses", "Moses Ở Xứ Midian", "tranh-13"],
  [96, "quyen-2", 29, "Phần V: Moses", "Cuộc Chiến Với Pharaoh", "tranh-13"],
  [97, "quyen-2", 30, "Phần V: Moses", "Cuộc Xuất Hành", "tranh-13"],
  [98, "quyen-2", 31, "Phần V: Moses", "Mara Và Sin", "tranh-14"],
  [99, "quyen-2", 32, "Phần V: Moses", "Dân Amalekites", "tranh-14"],
  [100, "quyen-2", 33, "Phần V: Moses", "Tại Núi Sinai", "tranh-14"],
  [101, "quyen-2", 34, "Phần V: Moses", "Mười Điều Răn", "tranh-14"],
  [102, "quyen-2", 35, "Phần V: Moses", "Con Bê Vàng", "tranh-14"],
  [103, "quyen-2", 36, "Phần V: Moses", "Đền Tạm", "tranh-14"],
  [104, "quyen-2", 37, "Phần V: Moses", "Hoang Địa Zin", "tranh-14"],
  [105, "quyen-2", 38, "Phần V: Moses", "Con Rắn Đồng", "tranh-14"],
  [106, "quyen-2", 39, "Phần V: Moses", "Bileam Lại Xuất Hiện", "tranh-14"],
  [107, "quyen-2", 40, "Phần VI: Joshua", "Joshua Tiếp Nhận Quyền Lãnh Đạo", "tranh-14"],
  [108, "quyen-2", 41, "Phần VI: Joshua", "Ngôi Mộ Vô Danh", "tranh-14"],
  [109, "quyen-2", 42, "Phần VI: Joshua", "Vượt Sông Jordan", "tranh-14"],
  [110, "quyen-2", 43, "Phần VI: Joshua", "Chiếm Thành Jericho", "tranh-14"],
  [111, "quyen-2", 44, "Phần VI: Joshua", "Trong Vùng Đất Canaan", "tranh-14"],
  [112, "quyen-2", 45, "Phần VII: Saul Và David", "Samuel Và Saul", "tranh-15"],
  [113, "quyen-2", 46, "Phần VII: Saul Và David", "Saul Trở Thành Vua", "tranh-15"],
  [114, "quyen-2", 47, "Phần VII: Saul Và David", "Cậu Bé Chăn Cừu David", "tranh-15"],
  [115, "quyen-2", 48, "Phần VII: Saul Và David", "Ai Sẽ Là Vị Vua Mới?", "tranh-15"],
  [116, "quyen-2", 49, "Phần VII: Saul Và David", "David Và Saul", "tranh-15"],
  [117, "quyen-2", 50, "Phần VII: Saul Và David", "David Và Goliath", "tranh-15"],
  [118, "quyen-2", 51, "Phần VII: Saul Và David", "Trong Hang Đá", "tranh-15"],
  [119, "quyen-2", 52, "Phần VII: Saul Và David", "Cái Chết Của Saul Và Jonathan", "tranh-15"],
  [120, "quyen-2", 53, "Phần VII: Saul Và David", "David Làm Vua", "tranh-15"],
  [121, "quyen-2", 54, "Phần VII: Saul Và David", "Đại Hội Đồng", "tranh-15"],
  [122, "quyen-2", 55, "Phần VII: Saul Và David", "Giấc Mơ Của David", "tranh-15"],
  [123, "quyen-2", 56, "Phần VII: Saul Và David", "Những Bài Thánh Vịnh Của David", "tranh-15"],
  [124, "quyen-3", 1, "Cụm 1: Vua Solomon", "Solomon Lên Ngôi Vua", "tranh-16"],
  [125, "quyen-3", 2, "Cụm 1: Vua Solomon", "Lễ Hiến Tế Và Lời Cầu Nguyện Của Solomon", "tranh-16"],
  [126, "quyen-3", 3, "Cụm 1: Vua Solomon", "Phán Quyết Của Solomon", "tranh-16"],
  [127, "quyen-3", 4, "Cụm 1: Vua Solomon", "Sự Giàu Có Và Vinh Quang Của Solomon", "tranh-16"],
  [128, "quyen-3", 5, "Cụm 1: Vua Solomon", "Xây Dựng Đền Thờ", "tranh-16"],
  [129, "quyen-3", 6, "Cụm 1: Vua Solomon", "Sự Phân Chia Vương Quốc", "tranh-16"],
  [130, "quyen-3", 7, "Cụm 2: Tiên Tri Elijah", "Tiên Tri Elijah", "tranh-17"],
  [131, "quyen-3", 8, "Cụm 2: Tiên Tri Elijah", "Trên Núi Carmel", "tranh-17"],
  [132, "quyen-3", 9, "Cụm 2: Tiên Tri Elijah", "Elijah Trên Núi Horeb", "tranh-17"],
  [133, "quyen-3", 10, "Cụm 3: Tobias", "Tobias", "tranh-18"],
  [134, "quyen-3", 11, "Cụm 3: Tobias", "Cùng Với Raguel Và Sarah", "tranh-18"],
  [135, "quyen-3", 12, "Cụm 4: Isaiah", "Isaiah", "tranh-19"],
  [136, "quyen-3", 13, "Cụm 4: Isaiah", "Lời Tiên Tri", "tranh-19"],
  [137, "quyen-3", 14, "Cụm 5: Tiên Tri Jeremiah", "Tiên Tri Jeremiah", "tranh-19"],
  [138, "quyen-3", 15, "Cụm 5: Tiên Tri Jeremiah", "Jeremiah Bị Ném Xuống Giếng Nước", "tranh-19"],
  [139, "quyen-3", 16, "Cụm 5: Tiên Tri Jeremiah", "Jeremiah Đã Cứu Hòm Giao Ước Như Thế Nào", "tranh-19"],
  [140, "quyen-3", 17, "Cụm 5: Tiên Tri Jeremiah", "Quân Babylon Phá Hủy Đền Thờ", "tranh-19"],
  [141, "quyen-3", 18, "Cụm 6: Daniel", "Daniel", "tranh-20"],
  [142, "quyen-3", 19, "Cụm 6: Daniel", "Giấc Mơ Của Nebuchadnezzar", "tranh-20"],
  [143, "quyen-3", 20, "Cụm 6: Daniel", "Ba Chàng Trai Trong Lò Lửa", "tranh-20"],
  [144, "quyen-3", 21, "Cụm 6: Daniel", "Bữa Tiệc Của Belshazzar", "tranh-20"],
  [145, "quyen-3", 22, "Cụm 6: Daniel", "Từ Thần Bel Tới Tháp Babel", "tranh-20"],
  [146, "quyen-3", 23, "Cụm 6: Daniel", "Daniel Trong Hang Sư Tử", "tranh-20"],
  [147, "quyen-3", 24, "Cụm 6: Daniel", "Lời Tiên Tri Của Daniel", "tranh-20"],
  [148, "quyen-3", 25, "Cụm 7: Nehemiah", "Nehemiah", "tranh-22"],
  [149, "quyen-3", 26, "Cụm 7: Nehemiah", "Công Cuộc Tái Thiết Gian Nan", "tranh-22"],
  [150, "quyen-3", 27, "Cụm 8: Jonah", "Jonah", "tranh-21"],
  [151, "quyen-3", 28, "Cụm 9: Heliodorus", "Heliodorus", "tranh-22"],
  [152, "quyen-3", 29, "Cụm 10: Job", "Job", "tranh-22"],
  [153, "quyen-3", 30, "Cụm 10: Job", "Cuộc Thử Thách", "tranh-22"],
  [154, "quyen-3", 31, "Cụm 11: Judas Maccabeus", "Judas Maccabeus", "tranh-22"],
  [155, "quyen-3", 32, "Cụm 11: Judas Maccabeus", "Liên Minh Với Rome", "tranh-22"],
  [156, "quyen-4", 1, "Phần I: Đứa Trẻ Dòng Dõi Vua Và Đứa Trẻ Mục Đồng", "Hai Câu Chuyện Giáng Sinh", "tranh-23"],
  [157, "quyen-4", 2, "Phần I: Đứa Trẻ Dòng Dõi Vua Và Đứa Trẻ Mục Đồng", "Đứa Trẻ Dòng Dõi Vua", "tranh-24"],
  [158, "quyen-4", 3, "Phần I: Đứa Trẻ Dòng Dõi Vua Và Đứa Trẻ Mục Đồng", "Đứa Trẻ Dòng Dõi Mục Đồng", "tranh-25"],
  [159, "quyen-4", 4, "Phần I: Đứa Trẻ Dòng Dõi Vua Và Đứa Trẻ Mục Đồng", "Những Cuộc Trò Chuyện Của Hai Bà Maria", "tranh-25"],
  [160, "quyen-4", 5, "Phần I: Đứa Trẻ Dòng Dõi Vua Và Đứa Trẻ Mục Đồng", "Năm Thứ Mười Hai", "tranh-26"],
  [161, "quyen-4", 6, "Phần I: Đứa Trẻ Dòng Dõi Vua Và Đứa Trẻ Mục Đồng", "Giêsu Trong Đền Thờ", "tranh-26"],
  [162, "quyen-4", 7, "Phần I: Đứa Trẻ Dòng Dõi Vua Và Đứa Trẻ Mục Đồng", "Nỗi Đau Ập Đến", "tranh-26"],
  [163, "quyen-4", 8, "Phần I: Đứa Trẻ Dòng Dõi Vua Và Đứa Trẻ Mục Đồng", "Người Thợ Mộc Khôn Ngoan", "tranh-26"],
  [164, "quyen-4", 9, "Phần II: John Người Làm Phép Rửa Và Bình Minh Bên Sông Jordan", "John Người Làm Phép Rửa", "tranh-23"],
  [165, "quyen-4", 10, "Phần II: John Người Làm Phép Rửa Và Bình Minh Bên Sông Jordan", "Cuộc Gặp Gỡ Kỳ Lạ", "tranh-23"],
  [166, "quyen-4", 11, "Phần II: John Người Làm Phép Rửa Và Bình Minh Bên Sông Jordan", "John Sống Cùng Phái Essenes", "tranh-27"],
  [167, "quyen-4", 12, "Phần II: John Người Làm Phép Rửa Và Bình Minh Bên Sông Jordan", "Bên Bờ Biển Chết", "tranh-27"],
  [168, "quyen-4", 13, "Phần II: John Người Làm Phép Rửa Và Bình Minh Bên Sông Jordan", "Người Rao Giảng Trong Hoang Địa", "tranh-27"],
  [169, "quyen-4", 14, "Phần II: John Người Làm Phép Rửa Và Bình Minh Bên Sông Jordan", "Lễ Rửa Tội Của Giêsu", "tranh-27"],
  [170, "quyen-4", 15, "Phần II: John Người Làm Phép Rửa Và Bình Minh Bên Sông Jordan", "Về Cái Chết Của Vị Tiền Hô", "tranh-27"],
  [171, "quyen-5", 1, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Cậu Bé Thành Patara Và Tiếng Chuông Buổi Sáng", "tranh-28"],
  [172, "quyen-5", 2, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Ba Túi Vàng Qua Khung Cửa Sổ Đêm Khuya", "tranh-28"],
  [173, "quyen-5", 3, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Chuyến Hải Trình Xa Xôi Và Cơn Bão Giữa Biển Lớn", "tranh-28"],
  [174, "quyen-5", 4, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Cánh Cửa Nhà Thờ Thành Myra Lúc Bình Minh", "tranh-28"],
  [175, "quyen-5", 5, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Phép Lạ Đoàn Tàu Lúa Mì Trong Mùa Đói Kém", "tranh-28"],
  [176, "quyen-5", 6, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Đôi Tay Ngăn Thanh Gươm Và Ba Người Vô Tội", "tranh-28"],
  [177, "quyen-5", 7, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Đôi Giày Nhỏ Bên Bậc Thềm Đêm Gió Lạnh", "tranh-28"],
  [178, "quyen-5", 8, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Ba Vị Tướng Trong Ngục Tối Kinh Đô", "tranh-28"],
  [179, "quyen-5", 9, "Phần I: Cuộc Đời Và Những Câu Chuyện Của Thánh Nicholas Thành Myra", "Buổi Chiều Bình Yên Cuối Đời Ở Thành Myra", "tranh-28"],
  [180, "quyen-5", 10, "Phần II: Hành Trình Huyền Thoại Mùa Đông Khắp Thế Gian", "Từ Chiếc Áo Choàng Đỏ Thành Myra Đến Ông Già Noel Đêm Giáng Sinh", "tranh-28"],
];

function buildChapterLevelPaths(
  book: StoryBookMeta,
  ill: SeedIllustrationInput,
  lang: Language
): SceneLevelPaths {
  return {
    level0Overview: `locales/${lang}/level-0-context/00-epic-soul-overview.md`,
    level0Book: book.level0File,
    level1: book.level1File,
    level2: book.level2File,
    level3: `locales/${lang}/level-3-summary-outline/chapter-summaries.md`,
    level4Gallery: `locales/${lang}/level-4-visual-prompts/illustration-gallery.md`,
    level4Image: ill.image,
    level4PromptSpec: `locales/${lang}/level-4-visual-prompts/prompts-28-scenes.md`,
  };
}

export function getSeedData(lang: Language = "vi"): WaldorfData {
  const books = buildBooksForLang(lang);
  const ancientBooks = buildAncientBooksForLang(lang);
  const bookMap = new Map(books.map((b) => [b.id, b]));
  const illustrations: StoryIllustration[] = GENESIS_ILLUSTRATIONS_META.map((il) => {
    const book = bookMap.get(il.bookId) || books[0];
    return {
      id: il.id,
      ord: il.number,
      bookId: il.bookId,
      chaptersRef: il.chaptersRef,
      title: il.title,
      artStyle: book.number === 1 ? "chalkboard" : "wet-on-wet",
      repoImage: il.image,
      imageGenerated: il.imageGenerated,
    };
  });

  const illMap = new Map(
    illustrations.map((il, idx) => [il.id, { il, meta: GENESIS_ILLUSTRATIONS_META[idx] }])
  );

  const scenes: StoryScene[] = GENESIS_CHAPTERS_SEED.map(
    ([globalNumber, bookId, chapterNumber, section, title, illustrationId]) => {
      const book = bookMap.get(bookId) || books[0];
      const illEntry = illMap.get(illustrationId) || {
        il: illustrations[0],
        meta: GENESIS_ILLUSTRATIONS_META[0],
      };
      const id = `${bookId}-chuong-${String(chapterNumber).padStart(2, "0")}`;
      const levelPaths = buildChapterLevelPaths(book, illEntry.meta, lang);
      const artStyle: WaldorfArtStyle = illEntry.il.artStyle;

      const formattedTitle =
        lang === "en"
          ? `Chapter ${chapterNumber}: ${title}`
          : lang === "zh"
          ? `第${chapterNumber}章：${title}`
          : `Chương ${chapterNumber}: ${title}`;

      const summaryPoints = [
        `${book.title} — ${section}.`,
        `${formattedTitle}.`,
        `Thuộc cụm minh họa ${illEntry.il.chaptersRef}: ${illEntry.il.title}.`,
        `Nội dung toàn văn và dàn ý đầy đủ được đồng bộ tự động từ ${book.level1File}.`,
      ];

      const passage = `${title} (${section} · ${book.title}). Nội dung toàn văn đang được đồng bộ từ kho GitHub (xuvivn/from-genesis-to-nativity)...`;
      const voiceNote =
        lang === "en"
          ? `Keep a warm storytelling pace matching ${book.title}. Read unhurriedly and pause naturally between images.`
          : lang === "zh"
          ? `保持与《${book.title}》契合的温暖讲述节奏，从容朗读并在每个画面之间自然停顿。`
          : `Giữ nhịp kể ấm áp theo tinh thần ${book.title}. Đọc chậm rãi, ngắt hơi tự nhiên theo từng hình ảnh.`;

      return {
        id,
        ord: globalNumber,
        chapterNumber,
        bookId,
        section,
        illustrationId,
        slug: illEntry.meta.image.split("/").pop()?.replace(/\.png$/, "") || id,
        isEpilogue: book.isEpilogue,
        title: formattedTitle,
        passage,
        voiceNote,
        detailedOutline: {
          characters: extractLikelyNames(title),
          localizedDetails: [],
          emotionalRhythm:
            SEED_BOOK_SOULS[book.id]?.storytellingRhythm ||
            "Nhịp kể tự nhiên, lắng đọng và giàu hình ảnh.",
          beats: summaryPoints,
        },
        summaryPoints,
        artStyle,
        repoImage: illEntry.il.repoImage,
        imageGenerated: illEntry.il.imageGenerated,
        levelPaths,
      };
    }
  );

  const storyTitle =
    lang === "en"
      ? "From Genesis to Nativity — 5-Level Storytelling Practice Corpus"
      : lang === "zh"
      ? "从创世到圣诞——五阶故事讲述练习语料库"
      : "Từ Sáng Thế Đến Giáng Sinh — Bộ Sử Thi Luyện Kể Chuyện 5 Cấp Độ";

  const genesisStory: WaldorfStory = {
    id: GENESIS_STORY_ID,
    language: lang,
    title: storyTitle,
    titleEn: "From Genesis to Nativity — Epic Storytelling Practice",
    sourceInfo:
      lang === "en"
        ? "Source: xuvivn/from-genesis-to-nativity · 5 Books · 180 Chapters · 28 Illustrations"
        : lang === "zh"
        ? "语料来源：xuvivn/from-genesis-to-nativity · 5卷 · 180章 · 28幅插画"
        : "Nguồn từ repo xuvivn/from-genesis-to-nativity · 5 Quyển · 180 Chương · 28 Tranh",
    targetAge: lang === "en" ? "9–10 years" : lang === "zh" ? "9–10岁" : "9–10 tuổi",
    styleReference: "Jakob Streit",
    goal:
      lang === "en"
        ? "Explore background context and practice telling all 180 chapters across 4 levels—from full text to 28 wordless illustrations."
        : lang === "zh"
        ? "理解故事背景与精神，并循序练习讲述全180章——从完整全文到28幅纯视觉记忆插画。"
        : "Đọc hiểu bối cảnh & luyện kể trọn vẹn 180 Chương theo 4 cấp độ từ toàn văn đến 28 tranh thuần hình ảnh.",
    defaultArtStyle: "chalkboard",
    repoUrl: GENESIS_REPO_URL,
    rawBaseUrl: GENESIS_JSDELIVR_BASE_URL,
    books,
    soul: {
      ...SEED_BOOK_SOULS["quyen-1"],
      overviewPath: `locales/${lang}/level-0-context/00-epic-soul-overview.md`,
      bookSouls: SEED_BOOK_SOULS,
      ancientBooks,
    },
    illustrations,
    scenes,
  };

  return {
    stories: [genesisStory],
    storiesByLang: { [lang]: genesisStory },
    updatedAt: new Date().toISOString(),
    version: "5.0-genesis-multilang",
  };
}

function extractLikelyNames(text: string): string[] {
  const regex =
    /(?:^|\s)([A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]+(?:\s+[A-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠƯẠ-Ỹ][a-zàáâãèéêìíòóôõùúăđĩũơưạ-ỹ]+)*)/g;
  const found: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const candidate = match[1].trim();
    if (candidate.length > 1) found.push(candidate);
  }
  const unique = Array.from(new Set(found)).slice(0, 5);
  return unique.length > 0 ? unique : ["Nhân vật chính trong chương"];
}
