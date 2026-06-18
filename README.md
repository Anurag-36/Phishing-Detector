# Phishing Detector

Phishing Detector is a Chrome extension that helps users spot suspicious websites quickly. It looks at URL structure, page content, SSL usage, and optional reputation checks, then returns a risk score with a short explanation.

## Overview

The extension is designed to be lightweight and easy to understand. It runs locally in the browser by default and can connect to an optional Node.js proxy if you want Google Safe Browsing support.

## Requirements

- Chrome or another Chromium-based browser
- Node.js 18+ for the optional proxy server

## Run Locally

1. Open `chrome://extensions/`.
2. Turn on Developer mode.
3. Select Load unpacked and choose this project folder.
4. Open a website and use the extension to review the score.

## Optional Proxy Server

To enable server-side reputation checks, install the server dependencies and create a local `.env` file from the provided template. Keep your API key out of GitHub and store it only in your local environment.

```bash
cd server
copy .env.example .env
npm install
npm start
```

## Project Files

- `manifest.json` - Extension manifest
- `background.js` - Service worker
- `content_script.js` - Page data collection
- `popup.html`, `popup.js`, `popup.css` - Popup interface
- `scripts/` - Analysis and scoring logic
- `server/` - Optional proxy server

## Security Notes

- API keys are not stored in the repository.
- Local `.env` files are ignored by git.
- The server template uses placeholders only.

## License

Provided as-is for educational and practical use.
