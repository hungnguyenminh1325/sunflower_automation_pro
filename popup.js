const ids = {
  masterEnabled: document.getElementById("masterEnabled"),
  autoBuyTools: document.getElementById("autoBuyTools"),
  autoRestockBlacksmith: document.getElementById("autoRestockBlacksmith"),
  autoChop: document.getElementById("autoChop"),
  autoMine: document.getElementById("autoMine"),
  autoCookFirePit: document.getElementById("autoCookFirePit"),
  autoCookKitchen: document.getElementById("autoCookKitchen"),
  cookPreferredRecipe: document.getElementById("cookPreferredRecipe"),
  autoPetalHarvestDom: document.getElementById("autoPetalHarvestDom"),
  reloadPageOnGoblinMoonCaptcha: document.getElementById("reloadPageOnGoblinMoonCaptcha"),
  captchaReloadSkipCount: document.getElementById("captchaReloadSkipCount"),
  resetCaptchaReloadSkipCount: document.getElementById("resetCaptchaReloadSkipCount"),
  captchaSolvedCount: document.getElementById("captchaSolvedCount"),
  captchaFailedCount: document.getElementById("captchaFailedCount"),
  autoFarmCropsDom: document.getElementById("autoFarmCropsDom"),
  cropDomSeedName: document.getElementById("cropDomSeedName"),
  cropDomSkipLongGrow: document.getElementById("cropDomSkipLongGrow"),
  cropDomBuySeedsAtBetty: document.getElementById("cropDomBuySeedsAtBetty"),
  autoHarvestMushrooms: document.getElementById("autoHarvestMushrooms"),
  mushroomTargetWild: document.getElementById("mushroomTargetWild"),
  mushroomTargetMagic: document.getElementById("mushroomTargetMagic"),
  mineTargetStone: document.getElementById("mineTargetStone"),
  mineTargetIron: document.getElementById("mineTargetIron"),
  mineTargetGold: document.getElementById("mineTargetGold"),
  mineTargetCrimstone: document.getElementById("mineTargetCrimstone"),
  mineTargetSunstone: document.getElementById("mineTargetSunstone"),
  statusText: document.getElementById("statusText"),
  statusBadge: document.getElementById("statusBadge"),
  strikeLearnAutoChop: document.getElementById("strikeLearnAutoChop"),
  strikeLearnAutoMine: document.getElementById("strikeLearnAutoMine"),
  chopStrikes: document.getElementById("chopStrikes"),
  mineStrikes: document.getElementById("mineStrikes"),
  resetStrikeLearn: document.getElementById("resetStrikeLearn"),
  resetMineStrikeLearn: document.getElementById("resetMineStrikeLearn"),
};

const treeFlowEls = {
  name: document.getElementById("resourceFlowName"),
  state: document.getElementById("resourceFlowState"),
  start: document.getElementById("resourceFlowStart"),
  next: document.getElementById("resourceFlowNext"),
  progress: document.getElementById("resourceFlowProgress"),
  percent: document.getElementById("resourceFlowPercent"),
  queue: document.getElementById("resourceFlowQueue"),
};

const oreFlowEls = {
  name: document.getElementById("oreFlowName"),
  state: document.getElementById("oreFlowState"),
  start: document.getElementById("oreFlowStart"),
  next: document.getElementById("oreFlowNext"),
  progress: document.getElementById("oreFlowProgress"),
  percent: document.getElementById("oreFlowPercent"),
  queue: document.getElementById("oreFlowQueue"),
};

const mushroomFlowEls = {
  name: document.getElementById("mushroomFlowName"),
  state: document.getElementById("mushroomFlowState"),
  start: document.getElementById("mushroomFlowStart"),
  next: document.getElementById("mushroomFlowNext"),
  progress: document.getElementById("mushroomFlowProgress"),
  percent: document.getElementById("mushroomFlowPercent"),
  queue: document.getElementById("mushroomFlowQueue"),
};

