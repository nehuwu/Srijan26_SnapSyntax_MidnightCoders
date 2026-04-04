/* ═══════════════════════════════════
   STATE
═══════════════════════════════════ */
const state = {
  mode: 'idle',   // idle | typing | loading | success | error
  emailVal: '',
  passVal: '',
  passVisible: false,
};

/* ═══════════════════════════════════
   DOM REFS
═══════════════════════════════════ */
const $ = id => document.getElementById(id);

const emailInput    = $('email');
const passInput     = $('password');
const togglePassBtn = $('toggle-pass');
const eyeOpen       = $('eye-open');
const eyeClosed     = $('eye-closed');
const strengthBar   = $('strength-bar');
const strengthFill  = $('strength-fill');
const emailError    = $('email-error');
const passError     = $('pass-error');
const loginForm     = $('login-form');
const btnLogin      = $('btn-login');
const btnText       = $('btn-text');
const btnSpinner    = $('btn-spinner');
const btnIcon       = $('btn-icon');

// Code panel refs
const codeEmail     = $('code-email');
const passDots      = $('pass-dots');
const liveDot       = $('live-dot');
const liveLabel     = $('live-label');
const cpfStatus     = $('cpf-status');
const cpfLine       = $('cpf-line');
const cpFooter      = document.querySelector('.cp-footer');

// Terminal lines
const tl1           = $('tl-1');
const tl2           = $('tl-2');
const tlErr         = $('tl-err');
const tl1Text       = $('tl-1-text');
const tl2Text       = $('tl-2-text');
const tlErrText     = $('tl-err-text');
const tlCursor      = $('tl-cursor');
const cursorLine    = $('cl-cursor-line');

/* ═══════════════════════════════════
   LINE NUMBERS
═══════════════════════════════════ */
function buildLineNums() {
  const ln = document.querySelector('.cp-line-nums');
  if (!ln) return;
  const codeLines = document.querySelectorAll('.cl');
  ln.innerHTML = Array.from({ length: codeLines.length }, (_, i) => `<span>${i + 1}</span>`).join('');
}
buildLineNums();

/* ═══════════════════════════════════
   CODE PANEL — EMAIL SYNC
═══════════════════════════════════ */
function syncEmail(val) {
  if (!val) {
    codeEmail.innerHTML = `<span style="color:var(--text3)">"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"</span>`;
  } else {
    codeEmail.innerHTML = `"${escapeHtml(val)}"`;
  }
}

/* ═══════════════════════════════════
   CODE PANEL — PASSWORD SYNC (DOTS)
═══════════════════════════════════ */
function syncPass(val) {
  const count = val.length;
  if (count === 0) {
    passDots.innerHTML = '';
    return;
  }
  // Animate new dots — keep existing, only add/remove
  const current = passDots.querySelectorAll('.pass-dot').length;
  if (count > current) {
    for (let i = current; i < count; i++) {
      const d = document.createElement('span');
      d.className = 'pass-dot';
      passDots.appendChild(d);
    }
  } else if (count < current) {
    for (let i = current; i > count; i--) {
      passDots.removeChild(passDots.lastChild);
    }
  }
}

/* ═══════════════════════════════════
   CODE PANEL — STATUS
═══════════════════════════════════ */
function setCodePanelMode(mode) {
  // Reset terminal lines
  tl1.style.display = 'none';
  tl2.style.display = 'none';
  tlErr.style.display = 'none';
  tlCursor.style.display = 'none';
  cursorLine.style.display = 'flex';

  liveDot.className = 'live-dot';
  cpFooter.classList.remove('error-state');

  switch (mode) {
    case 'idle':
      liveLabel.textContent = 'idle';
      cpfStatus.textContent = 'IDLE';
      break;

    case 'typing':
      liveDot.classList.add('active');
      liveLabel.textContent = 'editing';
      cpfStatus.textContent = 'EDITING';
      break;

    case 'loading':
      liveDot.classList.add('active');
      liveLabel.textContent = 'running';
      cpfStatus.textContent = 'RUNNING';
      cursorLine.style.display = 'none';

      // Show terminal line 1
      tl1.style.display = 'flex';
      tlCursor.style.display = 'inline';
      tl1Text.textContent = '';
      typeText(tl1Text, 'Authenticating...', 40);
      break;

    case 'success':
      liveDot.classList.add('active');
      liveLabel.textContent = 'connected';
      cpfStatus.textContent = 'SUCCESS';

      tl1.style.display = 'flex';
      tl2.style.display = 'flex';
      tlCursor.style.display = 'none';
      tl1Text.textContent = 'Authenticating... done';
      tl2Text.textContent = '✓ Access granted. Redirecting...';
      break;

    case 'error':
      liveDot.classList.add('error');
      liveLabel.textContent = 'failed';
      cpfStatus.textContent = 'ERROR';
      cpFooter.classList.add('error-state');

      tl1.style.display = 'flex';
      tlErr.style.display = 'flex';
      tlCursor.style.display = 'none';
      tl1Text.textContent = 'Authenticating... failed';
      tlErrText.textContent = 'Error: invalid credentials';
      break;
  }
}

