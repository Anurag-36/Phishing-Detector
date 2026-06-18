import { SHORTENERS, SUSPICIOUS_KEYWORDS } from '../utils/constants.js';

export function analyzeUrl(url) {
  try {
    const u = new URL(url);
    const hostname = u.hostname;
    const path = u.pathname + u.search + u.hash;
    const result = {};
    result.length = url.length;
    result.protocol = u.protocol.replace(':','');
    result.hostname = hostname;
    result.isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
    result.subdomainCount = hostname.split('.').length - 2;
    result.suspiciousKeywords = SUSPICIOUS_KEYWORDS.filter(k => url.toLowerCase().includes(k));
    result.hasAt = url.includes('@');
    result.doubleSlash = /\/\/.+\//.test(url.replace(u.protocol+'//',''));
    result.usesShortener = SHORTENERS.some(s => hostname.toLowerCase().endsWith(s));
    result.hyphenCount = (hostname.match(/-/g) || []).length;
    return result;
  } catch (e) {
    return { error: 'invalid_url' };
  }
}
