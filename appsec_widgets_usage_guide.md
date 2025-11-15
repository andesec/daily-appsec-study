# AppSec Widgets – Usage Guide

This guide assumes you have loaded `appsec-theme.js` and `appsec-widgets.js`, and that `window.AppSecWidgets` is available.

All widgets share the following behavior:

- They render a **`.widget-header`** and **`.widget-body`** inside the div they are invoked on.
- They automatically add the **`widget`** CSS class on the container div.
- Most widgets accept an optional **`title`** parameter to override the default heading.

> In all examples, `containerId` is the **id** of an existing `<div>` element.

---

## 1. HTTPSimulator

**What it does**  
Simple HTTP request/response simulator for teaching HTTP, headers, and basic security issues.

**API**

```js
AppSecWidgets.HTTPSimulator.create(containerId, config?)
```

**Parameters**

- `containerId` (string)
  - Required. The id of the container div.
- `config` (object, optional)
  - `title` (string, optional)
    - Widget heading. Default: `"🌐 HTTP Request/Response Simulator"`.
  - `placeholder` (string, optional)
    - Initial example HTTP request shown in the textarea.

---

## 2. ConfigDiff

**What it does**  
Shows an insecure and secure configuration side by side and lets the learner toggle between them. Code blocks are rendered with line numbers (via `AppSec.CodeDisplay.addLineNumbers`).

**API**

```js
AppSecWidgets.ConfigDiff.create(containerId, title?, insecureCode, secureCode)
```

**Parameters**

- `containerId` (string)
- `title` (string, optional)
  - Custom title. Default: `"🔒 Config Diff Viewer"`.
- `insecureCode` (string)
  - Source of the vulnerable configuration.
- `secureCode` (string)
  - Source of the hardened configuration.

> The widget automatically escapes HTML and adds line numbers to both code blocks (if `AppSec.CodeDisplay.addLineNumbers` exists).

---

## 3. FlowVisualizer

**What it does**  
Step-by-step flow visualizer that shows a sequence of steps with Next/Previous controls.

**API**

```js
// Option A: simple list of steps
AppSecWidgets.FlowVisualizer.create(containerId, stepsArray, title?)

// Option B: config object
AppSecWidgets.FlowVisualizer.create(containerId, {
  steps: [...],
  title?: string
})
```

**Parameters**

- `containerId` (string)
- `stepsArray` (array of objects) – or `steps` in a config object
  - Each step:
    - `title` (string)
    - `description` (string)
- `title` (string, optional)
  - Custom widget title. Default: `"🔄 Flow Visualizer"`.

---

## 4. LogAnalyzer

**What it does**  
Renders a security log table with severity highlighting and a Refresh button.

**API**

```js
AppSecWidgets.LogAnalyzer.create(containerId, config?)
AppSecWidgets.LogAnalyzer.refresh(containerId)
```

**Parameters** (for `create`)

- `containerId` (string)
- `config` (object, optional)
  - `title` (string, optional)  
    Default: `"🔍 Security Log Analyzer"`.
  - `columns` (string[], optional)  
    Default: `['Time', 'Event', 'User', 'IP', 'Status']`.
  - `logs` (array of objects, optional)
    - Each log:
      - `time` (string)
      - `event` (string)
      - `user` (string)
      - `ip` (string)
      - `status` (string) – e.g. `"success"`, `"blocked"`, `"warning"`
      - `severity` (string, optional) – e.g. `"warning"`, `"danger"`, used for row styling.
  - `placeholder` (string, optional)  
    Text shown when there are no logs.

---

## 5. ProgressTracker

**What it does**  
Shows progress per category (e.g. topics or modules) with percentage bars and checklist items.

**API**

```js
AppSecWidgets.ProgressTracker.create(containerId, config?)
```

**Parameters**

