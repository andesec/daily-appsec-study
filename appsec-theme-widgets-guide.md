# AppSec Theme & Widgets – Integration Guide

This guide documents the JavaScript API and expected data structures for the AppSec theme utilities and interactive widgets.

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

### 1.1 ThemeManager

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

### 1.2 CodeDisplay

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

### 1.3 Notify

**Purpose:** Small toast-style notifications.

- **`Notify.show(message, type = 'info', duration = 3000)`**
  - `message`: string to display.
  - `type`: one of `"success" | "danger" | "warning" | "info"`.
  - `duration`: milliseconds before auto‑dismiss.
  - Renders a fixed positioned `<div>` with class `alert-{type}-solid` and a slide‑in/out animation.

**Key classes (expected in CSS):**

- `alert-success-solid`, `alert-danger-solid`, `alert-warning-solid`, `alert-info-solid`.

When used from widgets, call via `window.AppSec.Notify.show(...)`.

### 1.5 CSS Classes

### Layout
- `.container` - Max-width 1400px, responsive padding
- `.grid`, `.grid-2`, `.grid-3` - Responsive grids
- `.card` - Card container with shadow
- `.card-header` and `.card-body` for organizing the card nicely in responsive fashion.
- `.widget` - Widget container with header/body

### Typography
- `h1` to `h6` - Styled headings
- `code` - Inline code (colorized)
- `pre code` - Code blocks (no colorization)

### Buttons
- `.btn` - Base button
- `.btn-primary`, `.btn-danger`, `.btn-success`, `.btn-secondary` - Colored variants

### Alerts (Border Only)
- `.alert-danger`, `.alert-warning`, `.alert-success`, `.alert-info` - Border-left colored alerts

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

---

## 2. Widget API (`window.AppSecWidgets`)

All widgets live on the global `AppSecWidgets` object and expose a `create(containerId, …)` method.

General pattern:

```js
AppSecWidgets.WidgetName.create('container-id', dataOrConfig);
```

Each widget expects the container element to exist in the DOM.

---

### 2.1 `HTTPSimulator`

**Purpose:** Free‑form HTTP request/response playground with simple security hints.

**Signature:**

```js
AppSecWidgets.HTTPSimulator.create(containerId, config = {})
```

**Config:**

- `placeholder` (string) – initial HTTP request text shown in textarea.
- `title` (string) – widget title (default: `"🌐 HTTP Request/Response Simulator"`).

Uses `window.AppSec.Notify.show()` for hints (SQLi/path traversal/etc.).

Key classes: `widget`, `widget-header`, `widget-title`, `widget-body`, plus `btn`, `btn-primary`.

---

### 2.2 `ConfigDiff`

**Purpose:** Compare insecure vs. secure config/code snippets.

**Signature:**

```js
AppSecWidgets.ConfigDiff.create(containerId, insecureCode, secureCode)
```

**Params:**

- `insecureCode` (string) – vulnerable configuration or code.
- `secureCode`   (string) – fixed/secure version.

Renders two panels toggled via:

- `btn btn-danger` (❌ Insecure)
- `btn btn-success` (✅ Secure)

Key classes: `widget`, `widget-header`, `widget-body`.

---

### 2.3 `FlowVisualizer`

**Purpose:** Step‑by‑step flow diagram (e.g., auth flow, request life‑cycle).

**Signature:**

```js
AppSecWidgets.FlowVisualizer.create(containerId, steps)
```

**Data:**

```js
steps = [
  { title: 'Step title', description: 'What happens here…' },
  …
];
```

Widget stores state internally and provides Previous/Next controls.

Key classes: `flow-step`, `flow-node`, `flow-content`, `flow-container`, `flow-controls`, plus `widget-*` and `btn`.

---

### 2.4 `LogAnalyzer`

**Purpose:** Simple security log table with severity styling and refresh.

**Signature:**

```js
AppSecWidgets.LogAnalyzer.create(containerId, data = {})
```

**Data:**

```js
{
  title?: '🔍 Security Log Analyzer',
  columns?: ['Time', 'Event', 'User', 'IP', 'Status'],
  logs?: [{
    time?: string,
    event?: string,
    user?: string,
    ip?: string,
    status?: string,   // 'success' | 'blocked' | 'warning' | custom
    severity?: string, // affects row class: log-{severity}
  }],
  placeholder?: string
}
```

Widget methods:

- `LogAnalyzer.refresh(containerId)` – re-renders with same config.

Key classes: `log-table`, `log-row`, `log-info`, `log-warning`, `log-danger`, `badge`, `badge-success`, `badge-danger`, `badge-warning`.

---

### 2.5 `ProgressTracker`

**Purpose:** Visualize skills / topic progress and sub‑items.

**Signature:**

```js
AppSecWidgets.ProgressTracker.create(containerId, data = {})
```

**Data:**

```js
{
  title?: '📊 Security Skills Progress',
  categories?: [{
    name: string,
    icon?: string,      // emoji/icon
    progress?: number,  // 0–100
    items?: [{
      name: string,
      completed?: boolean
    }]
  }],
  placeholder?: string
}
```

