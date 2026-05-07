# my-portfolio

**Production**: `https://my-portfolio-blond-ten-56.vercel.app`

Personal portfolio site showcasing selected projects, experience, and writing — built with a modern Next.js stack and MDX content.

![Portfolio preview](public/images/og/home.jpg)

## Overview

- Clean, responsive portfolio with a Projects section powered by MDX.
- Blog + RSS feed, OG image generation endpoints, and SEO-friendly routing.
- Deployed on Vercel with CI/CD (auto-deploy on push).

## Tech stack

- Next.js (App Router)
- React + TypeScript
- MDX (project + blog content)
- Once UI (`@once-ui-system/core`)
- ESLint (Next.js) + Biome (formatting)
- Vercel (hosting)

## Links

- GitHub: `https://github.com/Magret1730`
- LinkedIn: `https://www.linkedin.com/in/magretabiodun/`

## Local development

### Prerequisites

- Node.js 18.17+

### Install

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Open `http://localhost:3000`.

### Production build (local)

```bash
npm run build
npm run start
```