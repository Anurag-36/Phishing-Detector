# Phishing Detector

Phishing Detector is a Chrome extension for identifying suspicious websites using rule-based signals and optional reputation checks. It stays lightweight, explains why a page is flagged, and avoids storing secrets in the repository.

## Table of Contents

- [About The Project](#about-the-project)
- [Built With](#built-with)
- [Getting Started](#getting-started)
- [How It Works](#how-it-works)
- [Security Notes](#security-notes)

## About The Project

The extension evaluates a page by looking at URL patterns, DOM behavior, SSL usage, and reputation data. It runs locally in the browser by default, with an optional Node.js proxy for Google Safe Browsing lookups if you want to add one later.

## Built With

- JavaScript
- HTML
- CSS
- Chrome Extension Manifest V3
- Node.js and Express.js for the optional proxy server

## Getting Started

### Prerequisites

- Chrome or another Chromium-based browser
- Node.js 18+ if you plan to use the optional proxy server

### Install the Extension

1. Open `chrome://extensions/`.
2. Turn on Developer mode.
3. Click Load unpacked and select this project folder.
4. Open a website and review the risk score from the popup.

### Optional Proxy Server

If you want server-side reputation checks, create a local `.env` file from the template and install the server dependencies. Keep your API key on your machine only.

```bash
cd server
copy .env.example .env
npm install
npm start
```

## How It Works

The extension combines a few simple checks:

1. URL analysis for suspicious patterns, IP hosts, and common phishing keywords.
2. DOM and HTML inspection for forms, scripts, iframes, and hidden elements.
3. SSL checks to highlight insecure or unusual connections.
4. Reputation checks through the optional proxy server or local fallbacks.
5. A scoring engine that turns the findings into a readable risk level.

## Security Notes

- API keys are not committed to the repository.
- Local `.env` files are ignored by git.
- The server template contains placeholders only.

## Project Files

- `manifest.json` - Extension manifest
- `background.js` - Service worker
- `content_script.js` - Page data collection
- `popup.html`, `popup.js`, `popup.css` - Popup UI
- `scripts/` - Analysis and scoring logic
- `server/` - Optional proxy server
