# Việt phục Remix: Tổng hợp ý tưởng POC (AI Arena, vòng Audition)

Trạng thái: bản chốt giai đoạn ý tưởng, đã đồng bộ với tài liệu kiến trúc và workflow (cập nhật 10/10/2026).
Dữ liệu văn hóa trong tài liệu này là **bản nháp, chưa thẩm định**. Đây là POC: ưu tiên bản chạy được trong thời gian ngắn nhất, đúng mục đích đã plan, không làm phức tạp hơn mức cần.

---

## 1. Tóm tắt

- **Sản phẩm:** web app giúp Gen Z khám phá và phối trang phục truyền thống Việt Nam theo sự kiện, có chấm điểm và cảnh báo văn hóa.
- **Người dùng:** Gen Z (học sinh, sinh viên), mở app khi cần khám phá và phối trang phục truyền thống.
- **Nỗi khó chính:** sợ phối sai, phối không đẹp, phối không phù hợp bản sắc văn hóa. Hai mặt của cùng một căng thẳng: hiện đại mà vẫn tôn trọng.
- **Trục chính:** theo sự kiện.
- **Điểm khác biệt:** thanh đo mức cách tân (Culture Meter) + chấm điểm văn hóa kết hợp luật (code) và AI (Gemini), có cờ `isTaboo` và cảnh báo có giải thích.
- **Mục tiêu POC:** đủ 4 chức năng bắt buộc của đề, chứng minh kỹ thuật và khả năng mở rộng bằng dữ liệu.

## 2. Phạm vi POC

Nguyên tắc: chọn **ít** để chạy chắc. Hệ thống thiết kế theo dữ liệu, nên thêm sự kiện, món, luật chỉ cần thêm dữ liệu, không sửa logic (dùng để chứng minh khả năng mở rộng khi thuyết trình).

### Sự kiện (2)
| Mã | Sự kiện | Tinh thần |
|---|---|---|
| E1 | Lễ tốt nghiệp / Kỷ yếu | Trang trọng, tự hào |
| E2 | Du xuân / Tết | Rực rỡ, vui tươi, năng động |

Ứng viên mở rộng đầu tiên: Dạo phố / Cà phê cuối tuần, Đám cưới / Lễ hội văn hóa.

### Trang phục chính (2, cả nam và nữ)
- **Áo Tấc:** lễ phục tay thụng, trang trọng.
- **Áo Ngũ Thân tay chẽn:** thường phục, tay bó gọn, năng động.

Để sau: Áo Nhật Bình (nữ, cung đình), Áo Dài.

### Danh mục món (12 món, mỗi tầng 1-2 truyền thống, 1-2 hiện đại)
| Mã | Tầng | Món | Loại | Màu |
|---|---|---|---|---|
| top_tac | Áo | Áo Tấc | Truyền thống | Đỏ son, Xanh thiên thanh |
| top_ngu_than | Áo | Áo Ngũ Thân tay chẽn | Truyền thống | Xanh lục, Hồng phấn |
| bot_lua_trang | Quần | Quần lụa trắng ống suông | Truyền thống | Trắng |
| bot_tay_au | Quần | Quần tây âu xếp ly | Hiện đại | Đen |
| bot_short | Quần | Quần short | **Món gây lỗi** | Be |
| head_khan_dong | Đội đầu | Khăn đóng | Truyền thống | Đen |
| head_bang_do | Đội đầu | Băng đô ngọc trai bản to | Hiện đại | Trắng ngà |
| shoe_guoc_moc | Giày dép | Guốc mộc quai nhung | Truyền thống | Đỏ |
| shoe_sneaker | Giày dép | Sneaker trắng cổ thấp | Hiện đại | Trắng |
| shoe_dep_le | Giày dép | Dép lê | **Món gây lỗi** | Đen |
| acc_quat_giay | Phụ kiện | Quạt giấy dó | Truyền thống | Nâu giấy |
| acc_tui_coi | Phụ kiện | Túi cói mini | Hiện đại | Be |