- `containerId` (string)
- `config` (object, optional)
  - `title` (string, optional)  
    Default: `"📊 Security Skills Progress"`.
  - `categories` (array of objects, optional)
    - Each category:
      - `icon` (string, optional) – e.g. `"📘"`.
      - `name` (string)
      - `progress` (number, 0–100)
      - `items` (array of objects, optional)
        - Each item:
          - `name` (string)
          - `completed` (boolean)
  - `placeholder` (string, optional)  
    Shown when no categories exist.

---

## 6. AttackSandbox

**What it does**  
Interactive sandbox for trying attack payloads (XSS, SQLi, etc.) against sample scenarios.

**API**

```js
AppSecWidgets.AttackSandbox.create(containerId, config?)
AppSecWidgets.AttackSandbox.selectScenario(containerId, index)
AppSecWidgets.AttackSandbox.executeAttack(containerId)
```

**Parameters** (for `create`)

- `containerId` (string)
- `config` (object, optional)
  - `title` (string, optional)  
    Default: `"🎯 Attack Vector Sandbox"`.
  - `scenarios` (array of objects, optional)
    - Each scenario:
      - `name` (string)
      - `description` (string)
      - `payload` (string) – default payload shown in textarea
      - `response` (string, optional) – default response text
      - `checkPayload` (function, optional) – custom function `(payload: string) => string`
      - `notifyType` (string, optional) – e.g. `"success"`, `"warning"`, used with `AppSec.Notify`
      - `notifyMessage` (string, optional)
  - `placeholder` (string, optional)  
    Shown when no scenarios exist.

---

## 7. CertificateInspector

**What it does**  
Displays TLS certificate metadata and highlights validity/expiry.

**API**

```js
AppSecWidgets.CertificateInspector.create(containerId, config?)
```

**Parameters**

- `containerId` (string)
- `config` (object, optional)
  - `title` (string, optional)  
    Default: `"🔐 TLS Certificate Inspector"`.
  - `certificate` (object, optional)
    - `commonName` (string)
    - `issuer` (string)
    - `validFrom` (string/date)
    - `validTo` (string/date)
    - `serialNumber` (string)
    - `signatureAlgorithm` (string)
  - `placeholder` (string, optional)  
    Shown if `certificate` is not provided.

---

## 8. CodeReviewChecker

**What it does**  
Shows a code snippet with line-numbered display and a list of security findings.

**API**

```js
AppSecWidgets.CodeReviewChecker.create(containerId, config?)
```

**Parameters**

- `containerId` (string)
- `config` (object, optional)
  - `title` (string, optional)  
    Default: `"🔎 Security Code Review"`.
  - `code` (string)  
    Source code under review. Required for the full view.
  - `vulnerabilities` (array of objects, optional)
    - Each vulnerability:
      - `severity` (string) – `"critical"`, `"high"`, `"medium"`, `"low"`, `"info"`
      - `title` (string)
      - `description` (string)
      - `line` (number, optional)
      - `recommendation` (string, optional)
  - `placeholder` (string, optional)  
    Shown if `code` is missing.

> Code is HTML-escaped and passed to `AppSec.CodeDisplay.addLineNumbers` if available.

---

## 9. VulnerabilityTimeline

**What it does**  
Visual timeline of vulnerabilities, with severity coloring and optional external links.

**API**

```js
AppSecWidgets.VulnerabilityTimeline.create(containerId, config?)
```

**Parameters**

- `containerId` (string)
- `config` (object, optional)
  - `title` (string, optional)  
    Default: `"📅 Vulnerability Timeline"`.
  - `vulnerabilities` (array of objects, optional)
    - Each vulnerability:
      - `id` (string, optional) – e.g. `"CVE-2025-1234"`
      - `date` (string)
      - `title` (string)
      - `description` (string)
      - `severity` (string, optional) – `"Critical"`, `"High"`, `"Medium"`, `"Low"`
      - `link` (string, optional) – URL to external details
  - `placeholder` (string, optional)  
    Shown when list is empty.

---

## 10. Quiz

**What it does**  
Flexible quiz widget supporting a step-by-step mode and a classic "all questions at once" mode.

**API**

```js
AppSecWidgets.Quiz.create(containerId, config)
```

**Parameters**