/* Typewriter helper */
function typeText(el, text, delay = 35) {
  el.textContent = '';
  let i = 0;
  const t = setInterval(() => {
    el.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(t);
  }, delay);
}

/* ═══════════════════════════════════
   EMAIL INPUT
═══════════════════════════════════ */
emailInput.addEventListener('input', () => {
  state.emailVal = emailInput.value;
  syncEmail(state.emailVal);
  setCodePanelMode('typing');
  clearFieldError(emailInput, emailError);
  cpfLine.textContent = 'Ln 3';
});

emailInput.addEventListener('blur', () => {
  if (!state.emailVal) setCodePanelMode('idle');
  validateEmail(true);
});

/* ═══════════════════════════════════
   PASSWORD INPUT
═══════════════════════════════════ */
passInput.addEventListener('input', () => {
  state.passVal = passInput.value;
  syncPass(state.passVal);
  setCodePanelMode('typing');
  clearFieldError(passInput, passError);
  updateStrength(state.passVal);
  cpfLine.textContent = 'Ln 4';
});

passInput.addEventListener('blur', () => {
  if (!state.emailVal && !state.passVal) setCodePanelMode('idle');
});

/* Show/hide password */
togglePassBtn.addEventListener('click', () => {
  state.passVisible = !state.passVisible;
  passInput.type = state.passVisible ? 'text' : 'password';
  eyeOpen.style.display  = state.passVisible ? 'none' : 'block';
  eyeClosed.style.display = state.passVisible ? 'block' : 'none';
});

/* ═══════════════════════════════════
   PASSWORD STRENGTH
═══════════════════════════════════ */
function updateStrength(val) {
  if (!val) {
    strengthBar.classList.remove('visible');
    strengthFill.className = 'strength-fill';
    return;
  }
  strengthBar.classList.add('visible');

  let score = 0;
  if (val.length >= 8)  score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  strengthFill.className = 'strength-fill s' + score;
}

/* ═══════════════════════════════════
   VALIDATION
═══════════════════════════════════ */
function validateEmail(showError) {
  const val = emailInput.value.trim();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  if (!val) {
    if (showError) showFieldError(emailInput, emailError, 'Email is required');
    return false;
  }
  if (!valid) {
    if (showError) showFieldError(emailInput, emailError, 'Invalid email address');
    return false;
  }
  clearFieldError(emailInput, emailError);
  return true;
}

function validatePass(showError) {
  const val = passInput.value;
  if (!val) {
    if (showError) showFieldError(passInput, passError, 'Password is required');
    return false;
  }
  if (val.length < 6) {
    if (showError) showFieldError(passInput, passError, 'Password too short');
    return false;
  }
  clearFieldError(passInput, passError);
  return true;
}

function showFieldError(input, errorEl, msg) {
  input.classList.add('has-error');
  errorEl.textContent = msg;
  errorEl.classList.add('show');
  // Shake
  input.classList.remove('shake');
  void input.offsetWidth;
  input.classList.add('shake');
  input.addEventListener('animationend', () => input.classList.remove('shake'), { once: true });
}

function clearFieldError(input, errorEl) {
  input.classList.remove('has-error');
  errorEl.classList.remove('show');
}

