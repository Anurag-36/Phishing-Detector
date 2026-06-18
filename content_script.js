// Collect page data for analysis
function collectPageData() {
  const url = window.location.href;
  const hostname = window.location.hostname;
  const protocol = window.location.protocol.replace(':','');
  const html = document.documentElement ? document.documentElement.outerHTML : '';
  const forms = Array.from(document.forms).map(f => ({
    action: f.action || '',
    method: f.method || 'get',
    inputs: Array.from(f.querySelectorAll('input,textarea,select')).map(i => ({
      type: i.type || i.tagName.toLowerCase(),
      name: i.name || '',
      hidden: (i.offsetParent === null) || (getComputedStyle(i).display === 'none') || (getComputedStyle(i).visibility === 'hidden')
    }))
  }));
  const scripts = Array.from(document.scripts).map(s => s.src || 'inline');
  const links = Array.from(document.querySelectorAll('a')).map(a => a.href || '');
  const iframes = Array.from(document.querySelectorAll('iframe')).map(i => i.src || '');
  const inputs = Array.from(document.querySelectorAll('input')).map(i => ({type: i.type, name: i.name}));
  return { url, hostname, protocol, html, forms, scripts, links, iframes, inputs };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'GET_SELECTION') {
    const selection = window.getSelection ? window.getSelection().toString() : '';
    sendResponse({ selection });
  }
  if (msg && msg.type === 'COLLECT_PAGE') {
    sendResponse({ page: collectPageData() });
  }
});
