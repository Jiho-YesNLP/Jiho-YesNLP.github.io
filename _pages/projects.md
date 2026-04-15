---
layout: page
title: projects
permalink: /projects/
description: Research projects in NLP, IR, and AI in Education.
nav: true
nav_order: 3
display_categories: [current, past]
---

<!-- pages/projects.md -->
<div class="projects">
{% if site.enable_project_categories and page.display_categories %}
  {% for category in page.display_categories %}
  <a id="{{ category }}" href=".#{{ category }}">
    <h2 class="category">{{ category }}</h2>
  </a>
  {% assign categorized_projects = site.projects | where: "category", category %}
  {% assign sorted_projects = categorized_projects | sort: "importance" %}
  {% for project in sorted_projects %}
    {% include projects_list.liquid %}
  {% endfor %}
  {% endfor %}
{% else %}
  {% assign sorted_projects = site.projects | sort: "importance" %}
  {% for project in sorted_projects %}
    {% include projects_list.liquid %}
  {% endfor %}
{% endif %}
</div>
