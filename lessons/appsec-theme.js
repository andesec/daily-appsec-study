/**
 * ============================================
 * AppSec Learning Theme - Main JavaScript
 * Theme switching, utilities, and core functions
 * ============================================
 */

// Theme Management
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('appsec-theme') || 'light';
    this.setTheme(savedTheme);
    this.createToggleButton();
  },

  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('appsec-theme', theme);
  },

  toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
    this.updateToggleButton();
  },

  createToggleButton() {
    const button = document.createElement('button');
    button.className = 'theme-toggle';
    button.onclick = () => this.toggleTheme();
    document.body.appendChild(button);
    this.updateToggleButton();
  },

  updateToggleButton() {
    const button = document.querySelector('.theme-toggle');
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    button.textContent = theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
  }
};

// Code Display with Line Numbers
const CodeDisplay = {
  /**
   * Adds line numbers to code blocks
   * Usage: CodeDisplay.addLineNumbers(codeElement);
   * 
   * Automatically trims any leading or trailing blank lines so
   * line numbering and rendered code both start at line 1 cleanly.
   */
  addLineNumbers(codeElement) {
    // Get raw text
    let text = codeElement.textContent;

    // Trim trailing blank line
    text = text.replace(/\n+$/, '');

    // Trim leading blank line
    text = text.replace(/^\n+/, '');

    const lines = text.split('\n');

    const container = document.createElement('div');
    container.className = 'code-with-lines';

    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'line-numbers';
    lines.forEach((_, i) => {
      const lineNum = document.createElement('pre');
      lineNum.textContent = i + 1; // Always start at 1
      lineNumbers.appendChild(lineNum);
    });

    const codeContent = document.createElement('div');
    codeContent.className = 'code-content';
    // codeContent.appendChild(codeElement.cloneNode(true));
    const cloned = codeElement.cloneNode(true);
    cloned.textContent = text; // ensure trimmed content is used

    codeContent.appendChild(cloned);

    container.appendChild(lineNumbers);
    container.appendChild(codeContent);

    codeElement.parentElement.replaceChild(container, codeElement);
  },

  /**
   * Highlights specific lines in a code block
   * Usage: CodeDisplay.highlightLines(codeElement, [1, 3, 5]);
   */
  highlightLines(codeElement, lineNumbers) {
    const lines = codeElement.querySelectorAll('.line-numbers div');
    lineNumbers.forEach(num => {
      if (lines[num - 1]) {
        lines[num - 1].style.background = 'var(--color-warning)';
        lines[num - 1].style.fontWeight = 'bold';
      }
    });
  }
};

// Notification System
const Notify = {
  /**
   * Show a notification
   * Usage: Notify.show('Success!', 'success');
   * Types: 'success', 'danger', 'warning', 'info'
   */
  show(message, type = 'info', duration = 3000) {
    const alert = document.createElement('div');
    alert.className = `alert-${type}-solid`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '5rem';
    alert.style.right = '1rem';
    alert.style.zIndex = '1001';
    alert.style.minWidth = '250px';
    alert.style.animation = 'slideIn 0.3s ease';

    document.body.appendChild(alert);

    setTimeout(() => {
      alert.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => alert.remove(), 300);
    }, duration);
  }
};

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`;
document.head.appendChild(style);

// Generate Table of Contents
const toc = document.getElementById("toc");
const sections = document.querySelectorAll("section.card");

const tocList = document.createElement("ul");
let lastParent = null;

sections.forEach(section => {
  const header = section.querySelector(".card-header");
  if (!header) return;

  const text = header.textContent.trim();
  const isSub = /^\d+\.\d+/.test(text);

  // Generate stable ID
  const id = text
    .toLowerCase()
    .replace(/[^a-z0-9\. ]/g, "")
    .replace(/\s+/g, "-");
  section.id = id;

  // Build TOC item
  const li = document.createElement("li");
  const a = document.createElement("a");
  a.href = `#${id}`;
  a.textContent = text;
  li.appendChild(a);

  if (!isSub) {
    // Top-level
    tocList.appendChild(li);
    lastParent = li;
  } else {
    // Subsection
    if (!lastParent) {
      tocList.appendChild(li);
      return;
    }

    let sub = lastParent.querySelector("ul");
    if (!sub) {
      sub = document.createElement("ul");
      lastParent.appendChild(sub);
    }
    sub.appendChild(li);
  }
});

toc.appendChild(tocList);

// Initialize theme on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => ThemeManager.init());
} else {
  ThemeManager.init();
}

