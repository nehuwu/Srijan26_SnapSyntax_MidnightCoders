// ─── Dictionaries ─────────────────────────────────────────────

export const DICT = {
  interests: {
    tech:      ['code','dev','byte','ai','build','script','stack','cloud','hack','data','sys','algo'],
    gaming:    ['gg','pro','xp','loot','frag','clutch','zone','ctrl','ace','raid','noob','spawn'],
    aesthetic: ['zen','void','nova','luna','aura','neon','mist','haze','glow','ether','bloom','dusk'],
    business:  ['labs','hub','works','core','base','forge','hq','ops','co','ink','group','firm'],
    music:     ['bass','beat','wave','drop','loop','freq','jam','vibe','bpm','mix','sub','riff'],
    art:       ['ink','pixel','sketch','craft','lens','frame','draw','brush','glyph','form'],
    general:   ['life','world','verse','point','flow','mode','way','era','phase','shift'],
  },
  vibes: {
    cool:      ['neo','alpha','prime','ultra','hyper','max','apex','turbo','flux','surge'],
    aesthetic: ['zen','void','mist','aura','luna','nova','ether','abyss','drift','haze'],
    gamer:     ['gg','pro','ace','clutch','epic','god','frag','pwn','rage','carry'],
    pro:       ['exec','hq','pro','labs','core','base','ops','elite','chief','lead'],
    minimal:   ['x','o','z','ix','ko','zu','ex','qi','vi','ka'],
    dark:      ['void','dark','shadow','ghost','noir','onyx','hex','krypt','shade','abyss'],
  },
  prefix:  ['x','its','the','real','iam','hey','yo','im','mr','dj','sir','von'],
  suffix:  ['hub','labs','zone','gg','404','ai','x','hq','pro','io','co','dev','dot','fx'],
  numbers: {
    smart:    ['007','111','404','999','101','808','42','360','911','247'],
    short:    ['1','2','3','7','9','21','77','99','11','00'],
    yearFrag: ['01','02','03','04','05','06','07','08','09','10','21','22','23','24','25'],
  },
  entropy: {
    hex: ['a9','f3','b7','e2','c4','d1','3f','7a','2b','5e','8d','c0','ff','ab','cd'],
    syl: ['zo','ix','ka','ra','no','ex','vy','ta','qu','ze','mo','ri','lu','fi','na'],
  },
};

// ─── RNG ──────────────────────────────────────────────────────

export function mkRng(seed) {
  let s = Math.abs(seed) || 1;
  return () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
}

