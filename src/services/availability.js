/**
 * CAUgen — Availability Service v2
 * GitHub live check + structured response format (instagram/domain = placeholders).
 * Cache: localStorage, 1hr TTL.
 */

const CACHE_KEY = 'caugen_avail_v2';
const TTL       = 3_600_000;

function readCache()  { try { return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}'); } catch { return {}; } }
function writeCache(c){ try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {} }

/**
 * Check a single username across all platforms.
 * Returns structured object — instagram/domain are stubs for Phase 5.
 *
 * @param {string} username
 * @returns {Promise<{ username, github, instagram, domain }>}
 */
export async function checkAvailability(username, timeoutMs = 5000) {
  if (!username) return { username, github:'unknown', instagram:'unknown', domain:'unknown' };

  // Cache check (keyed by username)
  const cache = readCache();
  const hit   = cache[username];
  if (hit && Date.now() - hit.ts < TTL) {
    return { username, github: hit.r, instagram: 'unknown', domain: 'unknown' };
  }

  // GitHub live check
  let github = 'unknown';
  try {
    const ctrl = new AbortController();
    const tid  = setTimeout(() => ctrl.abort(), timeoutMs);
    const res  = await fetch(`https://api.github.com/users/${username}`, {
      signal: ctrl.signal,
      headers: { Accept: 'application/vnd.github.v3+json', 'X-GitHub-Api-Version': '2022-11-28' },
    });
    clearTimeout(tid);
    github = res.status === 404 ? 'available'
           : res.status === 200 ? 'taken'
           : 'unknown';

    // Write to cache
    const c    = readCache();
    c[username] = { r: github, ts: Date.now() };
    const keys = Object.keys(c);
    if (keys.length > 300) {
      keys.sort((a,b)=>(c[a].ts||0)-(c[b].ts||0)).slice(0,100).forEach(k=>delete c[k]);
    }
    writeCache(c);
  } catch { /* timeout or network error — github stays 'unknown' */ }

  return {
    username,
    github,
    instagram: 'unknown',  // Phase 5: scraping/API
    domain:    'unknown',  // Phase 5: RDAP
  };
}

/** Legacy shim — used by existing AvailBadge components */
export async function checkGitHub(username, timeoutMs = 5000) {
  const result = await checkAvailability(username, timeoutMs);
  return result.github;
}

/** Clear full cache */
export function clearAvailCache() { try { localStorage.removeItem(CACHE_KEY); } catch {} }

/** Cache stats */
export function availCacheStats() {
  const c    = readCache();
  const keys = Object.keys(c);
  const now  = Date.now();
  return {
    total: keys.length,
    fresh: keys.filter(k => c[k].ts && now - c[k].ts < TTL).length,
  };
}