const cookFlowEls = {
  name: document.getElementById("cookFlowName"),
  state: document.getElementById("cookFlowState"),
  start: document.getElementById("cookFlowStart"),
  next: document.getElementById("cookFlowNext"),
  progress: document.getElementById("cookFlowProgress"),
  percent: document.getElementById("cookFlowPercent"),
  queue: document.getElementById("cookFlowQueue"),
};

const petalFlowEls = {
  name: document.getElementById("petalFlowName"),
  state: document.getElementById("petalFlowState"),
  start: document.getElementById("petalFlowStart"),
  next: document.getElementById("petalFlowNext"),
  progress: document.getElementById("petalFlowProgress"),
  percent: document.getElementById("petalFlowPercent"),
  queue: document.getElementById("petalFlowQueue"),
};

function setStatus(text, tone = "neutral") {
  ids.statusText.textContent = text;
  ids.statusBadge.className = "status-badge";

  if (tone === "live") {
    ids.statusBadge.textContent = "Đang chạy";
    ids.statusBadge.classList.add("live");
    return;
  }

  if (tone === "warn") {
    ids.statusBadge.textContent = "Cần kiểm tra";
    ids.statusBadge.classList.add("warn");
    return;
  }

  ids.statusBadge.textContent = "Đang tải";
}

function setStatusDetails({
  flows = null,
} = {}) {
  renderFlowCard(flows?.resource, treeFlowEls);
  renderFlowCard(flows?.ore, oreFlowEls);
  renderFlowCard(flows?.mushroom, mushroomFlowEls);
  renderFlowCard(flows?.cook, cookFlowEls);
  renderFlowCard(flows?.petal, petalFlowEls);
}

function formatTime(value) {
  if (!Number.isFinite(value) || value <= 0) return "--";
  return new Date(value).toLocaleTimeString("vi-VN", { hour12: false });
}

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function readStrikeInput(el, fallback = 3) {
  const n = parseInt(String(el?.value ?? ""), 10);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(8, n));
}

function renderFlowCard(flow, els) {
  if (!els?.name) return;
  els.name.textContent = flow?.name || "--";
  els.state.textContent = flow?.state || "--";
  els.start.textContent = formatTime(Number(flow?.startedAt || 0));
  els.next.textContent = formatTime(Number(flow?.nextAt || 0));
  if (flow?.queueCaption) {
    els.queue.textContent = flow.queueCaption;
  } else if (flow?.noToolQueue) {
    els.queue.textContent = "Chu kỳ 2 giờ — không dùng hàng chờ tool";
  } else {
    els.queue.textContent = flow?.queueSize
      ? `Hàng chờ mua tool: ${flow.queueLabel || flow.queueSize}`
      : "Hàng chờ mua tool: trống";
  }

  if (!flow?.enabled) {
    els.progress.style.width = "0%";
    els.percent.textContent = "0%";
    return;
  }

  const startedAt = Number(flow?.startedAt || 0);
  const nextAt = Number(flow?.nextAt || 0);
  const intervalMs = Number(flow?.intervalMs || 0);
  const nowMs = Date.now();
  let progress = 0;

  if (startedAt > 0 && nextAt > startedAt) {
    progress = ((nowMs - startedAt) / (nextAt - startedAt)) * 100;
  } else if (intervalMs > 0 && nextAt > 0) {
    progress = ((intervalMs - Math.max(0, nextAt - nowMs)) / intervalMs) * 100;
  }

  const normalized = clampPercent(progress);
  els.progress.style.width = `${normalized}%`;
  els.percent.textContent = `${Math.round(normalized)}%`;
}

function getGameTab() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs?.[0];
      if (!tab?.id || !tab.url) return resolve(null);
      try {
        const u = new URL(tab.url);
        const ok =
          u.protocol === "https:" &&
          (u.hostname === "sunflower-land.com" || u.hostname === "www.sunflower-land.com");
        resolve(ok ? tab : null);
      } catch {
        resolve(null);
      }
    });
  });
}

