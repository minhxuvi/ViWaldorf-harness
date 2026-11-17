# ViWaldorf — Ứng dụng Luyện Kể Chuyện Sư Phạm: *Từ Sáng Thế Đến Giáng Sinh* (Zero-AI)

> **Mục tiêu cốt lõi:** Ứng dụng web gọn nhẹ, hoạt động 100% cục bộ trên trình duyệt, phục vụ duy nhất bộ sử thi **Từ Sáng Thế Đến Giáng Sinh** (5 Quyển · 180 Chương · 28 Tranh gợi nhớ theo Cụm Chương, nguồn `xuvivn/from-genesis-to-nativity`), với **4 cấp độ luyện kể chuyện (Level 1–4)**, **mục đọc thêm Bối cảnh & Linh hồn câu chuyện**, chức năng **xuất bản PDF toàn văn kèm 28 tranh minh họa Level 4**, và **Thu âm & Nghe lại** thuần túy không AI. Được dẫn đường bởi [DAO.md](DAO.md).

---

## 1. Mục Đọc Thêm & Bốn Cấp Độ Luyện Tập

- **Đọc thêm — Bối cảnh & Linh hồn câu chuyện (`level-0-khong-gian-boi-canh/`)**:
  Nắm tinh thần văn hóa, nhịp điệu kể (9–10 tuổi theo phong cách Jakob Streit), điểm chạm ẩn dụ, hướng dẫn phát âm tên cổ theo từng Quyển, tổng quan sử thi và thư viện 25 văn bản cổ đọc thêm.
1. **Level 1 — Toàn văn câu chuyện**:
   Văn phong kể chuyện đọc thành tiếng hoàn chỉnh cho toàn bộ **180 Chương**, đi kèm *Lưu ý giọng kể* riêng từng chương và chức năng **Tải bản PDF Toàn văn (kèm 28 tranh Level 4)**.
2. **Level 2 — Dàn ý chi tiết**:
   Luyện kể không nhìn toàn văn nhưng giữ trọn nhân vật, hình tượng trung tâm, diễn biến chi tiết và ý nghĩa kể chuyện của từng chương.
3. **Level 3 — Dàn ý tóm tắt**:
   1 bản khung xương duy nhất bám sát cốt truyện gốc của cả **180 Chương**.
4. **Level 4 — Tranh gợi nhớ thuần hình ảnh**:
   **28 bức tranh vẽ tay truyền thống theo Cụm Chương** (`level-4-tranh-goi-nho/images/` hoặc SVG thuần hình ảnh dự phòng theo *Màu nước ướt-trên-ướt*, *Màu sáp ong*, *Phấn bảng đen*), **không chữ gợi ý**, giúp người kể tự tuôn chảy bằng ngôn ngữ sống của mình.

---

## 2. Xuất Bản PDF Toàn Văn & Thu âm / Nghe lại

- **Tải PDF Toàn văn (kèm tranh Level 4)**: Tạo tài liệu in ấn A4 cục bộ ngay trên trình duyệt gồm trang bìa, mục lục 5 Quyển, toàn văn 180 Chương (*Lưu ý giọng kể* + nội dung kể chuyện) và nhúng cả 28 tranh minh họa Level 4 tại đầu mỗi cụm chương.
- **Thu âm & Nghe lại thuần túy**: Thu âm trực tiếp từ micro (`MediaRecorder`) kèm đồng hồ thời lượng và nghe lại tức thì (`<audio controls>`).
- **Không sử dụng AI**: Không gọi API AI, không chấm điểm, không phân tích tự động hay lưu dữ liệu ra máy chủ ngoài.

---

## 3. Cấu trúc Mã nguồn & Đặc tả

| Thành phần | Vai trò | Vị trí |
|---|---|---|
| **DAO** | Hiến chương bất khả xâm phạm | [DAO.md](DAO.md) |
| **Đặc tả Hệ thống** | Kiến trúc client-side & plugin Waldorf | [harness/specs/](harness/specs/README.md), [plugins/waldorf/specs/](plugins/waldorf/specs/00_master_prompt.md) |
| **Giao diện chính** | Không gian Luyện kể chuyện 4 cấp độ + Mục đọc thêm bối cảnh + Xuất PDF + Thu âm/Nghe lại | [app/page.tsx](app/page.tsx), [components/Shell.tsx](components/Shell.tsx) |
| **Dữ liệu, Tranh & PDF** | Bộ tải trực tiếp `xuvivn/from-genesis-to-nativity` (5 Quyển · 180 Chương · 28 Tranh), dữ liệu khởi tạo, tranh SVG thuần hình ảnh dự phòng và bộ xuất PDF | [lib/types.ts](lib/types.ts), [lib/repoStoryLoader.ts](lib/repoStoryLoader.ts), [lib/seedData.ts](lib/seedData.ts), [lib/art/proceduralIllustrator.ts](lib/art/proceduralIllustrator.ts), [lib/pdfExporter.ts](lib/pdfExporter.ts) |
| **Kiểm thử & Đánh giá** | Bộ kiểm thử tự động & báo cáo chất lượng | [tests/](tests/), [benchmarker/](benchmarker/specs/01-overall-benchmark.md) |

---

## 4. Phát triển & Kiểm thử Cục bộ

```bash
# Cài đặt phụ thuộc
pnpm install

# Chạy máy chủ phát triển
pnpm dev
# Mở http://localhost:3000

# Kiểm tra TypeScript, chạy unit tests và build
npx tsc --noEmit
npm test
npm run build
```
