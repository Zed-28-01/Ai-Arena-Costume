# Kế hoạch triển khai – Việt phục Remix POC

Cập nhật: 10/10/2026

## Cách dùng

Mỗi task dưới đây là một prompt: đưa mã task cho Gemini (bộ B) để viết prompt, dán vào Build mode, kiểm tra theo cột "Xong khi" rồi mới sang task sau.

- Làm đúng thứ tự; không gộp hai giai đoạn vào một prompt.
- Thiếu nội dung hoặc hình thì dùng dữ liệu tạm `[CHỜ BỔ SUNG]`, không chờ.
- Cuối mỗi giai đoạn: commit lên GitHub và chạy lại các bước kiểm tra của giai đoạn trước.
- Giới tính: cả nữ và nam đều có hình tạm từ G0, nên chọn giới tính theo phiên chạy ngay từ G0. G3 chỉ còn đăng nhập và lưu hồ sơ; mannequin nam thật nằm ở việc song song SVG.

## G0 – Khung, dữ liệu tạm, mannequin, bố cục

Kết thúc G0: app chạy được toàn bộ luồng chọn đồ bằng dữ liệu và hình tạm, chưa chấm điểm.

| Mã | Task | Xong khi |
| --- | --- | --- |
| G0.1 | Khung dự án: giữ khung mặc định của AI Studio, thêm `data/`, `shared/core/`, `public/assets/svg/`, `docs/RULES.md`; tạo `.gitignore` và `.env.example` | Preview mở được, không lỗi console; `.gitignore` chặn `.env`, `node_modules/`, `dist/` |
| G0.2 | 9 file JSON đúng cấu trúc, nội dung tạm; `shared/core/types.ts`; hàm nạp dữ liệu dùng chung | Console in đúng số lượng: 2 sự kiện, 12 món, 4 luật, 4 preset; mã món khớp bảng trong file ý tưởng |
| G0.3 | SVG tạm cho mọi món và 2 mannequin (nữ, nam), tên file = mã món, cùng `viewBox="0 0 400 800"`; component Mannequin chồng lớp, áo tô màu qua `currentColor` | Preset E1 chuẩn hiện trên mannequin nữ; đổi màu áo đổi ngay |
| G0.4 | Màn Remix: mannequin trái, thẻ thông tin phải; tab 5 tầng; chọn món, chọn màu áo, bỏ chọn đội đầu và phụ kiện; responsive | Đổi được mọi món; Áo, Quần, Giày dép không bỏ chọn được; màn hình điện thoại không vỡ bố cục |
| G0.5 | Màn chọn giới tính (lưu theo phiên) và màn chọn sự kiện; chọn sự kiện thì nạp preset chuẩn vào màn Remix | Luồng giới tính → sự kiện → Remix chạy cho cả E1, E2 và cả nữ, nam |
| G0.6 | Thử sớm xuất ảnh: chụp vùng mannequin + một dòng chữ tiếng Việt thành PNG (nút tạm, sẽ thay ở G4) | Ảnh tải về có đủ hình SVG và chữ đúng dấu; lỗi thì ghi lại để đổi thư viện |

## G1 – Lõi luật và phản hồi tức thì

Kết thúc G1: mọi phần chấm bằng code chạy trên client, chưa gọi server.

| Mã | Task | Xong khi |
| --- | --- | --- |
| G1.1 | `shared/core/`: Culture Meter, kiểm tra luật, tính điểm (trừ dồn, trần 49/74/89), gắn nhãn theo điều kiện; hàm thuần, đọc ngưỡng từ `scoring.json`; kèm script kiểm thử với bộ phối thử | Mọi bộ phối thử ra đúng điểm phần code, cờ `isTaboo`, Culture Meter và nhãn kỳ vọng (thẩm mỹ giả định "ổn") |
| G1.2 | Gắn lõi luật vào màn Remix: Culture Meter, cảnh báo trên thẻ (taboo đỏ, cảnh báo mềm, lưu ý), điểm tạm ghi "chưa gồm thẩm mỹ" | Kịch bản demo bước 1–3: preset E1 chuẩn → đổi sneaker thì thanh đo chuyển "Cách tân" và hiện lưu ý R04 → chọn quần short thì hiện cảnh báo đỏ R01 |
| G1.3 | Popup 2 dòng nguồn gốc khi click món; thẻ ý nghĩa và nguồn; nhãn "Dữ liệu minh họa POC, cần thẩm định" | Click bất kỳ món nào đều hiện popup với nội dung từ JSON (kể cả `[CHỜ BỔ SUNG]`) |

## G2 – /api/evaluate và Gemini

Kết thúc G2: bấm "Xem đánh giá" ra điểm chính thức, nhận xét AI, và không bao giờ trắng màn hình khi AI hay server lỗi. Nên có bản nháp rubric và system instruction trong app (`data/gemini.json`) trước G2.2.

