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

## Docker (extension API + Mongo + Caddy)

Prerequisites: `mern_internal` network exists (`~/mern-hosting-setup/stack` with Mongo + Caddy is up).

1. **Env:** copy `backend/.env.example` → `backend/.env` and set `MONGODB_URI` to the same root user as the MERN stack, with database `apa_asistente_extension`, e.g.  
   `mongodb://admin:PASSWORD@mongo:27017/apa_asistente_extension?authSource=admin`

2. **Start the API container:**

   ```bash
   cd ~/apps/apa-asistente-extension
   docker compose up -d --build
   ```

3. **Caddy** (in `~/mern-hosting-setup/stack/Caddyfile`) proxies **`/extension-api/*`** → `apa-extension-api:3001`. After editing Caddy, run:  
   `docker compose up -d --force-recreate caddy` in that `stack` directory.

4. **URLs (via Caddy only on the host)**  
   The API container does not publish a host port; use the MERN stack’s HTTP port + `/extension-api`, e.g.  
   `http://127.0.0.1:8080/extension-api/health` when `CADDY_HTTP_PORT=8080`.

5. **Chrome extension** uses `LOCAL_API_BASE` (`http://127.0.0.1:8080/extension-api` by default). If `CADDY_HTTP_PORT` is not 8080, edit `extension/src/lib/constants.js`. For remote/ngrok, set `PRODUCTION_API_BASE` to the same path layout (e.g. `https://<ngrok-host>/extension-api`).

6. **One-shot:** `bash ~/mern-hosting-setup/ensure-stacks.sh` brings up infra, main app, extension API, and recreates Caddy.

## Auto-Update for Unpacked Extension

Since this extension is loaded as an unpacked extension (not from Chrome Web Store), updates must be manually pulled from GitHub and reloaded in Chrome. The following scripts automate this process.

### macOS

1. **Install the auto-updater:**

   ```bash
   cd ~/path/to/apa-asistente-extension
   bash scripts/install-auto-update.sh
   ```

2. **What it does:**
   - Creates a LaunchAgent that runs every 15 minutes
   - Automatically pulls updates from the `docker` branch
   - Shows a macOS notification when updates are available
   - Logs all activity to `.auto-update.log`

3. **Manual operations:**
   - Check manually: `bash scripts/auto-update-extension.sh`
   - View logs: `tail -f .auto-update.log`
   - Uninstall: `bash scripts/uninstall-auto-update.sh`

### Windows

1. **Install the auto-updater:**

   - Navigate to `scripts/` folder in File Explorer
   - Right-click on `Install-AutoUpdate.bat` → **Run as administrator**

2. **What it does:**
   - Creates a Scheduled Task that runs every 15 minutes
   - Automatically pulls updates from the `docker` branch
   - Shows a Windows notification when updates are available
   - Logs all activity to `.auto-update.log`

3. **Manual operations:**
   - Check manually: Right-click `Auto-Update-Extension.ps1` → Run with PowerShell
   - View logs: Open `.auto-update.log` in the repo root
   - Uninstall: Right-click `Uninstall-AutoUpdate.bat` → Run as administrator

### Important Note

Even with auto-updates pulling code, you must still **manually reload** the extension in Chrome:

1. Open Chrome → `chrome://extensions`
2. Find "APA Asistente"
3. Click the **refresh icon** (⟳) or toggle off/on

The notification will remind you when it's time to reload.
