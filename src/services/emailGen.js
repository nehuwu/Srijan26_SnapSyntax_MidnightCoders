/**
 * CAUgen — Email Generator v2
 * Pattern-based, structured, scored output.
 */

const SERVICE_DOMAINS = {
  gmail:   ['gmail.com'],
  yahoo:   ['yahoo.com','ymail.com'],
  outlook: ['outlook.com','hotmail.com','live.com'],
  proton:  ['proton.me','pm.me'],
  custom:  ['hey.com','fastmail.com','duck.com','skiff.com','tutanota.com','zoho.com'],
};

const VIBE_WORDS = {
  business:  ['work','pro','office','biz','ops','co','corp','hq'],
  casual:    ['hi','hey','me','yo','real','just','im','the'],
  aesthetic: ['void','luna','neon','mist','neo','zen','aura','nova'],
};

const SEPARATORS = ['.','_','','-'];
const SHORT_NUMS  = ['01','02','07','99','21','42','404','007','x'];

function clean(str) { return (str||'').toLowerCase().replace(/[^a-z0-9]/g,''); }

function scoreEmail(local) {
  let s = 0;
  const len = local.length;
  if (len >= 6 && len <= 16) s += 30; else if (len >= 4 && len <= 20) s += 15;
  if (!/[._-]{2,}/.test(local)) s += 20;
  if (/[a-z]/.test(local)) s += 15;
  const alpha = local.replace(/[^a-z]/g,'');
  const vr = alpha.length ? (alpha.match(/[aeiou]/g)||[]).length/alpha.length : 0;
  if (vr >= 0.15 && vr <= 0.6) s += 20;
  if (/^[._-]|[._-]$/.test(local)) s -= 20;
  s += Math.min(15, new Set(local).size * 1.5);
  return Math.round(Math.min(100, Math.max(0, s)));
}

function buildPatterns(name, keyword, vibe) {
  const n  = clean(name);
  const kw = clean(keyword||'');
  const vw = VIBE_WORDS[vibe] || VIBE_WORDS.casual;
  const n3 = n.slice(0,3); const n4 = n.slice(0,4); const n5 = n.slice(0,5);
  const out = [];

  out.push({local:n, label:'name'});
  out.push({local:n4, label:'name-short'});

  for (const sep of SEPARATORS.slice(0,3)) {
    for (const v of vw.slice(0,3)) {
      out.push({local:`${n}${sep}${v}`, label:'name·vibe'});
      out.push({local:`${v}${sep}${n}`, label:'vibe·name'});
    }
  }

  if (kw) {
    for (const sep of SEPARATORS.slice(0,3)) {
      out.push({local:`${n}${sep}${kw}`,  label:'name·keyword'});
      out.push({local:`${kw}${sep}${n}`,  label:'keyword·name'});
      out.push({local:`${n3}${sep}${kw}`, label:'name3·keyword'});
    }
    for (const num of SHORT_NUMS.slice(0,3)) out.push({local:`${n}${kw}${num}`, label:'n·kw·num'});
    out.push({local:`${n}.${kw}.${SHORT_NUMS[0]}`, label:'n.kw.num'});
  }

  for (const num of SHORT_NUMS.slice(0,5)) {
    out.push({local:`${n}${num}`,  label:'name·num'});
    out.push({local:`${n4}${num}`, label:'name4·num'});
  }

  for (const v of vw.slice(0,4)) {
    out.push({local:`${v}${n3}`,  label:'vibe·n3'});
    out.push({local:`${n5}.${v}`, label:'n5.vibe'});
  }

  return out;
}

export function generateEmails({ name='', service='gmail', vibe='casual', keyword='' } = {}) {
  if (!name.trim()) return [];
  const domains  = SERVICE_DOMAINS[service] || SERVICE_DOMAINS.gmail;
  const patterns = buildPatterns(name, keyword, vibe);
  const seen = new Set(); const results = [];

  for (const {local, label} of patterns) {
    if (!local || local.length < 3 || local.length > 20) continue;
    if (/[._-]{2,}/.test(local) || /^[._-]|[._-]$/.test(local)) continue;
    for (const domain of domains) {
      const email = `${local}@${domain}`;
      if (seen.has(email)) continue;
      seen.add(email);
      results.push({ email, localPart:local, domain, score:scoreEmail(local), pattern:label });
      if (results.length >= 24) break;
    }
    if (results.length >= 24) break;
  }
  return results.sort((a,b)=>b.score-a.score).slice(0,18);
}

export default generateEmails;
