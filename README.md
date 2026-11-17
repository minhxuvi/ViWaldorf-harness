# ViWaldorf — Ứng dụng Luyện Kể Chuyện Sư Phạm (Zero-AI, 5 Cấp Độ)

> **Mục tiêu cốt lõi:** Ứng dụng web gọn nhẹ, hoạt động 100% cục bộ trên trình duyệt, tập trung duy nhất vào **Luyện kể chuyện** theo tinh thần sư phạm Waldorf tại Việt Nam — với **5 cấp độ rèn luyện (Level 0–4)** và tính năng **Thu âm & Nghe lại** thuần túy, không sử dụng AI. Được dẫn đường bởi [DAO.md](DAO.md).

---

## 1. Năm Cấp Độ Luyện Tập (Level 0 → Level 4)

1. **Level 0 — Không gian bối cảnh & Linh hồn câu chuyện**:
   Nắm tinh thần văn hóa, nhịp điệu kể, thông điệp ẩn dụ theo lứa tuổi và cách phát âm tên cổ trước khi đọc văn bản.
2. **Level 1 — Toàn văn câu chuyện**:
   Văn phong kể chuyện đọc thành tiếng hoàn chỉnh, giàu hình ảnh và đi kèm *Lưu ý giọng kể* riêng cho từng phân cảnh.
3. **Level 2 — Dàn ý chi tiết**:
   Luyện kể không nhìn toàn văn nhưng giữ trọn nhân vật, chi tiết bản địa hóa và nhịp cảm xúc theo lứa tuổi.
4. **Level 3 — Dàn ý tóm tắt**:
   1 bản khung xương duy nhất bám sát cốt truyện gốc (4–6 ý/phân cảnh).
5. **Level 4 — Tranh gợi nhớ thuần hình ảnh**:
   Mỗi phân cảnh 1 bức tranh vẽ tay truyền thống (*Màu nước ướt-trên-ướt*, *Màu sáp ong*, *Phấn bảng đen*), **không chữ gợi ý**, giúp người kể tự tuôn chảy bằng ngôn ngữ sống của mình.

---

## 2. Thu âm & Nghe lại Thuần túy

- Thu âm trực tiếp từ micro ngay trên trình duyệt (`MediaRecorder`) kèm đồng hồ thời lượng.
- Nghe lại tức thì bằng trình phát âm thanh (`<audio controls>`), quản lý và nghe lại các lượt thu trong phiên hoặc tải về máy.
- **Không sử dụng AI**: Không gọi API AI, không chấm điểm, không phân tích tự động hay lưu dữ liệu ra máy chủ ngoài.

---

## 3. Cấu trúc Mã nguồn & Đặc tả

| Thành phần | Vai trò | Vị trí |
|---|---|---|
| **DAO** | Hiến chương bất khả xâm phạm | [DAO.md](DAO.md) |
| **Đặc tả Hệ thống** | Kiến trúc client-side & plugin Waldorf | [harness/specs/](harness/specs/README.md), [plugins/waldorf/specs/](plugins/waldorf/specs/00_master_prompt.md) |
| **Giao diện chính** | Không gian Luyện kể chuyện 5 cấp độ + Thu âm/Nghe lại | [app/page.tsx](app/page.tsx), [components/Shell.tsx](components/Shell.tsx) |
| **Dữ liệu & Tranh** | Mô hình 5 level, kho truyện mẫu, tranh SVG thuần hình ảnh | [lib/types.ts](lib/types.ts), [lib/seedData.ts](lib/seedData.ts), [lib/art/proceduralIllustrator.ts](lib/art/proceduralIllustrator.ts) |
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