Key classes: `progress-category`, `progress-header`, `progress-percent`, `progress-bar`, `progress-fill`, `progress-items`, `progress-status`.

---

### 2.6 `AttackSandbox`

**Purpose:** Multi‑scenario attack payload sandbox with dynamic response.

**Signature:**

```js
AppSecWidgets.AttackSandbox.create(containerId, data = {})
```

**Data:**

```js
{
  title?: '🎯 Attack Vector Sandbox',
  scenarios: [{
    name?: string,
    description?: string,
    payload?: string,                      // default payload text
    response?: string,                     // default response text
    checkPayload?: (payload) => string,    // optional custom evaluator
    notifyType?: 'success'|'info'|'warning'|'danger',
    notifyMessage?: string
  }],
  placeholder?: string
}
```

Widget state keeps `currentScenario` and `output`. Uses `window.AppSec.Notify` if `notifyType` is set.

Key classes: `attack-scenarios`, `attack-details`, `grid`, `grid-2`, `btn btn-primary`, `btn btn-secondary`, `btn btn-danger`.

---

### 2.7 `CertificateInspector`

**Purpose:** Render TLS certificate metadata and expiry status.

**Signature:**

```js
AppSecWidgets.CertificateInspector.create(containerId, data = {})
```

**Data:**

```js
{
  title?: '🔐 TLS Certificate Inspector',
  certificate?: {
    commonName?: string,
    issuer?: string,
    validFrom?: string | Date,
    validTo?: string | Date,
    serialNumber?: string,
    signatureAlgorithm?: string
  },
  placeholder?: string
}
```

Computes `Days Until Expiry` and adds validity badge.

Key classes: `cert-details`, `cert-field`, `cert-status`, `cert-valid`, `cert-expired`, plus text color helpers like `text-success`, `text-warning`, `text-danger`.

---

### 2.8 `CodeReviewChecker`

**Purpose:** Show security findings for a code snippet.

**Signature:**

```js
AppSecWidgets.CodeReviewChecker.create(containerId, data = {})
```

**Data:**

```js
{
  title?: '🔎 Security Code Review',
  code: string,
  vulnerabilities: [{
    severity?: string,       // e.g. 'low'|'medium'|'high'|'critical'
    title?: string,
    description?: string,
    line?: number,
    recommendation?: string
  }],
  placeholder?: string
}
```

Highlights issues in a list and shows overall count.

Key classes: `code-review-section`, `vuln-item`, `vuln-header`, `vuln-badge`, `vuln-badge-{severity}`, `vuln-line`, `vuln-fix`, `vuln-count`.

---

### 2.9 `VulnerabilityTimeline`

**Purpose:** Vertical timeline of vulnerability lifecycle.

**Signature:**

```js
AppSecWidgets.VulnerabilityTimeline.create(containerId, data = {})
```

**Data:**

```js
{
  title?: '📅 Vulnerability Timeline',
  vulnerabilities: [{
    id?: string,
    date?: string,
    title?: string,
    description?: string,
    severity?: string,     // used in `severity-{severity.toLowerCase()}`
    link?: string          // external reference (e.g. advisory URL)
  }],
  placeholder?: string
}
```

Key classes: `timeline`, `timeline-item`, `timeline-marker`, `timeline-date`, `timeline-header`, `timeline-link`, `severity-badge`, `severity-{level}`.

---

### 2.10 `Quiz`

**Purpose:** Multiple‑choice quiz in classic or step mode.

**Signature:**

```js
AppSecWidgets.Quiz.create(containerId, data)
```

**Data:**

```js
{
  title?: string,
  intro?: string,
  mode?: 'classic' | 'step', // default 'step'
  questions: [{
    text: string,
    options: [{
      value: string,
      label: string,
      correct?: boolean
    }]
  }]
}
```

**Classic mode:**

- All questions at once in an ordered list.
- Single “Check answers” button.
- Uses `callout callout-info-solid` to show score.

**Step mode (default):**

- Intro + “Start Quiz” button.
- One question at a time with clickable option buttons.
- Score and progress updated per question.

Key classes: `widget-quiz`, `quiz-list`, `quiz-question`, `quiz-option`, `quiz-option-btn`, `quiz-question-container`, `quiz-intro`, `quiz-result`.

---

### 2.11 `ValidationTrainer`

**Purpose:** Practice input validation and regex‑based rules.

**Signature:**

```js
AppSecWidgets.ValidationTrainer.create(containerId, data = {})
```

**Data:**

```js
{
  title?: '✅ Input Validation Trainer',
  patterns?: {
    [ruleName: string]: {
      regex: RegExp,
      examples: string[],
      description?: string
    }
  }
}
```

If `patterns` is omitted, it falls back to built‑in rules (`email`, `url`, `phone`, etc.).

UI allows selecting a rule, viewing regex, trying inputs, and seeing pass/fail.

Key classes: `validation-result`, `tag-pill`, plus standard `btn`, `grid`, etc.

