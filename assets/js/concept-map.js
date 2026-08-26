/* Concept map: force-directed graph with keyword search and a detail panel.
   Dependency-free; renders to canvas so a few thousand nodes stay smooth. */

(function () {
  "use strict";

  const wrap = document.getElementById("cm-wrap");
  if (!wrap) return;

  const canvas = document.getElementById("cm-canvas");
  const ctx = canvas.getContext("2d");
  const input = document.getElementById("cm-input");
  const clearBtn = document.getElementById("cm-clear");
  const panelHead = document.getElementById("cm-panel-head");
  const panelBody = document.getElementById("cm-panel-body");
  const stage = document.getElementById("cm-stage");
  const viewer = document.getElementById("cm-viewer");
  const viewerInner = document.getElementById("cm-viewer-inner");
  const viewerClose = document.getElementById("cm-viewer-close");

  // Monotone: every node is drawn in the same tone. The two extra colors are
  // interaction state (search hit / selected), not category.
  const NODE_COLOR = "#5f6b76";
  const MATCH_COLOR = "#4a9fc0";
  const SELECT_COLOR = "#e07840";

  const state = {
    nodes: [],
    links: [],
    byId: new Map(),
    matches: null, // Set of ids, or null when no query is active
    selected: null,
    hovered: null,
    query: "",
    view: { k: 1, x: 0, y: 0 },
    userMoved: false,
    alpha: 1,
    running: false,
  };

  /* ---------------------------------------------------------------- data */

  function build(data) {
    const raw = Array.isArray(data) ? { nodes: data, edges: [] } : data || {};
    const nodes = raw.nodes || [];
    const edges = raw.edges || raw.links || [];
    const n = nodes.length || 1;
    const radius = 26 * Math.sqrt(n);

    state.nodes = nodes.map(function (d, i) {
      const angle = i * 2.399963; // golden angle, spreads the seed positions
      const r = radius * Math.sqrt((i + 0.5) / n);
      return {
        id: String(d.id),
        label: d.label || String(d.id),
        group: d.group || "",
        keywords: (d.keywords || []).map(String),
        image: d.image || "",
        summary: d.summary || d.description || "",
        degree: 0,
        x: Math.cos(angle) * r,
        y: Math.sin(angle) * r,
        vx: 0,
        vy: 0,
        r: 5,
      };
    });

    state.byId = new Map(state.nodes.map((nd) => [nd.id, nd]));

    state.links = [];
    edges.forEach(function (e) {
      const a = Array.isArray(e) ? e[0] : e.source || e.from;
      const b = Array.isArray(e) ? e[1] : e.target || e.to;
      const sa = state.byId.get(String(a));
      const sb = state.byId.get(String(b));
      if (!sa || !sb || sa === sb) return;
      sa.degree++;
      sb.degree++;
      state.links.push({ source: sa, target: sb });
    });

    state.nodes.forEach(function (nd) {
      nd.r = Math.min(8, 2.4 + Math.sqrt(nd.degree) * 0.95);
      nd.haystack = (nd.label + " " + nd.keywords.join(" ") + " " + nd.summary + " " + nd.group).toLowerCase();
      nd.neighbors = [];
    });
    state.links.forEach(function (l) {
      l.source.neighbors.push(l.target);
      l.target.neighbors.push(l.source);
    });
  }

  /* ------------------------------------------------------------- layout */

  const CELL = 70;
  const REPULSION = 900;
  const SPRING_LENGTH = 62;

  function tick() {
    const nodes = state.nodes;
    const a = state.alpha;

    // Repulsion, approximated with a spatial hash: only nearby pairs interact.
    const grid = new Map();
    for (let i = 0; i < nodes.length; i++) {
      const nd = nodes[i];
      const key = Math.round(nd.x / CELL) + "," + Math.round(nd.y / CELL);
      let bucket = grid.get(key);
      if (!bucket) grid.set(key, (bucket = []));
      bucket.push(nd);
    }
    grid.forEach(function (bucket, key) {
      const parts = key.split(",");
      const cx = +parts[0];
      const cy = +parts[1];
      for (let gx = cx; gx <= cx + 1; gx++) {
        for (let gy = gx === cx ? cy : cy - 1; gy <= cy + 1; gy++) {
          const other = gx === cx && gy === cy ? bucket : grid.get(gx + "," + gy);
          if (!other) continue;
          const same = other === bucket;
          for (let i = 0; i < bucket.length; i++) {
            for (let j = same ? i + 1 : 0; j < other.length; j++) {
              const p = bucket[i];
              const q = other[j];
              let dx = p.x - q.x;
              let dy = p.y - q.y;
              let d2 = dx * dx + dy * dy;
              if (d2 > CELL * CELL * 4) continue;
              if (d2 < 0.01) {
                dx = (Math.random() - 0.5) * 0.1;
                dy = (Math.random() - 0.5) * 0.1;
                d2 = 0.01;
              }
              const f = (REPULSION * a) / d2;
              const d = Math.sqrt(d2);
              const fx = (dx / d) * f;
              const fy = (dy / d) * f;
              p.vx += fx;
              p.vy += fy;
              q.vx -= fx;
              q.vy -= fy;
            }
          }
        }
      }
    });

    // Springs along edges.
    for (let i = 0; i < state.links.length; i++) {
      const l = state.links[i];
      const dx = l.target.x - l.source.x;
      const dy = l.target.y - l.source.y;
      const d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = ((d - SPRING_LENGTH) * 0.04 * a) / d;
      const fx = dx * f;
      const fy = dy * f;
      l.source.vx += fx;
      l.source.vy += fy;
      l.target.vx -= fx;
      l.target.vy -= fy;
    }

    // Gravity toward the origin keeps disconnected components in frame.
    for (let i = 0; i < nodes.length; i++) {
      const nd = nodes[i];
      nd.vx -= nd.x * 0.012 * a;
      nd.vy -= nd.y * 0.012 * a;
      nd.vx *= 0.82;
      nd.vy *= 0.82;
      nd.x += Math.max(-20, Math.min(20, nd.vx));
      nd.y += Math.max(-20, Math.min(20, nd.vy));
    }

    state.alpha *= 0.985;
  }

  function loop() {
    if (state.alpha > 0.005) {
      tick();
      if (!state.userMoved) fitView();
      draw();
      requestAnimationFrame(loop);
    } else {
      state.running = false;
      draw();
    }
  }

  function reheat(value) {
    state.alpha = Math.max(state.alpha, value || 0.3);
    if (!state.running) {
      state.running = true;
      requestAnimationFrame(loop);
    }
  }

  /* --------------------------------------------------------------- view */

  let width = 0;
  let height = 0;

  function resize() {
    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (!state.userMoved) fitView();
    draw();
  }

  function fitView() {
    if (!state.nodes.length || !width) return;
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    state.nodes.forEach(function (nd) {
      if (nd.x < minX) minX = nd.x;
      if (nd.y < minY) minY = nd.y;
      if (nd.x > maxX) maxX = nd.x;
      if (nd.y > maxY) maxY = nd.y;
    });
    const pad = 60;
    const k = Math.min((width - pad * 2) / Math.max(1, maxX - minX), (height - pad * 2) / Math.max(1, maxY - minY));
    state.view.k = Math.max(0.05, Math.min(2.5, k));
    state.view.x = width / 2 - ((minX + maxX) / 2) * state.view.k;
    state.view.y = height / 2 - ((minY + maxY) / 2) * state.view.k;
  }

  const toScreenX = (x) => x * state.view.k + state.view.x;
  const toScreenY = (y) => y * state.view.k + state.view.y;

  /* -------------------------------------------------------------- render */

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const k = state.view.k;
    const active = state.matches !== null;
    const isMatch = (nd) => !active || state.matches.has(nd.id);

    // Edges
    ctx.lineWidth = Math.max(0.4, 0.9 * k);
    for (let i = 0; i < state.links.length; i++) {
      const l = state.links[i];
      const lit =
        (state.selected && (l.source === state.selected || l.target === state.selected)) ||
        (active && state.matches.has(l.source.id) && state.matches.has(l.target.id));
      ctx.strokeStyle = lit ? "rgba(224,120,64,0.55)" : active || state.selected ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.13)";
      ctx.beginPath();
      ctx.moveTo(toScreenX(l.source.x), toScreenY(l.source.y));
      ctx.lineTo(toScreenX(l.target.x), toScreenY(l.target.y));
      ctx.stroke();
    }

    // Nodes
    const labels = [];
    for (let i = 0; i < state.nodes.length; i++) {
      const nd = state.nodes[i];
      const sx = toScreenX(nd.x);
      const sy = toScreenY(nd.y);
      if (sx < -40 || sy < -40 || sx > width + 40 || sy > height + 40) continue;

      const match = isMatch(nd);
      const focused = nd === state.selected || nd === state.hovered;
      const r = Math.max(1.6, nd.r * k * (focused ? 1.45 : match && active ? 1.25 : 1));

      ctx.globalAlpha = match ? 1 : 0.18;
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fillStyle = nd === state.selected ? SELECT_COLOR : active && match ? MATCH_COLOR : NODE_COLOR;
      ctx.fill();

      if (focused || (active && match)) {
        ctx.lineWidth = 2;
        ctx.strokeStyle = nd === state.selected ? SELECT_COLOR : "rgba(0,0,0,0.35)";
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      if (focused || (active && match) || (!active && (r > 4.5 || nd.degree >= 5) && k > 0.55)) {
        labels.push({ nd: nd, x: sx, y: sy - r - 3, dim: !match });
      }
    }

    // Labels last so they sit above the node layer.
    ctx.font = "500 12px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    labels.forEach(function (lb) {
      ctx.globalAlpha = lb.dim ? 0.25 : 1;
      ctx.lineWidth = 3;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.strokeText(lb.nd.label, lb.x, lb.y);
      ctx.fillStyle = "#333";
      ctx.fillText(lb.nd.label, lb.x, lb.y);
    });
    ctx.globalAlpha = 1;
  }

  /* ------------------------------------------------------------ pointer */

  function nodeAt(px, py) {
    let best = null;
    let bestD = Infinity;
    for (let i = 0; i < state.nodes.length; i++) {
      const nd = state.nodes[i];
      const dx = toScreenX(nd.x) - px;
      const dy = toScreenY(nd.y) - py;
      const d = dx * dx + dy * dy;
      const hit = Math.max(10, nd.r * state.view.k + 6);
      if (d < hit * hit && d < bestD) {
        bestD = d;
        best = nd;
      }
    }
    return best;
  }

  let drag = null;

  canvas.addEventListener("pointerdown", function (e) {
    canvas.setPointerCapture(e.pointerId);
    const rect = canvas.getBoundingClientRect();
    drag = {
      x: e.clientX,
      y: e.clientY,
      startX: e.clientX - rect.left,
      startY: e.clientY - rect.top,
      moved: false,
    };
  });

  canvas.addEventListener("pointermove", function (e) {
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (drag) {
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 3) {
        drag.moved = true;
        state.userMoved = true;
        canvas.classList.add("cm-dragging");
      }
      state.view.x += dx;
      state.view.y += dy;
      drag.x = e.clientX;
      drag.y = e.clientY;
      draw();
      return;
    }

    const hit = nodeAt(px, py);
    canvas.classList.toggle("cm-over-node", !!hit);
    if (hit !== state.hovered) {
      state.hovered = hit;
      draw();
    }
  });

  function endDrag(e) {
    if (!drag) return;
    if (!drag.moved) {
      const rect = canvas.getBoundingClientRect();
      const hit = nodeAt(e.clientX - rect.left, e.clientY - rect.top);
      if (hit) showDetail(hit.id, "graph");
    }
    canvas.classList.remove("cm-dragging");
    drag = null;
  }

  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", function () {
    canvas.classList.remove("cm-dragging");
    drag = null;
  });
  canvas.addEventListener("pointerleave", function () {
    if (state.hovered) {
      state.hovered = null;
      draw();
    }
  });

  canvas.addEventListener(
    "wheel",
    function (e) {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const factor = Math.exp(-e.deltaY * 0.0015);
      const k = Math.max(0.05, Math.min(8, state.view.k * factor));
      const ratio = k / state.view.k;
      state.view.x = px - (px - state.view.x) * ratio;
      state.view.y = py - (py - state.view.y) * ratio;
      state.view.k = k;
      state.userMoved = true;
      draw();
    },
    { passive: false }
  );

  function centerOn(nd) {
    const k = Math.max(state.view.k, 1);
    const from = { x: state.view.x, y: state.view.y, k: state.view.k };
    const to = { x: width / 2 - nd.x * k, y: height / 2 - nd.y * k, k: k };
    state.userMoved = true;
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - t0) / 350);
      const e = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      state.view.x = from.x + (to.x - from.x) * e;
      state.view.y = from.y + (to.y - from.y) * e;
      state.view.k = from.k + (to.k - from.k) * e;
      draw();
      if (t < 1) requestAnimationFrame(step);
    })(t0);
  }

  /* ------------------------------------------------------------- search */

  function score(nd, tokens) {
    let total = 0;
    for (let i = 0; i < tokens.length; i++) {
      const t = tokens[i];
      let best = 0;
      const label = nd.label.toLowerCase();
      if (label === t) best = 100;
      else if (label.startsWith(t)) best = 70;
      else if (label.indexOf(t) >= 0) best = 50;
      for (let j = 0; j < nd.keywords.length && best < 60; j++) {
        const kw = nd.keywords[j].toLowerCase();
        if (kw === t) best = Math.max(best, 60);
        else if (kw.indexOf(t) >= 0) best = Math.max(best, 35);
      }
      if (best === 0 && nd.group.toLowerCase().indexOf(t) >= 0) best = 20;
      if (best === 0 && nd.summary.toLowerCase().indexOf(t) >= 0) best = 12;
      if (best === 0) return 0; // every token must match something
      total += best;
    }
    return total;
  }

  function search(query) {
    const tokens = query.toLowerCase().split(/[^a-z0-9+#.-]+/).filter(Boolean);
    if (!tokens.length) return null;
    const hits = [];
    state.nodes.forEach(function (nd) {
      const s = score(nd, tokens);
      if (s > 0) hits.push({ node: nd, score: s });
    });
    hits.sort(function (a, b) {
      return b.score - a.score || b.node.degree - a.node.degree || a.node.label.localeCompare(b.node.label);
    });
    return hits;
  }

  /* -------------------------------------------------------------- panel */

  let lastResults = [];

  function el(tag, cls, text) {
    const node = document.createElement(tag);
    if (cls) node.className = cls;
    if (text != null) node.textContent = text;
    return node;
  }

  function backLink(label, handler) {
    const holder = el("div", "cm-back");
    const btn = el("button", "cm-link", label);
    btn.type = "button";
    btn.addEventListener("click", handler);
    holder.appendChild(btn);
    return holder;
  }

  function resetToStart() {
    closeViewer();
    input.value = "";
    state.query = "";
    state.matches = null;
    state.selected = null;
    lastResults = [];
    wrap.classList.remove("cm-active");
    panelBody.innerHTML = "";
    panelHead.textContent = "";
    state.userMoved = false;
    fitView();
    draw();
    input.focus();
  }

  function showResults() {
    closeViewer();
    state.selected = null;
    panelBody.innerHTML = "";
    panelHead.textContent = lastResults.length
      ? lastResults.length + (lastResults.length === 1 ? " match for " : " matches for ") + '"' + state.query + '"'
      : 'No matches for "' + state.query + '"';

    if (!lastResults.length) {
      panelBody.appendChild(el("p", "cm-empty", "Try a broader keyword, or clear the search to see the whole map."));
    }

    lastResults.forEach(function (hit) {
      const nd = hit.node;
      const btn = el("button", "cm-result");
      btn.type = "button";
      btn.appendChild(el("div", "cm-result-label", nd.label));
      if (nd.group) btn.appendChild(el("div", "cm-result-group", nd.group));
      if (nd.summary) btn.appendChild(el("p", "cm-result-snippet", nd.summary));
      btn.addEventListener("click", function () {
        showDetail(nd.id, "results");
      });
      btn.addEventListener("mouseenter", function () {
        state.hovered = nd;
        draw();
      });
      btn.addEventListener("mouseleave", function () {
        state.hovered = null;
        draw();
      });
      panelBody.appendChild(btn);
    });

    panelBody.appendChild(backLink("← Back to start", resetToStart));
    panelBody.scrollTop = 0;
  }

  function showFigure(nd) {
    viewerInner.classList.remove("cm-zoomed");
    viewerInner.innerHTML = "";

    if (!nd.image) {
      const empty = el("div", "cm-viewer-empty");
      empty.appendChild(el("strong", null, nd.label));
      empty.appendChild(el("span", null, "No figure for this concept yet."));
      viewerInner.appendChild(empty);
      return;
    }

    const img = new Image();
    img.src = nd.image;
    img.alt = nd.label;
    img.addEventListener("error", function () {
      const empty = el("div", "cm-viewer-empty");
      empty.appendChild(el("strong", null, nd.label));
      empty.appendChild(el("span", null, "Figure not found: " + nd.image));
      viewerInner.replaceChildren(empty);
    });
    img.addEventListener("click", function () {
      viewerInner.classList.toggle("cm-zoomed");
    });
    viewerInner.appendChild(img);
  }

  function closeViewer() {
    wrap.classList.remove("cm-viewing");
    viewerInner.innerHTML = "";
    viewerInner.classList.remove("cm-zoomed");
  }

  function showDetail(id, origin) {
    const nd = state.byId.get(id);
    if (!nd) return;
    state.selected = nd;
    wrap.classList.add("cm-active");
    wrap.classList.add("cm-viewing");
    centerOn(nd);
    draw();
    showFigure(nd);

    panelHead.textContent = "Concept";
    panelBody.innerHTML = "";
    const box = el("div", "cm-detail");
    box.appendChild(el("h3", null, nd.label));
    if (nd.group) box.appendChild(el("div", "cm-detail-group", nd.group));
    if (nd.summary) box.appendChild(el("p", "cm-detail-summary", nd.summary));

    if (nd.keywords.length) {
      const chips = el("div", "cm-chips");
      nd.keywords.forEach(function (kw) {
        chips.appendChild(el("span", "cm-chip", kw));
      });
      box.appendChild(chips);
    }

    if (nd.neighbors.length) {
      box.appendChild(el("div", "cm-result-group", "connected concepts"));
      const list = el("ul", "cm-neighbors");
      nd.neighbors
        .slice()
        .sort(function (a, b) {
          return a.label.localeCompare(b.label);
        })
        .forEach(function (nb) {
          const li = el("li");
          const link = el("button", "cm-link", nb.label);
          link.type = "button";
          link.addEventListener("click", function () {
            showDetail(nb.id, origin);
          });
          li.appendChild(link);
          list.appendChild(li);
        });
      box.appendChild(list);
    }

    panelBody.appendChild(box);
    if (origin === "results" && lastResults.length) {
      panelBody.appendChild(backLink("← Back to results", showResults));
    } else {
      panelBody.appendChild(backLink("← Back to start", resetToStart));
    }
    panelBody.scrollTop = 0;
  }

  function runSearch() {
    const q = input.value.trim();
    state.query = q;
    const hits = search(q);
    if (!hits) {
      closeViewer();
      state.matches = null;
      state.selected = null;
      lastResults = [];
      wrap.classList.remove("cm-active");
      panelBody.innerHTML = "";
      draw();
      return;
    }
    state.matches = new Set(hits.map((h) => h.node.id));
    lastResults = hits;
    wrap.classList.add("cm-active");
    showResults();
    draw();
  }

  let debounce = null;
  input.addEventListener("input", function () {
    clearTimeout(debounce);
    debounce = setTimeout(runSearch, 160);
  });
  input.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      clearTimeout(debounce);
      runSearch();
    }
  });

  // Escape is bound on the document: after clicking a node the focus is on the
  // canvas or the panel, not the search box.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (wrap.classList.contains("cm-viewing")) {
      // Step back out of the figure first, then out of the search.
      if (lastResults.length) showResults();
      else resetToStart();
    } else if (wrap.classList.contains("cm-active")) {
      resetToStart();
    }
  });
  clearBtn.addEventListener("click", resetToStart);
  viewerClose.addEventListener("click", function () {
    if (lastResults.length) showResults();
    else resetToStart();
  });

  window.addEventListener("resize", resize);

  /* ---------------------------------------------------------------- boot */

  fetch(wrap.dataset.source)
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(function (data) {
      build(data);
      panelHead.textContent = "";
      resize();
      reheat(1);
      input.disabled = false;
      input.placeholder = "Search " + state.nodes.length + " concepts…";
    })
    .catch(function (err) {
      stage.innerHTML =
        '<p class="cm-empty">Could not load the concept data (' + err.message + ").</p>";
    });
})();
