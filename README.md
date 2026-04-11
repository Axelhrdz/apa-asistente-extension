# APA Asistente

Monorepo: **Chrome extension** (`extension/`) + **Express API** (`backend/`).

## Layout

```
apa-asistente-extension/
├── backend/                 # Node.js HTTP API
│   └── src/
│       ├── server.js        # Entry: listen on PORT
│       ├── app.js           # Express app, global middleware
│       ├── config/          # Environment and typed settings
│       ├── routes/          # HTTP route wiring (Express routers)
│       ├── controllers/     # Request/response handling (thin)
│       ├── services/        # Business rules
│       ├── repositories/    # Data access (MongoDB, etc.)
│       └── middleware/      # Cross-cutting (errors, async, auth later)
├── extension/               # Chrome extension (Manifest V3)
│   ├── manifest.json
│   └── src/
│       ├── background/      # Service worker
│       ├── content/         # Injected scripts (DOM, per feature)
│       └── lib/             # Shared client helpers (API, constants)
└── package.json             # npm workspaces (root scripts)
```

## Commands

- **API (dev):** `npm run dev:api` from the repo root (or `cd backend && npm run dev`).
- **Extension:** Chrome → Extensions → Load unpacked → select the `extension/` folder.

## Branch workflow

Active development on `account-hints` (merge to `dev`, then `main` when ready).
