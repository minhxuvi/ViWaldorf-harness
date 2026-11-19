# ViWaldorf — Ứng dụng Luyện Kể Chuyện Sư Phạm: *Từ Sáng Thế Đến Giáng Sinh* (Zero-AI)

> **Mục tiêu cốt lõi:** Ứng dụng web gọn nhẹ, không AI, phục vụ duy nhất bộ sử thi **Từ Sáng Thế Đến Giáng Sinh** (5 Quyển · 180 Chương · 28 Tranh gợi nhớ theo Cụm Chương, nguồn `xuvivn/from-genesis-to-nativity`, hỗ trợ 3 ngôn ngữ **Tiếng Việt `vi` · English `en` · 简体中文 `zh`**), với **4 cấp độ luyện kể chuyện (Level 1–4)**, **mục đọc thêm Bối cảnh & Linh hồn câu chuyện**, chức năng **xuất bản PDF toàn văn (tùy chọn kèm 28 tranh minh họa Level 4 hoặc không kèm ảnh)**, **tự động ghi nhớ chương và vị trí đang đọc**, **đăng nhập thành viên (Email & Google SSO) để đồng bộ tiến độ**, **không gian Góp ý cộng đồng**, và **Thu âm & Nghe lại** thuần túy không AI. Được dẫn đường bởi [DAO.md](DAO.md).

---

## 1. Mục Đọc Thêm & Bốn Cấp Độ Luyện Tập

- **Giao diện mở trang = không gian luyện kể**: Không hiển thị banner tiêu đề dài, thẻ thống kê, bộ lọc Quyển trải ngang, mô tả cấp độ hoặc hướng dẫn thao tác cố định. Thanh đầu gọn gồm 1 menu thả xuống chọn mức luyện tập (Level 1–4), nút **Bối cảnh & Cổ thư** và nút **Hướng dẫn & Tiện ích**; khung đọc dùng menu Quyển, điều hướng Chương/Tranh, cỡ chữ và bộ lọc phạm vi thu gọn.

- **Đọc thêm — Bối cảnh & Linh hồn câu chuyện (`locales/{lang}/level-0-context/`)**:
  Nắm tinh thần văn hóa, nhịp điệu kể (9–10 tuổi theo phong cách Jakob Streit), điểm chạm ẩn dụ, hướng dẫn phát âm tên cổ theo từng Quyển, tổng quan sử thi và thư viện 25 văn bản cổ đọc thêm (`ancient-texts/`).
1. **Level 1 — Toàn văn câu chuyện**:
   Văn phong kể chuyện đọc thành tiếng hoàn chỉnh cho toàn bộ **180 Chương**, đi kèm *Lưu ý giọng kể* riêng từng chương và chức năng **Tải bản PDF Toàn văn (tùy chọn kèm 28 tranh Level 4 hoặc không kèm ảnh)**.
2. **Level 2 — Dàn ý chi tiết**:
   Luyện kể không nhìn toàn văn nhưng giữ trọn nhân vật, hình tượng trung tâm, diễn biến chi tiết và ý nghĩa kể chuyện của từng chương.
3. **Level 3 — Dàn ý tóm tắt**:
   1 bản khung xương duy nhất bám sát cốt truyện gốc của cả **180 Chương** (`locales/{lang}/level-3-summary-outline/chapter-summaries.md`).
4. **Level 4 — Tranh gợi nhớ thuần hình ảnh**:
   **28 bức tranh vẽ tay truyền thống theo Cụm Chương** (`assets/images/canh-01..28.png` hoặc SVG thuần hình ảnh dự phòng theo *Màu nước ướt-trên-ướt*, *Màu sáp ong*, *Phấn bảng đen*), **không chữ gợi ý**, giúp người kể tự tuôn chảy bằng ngôn ngữ sống của mình.

---

## 2. Ghi Nhớ Tiến Độ Đọc, Đăng Nhập (Google SSO) & Góp Ý Cộng Đồng

