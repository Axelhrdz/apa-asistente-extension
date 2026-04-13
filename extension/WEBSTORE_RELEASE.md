# Chrome Web Store Release Notes

## 1) Set the production API URL

Confirm `src/lib/constants.js` points to your real Render URL.

Example:

`https://apa-asistente-api.onrender.com`

## 2) Package extension zip

From repo root:

`npm run pack:extension`

Zip output:

`release/apa-asistente-extension-v0.1.1.zip`

## 3) Upload to Chrome Web Store

- Go to <https://chrome.google.com/webstore/devconsole>
- New Item -> upload the generated zip
- Fill listing metadata (name, description, screenshots, privacy policy)
- Submit for review

## 4) For future updates

- Bump version in `manifest.json` and `extension/package.json`
- Re-run `npm run pack:extension`
- Upload new zip as an update
