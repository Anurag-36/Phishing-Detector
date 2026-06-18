import { analyzePage } from './scripts/engine.js';

chrome.runtime.onInstalled.addListener(() => {
  console.log('Phishing Detector installed');
});

// Listen for requests from popup or content scripts
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg && msg.type === 'ANALYZE_PAGE') {
        const tab = sender.tab || (await chrome.tabs.get(msg.tabId));
        // If content provided page data, use it; otherwise request it
        let page = msg.page;
        if (!page) {
          try {
            const response = await chrome.tabs.sendMessage(tab.id, { type: 'COLLECT_PAGE' });
            page = response && response.page ? response.page : null;
          } catch (collectError) {
            console.warn('Falling back to URL-only analysis:', collectError?.message || collectError);
          }
        }
        if (!page && tab && tab.url) {
          try {
            const parsedUrl = new URL(tab.url);
            page = {
              url: tab.url,
              hostname: parsedUrl.hostname,
              protocol: parsedUrl.protocol.replace(':', '')
            };
          } catch (urlError) {
            page = { url: tab.url };
          }
        }
        const report = await analyzePage(page);
        sendResponse({ report });
      }
    } catch (e) {
      console.error(e);
      sendResponse({ error: e.message || String(e) });
    }
  })();
  return true; // indicate we'll respond asynchronously
});