export function hashStr(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export const pick = (arr, rng) => arr[Math.floor(rng() * arr.length)];

// ─── Token Engine ─────────────────────────────────────────────

export function buildTokens(input) {
  const clean = input.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nv = [
    clean,
    clean.length > 4 ? clean.slice(0,4) : clean,
    clean.length > 3 ? clean.slice(0,3) : clean,
    clean[0] + (clean.length > 3 ? clean.slice(-2) : clean.slice(1)),
    clean.replace(/a/g,'4').replace(/e/g,'3').replace(/i/g,'1').replace(/o/g,'0'),
    clean.length > 5 ? clean.slice(0,5) : clean,
    clean[0] + (clean.length > 5 ? clean.slice(1,4) : clean.slice(1)),
  ].filter(n => n && n.length >= 2);

  const iw = [];
  (input.interests?.length ? input.interests : ['general']).forEach(int => {
    iw.push(...(DICT.interests[int] || DICT.interests.general));
  });

  const vw = DICT.vibes[input.vibe] || DICT.vibes.cool;

  const nums = [...DICT.numbers.smart, ...DICT.numbers.short, ...DICT.numbers.yearFrag];
  if (input.birthYear && String(input.birthYear).length === 4) {
    const y = String(input.birthYear);
    nums.push(y.slice(-2), y.slice(-4,-2));
  }

  return { nv, iw, vw, nums };
}

// ─── Pattern Engine ───────────────────────────────────────────

export const PATTERNS = [
  { fn: (t,r) => pick(t.nv,r) + pick(t.iw,r),                              label: 'name·int'     },
  { fn: (t,r) => pick(t.nv,r) + pick(t.vw,r),                              label: 'name·vibe'    },
  { fn: (t,r) => pick(t.nv,r) + pick(DICT.suffix,r),                       label: 'name·suffix'  },
  { fn: (t,r) => pick(DICT.prefix,r) + pick(t.nv,r),                       label: 'prefix·name'  },
  { fn: (t,r) => pick(t.nv,r) + pick(t.nums,r),                            label: 'name·num'     },
  { fn: (t,r) => pick(t.nv,r) + pick(t.iw,r) + pick(t.nums,r),            label: 'n·i·num'      },
  { fn: (t,r) => pick(t.vw,r) + pick(t.nv,r),                              label: 'vibe·name'    },
  { fn: (t,r) => pick(t.nv,r) + '_' + pick(t.iw,r),                        label: 'name_int'     },
  { fn: (t,r) => pick(t.iw,r) + pick(t.nv,r),                              label: 'int·name'     },
  { fn: (t,r) => pick(t.nv,r) + pick(t.vw,r) + pick(DICT.suffix,r),       label: 'n·v·suffix'   },
  { fn: (t,r) => pick(DICT.prefix,r) + pick(t.nv,r) + pick(DICT.suffix,r),label: 'p·n·suffix'   },
  { fn: (t,r) => pick(t.nv,r) + pick(DICT.entropy.hex,r),                  label: 'name·hex'     },
  { fn: (t,r) => pick(t.nv,r) + pick(t.iw,r) + '_' + pick(t.nums,r),      label: 'n·i_num'      },
  { fn: (t,r) => pick(t.vw,r) + pick(t.iw,r) + pick(t.nv,r),              label: 'v·i·name'     },
  { fn: (t,r) => pick(t.nv,r) + '.' + pick(t.iw,r),                        label: 'name.int'     },
  { fn: (t,r) => pick(t.nv,r) + pick(DICT.entropy.syl,r),                  label: 'name·syl'     },
  { fn: (t,r) => pick(t.vw,r) + '_' + pick(t.nv,r),                        label: 'vibe_name'    },
  { fn: (t,r) => pick(t.nv,r) + pick(t.iw,r) + pick(t.vw,r),              label: 'n·i·vibe'     },
  { fn: (t,r) => pick(t.nv,r) + pick(t.nums,r) + pick(t.vw,r),            label: 'n·num·vibe'   },
  { fn: (t,r) => pick(DICT.prefix,r) + '_' + pick(t.nv,r),                 label: 'pre_name'     },
  { fn: (t,r) => pick(t.iw,r) + '_' + pick(t.nv,r),                        label: 'int_name'     },
  { fn: (t,r) => pick(t.nv,r) + pick(t.vw,r) + pick(t.nums,r),            label: 'n·v·num'      },
];

// ─── Scoring Engine ───────────────────────────────────────────

export function scoreUsername(username, input) {
  const clean = input.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  let s = 0;
  const alpha = username.replace(/[^a-z]/g, '');

  if (alpha.includes(clean))                    s += 0.30;
  else if (alpha.includes(clean.slice(0,4)))    s += 0.22;
  else if (alpha.includes(clean.slice(0,3)))    s += 0.15;
  else if (username.startsWith(clean[0]))        s += 0.06;

  const iws = (input.interests?.length ? input.interests : ['general'])
    .flatMap(i => DICT.interests[i] || DICT.interests.general);
  if (iws.some(w => username.includes(w)))                s += 0.20;
  else if (iws.some(w => username.includes(w.slice(0,3)))) s += 0.10;

  const vws = DICT.vibes[input.vibe] || DICT.vibes.cool;
  if (vws.some(w => username.includes(w))) s += 0.15;

  const bad    = /__|\.\.|-{2}/.test(username);
  const tooNum = /\d{4,}/.test(username) && !/007|404|808|999|111/.test(username);
  const vowelR = alpha.length ? (alpha.match(/[aeiou]/gi)||[]).length / alpha.length : 0;
  if (!bad && !tooNum && vowelR >= 0.1 && vowelR <= 0.75) s += 0.15;
  else if (!bad && !tooNum) s += 0.07;
  else s += 0.01;

  const len = username.length;
  s += len >= 8 && len <= 14 ? 0.10 : len >= 6 && len <= 18 ? 0.05 : 0;
  s += Math.min(0.10, new Set(username.replace(/[^a-z0-9]/gi,'')).size * 0.012);

  return Math.round(Math.min(1, s) * 100);
}

// ─── Validator ────────────────────────────────────────────────

export function isValid(u) {
  if (!u || u.length < 6 || u.length > 18) return false;
  if (/__|\.\.|-{2}/.test(u)) return false;
  const nm = u.match(/\d+/g);
  if (nm && nm.some(n => n.length > 3 && !/007|404|808|999|111/.test(n))) return false;
  if (['admin','root','support','official','test'].some(b => u.includes(b))) return false;
  return true;
}

// ─── Main Generator ───────────────────────────────────────────

export function generateUsernames(input, regenOffset = 0) {
  const baseSeed = hashStr(
    `${input.name}${input.birthYear||''}${(input.interests||[]).join('')}${input.vibe||''}`
  );
  const rng    = mkRng(baseSeed + regenOffset * 7919);
  const tokens = buildTokens(input);
  const seen   = new Set();
  const candidates = [];

  for (let iter = 0; iter < 10; iter++) {
    for (const pat of PATTERNS) {
      let u = pat.fn(tokens, rng).toLowerCase();
      let attempts = 0;
      while (seen.has(u) && attempts < 4) {
        const muts = [
          () => u + pick(DICT.numbers.short, rng),
          () => u + pick(DICT.entropy.syl, rng),
          () => pick(DICT.prefix, rng) + u,
          () => u + pick(DICT.entropy.hex, rng),
          () => u + pick(DICT.suffix, rng),
        ];
        u = muts[Math.floor(rng() * muts.length)]();
        attempts++;
      }
      if (!seen.has(u) && isValid(u)) {
        seen.add(u);
        candidates.push({ username: u, score: scoreUsername(u, input), pattern: pat.label });
      }
    }
  }
  return candidates.sort((a,b) => b.score - a.score).slice(0, 30);
}
