# Lưu lựa chọn và điều ước lên Google Sheet

Website gửi hai loại dữ liệu vào một Google Sheet của anh:

- **Lựa chọn** ở màn 9 ("Sau hôm nay, mình làm gì nhỉ?"). Mỗi máy một dòng. Khi cô ấy đổi ý, dòng đó được cập nhật.
- **Điều ước** ở màn 12 ("Em muốn ước điều gì?"). Mỗi điều ước một dòng. Điều ước bật **"Giữ điều ước cho riêng em"** không bao giờ được gửi.

Website không gửi IP hay thông tin thiết bị, chỉ một mã ngẫu nhiên (cột "Thiết bị") để biết các dòng đến từ cùng một máy. Link nhận dữ liệu chỉ ghi được vào Sheet, không đọc được gì.

Khi chưa cài link, website vẫn chạy bình thường và không gửi gì.

## Cài đặt (khoảng 5 phút)

1. **Tạo Sheet.** Mở [sheets.new](https://sheets.new) bằng tài khoản Google của anh, đặt tên, ví dụ "MJ Universe".
2. **Dán đoạn mã.**
   - Vào **Tiện ích mở rộng → Apps Script**.
   - Xóa đoạn mã mẫu, dán toàn bộ nội dung file [`Code.gs`](Code.gs), rồi bấm **Lưu**.
3. **Chạy `setup` một lần.**
   - Ở thanh trên cùng, chọn hàm `setup` rồi bấm **Chạy**.
   - Google sẽ xin quyền. Vì đây là mã của chính anh, Google có thể báo "ứng dụng chưa được xác minh": bấm **Nâng cao → Đi tới … (không an toàn) → Cho phép**.
   - Sheet sẽ có hai trang "Lựa chọn" và "Điều ước", giờ hiển thị theo giờ Việt Nam.
4. **Triển khai.**
   - Bấm **Triển khai → Tùy chọn triển khai mới**, chọn loại **Ứng dụng web**.
   - **Thực thi với tư cách:** Tôi.
   - **Người có quyền truy cập:** Bất kỳ ai.
   - Bấm **Triển khai**, rồi copy **URL ứng dụng web** (kết thúc bằng `/exec`).
5. **Kiểm tra link.** Mở URL đó trên trình duyệt. Nếu thấy `{"ok":true,...}` là được.
6. **Gắn vào Vercel.**
   - Vào project **lil-j → Settings → Environment Variables**.
   - Thêm biến `VITE_SHEET_URL` có giá trị là URL vừa copy. Chọn **Production**, và thêm **Preview** nếu muốn thử trên bản xem trước.
   - Bấm **Redeploy** để website nhận link mới.
7. **Thử một lần.**
   - Mở website với `?dev=1`, chọn vài việc ở màn 9 và gửi một điều ước ở màn 12.
   - Trong khoảng vài giây sẽ có dòng mới, với cột "Thử nghiệm" là "có".
   - Xóa các dòng thử trước ngày 18/11.

## Khi sửa đoạn mã sau này

Vào **Triển khai → Quản lý các lần triển khai → Chỉnh sửa (biểu tượng bút chì) → Phiên bản: Phiên bản mới → Triển khai**. URL được giữ nguyên, nên không phải sửa gì trên Vercel.

## Tắt tính năng

Xóa biến `VITE_SHEET_URL` trên Vercel rồi Redeploy. Website sẽ ngừng gửi; dữ liệu đã có trên Sheet vẫn còn.

## Ghi chú kỹ thuật

- Website gửi `POST` dạng `text/plain` chứa JSON:
  - Lựa chọn: `{ v, kind: "dreams", visitor, at, ids, items, test }`
  - Điều ước: `{ v, kind: "wish", visitor, at, id, text, test }`
- Đoạn mã bỏ qua dữ liệu sai mẫu:
  - mã thiết bị và mã điều ước theo mẫu `^[A-Za-z0-9-]{6,64}$`;
  - mã lựa chọn theo mẫu `^d\d{1,2}$`, tối đa 20 mục;
  - mỗi chuỗi tối đa 180 ký tự;
  - thân request tối đa 4 KB.
- Chuỗi bắt đầu bằng `= + - @` được lưu dưới dạng chữ, không chạy như công thức.
- Website giữ hàng chờ trong `localStorage` (`lilj.outbox.v1`) và tự gửi lại khi mở lại website, khi có mạng trở lại, hoặc khi chuyển sang ứng dụng khác.
- Kiểm tra tự động: `npm run sheet-sync-test` trong `site/`.
