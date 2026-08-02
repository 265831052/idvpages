(function () {
  "use strict";

  var MAPS = window.MAP_GUIDE_DATA || [];
  var SHAPE_ORDER = ["右拐┐", "左拐└", "左卜", "正T型", "十字", "分叉Y型", "横杠—", "竖条丨"];
  var DIFFICULTY_ORDER = ["新手", "简单", "普通", "困难", "噩梦"];
  var SHAPE_LABELS = {
    "右拐┐": "右拐",
    "左拐└": "左拐",
    "左卜": "左卜",
    "正T型": "正T型",
    "十字": "十字",
    "分叉Y型": "分叉Y型",
    "横杠—": "横杠",
    "竖条丨": "竖条"
  };
  var SHAPE_ICONS = {
    "右拐┐": "icon-shape-right",
    "左拐└": "icon-shape-left",
    "左卜": "icon-shape-left-pu",
    "正T型": "icon-shape-t",
    "十字": "icon-shape-cross",
    "分叉Y型": "icon-shape-y",
    "横杠—": "icon-shape-horizontal",
    "竖条丨": "icon-shape-vertical"
  };

  var state = {
    query: "",
    shape: "",
    difficulty: ""
  };

  var mappingState = {
    index: 0,
    opacity: 0.85,
    visible: false
  };

  var grid = document.getElementById("mapGrid");
  var resultCount = document.getElementById("resultCount");
  var searchInput = document.getElementById("mapSearch");
  var clearSearch = document.getElementById("clearSearch");
  var shapeFilters = document.getElementById("terrainFilters");
  var difficultyFilters = document.getElementById("difficultyFilters");
  var resetFilters = document.getElementById("resetFilters");
  var detailOverlay = document.getElementById("detailOverlay");
  var toast = document.getElementById("toast");
  var mappingPanel = document.getElementById("mappingV2Panel");
  var mappingImage = document.getElementById("mappingV2Image");
  var mappingOpacity = document.getElementById("mappingV2Opacity");
  var mappingDragHandle = document.getElementById("mappingV2DragHandle");

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

  function uniqueValues(values, order) {
    var set = new Set(values.filter(Boolean));
    var list = Array.from(set);
    if (order) {
      return order.filter(function (value) { return set.has(value); }).concat(
        list.filter(function (value) { return order.indexOf(value) === -1; }).sort(function (a, b) {
          return a.localeCompare(b, "zh-CN");
        })
      );
    }
    return list.sort(function (a, b) { return a.localeCompare(b, "zh-CN"); });
  }

  function shapeLabel(type) {
    return SHAPE_LABELS[type] || type;
  }

  function shapeIcon(type) {
    var icon = SHAPE_ICONS[type];
    return icon ? '<svg class="shape-icon" aria-hidden="true"><use href="#' + icon + '"></use></svg>' : "";
  }

  function mapImage(map, index) {
    return map.image || "assets/maps/map-" + String(index + 1).padStart(2, "0") + ".svg";
  }

  function mapMatches(map) {
    var query = state.query.trim().toLowerCase();
    var searchText = [map.name, map.type, map.description, map.traits.join(" ")].join(" ").toLowerCase();
    return (
      (!query || searchText.indexOf(query) !== -1) &&
      (!state.shape || map.type === state.shape) &&
      (!state.difficulty || map.difficulty === state.difficulty)
    );
  }

  function filteredMaps() {
    return MAPS.filter(mapMatches);
  }

  function isDefaultState() {
    return !state.query && !state.shape && !state.difficulty;
  }

  function cardHTML(map, index) {
    var label = "地图图片 " + String(index + 1).padStart(2, "0");
    return (
      '<button class="map-card" type="button" data-map-id="' + escapeHtml(map.id) + '" style="--card-accent:' + escapeHtml(map.accent) + '">' +
        '<span class="map-card__media"><img src="' + escapeHtml(mapImage(map, index)) + '" alt="' + escapeHtml(label) + '" loading="eager"></span>' +
        '<span class="map-card__body"><span class="map-card__difficulty">' + escapeHtml(map.difficulty) + "难度</span></span>" +
      "</button>"
    );
  }

  function renderFilters() {
    shapeFilters.innerHTML = uniqueValues(MAPS.map(function (map) { return map.type; }), SHAPE_ORDER).map(function (type) {
      return (
        '<button type="button" class="chip" data-shape="' + escapeHtml(type) + '" aria-pressed="' + (state.shape === type ? "true" : "false") + '">' +
          "<span>" + escapeHtml(shapeLabel(type)) + "</span>" + shapeIcon(type) +
        "</button>"
      );
    }).join("");

    difficultyFilters.innerHTML = DIFFICULTY_ORDER.map(function (difficulty) {
      return (
        '<button type="button" class="chip" data-difficulty="' + escapeHtml(difficulty) + '" aria-pressed="' + (state.difficulty === difficulty ? "true" : "false") + '">' +
          escapeHtml(difficulty) +
        "</button>"
      );
    }).join("");
  }

  function renderGrid() {
    var result = filteredMaps();
    resultCount.textContent = "找到 " + result.length + " 张地图";
    resetFilters.hidden = isDefaultState();

    if (!result.length) {
      grid.innerHTML = '<div class="empty-state"><p>没有找到匹配的地图</p><p>试试清除筛选，或换个关键词。</p></div>';
      return;
    }

    grid.innerHTML = result.map(cardHTML).join("");
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
    var map = MAPS.find(function (item) { return item.id === id; });
    if (!map) {
      return;
    }
    var index = MAPS.indexOf(map);
    detailOverlay.innerHTML =
      '<article class="detail-panel" role="dialog" aria-modal="true" aria-labelledby="detailTitle">' +
        '<button class="detail-close icon-button" type="button" data-close-detail aria-label="关闭"><svg aria-hidden="true"><use href="#icon-close"></use></svg></button>' +
        '<h2 id="detailTitle" class="sr-only">地图图片</h2>' +
        '<img class="detail-image" src="' + escapeHtml(mapImage(map, index)) + '" alt="地图图片">' +
        '<div class="detail-actions"><button class="primary-button" type="button" data-map-mapping="' + escapeHtml(map.id) + '"><svg aria-hidden="true"><use href="#icon-map"></use></svg>映射此图</button></div>' +
      "</article>";
    detailOverlay.hidden = false;
    document.body.classList.add("no-scroll");

    var closeButton = detailOverlay.querySelector("[data-close-detail]");
    if (closeButton) {
      closeButton.addEventListener("click", closeDetail);
      closeButton.focus();
    }

    var mapButton = detailOverlay.querySelector("[data-map-mapping]");
    if (mapButton) {
      mapButton.addEventListener("click", function () {
        closeDetail();
        openMapping(mapButton.dataset.mapMapping);
      });
    }
  }

  function closeDetail() {
    detailOverlay.hidden = true;
    detailOverlay.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

  function currentMap() {
    return MAPS[mappingState.index] || MAPS[0];
  }

  function renderMapping() {
    var map = currentMap();
    if (!map) {
      return;
    }
    mappingState.index = MAPS.indexOf(map);
    mappingImage.src = mapImage(map, mappingState.index);
    mappingImage.alt = "地图映射图片 " + String(mappingState.index + 1).padStart(2, "0");
    mappingImage.style.opacity = String(mappingState.opacity);
    mappingOpacity.value = String(Math.round(mappingState.opacity * 100));
  }

  function openMapping(id) {
    if (id) {
      var found = MAPS.findIndex(function (map) { return map.id === id; });
      if (found !== -1) {
        mappingState.index = found;
      }
    }
    mappingPanel.hidden = false;
    mappingState.visible = true;
    renderMapping();
  }

  function closeMapping() {
    mappingPanel.hidden = true;
    mappingState.visible = false;
  }

  function toggleMapping(id) {
    if (mappingState.visible) {
      closeMapping();
    } else {
      openMapping(id);
    }
  }

  function cycleMapping(direction) {
    if (!MAPS.length) {
      return;
    }
    mappingState.index = (mappingState.index + direction + MAPS.length) % MAPS.length;
    renderMapping();
  }

  mappingPanel.querySelector("[data-mapping-v2-prev]").addEventListener("click", function () {
    cycleMapping(-1);
  });
  mappingPanel.querySelector("[data-mapping-v2-next]").addEventListener("click", function () {
    cycleMapping(1);
  });
  mappingPanel.querySelector("[data-mapping-v2-close]").addEventListener("click", closeMapping);
  mappingPanel.querySelector("[data-mapping-v2-pip]").addEventListener("click", openFloatingMapping);

  mappingOpacity.addEventListener("input", function () {
    mappingState.opacity = Number(mappingOpacity.value) / 100;
    mappingImage.style.opacity = String(mappingState.opacity);
  });

  document.querySelectorAll("[data-mapping-v2-open]").forEach(function (button) {
    button.addEventListener("click", function () {
      toggleMapping(currentMap().id);
    });
  });

  var dragData = null;
  mappingDragHandle.addEventListener("pointerdown", function (event) {
    if (event.target.closest("button")) {
      return;
    }
    var rect = mappingPanel.getBoundingClientRect();
    dragData = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      left: rect.left,
      top: rect.top
    };
    mappingDragHandle.setPointerCapture(event.pointerId);
  });

  mappingDragHandle.addEventListener("pointermove", function (event) {
    if (!dragData || event.pointerId !== dragData.pointerId) {
      return;
    }
    event.preventDefault();
    var left = dragData.left + event.clientX - dragData.startX;
    var top = dragData.top + event.clientY - dragData.startY;
    left = Math.min(Math.max(8, left), window.innerWidth - mappingPanel.offsetWidth - 8);
    top = Math.min(Math.max(8, top), window.innerHeight - mappingPanel.offsetHeight - 8);
    mappingPanel.style.right = "auto";
    mappingPanel.style.bottom = "auto";
    mappingPanel.style.left = left + "px";
    mappingPanel.style.top = top + "px";
  });

  function endDrag(event) {
    if (dragData && event.pointerId === dragData.pointerId) {
      dragData = null;
    }
  }

  mappingDragHandle.addEventListener("pointerup", endDrag);
  mappingDragHandle.addEventListener("pointercancel", endDrag);

  function collectCss() {
    var cssText = "";
    Array.prototype.forEach.call(document.styleSheets, function (sheet) {
      try {
        Array.prototype.forEach.call(sheet.cssRules, function (rule) {
          cssText += rule.cssText + "\n";
        });
      } catch (error) {
        // Ignore cross-origin stylesheets.
      }
    });
    return cssText;
  }

  function overlayData() {
    return MAPS.map(function (map, index) {
      return {
        src: new URL(mapImage(map, index), document.baseURI).href,
        difficulty: map.difficulty,
        type: shapeLabel(map.type)
      };
    });
  }

  function overlayHtml(maps, startIndex) {
    return (
      '<div class="mapping-panel pip-panel">' +
        '<div class="mapping-panel__head">' +
          '<span class="mapping-panel__title">地图映射</span>' +
          '<button class="icon-button" type="button" id="pipPrev" aria-label="上一张"><svg viewBox="0 0 24 24"><path d="m15 6-6 6 6 6"></path></svg></button>' +
          '<button class="icon-button" type="button" id="pipNext" aria-label="下一张"><svg viewBox="0 0 24 24"><path d="m9 6 6 6-6 6"></path></svg></button>' +
          '<button class="icon-button" type="button" id="pipClose" aria-label="关闭"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"></path></svg></button>' +
        "</div>" +
        '<div class="mapping-panel__body"><img id="pipImage" alt="地图映射图片"></div>' +
        '<div class="mapping-panel__controls">' +
          '<label class="mapping-control"><svg viewBox="0 0 24 24"><path d="M12 3c3 3.8 6 7 6 10a6 6 0 1 1-12 0c0-3 3-6.2 6-10Z"></path></svg><input id="pipOpacity" type="range" min="35" max="100" value="' + Math.round(mappingState.opacity * 100) + '" aria-label="调整透明度"></label>' +
        "</div>" +
      "</div>"
    );
  }

  function overlayScript(maps, startIndex) {
    return "(function(){var maps=" + JSON.stringify(maps) + ";var index=" + startIndex + ";var opacity=" + mappingState.opacity + ";var image=document.getElementById('pipImage');var prev=document.getElementById('pipPrev');var next=document.getElementById('pipNext');var close=document.getElementById('pipClose');var opacityInput=document.getElementById('pipOpacity');function render(){image.src=maps[index].src;image.style.opacity=opacity;}prev.onclick=function(){index=(index-1+maps.length)%maps.length;render();};next.onclick=function(){index=(index+1)%maps.length;render();};opacityInput.oninput=function(){opacity=Number(opacityInput.value)/100;image.style.opacity=opacity;};close.onclick=function(){window.close();};render();})();";
  }

  function overlayCss() {
    return (
      collectCss() +
      ".pip-panel{position:fixed;inset:0;right:auto;bottom:auto;width:100vw;height:100vh;max-height:none;border-radius:0;display:flex;flex-direction:column}" +
      ".pip-panel .mapping-panel__body{flex:1;max-height:none;overflow:hidden}" +
      ".pip-panel .mapping-panel__body img{width:100%;height:100%;max-height:none;object-fit:contain}" +
      ".pip-panel .mapping-panel__controls{flex:none}" +
      ".pip-panel button svg{width:18px;height:18px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}"
    );
  }

  function openFallbackModal() {
    var index = mappingState.index;
    var maps = overlayData();
    detailOverlay.innerHTML =
      '<article class="detail-panel mapping-fallback" role="dialog" aria-modal="true" aria-labelledby="mappingFallbackTitle">' +
        '<button class="detail-close icon-button" type="button" data-close-detail aria-label="关闭"><svg aria-hidden="true"><use href="#icon-close"></use></svg></button>' +
        '<div class="mapping-fallback__head"><h2 id="mappingFallbackTitle">地图映射</h2><span>当前浏览器不支持置顶悬浮窗，已打开页面内映射</span></div>' +
        '<img class="detail-image" id="fallbackImage" alt="地图映射图片">' +
        '<div class="mapping-fallback__controls">' +
          '<button class="icon-button" type="button" data-fallback-prev aria-label="上一张"><svg aria-hidden="true"><use href="#icon-previous"></use></svg></button>' +
          '<input id="fallbackOpacity" type="range" min="35" max="100" value="' + Math.round(mappingState.opacity * 100) + '" aria-label="调整透明度">' +
          '<button class="icon-button" type="button" data-fallback-next aria-label="下一张"><svg aria-hidden="true"><use href="#icon-next"></use></svg></button>' +
        "</div>" +
      "</article>";
    detailOverlay.hidden = false;
    document.body.classList.add("no-scroll");

    var fallbackImage = detailOverlay.querySelector("#fallbackImage");
    var fallbackOpacity = detailOverlay.querySelector("#fallbackOpacity");

    function renderFallback() {
      fallbackImage.src = maps[index].src;
      fallbackImage.style.opacity = String(mappingState.opacity);
      fallbackOpacity.value = String(Math.round(mappingState.opacity * 100));
    }

    renderFallback();

    detailOverlay.querySelector("[data-close-detail]").addEventListener("click", closeDetail);
    detailOverlay.querySelector("[data-fallback-prev]").addEventListener("click", function () {
      index = (index - 1 + maps.length) % maps.length;
      renderFallback();
    });
    detailOverlay.querySelector("[data-fallback-next]").addEventListener("click", function () {
      index = (index + 1) % maps.length;
      renderFallback();
    });
    fallbackOpacity.addEventListener("input", function () {
      mappingState.opacity = Number(fallbackOpacity.value) / 100;
      fallbackImage.style.opacity = String(mappingState.opacity);
    });
  }

  function openFloatingMapping() {
    var maps = overlayData();
    var startIndex = mappingState.index;

    if (!window.documentPictureInPicture || typeof window.documentPictureInPicture.requestWindow !== "function") {
      openFallbackModal();
      return;
    }

    window.documentPictureInPicture.requestWindow({ width: 380, height: 680 }).then(function (pipWindow) {
      var style = pipWindow.document.createElement("style");
      style.textContent = overlayCss();
      pipWindow.document.head.appendChild(style);
      pipWindow.document.body.innerHTML = overlayHtml(maps, startIndex);
      var script = pipWindow.document.createElement("script");
      script.textContent = overlayScript(maps, startIndex);
      pipWindow.document.body.appendChild(script);
      closeMapping();
    }).catch(function () {
      openFallbackModal();
    });
  }

  searchInput.addEventListener("input", function () {
    state.query = searchInput.value;
    renderGrid();
  });

  clearSearch.addEventListener("click", function () {
    state.query = "";
    searchInput.value = "";
    renderGrid();
    searchInput.focus();
  });

  shapeFilters.addEventListener("click", function (event) {
    var button = event.target.closest("[data-shape]");
    if (!button) {
      return;
    }
    state.shape = state.shape === button.dataset.shape ? "" : button.dataset.shape;
    renderFilters();
    renderGrid();
  });

  difficultyFilters.addEventListener("click", function (event) {
    var button = event.target.closest("[data-difficulty]");
    if (!button) {
      return;
    }
    state.difficulty = state.difficulty === button.dataset.difficulty ? "" : button.dataset.difficulty;
    renderFilters();
    renderGrid();
  });

  resetFilters.addEventListener("click", function () {
    state.query = "";
    state.shape = "";
    state.difficulty = "";
    searchInput.value = "";
    renderFilters();
    renderGrid();
    searchInput.focus();
  });

  detailOverlay.addEventListener("click", function (event) {
    if (event.target === detailOverlay) {
      closeDetail();
    }
  });

  document.addEventListener("keydown", function (event) {
    var active = document.activeElement;
    var isTyping = active && /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName);

    if (event.key === "Escape") {
      if (!detailOverlay.hidden) {
        closeDetail();
      } else if (mappingState.visible) {
        closeMapping();
      }
    }

    if (isTyping) {
      return;
    }

    if (event.key.toLowerCase() === "m") {
      event.preventDefault();
      toggleMapping(currentMap().id);
      return;
    }

    if (!mappingState.visible) {
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
