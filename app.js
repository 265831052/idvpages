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
    const typeIcon = shapeIcon(map.type);
    const typeLabel = shapeLabel(map.type);
    return (
      '<button class="map-card" type="button" data-map-id="' + escapeHtml(map.id) + '" style="--card-accent:' + escapeHtml(map.accent) + '">' +
        '<span class="map-card__media">' +
          '<img src="' + escapeHtml(image) + '" alt="' + escapeHtml(map.name) + ' 示例地图示意图" loading="lazy">' +
          '<span class="map-card__badge">' + escapeHtml(map.badge || "示例") + "</span>" +
          '<span class="map-card__type"><span>' + escapeHtml(typeLabel) + "</span>" + typeIcon + "</span>" +
        "</span>" +
        '<span class="map-card__body">' +
          '<span class="map-card__title-row"><strong>' + escapeHtml(map.name) + '</strong><span>' + escapeHtml(map.difficulty) + "难度</span></span>" +
          '<span class="map-card__desc">' + escapeHtml(map.description) + "</span>" +
          '<span class="map-card__traits">' + map.traits.map(function (trait) { return "<span>" + escapeHtml(trait) + "</span>"; }).join("") + "</span>" +
          '<span class="map-card__footer"><span>' + map.landmarks.length + ' 个标志物</span><span>查看攻略</span></span>' +
        "</span>" +
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
    const difficulties = unique(MAPS.map(function (map) { return map.difficulty; }), DIFFICULTY_ORDER);

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
        '<div class="detail-hero">' +
          '<img src="' + escapeHtml(mapImage(map, MAPS.indexOf(map))) + '" alt="' + escapeHtml(map.name) + ' 示例地图示意图">' +
          '<div class="detail-hero__copy">' +
            '<p class="eyebrow">' + shapeIcon(map.type) + "<span>" + escapeHtml(shapeLabel(map.type)) + "</span> · " + escapeHtml(map.difficulty) + "难度</p>" +
            '<h2 id="detailTitle">' + escapeHtml(map.name) + "</h2>" +
            '<p>' + escapeHtml(map.description) + "</p>" +
            '<div class="tag-list">' + map.traits.map(function (trait) { return "<span>" + escapeHtml(trait) + "</span>"; }).join("") + "</div>" +
          "</div>" +
        "</div>" +
        '<div class="detail-body">' +
          '<section class="detail-section"><h3>快速识别</h3><ul class="landmark-list">' + map.landmarks.map(function (landmark) { return "<li><strong>" + escapeHtml(landmark) + "</strong></li>"; }).join("") + "</ul></section>" +
          '<section class="detail-section"><h3>关键点位</h3><ul class="point-list">' + map.points.map(function (point) { return "<li><strong>" + escapeHtml(point.label) + "</strong><span>" + escapeHtml(point.note) + "</span></li>"; }).join("") + "</ul></section>" +
          '<section class="detail-section"><h3>道具与交互物</h3><div class="tag-list">' + map.items.map(function (item) { return "<span>" + escapeHtml(item) + "</span>"; }).join("") + "</div></section>" +
          '<section class="detail-section"><h3>探索路线</h3><p>' + escapeHtml(map.route) + "</p></section>" +
          '<section class="detail-section"><h3>实用技巧</h3><ul class="tip-list">' + map.tips.map(function (tip) { return "<li>" + escapeHtml(tip) + "</li>"; }).join("") + "</ul></section>" +
        "</div>" +
      "</article>";

    overlay.hidden = false;
    document.body.classList.add("no-scroll");
    const closeButton = overlay.querySelector(".detail-close");
    if (closeButton) {
      closeButton.focus();
    }
  }

  function closeDetail() {
    overlay.hidden = true;
    overlay.innerHTML = "";
    document.body.classList.remove("no-scroll");
  }

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
    if (event.key === "Escape" && !overlay.hidden) {
      closeDetail();
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
