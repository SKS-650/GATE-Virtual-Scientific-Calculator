/**
 * GATE Virtual Scientific Calculator — Logic
 *
 * Responsibilities:
 *   - Maintain calculator state (expression, result, memory, angle mode)
 *   - Evaluate expressions via the evaluate() helper
 *   - Handle all button actions through handleAction()
 *   - Wire DOM button clicks and keyboard shortcuts
 *   - Control the Help modal open/close
 */

(function () {
  'use strict';

  /* ============================================================
     State
     ============================================================ */
  const state = {
    expr: '',            // expression string shown in the top display
    result: '0',         // current result shown in the bottom display
    memory: 0,           // memory register (MC / MR / MS / M+ / M-)
    justEvaluated: false, // true immediately after '=' is pressed
    awaitingPow: false,   // waiting for the exponent in xʸ
    awaitingYroot: false, // waiting for y in ʸ√x
    awaitingLogy: false,  // waiting for x in logᵧx
    pendingBase: null,    // stored base value for xʸ / ʸ√x / logᵧx
    isError: false,       // true when the display shows an error
  };

  /* ============================================================
     DOM references
     ============================================================ */
  const exprEl   = document.getElementById('expr-display');
  const resultEl = document.getElementById('result-display');

  /* ============================================================
     Utility helpers
     ============================================================ */

  /** Returns the currently selected angle unit: 'deg' or 'rad'. */
  function getAngleMode() {
    return document.querySelector('input[name="angle"]:checked').value;
  }

  /** Convert degrees → radians. */
  function toRad(deg) { return deg * Math.PI / 180; }

  /** Convert radians → degrees. */
  function toDeg(rad) { return rad * 180 / Math.PI; }

  /**
   * Compute n! (factorial) for non-negative integers up to 170.
   * Returns NaN for negatives, Infinity for n > 170.
   */
  function factorial(n) {
    n = Math.floor(n);
    if (n < 0)   return NaN;
    if (n > 170) return Infinity;
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
  }

  /**
   * Format a number for display.
   * Trims floating-point noise (e.g. 0.9999999999999 → 1) while
   * keeping up to 12 significant figures.
   */
  function formatNum(n) {
    if (!isFinite(n)) return String(n);
    return String(parseFloat(n.toPrecision(12)));
  }

  /* ============================================================
     Display helpers
     ============================================================ */

  /** Update both display divs from state. */
  function updateDisplay() {
    exprEl.textContent   = state.expr || '\u00A0';
    resultEl.textContent = state.result;
  }

  /** Set a successful result and optionally update the expression label. */
  function setResult(val, expr) {
    state.isError = false;
    resultEl.classList.remove('error');
    state.result = formatNum(val);
    resultEl.textContent = state.result;
    if (expr !== undefined) {
      state.expr = expr;
      exprEl.textContent = expr || '\u00A0';
    }
  }

  /** Show an error message in the result display (red text). */
  function setError(msg, expr) {
    state.isError = true;
    resultEl.classList.add('error');
    state.result = msg;
    resultEl.textContent = msg;
    if (expr !== undefined) {
      state.expr = expr;
      exprEl.textContent = expr || '\u00A0';
    }
  }

  /* ============================================================
     Expression evaluation
     Uses the browser's own JS engine via Function(), so standard
     JS numeric expressions (including scientific-notation literals
     like 2e3) work correctly.
     ============================================================ */
  function evaluate(expr) {
    // Normalise display symbols back to JS operators
    const sanitised = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/ mod /g, '%');
    try {
      // eslint-disable-next-line no-new-func
      const value = Function('"use strict"; return (' + sanitised + ')')();
      return typeof value === 'number' ? value : NaN;
    } catch {
      return NaN;
    }
  }

  /* ============================================================
     Expression building
     Appends a string token to the current expression and
     live-updates the result display.
     ============================================================ */
  function appendExpr(token) {
    if (state.isError) {
      // Start fresh after an error
      state.expr = token;
    } else if (state.justEvaluated) {
      // After '=', operators continue from the last result;
      // any other token (digit, function result) starts a new expression.
      const isOperator = /^[+\-*/×÷%]$/.test(token) || token === ' mod ';
      state.expr = isOperator ? state.result + token : token;
    } else {
      state.expr += token;
    }

    state.justEvaluated = false;
    state.isError = false;
    resultEl.classList.remove('error');

    // Live-evaluate so the bottom display tracks as the user types
    const liveVal = evaluate(state.expr);
    if (isFinite(liveVal)) {
      state.result = formatNum(liveVal);
      resultEl.textContent = state.result;
    }
    exprEl.textContent = state.expr;
  }

  /** Read the numeric value currently shown in the result display. */
  function currentValue() {
    const v = parseFloat(state.result);
    return isNaN(v) ? 0 : v;
  }

  /* ============================================================
     Two-step (binary) pending operations
     xʸ, ʸ√x, and logᵧx each need a base entered first, then
     the button, then a second value, then '='.
     ============================================================ */
  function resolvePendingOp(second) {
    let res, label;

    if (state.awaitingPow) {
      res   = Math.pow(state.pendingBase, second);
      label = state.pendingBase + '^' + second + '=';
      state.awaitingPow = false;

    } else if (state.awaitingYroot) {
      res   = Math.pow(state.pendingBase, 1 / second);
      label = state.pendingBase + '^(1/' + second + ')=';
      state.awaitingYroot = false;

    } else {
      // awaitingLogy
      res   = Math.log(second) / Math.log(state.pendingBase);
      label = 'log_' + state.pendingBase + '(' + second + ')=';
      state.awaitingLogy = false;
    }

    state.pendingBase = null;

    if (!isFinite(res) || isNaN(res)) {
      setError('Error', label);
    } else {
      setResult(res, label);
      state.expr = formatNum(res);
    }
    state.justEvaluated = true;
  }

  /* ============================================================
     Main action dispatcher
     Called by both button clicks and keyboard events.
     ============================================================ */
  function handleAction(action) {

    /* ── Intercept input while waiting for the second operand ── */
    if (state.awaitingPow || state.awaitingYroot || state.awaitingLogy) {
      if (/^\d$/.test(action) || action === '.') {
        appendExpr(action);
        return;
      }
      if (action === '=') {
        resolvePendingOp(currentValue());
        return;
      }
      if (action !== 'clear') return;  // ignore everything else except clear
    }

    switch (action) {

      /* ── Digit entry ── */
      case '0': case '1': case '2': case '3': case '4':
      case '5': case '6': case '7': case '8': case '9':
        appendExpr(action);
        break;

      case '.':
        // Prevent a second decimal point in the same number segment
        if (!state.justEvaluated && /\.\d*$/.test(state.expr)) break;
        appendExpr('.');
        break;

      /* ── Arithmetic operators ── */
      case '+':
      case '-':
      case '/':
        appendExpr(action);
        break;

      case '*':
        appendExpr('×');   // display × but evaluate as *
        break;

      case '%': {
        const v = currentValue();
        const r = v / 100;
        setResult(r, formatNum(r));
        state.expr = formatNum(r);
        exprEl.textContent = state.expr;
        state.justEvaluated = true;
        break;
      }

      case 'mod': appendExpr(' mod '); break;
      case '(':   appendExpr('(');     break;
      case ')':   appendExpr(')');     break;

      /* ── Equals ── */
      case '=': {
        if (!state.expr) break;
        const snapshot = state.expr;
        const val = evaluate(state.expr);
        if (!isFinite(val) || isNaN(val)) {
          setError(
            isNaN(val) ? 'Error' : val > 0 ? 'Infinity' : '-Infinity',
            snapshot + '='
          );
        } else {
          setResult(val, snapshot + '=');
          state.expr = formatNum(val);
        }
        state.justEvaluated = true;
        break;
      }

      /* ── Clear (C) ── */
      case 'clear':
        state.expr            = '';
        state.result          = '0';
        state.isError         = false;
        state.justEvaluated   = false;
        state.awaitingPow     = false;
        state.awaitingYroot   = false;
        state.awaitingLogy    = false;
        state.pendingBase     = null;
        resultEl.classList.remove('error');
        updateDisplay();
        break;

      /* ── Backspace (←) ── */
      case 'backspace':
        if (state.justEvaluated || state.isError) {
          state.expr          = '';
          state.result        = '0';
          state.justEvaluated = false;
          state.isError       = false;
          resultEl.classList.remove('error');
        } else {
          state.expr = state.expr.slice(0, -1);
        }
        {
          const v = evaluate(state.expr);
          state.result = isFinite(v) ? formatNum(v) : (state.expr || '0');
          resultEl.textContent = state.result;
        }
        exprEl.textContent = state.expr || '\u00A0';
        break;

      /* ── Negate (+/-) ── */
      case 'negate': {
        const neg = -currentValue();
        setResult(neg, formatNum(neg));
        state.expr = formatNum(neg);
        exprEl.textContent = state.expr;
        state.justEvaluated = true;
        break;
      }

      /* ── Memory operations ── */
      case 'MC':
        state.memory = 0;
        break;

      case 'MR': {
        const memStr = formatNum(state.memory);
        state.expr   = (state.justEvaluated || !state.expr) ? memStr : state.expr + memStr;
        state.result = memStr;
        state.justEvaluated = false;
        updateDisplay();
        break;
      }

      case 'MS':     state.memory  = currentValue(); break;
      case 'Mplus':  state.memory += currentValue(); break;
      case 'Mminus': state.memory -= currentValue(); break;

      /* ── Trigonometric functions ── */
      case 'sin':
      case 'cos':
      case 'tan': {
        const v   = currentValue();
        const rad = getAngleMode() === 'deg' ? toRad(v) : v;
        const res = Math[action](rad);
        setResult(res, action + '(' + v + ')=');
        state.expr = formatNum(res);
        state.justEvaluated = true;
        break;
      }

      case 'asin':
      case 'acos':
      case 'atan': {
        const v = currentValue();
        const fnMap = { asin: Math.asin, acos: Math.acos, atan: Math.atan };
        let res = fnMap[action](v);
        if (isNaN(res)) { setError('Error', action + '(' + v + ')='); break; }
        if (getAngleMode() === 'deg') res = toDeg(res);
        const lblMap = { asin: 'sin⁻¹', acos: 'cos⁻¹', atan: 'tan⁻¹' };
        setResult(res, lblMap[action] + '(' + v + ')=');
        state.expr = formatNum(res);
        state.justEvaluated = true;
        break;
      }

      /* ── Hyperbolic functions ── */
      case 'sinh':
      case 'cosh':
      case 'tanh': {
        const v   = currentValue();
        const res = Math[action](v);
        setResult(res, action + '(' + v + ')=');
        state.expr = formatNum(res);
        state.justEvaluated = true;
        break;
      }

      case 'asinh':
      case 'acosh':
      case 'atanh': {
        const v    = currentValue();
        const fns  = { asinh: Math.asinh, acosh: Math.acosh, atanh: Math.atanh };
        const res  = fns[action](v);
        const lbls = { asinh: 'sinh⁻¹', acosh: 'cosh⁻¹', atanh: 'tanh⁻¹' };
        if (isNaN(res)) { setError('Error', lbls[action] + '(' + v + ')='); break; }
        setResult(res, lbls[action] + '(' + v + ')=');
        state.expr = formatNum(res);
        state.justEvaluated = true;
        break;
      }

      /* ── Logarithms ── */
      case 'log10': {
        const v = currentValue();
        if (v <= 0) { setError('Error', 'log(' + v + ')='); break; }
        setResult(Math.log10(v), 'log(' + v + ')=');
        state.expr = formatNum(Math.log10(v));
        state.justEvaluated = true;
        break;
      }

      case 'ln': {
        const v = currentValue();
        if (v <= 0) { setError('Error', 'ln(' + v + ')='); break; }
        setResult(Math.log(v), 'ln(' + v + ')=');
        state.expr = formatNum(Math.log(v));
        state.justEvaluated = true;
        break;
      }

      case 'log2': {
        const v = currentValue();
        if (v <= 0) { setError('Error', 'log₂(' + v + ')='); break; }
        setResult(Math.log2(v), 'log₂(' + v + ')=');
        state.expr = formatNum(Math.log2(v));
        state.justEvaluated = true;
        break;
      }

      case 'logy': {
        // Step 1: capture the base, then wait for the user to enter x
        state.pendingBase  = currentValue();
        state.awaitingLogy = true;
        state.expr         = '';
        state.result       = '0';
        updateDisplay();
        exprEl.textContent = 'log_' + state.pendingBase + '(?)';
        break;
      }

      /* ── Powers & roots ── */
      case 'square': {
        const v = currentValue();
        setResult(v * v, '(' + v + ')²=');
        state.expr = formatNum(v * v);
        state.justEvaluated = true;
        break;
      }

      case 'cube': {
        const v = currentValue();
        setResult(v * v * v, '(' + v + ')³=');
        state.expr = formatNum(v * v * v);
        state.justEvaluated = true;
        break;
      }

      case 'pow_xy': {
        // Step 1: capture the base, then wait for the exponent
        state.pendingBase = currentValue();
        state.awaitingPow = true;
        state.expr        = '';
        state.result      = '0';
        updateDisplay();
        exprEl.textContent = state.pendingBase + '^(?)';
        break;
      }

      case 'sqrt': {
        const v = currentValue();
        if (v < 0) { setError('Error', '√(' + v + ')='); break; }
        setResult(Math.sqrt(v), '√(' + v + ')=');
        state.expr = formatNum(Math.sqrt(v));
        state.justEvaluated = true;
        break;
      }

      case 'cbrt': {
        const v = currentValue();
        setResult(Math.cbrt(v), '³√(' + v + ')=');
        state.expr = formatNum(Math.cbrt(v));
        state.justEvaluated = true;
        break;
      }

      case 'yroot': {
        // Step 1: capture the radicand, then wait for the degree y
        state.pendingBase   = currentValue();
        state.awaitingYroot = true;
        state.expr          = '';
        state.result        = '0';
        updateDisplay();
        exprEl.textContent = state.pendingBase + '^(1/?)';
        break;
      }

      /* ── Exponential functions ── */
      case 'exp_e': {
        const v = currentValue();
        setResult(Math.exp(v), 'e^(' + v + ')=');
        state.expr = formatNum(Math.exp(v));
        state.justEvaluated = true;
        break;
      }

      case 'pow10': {
        const v = currentValue();
        setResult(Math.pow(10, v), '10^(' + v + ')=');
        state.expr = formatNum(Math.pow(10, v));
        state.justEvaluated = true;
        break;
      }

      /* ── Misc scientific ── */
      case 'recip': {
        const v = currentValue();
        if (v === 0) { setError('Error', '1/0='); break; }
        setResult(1 / v, '1/' + v + '=');
        state.expr = formatNum(1 / v);
        state.justEvaluated = true;
        break;
      }

      case 'abs': {
        const v = currentValue();
        setResult(Math.abs(v), '|' + v + '|=');
        state.expr = formatNum(Math.abs(v));
        state.justEvaluated = true;
        break;
      }

      case 'factorial': {
        const v   = currentValue();
        const res = factorial(v);
        if (isNaN(res)) { setError('Error', v + '!='); break; }
        setResult(res, v + '!=');
        state.expr = formatNum(res);
        state.justEvaluated = true;
        break;
      }

      /* ── Constants ── */
      case 'pi': {
        const pi = formatNum(Math.PI);
        state.expr   = (state.justEvaluated || !state.expr) ? pi : state.expr + pi;
        state.result = pi;
        state.justEvaluated = false;
        updateDisplay();
        break;
      }

      case 'e_const': {
        const ec = formatNum(Math.E);
        state.expr   = (state.justEvaluated || !state.expr) ? ec : state.expr + ec;
        state.result = ec;
        state.justEvaluated = false;
        updateDisplay();
        break;
      }

      /* ── Scientific notation (Exp) ── */
      case 'Exp': {
        // e.g. user types 2, presses Exp, types 3 → expression "2e3" = 2000
        if (!state.expr) state.expr = '1';
        state.expr += 'e';
        exprEl.textContent = state.expr;
        break;
      }

      default:
        break;
    }
  }

  /* ============================================================
     Button wiring
     ============================================================ */
  document.querySelectorAll('.btn[data-action]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      handleAction(btn.dataset.action);
    });
  });

  /* ============================================================
     Keyboard shortcuts
     ============================================================ */
  document.addEventListener('keydown', function (e) {
    const keyMap = {
      '0': '0', '1': '1', '2': '2', '3': '3', '4': '4',
      '5': '5', '6': '6', '7': '7', '8': '8', '9': '9',
      '.': '.', '+': '+', '-': '-', '*': '*', '/': '/',
      'Enter': '=', '=': '=',
      'Backspace': 'backspace',
      'Escape': 'clear',
      '(': '(', ')': ')',
      '%': '%',
    };
    if (keyMap[e.key]) {
      e.preventDefault();
      handleAction(keyMap[e.key]);
    }
  });

  /* ============================================================
     Help modal
     ============================================================ */
  const helpOverlay = document.getElementById('help-overlay');

  document.getElementById('btn-help').addEventListener('click', function () {
    helpOverlay.classList.add('visible');
  });

  document.getElementById('help-close').addEventListener('click', function () {
    helpOverlay.classList.remove('visible');
  });

  // Click on the dark backdrop also closes the modal
  helpOverlay.addEventListener('click', function (e) {
    if (e.target === helpOverlay) helpOverlay.classList.remove('visible');
  });

  /* ============================================================
     Window chrome buttons
     ============================================================ */
  document.getElementById('btn-close').addEventListener('click', function () {
    window.close();
  });

})();

