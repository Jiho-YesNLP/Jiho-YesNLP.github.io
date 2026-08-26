---
layout: concept_map
permalink: /cm/
title: concept map
description: A searchable map of the concepts I want to remember.
nav: false
---

<link rel="stylesheet" href="{{ '/assets/css/concept-map.css' | relative_url }}">

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
    </div>
    <aside class="cm-panel" aria-live="polite">
      <div class="cm-panel-head" id="cm-panel-head"></div>
      <div class="cm-panel-body" id="cm-panel-body"></div>
    </aside>
  </div>
</div>

<script src="{{ '/assets/js/concept-map.js' | relative_url }}" defer></script>