function send(tabId, message) {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve({ ok: false, error: chrome.runtime.lastError.message });
        return;
      }
      resolve({ ok: true, data: response });
    });
  });
}

function readUiSettings() {
  return {
    masterEnabled: !!ids.masterEnabled.checked,
    autoBuyTools: !!ids.autoBuyTools.checked,
    autoRestockBlacksmith: !!ids.autoRestockBlacksmith.checked,
    autoChop: !!ids.autoChop.checked,
    autoMine: !!ids.autoMine?.checked,
    autoCookFirePit: !!ids.autoCookFirePit?.checked,
    autoCookKitchen: !!ids.autoCookKitchen?.checked,
    cookPreferredRecipe: String(ids.cookPreferredRecipe?.value || "").trim(),
    autoPetalHarvestDom: !!ids.autoPetalHarvestDom?.checked,
    reloadPageOnGoblinMoonCaptcha: !!ids.reloadPageOnGoblinMoonCaptcha?.checked,
    autoFarmCropsDom: !!ids.autoFarmCropsDom?.checked,
    cropDomSeedName: String(ids.cropDomSeedName?.value || "Sunflower Seed").trim() || "Sunflower Seed",
    cropDomSkipLongGrow: !!ids.cropDomSkipLongGrow?.checked,
    cropDomBuySeedsAtBetty: !!ids.cropDomBuySeedsAtBetty?.checked,
    autoHarvestMushrooms: !!ids.autoHarvestMushrooms?.checked,
    mushroomTargetWild: !!ids.mushroomTargetWild?.checked,
    mushroomTargetMagic: !!ids.mushroomTargetMagic?.checked,
    mineTargetStone: !!ids.mineTargetStone?.checked,
    mineTargetIron: !!ids.mineTargetIron?.checked,
    mineTargetGold: !!ids.mineTargetGold?.checked,
    mineTargetCrimstone: !!ids.mineTargetCrimstone?.checked,
    mineTargetSunstone: !!ids.mineTargetSunstone?.checked,
    strikeLearnAutoChop: !!ids.strikeLearnAutoChop?.checked,
    strikeLearnAutoMine: !!ids.strikeLearnAutoMine?.checked,
    chopStrikes: readStrikeInput(ids.chopStrikes, 3),
    mineStrikes: readStrikeInput(ids.mineStrikes, 3),
  };
}