/* ============================================================
   Theme switcher
   Cycles through 4 themes on each click of #btn-theme.
   The active theme class is applied to <body> and persisted
   in localStorage so it survives page refresh.
   ============================================================ */
(function () {
  'use strict';

  const THEMES = [
    { cls: '',               label: 'Classic Blue'    },
    { cls: 'theme-graphite', label: 'Dark Graphite'   },
    { cls: 'theme-purple',   label: 'Midnight Purple' },
    { cls: 'theme-gold',     label: 'Solar Gold'      },
  ];

  /* Icons that visually hint at each theme, shown in the button */
  const ICONS = ['☀', '◑', '✦', '★'];

  const btn   = document.getElementById('btn-theme');
  const toast = document.getElementById('theme-toast');
  let toastTimer = null;

  /* Work out initial theme from localStorage */
  let current = parseInt(localStorage.getItem('calcTheme') || '0', 10);
  if (isNaN(current) || current < 0 || current >= THEMES.length) current = 0;
  applyTheme(current, false);

  btn.addEventListener('click', function () {
    current = (current + 1) % THEMES.length;
    applyTheme(current, true);
  });

  function applyTheme(idx, animate) {
    /* Remove all theme classes, then add the chosen one */
    THEMES.forEach(function (t) {
      if (t.cls) document.body.classList.remove(t.cls);
    });
    if (THEMES[idx].cls) document.body.classList.add(THEMES[idx].cls);

    /* Update button icon */
    btn.textContent = ICONS[idx];

    /* Persist */
    localStorage.setItem('calcTheme', String(idx));

    /* Show toast on user-triggered change */
    if (animate) showToast(THEMES[idx].label);
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add('show');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('show');
    }, 1800);
  }
})();

