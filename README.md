# Sunflower Land UI Automation · v2.14.0

Tiện ích mở rộng Chrome (Manifest V3) hỗ trợ tự động hóa các thao tác click chuột thật trên giao diện (DOM) cho game Sunflower Land. Tích hợp tùy chọn Page Bridge để đồng bộ và đọc nhanh trạng thái kho đồ của tài khoản.

## Tính năng nổi bật

- **Tự động ủ phân Composter (v2.14.0)** — Hỗ trợ tự động thu hoạch và ủ phân mới cho cả 3 loại thùng (Basic, Turbo, Premium), tích hợp nhận diện trạng thái ủ dở trực tiếp trên DOM đảo để tránh click nhấp nháy.
- **Tự động nấu ăn 5 nhà bếp (v2.14.0)** — Mở rộng hỗ trợ tất cả 5 loại nhà bếp (Fire Pit, Kitchen, Bakery, Deli, Smoothie Shack), tự động lọc món đủ nguyên liệu và luôn ưu tiên nấu món có XP/năng lượng cao nhất.
- **Luồng khôi phục lỗi & Refresh độc lập (v2.14.0)** — Tự động phát hiện popup lỗi (*Try again*, *Refresh*, *Reload*, *Update*) và click giải kẹt ngầm độc lập mỗi 1.5s giống như captcha.
- **Khắc phục triệt để lỗi chọn hạt gieo (v2.14.0)** — Loại bỏ hoàn toàn lỗi double-click gây deselect ô hạt, giúp gieo ruộng và trồng cây ăn quả mượt mà.
- **Giao diện Obsidian SFL (v2.7 - v2.11)** — Thiết kế lại giao diện popup theo phong cách Obsidian warm-dark (`#14110c`) kết hợp tông màu vàng gold (`#f2b705`) mang đậm chất game SFL, loại bỏ hoàn toàn viền (border) thô cứng.
- **Phông chữ Be Vietnam Pro (v2.4)** — Tích hợp bộ font chữ Be Vietnam Pro từ Google Fonts giúp hiển thị tiếng Việt sắc nét và hiện đại.
- **Hộp kiểm Custom & Nhãn Không viền (v2.10 - v2.11)** — Thay thế toàn bộ công tắc slide tròn thô thành các ô checkbox custom vuông vắn 16x16px thanh lịch. Các nhãn quặng (Stone, Iron, Vàng...) được thiết kế không viền, tự động đổi màu khi chọn thông qua CSS `:has()`, ẩn hoàn toàn hộp kiểm mặc định.
- **Hợp nhất "Sunflower cơ bản" (v2.2 - v2.5)** — Gom các tính năng chặt cây (`autoChop`), đào đá (`autoMine`), ruộng DOM (`autoFarmCropsDom`) và thu nấm (`autoHarvestMushrooms`) thành một công tắc duy nhất: **Sunflower cơ bản** để tối giản giao diện.
- **Tự động mua khi khởi động (v2.0)** — Tự động mua hàng loạt rìu, cuốc và hạt giống theo mùa ngay khi game tải xong và bridge sẵn sàng.
- **Cơ chế thử lại độc lập (v2.0)** — Quá trình mua công cụ và mua hạt giống được theo dõi riêng biệt. Nếu một trong hai luồng thất bại, bot sẽ tự động đợi 25 giây rồi thử lại thay vì bỏ qua hoàn toàn.
- **Bỏ các ô nhập text (v2.9)** — Xóa bỏ hoàn toàn các ô nhập liệu thủ công cho tên món ăn ưu tiên và tên hạt giống, hệ thống tự động nhận diện hạt theo mùa và nấu món tối ưu XP.
- **Chặt bụi cây (`bush_shrub`) (v2.12)** — Hỗ trợ nhận diện và chặt tự động gốc cây loại 2 (`bush_shrub.png`).
- **Sửa lỗi thu hoạch quả (v2.13)** — Nhận diện quả chín chính xác thông qua việc kiểm tra sự biến mất của thanh tiến trình (`empty_bar.png`), khắc phục lỗi bỏ sót quả chín của các phiên bản cũ.
- **Tự động học số nhịp đập (v2.0)** — Ẩn hoàn toàn bảng cấu hình số lần đập chặt cây / đào đá khỏi giao diện vì bot tự học và lưu trữ tự động ở chế độ nền.
- **Tự động chặt gỗ** — Tự trang bị rìu, thực hiện đập liên tục và giữ sticky cây cho đến khi hoàn thành.
- **Tự động đào đá / quặng** — Nhận diện loại quặng ưu tiên (Đá, Sắt, Vàng, Crimstone, Sunstone) và tự động trang bị cúp tương ứng để đào.

## Hướng dẫn cài đặt & sử dụng

1. Truy cập vào địa chỉ `chrome://extensions` trong trình duyệt Chrome.
2. Bật chế độ nhà phát triển (**Developer mode**).
3. Chọn **Tải tiện ích đã giải nén** (**Load unpacked**) và tìm đến thư mục chứa mã nguồn này.
4. Mở game Sunflower Land (`https://sunflower-land.com/#/play`).
5. Click vào icon tiện ích mở rộng trên thanh công cụ của Chrome để mở popup và cấu hình các tính năng mong muốn.

---

## Nhật ký thay đổi (Changelog)

| Phiên bản | Mô tả chi tiết các thay đổi |
|---|---|
| **v2.14.0** | Tích hợp tự ủ phân (Composter 3 loại), tự nấu ăn 5 nhà bếp ưu tiên XP cao nhất, luồng tự động click Refresh/Try again/Update độc lập ngầm 1.5s, và khắc phục triệt để lỗi chọn hạt ruộng. |
| **v2.13.0** | Sửa lỗi thu hoạch cây ăn quả: tự động quét quả chín dựa trên sự biến mất của thanh tiến trình. |
| **v2.12.0** | Hỗ trợ chặt tự động gốc cây loại 2 (`bush_shrub.png`). |
| **v2.11.0** | Thiết kế lại nhãn quặng không viền dạng pill thông qua CSS `:has()`, ẩn checkbox native. |
| **v2.10.0** | Thu nhỏ và tinh chỉnh checkbox custom thành dạng 16x16px thanh mảnh với checkmark 1.5px. |
| **v2.9.0** | Gỡ bỏ 2 ô nhập liệu tên món ăn và hạt giống khỏi giao diện, tự động tối ưu hóa trong logic nền. |
| **v2.7.0** | Thay đổi thiết kế giao diện sang tông màu tối Obsidian và vàng gold của SFL. |
| **v2.6.0** | Gỡ bỏ nút bật/tắt toàn cục (Master); bot mặc định chạy liên tục. |
| **v2.5.0** | Gộp tính năng tự động thu hoạch nấm vào nhóm Sunflower cơ bản. |
| **v2.4.0** | Tích hợp phông chữ Be Vietnam Pro sắc nét. |
| **v2.2.0** | Hợp nhất tự chặt, tự đào, tự làm ruộng thành một nút duy nhất. |
| **v2.0.0** | Thêm tự động mua khi start, tự học nhịp chặt/đào, lọc button lò rèn nghiêm ngặt. |
