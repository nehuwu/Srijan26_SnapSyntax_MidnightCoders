/**
 * CAUgen — Password Generator v2
 * Supports memorable (baseInput-driven) + strong (random) modes.
 */

const POOLS = {
  lower:   'abcdefghijklmnopqrstuvwxyz',
  upper:   'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  nums:    '0123456789',
  symbols: '!@#$%&*-_=+?',
};

const SYMBOL_LIST = ['!','@','#','$','%','&','*','-','_','=','+','?'];
const NUMS_LIST   = '0123456789'.split('');

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length-1; i > 0; i--) {
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
  }
  return a;
}

// ─── Memorable password from baseInput ────────────────────────

function chunkInput(input) {
  // Split on spaces, camelCase boundaries, or non-alpha
  const raw = input.replace(/([a-z])([A-Z])/g,'$1 $2').split(/[\s\W_]+/).filter(Boolean);
  if (!raw.length) return ['pass','word'];
  return raw.slice(0,4).map(c => c.toLowerCase());
}

function transformChunk(chunk, mode) {
  if (!chunk) return '';
  const c = chunk.toLowerCase();
  if (mode === 0) return c;
  if (mode === 1) return c.charAt(0).toUpperCase() + c.slice(1);
  if (mode === 2) return c.toUpperCase();
  if (mode === 3) return c.replace(/a/g,'@').replace(/e/g,'3').replace(/i/g,'1').replace(/o/g,'0');
  return c;
}

/**
 * Generate one memorable password from baseInput.
 * Pattern: {Word}{sym}{num}{Word}{sym}
 */
function memorablePassword(baseInput, length, symbols) {
  const chunks  = chunkInput(baseInput);
  const parts   = [];
  const symChar = symbols ? rand(SYMBOL_LIST) : '';
  const symChar2= symbols ? rand(SYMBOL_LIST) : '_';
  const num1    = rand(NUMS_LIST) + rand(NUMS_LIST);
  const num2    = rand(NUMS_LIST);

  // Pick 2 chunks with varied transforms
  const c0 = transformChunk(chunks[0], 1);  // Capitalised
  const c1  = transformChunk(chunks[1] || chunks[0], 0); // lowercase
  const c2  = chunks[2] ? transformChunk(chunks[2], 1) : '';

  // Base patterns
  const base = `${c0}${symChar}${num1}${c1}${symChar2}`;
  let pw = base;

  // Pad to desired length if short
  if (pw.length < length - 2 && c2) {
    pw = `${c0}${symChar}${num1}${c1}${symChar2}${c2}${num2}`;
  }

  // Trim to max length
  if (pw.length > length) pw = pw.slice(0, length);

  // Ensure all character classes present
  if (!/[A-Z]/.test(pw)) pw = pw.charAt(0).toUpperCase() + pw.slice(1);
  if (!/[0-9]/.test(pw)) pw += rand(NUMS_LIST);
  if (symbols && !/[^a-zA-Z0-9]/.test(pw)) pw += rand(SYMBOL_LIST);

  return pw;
}

// ─── Strong random password ────────────────────────────────────

function strongPassword(length, symbols) {
  let pool = POOLS.lower + POOLS.upper + POOLS.nums;
  const req = [rand([...POOLS.upper]), rand([...POOLS.nums])];
  if (symbols) { pool += POOLS.symbols; req.push(rand(SYMBOL_LIST)); }
  const filler = Array.from({length: Math.max(0, length - req.length)}, () => rand([...pool]));
  return shuffle([...req, ...filler]).join('');
}

// ─── Public API ───────────────────────────────────────────────

/**
 * Generate a single password.
 * @param {{
 *   length?: number,
 *   strength?: 'low'|'medium'|'high',
 *   strengthMode?: 'normal'|'strong',
 *   symbols?: boolean,
 *   baseInput?: string
 * }} opts
 */
export function generatePassword({
  length       = 16,
  strength     = 'high',
  strengthMode = 'strong',
  symbols      = true,
  baseInput    = '',
} = {}) {
  const useMemory = strengthMode === 'normal' && baseInput.trim().length >= 3;
  if (useMemory) return memorablePassword(baseInput, length, symbols);
  return strongPassword(length, symbols && strength !== 'low');
}

/**
 * Generate multiple passwords.
 */
export function generatePasswords(opts = {}, count = 10) {
  return Array.from({length: count}, () => generatePassword(opts));
}

/**
 * Analyse password strength.
 * @returns {{ label: string, score: number, color: string, pct: number }}
 */
export function analyzeStrength(pw) {
  let score = 0;
  if (pw.length >= 10) score++;
  if (pw.length >= 14) score++;
  if (pw.length >= 18) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^a-zA-Z0-9]/.test(pw)) score++;
  if (new Set(pw).size >= 10) score++;

  const pct = Math.round((score / 7) * 100);
  if (score <= 2) return { label:'Weak',        score, pct, color:'#f43f5e' };
  if (score <= 3) return { label:'Fair',         score, pct, color:'#f59e0b' };
  if (score <= 5) return { label:'Strong',       score, pct, color:'#10b981' };
  return              { label:'Very Strong',  score, pct, color:'#06b6d4' };
}
