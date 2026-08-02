(function () {
  const MAPS = window.MAP_GUIDE_DATA || [];
  const state = {
    query: "",
    terrain: "",
    difficulty: ""
  };
  const SHAPE_ORDER = ["右拐┐", "左拐└", "左卜", "正T型", "十字", "分叉Y型", "横杠—", "竖条丨"];
  const DIFFICULTY_ORDER = ["新手", "简单", "普通", "困难", "噩梦"];
  const SHAPE_META = {
    "右拐┐": { label: "右拐", icon: "icon-shape-right" },
    "左拐└": { label: "左拐", icon: "icon-shape-left" },
    "左卜": { label: "左卜", icon: "icon-shape-left-pu" },
    "正T型": { label: "正T型", icon: "icon-shape-t" },
    "十字": { label: "十字", icon: "icon-shape-cross" },
    "分叉Y型": { label: "分叉Y型", icon: "icon-shape-y" },
    "横杠—": { label: "横杠", icon: "icon-shape-horizontal" },
    "竖条丨": { label: "竖条", icon: "icon-shape-vertical" }
  };

  const grid = document.getElementById("mapGrid");
  const resultCount = document.getElementById("resultCount");
  const searchInput = document.getElementById("mapSearch");
  const clearSearch = document.getElementById("clearSearch");
  const terrainFilters = document.getElementById("terrainFilters");
  const difficultyFilters = document.getElementById("difficultyFilters");
  const resetFilters = document.getElementById("resetFilters");
  const overlay = document.getElementById("detailOverlay");
  const toast = document.getElementById("toast");
  const mappingPanel = document.getElementById("mappingPanel");
  const mappingDragHandle = document.getElementById("mappingDragHandle");
  const mappingImage = document.getElementById("mappingImage");
  const mappingOpacity = document.getElementById("mappingOpacity");
  const mappingSize = document.getElementById("mappingSize");
  const mappingState = {
    mapId: null,
    opacity: 85,
    size: 100
  };

  function storedMappingValue(key, fallback) {
    try {
      const value = Number(window.localStorage.getItem(key));
      return Number.isFinite(value) ? value : fallback;
    } catch (error) {
      return fallback;
    }
  }

  mappingState.opacity = storedMappingValue("idvpages-map-opacity", 85);
  mappingState.size = storedMappingValue("idvpages-map-size", 100);
  mappingState.mapId = (function () {
    try {
      return window.localStorage.getItem("idvpages-map-id");
    } catch (error) {
      return null;
    }
  }());

  function saveMappingState() {
    try {
      window.localStorage.setItem("idvpages-map-opacity", String(mappingState.opacity));
      window.localStorage.setItem("idvpages-map-size", String(mappingState.size));
      if (mappingState.mapId) {
        window.localStorage.setItem("idvpages-map-id", mappingState.mapId);
      }
    } catch (error) {
      // Local storage may be unavailable; the mapping panel still works in memory.
    }
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function unique(values, preferredOrder) {
    const valuesSet = new Set(values.filter(Boolean));
    const items = Array.from(valuesSet);
    if (preferredOrder) {
      const ordered = preferredOrder.filter(function (value) {
        return valuesSet.has(value);
      });
      const remaining = items.filter(function (value) {
        return !preferredOrder.includes(value);
      }).sort(function (a, b) {
        return a.localeCompare(b, "zh-CN");
      });
      return ordered.concat(remaining);
    }
    return items.sort(function (a, b) {
      return a.localeCompare(b, "zh-CN");
    });
  }

  function shapeMeta(type) {
    return SHAPE_META[type] || { label: type, icon: "" };
  }

  function shapeIcon(type) {
    const meta = shapeMeta(type);
    if (!meta.icon) {
      return "";
    }
    return '<svg class="shape-icon" aria-hidden="true"><use href="#' + meta.icon + '"></use></svg>';
  }

  function shapeLabel(type) {
    return shapeMeta(type).label;
  }

  function isDefaultState() {
    return !state.query && !state.terrain && !state.difficulty;
  }

  function matches(map) {
    const query = state.query.trim().toLowerCase();
    const searchText = [
      map.name,
      map.type,
      map.description,
      map.traits.join(" "),
      map.landmarks.join(" ")
    ].join(" ").toLowerCase();

    const queryOk = !query || searchText.includes(query);
    const terrainOk = !state.terrain || map.type === state.terrain;
    const difficultyOk = !state.difficulty || map.difficulty === state.difficulty;
    return queryOk && terrainOk && difficultyOk;
  }

  function filteredMaps() {
    return MAPS.filter(matches);
  }

  function mapImage(map, index) {
    return map.image || "assets/maps/map-" + String(index + 1).padStart(2, "0") + ".svg";
  }

  function cardHTML(map, index) {
    const image = mapImage(map, index);
    const mediaLabel = "地图图片 " + String(index + 1).padStart(2, "0");
    return (
      '<button class="map-card" type="button" data-map-id="' + escapeHtml(map.id) + '" style="--card-accent:' + escapeHtml(map.accent) + '">' +
        '<span class="map-card__media">' +
          '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(mediaLabel) + '" loading="eager">' +
        "</span>" +
        '<span class="map-card__body"><span class="map-card__difficulty">' + escapeHtml(map.difficulty) + "难度</span></span>" +
      "</button>"
    );
  }

  function emptyHTML() {
    return (
      '<div class="empty-state">' +
        "<p>没有找到匹配的地图</p>" +
        "<p>试试清除筛选，或换个关键词。</p>" +
      "</div>"
    );
  }

  function renderFilters() {
    const terrains = unique(MAPS.map(function (map) { return map.type; }), SHAPE_ORDER);
    const difficulties = DIFFICULTY_ORDER;

    terrainFilters.innerHTML = terrains.map(function (terrain) {
      return '<button type="button" class="chip" data-terrain="' + escapeHtml(terrain) + '" aria-pressed="' + (state.terrain === terrain ? "true" : "false") + '"><span>' + escapeHtml(shapeLabel(terrain)) + "</span>" + shapeIcon(terrain) + "</button>";
    }).join("");

    difficultyFilters.innerHTML = difficulties.map(function (difficulty) {
      return '<button type="button" class="chip" data-difficulty="' + escapeHtml(difficulty) + '" aria-pressed="' + (state.difficulty === difficulty ? "true" : "false") + '">' + escapeHtml(difficulty) + "</button>";
    }).join("");
  }

  function renderGrid() {
    const result = filteredMaps();
    resultCount.textContent = "找到 " + result.length + " 张地图";
    grid.innerHTML = result.length ? result.map(cardHTML).join("") : emptyHTML();
    resetFilters.hidden = isDefaultState();

    grid.querySelectorAll("[data-map-id]").forEach(function (button) {
      button.addEventListener("click", function () {
        openDetail(button.dataset.mapId);
      });
    });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(function () {
      toast.hidden = true;
    }, 2600);
  }

  function openDetail(id) {
    const map = MAPS.find(function (item) { return item.id === id; });
    if (!map) {
      return;
    }

    overlay.innerHTML =
      '<article class="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detailTitle">' +
        '<button class="detail-close icon-button" type="button" aria-label="关闭详情"><svg aria-hidden="true"><use href="#icon-close"></use></svg></button>' +
        '<h2 id="detailTitle" class="sr-only">地图图片</h2>' +
        '<img class="detail-image" src="' + escapeHtml(mapImage(map, MAPS.indexOf(map))) + '" alt="地图图片">' +
        '<div class="detail-actions"><button class="primary-button" type="button" data-map-mapping="' + escapeHtml(map.id) + '"><svg aria-hidden="true"><use href="#icon-map"></use></svg>映射此图</button></div>' +
      "</article>";

    overlay.hidden = false;
    document.body.classList.add("no-scroll");
    const closeButton = overlay.querySelector(".detail-close");
    if (closeButton) {
      closeButton.addEventListener("click", closeDetail);
      closeButton.focus();
    }
    const mapButton = overlay.querySelector("[data-map-mapping]");
    if (mapButton) {
      mapButton.addEventListener("click", function () {
        const targetId = mapButton.dataset.mapMapping;
        closeDetail();
        openMapping(targetId);
      });
    }
  }

  function closeDetail() {
    overlay.hidden = true;
    overlay.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function currentMappingMap() {
    return MAPS.find(function (map) {
      return map.id === mappingState.mapId;
    }) || MAPS[0];
  }

  function renderMapping() {
    const map = currentMappingMap();
    if (!map) {
      return;
    }
    mappingState.mapId = map.id;
    mappingImage.src = mapImage(map, MAPS.indexOf(map));
    mappingImage.alt = "地图映射图片 " + String(MAPS.indexOf(map) + 1).padStart(2, "0");
    mappingImage.style.opacity = String(mappingState.opacity / 100);
    mappingPanel.style.setProperty("--mapping-width", String(Math.round(300 * mappingState.size / 100)) + "px");
    mappingOpacity.value = String(mappingState.opacity);
    mappingSize.value = String(mappingState.size);
    saveMappingState();
  }

  function openMapping(id) {
    if (id) {
      mappingState.mapId = id;
    }
    if (!MAPS.length) {
      return;
    }
    mappingPanel.hidden = false;
    renderMapping();
  }

  function closeMapping() {
    mappingPanel.hidden = true;
  }

  function toggleMapping(id) {
    if (mappingPanel.hidden) {
      openMapping(id);
    } else {
      closeMapping();
    }
  }

  function cycleMapping(direction) {
    if (!MAPS.length) {
      return;
    }
    const index = MAPS.indexOf(currentMappingMap());
    const next = (index + direction + MAPS.length) % MAPS.length;
    mappingState.mapId = MAPS[next].id;
    renderMapping();
  }

  function collectCss() {
    let cssText = "";
    for (const sheet of document.styleSheets) {
      try {
        for (const rule of sheet.cssRules) {
          cssText += rule.cssText + "\n";
        }
      } catch (error) {
        // Cross-origin style rules cannot be read; fall back to the remaining CSS.
      }
    }
    return cssText;
  }

  function mappingOverlayData() {
    const map = currentMappingMap();
    return {
      maps: MAPS.map(function (item, index) {
      return {
        src: new URL(mapImage(item, index), document.baseURI).href,
        difficulty: item.difficulty,
        type: shapeLabel(item.type)
      };
      }),
      startIndex: Math.max(0, MAPS.indexOf(map))
    };
  }

  function mappingOverlayHtml(maps, startIndex) {
    const pipHtml =
      '<div class="mapping-panel pip-panel">' +
        '<div class="mapping-panel__head">' +
          '<span class="mapping-panel__title">地图映射</span>' +
          '<button class="icon-button" type="button" id="pipPrev" title="上一张" aria-label="上一张地图"><svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"></path></svg></button>' +
          '<button class="icon-button" type="button" id="pipNext" title="下一张" aria-label="下一张地图"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"></path></svg></button>' +
          '<button class="icon-button" type="button" id="pipClose" title="关闭" aria-label="关闭悬浮窗"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>' +
        "</div>" +
        '<div class="mapping-panel__body"><img id="pipImage" alt="地图映射图片"></div>' +
        '<div class="mapping-panel__controls">' +
          '<label class="mapping-control"><svg viewBox="0 0 24 24"><path d="M12 3c3 3.8 6 7 6 10a6 6 0 1 1-12 0c0-3 3-6.2 6-10Z"></path></svg><input id="pipOpacity" type="range" min="35" max="100" value="85" aria-label="调整透明度"></label>' +
        "</div>" +
      "</div>";
    return pipHtml;
  }

  function mappingOverlayScript(maps, startIndex) {
    return "(function(){var maps=" + JSON.stringify(maps) + ";var index=" + startIndex + ";var opacity=" + (mappingState.opacity / 100) + ";var image=document.getElementById('pipImage');var prev=document.getElementById('pipPrev');var next=document.getElementById('pipNext');var close=document.getElementById('pipClose');var opacityInput=document.getElementById('pipOpacity');function render(){image.src=maps[index].src;image.alt='地图映射图片 '+(index+1);image.style.opacity=opacity;}prev.addEventListener('click',function(){index=(index-1+maps.length)%maps.length;render();});next.addEventListener('click',function(){index=(index+1)%maps.length;render();});opacityInput.addEventListener('input',function(){opacity=Number(opacityInput.value)/100;image.style.opacity=opacity;});close.addEventListener('click',function(){window.close();});render();})();";
  }

  function mappingOverlayCss() {
    return collectCss() +
      ".pip-panel{position:fixed;inset:0;right:auto;bottom:auto;width:100vw;height:100vh;max-height:none;border-radius:0;display:flex;flex-direction:column}" +
      ".pip-panel .mapping-panel__body{flex:1;max-height:none;overflow:hidden}" +
      ".pip-panel .mapping-panel__body img{width:100%;height:100%;max-height:none;object-fit:contain}" +
      ".pip-panel .mapping-panel__controls{flex:none}" +
      ".pip-panel button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}";
  }

  function openMappingPopup() {
    const data = mappingOverlayData();
    let popup = null;
    try {
      popup = window.open("", "idvMapOverlay", "popup,width=400,height=720,top=90,left=90");
    } catch (error) {
      popup = null;
    }
    if (!popup) {
      openMapping();
      showToast("浏览器阻止了悬浮窗，已打开页面映射面板");
      return;
    }
    popup.document.open();
    popup.document.write("<!doctype html><html><head><meta charset=\"utf-8\"><title>地图映射</title></head><body>");
    const style = popup.document.createElement("style");
    style.textContent = mappingOverlayCss();
    popup.document.head.appendChild(style);
    popup.document.body.insertAdjacentHTML("beforeend", mappingOverlayHtml(data.maps, data.startIndex));
    const script = popup.document.createElement("script");
    script.textContent = mappingOverlayScript(data.maps, data.startIndex);
    popup.document.body.appendChild(script);
    popup.document.close();
    closeMapping();
  }

  function openMappingFallbackModal() {
    const map = currentMappingMap();
    const startIndex = Math.max(0, MAPS.indexOf(map));
    const src = new URL(mapImage(map, startIndex), document.baseURI).href;

    overlay.innerHTML =
      '<article class="detail-panel mapping-fallback" role="dialog" aria-modal="true" aria-labelledby="mappingFallbackTitle">' +
        '<button class="detail-close icon-button" type="button" data-fallback-close aria-label="关闭"><svg aria-hidden="true"><use href="#icon-close"></use></svg></button>' +
        '<div class="mapping-fallback__head">' +
          '<h2 id="mappingFallbackTitle">地图映射</h2>' +
          '<span>当前浏览器不支持置顶悬浮窗，已打开页面内映射</span>' +
        "</div>" +
        '<img class="detail-image" id="fallbackImage" alt="地图映射图片">' +
        '<div class="mapping-fallback__controls">' +
          '<button class="icon-button" type="button" data-fallback-prev aria-label="上一张"><svg aria-hidden="true"><use href="#icon-previous"></use></svg></button>' +
          '<input id="fallbackOpacity" type="range" min="35" max="100" value="' + mappingState.opacity + '" aria-label="调整透明度">' +
          '<button class="icon-button" type="button" data-fallback-next aria-label="下一张"><svg aria-hidden="true"><use href="#icon-next"></use></svg></button>' +
        "</div>" +
      "</article>";

    overlay.hidden = false;
    document.body.classList.add("no-scroll");

    const image = overlay.querySelector("#fallbackImage");
    const opacityInput = overlay.querySelector("#fallbackOpacity");
    let index = startIndex;

    function renderFallback() {
      const item = MAPS[index];
      image.src = new URL(mapImage(item, index), document.baseURI).href;
      image.alt = "地图映射图片 " + String(index + 1).padStart(2, "0");
      image.style.opacity = String(mappingState.opacity / 100);
      opacityInput.value = String(mappingState.opacity);
    }

    renderFallback();

    overlay.querySelector("[data-fallback-close]").addEventListener("click", closeDetail);
    overlay.querySelector("[data-fallback-prev]").addEventListener("click", function () {
      index = (index - 1 + MAPS.length) % MAPS.length;
      renderFallback();
    });
    overlay.querySelector("[data-fallback-next]").addEventListener("click", function () {
      index = (index + 1) % MAPS.length;
      renderFallback();
    });
    opacityInput.addEventListener("input", function () {
      mappingState.opacity = Number(opacityInput.value);
      image.style.opacity = String(mappingState.opacity / 100);
      saveMappingState();
    });
  }

  function openMappingPip() {
    const data = mappingOverlayData();
    if (!window.documentPictureInPicture || typeof window.documentPictureInPicture.requestWindow !== "function") {
      openMappingFallbackModal();
      return;
    }

    window.documentPictureInPicture.requestWindow({ width: 380, height: 680 }).then(function (pipWindow) {
      const style = pipWindow.document.createElement("style");
      style.textContent = mappingOverlayCss();
      pipWindow.document.head.appendChild(style);
      pipWindow.document.body.innerHTML = mappingOverlayHtml(data.maps, data.startIndex);

      const script = pipWindow.document.createElement("script");
      script.textContent = mappingOverlayScript(data.maps, data.startIndex);
      pipWindow.document.body.appendChild(script);
      closeMapping();
    }).catch(function () {
      openMappingFallbackModal();
    });
  }

  mappingPanel.querySelector("[data-mapping-prev]").addEventListener("click", function () {
    cycleMapping(-1);
  });
  mappingPanel.querySelector("[data-mapping-next]").addEventListener("click", function () {
    cycleMapping(1);
  });
  mappingPanel.querySelector("[data-mapping-pip]").addEventListener("click", openMappingPip);
  mappingPanel.querySelector("[data-mapping-close]").addEventListener("click", closeMapping);

  mappingOpacity.addEventListener("input", function () {
    mappingState.opacity = Number(mappingOpacity.value);
    mappingImage.style.opacity = String(mappingState.opacity / 100);
    saveMappingState();
  });

  mappingSize.addEventListener("input", function () {
    mappingState.size = Number(mappingSize.value);
    mappingPanel.style.setProperty("--mapping-width", String(Math.round(300 * mappingState.size / 100)) + "px");
    saveMappingState();
  });

  document.querySelectorAll("[data-mapping-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      toggleMapping(currentMappingMap().id);
    });
  });

  let dragState = null;
  mappingDragHandle.addEventListener("pointerdown", function (event) {
    if (event.target.closest("button")) {
      return;
    }
    const rect = mappingPanel.getBoundingClientRect();
    dragState = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originLeft: rect.left,
      originTop: rect.top
    };
    mappingDragHandle.setPointerCapture(event.pointerId);
  });

  mappingDragHandle.addEventListener("pointermove", function (event) {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }
    event.preventDefault();
    const nextLeft = dragState.originLeft + event.clientX - dragState.startX;
    const nextTop = dragState.originTop + event.clientY - dragState.startY;
    const maxLeft = Math.max(8, window.innerWidth - mappingPanel.offsetWidth - 8);
    const maxTop = Math.max(8, window.innerHeight - mappingPanel.offsetHeight - 8);
    mappingPanel.style.right = "auto";
    mappingPanel.style.bottom = "auto";
    mappingPanel.style.left = String(Math.min(Math.max(8, nextLeft), maxLeft)) + "px";
    mappingPanel.style.top = String(Math.min(Math.max(8, nextTop), maxTop)) + "px";
  });

  function endMappingDrag(event) {
    if (!dragState || event.pointerId !== dragState.pointerId) {
      return;
    }
    dragState = null;
  }

  mappingDragHandle.addEventListener("pointerup", endMappingDrag);
  mappingDragHandle.addEventListener("pointercancel", endMappingDrag);

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    renderGrid();
  });

  clearSearch.addEventListener("click", function () {
    searchInput.value = "";
    state.query = "";
    renderGrid();
    searchInput.focus();
  });

  terrainFilters.addEventListener("click", function (event) {
    const button = event.target.closest("[data-terrain]");
    if (!button) {
      return;
    }
    state.terrain = state.terrain === button.dataset.terrain ? "" : button.dataset.terrain;
    renderFilters();
    renderGrid();
  });

  difficultyFilters.addEventListener("click", function (event) {
    const button = event.target.closest("[data-difficulty]");
    if (!button) {
      return;
    }
    state.difficulty = state.difficulty === button.dataset.difficulty ? "" : button.dataset.difficulty;
    renderFilters();
    renderGrid();
  });

  resetFilters.addEventListener("click", function () {
    state.query = "";
    state.terrain = "";
    state.difficulty = "";
    searchInput.value = "";
    renderFilters();
    renderGrid();
    searchInput.focus();
  });

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      closeDetail();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      if (!mappingPanel.hidden) {
        closeMapping();
      } else if (!overlay.hidden) {
        closeDetail();
      }
    }

    const target = document.activeElement;
    const isTyping = target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName);
    if (isTyping) {
      return;
    }

    if (event.key.toLowerCase() === "m") {
      event.preventDefault();
      toggleMapping(currentMappingMap().id);
      return;
    }

    if (mappingPanel.hidden) {
      return;
    }

    if (event.key === "ArrowLeft" || event.key === "[") {
      event.preventDefault();
      cycleMapping(-1);
    } else if (event.key === "ArrowRight" || event.key === "]") {
      event.preventDefault();
      cycleMapping(1);
    }
  });

  document.querySelectorAll("[data-forum-link]").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();
      showToast("论坛筹备中，后续版本开放");
    });
  });

  renderFilters();
  renderGrid();
})();
