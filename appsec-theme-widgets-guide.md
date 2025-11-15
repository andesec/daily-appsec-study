
# AppSec Theme & Widgets – Quick Starter Guide

This guide explains how to use the AppSec theme + widgets and which CSS classes you’ll use most often.

---

## 1. Files & Basic Setup

Include these in your HTML:

```html
<head>
  <meta charset="utf-8">
  <title>AppSec Lesson</title>

  <link rel="stylesheet" href="appsec-theme.css">

  <script defer src="appsec-theme.js"></script>
  <script defer src="appsec-widgets.js"></script>
</head>
<body>
  <main class="container">
    <!-- Your content + widget containers go here -->
  </main>
</body>
```

`appsec-theme.js` automatically initializes the theme and adds a floating light/dark toggle.

---

## 2. Theme Utilities (JS)

### 2.1 Theme switching

Available under the global `AppSec` namespace:

```js
// Force a theme
AppSec.ThemeManager.setTheme('light');  // or 'dark'

// Toggle programmatically
AppSec.ThemeManager.toggleTheme();
```

A `.theme-toggle` button is automatically created and handled by `ThemeManager.init()` on page load.

---

### 2.2 Code blocks with line numbers

```html
<pre><code class="language-http">
GET /api/users HTTP/1.1
Host: example.com
</code></pre>
```

```js
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('pre code').forEach(codeEl => {
    AppSec.CodeDisplay.addLineNumbers(codeEl);
  });
});
```

Relevant classes:

- `code-with-lines`
- `line-numbers`
- `code-content`

---

### 2.3 Notifications

```js
// message, type = 'success' | 'danger' | 'warning' | 'info', duration ms
AppSec.Notify.show('Saved successfully ✅', 'success', 3000);
```

This uses the solid alert styles (`.alert-success-solid`, `.alert-danger-solid`, `.alert-warning-solid`, `.alert-info-solid`).

---

## 3. Core Layout & Components (CSS)

Below are the main classes you’ll actually use when writing lessons.

### 3.1 Layout & alignment

- `container` – page width wrapper.
- `grid` – responsive grid container.
- `grid-2`, `grid-3` – 2-column / 3-column layouts.
- `text-center`, `text-right` – text alignment helpers.
- `mt-1`, `mb-1`, `p-1` – small margin-top / margin-bottom / padding utilities.

### 3.2 Cards

Use for self-contained blocks (concepts, examples, exercises):

```html
<div class="card">
  <div class="card-header">Key Concept</div>
  <div class="card-body">
    Short explanation…
  </div>
</div>
```

Classes:

- `card`
- `card-header`
- `card-body` (uses default card content styling)

### 3.3 Callouts & Alerts

**Callouts – persistent info boxes inside content:**

```html
<div class="callout callout-info">
  <strong>💡 Tip:</strong> Cache keys must include all user-controlled variants.
</div>

<div class="callout callout-warning">
  <strong>⚠️ Warning:</strong> This configuration is vulnerable.
</div>
```

Classes:

- `callout`
- `callout-info`, `callout-warning`, `callout-danger`, `callout-success`

**Alerts – inline status messages (often inside widgets):**

```html
<div class="alert alert-danger">
  Invalid JWT – signature verification failed.
</div>
```

Solid variants (used by `Notify` and some widgets):

- `alert-success-solid`
- `alert-danger-solid`
- `alert-warning-solid`
- `alert-info-solid`

Base classes:

- `alert`
- `alert-success`, `alert-danger`, `alert-warning`, `alert-info`

### 3.4 Buttons

```html
<button class="btn btn-primary">Run Test</button>
<button class="btn btn-secondary">Reset</button>
<button class="btn btn-danger">Delete</button>
<button class="btn btn-success">Mark as Fixed</button>
```

Classes:

- `btn`
- `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`

### 3.5 Tables & Code

- `table-container` – wraps wide tables with horizontal scroll.
- `code-with-lines`, `line-numbers`, `code-content` – used by `CodeDisplay`.

---

## 4. Widget Basics

All widgets live under the global `AppSecWidgets` object.

**Pattern:**

1. Add a container element with an ID.
2. Call the appropriate `create` method after the DOM is ready.

```html
<div id="quiz-csrf"></div>
```

```js
document.addEventListener('DOMContentLoaded', () => {
  const data = {
    mode: 'classic', // 'classic' or 'step'
    title: 'CSRF Basics',
    intro: 'Test your understanding of CSRF.',
    questions: [
      {
        text: 'What does CSRF stand for?',
        options: [
          { value: 'a', label: 'Cross-Site Request Forgery', correct: true },
          { value: 'b', label: 'Client-Side Request Filter', correct: false }
        ]
      }
    ]
  };

  AppSecWidgets.Quiz.create('quiz-csrf', data);
});
```

Common container styling is handled by:

- `widget`
- `widget-header`
- `widget-title`
- `widget-body`

The Quiz widget also applies:

- `widget-quiz` (on the container in classic mode)
- `quiz-list`, `quiz-question`, `quiz-option`
- `quiz-intro`, `quiz-meta`, `quiz-progress`, `quiz-score`
- `quiz-question-container`, `quiz-question-card`, `quiz-question-text`
- `quiz-options`, `quiz-option-btn`

---

## 5. Widget Catalogue & Signatures

Below is a quick index of available widgets and how to instantiate them.

### 5.1 HTTP / API & Traffic

- **HTTP Request/Response Simulator**

  ```js
  AppSecWidgets.HTTPSimulator.create('http-sim');
  ```

  Lets learners edit a raw HTTP request and see a simulated response (status, headers, simple vulnerability hints).