- `containerId` (string)
- `config` (object, required)
  - `title` (string, optional)  
    Default: `"🗘️ Knowledge Check"`.
  - `intro` (string, optional)  
    Introductory text shown before the quiz.
  - `mode` (string, optional)  
    - `"step"` (default): one question at a time with Start button.
    - `"classic"`: all questions shown with a single "Check Answers" button.
  - `questions` (array of objects, required)
    - Each question:
      - `text` (string)
      - `options` (array of objects)
        - Each option:
          - `value` (string)
          - `label` (string)
          - `correct` (boolean) – mark correct answer(s).

> In classic mode, radio buttons are used (single correct answer per question assumed).

---

## 11. ValidationTrainer

**What it does**  
Lets learners test inputs against regex-based validation rules (email, URL, etc.).

**API**

```js
AppSecWidgets.ValidationTrainer.create(containerId, config?)
AppSecWidgets.ValidationTrainer.updateExample(containerId)
AppSecWidgets.ValidationTrainer.validate(containerId)
```

**Parameters** (for `create`)

- `containerId` (string)
- `config` (object, optional)
  - `title` (string, optional)  
    Default: `"✅ Input Validation Trainer"`.
  - `patterns` (object, optional)  
    Map from pattern key to pattern config. If omitted, built-in patterns are used.
    - Each pattern config:
      - `regex` (RegExp)
      - `examples` (string[])
      - `description` (string)
      - `label` (string, optional) – label in dropdown. Defaults to a humanized key.

---

## 12. ThreatModel

**What it does**  
Guided STRIDE threat-modeling canvas with export to JSON or Markdown.

**API**

```js
AppSecWidgets.ThreatModel.create(containerId, prefill?, options?)
AppSecWidgets.ThreatModel.exportModel(containerId)      // JSON
AppSecWidgets.ThreatModel.exportMarkdown(containerId)   // Markdown
```

**Parameters** (for `create`)

- `containerId` (string)
- `prefill` (object, optional)  
  Pre-populate fields from an existing model.
  - `system` (object, optional)
    - `name` (string)
    - `type` (string)
    - `actors` (string)
    - `assets` (string)
    - `entryPoints` (string)
    - `boundaries` (string)
  - `stride` (object, optional)
    - `spoofing` (string)
    - `tampering` (string)
    - `repudiation` (string)
    - `information` (string) – Information Disclosure
    - `dos` (string) – Denial of Service
    - `elevation` (string) – Elevation of Privilege
- `options` (object, optional)
  - `title` (string, optional)  
    Default: `"🎯 Threat Modeling Canvas (STRIDE)"`.

**Export behavior**

- `exportModel(containerId)` downloads a `threat-model-stride.json` file.
- `exportMarkdown(containerId)` downloads a `threat-model-stride.md` file.

---

## 13. APITester

**What it does**  
Simulates API authentication and rate limiting against configurable endpoints.

**API**

```js
AppSecWidgets.APITester.create(containerId, config?)
AppSecWidgets.APITester.testAuth(containerId)
AppSecWidgets.APITester.testRateLimit(containerId)
```

**Parameters** (for `create`)

- `containerId` (string)
- `config` (object, optional)
  - `title` (string, optional)  
    Default: `"🐜 API Security Tester"`.
  - `endpoints` (array of objects, optional)
    - Each endpoint:
      - `value` (string) – internal key.
      - `label` (string) – label in dropdown.
      - `requiresAuth` (boolean)
      - `requiresAdmin` (boolean, optional)
  - `rateLimit` (number, optional)  
    Max allowed requests before 429 simulation. Default: `3`.
  - `responses` (object, optional)  
    Structure keyed by endpoint `value`. Defaults support `public`, `protected`, `admin`.
    - `public` endpoint example:
      - `{ status: 200, message: 'Public data accessible' }`
    - `protected` endpoint example:
      - `noAuth` – `{ status, error }`
      - `invalid` – `{ status, error }`
      - `success` – `{ status, message, user }`
    - `admin` endpoint example:
      - `noAuth` – `{ status, error }`
      - `forbidden` – `{ status, error }`
      - `success` – `{ status, message, users }`