| Mã | Task | Xong khi |
| --- | --- | --- |
| G2.1 | Endpoint `POST /api/evaluate`: kiểm tra input, cache, chạy lõi luật trên server, trả kết quả với thẩm mỹ dự phòng (chưa gọi Gemini) | Request mẫu trả JSON đúng hợp đồng trong tài liệu workflow; mã món sai hoặc thiếu tầng bắt buộc trả lỗi 400 |
| G2.2 | Gọi Gemini (`@google/genai`, structured output) với prompt từ `data/gemini.json`; timeout 8 giây; kiểm tra schema, độ dài, `can_cu_ids`; mọi lỗi vào nhánh dự phòng; không cache kết quả dự phòng | 10 bộ phối × 3 lần đều ra nhận xét hợp lệ; tạm đổi key sai thì vẫn trả kết quả "tạm tính" |
| G2.3 | Màn đánh giá: điểm tổng và từng trụ cột, nhãn, cảnh báo, nhận xét, nguồn, nhãn minh bạch, nút báo sai (link Google Form từ `app-config.json`); dự phòng phía client khi server không gọi được | Kịch bản demo bước 4–5 chạy được; tắt mạng rồi bấm đánh giá vẫn hiện điểm "tạm tính" |

## G3 – Firebase

Kết thúc G3: đăng nhập Google là tùy chọn, chế độ khách vẫn chạy trọn vẹn. Đây là giai đoạn cắt đầu tiên nếu thiếu thời gian.

| Mã | Task | Xong khi |
| --- | --- | --- |
| G3.1 | Đăng nhập Google (Firebase Auth, client SDK); Firestore `users/{uid}`: `{ gioi_tinh, createdAt }`; security rule chỉ cho đọc/ghi tài liệu của chính mình; giữ chế độ khách | Đăng nhập lần đầu thì hỏi giới tính rồi lưu; mở lại app thì tự nhớ; rule không ở chế độ mở; không đăng nhập vẫn dùng được toàn bộ app |

## G4–G5 – Xuất thẻ look, đánh bóng, kiểm thử, nộp bài

| Mã | Task | Xong khi |
| --- | --- | --- |
| G4.1 | Nút "Lưu kết quả": chụp mannequin + thẻ đánh giá thành PNG (dùng thư viện đã thử ở G0.6) | Ảnh tải về đủ hình, điểm, nhãn, chữ đúng dấu, trên cả máy tính và điện thoại |
| G4.2 | Đánh bóng giao diện theo design tokens đã chọn (màu, font tiếng Việt, bo góc, khoảng cách); đủ trạng thái đang tải, rỗng, lỗi | Mọi màn cùng một phong cách; không còn chữ tiếng Anh mặc định hoặc Lorem ipsum |
| G5.1 | Kiểm thử: chạy trọn kịch bản demo 6 bước và bộ phối thử; mở link deploy bằng cửa sổ ẩn danh và tài khoản khác | Không lỗi nào chặn demo; danh sách chỗ còn dữ liệu tạm đã được thay hoặc chấp nhận |
| G5.2 | README (giới thiệu, cách chạy, kiến trúc, nguồn cảm hứng UI và giấy phép); kiểm tra repo không chứa khóa API; deploy bản cuối; quay video 2–5 phút; gom link hội thoại Gemini thành PDF | Đủ 4 mục nộp: video, PDF hội thoại, link GitHub, link demo |

## Việc song song và đường cắt

Hai việc dưới đây không phải prompt code; làm xong phần nào thì thay file vào phần đó, không sửa code.

| Việc | Ai làm | Thay vào | Nên xong trước |
| --- | --- | --- | --- |
| Lịch sử, ý nghĩa 2 áo và 4 món truyền thống | Nhóm | `data/items.json` | G5.1 |
| Rubric, system instruction trong app, câu nhận xét dự phòng | Claude/Gemini soạn, nhóm duyệt | `data/gemini.json` | G2.2 |
| Ý nghĩa sự kiện, lý do luật, mô tả món hiện đại, nhận xét preset, bảng màu, bộ phối thử | Claude/Gemini soạn, nhóm duyệt | `data/*.json` | Bộ phối thử trước G1.1; phần còn lại trước G5.1 |
| Hình SVG thật (2 mannequin, áo, quần × 2 dáng, món dùng chung) | Công cụ AI sinh SVG, theo khung tọa độ chung | `public/assets/svg/` (ghi đè cùng tên) | Có hình là thử ghép lớp ngay; chậm nhất trước G4.2 |

**Đường cắt khi thiếu thời gian** (cắt từ trên xuống): G3 (đăng nhập), mannequin nam thật (giữ hình tạm hoặc chỉ dùng nữ), G4.1 (xuất thẻ look), hiệu ứng ở G4.2. Nếu SVG thật ghép lớp không khít: chuyển màn Remix sang flat lay, luồng và chấm điểm giữ nguyên.
