# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML/CSS personal portfolio website for Srikur Kanuparthy, hosted on GitHub Pages. The runtime site has no JavaScript frameworks—just plain HTML/CSS with a tiny theme-toggle script.

## Deployment

The site deploys automatically via GitHub Actions when changes are pushed to `main`. The workflow runs `build.py` to render markdown posts into HTML, then uploads `public/` to GitHub Pages.

**To deploy:** Push changes to `main`. To preview locally, run `python3 build.py` (requires `pip install markdown`).

## Architecture

```
markdown/         # Source of truth for blog posts
├── chip-8.md     # Each file has YAML frontmatter (title, date, slug, draft?)
└── ...
build.py          # Renders markdown/*.md → public/posts/*.html and
                  # rewrites the Blog section of public/index.html
public/           # Web root (this directory is deployed)
├── index.html    # Homepage; blog list lives between <!-- POSTS_START --> markers
├── css/styles.css
├── posts/        # Generated HTML (overwritten by build.py)
└── images/
```

To add a post: create `markdown/<slug>.md` with frontmatter and write the article in markdown. The build script picks it up automatically. Set `draft: true` to keep a post out of the published site.

## Styling Conventions

- Max container width: 650px
- Mobile breakpoint: 600px
- Code blocks: Dark background (#1e1e1e) with syntax highlighting classes
- System font stack with `-apple-system` as primary
