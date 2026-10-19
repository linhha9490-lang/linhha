# SPX Tracker — bản vá v2

Thay toàn bộ file trong gói này vào repo (giữ nguyên đường dẫn), rồi deploy.
`sw.js` đã bump `CACHE` → `spx-tracker-v2`, `version.json` → `v2`, `OCR_PIPELINE_VERSION` → `p2`
(cache OCR cũ tự bị bỏ).

## Nhập / xóa dữ liệu
- `index.html`: bỏ banner "Hoàn tác" (gọi `undoLast()` đã không còn → bấm là lỗi).
- `backup.js`: hộp thoại nạp dữ liệu có 3 nút (Hủy / Thêm vào / Ghi đè); chạm ra ngoài hoặc Esc = HỦY
  (trước đây bị hiểu là "Thêm vào"). Dùng chung `runImport()` cho dán JSON, chọn file và Cloud.
- `backup.js`: file sai định dạng (`null`, `[]`…) hoặc 0 bản ghi → báo lỗi, không đụng dữ liệu hiện tại.
- `backup.js`: nạp "Thêm vào" cấp id mới cho bản ghi trùng id (trước đây Sửa/Xóa luôn trúng bản đầu tiên).
- `backup.js`: settings từ file/Cloud được chuẩn hoá (theme chỉ light/dark, salary/rank đúng kiểu, bonus ≤ 1).
- `cloud.js`: auto-backup KHÔNG đẩy dữ liệu rỗng lên Gist; backup tay khi rỗng phải xác nhận.
- `cloud.js`: token mới chỉ được lưu sau khi dùng được; hỗ trợ Gist > 1MB (`raw_url`); chống backup chồng nhau.
- `entry.js`: sửa bản ghi không cho lưu toàn số 0; "Xóa toàn bộ" ghi xuống ngay (không chờ debounce).
- `state.js`: ép `periodMode='month'` (máy còn giá trị `day` từ bản cũ không bị kẹt).

## OCR
- Ngày: phải là ngày thật (không còn lưu "31/04" rồi mất khi tải lại), "30/12" đọc đầu năm → năm trước,
  cặp dải cân kiểu "2-4" không bị nhận là ngày; tự lưu chặn ngày tương lai.
- Parser: số có 0 đứng đầu ("06-10") không bị coi là dải cân (trước đây làm lệch số liệu).
- Sửa chữ số đoán: chỉ sửa khi có đúng 1 cách khớp tổng; nhiều cách → để người dùng đối chiếu.
- Quét nhiều ảnh: 1 ảnh lỗi không làm hỏng cả lô; nút Hủy dừng hẳn job Tesseract.
- Lượt quét: nếu lượt 1 chưa đọc được "Tổng" vẫn thử thêm (tối đa 3 lượt); chấm lại kết quả cũ khi đọc được Tổng.
- Lô ảnh: lưu xong từng ảnh thì ảnh rời lô (không còn bật lại modal lô mãi); "Lưu tất cả" giữ lại ảnh
  nghi ngờ / ngày sai / cùng ngày khác số / ảnh lỗi thay vì xóa im lặng.
- Cache: chỉ cache kết quả đã đối chiếu khớp; bỏ migration từ localStorage đời cũ.
- Ảnh lớn: giới hạn diện tích canvas (tránh canvas rỗng trên iOS), giải phóng bộ nhớ sau mỗi lượt.
- `sw.js`: Tesseract (worker, core, dữ liệu tiếng Việt) được cache lúc chạy theo đúng URL thật → OCR offline.

## Manifest
- `screenshots` dùng ảnh bạn gửi (`screenshots/screenshot-1.jpg`, 1080×2460).
