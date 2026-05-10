(function (S) {
  "use strict";
  const runtime = S.runtime;

  function clearConsoleIfNeeded() {
    if (!runtime.settings.clearConsole) return;
    if (Math.random() > 0.15) return;
    try {
      console.clear();
    } catch (_error) {
      // Ignore console clear failures.
    }
  }

  async function drainBuyToolQueue() {
    let did = false;
    while (runtime.settings.autoBuyTools && runtime.buyToolQueue.length > 0) {
      const bought = await S.workbench.processBuyToolQueue();
      did = did || bought;
      if (!bought) break;
    }
    return did;
  }

  async function automationTick() {
    if (!S.dom.shouldRunAutomationInThisFrame() || runtime.busy) return;
    if (typeof S.pullAutomationFlagsFromStorage === "function") {
      await S.pullAutomationFlagsFromStorage();
    }
    if (!runtime.settings.masterEnabled) return;

    // ── Kiểm tra route: chỉ chạy khi đang ở trang farm /play/ ──
    const onFarmRoute = S.dom.isOnFarmRoute();
    if (!onFarmRoute) {
      // Rời farm route → đánh dấu và dừng tất cả luồng
      if (runtime._wasOnFarmRoute !== false) {
        runtime._wasOnFarmRoute = false;
        runtime.treeFlowState = "Tạm dừng (rời farm)";
        runtime.rockFlowState = "Tạm dừng (rời farm)";
        runtime.mushroomFlowState = "Tạm dừng (rời farm)";
        runtime.cookFlowState = "Tạm dừng (rời farm)";
        runtime.petalHarvestState = "Tạm dừng (rời farm)";
        S.time.logFlow("Route watcher: rời farm route — dừng tất cả luồng", {
          href: String(window.location.href || "").slice(0, 80),
        });
      }
      return;
    }

    // Vừa trở lại farm route → restart ngay lập tức tất cả luồng bật
    if (runtime._wasOnFarmRoute === false) {
      runtime._wasOnFarmRoute = true;
      runtime.currentSequenceStep = "mushroom";
      runtime.lastPetalActionAt = 0;
      runtime.lastCropDomActionAt = 0;
      S.time.logFlow("Route watcher: trở về farm route — bắt đầu lại vòng lặp", {
        href: String(window.location.href || "").slice(0, 80),
      });
    }
    runtime._wasOnFarmRoute = true;

    const needPauseBetty =
      typeof S.cropDom?.isBettySeedShopDialogOpen === "function" && S.cropDom.isBettySeedShopDialogOpen();
    const blacksmithShopOpen =
      typeof S.workbench?.isBlacksmithToolsPanelOpen === "function" && S.workbench.isBlacksmithToolsPanelOpen();
    const smithIdleBlock =
      blacksmithShopOpen &&
      !(runtime.settings.autoBuyTools && runtime.buyToolQueue.length > 0);
    const rawShopPause = needPauseBetty || smithIdleBlock;

    const t = S.time.now();

    // ── Kiểm tra độc lập luồng nấm: đảm bảo chạy định kỳ 2 giờ/lần ──
    if (runtime.settings.autoHarvestMushrooms && t - (runtime.lastMushroomActionAt || 0) > S.MUSHROOM_FLOW_INTERVAL_MS) {
      runtime.mushroomFlowState = "Đang chạy (độc lập)";
      let mushroomSteps = 0;
      let didMushroomWork = false;
      for (let step = 0; step < 36; step += 1) {
        const didPick = await S.mushroomHarvest.tryHarvestOneMushroom();
        if (!didPick) break;
        didMushroomWork = true;
        mushroomSteps = step + 1;
        await S.time.sleep(S.time.rand(260, 520));
      }
      if (didMushroomWork) {
        runtime.lastMushroomActionAt = t;
        S.time.logFlow("Luồng nấm: đã thu hoạch (độc lập, không phụ thuộc state machine)", { steps: mushroomSteps });
        runtime.mushroomFlowState = "Sẵn sàng";
        return; // Đã làm việc, quay lại vòng lặp tick sau
      }
      runtime.mushroomFlowState = "Chờ tới lượt";
    }

    const SHOP_CLOSE_DEBOUNCE_MS = 520;
    const hold = runtime._shopAutomationHold;

    if (rawShopPause) {
      runtime._shopAutomationHold = -1;
    } else {
      if (hold === -1) {
        runtime._shopAutomationHold = t + SHOP_CLOSE_DEBOUNCE_MS;
      } else if (typeof hold === "number" && hold > 0 && t >= hold) {
        runtime._shopAutomationHold = 0;
      }
    }

    const h = runtime._shopAutomationHold;
    const shopAutomationPaused = h === -1 || (typeof h === "number" && h > t);

    if (shopAutomationPaused) {
      if (needPauseBetty) {
        if (t - (runtime._automationShopPauseLogAt || 0) > 14000) {
          runtime._automationShopPauseLogAt = t;
          S.time.logFlow("Tạm dừng automation — shop Betty (hạt) đang mở; đóng để chạy tiếp", {});
        }
        return;
      }
      if (blacksmithShopOpen && runtime.settings.autoBuyTools && runtime.buyToolQueue.length > 0) {
        runtime.busy = true;
        try {
          clearConsoleIfNeeded();
          await drainBuyToolQueue();
        } finally {
          runtime.busy = false;
        }
        return;
      }
      if (smithIdleBlock) {
        if (t - (runtime._automationShopPauseLogAt || 0) > 14000) {
          runtime._automationShopPauseLogAt = t;
          S.time.logFlow("Tạm dừng automation — Blacksmith/Workbench đang mở; đóng để chạy tiếp", {});
        }
        return;
      }
      // Debounce: DOM vừa báo đóng shop — chưa chạy luồng map (tránh nhấp nháy).
      return;
    }

    runtime.busy = true;
    try {
      clearConsoleIfNeeded();

      if (typeof S.cropDom?.tryTapChestCaptchaIfPresent === "function") {
        const chestDone = await S.cropDom.tryTapChestCaptchaIfPresent();
        if (chestDone) {
          await S.time.sleep(S.time.rand(200, 420));
        }
      }

      // Xử lý popup lỗi chung (ví dụ: "Oops! Something went wrong!" -> "Try again")
      if (typeof S.dom?.findVisibleDialogButtonByText === "function") {
        const tryAgainBtn = S.dom.findVisibleDialogButtonByText(/try again|refresh/i) || (typeof S.dom.findInteractiveButtonByText === "function" ? S.dom.findInteractiveButtonByText(/try again|refresh/i) : null);
        if (tryAgainBtn) {
          S.time.logFlow("Phát hiện popup lỗi, đang click Try again / Refresh", {});
          S.dom.nativeClickClose(tryAgainBtn);
          await S.time.sleep(S.time.rand(500, 1000));
          return; // Dừng tick này để xử lý
        }
      }

      // Xử lý popup update game: "A new version is ready. Update"
      const docsToSearch = S.dom?.collectDocumentsForGameDom ? S.dom.collectDocumentsForGameDom() : [document];
      for (let di = 0; di < docsToSearch.length; di += 1) {
        const doc = docsToSearch[di];
        const bodyText = doc.body ? doc.body.textContent || "" : "";
        if (bodyText.toLowerCase().includes("a new version is ready")) {
          const els = doc.querySelectorAll("a, button, span, u, p, div");
          let clicked = false;
          for (let i = 0; i < els.length; i++) {
            const el = els[i];
            if (el.textContent && el.textContent.trim().toLowerCase() === "update" && (S.dom?.isVisible ? S.dom.isVisible(el) : true)) {
              S.time.logFlow("Phát hiện popup Update phiên bản mới, đang click Update", {});
              if (S.dom?.nativeClickClose) {
                S.dom.nativeClickClose(el);
              } else {
                el.click();
              }
              clicked = true;
              break;
            }
          }
          if (!clicked) {
            S.time.logFlow("Phát hiện yêu cầu Update phiên bản mới, tiến hành reload trang", {});
            window.location.reload();
          }
          await S.time.sleep(2000);
          return; // Dừng tick này để xử lý
        }
      }

      if (runtime.settings.autoBuyTools && runtime.buyToolQueue.length > 0) {
        await drainBuyToolQueue();
        if (runtime.buyToolQueue.length > 0) {
          const t = S.time.now();
          if (t - (runtime._buyQueuePendingLogAt || 0) > 8000) {
            runtime._buyQueuePendingLogAt = t;
            S.time.logFlow("Hàng chờ mua công cụ: vẫn còn — thử lại mỗi tick (không chờ chu kỳ 8 phút). Kéo map cho thấy Workbench nếu không mở được shop.", {
              hangDoi: runtime.buyToolQueue.length,
              head: runtime.buyToolQueue[0],
            });
          }
        }
      }

      // Tự động nâng đảo (kiểm tra ngầm, sẽ tự bỏ qua nếu không đủ đk hoặc đã check gần đây)
      if (typeof S.cropDom?.tryExpandIslandViaEvent === "function") {
        await S.cropDom.tryExpandIslandViaEvent();
      }

      // --- Sequential State Machine ---
      runtime.currentSequenceStep = runtime.currentSequenceStep || "mushroom";

      let checkedCount = 0;
      while (checkedCount < 6) {
        let didWork = false;

        if (runtime.currentSequenceStep === "mushroom") {
          if (runtime.settings.autoHarvestMushrooms) {
            runtime.mushroomFlowState = "Đang chạy";
            let mushroomSteps = 0;
            for (let step = 0; step < 36; step += 1) {
              const didPick = await S.mushroomHarvest.tryHarvestOneMushroom();
              mushroomSteps = step + 1;
              if (!didPick) break;
              didWork = true;
              await S.time.sleep(S.time.rand(260, 520));
            }
            if (didWork) {
              S.time.logFlow("Luồng nấm: đã thu hoạch", { steps: mushroomSteps });
            } else {
              runtime.mushroomFlowState = "Chờ tới lượt";
            }
          } else {
            runtime.mushroomFlowState = "Tạm tắt";
          }
          if (!didWork) runtime.currentSequenceStep = "tree";
        } 
        else if (runtime.currentSequenceStep === "tree") {
          if (runtime.settings.autoChop) {
            runtime.treeFlowState = "Đang chạy";
            let treeSteps = 0;
            let treeIdleRetries = 0;
            const maxTreeIdleRetries = 4;
            
            for (let step = 0; step < 40; step += 1) {
              let didStep = false;
              const bought = await drainBuyToolQueue();
              didStep = didStep || bought;
              const didChop = await S.woodChop.tryAutoChop();
              didStep = didStep || didChop;
              if (!didStep && typeof S.woodChop?.hasChopSessionPending === "function" && S.woodChop.hasChopSessionPending()) {
                didStep = true;
                await S.time.sleep(S.time.rand(280, 520));
                didWork = true;
                treeSteps = step + 1;
                break;
              }
              if (!didStep) {
                const moreTrees = typeof S.woodChop?.hasVisibleChoppableTrees === "function" && S.woodChop.hasVisibleChoppableTrees();
                if (moreTrees && treeIdleRetries < maxTreeIdleRetries) {
                  treeIdleRetries += 1;
                  await S.time.sleep(S.time.rand(160, 360));
                  treeSteps = step + 1;
                  continue;
                }
                treeSteps = step + 1;
                break;
              }
              treeIdleRetries = 0;
              didWork = didWork || didStep;
              treeSteps = step + 1;
            }
            if (didWork) {
              runtime.lastTreeActionAt = S.time.now();
              runtime.lastActionAt = runtime.lastTreeActionAt;
              S.time.logFlow("Luồng cây: đã chặt", { steps: treeSteps });
            } else {
              runtime.treeFlowState = "Chờ tới lượt";
            }
          } else {
            runtime.treeFlowState = "Tạm tắt";
          }
          if (!didWork) runtime.currentSequenceStep = "mine";
        }
        else if (runtime.currentSequenceStep === "mine") {
          if (runtime.settings.autoMine) {
            runtime.rockFlowState = "Đang chạy";
            let rockSteps = 0;
            for (let step = 0; step < 40; step += 1) {
              let didStep = false;
              const bought = await drainBuyToolQueue();
              didStep = didStep || bought;
              const didMine = await S.rockMine.tryAutoMine();
              didStep = didStep || didMine;
              
              if (!didMine && runtime.lastAction === "mine_gap") {
                didStep = true;
                await S.time.sleep(S.time.rand(420, 780));
              }
              didWork = didWork || didStep;
              rockSteps = step + 1;
              if (!didStep) break;
            }
            if (didWork) {
              runtime.lastRockActionAt = S.time.now();
              runtime.lastActionAt = runtime.lastRockActionAt;
              S.time.logFlow("Luồng đá: đã đào", { steps: rockSteps });
            } else {
              runtime.rockFlowState = "Chờ tới lượt";
            }
          } else {
            runtime.rockFlowState = "Tạm tắt";
          }
          if (!didWork) runtime.currentSequenceStep = "crop";
        }
        else if (runtime.currentSequenceStep === "crop") {
          if (runtime.settings.autoFarmCropsDom && typeof S.cropDom?.tryOneFarmStep === "function") {
            for (let cstep = 0; cstep < 22; cstep += 1) {
              const didCrop = await S.cropDom.tryOneFarmStep();
              if (!didCrop) break;
              didWork = true;
              runtime.lastCropDomActionAt = S.time.now();
              await S.time.sleep(S.time.rand(200, 420));
            }
          }
          if (!didWork) runtime.currentSequenceStep = "petal";
        }
        else if (runtime.currentSequenceStep === "petal") {
          if (runtime.settings.autoPetalHarvestDom && typeof S.petalDom?.tryOnePetalStep === "function") {
            runtime.petalHarvestState = "Đang chạy";
            for (let pstep = 0; pstep < 14; pstep += 1) {
              const didP = await S.petalDom.tryOnePetalStep();
              if (!didP) break;
              didWork = true;
              runtime.lastPetalActionAt = S.time.now();
              await S.time.sleep(S.time.rand(200, 420));
            }
            if (!didWork) runtime.petalHarvestState = "Chờ tới lượt";
          } else {
            runtime.petalHarvestState = "Tạm tắt";
          }
          if (!didWork) runtime.currentSequenceStep = "cook";
        }
        else if (runtime.currentSequenceStep === "cook") {
          const cookEnabled = typeof S.cook?.isCookEnabled === "function" && S.cook.isCookEnabled();
          if (cookEnabled && S.gameBridge?.isReady) {
            try {
              runtime.cookFlowState = "Đang chạy";
              const cookActed = !!(await S.cook.runCookCycle());
              if (cookActed) {
                didWork = true;
                runtime.lastAction = "auto_cook";
                runtime.lastActionAt = S.time.now();
              } else if (typeof S.cook.refreshCookWaitingLabel === "function") {
                S.cook.refreshCookWaitingLabel(S.time.now());
                if (runtime.cookFlowState === "Đang chạy") {
                  runtime.cookFlowState = "Chờ tới lượt";
                }
              }
            } catch (_cookErr) {
              runtime.cookFlowState = "Lỗi";
            }
          } else if (!cookEnabled) {
            runtime.cookFlowState = "Tạm tắt";
          } else {
            runtime.cookFlowState = "Chờ bridge";
          }
          if (!didWork) runtime.currentSequenceStep = "mushroom";
        }
        else {
          runtime.currentSequenceStep = "mushroom";
        }

        if (didWork) return;
        checkedCount += 1;
      }
    } catch (error) {
      runtime.errorCount += 1;
      runtime.lastError = String(error?.message || error || "unknown_ui_error");
      if (runtime.settings.autoChop) runtime.treeFlowState = "Lỗi";
      if (runtime.settings.autoMine) runtime.rockFlowState = "Lỗi";
      if (runtime.settings.autoHarvestMushrooms) runtime.mushroomFlowState = "Lỗi";
      if (S.cook?.isCookEnabled?.()) runtime.cookFlowState = "Lỗi";
      if (runtime.settings.autoPetalHarvestDom) runtime.petalHarvestState = "Lỗi";
      S.time.logFlow("Lỗi luồng", {
        lastError: runtime.lastError,
        errorCount: runtime.errorCount,
      });
      console.warn("[SFL UI-Only]", "UI action error", {
        lastError: runtime.lastError,
        errorCount: runtime.errorCount,
      });
    } finally {
      runtime.busy = false;
    }
  }

  function scheduleAutomationTick() {
    setTimeout(() => {
      Promise.resolve(automationTick()).finally(scheduleAutomationTick);
    }, Math.max(400, runtime.settings.tickMs));
  }

  // --- HEARTBEAT ---
  const HEARTBEAT_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
  let heartbeatStartTime = S.time.now();

  function getNext7AM() {
    const now = new Date();
    const target = new Date(now);
    target.setHours(7, 0, 0, 0);
    if (now.getTime() >= target.getTime()) {
      target.setDate(target.getDate() + 1);
    }
    return target.getTime();
  }
  let nextReloadTime = getNext7AM();

  function triggerHeartbeat() {
    const t = S.time.now();
    if (t >= nextReloadTime) {
      S.time.logFlow("Heartbeat: Đã đến 7h sáng, tiến hành reload trang", {});
      console.log("[Heartbeat] Đã đến 7h sáng, tiến hành reload trang...");
      window.location.reload();
      return;
    }

    S.time.logFlow("Heartbeat: Đập mỗi 3 phút — Khởi động lại tất cả các luồng!", {});
    console.log("[Heartbeat] Đập mỗi 3 phút: Khởi động lại tất cả các luồng!");

    if (runtime.settings.autoChop) runtime.treeFlowState = "Restart (Heartbeat)";
    if (runtime.settings.autoMine) runtime.rockFlowState = "Restart (Heartbeat)";
    if (runtime.settings.autoHarvestMushrooms) runtime.mushroomFlowState = "Restart (Heartbeat)";
    if (runtime.settings.autoCookFirePit || runtime.settings.autoCookKitchen) runtime.cookFlowState = "Restart (Heartbeat)";
    
    runtime.currentSequenceStep = "mushroom";

    // Force reset state in case it hangs
    runtime.busy = false;
    runtime._shopAutomationHold = 0;
    if (typeof S.clearChopSticky === "function") S.clearChopSticky();
    if (typeof S.clearMineSticky === "function") S.clearMineSticky();
  }

  setInterval(triggerHeartbeat, HEARTBEAT_INTERVAL_MS);

  // ── BẢNG TỔNG HỢP TÀI NGUYÊN HÀNG NGÀY ──
  // Snapshot farmActivity khi tool khởi động; mỗi heartbeat tính delta và in bảng.
  // Reset tự động khi reload trang (7h sáng hoặc thủ công).

  let dailyFarmActivitySnapshot = null;
  let dailySnapshotCoins = null;
  let dailySnapshotAt = 0;

  /** Chụp snapshot farmActivity + coins lần đầu từ bridge. */
  function captureDailySnapshot() {
    if (dailyFarmActivitySnapshot) return; // đã chụp rồi
    const st = S.gameBridge?.getLatestState?.();
    if (!st?.farmActivity) return;
    dailyFarmActivitySnapshot = Object.assign({}, st.farmActivity);
    dailySnapshotCoins = typeof st.coins === "number" ? st.coins : null;
    dailySnapshotAt = S.time.now();
    S.time.logFlow("📊 Bảng tổng hợp: đã chụp snapshot farmActivity ban đầu", {
      keys: Object.keys(dailyFarmActivitySnapshot).length,
      coins: dailySnapshotCoins,
    });
  }

  /**
   * Phân loại key farmActivity: "Harvested" / "Planted" / "Crafted" / "Mined" / "Cooked" / …
   * Trả về { action, resource }
   * Ví dụ: "Sunflower Harvested" → { action: "Harvested", resource: "Sunflower" }
   */
  function parseFarmActivityKey(key) {
    const parts = String(key || "").trim().split(/\s+/);
    if (parts.length < 2) return { action: key, resource: key };
    const action = parts[parts.length - 1]; // last word = verb
    const resource = parts.slice(0, -1).join(" ");
    return { action, resource };
  }

  /** Nhóm tài nguyên: cộng (thu được) / trừ (tiêu hao). */
  const GAIN_ACTIONS = new Set([
    "Harvested", "Collected", "Mined", "Caught", "Received", "Found", "Opened",
  ]);
  const SPEND_ACTIONS = new Set([
    "Planted", "Crafted", "Cooked", "Fed", "Used", "Bought", "Sold", "Spent",
  ]);

  function logDailyResourceSummary() {
    if (!dailyFarmActivitySnapshot) return;
    const st = S.gameBridge?.getLatestState?.();
    if (!st?.farmActivity) return;

    const current = st.farmActivity;
    const snapshot = dailyFarmActivitySnapshot;

    // Tính delta cho mỗi key
    const allKeys = new Set([...Object.keys(current), ...Object.keys(snapshot)]);
    const gains = {}; // resource → count (thu được)
    const spends = {}; // resource → count (tiêu hao)
    const others = {}; // resource → count (khác)

    for (const key of allKeys) {
      const cur = Math.floor(Number(current[key]) || 0);
      const prev = Math.floor(Number(snapshot[key]) || 0);
      const delta = cur - prev;
      if (delta === 0) continue;

      const { action, resource } = parseFarmActivityKey(key);
      if (GAIN_ACTIONS.has(action)) {
        gains[resource] = (gains[resource] || 0) + delta;
      } else if (SPEND_ACTIONS.has(action)) {
        spends[resource] = (spends[resource] || 0) + delta;
      } else {
        others[key] = delta;
      }
    }

    // Xu (coins)
    const coinsDelta = (typeof st.coins === "number" && dailySnapshotCoins !== null)
      ? Math.round((st.coins - dailySnapshotCoins) * 100) / 100
      : null;

    // Tính thời gian chạy
    const elapsedMs = S.time.now() - dailySnapshotAt;
    const elapsedMin = Math.floor(elapsedMs / 60000);
    const elapsedH = Math.floor(elapsedMin / 60);
    const elapsedM = elapsedMin % 60;
    const elapsedLabel = elapsedH > 0 ? elapsedH + "h" + (elapsedM > 0 ? elapsedM + "p" : "") : elapsedM + " phút";

    // Format bảng
    const lines = [];
    lines.push("╔══════════════════════════════════════════════════╗");
    lines.push("║       📊 TỔNG HỢP TÀI NGUYÊN — " + elapsedLabel + " qua       ║");
    lines.push("╠══════════════════════════════════════════════════╣");

    const gainKeys = Object.keys(gains).sort();
    const spendKeys = Object.keys(spends).sort();
    const otherKeys = Object.keys(others).sort();

    if (gainKeys.length > 0) {
      lines.push("║  ✅ THU ĐƯỢC:                                    ║");
      for (const r of gainKeys) {
        const v = gains[r];
        const label = ("     " + r).slice(-30);
        const val = ("+" + v).padStart(8);
        lines.push("║  " + label + "  " + val + "          ║");
      }
    }

    if (spendKeys.length > 0) {
      lines.push("║  ❌ TIÊU HAO:                                    ║");
      for (const r of spendKeys) {
        const v = spends[r];
        const label = ("     " + r).slice(-30);
        const val = ("-" + v).padStart(8);
        lines.push("║  " + label + "  " + val + "          ║");
      }
    }

    if (otherKeys.length > 0) {
      lines.push("║  📋 KHÁC:                                        ║");
      for (const k of otherKeys) {
        const v = others[k];
        const label = ("     " + k).slice(-30);
        const sign = v > 0 ? "+" : "";
        const val = (sign + v).padStart(8);
        lines.push("║  " + label + "  " + val + "          ║");
      }
    }

    if (coinsDelta !== null) {
      lines.push("╠══════════════════════════════════════════════════╣");
      const sign = coinsDelta >= 0 ? "+" : "";
      lines.push("║  💰 Xu (coins):           " + (sign + coinsDelta).padStart(12) + "          ║");
    }

    if (gainKeys.length === 0 && spendKeys.length === 0 && otherKeys.length === 0 && coinsDelta === null) {
      lines.push("║  (chưa có hoạt động nào)                         ║");
    }

    lines.push("╚══════════════════════════════════════════════════╝");

    console.log("\n" + lines.join("\n"));

    // Cũng log qua logFlow để lưu vào hệ thống log
    const summary = {};
    if (gainKeys.length > 0) summary["Thu được"] = gains;
    if (spendKeys.length > 0) summary["Tiêu hao"] = spends;
    if (otherKeys.length > 0) summary["Khác"] = others;
    if (coinsDelta !== null) summary["Xu"] = coinsDelta;
    S.time.logFlow("📊 Tổng hợp tài nguyên (" + elapsedLabel + ")", summary);
  }

  // Chụp snapshot ngay khi bridge sẵn sàng (thử mỗi 5 giây cho đến khi có)
  const snapshotTimer = setInterval(() => {
    captureDailySnapshot();
    if (dailyFarmActivitySnapshot) clearInterval(snapshotTimer);
  }, 5000);

  // Log bảng tổng hợp mỗi heartbeat (3 phút)
  setInterval(logDailyResourceSummary, HEARTBEAT_INTERVAL_MS);

  S.automation = { automationTick, scheduleAutomationTick };
})(window.SFL);
