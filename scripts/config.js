(function (S) {
  "use strict";
  S.SETTINGS_KEY = "sfl_ui_only_settings";
  S.SETTINGS_SCHEMA_STORAGE_KEY = "sfl_ui_only_settings_schema";
  /** Số lần đã tải lại trang để thoát captcha Goblin/Moon (chrome.storage.local, không nằm trong settings JSON). */
  S.CAPTCHA_GOBLIN_MOON_RELOAD_SKIP_COUNT_KEY = "sfl_ui_captcha_goblin_moon_reload_skip_count";
  S.SETTINGS_SCHEMA_VERSION = 15;
  S.DEFAULT_SETTINGS = {
    masterEnabled: false,
    autoBuyTools: false,
    autoRestockBlacksmith: false,
    autoChop: true,
    autoMine: false,
    autoCookFirePit: false,
    autoCookKitchen: false,
    autoHarvestMushrooms: true,
    mushroomTargetWild: true,
    mushroomTargetMagic: true,
    clearConsole: false,
    actionGapMs: 3200,
    tickMs: 1100,
    uiDelayMinMs: 280,
    uiDelayMaxMs: 600,
    strikeLearnAutoChop: true,
    chopStrikes: 3,
    chopStrikesLearned: false,
    strikeLearnAutoMine: true,
    mineStrikes: 3,
    mineStrikesLearned: false,
    mineTargetStone: true,
    mineTargetIron: true,
    mineTargetGold: true,
    mineTargetCrimstone: true,
    mineTargetSunstone: true,
    autoFarmCropsDom: false,
    cropDomSeedName: "Sunflower Seed",
    cropDomMinSeedCount: 5,
    /** Sắp thứ tự mua/gieo: hạt catalogue thời gian lớn ngắn trước (không loại hạt lâu). */
    cropDomSkipLongGrow: false,
    /** Mua hạt tại Betty (Market) khi hết trong túi. Tắt = chỉ gieo hạt có sẵn trong kho. */
    cropDomBuySeedsAtBetty: false,
    /** Hoa / quả (thanh tiến độ) + tổ ong mật — DOM. */
    autoPetalHarvestDom: false,
    /** Ưu tiên món này khi đủ nguyên liệu (đúng tên game, vd Pancakes); rỗng = chọn theo XP như cũ. */
    cookPreferredRecipe: "",
    /** Thấy modal Goblin / Moon Seekers → tải lại tab (thoát kẹt; cooldown ~35s). */
    reloadPageOnGoblinMoonCaptcha: false,
    /** Tự động nâng đảo nếu đủ tài nguyên (gọi qua event island.expanded) */
    autoExpandIsland: false,
  };
  S.FLOW_INTERVAL_MS = 8 * 60 * 1000;
  /** Chu kỳ nghỉ giữa các lần chạy luồng đào đá (sau khi xong một vòng quét). */
  S.ROCK_FLOW_INTERVAL_MS = 30 * 60 * 1000;
  /** Chu kỳ giữa các lần quét thu nấm (wild + magic). */
  S.MUSHROOM_FLOW_INTERVAL_MS = 2 * 60 * 60 * 1000;
  S.STRIKE_COUNT_MIN = 1;
  S.STRIKE_COUNT_MAX = 8;
  S.WOOD_CHOP_LOG = {
    loaiTaiNguyen: "gỗ",
    taiNguyen: "cây (Wood / tree)",
    dungCu: "rìu (Axe)",
    iconWorkbenchTim: ["tools/axe"],
  };
  S.ROCK_ORE_LOG = {
    loaiTaiNguyen: "đá / quặng",
    taiNguyen: "ảnh đá (stone_small, iron_small, gold_small, …)",
    dungCu: "cuốc gỗ / đá / sắt (đúng tier)",
    iconWorkbenchTim: ["tools/wood_pickaxe", "tools/stone_pickaxe", "tools/iron_pickaxe"],
  };
  S.clampStrikeCount = function clampStrikeCount(n) {
    const v = Math.floor(Number(n));
    if (!Number.isFinite(v)) return 3;
    return Math.max(S.STRIKE_COUNT_MIN, Math.min(S.STRIKE_COUNT_MAX, v));
  };
})(window.SFL);
