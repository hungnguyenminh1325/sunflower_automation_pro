(function (S) {
  "use strict";
  /**
   * Luồng Cây ăn quả: Thu hoạch -> Chặt cây già -> Trồng mới.
   * Sử dụng dữ liệu từ Bridge để tính toán thời gian nghỉ thông minh.
   */
  const runtime = S.runtime;
  const d = S.dom;
  const logFlow = S.time.logFlow;
  const nowMs = S.time.now;
  const sleep = S.time.sleep;
  const rand = S.time.rand;
  const uiJitter = S.time.uiJitter;

  const FRUIT_FLOW_PROBE_MS = 60 * 1000; // 1 phút
  const FRUIT_FLOW_READY_GAP_MS = 1500;

  const SAPLING_NAMES = [
    "Apple Sapling",
    "Orange Sapling",
    "Blueberry Seeds",
    "Lemon Sapling",
    "Pear Sapling",
    "Plum Sapling",
    "Grape Sapling",
    "Banana Sapling",
  ];

  /** Lấy root của fruit patch từ một phần tử bên trong. */
  function getFruitPatchRoot(el) {
    let n = el;
    for (let i = 0; i < 28 && n; i += 1) {
      if (n.classList?.contains("cursor-pointer") && (n.classList?.contains("hover:img-highlight") || n.classList?.contains("group-hover:img-highlight"))) {
        return n;
      }
      n = n.parentElement;
    }
    return null;
  }

  /** Tìm tọa độ DOM gần đúng cho một patch ID từ Bridge. */
  function findDomByPatchId(patchId) {
    const docs = d.collectDocumentsForGameDom();
    // Đây là một kỹ thuật tìm kiếm mờ dựa trên vị trí tương đối hoặc class
    // Thực tế trong SFL, ID thường không có trong DOM trực tiếp.
    // Chúng ta sẽ fallback sang tìm theo hình ảnh "fruit_patch" hoặc ảnh quả.
    return null; 
  }

  function getBestSaplingFromInventory(inventory) {
    if (!inventory) return null;
    // Thứ tự ưu tiên có thể theo XP (giống nấu ăn) hoặc đơn giản là theo danh sách
    for (const name of SAPLING_NAMES) {
      if ((inventory[name] || 0) >= 1) return name;
    }
    return null;
  }

  function computeFruitRestSchedule(state, t) {
    const patches = state?.fruitPatches;
    if (!Array.isArray(patches) || patches.length === 0) {
      return { nextAt: t + 5 * 60 * 1000, reason: "Không thấy ô quả" };
    }

    let minReadyAt = Infinity;
    let hasReady = false;
    let hasStump = false;
    let hasEmpty = false;

    for (const p of patches) {
      if (!p.fruit) {
        hasEmpty = true;
        continue;
      }
      
      const harvestsLeft = Number(p.fruit.harvestsLeft || 0);
      if (harvestsLeft <= 0) {
        hasStump = true;
        continue;
      }

      // SFL Fruit readyAt không có trực tiếp trong bridge state này (chỉ có harvestedAt)
      // Tạm thời nếu harvestedAt > 0, chúng ta coi là đang chờ. 
      // Thực tế ta sẽ phụ thuộc vào việc quét DOM để thấy thanh tiến trình đầy.
      hasReady = true; // Fallback cho phép quét DOM
    }

    if (hasReady || hasStump || (hasEmpty && getBestSaplingFromInventory(state.inventory))) {
      return { nextAt: t, reason: "Có việc cần làm", ready: true };
    }

    return { nextAt: t + FRUIT_FLOW_PROBE_MS, reason: "Chờ quả chín" };
  }

  async function tryHarvestFruit() {
    // Tìm bằng DOM: thanh tiến trình đầy
    const hits = S.dom.collectDocumentsForGameDom().flatMap(doc => {
       const progressBars = doc.querySelectorAll('div.relative.w-full.bg-blue-600, div.relative.w-full.bg-orange-500');
       return Array.from(progressBars).filter(el => {
          const w = el.style.width;
          return w === "100%" || w === "100.00%";
       }).map(el => getFruitPatchRoot(el)).filter(Boolean);
    });

    if (hits.length > 0) {
      const target = hits[0];
      logFlow("Cây ăn quả: thu hoạch quả chín", {});
      d.click(target);
      await uiJitter();
      return true;
    }
    return false;
  }

  async function tryClearStump() {
    // Tìm bằng DOM: ảnh stump/dead
    const docs = d.collectDocumentsForGameDom();
    for (const doc of docs) {
      const imgs = doc.querySelectorAll('img[src*="dead"], img[src*="stump"]');
      for (const img of imgs) {
        const root = getFruitPatchRoot(img);
        if (root && d.isVisible(root)) {
          logFlow("Cây ăn quả: chặt gốc cây già", {});
          // Đảm bảo chọn rìu
          if (typeof S.workbench?.ensureToolSelectedDom === "function") {
            await S.workbench.ensureToolSelectedDom("Axe");
          }
          d.click(root);
          await uiJitter();
          return true;
        }
      }
    }
    return false;
  }

  async function tryPlantSapling(inventory) {
    const sapling = getBestSaplingFromInventory(inventory);
    if (!sapling) return false;

    const docs = d.collectDocumentsForGameDom();
    for (const doc of docs) {
      const imgs = doc.querySelectorAll('img[src*="fruit_patch"]');
      for (const img of imgs) {
        const root = getFruitPatchRoot(img);
        // Kiểm tra xem có cây nào đang mọc không (tránh trồng đè)
        if (root && d.isVisible(root) && root.querySelectorAll('img').length === 1) {
          logFlow(`Cây ăn quả: trồng ${sapling}`, {});
          if (typeof S.cropDom?.ensureSeedSelectedDom === "function") {
            const selected = await S.cropDom.ensureSeedSelectedDom(sapling);
            if (!selected) continue;
          }
          d.click(root);
          await uiJitter();
          return true;
        }
      }
    }
    return false;
  }

  async function runFruitTreeCycle() {
    if (!runtime.settings.autoFruitTree) return false;

    const bridge = S.gameBridge;
    if (!bridge?.isReady) return false;

    const state = bridge.getLatestState();
    if (!state) return false;

    const t = nowMs();
    let acted = false;

    // 1. Thu hoạch
    if (await tryHarvestFruit()) acted = true;
    // 2. Chặt gốc
    else if (await tryClearStump()) acted = true;
    // 3. Trồng mới
    else if (await tryPlantSapling(state.inventory)) acted = true;

    // Cập nhật lịch trình
    const schedule = computeFruitRestSchedule(state, nowMs());
    runtime.nextFruitTreeFlowAt = schedule.nextAt;
    runtime.fruitTreeFlowState = schedule.reason;
    runtime.fruitTreeFlowStartedAt = acted ? t : runtime.fruitTreeFlowStartedAt;

    return acted;
  }

  S.fruitTree = {
    runFruitTreeCycle,
  };
})(window.SFL);
