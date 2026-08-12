# Sunflower Land UI Automation · v2.0.0

UI-first automation for Sunflower Land — chop, mine, farm, workbench, mushrooms; optional page bridge. Unofficial companion.

## English

Chrome extension (Manifest V3) for **Sunflower Land**: automates **tools and seeds** via **real UI clicks** (DOM), with optional **page bridge** for inventory/state hints—not as the primary action path.

### Features (high level)

- **Startup Auto-Buy (v2.0)** — Automatically batch-buys axes, pickaxes, and seasonal seeds immediately upon game load.
- **Independent Flow Retries (v2.0)** — Auto-buy for tools and seeds are tracked separately. If one fails (e.g., due to loading lag), it retries after a 25-second cooldown rather than skipping the flow entirely.
- **Human-like Delays (v2.0)** — Simulates natural human pauses during the batch buy panel interactions and confirmations.
- **Strict Button Selectors (v2.0)** — Strictly targets HTML `<button>` elements to avoid misclicks on headers or static text containing button names.
- **Modern UI Design (v2.0)** — Redesigned popup UI with a clean, borderless dark-theme aesthetic using cyan and emerald accents.
- **Self-learning Strike Logic (v2.0)** — Striking values for trees and rocks are now strictly managed automatically in the background, removing the redundant manual configuration inputs from the UI.
- **Chop trees** — strikes, Chop button, sticky tile until the tree is done.
- **Mine rocks / ore** — hybrid bridge + DOM; pickaxe tiers; per-ore toggles (Stone, Iron, Gold, Crimstone, Sunstone).
- **Farm (crops, DOM)** — bridge-assisted plant/harvest; Betty seed shopping when inventory runs dry.

### Run

1. Open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select this folder.
2. Open `https://sunflower-land.com/#/play`.
3. Open the extension popup and enable **Master** (and desired toggles).

---

## Tiếng Việt

Tiện ích Chrome (MV3) cho **Sunflower Land**: tự động **công cụ và hạt giống** bằng **click UI thật** (DOM), có thể dùng **page bridge** để đọc trạng thái.

### Tính năng (v2.0.0 nổi bật)

- **Tự động mua khi khởi động (v2.0)** — Tự động mua hàng loạt rìu, cuốc và hạt giống theo mùa ngay khi game tải xong và bridge sẵn sàng.
- **Cơ chế thử lại độc lập (v2.0)** — Quá trình mua công cụ và mua hạt giống được theo dõi riêng. Nếu một trong hai luồng thất bại, bot sẽ đợi 25 giây rồi thử lại thay vì bỏ qua hoàn toàn.
- **Độ trễ giống người chơi (v2.0)** — Thêm các khoảng nghỉ ngẫu nhiên tự nhiên khi tương tác với bảng Batch Buy và xác nhận.
- **Bộ lọc thẻ Button nghiêm ngặt (v2.0)** — Chỉ tìm và click vào thẻ `<button>` thực sự, loại bỏ hoàn toàn các lỗi click nhầm vào text hoặc tiêu đề chứa cụm từ liên quan.
- **Giao diện hiện đại, không viền (v2.0)** — Thiết kế lại giao diện popup theo phong cách tối giản hiện đại (dark theme) với tông màu xanh ngọc (cyan) và xanh lá cây (emerald), không dùng màu tím và loại bỏ toàn bộ đường viền (border) cổ điển.
- **Tự động học số nhịp đập (v2.0)** — Ẩn hoàn toàn bảng nhập nhịp đập chặt cây / đào đá khỏi giao diện vì bot tự học và lưu trữ tự động ở chế độ nền.

### Chạy thử

Giống mục **Run** (tiếng Anh): load unpacked, vào game, bật **Master** trong popup.

---

## Changelog v2.0.0 | Nhật ký thay đổi v2.0.0

| EN | VI |
|----|-----|
| Removed manual Strike configuration panel; bot now self-learns in background. | Gỡ bỏ bảng chỉnh số nhịp đập chặt/đào thủ công; bot tự học ngầm. |
| Redesigned popup UI to be borderless with modern cyan & green colors (no purple). | Thiết kế lại giao diện popup không viền, sử dụng tông màu cyan và xanh lá (không dùng tím). |
| Implemented startup auto-buy for tools and seeds with independent tracking and 25s cooldown retry. | Tự động mua công cụ và hạt giống khi bắt đầu với cờ lưu trạng thái độc lập và 25s cooldown thử lại. |
| Simplified batch-buying to click confirm button directly since SFL defaults row counts to Max. | Rút gọn luồng Batch Buy: bấm trực tiếp vào Xác nhận do game đã mặc định chọn Max. |
| Added strict HTML `<button>` queries and natural human-like click delays inside Blacksmith dialogs. | Lọc nghiêm ngặt thẻ `<button>` và thêm khoảng nghỉ tự nhiên khi tương tác trong lò rèn. |
