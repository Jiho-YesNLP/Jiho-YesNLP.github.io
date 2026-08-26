---
layout: concept_map
permalink: /cm/
title: concept map
description: A searchable map of the concepts I want to remember.
nav: false
---

<div class="cm-page" id="cm-wrap" data-source="{{ '/assets/json/concepts.json' | relative_url }}">
  <header class="cm-top">
    <div class="cm-search">
      <p class="cm-search-title">What do you want to remember?</p>
      <div class="cm-search-box">
        <i class="fa-solid fa-magnifying-glass"></i>
        <input id="cm-input" type="text" autocomplete="off" placeholder="Loading concepts…" disabled aria-label="Search concepts">
        <button id="cm-clear" class="cm-search-clear" type="button" aria-label="Clear search">&times;</button>
      </div>
      <p class="cm-hint">Drag to pan, scroll to zoom, click a node to open it. <kbd>Esc</kbd> returns to the start.</p>
    </div>
  </header>

  <div class="cm-main">
    <div class="cm-stage" id="cm-stage">
      <canvas id="cm-canvas"></canvas>
      <!-- Covers the graph while a concept is open; the canvas keeps its size. -->
      <div class="cm-viewer" id="cm-viewer">
        <button class="cm-viewer-close" id="cm-viewer-close" type="button" aria-label="Close concept">&times;</button>
        <div class="cm-viewer-inner" id="cm-viewer-inner"></div>
      </div>
    </div>
    <aside class="cm-panel" aria-live="polite">
      <div class="cm-panel-head" id="cm-panel-head"></div>
      <div class="cm-panel-body" id="cm-panel-body"></div>
    </aside>
  </div>
</div>
