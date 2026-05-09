# Learning Portfolio (Cursor AI Workflow)

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://cursor-magret-portfolio.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)](https://nextjs.org/)

**Live demo (Vercel)**: `https://cursor-magret-portfolio.vercel.app`  
**Main portfolio**: `https://magret.ca` (professional site)

## Overview

This repository contains a polished portfolio site built as a **learning + iteration project** while exploring **Cursor AI-assisted development workflows**. It demonstrates modern frontend patterns (Next.js App Router, TypeScript, MDX content) and an iterative approach to UI/UX refinement with AI in the loop.

If you're looking for my primary professional portfolio, visit `https://magret.ca`.

## Tech stack

- Next.js (App Router)
- React + TypeScript
- Once UI (`@once-ui-system/core`)
- MDX (projects/posts as content)
- Vercel (deployments + Git integration)

## Features

- Projects rendered from MDX (`src/app/work/projects/*.mdx`)
- Dynamic case study pages under `/work/[slug]`
- Open Graph image + favicon routes (`/opengraph-image`, `/icon`)
- Responsive header/navigation + theme switching
- API routes for OG/RSS utilities

## Project structure (high level)

- `src/app/`: Next.js routes (App Router)
- `src/components/`: UI components (header, footer, cards, etc.)
- `src/resources/`: site content/config (person, routes, style tokens)
- `public/`: static assets (images)

## Local development

### Prerequisites

- Node.js 18.17+

### Install

```bash
npm install
```

### Run

```bash
npm run dev
```

Open `http://localhost:3000`.

### Build (local)

```bash
npm run build
npm run start
```

## Deployment (Vercel)

- Connected to GitHub for auto-deploys on push to `main`
- Production: `https://my-portfolio-blond-ten-56.vercel.app`

## Screenshots

- _TODO: Add screenshots/gifs (Home, Work, About, Project detail)_

## What I explored with Cursor

- AI-assisted iteration loops for UI polish (typography, motion, accessibility)
- Debugging production-only issues (case-sensitive assets on Linux/Vercel)
- Tight, reviewable commits for incremental improvements
- Using generated OG assets to keep branding consistent

## Future improvements

- Replace remaining demo content with original writing (Blog/Gallery)
- Add automated checks (format/lint) aligned to the chosen toolchain
- Add screenshots and a short changelog

## Contact / links

- Main portfolio: `https://magret.ca`
- GitHub: `https://github.com/Magret1730`
- LinkedIn: `https://www.linkedin.com/in/oyedele-abiodun/`