Phụ kiện đeo người, kính râm, túi đeo chéo, bình giữ nhiệt... để sau.

Quy ước đã chốt:
- Món gây lỗi (quần short, dép lê) được tính là **món hiện đại** cho Culture Meter và trần 89.
- Tầng bắt buộc: Áo, Quần, Giày dép. Tầng tùy chọn: Đội đầu, Phụ kiện (có nút "bỏ chọn").
- Chỉ **áo** đổi được màu; các món khác một màu cố định.

### Bảng màu (4 màu, 2 nhóm)
- Truyền thống: Đỏ son, Xanh lục
- Pastel / Hiện đại: Hồng phấn, Xanh thiên thanh

Màu đổi bằng cách tô lại hình vector (SVG), không vẽ lại cho từng màu. Mã món trong bộ đồ: áo ghi `ma_mon:ma_mau` (ví dụ `top_tac:do_son`), món khác chỉ ghi `ma_mon`.

### Giới tính và mannequin
- Hai mannequin: nam và nữ. Áo và quần có hai biến thể dáng; đội đầu, giày, phụ kiện dùng chung. Ước tính khoảng 19 hình SVG.
- Người dùng chọn giới tính lần đầu vào app; nếu đăng nhập thì lưu vào hồ sơ tài khoản. Có chế độ khách (không đăng nhập) để demo không phụ thuộc đăng nhập.

## 3. Trải nghiệm người dùng

Luồng: **Preset phối sẵn → Người dùng tùy biến (mix & match) trên mannequin → Đánh giá → Xuất thẻ look.**

| Bước | Màn hình | Nội dung |
|---|---|---|
| 0 | Vào app | Chọn giới tính (đăng nhập Google tùy chọn) |
| 1 | Chọn sự kiện | Thẻ E1, E2 |
| 2 | Khuyến nghị | Mannequin mặc sẵn preset "chuẩn", kèm thẻ tóm tắt ý nghĩa |
| 3 | Tùy biến (Remix) | Tab Áo / Quần / Đội đầu / Giày / Phụ kiện + chọn màu áo; bỏ chọn đội đầu, phụ kiện; click món đổi ngay; popup 2 dòng nguồn gốc; thanh đo và cảnh báo cập nhật tức thì |
| 4 | Đánh giá | Bấm "Xem đánh giá": điểm, nhãn phong cách, cảnh báo, nhận xét |
| 5 | Xuất lookbook | "Lưu kết quả": tải thẻ look (ảnh) |

Màn hình làm việc là khung nhìn thống nhất: mannequin bên trái, thẻ thông tin bên phải (tên bộ đồ, thanh đo, ý nghĩa, nguồn, cảnh báo).

Đối chiếu 4 chức năng bắt buộc của đề:
1. Chọn loại trang phục hoặc sự kiện: bước 1 và tab Áo.
2. Chọn màu, phụ kiện, phong cách: bước 3.
3. Xem kết quả phối (mockup + thẻ gợi ý): bước 2-4.
4. Đọc thông tin nguồn gốc, ý nghĩa: popup và thẻ.

## 4. Cơ chế đánh giá

### 4.1 Kỹ thuật (câu để thuyết trình)
> **Hybrid rule-based + LLM.** Luật văn hóa và điểm sự kiện được tính bằng code từ dữ liệu có nguồn; Gemini API (structured output) chỉ đánh giá thẩm mỹ và viết nhận xét; mọi căn cứ của AI được code kiểm tra trước khi hiển thị; có phương án dự phòng khi AI lỗi.

Vì sao chọn cách này cho POC: kết quả ổn định và giải thích được (có mã luật), phần chủ quan vẫn có AI, không cần RAG, fine-tune hay hạ tầng phức tạp, và chạy tiếp được khi AI lỗi lúc demo.

