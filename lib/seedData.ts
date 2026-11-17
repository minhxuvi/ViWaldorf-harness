import {
  AgeVariantId,
  AncientBookItem,
  PronunciationGuideItem,
  SceneLevelPaths,
  StoryBookMeta,
  StoryScene,
  StorySoulContext,
  WaldorfArtStyle,
  WaldorfData,
  WaldorfStory,
} from "./types";
import {
  GENESIS_JSDELIVR_BASE_URL,
  GENESIS_REPO_URL,
  GENESIS_STORY_ID,
} from "./repoStoryLoader";

const GENESIS_BOOKS: StoryBookMeta[] = [
  {
    id: "quyen-1",
    number: 1,
    slug: "quyen-1-khoi-nguyen-va-anh-sang",
    title: "Quyển I: Khởi Nguyên Và Ánh Sáng Đầu Tiên",
    subtitle: "Từ Sáng Thế Đến Đại Hồng Thủy",
    isEpilogue: false,
    illustrationStyle: "charcoal_and_golden_ochre_chalk_pastel",
    level0File: "level-0-khong-gian-boi-canh/quyen-1-khoi-nguyen-va-anh-sang.md",
  },
  {
    id: "quyen-2",
    number: 2,
    slug: "quyen-2-hanh-trinh-ve-dat-hua",
    title: "Quyển II: Hành Trình Về Đất Hứa",
    subtitle: "Từ Tháp Babel & Abraham Đến Giấc Mơ Vua David",
    isEpilogue: false,
    illustrationStyle: "monochrome_sepia_watercolor_and_pencil_oval_vignette",
    level0File: "level-0-khong-gian-boi-canh/quyen-2-hanh-trinh-ve-dat-hua.md",
  },
  {
    id: "quyen-3",
    number: 3,
    slug: "quyen-3-chung-ta-se-xay-mot-den-tho",
    title: "Quyển III: Chúng Ta Sẽ Xây Một Đền Thờ",
    subtitle: "Từ Đền Thờ Solomon Đến Các Tiên Tri Và Thời Phục Hưng",
    isEpilogue: false,
    illustrationStyle: "monochrome_sepia_watercolor_and_pencil_oval_vignette",
    level0File: "level-0-khong-gian-boi-canh/quyen-3-chung-ta-se-xay-mot-den-tho.md",
  },
  {
    id: "quyen-4",
    number: 4,
    slug: "quyen-4-hai-dua-tre-giang-sinh",
    title: "Quyển IV: Hai Đứa Trẻ Giáng Sinh Và Bình Minh Bên Sông Jordan",
    subtitle: "Hai Dòng Dõi Tại Nazareth Và Người Mở Đường Nơi Hoang Địa",
    isEpilogue: false,
    illustrationStyle: "monochrome_sepia_watercolor_and_pencil_oval_vignette",
    level0File: "level-0-khong-gian-boi-canh/quyen-4-hai-dua-tre-giang-sinh.md",
  },
  {
    id: "quyen-5",
    number: 5,
    slug: "quyen-5-ngoai-truyen-ong-gia-noel",
    title: "Quyển V (Ngoại Truyện): Hạt Giống Yêu Thương Đêm Đông",
    subtitle: "Từ Thánh Nicholas Thành Myra Đến Ông Già Noel",
    isEpilogue: true,
    illustrationStyle: "monochrome_sepia_watercolor_and_pencil_oval_vignette",
    level0File: "level-0-khong-gian-boi-canh/quyen-5-ngoai-truyen-ong-gia-noel.md",
  },
];

