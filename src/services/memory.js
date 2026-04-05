/**
 * CAUgen — Memory Service v2
 * - Individual liked items (usernames, emails, passwords)
 * - Identity bundles (grouped objects saved as a set)
 * - Input history
 * - Stats
 *
 * Storage keys:
 *   caugen_mem_v2        — liked items + input history
 *   caugen_identities    — identity bundles
 */

const MEM_KEY  = 'caugen_mem_v2';
const IDENT_KEY= 'caugen_identities';

// ─── Low-level ────────────────────────────────────────────────

function read(key) { try { return JSON.parse(localStorage.getItem(key)||'{}'); } catch { return {}; } }
function readArr(key) { try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch { return []; } }
function write(key, patch) {
  try { localStorage.setItem(key, JSON.stringify({ ...read(key), ...patch })); } catch {}
}
function writeRaw(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch {} }

// ─── Hash (for identity IDs) ──────────────────────────────────
function miniHash(str) {
  let h = 0;
  for (let i=0; i<str.length; i++) h = ((h<<5)-h + str.charCodeAt(i))|0;
  return Math.abs(h).toString(36).slice(0,6);
}

// ─── Individual saved items ───────────────────────────────────

export const MEM = {
  likedSet:    ()  => new Set(read(MEM_KEY).liked || []),
  like:        (u) => { const s = MEM.likedSet(); s.add(u);    write(MEM_KEY,{liked:[...s]}); },
  unlike:      (u) => { const s = MEM.likedSet(); s.delete(u); write(MEM_KEY,{liked:[...s]}); },
  isLiked:     (u) => MEM.likedSet().has(u),
  getLiked:    ()  => [...MEM.likedSet()],

  pushHistory: (inp) => {
    const h = MEM.getHistory();
    h.unshift({...inp, ts:Date.now()});
    write(MEM_KEY, {inputHistory: h.slice(0,20)});
  },
  getHistory:  ()  => read(MEM_KEY).inputHistory || [],

  getStats:    ()  => ({
    liked:    (read(MEM_KEY).liked||[]).length,
    history:  (read(MEM_KEY).inputHistory||[]).length,
    identities: readArr(IDENT_KEY).length,
  }),

  clearAll:    ()  => {
    try { localStorage.removeItem(MEM_KEY); localStorage.removeItem(IDENT_KEY); } catch {}
  },
};

// ─── Identity Bundles ─────────────────────────────────────────

/**
 * Identity shape:
 * {
 *   id:         string (ts + hash),
 *   label:      string (display name),
 *   username:   string | null,
 *   emails:     string[],
 *   passwords:  string[],
 *   domains:    string[],
 *   created_at: number (unix ms)
 * }
 */

export const IDENTITY = {
  getAll: () => readArr(IDENT_KEY),

  get: (id) => readArr(IDENT_KEY).find(i => i.id === id) || null,

  save: (bundle) => {
    const all = readArr(IDENT_KEY);
    const ts  = Date.now();
    const id  = `${ts}-${miniHash(JSON.stringify(bundle))}`;
    const identity = {
      id,
      label:      bundle.label      || bundle.username || 'Identity',
      username:   bundle.username   || null,
      emails:     bundle.emails     || [],
      passwords:  bundle.passwords  || [],
      domains:    bundle.domains    || [],
      created_at: ts,
    };
    writeRaw(IDENT_KEY, [identity, ...all].slice(0, 50)); // max 50 bundles
    return identity;
  },

  remove: (id) => {
    writeRaw(IDENT_KEY, readArr(IDENT_KEY).filter(i => i.id !== id));
  },

  update: (id, patch) => {
    const all = readArr(IDENT_KEY);
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return;
    all[idx] = {...all[idx], ...patch, id}; // prevent id overwrite
    writeRaw(IDENT_KEY, all);
  },

  /** Add a single item to an existing identity bundle */
  addItem: (id, field, value) => {
    // field: 'emails' | 'passwords' | 'domains'
    const all = readArr(IDENT_KEY);
    const idx = all.findIndex(i => i.id === id);
    if (idx === -1) return;
    const arr = all[idx][field] || [];
    if (!arr.includes(value)) {
      all[idx][field] = [...arr, value];
      writeRaw(IDENT_KEY, all);
    }
  },

  clearAll: () => { try { localStorage.removeItem(IDENT_KEY); } catch {} },
};

export default MEM;
