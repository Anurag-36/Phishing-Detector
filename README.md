# Phishing Detector

A Chrome extension for fast, explainable phishing detection. It scores pages using URL patterns, DOM signals, SSL checks, and optional reputation lookups without storing secrets in GitHub.

## What It Does

- Flags suspicious URLs, forms, scripts, and iframe patterns.
- Produces a clear risk score with reasons instead of a black-box label.
- Works locally out of the box.
- Uses an optional Node.js proxy only when you add your own private API key locally.

## Requirements

- Chrome or any Chromium-based browser
- Node.js 18+ only if you want to run the optional proxy server

## Quick Start

1. Open `chrome://extensions/`.
2. Enable Developer mode.
3. Click Load unpacked and select this folder.
4. Open a site, click the extension, and review the score.

## Optional Proxy Setup

If you want Google Safe Browsing support, create a local env file from the template and keep it out of GitHub:

```bash
cd server
copy .env.example .env
npm install
npm start
```

The server reads secrets from `server/.env` only. Do not commit that file.

## Project Layout

- `manifest.json` - Extension manifest
- `background.js` - Service worker orchestration
- `content_script.js` - Page data collection
- `popup.html`, `popup.js`, `popup.css` - UI
- `scripts/` - Analysis and scoring logic
- `server/` - Optional proxy server
- `Req_extracted.txt` - Extracted requirements reference

## Security

- No API keys are stored in the repository.
- Sensitive values belong in local `.env` files only.
- The repo ignores root `.env` files and `server/.env`.

## License

Provided as-is for educational and practical use.
