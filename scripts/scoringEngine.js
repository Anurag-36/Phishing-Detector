export function scoreFeatures(features) {
  // features contain url, html, ssl, reputation
  let score = 0;
  const reasons = [];
  const f = features;
  if (f.ssl && f.ssl.isHttp) { score += 20; reasons.push('HTTP only'); }
  if (f.url) {
    if (f.url.isIp) { score += 30; reasons.push('IP address in hostname'); }
    if (f.url.length > 75) { score += 10; reasons.push('Long URL'); }
    if (f.url.suspiciousKeywords && f.url.suspiciousKeywords.length) { score += 10; reasons.push('Suspicious keyword'); }
    if (f.url.usesShortener) { score += 15; reasons.push('URL shortener'); }
    if (f.url.hyphenCount > 3) { score += 5; reasons.push('Many hyphens'); }
  }
  if (f.html) {
    if (f.html.externalFormActions && f.html.externalFormActions.length) { score += 25; reasons.push('External form submission'); }
    if (f.html.hiddenForms && f.html.hiddenForms > 0) { score += 15; reasons.push('Hidden form or inputs'); }
    if (f.html.iframeCount && f.html.iframeCount > 5) { score += 10; reasons.push('Many iframes'); }
    if (f.html.obfuscatedJsScore && f.html.obfuscatedJsScore > 0) { score += 15; reasons.push('Obfuscated JS'); }
  }
  if (f.reputation && f.reputation.blacklisted) { score = 100; reasons.push('Blacklisted by threat intelligence'); }
  if (score > 100) score = 100;
  const category = score <= 30 ? 'Safe' : score <= 60 ? 'Suspicious' : 'Likely Phishing';
  return { score, category, reasons };
}