function renderSettings(settings) {
  ids.masterEnabled.checked = !!settings.masterEnabled;
  ids.autoBuyTools.checked = !!settings.autoBuyTools;
  ids.autoRestockBlacksmith.checked = !!settings.autoRestockBlacksmith;
  ids.autoChop.checked = !!settings.autoChop;
  if (ids.autoMine) ids.autoMine.checked = !!settings.autoMine;
  if (ids.autoCookFirePit) ids.autoCookFirePit.checked = !!settings.autoCookFirePit;
  if (ids.autoCookKitchen) ids.autoCookKitchen.checked = !!settings.autoCookKitchen;
  if (ids.cookPreferredRecipe) {
    ids.cookPreferredRecipe.value = String(settings.cookPreferredRecipe || "").trim();
  }
  if (ids.autoPetalHarvestDom) ids.autoPetalHarvestDom.checked = !!settings.autoPetalHarvestDom;
  if (ids.reloadPageOnGoblinMoonCaptcha) {
    ids.reloadPageOnGoblinMoonCaptcha.checked = !!settings.reloadPageOnGoblinMoonCaptcha;
  }
  if (ids.autoFarmCropsDom) ids.autoFarmCropsDom.checked = !!settings.autoFarmCropsDom;
  if (ids.cropDomSeedName) {
    ids.cropDomSeedName.value = String(settings.cropDomSeedName || "Sunflower Seed").trim() || "Sunflower Seed";
  }
  if (ids.cropDomSkipLongGrow) ids.cropDomSkipLongGrow.checked = !!settings.cropDomSkipLongGrow;
  if (ids.cropDomBuySeedsAtBetty) ids.cropDomBuySeedsAtBetty.checked = settings.cropDomBuySeedsAtBetty === true;
  if (ids.autoHarvestMushrooms) ids.autoHarvestMushrooms.checked = !!settings.autoHarvestMushrooms;
  if (ids.mushroomTargetWild) ids.mushroomTargetWild.checked = settings.mushroomTargetWild !== false;
  if (ids.mushroomTargetMagic) ids.mushroomTargetMagic.checked = settings.mushroomTargetMagic !== false;
  if (ids.mineTargetStone) ids.mineTargetStone.checked = settings.mineTargetStone !== false;
  if (ids.mineTargetIron) ids.mineTargetIron.checked = settings.mineTargetIron !== false;
  if (ids.mineTargetGold) ids.mineTargetGold.checked = settings.mineTargetGold !== false;
  if (ids.mineTargetCrimstone) ids.mineTargetCrimstone.checked = settings.mineTargetCrimstone !== false;
  if (ids.mineTargetSunstone) ids.mineTargetSunstone.checked = settings.mineTargetSunstone !== false;
  if (ids.strikeLearnAutoChop) {
    ids.strikeLearnAutoChop.checked = settings.strikeLearnAutoChop !== false;
  }
  if (ids.strikeLearnAutoMine) {
    ids.strikeLearnAutoMine.checked = settings.strikeLearnAutoMine !== false;
  }
  const clampS = (v) => readStrikeInput({ value: v }, 3);
  if (ids.chopStrikes) ids.chopStrikes.value = String(clampS(settings.chopStrikes));
  if (ids.mineStrikes) ids.mineStrikes.value = String(clampS(settings.mineStrikes));
}

/**
 * @param {{ syncForm?: boolean }} opts
 * syncForm: chỉ bật khi mở popup / sau lưu OK — không gọi mỗi giây (tránh ghi đè checkbox user → bật/tắt nhấp nháy).
 */
async function refreshStatus(opts = {}) {
  const syncForm = !!opts.syncForm;
  const tab = await getGameTab();
  if (!tab?.id) {
    setStatus("Hãy mở sunflower-land.com/play trước.", "warn");
    setStatusDetails();
    return;
  }

  const result = await send(tab.id, { type: "SFL_UI_GET_STATUS" });
  if (!result.ok || !result.data?.ok) {
    const detail = !result.ok && result.error ? ` (${result.error})` : "";
    setStatus(`Không đọc được trạng thái${detail}. Hãy tải lại tab game.`, "warn");
    setStatusDetails();
    return;
  }

  const { settings, status } = result.data;
  if (syncForm) {
    renderSettings(settings || {});
  }
  setStatus(
    status?.busy
      ? `Bot đang thực hiện thao tác (${status?.lastAction || "running"}).`
      : "Đã kết nối tab game và sẵn sàng chạy.",
    "live",
  );
  setStatusDetails({
    flows: status?.flows || null,
  });
  if (ids.captchaReloadSkipCount) {
    ids.captchaReloadSkipCount.textContent = String(
      Math.max(0, Math.floor(Number(status?.captchaGoblinMoonReloadSkipCount) || 0)),
    );
  }
  if (ids.captchaSolvedCount) {
    ids.captchaSolvedCount.textContent = String(
      Math.max(0, Math.floor(Number(status?.captchaSolvedCount) || 0)),
    );
  }
  if (ids.captchaFailedCount) {
    ids.captchaFailedCount.textContent = String(
      Math.max(0, Math.floor(Number(status?.captchaFailedCount) || 0)),
    );
  }
}

