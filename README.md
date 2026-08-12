# Sunflower Land UI Automation · v2.13.0

UI-first automation for Sunflower Land — chop, mine, farm, workbench, mushrooms, fruit trees; optional page bridge. Unofficial companion.

## English

Chrome extension (Manifest V3) for **Sunflower Land**: automates **tools, seeds, and crops** via **real UI clicks** (DOM), with optional **page bridge** for inventory/state hints—not as the primary action path.

### Features (High Level)

- **Obsidian SFL Theme (v2.7 - v2.11)** — Redesigned popup UI using a gorgeous, borderless Obsidian warm-dark style (`#14110c` background) with gold accents (`#f2b705`) matching SFL game aesthetics.
- **Be Vietnam Pro Font (v2.4)** — Loaded premium Be Vietnam Pro typeface for clean, modern readability.
- **Sleek Custom Checkboxes & Pill Chips (v2.10 - v2.11)** — Replaced raw HTML/Chrome inputs with clean 16x16px custom square checkboxes. All resource target chips (e.g. Stone, Iron, Gold) are borderless pill chips styled dynamically via CSS `:has()`, hiding native checkbox boxes completely.
- **Aggregated "Sunflower Basic" Toggle (v2.2 - v2.5)** — Grouped separate switches for auto-chopping (`autoChop`), auto-mining (`autoMine`), crop farming (`autoFarmCropsDom`), and mushroom gathering (`autoHarvestMushrooms`) into a single master switch: **Sunflower cơ bản**.
- **Startup Auto-Buy (v2.0)** — Automatically batch-buys axes, pickaxes, and seasonal seeds immediately upon game load.
- **Independent Flow Retries (v2.0)** — Auto-buy for tools and seeds are tracked separately. If one fails (e.g., due to loading lag), it retries after a 25-second cooldown rather than skipping the flow entirely.
- **Strict Confirmations (v2.0)** — Includes secondary confirmation clicks inside Blacksmith transaction overlays to prevent closing panels before the blockchain transaction initiates.
- **No Text Inputs (v2.9)** — Removed text fields for recipes and seed names, defaulting automatically in the background to optimal seasonal seeds and SFL XP-optimized food items.
- **Stump Chopping (`bush_shrub`) (v2.12)** — Supports wood chopping for the second type of stump/shrub (`bush_shrub.png`).
- **Corrected Fruit Harvesting (v2.13)** — Scans for ripe fruit trees by verifying the absence of progress bar indicators (`empty_bar.png`), resolving fruit tree click issues.
- **Self-learning Strike Logic (v2.0)** — Striking values for trees and rocks are now strictly managed automatically in the background, removing the redundant manual configuration inputs from the UI.
- **Chop trees** — strikes, Chop button, sticky tile until the tree is done.
- **Mine rocks / ore** — hybrid bridge + DOM; pickaxe tiers; per-ore toggles (Stone, Iron, Gold, Crimstone, Sunstone).

### Run

1. Open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select this folder.
2. Open `https://sunflower-land.com/#/play`.
3. Open the extension popup.

---

## Tiếng Việt

Tiện ích Chrome (MV3) cho **Sunflower Land**: tự động **công cụ và hạt giống** bằng **click UI thật** (DOM), có thể dùng **page bridge** để đọc trạng thái.

---

## Changelog | Nhật ký thay đổi

| Phiên bản | Thay đổi chính (EN) | Thay đổi chính (VI) |
|---|---|---|
| **v2.13.0** | Fixed fruit tree harvest logic to query for absence of progress bars on ripe trees. | Sửa lỗi thu hoạch cây ăn quả: quét dựa trên sự biến mất của thanh tiến trình. |
| **v2.12.0** | Added support for chopping the second type of tree stump (`bush_shrub.png`). | Hỗ trợ chặt tự động gốc cây loại 2 (`bush_shrub.png`). |
| **v2.11.0** | Replaced target selection chips with borderless pills using CSS `:has()`. | Thiết kế lại nhãn quặng không viền dạng pill thông qua CSS `:has()`. |
| **v2.10.0** | Redesigned checkboxes to be sleek, sharp, and compact (16x16px). | Thu nhỏ và tinh chỉnh checkbox custom thành dạng 16x16px thanh mảnh. |
| **v2.9.0** | Removed text inputs for recipe priority and seed name from UI. | Gỡ bỏ 2 ô nhập liệu tên món ăn và hạt giống khỏi giao diện, chạy auto ngầm. |
| **v2.7.0** | Redesigned popup UI to apply Obsidian warm-dark theme and SFL gold accents. | Thay đổi thiết kế giao diện sang tông màu tối Obsidian và vàng gold của SFL. |
| **v2.6.0** | Removed master enabled power switch; bot now runs always active in background. | Gỡ bỏ nút bật/tắt toàn cục (Master); bot mặc định chạy liên tục. |
| **v2.5.0** | Merged mushroom harvesting toggle into Sunflower Basic setting. | Gộp tính năng tự động thu hoạch nấm vào nhóm Sunflower cơ bản. |
| **v2.4.0** | Integrated Be Vietnam Pro Google Font. | Tích hợp phông chữ Be Vietnam Pro sắc nét. |
| **v2.2.0** | Aggregated autoChop, autoMine, and autoFarmCropsDom into a single toggle. | Hợp nhất tự chặt, tự đào, tự làm ruộng thành nút Sunflower cơ bản. |
| **v2.0.0** | Implemented startup auto-buy retry, strike self-learning, and strict button queries. | Cài đặt tự động mua khi start, tự học nhịp chặt/đào, lọc button lò rèn nghiêm ngặt. |