---

### 2.12 `ThreatModel`

**Purpose:** STRIDE‑style threat modeling canvas with export.

**Signature:**

```js
AppSecWidgets.ThreatModel.create(containerId, prefill = null)
```

**Prefill structure (optional):**

```js
{
  system?: {
    name?: string,
    type?: string,
    actors?: string,
    assets?: string,
    entryPoints?: string,
    boundaries?: string
  },
  stride?: {
    spoofing?: string,
    tampering?: string,
    repudiation?: string,
    information?: string,
    dos?: string,
    elevation?: string
  }
}
```

The widget also exposes:

- **`ThreatModel.exportModel(containerId)`**
  - Reads current form values and downloads `threat-model.json`:
    ```js
    {
      system: { …, exportedAt: ISOString },
      stride: { spoofing, tampering, repudiation, information, dos, elevation }
    }
    ```

- **`ThreatModel.exportMarkdown(containerId)`**
  - Downloads a Markdown summary text file.

Uses `window.AppSec.Notify.show()` on successful export.

Key classes: `threat-architecture`, `threat-meta`, `threat-grid`, `threat-category`, `threat-prompts`, `threat-textarea`.

---

### 2.13 `APITester`

**Purpose:** Simulated API auth + rate‑limit tester.

**Signature:**

```js
AppSecWidgets.APITester.create(containerId, data = {})
```

**Data:**

```js
{
  title?: '🔌 API Security Tester',
  endpoints?: [{
    value: string,            // key used in responses object
    label: string,            // shown in dropdown
    requiresAuth?: boolean,
    requiresAdmin?: boolean
  }],
  rateLimit?: number,         // allowed requests before 429
  responses?: {
    [endpointValue: string]: {
      // For public endpoints you can use a flat object:
      status?: number,
      message?: string,

      // For protected/admin endpoints:
      noAuth?:   { status: number, error: string },
      invalid?:  { status: number, error: string },
      forbidden?:{ status: number, error: string },
      success?:  { status: number, message: string, user?: string, users?: any }
    }
  }
}
```

Widget methods:

- `APITester.testAuth(containerId)` – evaluates current endpoint + token and logs JSON responses.
- `APITester.testRateLimit(containerId)` – simulates multiple requests against `rateLimit`. Uses `window.AppSec.Notify` when rate limit is exceeded.

Key classes: `btn`, `btn-primary`, `btn-secondary`, `form-section`, `grid`, `grid-2`, plus `response-log`.

---

## 3. Shared Layout & Style Classes

The widgets and theme assume the following reusable classes exist in the CSS. Code generators can safely use them:

### 3.1 Widget shell

- `widget`, `widget-header`, `widget-title`, `widget-body` – standard card container.
- `mt-0-5`, `mt-1`, `mb-1`, `mt-2` – top/bottom margin helpers.
- `grid`, `grid-2`, `grid-3` – responsive grid layouts.
- `text-muted`, `text-secondary`, `text-success`, `text-warning`, `text-danger` – text color helpers.
- `tag-pill`, `badge`, `badge-success`, `badge-danger`, `badge-warning` – small status labels.

### 3.2 Buttons

- `btn` – base button styling.
- `btn-primary`, `btn-secondary`, `btn-danger`, `btn-success` – variants.
- Many widgets combine with spacing helpers, e.g. `btn btn-primary mt-1`.

### 3.3 Callouts & Alerts

- `callout`, `callout-info-solid`, `callout-warning`, `callout-danger` – information boxes.
- `alert-success-solid`, `alert-danger-solid`, `alert-warning-solid`, `alert-info-solid` – toasts used by `Notify`.

### 3.4 Domain-specific helpers

- Certificate inspector: `cert-details`, `cert-field`, `cert-status`, `cert-valid`, `cert-expired`.
- Code review: `code-review-section`, `vuln-item`, `vuln-header`, `vuln-badge`, `vuln-badge-{severity}`, `vuln-line`, `vuln-fix`, `vuln-count`.
- Timeline: `timeline`, `timeline-item`, `timeline-marker`, `timeline-header`, `timeline-date`, `timeline-link`, `severity-badge`, `severity-{level}`.
- Quiz: `widget-quiz`, `quiz-list`, `quiz-question`, `quiz-option`, `quiz-option-btn`, `quiz-intro`, `quiz-result`.
- Threat model: `threat-architecture`, `threat-meta`, `threat-grid`, `threat-category`, `threat-prompts`.
- Logs: `log-table`, `log-row`, `log-info`, `log-warning`, `log-danger`.
- Attack sandbox: `attack-scenarios`, `attack-details`.


---

**Usage summary for generators**

1. Include the theme and widgets JS in the page so `window.AppSec` and `window.AppSecWidgets` are available.
2. Mark container elements with stable IDs (e.g. `<div id="quiz-http-basics"></div>`).
3. Call the corresponding `create(id, data)` function with the data structures outlined above.
4. Use the documented classes for consistent layout, buttons, alerts, and domain‑specific styling.