- **Tự động mở lại đúng chương & vị trí đọc dở**: Khi mở lại trang web trên trình duyệt cũ, ứng dụng khôi phục ngay Quyển, Cấp độ (`Level 1–4`), Chương (`1..180`) hoặc Tranh (`1..28`), cỡ chữ và đúng đoạn đang cuộn dở (`localStorage`).
- **Đăng nhập thành viên & Google SSO**: Hỗ trợ đăng ký/đăng nhập bằng Email & Mật khẩu hoặc Google OAuth 2.0 để đồng bộ tiến độ đọc qua tài khoản (`/api/auth/*`, `/api/progress`).
- **Góp ý cộng đồng thuần con người (Zero-AI)**: Phụ huynh và giáo viên có thể xem góp ý công khai, lọc theo trạng thái, theo dõi tiến độ cập nhật, gửi góp ý mới, thảo luận và nhận phản hồi từ **Ban biên tập ViWaldorf** — hoàn toàn không sử dụng hay đề cập đến AI.

---

## 3. Xuất Bản PDF Toàn Văn & Thu âm / Nghe lại

- **Tải PDF Toàn văn (Kèm ảnh / Không kèm ảnh)**: Tạo tài liệu in ấn A4 cục bộ ngay trên trình duyệt gồm trang bìa, mục lục 5 Quyển và toàn văn 180 Chương (*Lưu ý giọng kể* + nội dung kể chuyện), với 2 lựa chọn: **Kèm ảnh** (nhúng 28 tranh minh họa Level 4 tại đầu mỗi cụm chương) hoặc **Không kèm ảnh** (bản thuần chữ nhẹ và in nhanh).
- **Thu âm & Nghe lại thuần túy**: Thu âm trực tiếp từ micro (`MediaRecorder`) hỗ trợ **Tạm dừng / Tiếp tục** liền mạch trong cùng một bản thu kèm đồng hồ đếm thời lượng thu thực tế, và nghe lại tức thì (`<audio controls>`).
- **Không sử dụng AI**: Không gọi API AI, không chấm điểm, không phân tích tự động hay truyền bản ghi âm ra ngoài trình duyệt.

---

## 4. Cấu trúc Mã nguồn & Đặc tả

| Thành phần | Vai trò | Vị trí |
|---|---|---|
| **DAO** | Hiến chương bất khả xâm phạm | [DAO.md](DAO.md) |
| **Đặc tả Hệ thống** | Kiến trúc & plugin Waldorf | [harness/specs/](harness/specs/README.md), [plugins/waldorf/specs/](plugins/waldorf/specs/00_master_prompt.md) |
| **Giao diện chính** | Không gian Luyện kể chuyện 4 cấp độ, Góp ý cộng đồng & Đăng nhập | [app/page.tsx](app/page.tsx), [components/Shell.tsx](components/Shell.tsx), [components/AuthModal.tsx](components/AuthModal.tsx), [components/FeedbackSection.tsx](components/FeedbackSection.tsx) |
| **Tiến độ, Auth & API** | Lưu tiến độ đọc, xác thực Email/Google SSO, góp ý trên SQLite | [lib/readingProgress.ts](lib/readingProgress.ts), [lib/server/db.ts](lib/server/db.ts), [lib/server/auth.ts](lib/server/auth.ts), [app/api/](app/api/) |
| **Dữ liệu, Tranh & PDF** | Bộ tải `xuvivn/from-genesis-to-nativity` (5 Quyển · 180 Chương · 28 Tranh), tranh SVG dự phòng & xuất PDF | [lib/types.ts](lib/types.ts), [lib/repoStoryLoader.ts](lib/repoStoryLoader.ts), [lib/seedData.ts](lib/seedData.ts), [lib/art/proceduralIllustrator.ts](lib/art/proceduralIllustrator.ts), [lib/pdfExporter.ts](lib/pdfExporter.ts) |
| **Kiểm thử & Đánh giá** | Bộ kiểm thử tự động & báo cáo chất lượng | [tests/](tests/), [benchmarker/](benchmarker/specs/01-overall-benchmark.md) |

---

## 5. Phát triển & Kiểm thử Cục bộ

```bash
# Cài đặt phụ thuộc & cấu hình môi trường mẫu (tùy chọn cho Google SSO / Ban biên tập / Repo local)
pnpm install
cp .env.example .env

# Chạy máy chủ phát triển (khi chạy ở localhost, /api/local-repo tự đọc trực tiếp từ ../from-genesis-to-nativity để test trước khi push)
pnpm dev
# Mở http://localhost:3000

# Kiểm tra TypeScript, chạy unit tests và build
npx tsc --noEmit
npm test
npm run build
```
