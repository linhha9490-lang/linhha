# SPX Tracker — v2.1

Bản đầy đủ: giải nén rồi thay toàn bộ vào repo. `CACHE` → `spx-tracker-v2.1`, `version.json` → `v2.1`
(người dùng sẽ thấy banner cập nhật). `OCR_PIPELINE_VERSION` vẫn là `p2`.

## Chạy test
```
npm test          # = node --test tests/*.test.mjs   (cần Node ≥ 20, không cài thêm gói nào)
```
73 test, ~1 giây. Gồm: tiện ích, bảng điểm + tra điểm, sanitize/lưu trữ, nạp/backup dữ liệu, Cloud, nhập/xóa bản ghi,
OCR (ngày, dải cân, sửa chữ số, lô ảnh) và kiểm tra nhất quán cả repo (import/export, onclick ↔ window,
danh sách file của Service Worker, version ↔ CACHE, kích thước icon/ảnh trong manifest).
Khi sửa `sw.js`/file trong `CORE` mà quên bump `CACHE`, hoặc đổi tên một hàm đang được import, `npm test` sẽ báo đỏ.

## Mới trong v2.1
- **Ngày OCR dạng ISO** (`2026-10-17`) được đọc đúng (trước đây thành `26-10-17` → bị loại).
- **Sửa lỗi của chính v2:** ngày dính chữ do OCR (`Giao06/10`) bị hụt vì dùng `\b` → đã đổi sang kiểm chữ số liền kề.
- **Banner cảnh báo "đã sửa số" không còn dính lại** khi mở form nhập/sửa thủ công sau một lần OCR.
- `entry.js`: có `editId` nhưng thiếu loại bản ghi → báo lỗi thay vì tạo bản ghi rác.
- `calc.js`: tra điểm với giá trị âm/NaN/< dòng đầu không còn rơi vào dòng cuối (điểm cao nhất).
- Tesseract ghim `5.1.1` (đổi ở `TESSERACT_LIB_URL` trong `ocr.js` và `TESS_RUNTIME_URLS` trong `sw.js`).
- Gom hằng số vào `config.js`: `TAIXE_ORDER_THRESHOLD`, `AUTO_BACKUP_DAYS`, `OCR_TIMEOUT_MS`, `MAX_CANVAS_PX`.
- `escapeHtml` chuyển sang `utils.js` (dùng chung).
- Dọn code chết: `setOverviewFilter`, `updateThemeBtnUI`, `clearAllConfidenceHighlights` (bản ocr.js),
  tham số thừa của `showFixWarning`, nhãn `#currentBonusPctLabel` không tồn tại.

## Đã có từ v2
### Nhập / xóa dữ liệu
- Bỏ banner "Hoàn tác" hỏng (`undoLast`). Hộp thoại nạp 3 nút Hủy / Thêm vào / Ghi đè; chạm ra ngoài = HỦY.
- `runImport()` dùng chung cho dán JSON, chọn file, Cloud: sai định dạng / 0 bản ghi → báo lỗi, không đụng dữ liệu.
- Nạp "Thêm vào" cấp id mới cho bản ghi trùng id. Settings từ file/Cloud được chuẩn hoá.
- Cloud: auto-backup không đẩy dữ liệu rỗng; token chỉ lưu sau khi dùng được; hỗ trợ Gist > 1MB (`raw_url`).
- Sửa bản ghi không cho lưu toàn số 0; "Xóa toàn bộ" ghi ngay; `periodMode` ép về `month`.
### OCR
- Ngày phải là ngày thật, "30/12" đọc đầu năm → năm trước, dải cân không bị nhận nhầm là ngày; tự lưu chặn ngày tương lai.
- Số có 0 đứng đầu ("06-10") không bị coi là dải cân. Sửa chữ số đoán chỉ khi có đúng 1 nghiệm.
- Một ảnh lỗi không làm hỏng cả lô; Hủy dừng hẳn job Tesseract; lượt 1 chưa đọc được "Tổng" vẫn thử thêm.
- Lô ảnh: lưu xong từng ảnh thì ảnh rời lô; "Lưu tất cả" giữ lại ảnh cần xem thay vì xóa im lặng.
- Cache OCR chỉ lưu kết quả đã khớp tổng; bỏ migration từ localStorage cũ. Ảnh lớn: trần diện tích canvas.
- `sw.js`: Tesseract (worker, core, dữ liệu tiếng Việt) được cache lúc chạy theo URL thật → OCR offline.
### Manifest
- `screenshots` dùng `screenshots/screenshot-1.jpg` (1080×2460).

## Chưa làm (cố ý)
- Tách `ocr.js` / `main.js`, gộp `showChoice` vào `_openDialog`: nên làm tiếp, giờ đã có test để refactor an toàn.
- Chưa kiểm chứng trên trình duyệt/điện thoại thật: OCR offline, hủy OCR, giao diện hộp thoại. Test chạy trên DOM giả lập.