### 4.2 Ai làm gì
| Việc | Ai làm |
|---|---|
| Chọn ô, tô màu, thanh đo mức cách tân | Code, tức thì, không gọi API |
| Luật cảnh báo, cờ `isTaboo` | Code, từ bảng luật |
| Điểm văn hóa, điểm sự kiện | Code, từ bảng dữ liệu |
| Điểm thẩm mỹ (màu và phụ kiện remix có duyên không) | AI (3 mức thô), kèm nhận xét |
| Nhãn phong cách | Code, từ khung điểm |
| Nội dung cảnh báo, nguồn trích dẫn, nguồn gốc món | Lấy nguyên văn từ dữ liệu, AI không viết |
| Soạn nháp nhận xét cho preset | AI soạn nháp, người duyệt, lưu thành dữ liệu |

AI không làm: quyết định `isTaboo`, sửa luật, tự tìm thông tin ngoài dữ liệu, sinh ảnh, trả lời câu hỏi mở.

### 4.3 Thanh đo mức cách tân (Culture Meter)
Mô tả mức cách tân, **không phán đúng sai**. Tính theo số món hiện đại trong bộ đồ (kể cả món gây lỗi):
- 0 món: Chuẩn lịch sử
- 1-2 món: Cách tân
- 3-4 món: Phá cách

Ngưỡng là bản nháp, chỉnh khi test.

### 4.4 Chấm điểm (0-100)
| Trụ cột | Trọng số | Cách tính |
|---|---|---|
| Đúng mực văn hóa | 40 | Code: bắt đầu 40; vi phạm `isTaboo` = 0; mỗi cảnh báo mềm trừ 10, trừ dồn, thấp nhất 0 |
| Phù hợp sự kiện | 30 | Code: áo "hợp" = 30, "lệch" = 15 (bảng bên dưới) |
| Thẩm mỹ và remix | 30 | AI: tốt = 30, ổn = 20, chưa hài hòa = 10. Nếu AI lỗi: 20 và ghi chú "tạm tính" |

Giới hạn trần (áp dụng theo thứ tự):
1. Có `isTaboo`: tổng tối đa 49, nhãn "Lỗi Văn hóa".
2. Áo lệch sự kiện: tối đa 74, nhãn "Lệch gu / Sai bối cảnh".
3. Có món hiện đại: tối đa 89.

Nhãn phong cách (xét điều kiện theo thứ tự, sau khi đã áp trần):
| Điều kiện | Nhãn |
|---|---|
| Có `isTaboo` | Lỗi Văn hóa |
| Áo lệch sự kiện | Lệch gu / Sai bối cảnh |
| Không có món hiện đại, điểm ≥ 90 | Cổ phong Chuẩn lễ |
| Không có món hiện đại, điểm < 90 | Cổ phong Cơ bản |
| Có món hiện đại, điểm ≥ 75 | Remix Tinh tế (Modern Fusion) |
| Có món hiện đại, điểm < 75 | Remix Chưa ăn ý |

Độ hợp áo với sự kiện (nháp):
| Áo | E1 Tốt nghiệp/Kỷ yếu | E2 Du xuân/Tết |
|---|---|---|
| Áo Tấc | hợp | lệch |
| Áo Ngũ Thân | lệch | hợp |

### 4.5 Bộ luật POC (nháp, cần gắn nguồn)
| Mã | Loại | Điều kiện | Hiển thị |
|---|---|---|---|
| R01 | taboo | Quần short + (Áo Tấc hoặc Áo Ngũ Thân) | Cảnh báo văn hóa, `isTaboo = true` |
| R02 | taboo | Dép lê + Áo Tấc | Cảnh báo văn hóa, `isTaboo = true` |
| R03 | warn (-10) | Dép lê + Áo Ngũ Thân | Cảnh báo mềm |
| R04 | note (0) | Sneaker + Áo Tấc | Lưu ý: nên giữ phần áo nguyên bản, cách tân ở phụ kiện |