> `testRateLimit` will simulate multiple requests and display where the rate limit is exceeded.

---


## 1. Theme & Utility API (`window.AppSec`)

The theme script exposes a global `window.AppSec` object:

```js
window.AppSec = {
  ThemeManager,
  CodeDisplay,
  Notify
};
```

### ThemeManager

**Purpose:** Handle light/dark theme and provide a floating toggle button.

- **`ThemeManager.init()`**
  - Reads `localStorage['appsec-theme']` (defaults to `"light"`).
  - Sets `document.documentElement.dataset.theme` / `data-theme`.
  - Creates a floating button with class `theme-toggle` and appends it to `<body>`.
  - Called automatically on `DOMContentLoaded`, but you can call it manually in single‑page flows.

- **`ThemeManager.setTheme(theme)`**
  - `theme`: `"light"` or `"dark"`.
  - Sets `data-theme` attribute and persists to `localStorage`.

- **`ThemeManager.toggleTheme()`**
  - Toggles between `"light"` and `"dark"`, then calls `updateToggleButton()`.

- **`ThemeManager.updateToggleButton()`**
  - Updates `.theme-toggle` button label:
    - Light → shows “🌙 Dark Mode”
    - Dark → shows “☀️ Light Mode”

**Key classes (provided by CSS):**

- `theme-toggle` – floating theme switch button.

---

### CodeDisplay

**Purpose:** Enhance `<pre><code>` blocks with line numbers and highlighting.

- **`CodeDisplay.addLineNumbers(codeElement)`**
  - Wraps `codeElement` content into:
    - `.code-with-lines`
    - `.line-numbers`
    - `.code-content`
  - Call this after the code block is in the DOM.

- **`CodeDisplay.highlightLines(codeElement, lineNumbers)`**
  - `lineNumbers`: array of 1‑based line numbers to highlight.
  - Adds inline highlight (background `var(--color-warning)` and bold) to the selected rows in `.line-numbers`.

**Key classes:**

- `code-with-lines`, `line-numbers`, `code-content`.

---

### Notify

**Purpose:** Small toast-style notifications.

- **`Notify.show(message, type = 'info', duration = 3000)`**
  - `message`: string to display.
  - `type`: one of `"success" | "danger" | "warning" | "info"`.
  - `duration`: milliseconds before auto‑dismiss.
  - Renders a fixed positioned `<div>` with class `alert-{type}-solid` and a slide‑in/out animation.

**Key classes (expected in CSS):**

- `alert-success-solid`, `alert-danger-solid`, `alert-warning-solid`, `alert-info-solid`.

When used from widgets, call via `window.AppSec.Notify.show(...)`.

### CSS Classes

### Layout
- `.container` - Max-width 1400px, responsive padding
- `.grid`, `.grid-2`, `.grid-3` - Responsive grids
- `.card` - Card container with shadow - Use with <sectiom> element
- `.card-header` and `.card-body` for organizing the card nicely in responsive fashion.
- `.widget` - Widget container with header/body

### Typography
- `.card-header` - Card headings - Use for subsection headings as well.
- `code` - Inline code (colorized)
- `pre code` - Code blocks (no colorization)

### Buttons
- `.btn` - Base button
- `.btn-primary`, `.btn-danger`, `.btn-success`, `.btn-secondary` - Colored variants

### Alerts (Solid)
- `.alert-danger-solid`, `.alert-warning-solid`, `.alert-success-solid`, `.alert-info-solid` - Full-color backgrounds

### Callouts (Tinted Backgrounds)
- `.callout-danger`, `.callout-warning`, `.callout-success`, `.callout-info` - Colorized backgrounds with border

### Tables
- `table` - Styled tables
- `.table-container` - Horizontal scroll wrapper

### Utilities
- `.text-center`, `.text-right`
- `.mt-1`, `.mb-1`, `.p-1` - Spacing utilities

