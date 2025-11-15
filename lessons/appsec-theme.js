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

// Export for use in other modules
window.AppSec = {
  ThemeManager,
  CodeDisplay,
  Notify
};