Các món gây lỗi (quần short, dép lê) vẫn chọn được để cảnh báo hiện lên; không khóa.
Khóa cứng: mỗi tầng tối đa 1 món; Áo, Quần, Giày dép bắt buộc có món.

### 4.6 Hợp đồng với AI
Input (code dựng): sự kiện, giới tính, danh sách món và màu, kết quả của code (cờ, điểm, luật kích hoạt), rubric 3 mức thẩm mỹ.
Output (ép bằng structured output):
```json
{ "thamMy": "tot | on | chua",
  "feedback": "tối đa 2 câu",
  "can_cu_ids": ["mã món hoặc mã luật"] }
```
Chỉ dẫn: chỉ dùng thông tin trong dữ liệu được đưa; không mâu thuẫn kết quả của code; giọng dí dỏm kiểu Gen Z cho lời nhận xét, nhưng không đùa trong cảnh báo văn hóa; nếu không có luật nào bị vi phạm thì nói "chưa phát hiện xung đột theo bộ quy tắc hiện có", không nói "đúng chuẩn văn hóa".

Code kiểm tra: đúng schema, độ dài, `can_cu_ids` có thật. Không hợp lệ hoặc AI lỗi thì dùng dự phòng: `thamMy = on`, câu nhận xét mẫu ghép từ dữ liệu.

Chạy phía server; timeout 8 giây; lưu tạm theo khóa (sự kiện + giới tính + món kèm màu), kết quả dự phòng không lưu; chỉ gọi khi bấm "Xem đánh giá".

## 5. Bảo đảm thông tin văn hóa (phần đề yêu cầu đề xuất)
1. Kho dữ liệu có nguồn, mỗi món và luật có mã nguồn trích dẫn hiển thị trong app.
2. Luật cảnh báo có lý do rõ ràng; cảnh báo mềm giải thích thay vì cấm, để người dùng vừa sáng tạo vừa hiểu.
3. AI bị giới hạn: chỉ diễn giải dữ liệu đã duyệt, không viết nguồn gốc hay nguồn trích dẫn.
4. Minh bạch: nhãn "Nhận định do AI viết dựa trên dữ liệu đã duyệt", nút báo sai (mở Google Form, link đặt trong file cấu hình), nhãn "Dữ liệu minh họa POC, cần thẩm định" cho bản demo.
5. Quy trình mở rộng: nội dung mới đi qua bước người duyệt (giảng viên hoặc chuyên gia nếu có).

## 6. Dữ liệu (cho database)

Thực thể: Source, Item, Event, Rule, Preset, UserProfile.

```json
// Item (ví dụ)
{ "id": "top_tac", "ten": "Áo Tấc", "tang": "ao",
  "loai": "truyen_thong", "mau": ["do_son", "xanh_thien_thanh"],
  "mo_ta": "...", "tu_khoa": ["trang nghiem"],
  "nguon_goc_2_dong": ["...", "..."], "nguon_ids": ["S01"],
  "hinh": { "nam": "...", "nu": "..." } }

// Rule (ví dụ)
{ "id": "R01", "loai": "taboo",
  "dieu_kien": { "co": ["bot_short"], "va_mot_trong": ["top_tac", "top_ngu_than"] },
  "ly_do": "...", "nguon_ids": ["S02"] }

// Preset (ví dụ)
{ "id": "PR_E1_chuan", "su_kien": "E1",
  "mon": ["top_tac:do_son", "bot_lua_trang", "head_khan_dong", "shoe_guoc_moc"],
  "nhan_xet_da_duyet": "..." }
```

