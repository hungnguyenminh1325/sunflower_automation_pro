# Sunflower Land UI Automation · v1.0.0

UI-first automation for Sunflower Land — chop, mine, farm, workbench, mushrooms; optional page bridge. Unofficial companion.

## English

Chrome extension (Manifest V3) for **Sunflower Land**: automates **tools** via **real UI clicks** (DOM), with optional **page bridge** for inventory/state hints—not as the primary action path.

### Features (high level)

- **Chop trees** — strikes, Chop button, sticky tile until the tree is done; retries when the bridge still reports axes but the UI lags.
- **Mine rocks / ore** — hybrid bridge + DOM; pickaxe tiers; per-ore toggles (Stone, Iron, Gold, Crimstone, Sunstone).
- **Buy tools (axe + pickaxes)** — Blacksmith / Workbench queue, craft, Restock handling, cooldowns, “insufficient resources” per-tool blocking so mining can try another tier.
- **Automation scheduling** — chop before mine: defer mining when a chop session is pending; short `nextTreeFlowAt` when trees remain; buy-tool queue drained with priority rules.
- **Farm (crops, DOM)** — optional bridge-assisted plant/harvest; **“Mua hạt tại Betty”** defaults **off** (`cropDomBuySeedsAtBetty`): only sow seeds already in inventory; when off, no Market/Buy-1 seed purchases. If buy is off, there are empty plots, no seeds in stock, and nothing ready to harvest, the farm step skips that tick (avoids useless UI work).

### Project layout

| Path | Role |
|------|------|
| `manifest.json` | MV3 manifest |
| `content.js` | Loads bundled scripts |
| `popup.html`, `popup.js`, `styles.css` | Popup UI |
| `scripts/main.js` | Entry / wiring |
| `scripts/automation.js` | Tick: tree loop, rock loop, buy queue |
| `scripts/flows/wood-chop.js` | Chop logic |
| `scripts/flows/rock-mine.js` | Mine logic |
| `scripts/flows/workbench.js` | Buy / craft queue |
| `scripts/flows/crop-dom.js` | Farm: plant / harvest / optional Betty seed buy (DOM) |
| `scripts/bridge/` | Page bridge helpers |
| `agents/` | Agent skill + **bilingual** project requirements |

### Run

1. Open `chrome://extensions` → enable **Developer mode** → **Load unpacked** → select this folder.
2. Open `https://sunflower-land.com/#/play`.
3. Open the extension popup and enable **Master** (and desired toggles).

### Notes

- Sunflower Land DOM changes often; selectors may need updates.
- UI-only automation is slower than direct game APIs but closer to normal play.

---

## Tiếng Việt

Tiện ích Chrome (MV3) cho **Sunflower Land**: tự động **công cụ** bằng **click UI thật** (DOM), có thể dùng **page bridge** để đọc inventory/state—không thay thế hoàn toàn đường click.

### Tính năng (tóm tắt)

- **Chặt cây** — strike, nút Chop, giữ tile cho đến khi xong; khi bridge vẫn báo còn rìu mà UI chậm thì **tiếp tục luồng** (thêm strike / chờ), không `return false` làm dừng sớm.
- **Đào đá / quặng** — kết hợp bridge + DOM; cuốc theo tier; bật/tắt từng loại quặng.
- **Mua công cụ** — hàng chờ Blacksmith, craft, Restock (tùy cài đặt), cooldown; thiếu nguyên liệu craft **chặn theo từng tool** để thử tier/quặng khác.
- **Lịch automation** — **ưu tiên cây trước đá**: hoãn đào khi còn phiên chặt dở (`chopStickyTile`); lên lịch cây sớm khi vẫn còn cây trên map.
- **Ruộng (DOM)** — tùy chọn thu + gieo + (nếu bật) mua hạt Betty. **Mặc định tắt mua hạt**: chỉ gieo hạt có trong kho; hết hạt thì chỉ thu; còn ô trống mà không hạt, không cây thu → bỏ qua tick ruộng (giảm quét vô ích).

### Cấu trúc thư mục

Bảng `Project layout` phía trên cũng áp dụng cho repo này.

### Chạy thử

Giống mục **Run** (tiếng Anh): load unpacked, vào game, bật **Master** trong popup.

### Lưu ý

- DOM game hay đổi; có thể phải chỉnh selector.
- UI-only chậm hơn gọi API trực tiếp nhưng gần hành vi người chơi.

---

## Changelog (recent) | Nhật ký thay đổi gần đây

| EN | VI |
|----|-----|
| Chop session blocks mining until the sticky tree is finished (or no longer pending). | Phiên chặt cây chặn đào cho tới khi xong cây “dính” hoặc hết pending. |
| Restock visible + “Restock Blacksmith” off → close shop, drop job, per-key block to avoid buy spam. | Có Restock mà tắt auto-restock → đóng shop, bỏ job, chặn theo key. |
| Craft disabled / insufficient resources → per-tool cooldown; mine can pivot to another pickaxe/ore. | Thiếu nguyên liệu craft → chặn theo tool; đào có thể chuyển tier/quặng. |
| After chop progress, tree flow reschedules soon if trees remain; idle retries inside the tree step loop. | Sau khi chặt có tiến độ, lên lịch cây sớm nếu còn cây; retry trong vòng bước. |
| Bridge still shows axe but tree not down → extra strikes + `return true` to keep the tree flow alive. | Bridge còn rìu mà cây chưa đổ → strike thêm và `return true` để không tắt luồng cây. |
| Crop DOM: `cropDomBuySeedsAtBetty` defaults **false** — inventory-only sowing; no Betty seed shop when off; idle skip when empty plots + no seeds + no harvest targets. | Ruộng DOM: `cropDomBuySeedsAtBetty` mặc định **tắt** — chỉ gieo từ kho; không mở Betty khi tắt; bỏ qua tick khi còn ô trống, hết hạt, không có cây thu. |
