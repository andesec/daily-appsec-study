# AGENTS – Daily AppSec Study

## Scope
These instructions apply to the entire repository unless a more specific `AGENTS.md` is added in a subdirectory.

## Mission & Source Material
- You are implementing security lessons for senior engineers, following the teaching contract in `contract.md`.
- Every lesson must use the shared visual system (`lessons/appsec-theme.css`, `lessons/appsec-theme.js`) and widget library (`lessons/appsec-widgets.js`).
- The widgets catalog, APIs, and theme utilities live in `appsec_widgets_usage_guide.md`; refer to it whenever you embed interactive components.
- CI (`.github/workflows/build-and-generate.yml`) expects properly structured lesson fragments so it can run `python join_html_topics.py` to assemble finished HTML and rebuild `index.html` on every push/PR.

## Lesson Authoring Workflow
1. The user will hand you Markdown files per section. Convert each Markdown input into HTML fragments that live inside the lesson’s dedicated folder under `lessons/<slug>/`.
2. Each lesson folder contains:
   - A single `*-template.html` file that already links the shared CSS/JS and declares empty section placeholders.
   - One or more numbered fragment files named like `01-02.html` or `05.html`. The range indicates the contract section numbers included in that fragment. Keep the numbering contiguous and conflict-free so `join_html_topics.py` can merge them.
   - An auto-generated `<slug>.html` output at `lessons/<slug>.html` (written by `join_html_topics.py`). Do not hand-edit this file; edit the template/fragments and rerun the script instead.
3. When you finish updating or creating fragments, run `python join_html_topics.py` from the repo root so the aggregated HTML is regenerated before committing.
4. Keep CSS/JS references relative to the lesson folder (e.g., `<link rel="stylesheet" href="appsec-theme.css">`).

## Layout & Markup Rules
- Use `<section class="card">` for each top-level section (1–11) and each numbered subsection (e.g., 1.1, 3.4). Place them sequentially after the template’s header and before the footer. Do **not** nest sections.
- Inside every `section.card`, render exactly two child divs:
  - `<div class="card-header">` with the section or subsection title (plain text, no nested heading tags).
  - `<div class="card-body">` containing the prose, tables, widgets, etc.
- Reference widgets by inserting a `<div id="..." class="widget"></div>` placeholder and call `AppSecWidgets.*` via `<script>` blocks within the card body when needed.
- Prefer semantic HTML inside bodies (tables for comparisons, lists for steps, `<pre><code>` for code) and keep typography consistent with the theme.
- Include emojis or glyphs where they improve scannability, but keep the tone professional.
- Use the lesson template name `lessons/[TOPIC_NUMBER]-[TOPIC_NAME]/[TOPIC_NUMBER]-template.html`; do not introduce alternate filename schemes.
- Leave that template as a shell that only loads the shared header/footer/theme assets—the GitHub workflow and `python join_html_topics.py` handle fragment merging automatically.
- Ensure every numbered subsection (e.g., 1.1, 3.4, 5.2) is represented by its own `section.card` immediately after its parent section card (1, 2, 3, etc.) so the reader experiences the correct progression.

## Content Requirements (from `contract.md`)
- Cover all eleven sections in order: Foundations, Intuitive Hook, Mental Model, Deep Explanation, Real-World Context, Common Weaknesses, Hands-On Implementation, Defense & Mitigation, Incident Case Study, Threat Model, Compliance Mapping.
- Teach like a principal AppSec engineer: layer intuition → mechanics → systems view → failure modes → reviewer checklists, and always tie the topic to real SaaS/microservice environments.
- For every section, cite authoritative references or further-reading links and end with a quiz widget (use `AppSecWidgets.Quiz`).
- Follow the widget suggestions listed per section in `contract.md` (Callout, FlowVisualizer, ConfigDiff, APITester, etc.) whenever they help reinforce the concept.
- Transform flat lists into tables when it improves readability. Highlight comparisons or checklists using the themed classes (e.g., `.callout-*`, `.table-container`).
- Only include code/config when it clarifies security logic; annotate with reviewer insights, logging expectations, and attacker perspectives.

## Threat Modeling & Compliance Notes
- Incident case studies must describe the real company/software/system, attack path, ASCII architecture diagram, remediation, and external reference links.
- Threat model sections should include a detailed ASCII diagram plus STRIDE analysis, ideally aided by the ThreatModel widget for interactive exploration.
- Compliance mappings must mention ISO 27001, NIST 800-53, PCI DSS, HIPAA, GDPR, and SOC 2. If a framework is irrelevant, explicitly say so with a one-line justification.

## Widgets & Utilities
- Use the APIs documented in `appsec_widgets_usage_guide.md`. Each widget auto-renders its own header/body structure inside a div—only supply data/config objects.
- `window.AppSec.ThemeManager` controls the light/dark toggle; do not modify its markup. `AppSec.CodeDisplay.addLineNumbers` is available for code snippets displayed outside widgets if you need manual enhancement.
- When building hands-on exercises, consider AttackSandbox, HTTPSimulator, ConfigDiff, LogAnalyzer, APITester, or ValidationTrainer to reinforce the concept.

## CI & Repo Hygiene
- Never edit generated files in `lessons/*.html` directly; rely on fragments plus `join_html_topics.py`.
- Keep numbering consistent: fragment filenames must match their covered section ranges, and each `<section>` needs a unique `id` like `section-1`, `section-1-1`, etc., so Table of Contents scripts work.
- The GitHub workflow commits built lessons and the homepage automatically. Avoid leaving staged changes behind—commit only intentional template/fragment edits and regenerated outputs produced by the script.

## Delivery Checklist
Before telling the user a lesson is ready:
1. Verify every contract section exists as a card and has its paired quiz.
2. Ensure references/links are present per section and widgets render (config objects populated).
3. Confirm `python join_html_topics.py` runs cleanly and updates the aggregated lesson file. Take a screenshot and delete the aggregated file.
4. Summarize what changed and note that you are ready for the next Markdown batch.