const GENESIS_ANCIENT_BOOKS: AncientBookItem[] = [
  { id: "sach-sang-the", title: "Sách Sáng Thế", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-sang-the.md" },
  { id: "sach-xuat-hanh", title: "Sách Xuất Hành", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-xuat-hanh.md" },
  { id: "sach-dan-so", title: "Sách Dân Số", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-dan-so.md" },
  { id: "sach-phuc-truyen-luat-le-ky", title: "Sách Phục Truyền Luật Lệ Ký", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-phuc-truyen-luat-le-ky.md" },
  { id: "sach-gio-sue", title: "Sách Giô-suê", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-gio-sue.md" },
  { id: "sach-sa-mu-en", title: "Sách Sa-mu-en", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-sa-mu-en.md" },
  { id: "sach-cac-vua", title: "Sách Các Vua", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-cac-vua.md" },
  { id: "sach-to-bit", title: "Sách Tô-bít", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-to-bit.md" },
  { id: "sach-i-sai-a", title: "Sách Tiên Tri I-sai-a", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-i-sai-a.md" },
  { id: "sach-gie-re-mi-a", title: "Sách Tiên Tri Giê-rê-mi-a", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-gie-re-mi-a.md" },
  { id: "sach-da-ni-en", title: "Sách Tiên Tri Đa-ni-en", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-da-ni-en.md" },
  { id: "sach-gio-na", title: "Sách Tiên Tri Giô-na", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-gio-na.md" },
  { id: "sach-ne-he-mi-a", title: "Sách Nê-hê-mi-a", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-ne-he-mi-a.md" },
  { id: "sach-giop", title: "Sách Gióp", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-giop.md" },
  { id: "sach-ma-ca-be", title: "Sách Ma-ca-bê", category: "cuu-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-ma-ca-be.md" },
  { id: "tin-mung-ma-thi-o", title: "Sách Tin Mừng Theo Ma-thi-ơ", category: "tan-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/tin-mung-ma-thi-o.md" },
  { id: "tin-mung-lu-ca", title: "Sách Tin Mừng Theo Lu-ca", category: "tan-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/tin-mung-lu-ca.md" },
  { id: "tin-mung-ma-ko", title: "Sách Tin Mừng Theo Ma-kô", category: "tan-uoc", file: "level-0-khong-gian-boi-canh/van-ban-co/tin-mung-ma-ko.md" },
  { id: "sach-khai-huyen-va-khoi-nguyen-co", title: "Sách Khải Huyền Và Cổ Thư Khởi Nguyên", category: "co-thu", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-khai-huyen-va-khoi-nguyen-co.md" },
  { id: "co-thu-tu-nhien-buoi-dau", title: "Cổ Thư Tự Nhiên Buổi Đầu", category: "co-thu", file: "level-0-khong-gian-boi-canh/van-ban-co/co-thu-tu-nhien-buoi-dau.md" },
  { id: "sach-cuoc-doi-adam-va-eve", title: "Sách Cuộc Đời Adam Và Eve", category: "co-thu", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-cuoc-doi-adam-va-eve.md" },
  { id: "sach-e-noc", title: "Sách Ê-nóc", category: "co-thu", file: "level-0-khong-gian-boi-canh/van-ban-co/sach-e-noc.md" },
  { id: "co-su-luong-ha-va-ai-cap", title: "Cổ Sử Lưỡng Hà Và Ai Cập", category: "co-thu", file: "level-0-khong-gian-boi-canh/van-ban-co/co-su-luong-ha-va-ai-cap.md" },
  { id: "co-truyen-nazareth-va-bien-chet", title: "Cổ Truyền Nazareth Và Cộng Đồng Biển Chết", category: "co-thu", file: "level-0-khong-gian-boi-canh/van-ban-co/co-truyen-nazareth-va-bien-chet.md" },
  { id: "su-truyen-thanh-nicholas", title: "Sử Truyền Thánh Nicholas Thành Myra Và Huyền Thoại Mùa Đông", category: "co-thu", file: "level-0-khong-gian-boi-canh/van-ban-co/su-truyen-thanh-nicholas.md" },
];

const SEED_BOOK_SOULS: Record<string, StorySoulContext> = {
  "quyen-1": {
    culturalSpirit:
      "Quyển I đưa người nghe trở về thời đại huyền thoại sơ khai nhất: thuở thế giới chưa phải là khối vật chất lạnh lẽo mà là một công trình đang thở của Ánh Sáng và Âm Nhạc, nối từ bình minh Sáng Thế qua Vườn Địa Đàng, Cain–Abel–Seth, Enoch tới Con Tàu Noah và Cầu Vồng Giao Ước.",
    storytellingRhythm:
      "Giọng mở màn vang, rộng, tròn hơi cho Cảnh 01–02; mềm lại giàu chất thơ ở Cảnh 03–04; ấm áp đời thường pha kịch tính ở Cảnh 05–07; rồi dào dạt nhịp sóng nước và bình yên cầu vồng ở Cảnh 08.",
    ageMetaphor:
      "Con người đứng giữa sáng và tối như bông hoa: bằng đóa hoa nó mở ra đón ánh sáng, và bằng bộ rễ nó bám chặt vào đất tối để đứng thẳng lên.",
    ageMetaphors: {
      "3-5": "Thế giới này được tạo ra từ tình yêu thương và ánh sáng; mọi loài vật đều có một chỗ ấm áp trong vòng tay che chở.",
      "6-10": "Sức mạnh thật sự nằm ở đôi tay biết xây dựng (Jabal), tiếng đàn cảm hóa (Jubal), lòng dũng cảm nói sự thật (Enoch) và sự trung tín của Noah.",
      "11+": "Mỗi công cụ con người tạo ra mang hai khả năng phục vụ sự sống hay dục vọng; ngôi mộ Adam tại đồi Golgatha nối khởi nguyên với lời hứa cứu chuộc.",
    },
    pronunciations: [
      { term: "Michael", pronunciation: "Mi-kha-en", meaning: "Tổng lãnh thiên thần cầm gươm ánh sáng (Cảnh 01)" },
      { term: "Adam & Eve", pronunciation: "A-đam & Ê-va", meaning: "Con người đầu tiên trong Vườn Địa Đàng (Cảnh 02–05)" },
      { term: "Enoch", pronunciation: "Ê-nóc", meaning: "Vị thánh giả áo trắng tìm lại Sách Sự Sống (Cảnh 07)" },
      { term: "Noah", pronunciation: "Nô-ê", meaning: "Người đóng Con Tàu gỗ tuyết tùng vượt Đại Hồng Thủy (Cảnh 08)" },
    ],
  },
  "quyen-2": {
    culturalSpirit:
      "Quyển II bước ra khỏi thế giới huyền thoại chung sang hành trình tâm thức của một gia tộc trên vùng Lưỡng Hà, Canaan, Ai Cập và sa mạc Sinai: từ Tháp Babel, Abraham, Jacob, Joseph đến Moses và Vua David.",
    storytellingRhythm:
      "Nhịp bước chân du mục khoan thai qua sa mạc cát vàng, căng thẳng kịch tính khi đối đầu lò lửa và Biển Đỏ rẽ đôi, lắng đọng bên tiếng đàn hạc chăn cừu của David.",
    ageMetaphor:
      "Học lòng tin và sự kiên trì qua thử thách, biết nhường nhịn hòa giải (Esau–Jacob) và chọn lòng tha thứ thay vì báo thù.",
    ageMetaphors: {
      "3-5": "Ánh sao dẫn đường trên sa mạc và tiếng đàn ấm áp giúp tâm hồn bình an trước mọi bão tố.",
      "6-10": "Lòng dũng cảm không nằm ở tháp cao hay áo giáp nặng mà ở viên đá cuội nhỏ, chiếc cầu thang ánh sáng và tình anh em đoàn tụ.",
      "11+": "Hành trình rời bỏ thành thị vật chất để tìm tự do nội tâm, giữ giao ước luật trời và biến oán thù thành lòng bao dung.",
    },
    pronunciations: [
      { term: "Abram / Abraham", pronunciation: "Áp-ram / Áp-ra-ham", meaning: "Tổ phụ bước ra khỏi lò lửa và lên đường theo ánh sao (Cảnh 09–10)" },
      { term: "Jacob", pronunciation: "Gia-cốp", meaning: "Người mơ thấy Chiếc Thang Ánh Sáng tại Beth-El (Cảnh 11)" },
      { term: "Moses", pronunciation: "Mô-sê", meaning: "Người dẫn dân vượt Biển Đỏ và nhận Mười Điều Răn (Cảnh 13–14)" },
      { term: "David", pronunciation: "Đa-vít", meaning: "Chàng mục đồng gảy đàn hạc và giấc mơ Cây Thế Giới (Cảnh 15)" },
    ],
  },
  "quyen-3": {
    culturalSpirit:
      "Quyển III dõi theo công cuộc xây dựng Ngôi Đền Thờ Jerusalem thời Vua Solomon, sự sụp đổ trong khói lửa lưu đày Babylon và ngọn lửa nội tâm bền bỉ qua các tiên tri Elijah, Tobias, Isaiah, Jeremiah, Daniel, Jonah, Job và Judas Maccabeus.",
    storytellingRhythm:
      "Trang nghiêm rực rỡ khi xây Đền Thờ không tiếng búa ồn ào, sâu thẳm suy tư giữa hang sư tử và giếng bùn lưu đày, rồi bừng sáng hồi sinh khi thắp lại ngọn đèn Đền Thờ.",
    ageMetaphor:
      "Đền thờ bền vững nhất không làm từ vàng đá bên ngoài mà ở trái tim biết lắng nghe, lòng trung thực và ngọn lửa hy vọng giữa tro tàn.",
    ageMetaphors: {
      "3-5": "Ngọn lửa nhỏ ấm áp không tắt trong hũ bột không vơi và đôi mắt sáng lại nhờ tình yêu thương của Tobias.",
      "6-10": "Trái tim thông tuệ của Solomon, tiếng thì thầm làn gió nhẹ của Elijah và lòng kiên trung giữa hang sư tử của Daniel.",
      "11+": "Nghịch lý đau khổ vô tội của Job, lòng thương xót vượt định kiến của Jonah và sự chuyển hóa Đền Thờ từ kiến trúc đá sang lương tâm con người.",
    },
    pronunciations: [
      { term: "Solomon", pronunciation: "Sa-lô-môn", meaning: "Vị vua xin trái tim thông tuệ xây Đền Thờ Jerusalem (Cảnh 16)" },
      { term: "Elijah", pronunciation: "Ê-li-gia", meaning: "Tiên tri nghe tiếng gió thoảng trên núi Horeb (Cảnh 17)" },
      { term: "Daniel", pronunciation: "Đa-ni-en", meaning: "Người giữ lòng thanh sạch trong lò lửa và hang sư tử Babylon (Cảnh 20)" },
      { term: "Job", pronunciation: "Gióp", meaning: "Người công chính giữ vững niềm tin giữa mất mát tận cùng (Cảnh 22)" },
    ],
  },
  "quyen-4": {
    culturalSpirit:
      "Quyển IV là điểm hội tụ của toàn bộ sử thi: hai ngọn nguồn dòng dõi Vua David (một bên thông tuệ hoàng tộc, một bên trong sáng mục đồng) cùng gặp nhau tại ngôi làng yên bình Nazareth, song hành với hành trình trưởng thành của John nơi Biển Chết tới bình minh trên sông Jordan.",
    storytellingRhythm:
      "Nhịp kể đêm đông tĩnh mịch và ấm áp ánh nến Bethlehem, trong trẻo tình bạn tuổi thơ ở Nazareth, trầm sâu bên giếng nước và trang nghiêm khi bầu trời mở ra trên sông Jordan.",
    ageMetaphor:
      "Ánh sáng lớn lao nhất sinh ra trong hang đá khiêm nhường và lớn lên giữa tình bạn biết nâng niu một chú chim non bị thương.",
    ageMetaphors: {
      "3-5": "Ngôi sao sáng trên mái nhà mùa đông, hai người bạn nhỏ cùng ủ ấm chú chim non và dòng sông mát lành.",
      "6-10": "Hai dòng dõi bổ khuyết cho nhau trong tình bạn Nazareth và đôi tay thợ mộc dịu dàng đóng chiếc ghế tặng bà cụ.",
      "11+": "Sự hợp nhất của hai dòng truyền thống trí tuệ và trái tim thuần khiết cùng sự khiêm nhường rút lui của John trước bình minh mới.",
    },
    pronunciations: [
      { term: "Zechariah & Elizabeth", pronunciation: "Xa-ca-ri-a & Ê-li-da-bét", meaning: "Cha mẹ của John (Cảnh 23)" },
      { term: "Nazareth", pronunciation: "Na-da-rét", meaning: "Ngôi làng đồi nhỏ nơi hai gia đình Giuse–Maria sống cạnh nhau (Cảnh 24–26)" },
      { term: "Qumran / Essenes", pronunciation: "Cum-ran / Ét-xen", meaning: "Cộng đồng áo trắng bên Biển Chết (Cảnh 27)" },
      { term: "Jordan", pronunciation: "Giô-đan", meaning: "Dòng sông diễn ra phép rửa và bình minh chim bồ câu (Cảnh 27)" },
    ],
  },
  "quyen-5": {
    culturalSpirit:
      "Quyển V (Ngoại Truyện) nối ánh sáng Giáng sinh từ thế kỷ IV nơi thành cảng Myra với vị Giám mục nhân hậu Nicholas lặng lẽ thả ba túi vàng qua cửa sổ, rồi vượt biển thành Sinterklaas và Ông già Noel quen thuộc với tuổi thơ hôm nay.",
    storytellingRhythm:
      "Như lời thủ thỉ ấm áp bên bếp lửa sau phần sử thi chính: có chút bí mật háo hức khi vàng rơi vào chiếc tất, rộn ràng sóng biển cứu đói và tiếng chuông tuyết mùa đông.",
    ageMetaphor:
      "Ông già Noel có thật mỗi khi có một bàn tay âm thầm đặt điều tốt lành vào cuộc đời người khác mà chẳng cần được ghi công.",
    ageMetaphors: {
      "3-5": "Chiếc tất nhỏ treo cạnh bếp lửa nhắc bé giữ trái tim sạch sẽ, ấm áp để bí mật chia sẻ niềm vui cùng mọi người.",
      "6-10": "Sự tử tế đích thực giữ được phẩm giá cho người nhận và niềm vui tinh khiết không vụ lợi cho người trao đi.",
      "11+": "Hạt giống tình thương vô điều kiện sống qua mười bảy thế kỷ văn hóa dân gian mà không đánh mất cốt lõi nhân bản Giáng sinh.",
    },
    pronunciations: [
      { term: "Nicholas", pronunciation: "Ni-cô-la", meaning: "Vị giám mục nhân hậu xứ Myra thế kỷ IV (Cảnh 28)" },
      { term: "Patara & Myra", pronunciation: "Pa-ta-ra & My-ra", meaning: "Thành cảng Địa Trung Hải gắn với cuộc đời Thánh Nicholas (Cảnh 28)" },
      { term: "Sinterklaas", pronunciation: "Xin-tơ-clát", meaning: "Tên gọi dân gian Hà Lan tiền thân của Santa Claus (Cảnh 28)" },
    ],
  },
};

interface SeedSceneInput {
  id: string;
  number: number;
  slug: string;
  title: string;
  bookId: string;
  isEpilogue?: boolean;
  imageGenerated: boolean;
  summaryPoints: string[];
}

const GENESIS_SCENES_META: SeedSceneInput[] = [
  {
    id: "canh-01",
    number: 1,
    slug: "canh-01-khoi-nguyen-va-cuoc-chien-anh-sang",
    title: "Khởi Nguyên Thế Giới Và Cuộc Chiến Giữa Ánh Sáng Với Bóng Tối",
    bookId: "quyen-1",
    imageGenerated: true,
    summaryPoints: [
      "Thuở ban đầu chưa có đất đá núi sông, chỉ có bóng tối lạnh lẽo và Đấng Tạo Hóa ngự trong ánh sáng vô biên.",
      "Một tia sáng bừng lên xua tan bóng tối, kéo theo điệu nhạc hoan ca của các thiên thần.",
      "Con Rồng tối muốn dập tắt ánh sáng khiến trời đất rung chuyển trong cuộc chiến lớn đầu tiên.",
      "Tổng lãnh thiên thần Michael cầm thanh gươm tia chớp dẫn thiên binh đẩy lùi Con Rồng xuống vực sâu, mở đường cho công trình sáng tạo thế giới.",
    ],
  },
  {
    id: "canh-02",
    number: 2,
    slug: "canh-02-bay-ngay-sang-the",
    title: "Bảy Ngày Sáng Thế Và Sự Tạo Dựng Con Người Đầu Tiên",
    bookId: "quyen-1",
    imageGenerated: true,
    summaryPoints: [
      "Ngày 1–3: Ánh sáng chia ngày và đêm; vòm trời ngăn mây nước; đất liền nổi lên cùng cỏ cây hoa trái.",
      "Ngày 4–5: Mặt trời, mặt trăng, các vì sao chuyển động phân định mùa màng; muôn cá bơi dưới biển và chim chóc bay khắp bầu trời.",
      "Ngày 6: Thú rừng và gia súc bước ra trên mặt đất; Đấng Tạo Hóa nặn hình hài con người đầu tiên từ đất ấm, thổi hơi thở ánh sáng ban linh hồn và đặt tên là Adam.",
      "Ngày 7: Trời đất tạm nghỉ trong bình yên thiêng liêng; Adam mở mắt chiêm ngưỡng muôn loài từ dưới tán cây.",
    ],
  },
  {
    id: "canh-03",
    number: 3,
    slug: "canh-03-muon-hoa-va-muon-thu-buoi-dau",
    title: "Muôn Hoa, Cây Cỏ Và Loài Vật Giữa Ánh Sáng Và Bóng Tối",
    bookId: "quyen-1",
    imageGenerated: true,
    summaryPoints: [
      "Đóa hoa ban trắng (hoa tuyết điểm) dũng cảm đứng lại trên đỉnh núi đá cao gần ánh sao và giữ được vẻ tinh khiết đầu tiên.",
      "Một số loài cây vô tình hút phải bóng tối sót lại nên mang sắc độc báo hiệu như cây cà độc dược, nhắc con người biết phân biệt lành – dữ.",
      "Hoa hồng xin thêm hàng gai nhỏ quanh thân để tự bảo vệ vẻ đẹp thơm ngát trước thú hoang.",
      "Muôn thú cũng phân thành hai hướng: bồ câu và cừu non hướng về ánh sáng ban ngày, còn dơi và sói lùi vào bóng tối hang sâu.",
    ],
  },
  {
    id: "canh-04",
    number: 4,
    slug: "canh-04-vuon-dia-dang-va-buoc-chan-xuong-tran",
    title: "Vườn Địa Đàng, Trái Cấm Và Những Giọt Nước Mắt Đầu Tiên Trên Mặt Đất",
    bookId: "quyen-1",
    imageGenerated: true,
    summaryPoints: [
      "Trong Vườn Địa Đàng rực rỡ hàng rào tia sáng, Đấng Tạo Hóa tạo nên người bạn đồng hành Eve để cùng Adam chăm sóc khu vườn và đặt tên muôn loài.",
      "Con rắn cám dỗ Eve và Adam hái trái Cây Tri Thức điều thiện – điều ác dù đã có lời dặn giữ gìn.",
      "Hàng rào ánh sáng khép lại; hai người bước ra khỏi khu vườn qua cổng thiên sứ gác, lần đầu chạm chân trần lên đất sỏi trần gian.",
      "Giữa màn đêm lạnh giá ngoài vườn, Eve bật khóc nức nở nhớ ánh sáng cũ, còn Adam nhóm ngọn lửa đầu tiên trên bàn thờ đá cầu xin nâng đỡ.",
    ],
  },
  {
    id: "canh-05",
    number: 5,
    slug: "canh-05-cain-abel-va-hat-giong-su-song",
    title: "Cain, Abel, Người Em Mới Seth Và Ba Hạt Giống Cây Sự Sống",
    bookId: "quyen-1",
    imageGenerated: true,
    summaryPoints: [
      "Cain (chăm chỉ cày đất trồng lúa) và Abel (hiền lành chăn bầy chiên) cùng lập bàn thờ dâng lễ vật đầu mùa.",
      "Khói hương của Abel bay thẳng lên trời trong khi khói của Cain tạt ngang mặt đất, làm bùng lên cơn ghen tức khiến Cain lỡ tay đánh ngã em mình bên bờ suối rồi bỏ đi biệt xứ.",
      "Giữa nỗi đau mất con của Adam và Eve, thiên thần an ủi báo tin cậu con trai thứ ba là Seth chào đời giữa đàn bồ câu trắng để giữ gìn Cuốn Sách Sự Sống.",
      "Cuối đời Adam, Seth tới cổng Địa Đàng xin ba hạt giống Cây Sự Sống đặt dưới lưỡi cha lúc an táng; từ đó mọc lên ba chồi cây thiêng nối vào dòng lịch sử tương lai.",
    ],
  },
  {
    id: "canh-06",
    number: 6,
    slug: "canh-06-con-chau-cain-va-ngon-lua-van-minh",
    title: "Ba Con Trai Của Cain: Thuần Hóa Muôn Thú, Tiếng Đàn Thiên Giới Và Lò Rèn Sắt",
    bookId: "quyen-1",
    imageGenerated: true,
    summaryPoints: [
      "Dòng dõi Cain lập nên nền văn minh đầu tiên với ba anh em: Jabal thuần hóa ngựa – bò – chó mèo và dựng ngôi nhà tròn có cành lộc cất nóc; Thubal-Cain mở lò rèn đồng sắt; Jubal sáng tạo cây sáo và đàn hạc.",
      "Ba con dao được rèn từ một lò: dao vàng của Seth dâng lễ đồng ruộng, dao bạc của Jubal chạm trổ cây sáo, và con dao sắt bị một thợ phụ giấu kín.",
      "Tiếng đàn của Jubal làm sói, cáo, gấu, thỏ cùng nằm ngủ hòa bình bên nhau và khiến dân làng thức giấc lập bàn thờ cảm tạ trên đồi.",
      "Lão Cộc nóng nảy dùng con dao sắt giấu kín gây án mạng rồi thành cướp rừng; nhờ tiếng đàn ru dịu lương tri và sự dẫn dắt của thiên thần, Jubal thoát hiểm an toàn trong đêm rừng tối.",
    ],
  },
  {
    id: "canh-07",
    number: 7,
    slug: "canh-07-enoch-nguoi-giu-anh-sang",
    title: "Ánh Sáng Của Enoch Giữa Đêm Tối Ngẫu Tượng",
    bookId: "quyen-1",
    imageGenerated: true,
    summaryPoints: [
      "Khi Seth về già giấu Cuốn Sách Sự Sống vào hang pha lê niêm phong, kẻ nhạo báng là Enos nặn tượng đất sét gọi ác linh nhập vào và đặt dấu vạch đen trên trán người theo hắn.",
      "Đáp lại tiếng khóc thiên thần, linh hồn dũng cảm của Enoch giáng sinh dưới ánh sáng rực rỡ và đàn chim trắng bay vòng trên mái nhà.",
      "Trưởng thành, Enoch bước vào thành phố đập tan tượng thần đất sét, mở hang đá lấy lại Sách Sự Sống dưới sự chỉ dạy của đại thiên thần, rồi cảm hóa cả băng cướp bằng ngụ ngôn \"bông hoa đón sáng nhưng bám rễ vào đất tối\".",
      "Sau bảy năm dẫn dắt dân sống an hòa quanh ngọn núi thiêng, Enoch bước lên dãy núi tuyết và cùng mười hai linh hồn trung kiên cưỡi con ngựa trắng có cánh bay thẳng vào giữa các vì sao.",
    ],
  },
  {
    id: "canh-08",
    number: 8,
    slug: "canh-08-con-tau-noah-va-cau-vong-giao-uoc",
    title: "Con Tàu Của Noah, Cơn Đại Hồng Thủy Và Chiếc Cầu Vồng Giao Ước",
    bookId: "quyen-1",
    imageGenerated: true,
    summaryPoints: [
      "Trước Thành phố Trăm Ngẫu Tượng băng hoại, cụ Methusala và cháu nội là Noah giữ ngọn lửa thiện lương; Noah đối đầu vị Vua đội vương miện đen và được Tổng lãnh thiên thần Raphael dẫn đọc Sách Sự Sống.",
      "Nhận lệnh trời, Noah cùng ba con trai Sem, Ham, Jafet đóng Con Tàu gỗ tuyết tùng ba tầng trên núi, gắn viên ngọc dạ quang Anoa lên quan tài Adam để thắp sáng, đưa từng cặp muôn loài vào tàu.",
      "Mưa lớn sấm sét suốt 40 ngày đêm nhấn chìm thế giới cũ; khi nước rút, quạ bay đi rồi chim bồ câu tha nhành ô liu từ Núi Ô Liu trở về báo tin đất mới.",
      "Gia đình Noah bước ra dâng lễ tạ ơn dưới chiếc cầu vồng giao ước; Noah trồng vườn nho bị ma quỷ thử thách bằng ngụ ngôn bốn con vật, còn Sem theo thiên thần khiêng quan tài Adam đi an táng tại ngọn đồi Golgatha.",
    ],
  },
  {
    id: "canh-09",
    number: 9,
    slug: "canh-09-thap-babel-va-abram-buoc-ra-khoi-lua",
    title: "Ngai Bảy Tầng Của Nimrod, Tháp Babel Và Chàng Trai Abram Bước Ra Khỏi Lò Lửa",
    bookId: "quyen-2",
    imageGenerated: true,
    summaryPoints: [
      "Loài người tụ họp quanh vua Nimrod kiêu ngạo ngồi ngai bảy tầng, cùng nung gạch xây ngọn Tháp Babel cao chạm mây để thách thức bầu trời.",
      "Từ trong gia đình thợ tạc tượng, chàng trai Abram nhận ra mặt trời – mặt trăng – ngôi sao đều do Đấng Tối Cao điều khiển nên đập bỏ tượng thần rỗng tuếch.",
      "Bị Nimrod ném vào lò lửa rực cháy, Abram bước ra bình an vô sự nhờ thiên thần che chở giữa kinh ngạc của cả triều đình.",
      "Trên công trường Tháp Babel, bảy mươi thiên thần làm ngôn ngữ loài người chia rẽ khiến thợ thuyền không hiểu nhau mà bỏ dở ngọn tháp, còn Abram cùng vợ Sarai lên đường về miền đất Canaan.",
    ],
  },
  {
    id: "canh-10",
    number: 10,
    slug: "canh-10-abraham-goc-cay-thieng-va-le-hien-te-isaac",
    title: "Lời Hứa Dưới Trời Sao, Cây Cổ Thụ Của Abraham Và Phép Thử Trên Núi Moriah",
    bookId: "quyen-2",
    imageGenerated: true,
    summaryPoints: [
      "Dưới bầu trời đêm đầy sao, Abram đổi tên thành Abraham với lời hứa dòng dõi đông như sao trời; dưới bóng cây cổ thụ sum suê, ông ân cần tiếp đãi ba vị khách thiên thần báo tin con trai Isaac sắp chào đời.",
      "Khi vợ chồng tuổi già đón bé Isaac, Abraham vượt qua phép thử cuối cùng trên đỉnh núi Moriah khi sẵn sàng vâng phục hoàn toàn rồi được thiên thần giữ tay lại, chỉ sang chú cừu đực mắc bụi gai.",
      "Khói lửa tại Sodom nhắc bài học về lòng ngay thẳng; về già Abraham sai người hầu trung thành mang mười con lạc đà đi tìm vợ cho Isaac.",
      "Bên giếng nước sa mạc, cô gái Rebecca chủ động múc nước cho cả người lữ hành lẫn đàn lạc đà, trở thành người mẹ mới trong gia đình giao ước.",
    ],
  },
  {
    id: "canh-11",
    number: 11,
    slug: "canh-11-chiec-thang-anh-sang-cua-jacob",
    title: "Hai Anh Em Esau – Jacob, Chiếc Thang Ánh Sáng Và Cuộc Hòa Giải",
    bookId: "quyen-2",
    imageGenerated: false,
    summaryPoints: [
      "Isaac sinh hai anh em song sinh tính tình trái ngược: Esau hào phóng thích săn bắn, Jacob trầm lặng suy tư; do giành phần chúc phúc của cha, Jacob phải bỏ trốn lên đường.",
      "Giữa đêm hoang vắng tại Beth-El, Jacob gối đầu lên phiến đá và mơ thấy Chiếc Thang Ánh Sáng nối đất lên trời với các thiên thần bước lên xuống, nghe lời hứa bình an đồng hành.",
      "Tới xứ lạ gặp nàng Rachel bên giếng, Jacob lao động mười bốn năm ròng rã để cưới người mình thương và trở thành cha của mười hai người con trai.",
      "Trên đường hồi hương, Jacob dâng tặng lễ vật khiêm nhường và ôm chặt anh Esau trong nước mắt hòa giải xóa sạch oán thù năm xưa.",
    ],
  },
  {
    id: "canh-12",
    number: 12,
    slug: "canh-12-joseph-chiec-ao-ngu-sac-va-nguoi-ban-banh-mi",
    title: "Chiếc Áo Ngũ Sắc Của Joseph, Giấc Mơ Pharaoh Và Cuộc Đoàn Tụ Nước Mắt",
    bookId: "quyen-2",
    imageGenerated: false,
    summaryPoints: [
      "Cậu bé Joseph thông minh được cha may tặng chiếc áo ngũ sắc và hay kể giấc mơ lạ khiến các anh ganh ghét, đẩy xuống hố cạn rồi bán cho đoàn buôn sang Ai Cập.",
      "Dù bị vu oan tống vào ngục tối, Joseph vẫn giữ lòng ngay thẳng, giải đúng giấc mơ cho các tù nhân rồi được gọi giải mộng 7 con bò béo – 7 bông lúa gầy báo trước nạn đói cho Pharaoh.",
      "Được phong làm tể tướng coi giữ kho thóc toàn Ai Cập, Joseph tích trữ lương thực suốt bảy năm được mùa để cứu sống hàng vạn người trong bảy năm hạn hán.",
      "Khi các anh từ Canaan sang mua lúa, Joseph thử lòng họ qua chiếc cốc bạc đặt trong bao của em út Benjamin, thấy họ biết hy sinh bảo vệ em liền bật khóc nhận thân và đón cả cha Jacob sang Ai Cập.",
    ],
  },
  {
    id: "canh-13",
    number: 13,
    slug: "canh-13-moses-bui-gai-chay-va-bien-do-re-nuoc",
    title: "Hài Nhi Moses Trên Sông Nile, Bụi Gai Bốc Cháy Và Biển Đỏ Rẽ Đôi",
    bookId: "quyen-2",
    imageGenerated: false,
    summaryPoints: [
      "Pharaoh mới đày ải dân Israel làm nô lệ; một bà mẹ đặt con trai nhỏ vào chiếc giỏ sậy thả trôi sông Nile để công chúa Ai Cập Bithia vớt lên nuôi và đặt tên là Moses.",
      "Trong phép thử đĩa vàng và than hồng, em bé chạm vào than đỏ giữ được mạng sống; khi trưởng thành bênh vực đồng bào, Moses phải trốn sang xứ Midian làm mục đồng.",
      "Tìm chú dê con lạc gần núi Horeb, Moses thấy Bụi Gai Bốc Cháy không lụi tàn và nghe tiếng Chúa trao sứ mạng giải phóng cùng anh trai Aaron và cây gậy được chúc phúc.",
      "Sau mười tai ương và đêm Lễ Vượt Qua, Moses dẫn đoàn người tiến tới Biển Đỏ; dòng nước rẽ đôi mở lối khô đi qua rồi khép lại nhấn chìm đội quân truy đuổi, vang lên bài ca tạ ơn của Miriam.",
    ],
  },
  {
    id: "canh-14",
    number: 14,
    slug: "canh-14-muoi-dieu-ran-den-tam-va-cai-nhin-tu-nui-nebo",
    title: "Mười Điều Răn Trên Đỉnh Sinai, Ngôi Đền Tạm Và Cái Nhìn Cuối Cùng Từ Núi Nebo",
    bookId: "quyen-2",
    imageGenerated: false,
    summaryPoints: [
      "Giữa sa mạc khô khát, đoàn người được cứu bằng giếng nước ngọt Mara, bánh trời manna chỉ lấy đủ mỗi ngày và tảng đá phun nước; Joshua dẫn dân đẩy lùi quân Amalekites nhờ đôi tay giơ cao gậy thiêng của Moses.",
      "Lên đỉnh núi Sinai suốt bốn mươi ngày, Moses nhận hai tấm bia Mười Điều Răn; khi xuống núi thấy dân đúc Con Bê Vàng, ông đập vỡ bia răn rồi dựng lại Đền Tạm di động chứa Hòm Giao Ước.",
      "Bốn mươi năm rèn luyện qua phép thử Con Rắn Đồng chữa lành và phép thuật bất thành của Bileam bên con lừa biết nói; Aaron trao áo Thượng Tế cho Eleazar trên núi Hor.",
      "Tới núi Nebo, Moses giao quyền cho Joshua, phóng tầm mắt ôm trọn vùng đất hứa Canaan rồi về trời; Joshua cho 12 tư tế khiêng Hòm Giao Ước rẽ nước sông Jordan và hạ tường thành Jericho.",
    ],
  },
  {
    id: "canh-15",
    number: 15,
    slug: "canh-15-vua-saul-tieng-dan-david-va-giac-mo-cay-the-gioi",
    title: "Vua Saul, Tiếng Đàn Chăn Cừu Của David Và Giấc Mơ Cây Thế Giới",
    bookId: "quyen-2",
    imageGenerated: false,
    summaryPoints: [
      "Tiên tri Samuel xức dầu cho chàng trai tuấn tú Saul dưới bầu trời sao; nhưng chiến thắng làm Saul dần kiêu ngạo nên Samuel bí mật tới Bethlehem xức dầu cho cậu bé út tên David.",
      "Giữa đồng cỏ Bethlehem, cậu mục đồng David đánh chết sư tử cứu chiên, luyện bắn ná với đá cuội suối và gảy đàn hạc dỗ dịu cơn u tối của Vua Saul trong cung điện.",
      "Trước gã khổng lồ Goliath bên quân Philistines, David chỉ dùng chiếc ná dây da và một viên đá cuội đánh gục gã khổng lồ; tình bạn với hoàng tử Jonathan càng khiến lòng ghen của Saul bùng phát.",
      "Hai lần tha mạng cho Saul trong hang đá Engedi mở ra tinh thần tha thứ mới; David lên ngôi rước Hòm Giao Ước về Jerusalem và mãn nguyện trong giấc mơ thấy hai nhánh cây của Solomon và Nathan đan kết thành Cây Thế Giới.",
    ],
  },
  {
    id: "canh-16",
    number: 16,
    slug: "canh-16-solomon-trai-tim-thong-tue-va-ngoi-den-tho",
    title: "Trái Tim Thông Tuệ Của Vua Solomon Và Ngôi Đền Thờ Jerusalem",
    bookId: "quyen-3",
    imageGenerated: false,
    summaryPoints: [
      "Vừa lên ngôi, Vua trẻ Solomon không xin vàng bạc trường thọ mà chỉ xin một \"trái tim biết lắng nghe và phân biệt thiện ác\", lập tức chứng tỏ công lý khi phân xử hai người mẹ tranh một em bé.",
      "Hợp tác cùng Vua Hiram xứ Tyre xẻ gỗ tuyết tùng và đẽo đá sẵn từ xa để công trường không vang tiếng búa ồn ào, Solomon xây nên Ngôi Đền Thờ tráng lệ đặt Hòm Giao Ước tại Jerusalem.",
      "Danh tiếng minh triết của Solomon vang xa khiến Nữ hoàng phương Nam (Sheba) vượt sa mạc tới thử thách bằng câu đố phân biệt hoa thật – hoa giả nhờ con ong rồi kinh ngạc bái phục.",
      "Về cuối đời, lòng ham mê quyền lực và xa hoa làm trái tim Solomon rạn nứt khỏi sự khiêm nhường ban đầu, gieo mầm chia rẽ vương quốc thành hai nửa.",
    ],
  },
  {
    id: "canh-17",
    number: 17,
    slug: "canh-17-tien-tri-elijah-ngon-lua-trung-thuc-va-co-xe-lua",
    title: "Tiên Tri Elijah: Hũ Bột Không Vơi, Ngọn Lửa Trên Núi Carmel Và Cỗ Xe Lửa",
    bookId: "quyen-3",
    imageGenerated: false,
    summaryPoints: [
      "Khi triều đình sa vào thờ ngẫu tượng, tiên tri Elijah lánh vào khe suối được đàn quạ tiếp tế bánh rồi đến nhà bà góa nghèo chia sẻ hũ bột và bình dầu kỳ diệu không bao giờ cạn.",
      "Trên đỉnh núi Carmel trước hàng trăm thầy cúng, Elijah đổ nước ướt đẫm bàn thờ đá và khấn xin lửa trời giáng xuống đốt sạch lễ vật, thức tỉnh lòng tin dân chúng.",
      "Bị truy sát tới núi Horeb, Elijah nhận ra Chúa hiện diện sâu nhất không trong bão tố hay lửa lớn mà trong \"tiếng thì thầm êm dịu của làn gió thoảng\".",
      "Elijah trao chiếc áo choàng tiên tri cho học trò Elisha và được cỗ xe lửa rực sáng đón lên trời; tiếp nối thầy, Elisha chữa lành viên tướng Naaman dưới sông Jordan.",
    ],
  },
  {
    id: "canh-18",
    number: 18,
    slug: "canh-18-hanh-trinh-cua-tobias-va-thien-than-chua-lanh",
    title: "Chuyến Đi Của Chàng Trẻ Tobias Và Thiên Thần Chữa Lành Raphael",
    bookId: "quyen-3",
    imageGenerated: false,
    summaryPoints: [
      "Trong cảnh lưu đày nghèo khó, ông lão Tobit dù mất thị lực vẫn âm thầm chôn cất người bất hạnh và dặn con trai Tobias đi xứ xa nhận lại món tiền gửi nhờ người bạn xưa.",
      "Lên đường cùng chú chó nhỏ trung thành, Tobias gặp chàng thanh niên hiền hòa tự xưng là Azariah xin làm bạn đồng hành dẫn lối qua sông suối.",
      "Bên bờ sông Tigris, theo lời Azariah, Tobias bắt con cá lớn giữ mật làm thuốc quý; tới nhà họ hàng, chàng cưới cô gái Sara và xua tan bóng tối bảo vệ gia đình mới.",
      "Trở về nhà, Tobias nhỏ mật cá làm đôi mắt cha sáng bừng trở lại; vị khách Azariah mới mỉm cười hé lộ mình chính là Tổng lãnh thiên thần chữa lành Raphael rồi biến vào ánh sáng.",
    ],
  },
  {
    id: "canh-19",
    number: 19,
    slug: "canh-19-isaiah-va-jeremiah-loi-tien-tri-giua-tro-tan",
    title: "Đôi Môi Chạm Lửa Của Isaiah Và Jeremiah Giấu Hòm Giao Ước Trước Giờ Đền Thờ Sụp Đổ",
    bookId: "quyen-3",
    imageGenerated: false,
    summaryPoints: [
      "Trong Đền Thờ nghi ngút khói hương, tiên tri Isaiah được thiên thần gắp hòn than hồng chạm nhẹ lên môi thanh tẩy để cất tiếng báo trước về thời đại hòa bình khi sói nằm chung với chiên con.",
      "Khi đại quân Assyria bao vây Jerusalem, Vua Hezekiah cùng Isaiah vững lòng cầu nguyện suốt đêm và thành phố được giải cứu bình an.",
      "Thế hệ sau, tiên tri Jeremiah bị ném xuống giếng bùn sâu vì dám nói thật về tai họa sắp giáng xuống nhưng vẫn không khuất phục.",
      "Trước giờ quân Babylon thiêu rụi Đền Thờ, Jeremiah bí mật đưa Hòm Giao Ước, Lều Hội Ngộ và bàn thờ hương tới cất giấu an toàn trong hang đá kín trên núi Nebo.",
    ],
  },
  {
    id: "canh-20",
    number: 20,
    slug: "canh-20-daniel-lo-lua-va-hang-su-tu-babylon",
    title: "Daniel Và Các Bạn Trẻ Nơi Xứ Lưu Đày: Lò Lửa Và Hang Sư Tử Babylon",
    bookId: "quyen-3",
    imageGenerated: false,
    summaryPoints: [
      "Bị bắt sang triều đình Babylon, Daniel cùng ba bạn giữ lòng thanh sạch bằng cơm rau nước lã, được ban trí khôn giải đúng giấc mơ pho tượng bốn kim loại cho Hoàng đế Nebuchadnezzar.",
      "Ba người bạn kiên quyết không quỳ lạy pho tượng vàng nên bị ném vào lò lửa nung đỏ bảy lần, nhưng cả ba bước đi thản nhiên giữa ngọn lửa dưới sự che chở của vị sứ giả thứ tư.",
      "Dưới triều Belshazzar kiêu ngạo, bàn tay bí ẩn viết dòng chữ tiên tri trên tường phòng tiệc; Daniel đọc ra bản án rồi dùng mẹo rắc tro mịn vạch trần trò gian dối trong đền thần Bel.",
      "Bị gài bẫy ném xuống hang sư tử đói vì giữ thói quen hướng về Jerusalem cầu nguyện, Daniel bình an qua đêm bên đàn sư tử ngủ yên và đón nhận thị kiến về \"Con Người uy nghi đến trên mây trời\".",
    ],
  },
  {
    id: "canh-21",
    number: 21,
    slug: "canh-21-jonah-con-ca-khong-lo-va-long-bao-dung",
    title: "Tiên Tri Jonah Trong Bụng Cá Khổng Lồ Và Bài Học Về Lòng Thương Xót",
    bookId: "quyen-3",
    imageGenerated: false,
    summaryPoints: [
      "Nhận tiếng gọi cảnh tỉnh kinh thành xa lạ Nineveh nhưng lòng còn sợ hãi và định kiến, Jonah vội trốn lên con tàu buôn đi hướng ngược lại.",
      "Cơn bão dữ nổi lên giữa biển; nhận lỗi về mình, Jonah xin thả xuống sóng biển để bão ngừng và được một con cá khổng lồ nuốt vào bụng đưa suốt ba ngày đêm trở lại bờ.",
      "Không thể trốn tránh nữa, Jonah bước vào thành Nineveh báo tin; từ nhà vua xuống người dân đều ăn năn khiến thành phố được tha thứ bình an.",
      "Ngồi ngoài thành buồn bực khi dây bầu che nắng héo tàn chỉ sau một đêm, Jonah được tiếng Chúa nhắc nhở về lòng xót thương đối với hàng vạn con người và muôn thú trong thành phố rộng lớn.",
    ],
  },
  {
    id: "canh-22",
    number: 22,
    slug: "canh-22-xay-lai-thanh-quach-job-va-ngon-lua-maccabeus",
    title: "Xây Lại Tường Thành, Lòng Kiên Trung Của Job Và Ngọn Lửa Phục Hưng Đền Thờ",
    bookId: "quyen-3",
    imageGenerated: false,
    summaryPoints: [
      "Quan chén rượu Nehemiah trở về kêu gọi dân chúng vừa cầm bay xây vừa cầm gươm canh giữ, hoàn thành lại vòng tường thành Jerusalem và Đền Thờ thứ hai.",
      "Khi tướng Heliodorus vào cướp tiền của quả phụ mồ côi trong Đền Thờ, một kỵ sĩ thiên thần xuất hiện chặn đứng và Thượng Tế Onias cầu nguyện cứu sống tên tướng.",
      "Giữa mất mát tận cùng nơi xứ Uz, ông lão ngay thẳng Job kiên quyết giữ lòng trung tín tuyên xưng \"Đấng Cứu Chuộc tôi vẫn hằng sống\" và được chữa lành trọn vẹn.",
      "Vào đêm tối áp bức của vua Antiochus, cha con tư tế Mattathias và Judas Maccabeus khởi nghĩa thanh tẩy thắp lại ngọn đèn Đền Thờ cháy sáng liên tục.",
    ],
  },
  {
    id: "canh-23",
    number: 23,
    slug: "canh-23-loi-bao-tin-trong-den-tho-va-cuoc-gap-go-hai-nguoi-me",
    title: "Lời Báo Tin Trong Đền Thờ, Cuộc Hội Ngộ Của Hai Người Mẹ Và Hai Ngọn Sáng Đêm Đông",
    bookId: "quyen-4",
    imageGenerated: false,
    summaryPoints: [
      "Tại Đền Thờ Jerusalem, tư tế già Zechariah nhận tin báo từ thiên thần Gabriel rằng bà Elizabeth sẽ sinh con trai mở đường tên John; vì hoài nghi nên ông tạm mất tiếng nói tới ngày con chào đời.",
      "Ở miền đồi phía Bắc, người thiếu nữ Maria đón nhận tin mừng thiên thần rồi đường xa lên thăm chị họ Elizabeth; hai người phụ nữ cất tiếng hát ngợi ca đầy ánh sáng.",
      "Đêm đông tại vùng Bethlehem diễn ra hai khung cảnh Giáng sinh song song như hai nhánh cây trong giấc mơ Vua David năm xưa.",
      "Một bên trong căn nhà rộng rãi, hài nhi Giêsu dòng dõi hoàng tộc Vua Solomon chào đời dưới vầng sao lạ cùng cha lớn tuổi Giuse và mẹ Maria quý phái.",
      "Bên kia trong hang đá nhỏ ấm áp hơi thở của con bò vàng và con lừa xám, hài nhi Giêsu thứ hai dòng dõi mục đồng Vua Nathan chào đời bên mẹ Maria hiền hậu và cha thợ mộc trẻ Giuse.",
    ],
  },
  {
    id: "canh-24",
    number: 24,
    slug: "canh-24-dua-tre-dong-doi-vua-va-nhung-nha-thong-thai",
    title: "Đứa Trẻ Dòng Dõi Vua, Ba Nhà Thông Thái Phương Đông Và Cuộc Chạy Trốn Trong Đêm",
    bookId: "quyen-4",
    imageGenerated: false,
    summaryPoints: [
      "Lần theo ngôi sao lạ dẫn đường, ba nhà thông thái phương Đông vượt sa mạc tìm tới Bethlehem, dâng lên đứa trẻ dòng dõi vua ba món quà biểu tượng: vàng ròng, nhũ hương và mộc dược.",
      "Nổi cơn ghen sợ mất ngai vàng khi nghe tin từ ba nhà thông thái, Vua Herod bí mật rình truy sát hài nhi tại Bethlehem.",
      "Được thiên thần báo mộng giữa khuya, bác Giuse đánh thức vợ bồng con xuống đường ngay trong đêm sao sáng, băng qua sa mạc chạy trốn sang Ai Cập nhiều năm.",
      "Khi Vua Herod qua đời và mối nguy không còn, gia đình bác Giuse đưa cậu con trai trở về định cư yên ổn tại ngôi làng đồi Nazareth.",
    ],
  },
  {
    id: "canh-25",
    number: 25,
    slug: "canh-25-dua-tre-muc-dong-va-tinh-ban-o-nazareth",
    title: "Đứa Trẻ Dòng Dõi Mục Đồng, Tiếng Hát Trên Đồng Cỏ Và Hai Gia Đình Ở Nazareth",
    bookId: "quyen-4",
    imageGenerated: false,
    summaryPoints: [
      "Những người chăn cừu ngoài đồng Bethlehem thấy bầu trời mở sáng liền vào hang đá chào hài nhi nằm máng cỏ; tại Đền Thờ Jerusalem, hai cụ già Simeon và Anna ôm lấy đứa trẻ ngợi khen.",
      "Quay về sinh sống tại ngôi làng yên bình Nazareth, hai người mẹ cùng tên Maria gặp nhau bên giếng nước làng và lập tức trở nên thân thiết như chị em một nhà.",
      "Hai cậu bé Giêsu lớn lên cạnh nhau không rời nửa bước: cậu bé dòng vua trầm tĩnh thông tuệ, cậu bạn dòng mục đồng hồn hậu biết trò chuyện với hoa cỏ và chim muông.",
      "Một buổi chiều khi một chú chim non rơi tổ bị thương bên mái nhà, hai cậu bé cùng nhau dịu dàng nhặt chú chim nhỏ ủ ấm làm lành cánh gãy dưới ánh nhìn tự hào của hai người mẹ.",
    ],
  },
  {
    id: "canh-26",
    number: 26,
    slug: "canh-26-nam-thu-muoi-hai-trong-den-tho-va-xuong-moc-nazareth",
    title: "Năm Thứ Mười Hai Trong Đền Thờ, Nỗi Đau Mùa Đông Và Người Thợ Mộc Khôn Ngoan",
    bookId: "quyen-4",
    imageGenerated: false,
    summaryPoints: [
      "Năm mười hai tuổi, trên đường hành hương từ Jerusalem về, cha mẹ lạc mất cậu con dòng vua rồi tìm thấy cậu đang ngồi giữa các học giả Đền Thờ đối đáp thấu đáo về sách luật cổ.",
      "Bên mái hiên Đền Thờ, người bạn dòng mục đồng lặng lẽ lắng nghe ánh nhìn sâu thẳm của bạn mình; kể từ chuyến đi ấy hai đứa trẻ gắn kết mật thiết vào một nguồn sống duy nhất.",
      "Mùa đông khắc nghiệt nhiều năm sau mang đi những người thân lớn tuổi; mái nhà còn lại đón nhận nhau chung một bếp lửa, cùng vượt qua tang thương lặng lẽ bên xưởng gỗ.",
      "Chàng thanh niên Giêsu trở thành người thợ mộc bình dị của làng Nazareth, đôi tay lắng nghe thớ gỗ dịu dàng đóng chiếc ghế dựa êm ái tặng bà cụ hàng xóm lưng còng.",
    ],
  },
  {
    id: "canh-27",
    number: 27,
    slug: "canh-27-john-ben-bo-bien-chet-va-phep-rua-tren-song-jordan",
    title: "John Giữa Cộng Đồng Áo Trắng, Tiếng Gọi Hoang Địa Và Bình Minh Trên Sông Jordan",
    bookId: "quyen-4",
    imageGenerated: false,
    summaryPoints: [
      "Sau khi cha mẹ qua đời, cậu bé John được gửi vào sống giữa cộng đồng áo vải lanh trắng vùng hang đá Qumran bên Biển Chết dưới sự dìu dắt của thầy Hiskia.",
      "Trưởng thành, John rời hang đá mặc áo lông lạc đà, ăn mật ong rừng và châu chấu, cất tiếng kêu gọi mọi người bên bờ sông Jordan đổi mới tận đáy lòng.",
      "Đông đảo dân chúng xuống sông đón nhận phép rửa nước, cho tới một buổi sáng trong veo, chính chàng thợ mộc Giêsu từ Nazareth bước xuống dòng nước Jordan xin phép rửa.",
      "Khi Giêsu bước lên bờ cầu nguyện, bầu trời mở ra tia nắng rực sáng và chim bồ câu trắng đáp xuống mở màn hành trình mới; còn John kiên cường giữ trọn sứ mạng người dọn đường tới pháo đài Macharus.",
    ],
  },
  {
    id: "canh-28",
    number: 28,
    slug: "canh-28-ngoai-truyen-thanh-nicholas-va-ong-gia-noel",
    title: "Ngoại Truyện: Từ Chiếc Áo Choàng Đỏ Của Thánh Nicholas Đến Ông Già Noel Đêm Giáng Sinh",
    bookId: "quyen-5",
    isEpilogue: true,
    imageGenerated: false,
    summaryPoints: [
      "Khép lại bốn quyển sử thi cổ đại, khúc ngoại truyện dân gian mở ra vào thế kỷ III–IV nơi chàng thanh niên giàu lòng nhân hậu Nicholas tại thành cảng Patara vùng Địa Trung Hải.",
      "Nghe tiếng thở dài của người cha nghèo không có của hồi môn cho ba cô con gái, Nicholas âm thầm thả từng túi vàng qua cửa sổ suốt ba đêm rơi trúng vào những chiếc tất hong bên bếp lửa.",
      "Trở thành Giám mục thành Myra trong chiếc áo choàng đỏ ấm áp, ông thuyết phục thủy thủ đoàn tàu hoàng gia san sẻ lúa mì cứu dân giữa nạn đói mà khoang lúa tới Constantinople vẫn đầy nguyên.",
      "Ký ức về vị thánh áo đỏ âm thầm tặng quà lan khắp châu Âu thành Sinterklaas rồi vượt biển thành Santa Claus — tức Ông già Noel phúc hậu của mọi gia đình đêm Giáng sinh hôm nay.",
    ],
  },
];

function buildSceneLevelPaths(sc: SeedSceneInput): SceneLevelPaths {
  const book = GENESIS_BOOKS.find((b) => b.id === sc.bookId) || GENESIS_BOOKS[0];
  const l1File = `${book.slug}.md`;
  return {
    level0Overview: "level-0-khong-gian-boi-canh/00-tong-quan-linh-hon-su-thi.md",
    level0Book: book.level0File,
    level1: {
      "6-10": `level-1-toan-van/6-10-tuoi-chuan/${l1File}`,
      "3-5": `level-1-toan-van/3-5-tuoi-mam-non/${l1File}`,
      "11+": `level-1-toan-van/11-cong-thieu-nien-nguoi-lon/${l1File}`,
    },
    level2: {
      "6-10": `level-2-dan-y-chi-tiet/ban-dia-hoa-6-10-tuoi/${l1File}`,
      "3-5": "level-2-dan-y-chi-tiet/mam-non-3-5-tuoi/dan-y-chi-tiet-3-5-tuoi.md",
      "11+": "level-2-dan-y-chi-tiet/thieu-nien-nguoi-lon-11-cong/dan-y-chi-tiet-11-cong.md",
    },
    level3: "level-3-dan-y-tom-tat/dan-y-tom-tat-28-phan-canh.md",
    level4Gallery: "level-4-tranh-goi-nho/bo-tranh-goi-nho.md",
    level4Image: `level-4-tranh-goi-nho/images/${sc.slug}.png`,
    level4PromptSpec: "level-4-tranh-goi-nho/prompts-28-phan-canh.md",
  };
}

export function getSeedData(): WaldorfData {
  const scenes: StoryScene[] = GENESIS_SCENES_META.map((sc) => {
    const book = GENESIS_BOOKS.find((b) => b.id === sc.bookId) || GENESIS_BOOKS[0];
    const levelPaths = buildSceneLevelPaths(sc);
    const passage = sc.summaryPoints.join("\n\n");
    const voiceNote = `Giữ nhịp kể ấm áp theo tinh thần ${book.title}. Đọc chậm rãi, ngắt hơi tự nhiên giữa các hình ảnh chính (đồng bộ toàn văn từ ${levelPaths.level1["6-10"]}).`;
    const detailedOutline = {
      characters: extractLikelyNames(passage),
      localizedDetails: [
        `${book.title} — ${book.subtitle}`,
        ...sc.summaryPoints.slice(0, 2),
      ],
      emotionalRhythm:
        SEED_BOOK_SOULS[book.id]?.storytellingRhythm ||
        "Nhịp kể tự nhiên, lắng đọng và giàu hình ảnh.",
      beats: sc.summaryPoints,
    };

    const artStyle: WaldorfArtStyle = book.number === 1 ? "chalkboard" : "wet-on-wet";

    return {
      id: sc.id,
      ord: sc.number,
      slug: sc.slug,
      bookId: sc.bookId,
      isEpilogue: Boolean(sc.isEpilogue),
      title: `Phân cảnh ${sc.number.toString().padStart(2, "0")}: ${sc.title}`,
      passage,
      voiceNote,
      detailedOutline,
      variants: {
        "6-10": { passage, voiceNote, detailedOutline },
      },
      summaryPoints: sc.summaryPoints,
      artStyle,
      repoImage: levelPaths.level4Image,
      imageGenerated: sc.imageGenerated,
      levelPaths,
    };
  });

  const genesisStory: WaldorfStory = {
    id: GENESIS_STORY_ID,
    title: "Từ Sáng Thế Đến Giáng Sinh — Bộ Sử Thi Luyện Kể Chuyện 5 Cấp Độ",
    titleEn: "From Genesis to Nativity — 5-Level Storytelling Epic",
    sourceInfo: "Nguồn trực tiếp từ repo xuvivn/from-genesis-to-nativity · 5 Quyển · 28 phân cảnh",
    ageRange: "3–5, 6–10 & 11+ tuổi",
    goal: "Luyện kể trọn mạch sử thi 5 Quyển (28 phân cảnh) trực tiếp theo folder path Level 0 → Level 4.",
    defaultArtStyle: "chalkboard",
    repoUrl: GENESIS_REPO_URL,
    rawBaseUrl: GENESIS_JSDELIVR_BASE_URL,
    books: GENESIS_BOOKS,
    soul: {
      ...SEED_BOOK_SOULS["quyen-1"],
      overviewPath: "level-0-khong-gian-boi-canh/00-tong-quan-linh-hon-su-thi.md",
      bookSouls: SEED_BOOK_SOULS,
      ancientBooks: GENESIS_ANCIENT_BOOKS,
    },
    scenes,
  };

  return {
    stories: [genesisStory],
    updatedAt: new Date().toISOString(),
    version: "3.0-repo-genesis",
  };
}

/**
 * Tách và chuyển văn bản truyện người dùng nhập thành đầy đủ cấu trúc 5 Level (Level 0–4)
 * hoàn toàn cục bộ trên trình duyệt (không sử dụng AI).
 */
export function segmentStoryLocally(params: {
  title: string;
  ageRange: string;
  artStyle: WaldorfArtStyle;
  rawText: string;
  culturalSpirit?: string;
  storytellingRhythm?: string;
  ageMetaphor?: string;
  pronunciations?: PronunciationGuideItem[];
}): WaldorfStory {
  const clean = (params.rawText || "").trim();
  const title =
    params.title.trim() ||
    (clean.split("\n")[0] || "Câu chuyện mới").slice(0, 60).trim();

  // Tách đoạn theo dòng trống trước; nếu ít hơn 2 đoạn thì tách theo câu
  let chunks = clean
    .replace(/\r\n/g, "\n")
    .split(/\n\s*\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (chunks.length < 2) {
    const sentences = clean
      .split(/(?<=[.?!…])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    if (sentences.length >= 4) {
      const target = Math.min(6, Math.max(3, Math.ceil(sentences.length / 2)));
      chunks = [];
      for (let i = 0; i < target; i++) {
        const start = Math.floor((i * sentences.length) / target);
        const end = Math.floor(((i + 1) * sentences.length) / target);
        const slice = sentences.slice(start, end);
        if (slice.length > 0) chunks.push(slice.join(" "));
      }
    } else if (sentences.length > 0) {
      chunks = sentences;
    } else {
      chunks = [clean || "Nội dung câu chuyện đang được biên soạn."];
    }
  }

  // Giới hạn tối đa 6 phân cảnh để giữ khung xương gọn gàng cho truyện tự thêm
  if (chunks.length > 6) {
    const merged: string[] = [];
    for (let i = 0; i < 6; i++) {
      const start = Math.floor((i * chunks.length) / 6);
      const end = Math.floor(((i + 1) * chunks.length) / 6);
      merged.push(chunks.slice(start, end).join("\n\n"));
    }
    chunks = merged;
  }

  const scenes: StoryScene[] = chunks.map((passage, idx) => {
    const ord = idx + 1;
    const rawSentences = passage
      .split(/(?<=[.?!…])\s+/)
      .map((s) => s.trim())
      .filter(Boolean);

    const firstLine = (rawSentences[0] || passage).slice(0, 48).trim();
    const sceneTitle = `Phân cảnh ${ord}: ${firstLine}${
      (rawSentences[0] || passage).length > 48 ? "..." : ""
    }`;

    const summaryPoints = buildSummaryPoints(rawSentences, passage, ord, chunks.length);

    return {
      id: `scene-${Date.now()}-${ord}`,
      ord,
      title: sceneTitle,
      passage,
      voiceNote:
        ord === 1
          ? "Mở đầu khoan thai, lấy hơi sâu và giữ giọng ấm áp để dẫn người nghe bước vào bối cảnh."
          : ord === chunks.length
          ? "Chậm rãi ở đoạn kết, giữ khoảng lặng nhẹ sau câu cuối cùng để dư âm câu chuyện lắng đọng."
          : "Ngắt nhịp tự nhiên theo dấu chấm câu, nhấn nhẹ vào hành động và hình ảnh nổi bật của phân cảnh.",
      detailedOutline: {
        characters: extractLikelyNames(passage),
        localizedDetails: extractSensorySnippets(passage),
        emotionalRhythm: `Giữ mạch cảm xúc tự nhiên cho lứa tuổi ${params.ageRange || "6–9 tuổi"} (phân cảnh ${ord}/${chunks.length}).`,
        beats: rawSentences.slice(0, 5).length > 0 ? rawSentences.slice(0, 5) : [passage],
      },
      summaryPoints,
      artStyle: params.artStyle,
    };
  });

  const ageMetaphor =
    params.ageMetaphor?.trim() ||
    `Thông điệp nuôi dưỡng tâm hồn, lòng nhân ái và trí tưởng tượng phù hợp với lứa tuổi ${params.ageRange || "6–9 tuổi"}.`;

  return {
    id: `story-${Date.now()}`,
    title,
    sourceInfo: "Truyện do người kể tự thêm vào thư viện cục bộ",
    ageRange: params.ageRange || "6–9 tuổi",
    goal: "Luyện kể chuyện từ thấu hiểu bối cảnh đến tranh gợi nhớ thuần hình ảnh.",
    defaultArtStyle: params.artStyle,
    soul: {
      culturalSpirit:
        params.culturalSpirit?.trim() ||
        `Không gian văn hóa và hình ảnh sống động của câu chuyện "${title}". Hãy hình dung rõ cảnh vật, âm thanh và màu sắc trước khi cất lời.`,
      storytellingRhythm:
        params.storytellingRhythm?.trim() ||
        "Nhịp kể tự nhiên theo hơi thở: hít vào chậm ở những đoạn lắng đọng, mở rộng nhẹ nhàng ở các cao trào và giữ khoảng lặng chuyển cảnh.",
      ageMetaphor,
      ageMetaphors: { "6-10": ageMetaphor } as Partial<Record<AgeVariantId, string>>,
      pronunciations:
        params.pronunciations && params.pronunciations.length > 0
          ? params.pronunciations
          : [
              {
                term: title,
                pronunciation: `${title} (đọc rõ ràng, ấm áp ngay từ tiếng mở đầu)`,
                meaning: "Tên gọi chính của câu chuyện.",
              },
            ],
    },
    scenes,
  };
}

function buildSummaryPoints(
  sentences: string[],
  passage: string,
  ord: number,
  total: number
): string[] {
  const clauses = passage
    .split(/[.?!;…]+/)
    .map((c) => c.trim())
    .filter((c) => c.length > 3);

  const rawPoints = sentences.length >= 4 ? sentences : clauses;
  const trimmed = rawPoints
    .map((p) => (p.length > 90 ? `${p.slice(0, 87).trim()}...` : p))
    .slice(0, 6);

  if (trimmed.length >= 4) {
    return trimmed;
  }

  const padded = [...trimmed];
  const scaffolds = [
    `Mở ra khung cảnh và nhân vật của phân cảnh ${ord}.`,
    `Diễn biến sự việc chính trong đoạn ${ord}/${total}.`,
    `Điểm nhấn cảm xúc và chi tiết gợi hình ảnh cần giữ.`,
    ord === total
      ? "Khép lại câu chuyện với dư âm lắng đọng."
      : `Chuyển mạch tự nhiên sang phân cảnh ${ord + 1}.`,
  ];

  for (const s of scaffolds) {
    if (padded.length >= 4) break;
    padded.push(s);
  }

  return padded.slice(0, 6);
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
  return unique.length > 0 ? unique : ["Nhân vật chính trong phân cảnh"];
}

function extractSensorySnippets(text: string): string[] {
  const parts = text
    .split(/[,.;?!]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 10);
  if (parts.length > 0) return parts.slice(0, 3);
  return [text.slice(0, 80)];
}