/* ═══════════════════════════════════
   FORM SUBMIT
═══════════════════════════════════ */
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const emailOk = validateEmail(true);
  const passOk  = validatePass(true);
  if (!emailOk || !passOk) return;

  // --- LOADING STATE ---
  setBtnState('loading');
  setCodePanelMode('loading');

  // Simulated API call
  await delay(1400);

  // Demo: use specific credentials to simulate success
  const success = emailInput.value.includes('@') && passInput.value.length >= 6;

  if (success) {
    // --- SUCCESS STATE ---
    setBtnState('success');
    setCodePanelMode('success');

    await delay(1200);
    // Simulate redirect
    simulateRedirect();

  } else {
    // --- ERROR STATE ---
    setBtnState('error');
    setCodePanelMode('error');

    showFieldError(emailInput, emailError, 'Authentication failed');
    showFieldError(passInput, passError, 'Check your credentials');

    // Auto-reset button after 2.5s
    await delay(2500);
    setBtnState('default');
    setCodePanelMode('typing');
  }
});

/* ═══════════════════════════════════
   BUTTON STATE MANAGER
═══════════════════════════════════ */
function setBtnState(mode) {
  btnLogin.classList.remove('loading', 'success', 'error-state');
  btnLogin.disabled = false;
  btnIcon.textContent = '';

  switch (mode) {
    case 'loading':
      btnLogin.classList.add('loading');
      btnLogin.disabled = true;
      btnText.textContent = 'Sign In';
      break;

    case 'success':
      btnLogin.classList.add('success');
      btnLogin.disabled = true;
      break;

    case 'error':
      btnLogin.classList.add('error-state');
      btnText.textContent = 'Authentication failed';
      break;

    case 'default':
    default:
      btnText.textContent = 'Sign In';
      break;
  }
}

/* ═══════════════════════════════════
   ENTER KEY
═══════════════════════════════════ */
[emailInput, passInput].forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter') loginForm.requestSubmit();
  });
});

/* ═══════════════════════════════════
   OAUTH BUTTONS (SIMULATED)
═══════════════════════════════════ */
$('btn-google').addEventListener('click', () => {
  simulateOAuth('Google');
});
$('btn-github').addEventListener('click', () => {
  simulateOAuth('GitHub');
});

async function simulateOAuth(provider) {
  setCodePanelMode('loading');
  tl1Text.textContent = '';
  typeText(tl1Text, `OAuth: connecting ${provider}...`, 35);
  setBtnState('loading');

  await delay(1400);

  setCodePanelMode('success');
  tl2Text.textContent = `✓ ${provider} connected. Redirecting...`;
  setBtnState('success');

  await delay(1200);
  simulateRedirect();
}

/* ═══════════════════════════════════
   REDIRECT SIMULATION
═══════════════════════════════════ */
function simulateRedirect() {
  // In production: window.location.href = '/dashboard';
  // For demo: flash a visual cue and reset
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  setTimeout(() => {
    document.body.style.opacity = '1';
    document.body.style.transition = '';
    setBtnState('default');
    setCodePanelMode('idle');
    emailInput.value = '';
    passInput.value  = '';
    state.emailVal = '';
    state.passVal  = '';
    syncEmail('');
    syncPass('');
    strengthBar.classList.remove('visible');
    strengthFill.className = 'strength-fill';
  }, 600);
}

/* ═══════════════════════════════════
   HELPERS
═══════════════════════════════════ */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ═══════════════════════════════════
   IDLE ANIMATION — SUBTLE LINE HIGHLIGHT
═══════════════════════════════════ */
(function idleLoop() {
  const lines = document.querySelectorAll('.cl:not(.cl-blank)');
  let current = -1;
  let timer   = null;

  function tick() {
    if (state.mode !== 'idle') return;
    lines.forEach(l => l.classList.remove('active-line'));
    current = (current + 1) % lines.length;
    lines[current].classList.add('active-line');
  }

  // Only run in idle
  function run() {
    clearInterval(timer);
    if (state.mode === 'idle') timer = setInterval(tick, 1800);
  }

  // Watch for mode changes
  const origSet = setCodePanelMode;
  window.__setMode = (m) => {
    state.mode = m;
    if (m === 'idle') run();
    else {
      clearInterval(timer);
      lines.forEach(l => l.classList.remove('active-line'));
    }
  };

  run();
})();

/* Patch setCodePanelMode to also track state.mode */
const _origSetCodePanelMode = setCodePanelMode;
function setCodePanelMode(mode) {
  state.mode = mode;
  _origSetCodePanelMode(mode);
  if (window.__setMode) window.__setMode(mode);
}

// Re-assign on load
setCodePanelMode('idle');
