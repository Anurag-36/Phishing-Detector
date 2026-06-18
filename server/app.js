require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// SECURITY: API key MUST be set in .env; no fallback to prevent key exposure
const GOOGLE_SAFE_BROWSING_API_KEY = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
if (!GOOGLE_SAFE_BROWSING_API_KEY) {
  console.error('ERROR: GOOGLE_SAFE_BROWSING_API_KEY not set in .env');
  console.error('Create .env file with: GOOGLE_SAFE_BROWSING_API_KEY=your_key_here');
  process.exit(1);
}

const GSB_ENDPOINT = 'https://safebrowsing.googleapis.com/v4/threatMatches:find?key=';

// Cache for reputation results (in-memory; use Redis for production)
const cache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

function getCacheKey(url) {
  return `reputation_${url}`;
}

async function checkGoogleSafeBrowsing(url) {
  try {
    const payload = {
      client: { clientId: 'phishing-detector', clientVersion: '1.0' },
      threatInfo: {
        threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
        platformTypes: ['ANY_PLATFORM'],
        threatEntryTypes: ['URL'],
        threatEntries: [{ url }]
      }
    };
    const res = await axios.post(GSB_ENDPOINT + GOOGLE_SAFE_BROWSING_API_KEY, payload, { timeout: 5000 });
    const matches = res.data && res.data.matches;
    return {
      blacklisted: matches && matches.length > 0,
      provider: 'google_safe_browsing',
      matches: matches || []
    };
  } catch (e) {
    console.error('GSB check failed:', e.message);
    return { blacklisted: false, provider: 'google_safe_browsing', error: e.message };
  }
}

async function checkOpenPhish(url) {
  try {
    const res = await axios.get('https://openphish.com/feed.txt', { timeout: 5000 });
    const entries = res.data.split(/\r?\n/).filter(Boolean);
    const isMatch = entries.some(e => url.includes(e.split('/')[2]) || e.includes(new URL(url).hostname));
    return { blacklisted: isMatch, provider: 'openphish' };
  } catch (e) {
    console.error('OpenPhish check failed:', e.message);
    return { blacklisted: false, provider: 'openphish', error: e.message };
  }
}

async function checkCrtSh(domain) {
  try {
    const res = await axios.get(`https://crt.sh/?q=${encodeURIComponent(domain)}&output=json`, { timeout: 5000 });
    return { crt_entries: res.data ? res.data.length : 0, data: res.data };
  } catch (e) {
    console.error('crt.sh check failed:', e.message);
    return { crt_entries: 0, error: e.message };
  }
}

// Endpoint: check reputation of a URL
app.post('/api/check/reputation', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'url required' });

  const cacheKey = getCacheKey(url);
  if (cache[cacheKey] && Date.now() - cache[cacheKey].timestamp < CACHE_TTL) {
    return res.json({ ...cache[cacheKey].data, cached: true });
  }

  try {
    const u = new URL(url);
    const domain = u.hostname.replace(/^www\./, '');
    const [gsb, openphish, crt] = await Promise.all([
      checkGoogleSafeBrowsing(url),
      checkOpenPhish(url),
      checkCrtSh(domain)
    ]);
    const result = { gsb, openphish, crt, timestamp: Date.now() };
    cache[cacheKey] = { data: result, timestamp: Date.now() };
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'phishing-detector-proxy' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Phishing Detector Proxy running on port ${PORT}`);
  console.log(`Google Safe Browsing API Key configured: ${GOOGLE_SAFE_BROWSING_API_KEY ? 'YES' : 'NO'}`);
});