Presets (4):
- E1 chuẩn: Áo Tấc đỏ son + quần lụa trắng + khăn đóng + guốc mộc
- E1 remix: Áo Tấc xanh thiên thanh + quần lụa trắng + sneaker
- E2 chuẩn: Áo Ngũ Thân xanh lục + quần lụa trắng + quạt giấy + guốc mộc
- E2 remix: Áo Ngũ Thân hồng phấn + quần tây âu + sneaker + túi cói + băng đô

UserProfile (tùy chọn): `{ uid, gioi_tinh, createdAt }`.

Nơi lưu: dữ liệu tri thức là file JSON cố định trong mã nguồn; hồ sơ người dùng (nếu đăng nhập) lưu trong Firestore.

## 7. Công nghệ Google và đầu vào cho giai đoạn kỹ thuật

Đã chọn:
- **Gemini API** (server, structured output): đánh giá thẩm mỹ, nhận xét. Khóa API do AI Studio cấu hình phía server; không đặt khóa trong prompt, hội thoại, mã giao diện hay GitHub.
- **Firebase Authentication** (đăng nhập Google) và **Firestore** (hồ sơ giới tính): AI Studio Build mode tự cấp phát.
- Công cụ build: Gemini (lên ý tưởng, viết prompt) và AI Studio Build mode (tạo app, giao diện mặc định React).

Đã chốt (nhóm xác nhận): deploy qua AI Studio; chi phí Cloud Run được nới theo gói starter do nhà tổ chức thông báo; hạn mức API đủ cho POC. Đề xuất: web responsive.

Hạn mức API tính theo project và theo model; kiểm tra trong AI Studio trước ngày nộp.

## 8. Đáp ứng tiêu chí chấm

| Tiêu chí | Cách đáp ứng |
|---|---|
| Execution / Feasibility (50%) | Đủ 4 chức năng bắt buộc; chạy được khi AI lỗi; phạm vi nhỏ có kiểm soát; kiểm thử nhiều lần |
| Vision (30%) | Câu chuyện: tôn trọng văn hóa + sáng tạo; kỹ thuật hybrid rõ ràng; lộ trình mở rộng bằng dữ liệu |
| Creativity (20%) | Thanh đo mức cách tân, cờ cấm kỵ, nhãn phong cách, đánh giá bởi AI |
| Điểm cộng Google | Gemini API, Firebase Auth, Firestore |

Thông điệp mở rộng: thêm sự kiện, món, luật chỉ cần thêm dữ liệu; hợp đồng với AI không đổi; khi dữ liệu lớn có thể chuyển sang Firestore và File Search; thêm quy trình duyệt của chuyên gia.

## 9. UI/UX

- Tài nguyên: Mobbin (luồng, bố cục), Dribbble (thẩm mỹ), Sera UI (mã component React/Tailwind), MotionSites (hiệu ứng hero, nếu cần). Không dùng Figma, Stitch, Variant.
- Quy trình: chọn 2-3 tham chiếu, chốt design tokens (màu, font có dấu tiếng Việt, độ bo góc, khoảng cách), build theo giai đoạn, chỉnh bằng annotation mode.
- Ghi lại nguồn cảm hứng và giấy phép vào README.
- Nội dung thật, không dùng Lorem ipsum; đủ trạng thái đang tải, rỗng, lỗi.

## 10. Thứ tự build và đường cắt

| Giai đoạn | Việc |
|---|---|
| G0 | Khung, file dữ liệu JSON, mannequin nữ, các tầng đồ, tô màu |
| G1 | Luật, điểm, nhãn, cảnh báo, popup nguồn, thanh đo (toàn bộ chạy bằng code) |
| G2 | Gemini đánh giá thẩm mỹ và nhận xét, kiểm tra, dự phòng |
| G3 | Mannequin nam, chọn giới tính, đăng nhập Google, lưu hồ sơ (có chế độ khách) |
| G4 | Xuất thẻ look (ảnh), đánh bóng giao diện |
| G5 | Kiểm thử, README và nguồn, link demo ẩn danh, video 2-5 phút |

