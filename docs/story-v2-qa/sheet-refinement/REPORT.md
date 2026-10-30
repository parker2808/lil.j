# UI và Sheet — 2026-10-31

## Phạm vi

Dreams/Wish giữ nền galaxy, palette pastel pink, bo góc, hệ font/reveal và công tắc sao/trăng đã duyệt. Dreams dùng một đoạn hướng dẫn, chọn có nền hồng nhẹ và tick. Wish có cụm nhập/công tắc cùng chiều rộng, phản hồi lên bầu trời tự ẩn 3 giây và không hiện lại khi quay về màn.

Sheet có nhãn nhóm thiết bị/trình duyệt, tên gợi nhớ do Parker đặt ở tab Thiết bị, hai tab dữ liệu dùng công thức lấy cùng tên. Không thu IP, raw user-agent, model phần cứng hay tên máy cá nhân. Cấu trúc cũ được copy trước khi chuyển đổi; các hàng thử nghiệm và thật có khóa riêng.

## Kiểm tra

- Node 22.21.1; Chrome local.
- Build, content-check, progress-check, selfcheck: qua.
- Lint: không lỗi; 6 cảnh báo sẵn có ở JourneyMenu, Counter, LockScreen, Fireworks và Math.random của WishSky.
- sheet-sync-test: 14/14, gồm metadata qua hàng chờ offline, nhãn trên cả hai tab, alias không bị ghi đè, tách thử nghiệm/thật, migration có sao lưu và chạy lại, chống trùng và chuỗi giống công thức.
- story-v2-check: qua toàn hành trình, gửi lại sau lỗi, private wish không được gửi, nhãn thiết bị trong request.
- sheet-ui-check: VI/EN ở 430×932 và 430×739, safe area 59/34; ảnh normal/keyboard, công tắc nằm trong vùng còn lại khi giả lập bàn phím 42% màn hình; phản hồi mới hiện rồi tự ẩn, điều ước cũ không hiện phản hồi.
- Overlap: 48 trường hợp, 0 lỗi; hai màn, VI/EN, dev on/off, pending/done; iPhone được chạy trước desktop.

Các ảnh PNG trong thư mục dùng nội dung minh họa, không phải điều ước thật.

## Giới hạn

Apps Script được kiểm tra bằng Sheet giả lập. Chưa chạy phiên bản nâng cấp trên Google Sheet thật, chưa xác minh công thức tên/định dạng bằng Google Sheets engine và chưa thử bàn phím iPhone thật. Parker xác nhận phiên bản đồng bộ trước đó đã hoạt động. Cần dán Code.gs mới, chạy setup và triển khai phiên bản mới để kiểm tra phần nâng cấp; hướng dẫn ở tools/sheet-sync/README.md.

Tham khảo thiết kế bảng: https://support.google.com/docs/answer/14239833?hl=en . Bản này là vùng dữ liệu được định dạng bằng Apps Script, không phải native Table.
