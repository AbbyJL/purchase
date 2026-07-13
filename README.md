# Woodgrain Ops

A bilingual admin starter for Cloudflare Pages + Workers + D1 + R2.

## Features

- Contract management
- Product management
- Order management
- Chinese / English toggle
- Wood-inspired visual system
- Cloudflare Functions examples for API expansion

## Local development

```bash
npm install
npm run dev
```

## Cloudflare deployment

- Build output: `dist`
- Host on Cloudflare Pages
- Add D1 for structured business data
- Add R2 for contracts, images, and attachments
- Sample images upload through `/api/uploads` and are served back from R2

Before deploying application code, apply the D1 migrations with an authenticated Wrangler session:

```bash
npm run typecheck
npm run build
npx wrangler d1 migrations apply woodgrain_ops --remote
npx wrangler pages deploy dist --project-name woodgrain-ops
```

The production build runs TypeScript validation first. Do not deploy a new Functions bundle before its matching D1 migrations have completed.
