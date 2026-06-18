import { SUSPICIOUS_KEYWORDS } from '../utils/constants.js';

export function analyzeHtml(page) {
  const res = {};
  if (!page) return { error: 'no_page' };
  const { forms = [], scripts = [], links = [], iframes = [], html = '', hostname = '', url = '' } = page;
  const pageOrigin = (() => {
    try {
      return new URL(url).origin;
    } catch (e) {
      return '';
    }
  })();
  res.formCount = forms.length;
  res.formsWithPassword = forms.filter(f => f.inputs.some(i => i.type === 'password')).length;
  res.externalFormActions = forms
    .filter(f => f.action && f.action.length && !f.action.includes(hostname) && (!pageOrigin || !f.action.startsWith(pageOrigin)))
    .map(f => f.action);
  res.hiddenForms = forms.filter(f => f.inputs.some(i => i.hidden)).length;
  res.iframeCount = iframes.length;
  res.metaRefresh = /<meta[^>]+http-equiv=["']?refresh["']?/i.test(html);
  const js = html.match(/(eval\(|atob\(|unescape\(|document\.write\(|new Function\()/gi) || [];
  res.obfuscatedJsScore = js.length;
  res.externalScripts = scripts.filter(s => s && s !== 'inline' && (!pageOrigin || !s.startsWith(pageOrigin))).length;
  res.suspiciousKeywordsFound = SUSPICIOUS_KEYWORDS.filter(k => html.toLowerCase().includes(k));
  return res;
}