Hình SVG chuẩn bị sau bằng công cụ AI sinh SVG, theo khung tọa độ chung (cùng `viewBox`, cùng điểm neo, vùng đổi màu đánh dấu thống nhất). Trước đó các giai đoạn chạy bằng hình tạm. Có SVG thật là thử ghép lớp ngay, để kịp lùi về flat lay nếu không khít.

Đường cắt khi thiếu thời gian (cắt từ dưới lên): đăng nhập và lưu hồ sơ, mannequin nam (giữ chọn giới tính theo phiên), xuất thẻ look, hiệu ứng. Nếu ghép lớp mannequin không khít: chuyển sang bảng phối (flat lay) kèm thẻ gợi ý, luồng và chấm điểm giữ nguyên.

Kịch bản demo: (1) chọn E1, thấy preset chuẩn và thẻ nguồn; (2) đổi sneaker, thanh đo chuyển; (3) chọn quần short, hiện cảnh báo văn hóa; (4) bấm đánh giá, AI nhận xét; (5) chuyển E2, thử remix; (6) giới thiệu file dữ liệu để chứng minh khả năng mở rộng.

## 11. Rủi ro và dự phòng
| Rủi ro | Dự phòng |
|---|---|
| Ghép lớp mannequin không khít | Thử sớm 1 mannequin + 2-3 món; lùi về flat lay |
| AI lỗi, hết hạn mức | Kết quả code + câu nhận xét mẫu; lưu tạm; chỉ gọi khi bấm nút |
| AI thêm thông tin ngoài dữ liệu | Chỉ dẫn chặt, kiểm tra `can_cu_ids`, thử 10-15 bộ đồ, mỗi bộ 3 lần |
| Dữ liệu văn hóa sai | Gắn nhãn dữ liệu minh họa, ghi nguồn, nhờ người am hiểu duyệt nếu có |
| Đăng nhập làm hỏng demo | Chế độ khách |
| Khóa API lộ | Không đặt trong prompt, hội thoại, mã giao diện hay GitHub |
| Link demo không mở được với giám khảo | Thử bằng cửa sổ ẩn danh và tài khoản khác |

## 12. Còn mở

- Thời gian: nhóm xác nhận đủ cho phạm vi POC; giữ đường cắt ở mục 10 làm phương án an toàn.
- Phân công nội dung: nhóm viết lịch sử, ý nghĩa của 2 áo (và 4 món truyền thống đi kèm); Claude hoặc Gemini soạn phần chữ còn lại (ý nghĩa sự kiện, lý do luật, mô tả món hiện đại, nhận xét preset, bảng màu, rubric, system instruction trong app, câu nhận xét dự phòng, bộ phối thử) để nhóm duyệt; AI Studio sinh phần dạng code. Chưa có nội dung thì dùng dữ liệu tạm `[CHỜ BỔ SUNG]`.
- Nguồn trích dẫn: nhóm bổ sung sau; trước đó các trường nguồn để trống `[]`.
- Người duyệt nội dung văn hóa: chưa xác định.
- Tài nguyên ngoài (Mobbin, Dribbble, Sera UI, MotionSites): nhóm xác nhận hợp lệ; vẫn ghi nguồn trong README.
- Tính năng nâng cao (so sánh phương án, gợi ý từ mô tả, thời tiết, tải ảnh, chia sẻ công khai): tạm gác.
- Kiến trúc và workflow: đã chốt (xem tài liệu workflow hệ thống).

## 13. Giới hạn trung thực

- Nội dung lịch sử và văn hóa trong tài liệu này chưa được xác minh; cần tra nguồn đáng tin.
- Cách tiếp cận giảm rủi ro AI diễn đạt lệch nhưng không loại bỏ hoàn toàn.
- Tên model, hạn mức và tính năng của Gemini API và AI Studio có thể thay đổi; kiểm tra lại trước ngày nộp.
