# Lưu lựa chọn và điều ước lên Google Sheet

Website gửi hai loại dữ liệu vào một Google Sheet của anh:

- **Lựa chọn** ở màn 9 ("Sau hôm nay, mình làm gì nhỉ?"). Mỗi trình duyệt một dòng cho từng chế độ thật/thử nghiệm. Khi cô ấy đổi ý, dòng đó được cập nhật.
- **Điều ước** ở màn 11 ("Em muốn ước điều gì?"). Mỗi điều ước một dòng. Điều ước bật **"Giữ điều ước cho riêng em"** không bao giờ được gửi.

Website gửi mã trình duyệt ngẫu nhiên và nhãn thiết bị/trình duyệt gần đúng, ví dụ `iPhone · Safari`. Không gửi IP, tên máy cá nhân, mã phần cứng hay nguyên chuỗi user-agent. Đổi trình duyệt, xóa dữ liệu hoặc dùng địa chỉ preview khác có thể tạo mã mới. Không dùng nhãn này để xác minh danh tính. Link nhận dữ liệu chỉ ghi được vào Sheet, không đọc được gì.

Khi chưa cài link, website vẫn chạy bình thường và không gửi gì.

## Cài đặt (khoảng 5 phút)

1. **Tạo Sheet.** Mở [sheets.new](https://sheets.new) bằng tài khoản Google của anh, đặt tên, ví dụ "MJ Universe".
2. **Dán đoạn mã.**
   - Vào **Tiện ích mở rộng → Apps Script**.
   - Xóa đoạn mã mẫu, dán toàn bộ nội dung file [`Code.gs`](Code.gs), rồi bấm **Lưu**.
3. **Chạy `setup` một lần.**
   - Ở thanh trên cùng, chọn hàm `setup` rồi bấm **Chạy**.
   - Google sẽ xin quyền. Vì đây là mã của chính anh, Google có thể báo "ứng dụng chưa được xác minh": bấm **Nâng cao → Đi tới … (không an toàn) → Cho phép**.
   - Sheet sẽ có ba trang "Lựa chọn", "Điều ước" và "Thiết bị", giờ hiển thị theo giờ Việt Nam.
4. **Triển khai.**
   - Bấm **Triển khai → Tùy chọn triển khai mới**, chọn loại **Ứng dụng web**.
   - **Thực thi với tư cách:** Tôi.
   - **Người có quyền truy cập:** Bất kỳ ai.
   - Bấm **Triển khai**, rồi copy **URL ứng dụng web** (kết thúc bằng `/exec`).
5. **Kiểm tra link.** Mở URL đó trên trình duyệt. Nếu thấy `{"ok":true,...}` là được.
6. **Gắn vào Vercel.**
   - Vào project **lil-j → Settings → Environment Variables**.
   - Thêm biến `VITE_SHEET_URL` có giá trị là URL vừa copy. Chọn loại **Config** (không phải Secret vì `VITE_` được đưa vào website), bật **Preview** để thử PR. Production dùng ở lần build sau khi Parker cho merge.
   - Bấm **Redeploy** bản Preview của nhánh `feat/share-choices` để website nhận link mới.
7. **Thử một lần.**
   - Mở website với `?dev=1`, chọn vài việc ở màn 9 và gửi một điều ước ở màn 11.
   - Trong khoảng vài giây sẽ có dòng mới, với cột "Thử nghiệm" là "có".
   - Xóa các dòng thử trước ngày 18/11.

## Nâng cấp Sheet đang có (bản định dạng bảng và thiết bị)

1. Dán toàn bộ `Code.gs` mới vào Apps Script rồi lưu.
2. Chạy **setup**. Script sao lưu từng tab cũ có 5 cột trước khi đổi cấu trúc; bản sao có tên chứa `backup`. Dữ liệu cũ được giữ, thông tin thiết bị chưa có để trống. Nếu đã tự đổi tên cột, hãy khôi phục các tiêu đề cũ trước; script từ chối cấu trúc không nhận ra.
3. Hai tab dữ liệu có 5 cột hiển thị: thời gian, tên gợi nhớ, thiết bị/trình duyệt, nội dung, thử nghiệm. Hai cột mã ở cuối được ẩn. Đừng xóa/đổi tên các cột hoặc tab.
4. Trong tab **Thiết bị**, nhập tên vào cột **Tên gợi nhớ** (màu vàng nhạt) sau khi anh xác định được trình duyệt đó. Tên tự cập nhật ở cả hai tab dữ liệu. Không sửa tên trực tiếp trong hai tab dữ liệu vì đó là ô công thức.
5. Mở lại Sheet để thấy menu **MJ Universe → Cập nhật định dạng bảng**. Có thể chạy lại mà không nhân đôi dữ liệu. Bộ lọc "Thử nghiệm" cho phép ẩn các hàng có chữ "có".
6. Triển khai phiên bản Apps Script mới theo bước bên dưới. Bản web mới sẽ gửi nhãn thiết bị cùng lần tương tác tiếp theo; dữ liệu cũ không bị tự gửi lại. Bản web cũ vẫn gửi được tới script mới.

Định dạng lấy cảm hứng từ [Google Sheets Tables](https://support.google.com/docs/answer/14239833?hl=en): hàng xen kẽ, tiêu đề hồng nhạt, bộ lọc, cố định tiêu đề và nội dung xuống dòng. Đây là vùng dữ liệu được định dạng bằng Apps Script, không phải đối tượng Table gốc; không cần bật thêm Google API. Ngày giờ vẫn là giá trị ngày để sắp xếp đúng.

## Khi sửa đoạn mã sau này

Vào **Triển khai → Quản lý các lần triển khai → Chỉnh sửa (biểu tượng bút chì) → Phiên bản: Phiên bản mới → Triển khai**. URL được giữ nguyên, nên không phải sửa gì trên Vercel.

## Tắt tính năng

Xóa biến `VITE_SHEET_URL` trên Vercel rồi Redeploy. Website sẽ ngừng gửi; dữ liệu đã có trên Sheet vẫn còn.

## Ghi chú kỹ thuật

- Website gửi `POST` dạng `text/plain` chứa JSON:
  - Lựa chọn: `{ v, kind: "dreams", visitor, at, ids, items, test, device? }`
  - Điều ước: `{ v, kind: "wish", visitor, at, id, text, test, device? }`
- Đoạn mã bỏ qua dữ liệu sai mẫu:
  - mã thiết bị và mã điều ước theo mẫu `^[A-Za-z0-9-]{6,64}$`;
  - mã lựa chọn theo mẫu `^d\d{1,2}$`, tối đa 20 mục;
  - mỗi chuỗi tối đa 180 ký tự;
  - thân request tối đa 4 KB.
- Chuỗi bắt đầu bằng `= + - @` được lưu dưới dạng chữ, không chạy như công thức.
- Website giữ hàng chờ trong `localStorage` (`lilj.outbox.v1`) và tự gửi lại khi mở lại website, khi có mạng trở lại, hoặc khi chuyển sang ứng dụng khác.
- Kiểm tra tự động: `npm run sheet-sync-test` trong `site/`.

- `device` chỉ nhận nhãn platform/browser trong danh sách cho phép. Thông tin được ghi vào hàng chờ cùng lần tương tác và giữ nguyên khi thử gửi lại; điều ước giữ riêng không vào hàng chờ.