async function saveSettingsAuto() {
  const tab = await getGameTab();
  if (!tab?.id) {
    setStatus("Hãy mở sunflower-land.com/play trước.", "warn");
    setStatusDetails();
    return;
  }

  const update = await send(tab.id, {
    type: "SFL_UI_UPDATE_SETTINGS",
    settings: readUiSettings(),
  });

  if (!update.ok || !update.data?.ok) {
    setStatus("Lưu thất bại. Hãy tải lại tab game.", "warn");
    return;
  }

  if (update.data.settings) {
    renderSettings(update.data.settings);
  }
  setStatus("Đã tự lưu cấu hình.", "live");
  await refreshStatus();
}

const autoSaveTargets = [
  ids.masterEnabled,
  ids.autoBuyTools,
  ids.autoRestockBlacksmith,
  ids.autoChop,
  ids.autoMine,
  ids.autoCookFirePit,
  ids.autoCookKitchen,
  ids.cookPreferredRecipe,
  ids.autoPetalHarvestDom,
  ids.reloadPageOnGoblinMoonCaptcha,
  ids.autoFarmCropsDom,
  ids.cropDomSeedName,
  ids.cropDomSkipLongGrow,
  ids.cropDomBuySeedsAtBetty,
  ids.autoHarvestMushrooms,
  ids.mushroomTargetWild,
  ids.mushroomTargetMagic,
  ids.mineTargetStone,
  ids.mineTargetIron,
  ids.mineTargetGold,
  ids.mineTargetCrimstone,
  ids.mineTargetSunstone,
  ids.strikeLearnAutoChop,
  ids.strikeLearnAutoMine,
  ids.chopStrikes,
  ids.mineStrikes,
];

for (const node of autoSaveTargets) {
  if (!node) continue;
  const ev = node.type === "number" ? "input" : "change";
  node.addEventListener(ev, () => {
    saveSettingsAuto();
  });
}

ids.resetStrikeLearn?.addEventListener("click", async () => {
  const tab = await getGameTab();
  if (!tab?.id) {
    setStatus("Hãy mở sunflower-land.com/play trước.", "warn");
    return;
  }
  const result = await send(tab.id, {
    type: "SFL_UI_UPDATE_SETTINGS",
    settings: {
      chopStrikesLearned: false,
    },
  });
  if (!result.ok || !result.data?.ok) {
    setStatus("Không xóa được bộ nhớ học.", "warn");
    return;
  }
  if (result.data.settings) renderSettings(result.data.settings);
  setStatus("Đã xóa bộ nhớ học cây — lần tới sẽ tự học lại (nếu bật).", "live");
  await refreshStatus({ syncForm: false });
});

ids.resetCaptchaReloadSkipCount?.addEventListener("click", async () => {
  const tab = await getGameTab();
  if (!tab?.id) {
    setStatus("Hãy mở sunflower-land.com/play trước.", "warn");
    return;
  }
  const result = await send(tab.id, { type: "SFL_UI_RESET_CAPTCHA_RELOAD_SKIP_COUNT" });
  if (!result.ok || !result.data?.ok) {
    setStatus("Không xóa được số đếm (tab game cần mở).", "warn");
    return;
  }
  if (ids.captchaReloadSkipCount) ids.captchaReloadSkipCount.textContent = "0";
  setStatus("Đã xóa số đếm thoát captcha.", "live");
  await refreshStatus({ syncForm: false });
});

ids.resetMineStrikeLearn?.addEventListener("click", async () => {
  const tab = await getGameTab();
  if (!tab?.id) {
    setStatus("Hãy mở sunflower-land.com/play trước.", "warn");
    return;
  }
  const result = await send(tab.id, {
    type: "SFL_UI_UPDATE_SETTINGS",
    settings: {
      mineStrikesLearned: false,
    },
  });
  if (!result.ok || !result.data?.ok) {
    setStatus("Không xóa được bộ nhớ học đá.", "warn");
    return;
  }
  if (result.data.settings) renderSettings(result.data.settings);
  setStatus("Đã xóa bộ nhớ học đá — lần tới sẽ tự học lại (nếu bật).", "live");
  await refreshStatus({ syncForm: false });
});

refreshStatus({ syncForm: true });
setInterval(() => refreshStatus({ syncForm: false }), 1000);
