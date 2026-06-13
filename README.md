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
