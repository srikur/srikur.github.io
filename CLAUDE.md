# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML/CSS personal portfolio website for Srikur Kanuparthy, hosted on GitHub Pages. The site has zero dependencies—no JavaScript, no build tools, no frameworks.

## Deployment

The site deploys automatically via GitHub Actions when changes are pushed to the `main` branch. The workflow uploads the `public/` directory to GitHub Pages.

**To deploy:** Simply push changes to `main`. No build commands needed.

## Architecture

```
public/           # Web root (this directory is deployed)
├── index.html    # Homepage with profile, projects, and blog links
├── css/
│   └── styles.css
├── posts/        # Blog articles as standalone HTML files
└── images/
```

All content lives in `public/`. Each blog post is a self-contained HTML file that includes its own styles for code blocks and article-specific formatting inline or via the shared stylesheet.

## Styling Conventions

- Max container width: 650px
- Mobile breakpoint: 600px
- Code blocks: Dark background (#1e1e1e) with syntax highlighting classes
- System font stack with `-apple-system` as primary
