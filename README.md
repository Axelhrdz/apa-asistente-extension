# APA Asistente

Monorepo: **Chrome extension** (`extension/`) + **Express API** (`backend/`) + **Vite frontend** (`frontend/`).

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
│       ├── background/      # Service worker (API + messaging)
│       ├── content/         # Per-page / per-feature scripts
│       └── lib/             # API client, message types
├── frontend/                # Vite multi-page app (dev :5173)
│   ├── index.html           # Form → cuenta.html?clave=
│   ├── cuenta.html          # “Informacion de cuenta” (extension hints here)
│   └── src/
│       ├── lib/             # Small helpers (URL params, etc.)
│       └── pages/           # Page controllers
└── package.json             # npm workspaces (root scripts)
```

## Commands

- **API (dev):** `npm run dev:api` from the repo root (or `cd backend && npm run dev`).
- **Web (dev):** `npm run dev:web` — open `http://localhost:5173/`, submit clave, land on `cuenta.html`.
- **Extension:** Chrome → Extensions → Load unpacked → select the `extension/` folder (reload after changes).

## Branch workflow

Active development on `account-hints` (merge to `dev`, then `main` when ready).
