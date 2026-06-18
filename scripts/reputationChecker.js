import { STORAGE_KEYS, OPENPHISH_FEED, CRTSH_ENDPOINT } from '../utils/constants.js';

const SERVER_PROXY = ''; // Change to your deployed server URL

async function checkServerReputation(url) {
  try {
    const res = await fetch(`${SERVER_PROXY}/api/check/reputation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    if (!res.ok) throw new Error('Server returned ' + res.status);
    const data = await res.json();
    return {
      blacklisted: data.gsb?.blacklisted || data.openphish?.blacklisted,
      provider: 'server_proxy',
      gsb: data.gsb,
      openphish: data.openphish,
      crt: data.crt,
      cached: data.cached
    };
  } catch (e) {
    console.warn('Server proxy unavailable, falling back to local checks:', e.message);
    return null;
  }
}

async function fetchOpenPhish() {
  try {
    const res = await fetch(OPENPHISH_FEED);
    if (!res.ok) return null;
    const txt = await res.text();
    const entries = txt.split(/\r?\n/).filter(Boolean);
    return new Set(entries);
  } catch (e) {
    console.error('OpenPhish fetch failed', e);
    return null;
  }
}

async function checkCrtSh(domain) {
  try {
    const url = `${CRTSH_ENDPOINT}${encodeURIComponent(domain)}&output=json`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data && data.length ? data : null;
  } catch (e) {
    console.error('crt.sh lookup failed', e);
    return null;
  }
}

export async function checkReputation(url) {
  // Cache lookup
  const cache = await chrome.storage.local.get(STORAGE_KEYS.REPUTATION_CACHE);
  const map = cache[STORAGE_KEYS.REPUTATION_CACHE] || {};
  if (map[url]) return map[url];

  let result = { blacklisted: false, provider: 'none', raw: null, openphishHit: false, crt: null };

  // Try server proxy first (includes GSB + OpenPhish + crt.sh)
  const serverResult = await checkServerReputation(url);
  if (serverResult) {
    result = {
      blacklisted: serverResult.blacklisted,
      provider: serverResult.provider,
      gsb: serverResult.gsb,
      openphish: serverResult.openphish,
      crt: serverResult.crt,
      cached: serverResult.cached
    };
    map[url] = result;
    await chrome.storage.local.set({ [STORAGE_KEYS.REPUTATION_CACHE]: map });
    return result;
  }

  // Fallback: local checks (if server unavailable)
  try {
    const u = new URL(url);
    const domain = u.hostname.replace(/^www\./, '');

    const openphishSet = await fetchOpenPhish();
    if (openphishSet) {
      for (const entry of openphishSet) {
        if (entry.includes(domain) || entry.includes(u.href)) {
          result.openphishHit = true;
          break;
        }
      }
      if (result.openphishHit) {
        result.blacklisted = true;
        result.provider = 'openphish_local';
      }
    }

    const crt = await checkCrtSh(domain);
    if (crt) {
      result.crt = crt;
    }
  } catch (e) {
    console.error('reputation check failed', e);
  }

  map[url] = result;
  await chrome.storage.local.set({ [STORAGE_KEYS.REPUTATION_CACHE]: map });
  return result;
}
