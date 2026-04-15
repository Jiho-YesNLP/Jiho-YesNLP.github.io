# jiho.us — Personal Academic Website

Personal website of Jiho Noh, Assistant Professor of Computer Science at Kennesaw State University.
Built with [Jekyll](https://jekyllrb.com/) and the [al-folio](https://github.com/alshedivat/al-folio) theme, hosted on GitHub Pages at [jiho.us](https://jiho.us).

---

## Stack

- **Jekyll** — static site generator
- **al-folio** — academic Jekyll theme
- **GitHub Actions** — auto-builds and deploys on every push to `main`
- **GitHub Pages** — hosting
- **Custom domain** — `jiho.us` (configured via `CNAME`)

---

## Key Files

| Path | Purpose |
|---|---|
| `_config.yml` | Site-wide settings (name, email, social links, features) |
| `_pages/about.md` | Homepage bio |
| `_bibliography/papers.bib` | All publications (BibTeX) |
| `_news/` | News items (one `.md` file per item) |
| `_projects/` | Research project cards |
| `_pages/teaching.md` | Teaching page |
| `_data/cv.yml` | CV page content |
| `_sass/_themes.scss` | Color variables (teal/orange scheme) |
| `assets/img/prof_pic.jpg` | Profile photo |
| `assets/pdf/` | Paper PDFs |

---

## Local Preview

```bash
bundle exec jekyll serve
# open http://localhost:4000
```

## Deploy

Push to `main` — GitHub Actions handles the build and deployment automatically.

```bash
git add <files>
git commit -m "your message"
git push origin main
```

---

## Adding Content

**New paper** — add a BibTeX entry to `_bibliography/papers.bib`. Use `selected = {true}` to feature it on the homepage.

**New news item** — create `_news/announcement_N.md` with `date` and `inline` front matter.

**New project** — create `_projects/N_project.md` with `title`, `description`, `category` (current/past), and `importance`.
