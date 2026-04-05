/**
 * CAUgen — Domain / Brand Name Generator
 * Pure client-side: no API calls.
 * Real availability check is a Phase 5 stub.
 *
 * Usage:
 *   import { generateDomains } from './services/domaingen';
 *   const results = generateDomains({ name: 'nova', keyword: 'design', vibe: 'startup' });
 */

// ─── Config ───────────────────────────────────────────────────

const TLDS = {
  startup:   ['.io','.ai','.co','.app','.dev','.xyz'],
  brand:     ['.com','.co','.net','.org','.shop'],
  creative:  ['.design','.studio','.art','.media','.works'],
  tech:      ['.dev','.ai','.io','.tech','.cloud'],
  minimal:   ['.co','.io','.me','.is','.do'],
};

const BRAND_PREFIXES = ['get','try','use','go','hey','the','my','hi','join','meet'];
const BRAND_SUFFIXES = ['hq','labs','app','hub','co','io','ai','base','core','works'];

const VIBE_WORDS = {
  startup:  ['launch','grow','build','scale','ship','push','move','boost'],
  brand:    ['craft','forge','make','form','shape','design','studio','create'],
  creative: ['nova','spark','pulse','flash','bloom','glow','wave','flow'],
  tech:     ['stack','cloud','byte','data','core','sys','api','node'],
  minimal:  ['dot','one','base','hub','spot','zone','point','edge'],
};

// ─── Utils ────────────────────────────────────────────────────

function clean(str) { return (str||'').toLowerCase().replace(/[^a-z0-9]/g,''); }

function scoreDomain(name) {
  let s = 0;
  const len = name.length;
  if (len >= 4 && len <= 10) s += 40;
  else if (len >= 3 && len <= 14) s += 20;
  if (!/[^a-z0-9-]/.test(name)) s += 20; // valid chars only
  const alpha = name.replace(/[^a-z]/g,'');
  const vr = alpha.length ? (alpha.match(/[aeiou]/g)||[]).length/alpha.length : 0;
  if (vr >= 0.2 && vr <= 0.6) s += 20;
  s += Math.min(20, new Set(name).size * 2);
  return Math.round(Math.min(100, s));
}

// ─── Pattern builders ─────────────────────────────────────────

function buildNames(name, keyword, vibe) {
  const n  = clean(name);
  const kw = clean(keyword||'');
  const vw = VIBE_WORDS[vibe] || VIBE_WORDS.startup;
  const out = new Set();

  // Base
  out.add(n);
  if (kw) { out.add(`${n}${kw}`); out.add(`${kw}${n}`); }

  // Prefix combos
  for (const p of BRAND_PREFIXES.slice(0,4)) {
    out.add(`${p}${n}`);
    if (kw) out.add(`${p}${kw}`);
  }

  // Suffix combos
  for (const s of BRAND_SUFFIXES.slice(0,4)) {
    out.add(`${n}${s}`);
    if (kw) out.add(`${kw}${s}`);
  }

  // Vibe word combos
  for (const v of vw.slice(0,4)) {
    out.add(`${n}${v}`);
    out.add(`${v}${n}`);
    if (kw) out.add(`${kw}${v}`);
  }

  // Keyword + vibe
  if (kw) {
    for (const v of vw.slice(0,2)) {
      out.add(`${v}${kw}`);
    }
  }

  return [...out].filter(s => s.length >= 3 && s.length <= 16);
}

// ─── Main export ──────────────────────────────────────────────

/**
 * @param {{
 *   name: string,
 *   keyword?: string,
 *   vibe?: 'startup'|'brand'|'creative'|'tech'|'minimal'
 * }} input
 * @returns {{
 *   domain: string,
 *   name: string,
 *   tld: string,
 *   type: string,
 *   score: number,
 *   available: 'unknown'  // Phase 5: real RDAP check
 * }[]}
 */
export function generateDomains({ name='', keyword='', vibe='startup' } = {}) {
  if (!name.trim()) return [];

  const names = buildNames(name, keyword, vibe);
  const tlds  = TLDS[vibe] || TLDS.startup;
  const seen  = new Set();
  const results = [];

  // Priority: .com first for all names
  for (const n of names.slice(0,8)) {
    const domain = `${n}.com`;
    if (!seen.has(domain)) {
      seen.add(domain);
      results.push({ domain, name:n, tld:'.com', type:'brandable', score:scoreDomain(n), available:'unknown' });
    }
  }

  // Then vibe-specific TLDs
  for (const n of names) {
    for (const tld of tlds) {
      if (results.length >= 24) break;
      const domain = `${n}${tld}`;
      if (!seen.has(domain)) {
        seen.add(domain);
        results.push({ domain, name:n, tld, type:vibe, score:scoreDomain(n), available:'unknown' });
      }
    }
    if (results.length >= 24) break;
  }

  return results.sort((a,b)=>b.score-a.score).slice(0,20);
}
