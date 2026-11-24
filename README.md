# 🧮 GATE Virtual Scientific Calculator

> A fully featured, browser-based scientific calculator modelled after the **GATE (Graduate Aptitude Test in Engineering)** virtual calculator. No installation required — open `index.html` in any modern browser and start calculating.

---

## 📋 Table of Contents

1. [Quick Start](#1-quick-start)
2. [Project Structure](#2-project-structure)
3. [Interface Overview](#3-interface-overview)
4. [Button Layout Map](#4-button-layout-map)
5. [Basic Operations](#5-basic-operations)
6. [Scientific Functions](#6-scientific-functions)
   - [Trigonometry](#61-trigonometry)
   - [Hyperbolic Functions](#62-hyperbolic-functions)
   - [Logarithms](#63-logarithms)
   - [Powers & Roots](#64-powers--roots)
   - [Constants & Misc](#65-constants--misc)
7. [Memory System](#7-memory-system)
8. [Angle Mode — Deg vs Rad](#8-angle-mode--deg-vs-rad)
9. [Two-Step Operations](#9-two-step-operations)
10. [Keyboard Shortcuts](#10-keyboard-shortcuts)
11. [Themes](#11-themes)
12. [Drag & Resize](#12-drag--resize)
13. [Display Explained](#13-display-explained)
14. [Error Handling](#14-error-handling)
15. [Worked Examples](#15-worked-examples)
16. [Architecture & Code Guide](#16-architecture--code-guide)
17. [Browser Compatibility](#17-browser-compatibility)
18. [Frequently Asked Questions](#18-frequently-asked-questions)

---

## 1. Quick Start

```
GateVirtualCalculator/
├── index.html   ← Open this file in your browser
├── style.css
├── logic.js
└── README.md
```

**Steps:**
1. Download or clone the repository.
2. Double-click `index.html` **or** drag it into any modern browser.
3. The calculator appears centred on screen — ready to use immediately.

> ✅ **No server, no build step, no dependencies.** Pure HTML + CSS + JavaScript.

---

## 2. Project Structure

```
GateVirtualCalculator/
│
├── index.html          Structure  — all HTML markup, button grid, help modal
├── style.css           Appearance — 3D styling, 4 themes, responsive scaling
├── logic.js            Behaviour  — calculator engine, drag/resize, theme switcher
└── README.md           This documentation
```

### File responsibilities

| File | Size | What it does |
|------|------|--------------|
| `index.html` | ~10 KB | Declares every button with `data-action` attributes; links CSS & JS |
| `style.css` | ~25 KB | 11-column CSS Grid layout, 3D button shadows, 4 colour themes, `--scale` variable system |
| `logic.js` | ~29 KB | Calculator state machine, expression evaluator, drag engine, ResizeObserver font scaler |

---

## 3. Interface Overview

```
╔══════════════════════════════════════════════════════════════╗
║  Scientific Calculator          [Help] [☀] [—] [✕]          ║  ← Title Bar
╠══════════════════════════════════════════════════════════════╣
║                                         sin(30)=             ║  ← Expression Display
║                                               0.5            ║  ← Result Display
╠══════════════════════════════════════════════════════════════╣
║  mod  ◉Deg ○Rad              MC    MR    MS    M+    M-      ║  ← Row 1
║ sinh  cosh  tanh  Exp  (  )  [  ←  ]    C   +/-    √        ║  ← Row 2
║sinh⁻¹ cosh⁻¹ tanh⁻¹ log₂x ln log  7   8   9    /    %      ║  ← Row 3
║  π    e    n!  logᵧx  eˣ  10ˣ 4   5   6    ×   1/x          ║  ← Row 4
║ sin  cos  tan   xʸ   x³  x²  1   2   3    -   ╔═══╗         ║  ← Row 5
║sin⁻¹cos⁻¹tan⁻¹ ʸ√x  ³√  |x|  0       .   +   ║ = ║         ║  ← Row 6
╚══════════════════════════════════════════════╚═══╝══════════╝
```

### Colour coding

| Colour | Buttons | Meaning |
|--------|---------|---------|
| 🔵 **Blue gradient** | Title bar | Window chrome |
| ⬜ **Grey gradient** | All standard buttons | Default action |
| 🔴 **Red gradient** | `←` (backspace), `C` | Destructive / clear |
| 🟢 **Green gradient** | `=` (tall, spans 2 rows) | Evaluate |

---

## 4. Button Layout Map

The button area is a **CSS Grid of 11 columns × 6 rows**. The table below maps every button to its exact position.

| Row | Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 | Col 7 | Col 8 | Col 9 | Col 10 | Col 11 |
|-----|-------|-------|-------|-------|-------|-------|-------|-------|-------|--------|--------|
| **1** | `mod` | ◉ Deg ○ Rad *(spans 2–6)* | | | | | `MC` | `MR` | `MS` | `M+` | `M–` |
| **2** | `sinh` | `cosh` | `tanh` | `Exp` | `(` | `)` | `←` *(spans 7–8)* | | `C` | `+/-` | `√` |
| **3** | `sinh⁻¹` | `cosh⁻¹` | `tanh⁻¹` | `log₂x` | `ln` | `log` | `7` | `8` | `9` | `/` | `%` |
| **4** | `π` | `e` | `n!` | `logᵧx` | `eˣ` | `10ˣ` | `4` | `5` | `6` | `×` | `1/x` |
| **5** | `sin` | `cos` | `tan` | `xʸ` | `x³` | `x²` | `1` | `2` | `3` | `–` | `=` *(spans rows 5–6)* |
| **6** | `sin⁻¹` | `cos⁻¹` | `tan⁻¹` | `ʸ√x` | `³√` | `\|x\|` | `0` *(spans 7–8)* | | `.` | `+` | *(continued)* |

---

## 5. Basic Operations

### Arithmetic

| Button | Key | Operation | Example | Result |
|--------|-----|-----------|---------|--------|
| `+` | `+` | Addition | `7 + 3 =` | `10` |
| `–` | `-` | Subtraction | `10 – 4 =` | `6` |
| `×` | `*` | Multiplication | `6 × 7 =` | `42` |
| `/` | `/` | Division | `15 / 3 =` | `5` |
| `mod` | — | Modulo (remainder) | `10 mod 3 =` | `1` |
| `%` | `%` | Percentage | `200 % =` | `2` |

### Control buttons

| Button | Key | What it does |
|--------|-----|--------------|
| `=` | `Enter` or `=` | Evaluates the full expression |
| `C` | `Escape` | **Full reset** — clears expression, result, and pending state |
| `←` | `Backspace` | Deletes the **last character** of the expression |
| `+/-` | — | Negates the current result |
| `(` `)` | `(` `)` | Groups sub-expressions |

### How the display works while typing

```
You type:  3  +  4  ×  2
           ───────────────
Top bar:   3+4×2         ← live expression
Bottom:    11            ← live result (updates after each keypress)

You press: =
           ───────────────
Top bar:   3+4×2=
Bottom:    11            ← final result
```

> 💡 The result display updates **live as you type** — you can see the answer forming before you press `=`.

---

## 6. Scientific Functions

### 6.1 Trigonometry

All trig functions respect the **Deg / Rad** mode selector.

| Button | Formula | Deg example | Result |
|--------|---------|-------------|--------|
| `sin` | sin(x) | `sin(30)` | `0.5` |
| `cos` | cos(x) | `cos(60)` | `0.5` |
| `tan` | tan(x) | `tan(45)` | `1` |
| `sin⁻¹` | arcsin(x) | `sin⁻¹(0.5)` | `30°` |
| `cos⁻¹` | arccos(x) | `cos⁻¹(0.5)` | `60°` |
| `tan⁻¹` | arctan(x) | `tan⁻¹(1)` | `45°` |

> ⚠️ **Domain check:** `sin⁻¹` and `cos⁻¹` require input in `[−1, 1]`. Values outside this range produce `Error`.

#### Trig function domains & ranges

```
Function    Domain          Range (Deg mode)
─────────────────────────────────────────────
sin(x)      all reals       [-1,  1]
cos(x)      all reals       [-1,  1]
tan(x)      x ≠ 90+180n     (-∞, +∞)
sin⁻¹(x)   [-1, 1]         [-90°, 90°]
cos⁻¹(x)   [-1, 1]         [0°, 180°]
tan⁻¹(x)   all reals       (-90°, 90°)
```

---

### 6.2 Hyperbolic Functions

Hyperbolic functions are **not** affected by the Deg/Rad setting — they always operate on plain numbers.

| Button | Formula | Example | Result |
|--------|---------|---------|--------|
| `sinh` | (eˣ − e⁻ˣ) / 2 | `sinh(1)` | `1.1752...` |
| `cosh` | (eˣ + e⁻ˣ) / 2 | `cosh(0)` | `1` |
| `tanh` | sinh/cosh | `tanh(0)` | `0` |
| `sinh⁻¹` | ln(x + √(x²+1)) | `sinh⁻¹(0)` | `0` |
| `cosh⁻¹` | ln(x + √(x²−1)) | `cosh⁻¹(1)` | `0` |
| `tanh⁻¹` | ½·ln((1+x)/(1−x)) | `tanh⁻¹(0)` | `0` |

> ⚠️ `cosh⁻¹` requires x ≥ 1. `tanh⁻¹` requires −1 < x < 1.

---

### 6.3 Logarithms

| Button | Base | Formula | Example | Result |
|--------|------|---------|---------|--------|
| `log` | 10 | log₁₀(x) | `log(100)` | `2` |
| `ln` | e | logₑ(x) | `ln(e)` | `1` |
| `log₂x` | 2 | log₂(x) | `log₂(8)` | `3` |
| `logᵧx` | y | logᵧ(x) | `base=2`, `x=8` | `3` |

> ⚠️ All logarithms require **x > 0**. Inputting 0 or a negative number gives `Error`.

**Using logᵧx (custom base) — two-step operation:**
```
Step 1 → Enter the BASE (e.g. 2)
Step 2 → Press  logᵧx
Step 3 → Enter the VALUE (e.g. 8)
Step 4 → Press  =
Result → 3
```

---

### 6.4 Powers & Roots

| Button | Operation | Example | Result |
|--------|-----------|---------|--------|
| `x²` | Square | `5 x²` | `25` |
| `x³` | Cube | `3 x³` | `27` |
| `xʸ` | x to power y | `2 xʸ 10 =` | `1024` |
| `√` | Square root | `√(144)` | `12` |
| `³√` | Cube root | `³√(125)` | `5` |
| `ʸ√x` | y-th root of x | `x=27, y=3` | `3` |
| `eˣ` | e to power x | `eˣ(1)` | `2.71828...` |
| `10ˣ` | 10 to power x | `10ˣ(3)` | `1000` |
| `1/x` | Reciprocal | `1/x (4)` | `0.25` |

**Using xʸ — two-step operation:**
```
Step 1 → Enter the BASE x (e.g. 2)
Step 2 → Press  xʸ
Step 3 → Enter the EXPONENT y (e.g. 10)
Step 4 → Press  =
Result → 1024
```

**Using ʸ√x — two-step operation:**
```
Step 1 → Enter the RADICAND x (e.g. 125)
Step 2 → Press  ʸ√x
Step 3 → Enter the DEGREE y (e.g. 3)
Step 4 → Press  =
Result → 5     (cube root of 125)
```

---

### 6.5 Constants & Misc

| Button | Value / Operation | Notes |
|--------|------------------|-------|
| `π` | 3.14159265358979... | Inserts pi into expression |
| `e` | 2.71828182845904... | Inserts Euler's number |
| `n!` | Factorial | Integer input only; max 170! |
| `\|x\|` | Absolute value | Works on any real number |
| `Exp` | Scientific notation | `2 Exp 3` → `2e3` = 2000 |

#### Factorial limits

```
n       n!
─────────────────────────────
0       1
5       120
10      3 628 800
20      2.432902e+18
50      3.041409e+64
100     9.332622e+157
170     7.257416e+306   ← maximum
171     Infinity        ← overflow
```

---

## 7. Memory System

The calculator has a **single memory register** that persists across calculations within the same session.

| Button | Action | Detail |
|--------|--------|--------|
| `MS` | **Memory Store** | Saves the current result, replacing what was stored |
| `MR` | **Memory Recall** | Pastes the stored value into the expression |
| `MC` | **Memory Clear** | Resets the register to `0` |
| `M+` | **Memory Add** | Adds current result to the stored value |
| `M–` | **Memory Subtract** | Subtracts current result from the stored value |

### Memory workflow example

```
Goal: compute (sin 30°) + (cos 60°) without retyping

1.  Type  30  → press  sin   → result: 0.5
2.  Press  MS                 → memory = 0.5
3.  Press  C
4.  Type  60  → press  cos   → result: 0.5
5.  Press  M+                 → memory = 1.0
6.  Press  MR                 → pastes 1 into expression
7.  Press  =                  → result: 1
```

---

## 8. Angle Mode — Deg vs Rad

The **Deg / Rad** radio buttons in Row 1 control how all trigonometric and inverse-trigonometric functions interpret their arguments.

```
                 ┌──────────────┬──────────────────────────────────────────┐
                 │   Deg mode   │             Rad mode                     │
 ────────────────┼──────────────┼──────────────────────────────────────────┤
  sin(90)        │    1.000     │    0.8940  (sin of 90 radians)           │
  sin(π/2)       │    0.0274    │    1.000   (sin of 1.5708 rad)           │
  cos⁻¹(0.5)     │   60.000°   │    1.0472 rad                            │
  tan(45)        │    1.000     │   -1.6197  (tan of 45 radians)           │
 ────────────────┴──────────────┴──────────────────────────────────────────┘
```

> 🎓 **GATE Exam tip:** The GATE virtual calculator defaults to **Degree** mode. Always check the mode before calculating angles.

### Conversion formula reference

```
Degrees → Radians :  radians = degrees × π / 180
Radians → Degrees :  degrees = radians × 180 / π

Common angles:
  0°   =  0       rad
  30°  =  π/6   ≈ 0.5236 rad
  45°  =  π/4   ≈ 0.7854 rad
  60°  =  π/3   ≈ 1.0472 rad
  90°  =  π/2   ≈ 1.5708 rad
  180° =  π     ≈ 3.1416 rad
  360° =  2π    ≈ 6.2832 rad
```

---

## 9. Two-Step Operations

Three functions require **two separate inputs** separated by pressing the function button:

| Function | Step 1 | Button | Step 2 | Press | Result |
|----------|--------|--------|--------|-------|--------|
| **xʸ** | Enter base `x` | `xʸ` | Enter exponent `y` | `=` | xʸ |
| **ʸ√x** | Enter radicand `x` | `ʸ√x` | Enter degree `y` | `=` | x^(1/y) |
| **logᵧx** | Enter base `y` | `logᵧx` | Enter argument `x` | `=` | log_y(x) |

### Visual flow diagram

```
 ┌─────────────┐    press      ┌──────────────┐    type     ┌─────────────┐    press   ┌────────┐
 │  Enter  x   │ ──────────→  │  Function btn │ ──────────→ │  Enter  y   │ ─────────→ │   =    │
 │  (base /    │   xʸ / ʸ√x / │  Top display  │             │  (exponent/ │            │ Result │
 │  radicand)  │   logᵧx       │  shows prompt │             │  degree/    │            │ shown  │
 └─────────────┘               └──────────────┘             │  argument)  │            └────────┘
                                                             └─────────────┘

 While waiting for the second input:
   ✓  Digit keys (0–9) and decimal point work normally
   ✓  = finalises the operation
   ✓  C cancels and resets everything
   ✗  All other buttons are ignored
```

---

## 10. Keyboard Shortcuts

The full keyboard is supported — you never need to reach for the mouse for numeric/operator input.

| Key(s) | Action |
|--------|--------|
| `0` – `9` | Enter digit |
| `.` | Decimal point |
| `+` | Addition |
| `-` | Subtraction |
| `*` | Multiplication |
| `/` | Division |
| `%` | Percentage |
| `(` | Open parenthesis |
| `)` | Close parenthesis |
| `Enter` or `=` | Evaluate |
| `Backspace` | Delete last character |
| `Escape` | Clear all (same as `C`) |

> 🖱️ **Mouse-only operations:** `sin`, `cos`, `log`, memory, theme, drag, resize — these have no keyboard shortcut and require clicking.

---

## 11. Themes

Click the **theme button** (the icon next to `Help` in the title bar) to cycle through 4 visual themes. The chosen theme is **saved automatically** in `localStorage` and restored on the next visit.

```
Click count → Theme
─────────────────────────────────────────────────────────────────
  1st click  →  ◑  Dark Graphite    (black body, green display)
  2nd click  →  ✦  Midnight Purple  (deep purple, lilac display)
  3rd click  →  ★  Solar Gold       (dark amber, golden display)
  4th click  →  ☀  Classic Blue     (back to default)
```

### Theme comparison

| Property | ☀ Classic Blue | ◑ Dark Graphite | ✦ Midnight Purple | ★ Solar Gold |
|----------|---------------|-----------------|-------------------|--------------|
| Body colour | Light grey-blue | Charcoal black | Deep violet | Dark brown |
| Title bar | Blue gradient | Dark grey | Purple gradient | Amber gradient |
| Display bg | Light green | Near-black | Near-black | Near-black |
| Display text | Dark green | Bright green | Lilac | Gold |
| Button colour | Blue-grey | Dark grey | Purple-grey | Brown |
| Best for | Daytime use | Dark room | Night use | Warm lighting |

---

## 12. Drag & Resize

The calculator behaves like a **floating desktop window** — it can be freely moved and resized.

### Dragging

```
 ┌──────────────────────────────────────────┐
 │  Scientific Calculator   [Help][☀][—][✕] │  ← Grab anywhere on the
 │  ← drag zone (title bar)                 │     title bar text area
 └──────────────────────────────────────────┘
      ↕ cursor changes to  ✋ grab
        while dragging  →  ✊ grabbing
```

- Click and hold on the **title bar text area** (not on a button).
- Drag to any position on the screen.
- The calculator is **clamped** so at least 60 px of the title bar always stays inside the viewport.
- Position is saved in `localStorage` and restored on page reload.

### Resizing — 8 directions

Invisible handles surround the calculator. Move the cursor to any edge or corner to reveal the resize cursor:

```
  nw ──── n ──── ne
   │               │
   w    [calc]    e
   │               │
  sw ──── s ──── se
```

| Handle | Cursor | Resizes |
|--------|--------|---------|
| `n` (top edge) | `↕` | Height from top |
| `s` (bottom edge) | `↕` | Height from bottom |
| `e` (right edge) | `↔` | Width from right |
| `w` (left edge) | `↔` | Width from left |
| `nw` (top-left corner) | `↖` | Width + height simultaneously |
| `ne` (top-right corner) | `↗` | Width + height simultaneously |
| `sw` (bottom-left corner) | `↙` | Width + height simultaneously |
| `se` (bottom-right corner) | `↘` | Width + height simultaneously |

### Minimum size constraints

| Dimension | Minimum |
|-----------|---------|
| Width | 420 px |
| Height | 320 px |

### Font & layout scaling

As you resize, **every element scales proportionally**:
- Button font sizes scale via a CSS `--scale` variable.
- The 6 button rows stretch to fill available height using `1fr` CSS Grid rows.
- Display box heights scale with `--scale`.
- The scale factor is computed as the **geometric mean** of the width ratio and height ratio, so resizing in either direction drives font growth smoothly.

```
scale = √( (current_width / 700) × (current_height / base_height) )
        clamped to range [0.55 × , 2.5 ×]
```

---

## 13. Display Explained

The calculator has **two display rows**:

```
╔══════════════════════════════════════════════╗
║                        log(100)=              ║  ← Expression display (top)
║                                 2             ║  ← Result display (bottom)
╚══════════════════════════════════════════════╝
```

| Display | Purpose | Font style | Updates |
|---------|---------|-----------|---------|
| **Top** (expression) | Shows what you typed, e.g. `3+4×2=` | Monospace, smaller | After each keypress |
| **Bottom** (result) | Shows the numeric answer | Monospace, bold, larger | Live while typing + after `=` |

### Live evaluation

The result display updates in real time:

```
You type:   1  +  2  +  3
                         ↓
Bottom:     1 → 3 → 6     (updates after each digit/operator)
```

### After pressing `=`

```
Top display:   1+2+3=
Bottom:        6

Next keypress behaviour:
  → digit (e.g. 7)   : starts a NEW expression "7"
  → operator (e.g. +): continues "6+" (uses previous result)
```

---

## 14. Error Handling

| Situation | Display shows | Recovery |
|-----------|--------------|----------|
| `√` of negative number | `Error` (red) | Press `C` or `←` |
| `log` / `ln` of 0 or negative | `Error` (red) | Press `C` or `←` |
| `1/x` where x = 0 | `Error` (red) | Press `C` or `←` |
| `asin` / `acos` outside [−1, 1] | `Error` (red) | Press `C` or `←` |
| `acosh` of x < 1 | `Error` (red) | Press `C` or `←` |
| `atanh` outside (−1, 1) | `Error` (red) | Press `C` or `←` |
| Division by zero | `Infinity` | Press `C` |
| `n!` for negative input | `Error` (red) | Press `C` |
| `n!` for n > 170 | `Infinity` | — |
| Malformed expression | `Error` (red) | Press `C` |

> 💡 After an error, pressing **any digit** automatically clears the error and starts a fresh expression.

---

## 15. Worked Examples

### Example 1 — Basic arithmetic with parentheses
```
Goal: (3 + 4) × (2 − 1)

Keypresses: ( 3 + 4 ) × ( 2 − 1 ) =
Result:     7
```

### Example 2 — sin of 30 degrees
```
Ensure:  ◉ Deg  is selected

Keypresses: 3 0  →  sin
Result:     0.5
```

### Example 3 — Cube root of 125 using ʸ√x
```
Keypresses: 1 2 5  →  ʸ√x  →  3  →  =
Expression: 125^(1/3)=
Result:     5
```

### Example 4 — log base 2 of 1024
```
Keypresses: 2  →  logᵧx  →  1 0 2 4  →  =
Expression: log_2(1024)=
Result:     10
```

### Example 5 — 2¹⁰ using xʸ
```
Keypresses: 2  →  xʸ  →  1 0  →  =
Expression: 2^10=
Result:     1024
```

### Example 6 — Using memory for multi-step calculation
```
Goal: (sin²30°) + (cos²30°)  should equal 1

1. Enter 30  →  sin  → result: 0.5
2. Press  x²              → result: 0.25
3. Press  MS              (memory = 0.25)
4. Press  C
5. Enter 30  →  cos  → result: 0.866025...
6. Press  x²              → result: 0.75
7. Press  M+              (memory = 0.25 + 0.75 = 1.0)
8. Press  MR              → pastes 1
Result: 1   ✓  (Pythagorean identity confirmed)
```

### Example 7 — Scientific notation
```
Goal: 6.022 × 10²³  (Avogadro's number)

Keypresses: 6 . 0 2 2  →  Exp  →  2 3
Expression: 6.022e23
Result:     6.022e+23
```

### Example 8 — 10! (factorial)
```
Keypresses: 1 0  →  n!
Expression: 10!=
Result:     3628800
```

---

## 16. Architecture & Code Guide

### State machine (`logic.js`)

The calculator maintains a plain JavaScript object as its single source of truth:

```
state = {
  expr            : string   // text shown in top display
  result          : string   // text shown in bottom display
  memory          : number   // stored memory register value
  justEvaluated   : boolean  // true right after '=' was pressed
  awaitingPow     : boolean  // mid-way through xʸ operation
  awaitingYroot   : boolean  // mid-way through ʸ√x operation
  awaitingLogy    : boolean  // mid-way through logᵧx operation
  pendingBase     : number   // saved first operand for two-step ops
  isError         : boolean  // true when result display shows error
}
```

### Call flow for a button press

```
User clicks button
       │
       ▼
  handleAction(action)
       │
       ├─ two-step interceptor  ──────────────────── resolves xʸ / ʸ√x / logᵧx
       │
       ├─ switch (action)
       │       ├─ digit/operator → appendExpr() → evaluate() → update display
       │       ├─ =              → evaluate()   → setResult()
       │       ├─ clear          → reset state  → updateDisplay()
       │       ├─ backspace      → slice expr   → evaluate()
       │       ├─ trig/hyp/log   → Math.xxx()   → setResult()
       │       ├─ memory         → update state.memory
       │       └─ ...
       │
       └─ display updated
```

### CSS Grid layout

```
#btn-area {
  display: grid;
  grid-template-columns: repeat(11, 1fr);   /* 11 equal columns */
  grid-template-rows:    repeat(6, 1fr);    /* 6 equal rows */
  gap: 5px;
}
```

Each button is placed explicitly:
```css
#r3-7  { grid-column: 7; grid-row: 3; }  /* digit 7 */
#r5-eq { grid-column: 11; grid-row: 5/7; }  /* = spans rows 5–6 */
```

### Scaling system

```
ResizeObserver watches #calculator
         │
         ▼
   measures width (w) and height (h)
         │
         ▼
   scale = √( (w/700) × (h/baseH) )   ← geometric mean
   scale = clamp(scale, 0.55, 2.5)
         │
         ▼
   document.documentElement
     .style.setProperty('--scale', scale)
         │
         ▼
   CSS: font-size: calc(13px * var(--scale))
        height:    calc(28px * var(--scale))
        ...etc
```

### Persistence (localStorage)

| Key | Stores | Restored on |
|-----|--------|-------------|
| `calcTheme` | Active theme index (0–3) | Page load |
| `calcGeometry` | `{x, y, w, h}` of calculator window | Page load |

---

## 17. Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome / Edge | 88+ | ✅ Full support |
| Firefox | 90+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Opera | 74+ | ✅ Full support |
| IE 11 | — | ❌ Not supported |

**Required browser features:**
- CSS Grid (all modern browsers)
- CSS Custom Properties / variables
- `ResizeObserver` API
- `localStorage`
- ES6 (`const`, `let`, arrow functions, template literals)

---

## 18. Frequently Asked Questions

**Q: Why is my trig result wrong?**
> Check the **Deg / Rad** selector. `sin(90)` gives `1` in Deg mode but `0.894` in Rad mode.

**Q: I pressed `xʸ` but nothing happened — what do I do?**
> After pressing `xʸ`, type the exponent and press `=`. The top display will show `base^(?)` to prompt you. If you change your mind, press `C` to cancel.

**Q: Can I chain operations after `=`?**
> Yes. After `=`, pressing an **operator** (`+`, `−`, `×`, `/`) automatically continues from the last result. Pressing a **digit** starts a new expression.

**Q: The calculator disappeared off-screen. How do I get it back?**
> Refresh the page. If the saved position is off-screen, the viewport-clamp logic will reposition it on the next browser resize, or you can clear `localStorage` in browser DevTools (`Application → Local Storage → Delete calcGeometry`).

**Q: Does it work offline?**
> Yes. All files are local — no CDN, no network calls, no service worker needed.

**Q: What is the maximum precision?**
> JavaScript uses IEEE 754 double precision (64-bit), giving ~15–17 significant decimal digits. The display trims to 12 significant figures to avoid showing floating-point noise.

**Q: Why does `0.1 + 0.2` show `0.3` and not `0.30000000000000004`?**
> The `formatNum()` function formats using `toPrecision(12)` then `parseFloat()`, which rounds away the floating-point artefact.

**Q: How do I enter Avogadro's number (6.022 × 10²³)?**
> Type `6.022`, press `Exp`, type `23`. The expression becomes `6.022e23`.

**Q: Can I use the calculator on a mobile device?**
> The calculator is designed for desktop mouse interaction. It works on mobile browsers but resize and drag gestures require a mouse or trackpad. Touch support is not currently implemented.

---

## 📄 License

This project is provided for educational purposes in the context of GATE exam preparation. No external libraries are used.

---

## 🙏 Acknowledgements

Modelled after the official **GATE virtual scientific calculator** interface as used in GATE examinations conducted by IITs and IISc, India.

---

*README last updated: 2026 — covers calculator version with 4 themes, drag/resize, and proportional font scaling.*