- **API Security Tester**

  ```js
  AppSecWidgets.APITester.create('api-tester');
  ```

  UI for selecting endpoint type, auth token, rate limit, roles, and seeing how different choices affect access.

---

### 5.2 Config & Attack/Defense Views

- **ConfigDiff – Secure vs Insecure config**

  ```js
  AppSecWidgets.ConfigDiff.create(
    'config-diff',
    insecureConfigString,
    secureConfigString
  );
  ```

  Shows a toggle between insecure and hardened configuration blocks.

- **AttackDefense – Red vs Blue perspective**

  ```js
  AppSecWidgets.AttackDefense.create(
    'attack-defense',
    'SQL Injection',
    `<p>Show how the attack works here…</p>`,
    `<ul><li>Use parameterized queries…</li></ul>`
  );
  ```

  Two-tab view: vulnerable vs mitigated explanation.

---

### 5.3 Crypto, Tokens & Auth

- **CryptoPlayground – Hashing playground**

  ```js
  AppSecWidgets.CryptoPlayground.create('crypto-playground');
  ```

  Lets learners choose a hash algorithm and generate hashes for input text.

- **JWTAnalyzer – JWT decoder & analyzer**

  ```js
  AppSecWidgets.JWTAnalyzer.create('jwt-analyzer');
  ```

  Decodes a JWT and shows header/payload plus basic security findings.

- **PasswordMeter – Password strength analyzer**

  ```js
  AppSecWidgets.PasswordMeter.create('password-meter');
  ```

  Live strength bar + hints about what makes the password weak/strong.

---

### 5.4 Flows & Visuals

- **FlowVisualizer – Step-by-step flow**

  ```js
  const flowSteps = [
    { title: 'User → SPA', description: 'User submits login form.' },
    { title: 'SPA → Auth Server', description: 'Sends /authorize request.' },
    // …
  ];

  AppSecWidgets.FlowVisualizer.create('auth-flow', flowSteps);
  ```

  Renders one step at a time with “Next / Previous” controls and visual state (active vs completed).

- **FlowchartBuilder – Interactive diagram builder**

  ```js
  AppSecWidgets.FlowchartBuilder.create('flowchart');
  ```

  Lets learners add boxes/decisions into a canvas to sketch security flows.

---

### 5.5 Logs, Validation & Vulnerable App

- **LogAnalyzer – Suspicious log finder**

  ```js
  AppSecWidgets.LogAnalyzer.create('log-analyzer');
  ```

  Preloaded small log dataset where learners identify suspicious entries.

- **ValidationTrainer – Input validation exercises**

  ```js
  AppSecWidgets.ValidationTrainer.create('validation-trainer');
  ```

  Choose validation rule (email, URL, etc.), see regex and play with valid/invalid inputs.

- **VulnApp – Mini vulnerable app simulator**

  ```js
  AppSecWidgets.VulnApp.create('vuln-app');
  ```

  Teaches SQLi / IDOR concepts with simple interactive inputs.

---

### 5.6 XSS & Quizzes

- **XSSPlayground – XSS context tester**

  ```js
  AppSecWidgets.XSSPlayground.create('xss-playground');
  ```

  Lets learners try different payloads in different contexts (HTML, attribute, JS) without actually executing unsafe code.

- **Quiz – Knowledge check (step or classic)**

  ```js
  const quizData = {
    mode: 'step', // or 'classic'
    title: 'Web Cache Poisoning Quiz',
    intro: 'Short quiz to test what you learned.',
    questions: [
      {
        text: 'Which header often matters for cache poisoning?',
        options: [
          { value: 'a', label: 'X-Forwarded-Host', correct: true },
          { value: 'b', label: 'Content-Length', correct: false }
        ]
      }
    ]
  };

  AppSecWidgets.Quiz.create('cache-quiz', quizData);
  ```

  - `mode: 'classic'` renders all questions with a single “Check Answers” button.
  - `mode: 'step'` shows one question at a time with progress + score.

---

### 5.7 Threat Modeling Prompts (Data Only)

`AppSecWidgets.ThreatModel` provides STRIDE prompt banks for you to use in your own UIs:

```js
const spoofingQs = AppSecWidgets.ThreatModel.prompts.spoofing;
const tamperingQs = AppSecWidgets.ThreatModel.prompts.tampering;
```

Categories:

- `spoofing`, `tampering`, `repudiation`, `information`, `dos`, `elevation`

You can render these inside cards, callouts, or custom checklists.

---

## 6. Most Relevant CSS Classes (Quick Reference)

**Layout & spacing**

- `container`
- `grid`, `grid-2`, `grid-3`
- `mt-1`, `mb-1`, `p-1`
- `text-center`, `text-right`

**Components**

- `card`, `card-header`, `card-body`
- `callout`, `callout-info`, `callout-warning`, `callout-danger`, `callout-success`
- `alert`, `alert-success`, `alert-danger`, `alert-warning`, `alert-info`
- `alert-success-solid`, `alert-danger-solid`, `alert-warning-solid`, `alert-info-solid`
- `btn`, `btn-primary`, `btn-secondary`, `btn-success`, `btn-danger`
- `table-container`
- `theme-toggle`

**Code & quiz**

- `code-with-lines`, `line-numbers`, `code-content`
- `widget`, `widget-header`, `widget-title`, `widget-body`
- `widget-quiz`
- `quiz-list`, `quiz-question`, `quiz-option`
- `quiz-intro`, `quiz-meta`, `quiz-progress`, `quiz-score`
- `quiz-question-container`, `quiz-question-card`, `quiz-question-text`
- `quiz-options`, `quiz-option-btn`