/* ============================================================
   DRAG & RESIZE ENGINE  (Pointer Events — mouse + touch + stylus)
   ─────────────────────────────────────────────────────────────
   Uses the W3C Pointer Events API so mouse, touch and stylus
   are handled by a single code path.

   Key techniques:
     • setPointerCapture  — pointer stays captured to the element
                            even when the finger slides off it.
     • pointerId tracking — ignores stray second fingers.
     • Auto-fit on load   — on narrow screens the calculator
                            shrinks to fit the viewport width.
     • Orientation change — repositions so it stays on screen.

   Position & size are saved in localStorage.
   ============================================================ */
(function () {
  'use strict';

  const calc     = document.getElementById('calculator');
  const titlebar = document.getElementById('titlebar');

  /* ── Minimum dimensions (comfortable on a phone) ── */
  const MIN_W = 280;
  const MIN_H = 240;

  /* ══════════════════════════════════════════════════════
     Helpers
     ══════════════════════════════════════════════════════ */
  function clamp(val, lo, hi) { return Math.min(Math.max(val, lo), hi); }

  function setGeometry(x, y, w, h) {
    calc.style.left  = x + 'px';
    calc.style.top   = y + 'px';
    calc.style.width = w + 'px';
    if (h) calc.style.height = h + 'px';
  }

  function saveGeometry() {
    const r = calc.getBoundingClientRect();
    localStorage.setItem('calcGeometry', JSON.stringify({
      x: r.left, y: r.top, w: r.width, h: r.height
    }));
  }

  function centreCalc() {
    /* Fit to viewport on first load / if calc is wider than screen */
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let w = calc.offsetWidth  || 700;
    let h = calc.offsetHeight || 440;
    /* On narrow screens, shrink to fit */
    if (w > vw - 10) {
      w = vw - 10;
      calc.style.width = w + 'px';
    }
    calc.style.left = Math.max(0, (vw - w) / 2) + 'px';
    calc.style.top  = Math.max(0, (vh - h) / 2) + 'px';
    saveGeometry();
  }

  function keepOnScreen() {
    const r  = calc.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    /* Shrink if wider than viewport */
    if (r.width > vw) {
      calc.style.width = (vw - 10) + 'px';
    }
    const nr = calc.getBoundingClientRect();
    const x  = clamp(nr.left, 0, Math.max(0, vw - nr.width));
    const y  = clamp(nr.top,  0, Math.max(0, vh - nr.height));
    calc.style.left = x + 'px';
    calc.style.top  = y + 'px';
    saveGeometry();
  }

  /* ══════════════════════════════════════════════════════
     Initial position
     ══════════════════════════════════════════════════════ */
  (function initPosition() {
    const saved = JSON.parse(localStorage.getItem('calcGeometry') || 'null');
    if (saved && typeof saved.x === 'number') {
      setGeometry(saved.x, saved.y, saved.w, saved.h || null);
      /* Validate — saved geometry may be from a different screen */
      requestAnimationFrame(keepOnScreen);
    } else {
      /* Wait one frame so offsetWidth/Height are measured after render */
      requestAnimationFrame(centreCalc);
    }
  })();

  /* ══════════════════════════════════════════════════════
     Viewport resize / orientation change
     ══════════════════════════════════════════════════════ */
  window.addEventListener('resize', keepOnScreen);

  /* orientationchange fires before the new dimensions are settled;
     a 300 ms delay lets the browser finish rotating.              */
  window.addEventListener('orientationchange', function () {
    setTimeout(keepOnScreen, 300);
  });

  /* ══════════════════════════════════════════════════════
     DRAG  —  pointer events on the title bar
     ══════════════════════════════════════════════════════ */
  titlebar.addEventListener('pointerdown', function (e) {
    /* Only drag when the target is the bar itself or its title span —
       not when tapping Help / Theme / window buttons.               */
    const tgt = e.target;
    const isBar = tgt === titlebar || tgt === titlebar.querySelector('.title');
    if (!isBar) return;

    e.preventDefault();
    titlebar.setPointerCapture(e.pointerId);

    const startX = e.clientX;
    const startY = e.clientY;
    const origL  = calc.getBoundingClientRect().left;
    const origT  = calc.getBoundingClientRect().top;
    const capId  = e.pointerId;

    titlebar.classList.add('dragging');
    document.body.classList.add('calc-dragging');

    function onMove(ev) {
      if (ev.pointerId !== capId) return;
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const cw = calc.offsetWidth;
      const ch = calc.offsetHeight;

      let newL = origL + (ev.clientX - startX);
      let newT = origT + (ev.clientY - startY);

      /* Keep at least 44 px of the title bar inside the viewport
         so the user can always grab it again.                      */
      newL = clamp(newL, -(cw - 44), vw - 44);
      newT = clamp(newT, 0,          vh - 30);

      calc.style.left = newL + 'px';
      calc.style.top  = newT + 'px';
    }

    function onUp(ev) {
      if (ev.pointerId !== capId) return;
      titlebar.classList.remove('dragging');
      document.body.classList.remove('calc-dragging');
      saveGeometry();
      titlebar.removeEventListener('pointermove',   onMove);
      titlebar.removeEventListener('pointerup',     onUp);
      titlebar.removeEventListener('pointercancel', onUp);
    }

    titlebar.addEventListener('pointermove',   onMove);
    titlebar.addEventListener('pointerup',     onUp);
    titlebar.addEventListener('pointercancel', onUp);
  });

  /* ══════════════════════════════════════════════════════
     RESIZE  —  pointer events on each edge / corner handle
     ══════════════════════════════════════════════════════ */
  document.querySelectorAll('.resize-handle').forEach(function (handle) {

    handle.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      e.stopPropagation();
      handle.setPointerCapture(e.pointerId);

      const dir    = handle.dataset.dir;   /* n s e w nw ne sw se */
      const startX = e.clientX;
      const startY = e.clientY;
      const rect   = calc.getBoundingClientRect();
      const origL  = rect.left;
      const origT  = rect.top;
      const origW  = rect.width;
      const origH  = rect.height;
      const capId  = e.pointerId;

      document.body.classList.add('resizing');

      function onMove(ev) {
        if (ev.pointerId !== capId) return;

        const dx = ev.clientX - startX;
        const dy = ev.clientY - startY;
        let newL = origL, newT = origT, newW = origW, newH = origH;

        /* ── Horizontal ── */
        if (dir.includes('e')) {
          newW = Math.max(MIN_W, origW + dx);
        }
        if (dir.includes('w')) {
          const delta = clamp(dx, -(origW - MIN_W), origW);
          newW = origW - delta;
          newL = origL + delta;
        }

        /* ── Vertical ── */
        if (dir.includes('s')) {
          newH = Math.max(MIN_H, origH + dy);
        }
        if (dir.includes('n')) {
          const delta = clamp(dy, -(origH - MIN_H), origH);
          newH = origH - delta;
          newT = origT + delta;
        }

        /* Don't let the top-left corner go off-screen */
        newL = Math.max(0, newL);
        newT = Math.max(0, newT);

        /* Don't exceed viewport width/height */
        newW = Math.min(newW, window.innerWidth  - newL);
        newH = Math.min(newH, window.innerHeight - newT);

        setGeometry(newL, newT, newW, newH);
      }

      function onUp(ev) {
        if (ev.pointerId !== capId) return;
        document.body.classList.remove('resizing');
        saveGeometry();
        handle.removeEventListener('pointermove',   onMove);
        handle.removeEventListener('pointerup',     onUp);
        handle.removeEventListener('pointercancel', onUp);
      }

      handle.addEventListener('pointermove',   onMove);
      handle.addEventListener('pointerup',     onUp);
      handle.addEventListener('pointercancel', onUp);
    });
  });

})();