// =====================================================
// Floating Navigation + Collapse/Expand All
// =====================================================
const NavFloating = {
  init() {
    this.sections = Array.from(document.querySelectorAll("section.card"));
    if (this.sections.length === 0) return;

    this.createButtons();
    this.updateButtons();

    window.addEventListener("scroll", () => this.updateButtons());
  },

  createButtons() {
    this.nav = document.createElement("div");
    this.nav.className = "floating-nav";

    // Navigation buttons
    this.prevBtn = this.make("⬆ Previous", () => this.scrollToPrev());
    this.topBtn = this.make("⇧ Top", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    this.nextBtn = this.make("Next ⬇", () => this.scrollToNext());
    this.bottomBtn = this.make("Bottom ⇩", () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));

    // Collapse / Expand all
    this.collapseAllBtn = this.make("– Collapse All", () => this.collapseAll());
    this.expandAllBtn = this.make("+ Expand All", () => this.expandAll());

    this.nav.appendChild(this.topBtn);
    this.nav.appendChild(this.prevBtn);
    this.nav.appendChild(this.nextBtn);
    this.nav.appendChild(this.bottomBtn);

    const divider = document.createElement("div");
    divider.style.borderTop = "1px solid var(--border-color)";
    divider.style.margin = "0.5rem 0";
    this.nav.appendChild(divider);

    this.nav.appendChild(this.collapseAllBtn);
    this.nav.appendChild(this.expandAllBtn);

    document.body.appendChild(this.nav);
  },

  make(label, onClick) {
    const b = document.createElement("button");
    b.className = "floating-btn";
    b.textContent = label;
    b.onclick = onClick;
    return b;
  },

  getCurrentSectionIndex() {
    const scrollY = window.scrollY + 150;
    let index = 0;

    this.sections.forEach((sec, i) => {
      if (scrollY >= sec.offsetTop) index = i;
    });

    return index;
  },

  scrollToPrev() {
    const idx = this.getCurrentSectionIndex();
    if (idx > 0) {
      this.sections[idx - 1].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  scrollToNext() {
    const idx = this.getCurrentSectionIndex();
    if (idx < this.sections.length - 1) {
      this.sections[idx + 1].scrollIntoView({ behavior: "smooth", block: "start" });
    }
  },

  updateButtons() {
    const idx = this.getCurrentSectionIndex();
    const lastIdx = this.sections.length - 1;

    const atBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 2;

    this.prevBtn.disabled = idx === 0;
    this.topBtn.disabled = idx === 0;

    this.nextBtn.disabled = idx === lastIdx || atBottom;
    this.bottomBtn.disabled = atBottom;
  },

  collapseAll() {
    this.sections.forEach(sec => sec.classList.add("collapsed"));
  },

  expandAll() {
    this.sections.forEach(sec => sec.classList.remove("collapsed"));
  }
};

document.addEventListener("DOMContentLoaded", () => NavFloating.init());

// =====================================================
// Collapsible Cards
// =====================================================
const CollapsibleCards = {
  init() {
    const cards = document.querySelectorAll("section.card");
    cards.forEach(card => {
      const header = card.querySelector(".card-header");
      const body = card.querySelector(".card-body");

      if (!header || !body) return;

      header.classList.add("collapsible-header");
      body.classList.add("collapsible-body");

      header.addEventListener("click", () => {
        card.classList.toggle("collapsed");
      });
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  CollapsibleCards.init();
});

function applyTableScroll() {
  const tables = document.querySelectorAll("table");

  tables.forEach(table => {
    // Check up to 3 ancestors
    const parent1 = table.parentElement;
    const parent2 = parent1?.parentElement || null;
    const parent3 = parent2?.parentElement || null;

    const ancestors = [parent1, parent2, parent3];

    // If ANY ancestor has .widget, skip
    const insideWidget = ancestors.some(a => a && a.classList.contains("widget"));
    if (insideWidget) return;

    // Already wrapped? Skip
    if (parent1 && parent1.classList.contains("table-scroll")) return;

    // Wrap table in .table-scroll
    const wrapper = document.createElement("div");
    wrapper.classList.add("table-scroll");

    parent1.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
}

document.addEventListener("DOMContentLoaded", applyTableScroll);

/********************************************************************
 * Convert a single text string:
 *   **bold**   -> <strong>
 *   *italic*   -> <em>
 *   `code`     -> <code>
 *   http(s):// -> <a>
 ********************************************************************/
function convertTextNodeContent(text) {
  if (typeof text !== "string") return text;

  // 1) Inline code
  text = text.replace(/`([^`]+)`/g, "<code>$1</code>");

  // 2) Bold
  text = text.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");

  // 3) Italic
  text = text.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  // 4) URLs → clickable links
  const urlRegex = /\bhttps?:\/\/[^\s<]+/gi;

  text = text.replace(urlRegex, (url) => {
    const safeUrl = url.replace(/"/g, "&quot;");
    return `<a class="appsec-autolink" href="${safeUrl}" target="_blank" rel="noopener noreferrer">${safeUrl}</a>`;
  });

  return text;
}


/********************************************************************
 * Walk the DOM and enhance existing static text nodes.
 * - Only touches text nodes, not attributes.
 * - Skips <script>, <style>, <noscript>.
 * - Wraps transformed text in a <span> with HTML inside.
 ********************************************************************/
function applyStaticMarkdown(rootSelector) {
  const root = rootSelector
    ? document.querySelector(rootSelector)
    : document.body;

  if (!root) return;

  const walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const parent = node.parentNode;
        if (!parent) return NodeFilter.FILTER_REJECT;

        const tag = parent.nodeName.toLowerCase();
        if (["script", "style", "noscript"].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }

        const value = node.nodeValue;
        if (!value || value.trim() === "") {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  let node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }

  nodes.forEach((textNode) => {
    const original = textNode.nodeValue;
    const transformed = convertTextNodeContent(original);

    if (original === transformed) return; // nothing to do

    const span = document.createElement("span");
    span.innerHTML = transformed;
    textNode.replaceWith(span);
  });
}

document.addEventListener("DOMContentLoaded", applyStaticMarkdown());

// Export for use in other modules
window.AppSec = {
  ThemeManager,
  CodeDisplay,
  Notify
};
