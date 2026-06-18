import { analyzeUrl } from './urlAnalyzer.js';
import { analyzeHtml } from './htmlAnalyzer.js';
import { analyzeSsl } from './sslChecker.js';
import { checkReputation } from './reputationChecker.js';
import { scoreFeatures } from './scoringEngine.js';

export async function analyzePage(page) {
  if (!page) return { error: 'no_page' };
  const urlInfo = analyzeUrl(page.url);
  const htmlInfo = analyzeHtml(page);
  const sslInfo = analyzeSsl(page);
  const rep = await checkReputation(page.url);
  const scored = scoreFeatures({ url: urlInfo, html: htmlInfo, ssl: sslInfo, reputation: rep });
  return { urlInfo, htmlInfo, sslInfo, reputation: rep, scoring: scored };
}
