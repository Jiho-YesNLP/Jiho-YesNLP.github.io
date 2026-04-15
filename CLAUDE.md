# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Personal academic website for Jiho Noh (jiho.us), built with Jekyll and the [al-folio](https://github.com/alshedivat/al-folio) theme. Hosted on GitHub Pages — pushing to `main` triggers automatic build and deploy via GitHub Actions (`.github/workflows/deploy.yml`).

## Local development

```bash
bundle exec jekyll serve
# open http://localhost:4000
```

No build step beyond `bundle install` is needed. `_site/` is the generated output — never edit it directly.

## Key content files

| File/Dir | What to edit |
|---|---|
| `_pages/about.md` | Homepage bio and profile settings |
| `_bibliography/papers.bib` | All publications (BibTeX). Use `selected = {true}` to feature on homepage. |
| `_news/announcement_N.md` | News items — front matter needs `date` and `inline: true` |
| `_projects/N_project.md` | Research project cards — front matter: `title`, `description`, `category` (current/past), `importance` |
| `_pages/teaching.md` | Teaching page |
| `_data/cv.yml` | CV page content |
| `_config.yml` | Site-wide settings (name, social links, feature flags, scholar config) |
| `_sass/_themes.scss` | Color variables — teal (`#4a9fc0`) primary, orange (`#e07840`) highlight |
| `assets/img/prof_pic.jpg` | Profile photo |
| `assets/pdf/` | Paper PDFs linked from bib entries |

## Architecture notes

- **Publications** are driven entirely by `_bibliography/papers.bib` via `jekyll-scholar`. The `scholar:` section in `_config.yml` controls author highlighting (`last_name: [Noh]`), grouping (by year, descending), and citation style (APA). Bib entries support extra fields (`abbr`, `pdf`, `code`, `arxiv`, `selected`, `bibtex_show`, `preview`) that control badge and link rendering in `_layouts/bib.liquid`.
- **Projects** use `category: current` or `category: past` for the two-tab layout on the projects page. `importance` controls ordering within each category (lower = higher priority).
- **News** items with `inline: true` render as one-liners on the homepage panel (max 5 shown, controlled by `announcements.limit` in `_config.yml`).
- **Theming** is light-only (`enable_darkmode: false` in `_config.yml`). CSS custom properties are defined in `_sass/_themes.scss` under `:root`.
- **Google Scholar ID** is `Gxps8DsAAAAJ` — used for Scholar citation badges on publications.