/* ============================================================
   SCALE OBSERVER
   Watches the calculator's size with ResizeObserver and writes
   --scale on :root so every calc(...*var(--scale)) font-size
   and the display boxes update live as the user resizes.

   Scale is derived from both width AND height so whichever
   dimension changes first drives the font growth.

   Base dimensions (default calculator size):
     width  = 700px
     height = ~440px  (measured after first render)
   ============================================================ */
(function () {
  'use strict';

  const calc     = document.getElementById('calculator');
  const root     = document.documentElement;

  /* Measure the natural height once the page has fully rendered */
  let baseW = 700;
  let baseH = 0;

  /* Wait one frame so the layout is complete before reading offsetHeight */
  requestAnimationFrame(function () {
    baseH = calc.offsetHeight || 440;

    /* Start observing — fires immediately with current size too */
    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(function (entries) {
        const entry = entries[0];
        if (!entry) return;
        const w = entry.contentRect.width  || calc.offsetWidth;
        const h = entry.contentRect.height || calc.offsetHeight;

        /* Scale = geometric mean of width-scale and height-scale.
           Using the mean (rather than min) means both directions
           contribute equally — the font grows smoothly in both
           horizontal and vertical resizes.                        */
        const sw = w / baseW;
        const sh = h / baseH;
        const scale = Math.sqrt(sw * sh);   /* geometric mean */

        /* Clamp: never below 0.55× (too tiny to read) or above 2.5× */
        const clamped = Math.min(2.5, Math.max(0.55, scale));

        root.style.setProperty('--scale', clamped.toFixed(4));
      }).observe(calc);
    } else {
      /* Fallback for browsers without ResizeObserver (rare) */
      window.addEventListener('resize', updateScale);
      updateScale();
    }

    function updateScale() {
      const w = calc.offsetWidth;
      const h = calc.offsetHeight;
      const scale = Math.sqrt((w / baseW) * (h / baseH));
      root.style.setProperty('--scale', Math.min(2.5, Math.max(0.55, scale)).toFixed(4));
    }
  });

})();
