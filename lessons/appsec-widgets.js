/**
 * ============================================
 * AppSec Learning Widgets Library v2.1
 * Refactored: All content now dynamic via parameters
 * ============================================
 */

const AppSecWidgets = {
  _state: {} // Global state for widgets
};

/**
 * ============================================
 * 1. HTTP Request/Response Simulator (REFACTORED)
 * ============================================
 */
AppSecWidgets.HTTPSimulator = {
  create(containerId, config = {}) {
    const defaultConfig = {
      placeholder: `GET /api/users?id=1 HTTP/1.1
Host: example.com
Authorization: Bearer token123
User-Agent: AppSec-Student

`,
      title: '🌐 HTTP Request/Response Simulator'
    };
    const settings = { ...defaultConfig, ...config };

    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.add('widget');
    container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${settings.title}</h3>
        </div>
        <div class="widget-body">
          <div class="grid grid-2">
            <div>
              <label><strong>Request Builder</strong></label>
              <textarea id="${containerId}-request" rows="12" placeholder="${settings.placeholder}"></textarea>
              <button class="btn btn-primary mt-1" onclick="AppSecWidgets.HTTPSimulator.sendRequest('${containerId}')">Send Request</button>
            </div>
            <div>
              <label><strong>Server Response</strong></label>
              <textarea id="${containerId}-response" rows="12" readonly placeholder="Response will appear here..."></textarea>
            </div>
          </div>
        </div>
    `;
  },

  sendRequest(containerId) {
    const request = document.getElementById(`${containerId}-request`).value;
    const response = document.getElementById(`${containerId}-response`);

    const lines = request.split('\n');
    const requestLine = lines[0] || '';
    const [method, path] = requestLine.split(' ');

    let responseText = 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n';

    if (path && path.includes("'")) {
      responseText = 'HTTP/1.1 500 Internal Server Error\nContent-Type: text/html\n\n';
      responseText += 'SQL Error: You have an error in your SQL syntax near \'\'';
      window.AppSec.Notify.show('⚠️ SQLi detected!', 'warning');
    } else if (path && path.includes('../')) {
      responseText = 'HTTP/1.1 403 Forbidden\nContent-Type: text/html\n\n';
      responseText += 'Path traversal attempt detected and blocked';
      window.AppSec.Notify.show('🛡️ Path traversal blocked', 'danger');
    } else if (request.includes('X-Forwarded-For:')) {
      responseText += '{"message": "User IP logged from X-Forwarded-For header", "warning": "Trusting client headers can be dangerous!"}';
      window.AppSec.Notify.show('💡 X-Forwarded-For spoofing', 'info');
    } else {
      responseText += '{"users": [{"id": 1, "name": "Alice", "role": "admin"}] }';
    }

    response.value = responseText;
  }
};

/**
 * ============================================
 * 2. Config Diff Viewer
 * ============================================
 */
AppSecWidgets.ConfigDiff = {
  create(containerId, title, insecureCode, secureCode) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const widgetTitle = title || '🔒 Config Diff Viewer';

    container.classList.add('widget');
    container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${widgetTitle}</h3>
          <div>
            <button class="btn btn-danger" id="${containerId}-insecure-btn">❌ Insecure</button>
            <button class="btn btn-success" id="${containerId}-secure-btn">✅ Secure</button>
          </div>
        </div>
        <div class="widget-body">
          <div id="${containerId}-insecure" style="display: block;">
            <h4 style="color: var(--color-danger);">⚠️ Vulnerable Configuration</h4>
            <pre><code>${this.escapeHtml(insecureCode)}</code></pre>
          </div>
          <div id="${containerId}-secure" style="display: none;">
            <h4 style="color: var(--color-success);">✅ Hardened Configuration</h4>
            <pre><code>${this.escapeHtml(secureCode)}</code></pre>
          </div>
        </div>
    `;

    document.getElementById(`${containerId}-insecure-btn`).onclick = () => this.showMode(containerId, 'insecure');
    document.getElementById(`${containerId}-secure-btn`).onclick = () => this.showMode(containerId, 'secure');

    // Add line numbers to code blocks if available
    if (window.AppSec && window.AppSec.CodeDisplay && typeof window.AppSec.CodeDisplay.addLineNumbers === 'function') {
      container.querySelectorAll('pre').forEach(pre => {
        window.AppSec.CodeDisplay.addLineNumbers(pre);
      });
    }
  },

  showMode(containerId, mode) {
    document.getElementById(`${containerId}-insecure`).style.display = mode === 'insecure' ? 'block' : 'none';
    document.getElementById(`${containerId}-secure`).style.display = mode === 'secure' ? 'block' : 'none';
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
};

/**
 * ============================================
 * 3. Flow Visualizer (COMPLETELY FIXED)
 * ============================================
 */
AppSecWidgets.FlowVisualizer = {
  create(containerId, stepsOrConfig, maybeTitle) {
    let steps = [];
    let title = maybeTitle || '🔄 Flow Visualizer';

    if (Array.isArray(stepsOrConfig)) {
      steps = stepsOrConfig;
    } else if (stepsOrConfig && typeof stepsOrConfig === 'object') {
      steps = stepsOrConfig.steps || [];
      if (stepsOrConfig.title) {
        title = stepsOrConfig.title;
      }
    }

    AppSecWidgets._state[containerId] = { steps, currentStep: 0, title };

    const container = document.getElementById(containerId);
    if (container) {
      container.classList.add('widget');
    }

    this.render(containerId);
    this.addStyles();
  },

  render(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;

    const { steps, currentStep, title } = state;
    const container = document.getElementById(containerId);
    if (!container) return;

    const visibleSteps = steps.slice(0, currentStep + 1);

    const stepsHtml = visibleSteps.map((step, idx) => `
      <div class="flow-step ${idx === currentStep ? 'active' : 'completed'}">
        <div class="flow-node">${idx + 1}</div>
        <div class="flow-content">
          <strong>${step.title}</strong>
          <p>${step.description}</p>
        </div>
      </div>
    `).join('');

    container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${title}</h3>
        </div>
        <div class="widget-body">
          <div class="flow-container">${stepsHtml}</div>
          <div class="flow-controls mt-1">
            <button class="btn btn-secondary" id="${containerId}-prev" ${currentStep === 0 ? 'disabled' : ''}>← Previous</button>
            <span>Step ${currentStep + 1} / ${steps.length}</span>
            <button class="btn btn-primary" id="${containerId}-next" ${currentStep === steps.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
        </div>
    `;

    // Add event listeners
    const prevBtn = document.getElementById(`${containerId}-prev`);
    const nextBtn = document.getElementById(`${containerId}-next`);

    if (prevBtn) prevBtn.onclick = () => this.prev(containerId);
    if (nextBtn) nextBtn.onclick = () => this.next(containerId);
  },

  next(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (state.currentStep < state.steps.length - 1) {
      state.currentStep++;
      this.render(containerId);
    }
  },

  prev(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (state.currentStep > 0) {
      state.currentStep--;
      this.render(containerId);
    }
  },

  addStyles() {
    if (!document.getElementById('flow-styles')) {
      const style = document.createElement('style');
      style.id = 'flow-styles';
      style.textContent = `
        .flow-container { display: flex; flex-direction: column; gap: 1rem; }
        .flow-step { display: flex; gap: 1rem; align-items: flex-start; opacity: 0.4; transition: all 0.3s ease; }
        .flow-step.active { opacity: 1; }
        .flow-step.completed { opacity: 0.7; }
        .flow-node { 
          min-width: 3rem; height: 3rem; border-radius: 50%; 
          background: var(--bg-tertiary); display: flex; align-items: center; 
          justify-content: center; font-weight: bold; border: 2px solid var(--border-color);
        }
        .flow-step.active .flow-node { 
          background: var(--color-primary); color: white; border-color: var(--color-primary);
          animation: pulse 2s infinite;
        }
        .flow-step.completed .flow-node { background: var(--color-success); color: white; border-color: var(--color-success); }
        .flow-content { flex: 1; }
        .flow-controls { display: flex; justify-content: space-between; align-items: center; }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `;
      document.head.appendChild(style);
    }
  }
};

/**
 * ============================================
 * 4. Log Analyzer (REFACTORED - Dynamic Data)
 * ============================================
 */
AppSecWidgets.LogAnalyzer = {
  create(containerId, data = {}) {
    const defaultData = {
      title: '🔍 Security Log Analyzer',
      columns: ['Time', 'Event', 'User', 'IP', 'Status'],
      logs: [],
      placeholder: 'No logs to display. Pass log data via the data parameter.'
    };
    const config = { ...defaultData, ...data };

    const container = document.getElementById(containerId);
    if (!container) return;

    const tableRows = config.logs.length > 0
      ? config.logs.map(log => `
          <tr class="log-row log-${log.severity || 'info'}">
            <td>${log.time || ''}</td>
            <td>${log.event || ''}</td>
            <td>${log.user || ''}</td>
            <td>${log.ip || ''}</td>
            <td><span class="badge badge-${log.status === 'success' ? 'success' : log.status === 'blocked' ? 'danger' : 'warning'}">${log.status || ''}</span></td>
          </tr>
        `).join('')
      : `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-secondary);">${config.placeholder}</td></tr>`;

    container.classList.add('widget');
    container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${config.title}</h3>
          <button class="btn btn-secondary" onclick="AppSecWidgets.LogAnalyzer.refresh('${containerId}')">🔄 Refresh</button>
        </div>
        <div class="widget-body">
          <div class="table-responsive">
            <table class="log-table">
              <thead>
                <tr>
                  ${config.columns.map(col => `<th>${col}</th>`).join('')}
                </tr>
              </thead>
              <tbody id="${containerId}-logs">
                ${tableRows}
              </tbody>
            </table>
          </div>
        </div>
    `;

    AppSecWidgets._state[containerId] = { config };
    this.addStyles();
  },

  refresh(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;
    this.create(containerId, state.config);
    window.AppSec?.Notify?.show('🔄 Logs refreshed', 'info');
  },

  addStyles() {
    if (!document.getElementById('log-analyzer-styles')) {
      const style = document.createElement('style');
      style.id = 'log-analyzer-styles';
      style.textContent = `
        .log-table { width: 100%; border-collapse: collapse; }
        .log-table th, .log-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid var(--border-color); }
        .log-table th { background: var(--bg-tertiary); font-weight: 600; }
        .log-row:hover { background: var(--bg-secondary); }
        .log-warning { background: rgba(255, 193, 7, 0.1); }
        .log-danger { background: rgba(220, 53, 69, 0.1); }
        .table-responsive { overflow-x: auto; }
      `;
      document.head.appendChild(style);
    }
  }
};

/**
 * ============================================
 * 5. Progress Tracker (REFACTORED - Dynamic Data)
 * ============================================
 */
AppSecWidgets.ProgressTracker = {
  create(containerId, data = {}) {
    const defaultData = {
      title: '📊 Security Skills Progress',
      categories: [],
      placeholder: 'No progress data available.'
    };
    const config = { ...defaultData, ...data };

    const container = document.getElementById(containerId);
    if (!container) return;

    const categoriesHtml = config.categories.length > 0
      ? config.categories.map(cat => `
          <div class="progress-category">
            <div class="progress-header">
              <span>${cat.icon || '📘'} ${cat.name || 'Unknown'}</span>
              <span class="progress-percent">${cat.progress || 0}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${cat.progress || 0}%"></div>
            </div>
            ${cat.items && cat.items.length > 0 ? `
              <ul class="progress-items">
                ${cat.items.map(item => `
                  <li>
                    <span class="progress-status">${item.completed ? '✅' : '⬜'}</span>
                    ${item.name || ''}
                  </li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')
      : `<p style="text-align: center; padding: 2rem; color: var(--text-secondary);">${config.placeholder}</p>`;

    container.classList.add('widget');
    container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${config.title}</h3>
        </div>
        <div class="widget-body">
          ${categoriesHtml}
        </div>
    `;

    this.addStyles();
  },

  addStyles() {
    if (!document.getElementById('progress-tracker-styles')) {
      const style = document.createElement('style');
      style.id = 'progress-tracker-styles';
      style.textContent = `
        .progress-category { margin-bottom: 1.5rem; }
        .progress-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-weight: 600; }
        .progress-percent { color: var(--color-primary); }
        .progress-bar { height: 0.5rem; background: var(--bg-tertiary); border-radius: 0.25rem; overflow: hidden; margin-bottom: 0.75rem; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, var(--color-primary), var(--color-success)); transition: width 0.3s ease; }
        .progress-items { list-style: none; padding: 0; margin: 0; }
        .progress-items li { padding: 0.5rem; display: flex; gap: 0.5rem; align-items: center; }
        .progress-status { font-size: 1rem; }
      `;
      document.head.appendChild(style);
    }
  }
};

/**
 * ============================================
 * 6. Attack Vector Sandbox (REFACTORED - Dynamic Data)
 * ============================================
 */
AppSecWidgets.AttackSandbox = {
  create(containerId, data = {}) {
    const defaultData = {
      title: '🎯 Attack Vector Sandbox',
      scenarios: [],
      placeholder: 'No attack scenarios available.'
    };
    const config = { ...defaultData, ...data };

    AppSecWidgets._state[containerId] = {
      scenarios: config.scenarios,
      currentScenario: 0,
      output: '',
      title: config.title,
      placeholder: config.placeholder
    };

    const container = document.getElementById(containerId);
    if (container) {
      container.classList.add('widget');
    }

    this.render(containerId);
    this.addStyles();
  },

  render(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;

    const { scenarios, currentScenario, output, title, placeholder } = state;
    const container = document.getElementById(containerId);
    if (!container) return;

    if (scenarios.length === 0) {
      container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${title}</h3>
        </div>
        <div class="widget-body">
          <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">${placeholder}</p>
        </div>
      `;
      return;
    }

    const scenario = scenarios[currentScenario];
    const scenarioButtons = scenarios.map((s, idx) => `
      <button class="btn ${idx === currentScenario ? 'btn-primary' : 'btn-secondary'}" 
              onclick="AppSecWidgets.AttackSandbox.selectScenario('${containerId}', ${idx})">
        ${s.name || `Scenario ${idx + 1}`}
      </button>
    `).join('');

    container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${title}</h3>
        </div>
        <div class="widget-body">
          <div class="attack-scenarios mb-1">
            ${scenarioButtons}
          </div>
          <div class="attack-details">
            <h4>${scenario.name || 'Attack Scenario'}</h4>
            <p>${scenario.description || ''}</p>
            <div class="grid grid-2 mt-1">
              <div>
                <label><strong>Attack Payload</strong></label>
                <textarea id="${containerId}-payload" rows="6">${scenario.payload || ''}</textarea>
                <button class="btn btn-danger mt-1" onclick="AppSecWidgets.AttackSandbox.executeAttack('${containerId}')">
                  ⚔️ Execute Attack
                </button>
              </div>
              <div>
                <label><strong>System Response</strong></label>
                <textarea id="${containerId}-output" rows="6" readonly placeholder="Output will appear here...">${output}</textarea>
              </div>
            </div>
          </div>
        </div>
    `;
  },

  selectScenario(containerId, index) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;
    state.currentScenario = index;
    state.output = '';
    this.render(containerId);
  },

  executeAttack(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;

    const scenario = state.scenarios[state.currentScenario];
    const payload = document.getElementById(`${containerId}-payload`).value;

    let response = scenario.response || 'Attack executed. No specific response defined.';

    // Check if scenario has custom response logic
    if (scenario.checkPayload && typeof scenario.checkPayload === 'function') {
      response = scenario.checkPayload(payload);
    }

    state.output = response;
    const outputEl = document.getElementById(`${containerId}-output`);
    if (outputEl) {
      outputEl.value = response;
    }

    if (scenario.notifyType && window.AppSec?.Notify) {
      window.AppSec.Notify.show(scenario.notifyMessage || 'Attack executed', scenario.notifyType);
    }
  },

  addStyles() {
    if (!document.getElementById('attack-sandbox-styles')) {
      const style = document.createElement('style');
      style.id = 'attack-sandbox-styles';
      style.textContent = `
        .attack-scenarios { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .attack-details h4 { margin-bottom: 0.5rem; color: var(--color-danger); }
        .attack-details p { margin-bottom: 1rem; color: var(--text-secondary); }
      `;
      document.head.appendChild(style);
    }
  }
};

/**
 * ============================================
 * 7. TLS Certificate Inspector (REFACTORED - Dynamic Data)
 * ============================================
 */
AppSecWidgets.CertificateInspector = {
  create(containerId, data = {}) {
    const defaultData = {
      title: '🔐 TLS Certificate Inspector',
      certificate: null,
      placeholder: 'No certificate data provided.'
    };
    const config = { ...defaultData, ...data };

    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.add('widget');

    if (!config.certificate) {
      container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${config.title}</h3>
        </div>
        <div class="widget-body">
          <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">${config.placeholder}</p>
        </div>
      `;
      return;
    }

    const cert = config.certificate;
    const now = new Date();
    const validFrom = cert.validFrom ? new Date(cert.validFrom) : null;
    const validTo = cert.validTo ? new Date(cert.validTo) : null;
    const isExpired = validTo && validTo < now;
    const daysUntilExpiry = validTo ? Math.floor((validTo - now) / (1000 * 60 * 60 * 24)) : null;

    container.innerHTML = `
      <div class="widget-header">
        <h3 class="widget-title">${config.title}</h3>
        <span class="cert-status ${isExpired ? 'cert-expired' : 'cert-valid'}">
          ${isExpired ? '❌ Expired' : '✅ Valid'}
        </span>
      </div>
      <div class="widget-body">
        <div class="cert-details">
          <div class="cert-field">
            <strong>Common Name (CN):</strong>
            <span>${cert.commonName || 'N/A'}</span>
          </div>
          <div class="cert-field">
            <strong>Issuer:</strong>
            <span>${cert.issuer || 'N/A'}</span>
          </div>
          <div class="cert-field">
            <strong>Valid From:</strong>
            <span>${cert.validFrom || 'N/A'}</span>
          </div>
          <div class="cert-field">
            <strong>Valid To:</strong>
            <span>${cert.validTo || 'N/A'}</span>
          </div>
          <div class="cert-field">
            <strong>Serial Number:</strong>
            <span>${cert.serialNumber || 'N/A'}</span>
          </div>
          <div class="cert-field">
            <strong>Signature Algorithm:</strong>
            <span>${cert.signatureAlgorithm || 'N/A'}</span>
          </div>
          ${daysUntilExpiry !== null ? `
            <div class="cert-field">
              <strong>Days Until Expiry:</strong>
              <span class="${daysUntilExpiry < 30 ? 'text-danger' : daysUntilExpiry < 90 ? 'text-warning' : 'text-success'}">
                ${daysUntilExpiry} days
              </span>
            </div>
          ` : ''}
        </div>
      </div>
    `;

    this.addStyles();
  },

  addStyles() {
    if (!document.getElementById('cert-inspector-styles')) {
      const style = document.createElement('style');
      style.id = 'cert-inspector-styles';
      style.textContent = `
        .cert-status { padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem; font-weight: 600; }
        .cert-valid { background: var(--color-success); color: white; }
        .cert-expired { background: var(--color-danger); color: white; }
        .cert-details { display: flex; flex-direction: column; gap: 1rem; }
        .cert-field { display: flex; justify-content: space-between; padding: 0.75rem; background: var(--bg-secondary); border-radius: 0.25rem; }
        .cert-field strong { color: var(--text-primary); }
        .cert-field span { color: var(--text-secondary); }
        .text-success { color: var(--color-success); }
        .text-warning { color: var(--color-warning); }
        .text-danger { color: var(--color-danger); }
      `;
      document.head.appendChild(style);
    }
  }
};

/**
 * ============================================
 * 8. Code Review Checker (ADVANCED – Line Highlight + Collapsible Findings)
 * ============================================
 */
AppSecWidgets.CodeReviewChecker = {
  create(containerId, data = {}) {
    const defaultData = {
      title: '🔎 Security Code Review',
      code: '',
      vulnerabilities: [],
      placeholder: 'No code provided for review.'
    };
    const config = { ...defaultData, ...data };

    const container = document.getElementById(containerId);
    if (!container) return;

    if (!config.code) {
      container.classList.add('widget');
      container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${config.title}</h3>
        </div>
        <div class="widget-body">
          <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">${config.placeholder}</p>
        </div>
      `;
      return;
    }

    const vulnCount = config.vulnerabilities.length;

    // Collapsible vulnerability list
    const vulnHtml = vulnCount > 0
      ? config.vulnerabilities.map(v => `
        <div class="vuln-item vuln-${v.severity || 'info'}">
          <button class="vuln-toggle" type="button">
            <div class="vuln-toggle-left">
              <span class="vuln-badge vuln-badge-${v.severity || 'info'}">
                ${(v.severity || 'info').toUpperCase()}
              </span>
              <strong>${v.title || 'Security Issue'}</strong>
            </div>
            <span class="chevron">▼</span>
          </button>

          <div class="vuln-body">
            <p>${v.description || ''}</p>
            ${v.line ? `<p class="vuln-line">Line ${v.line}</p>` : ''}
            ${v.recommendation ? `
              <div class="vuln-fix">
                <strong>Fix:</strong>
                <p>${v.recommendation}</p>
              </div>
            ` : ''}
          </div>
        </div>
      `).join('')
      : `<p style="color: var(--color-success);">✅ No vulnerabilities detected!</p>`;


    container.classList.add('widget');
    container.innerHTML = `
      <div class="widget-header">
        <h3 class="widget-title">${config.title}</h3>
        <div class="vuln-count">${vulnCount} issue${vulnCount !== 1 ? 's' : ''}</div>
      </div>

      <div class="widget-body">
        <div class="code-review-section">
          <pre><code>${this.escapeHtml(config.code)}</code></pre>
        </div>

        <div class="code-review-section mt-1">
          <p><strong>Security Findings</strong></p>
          ${vulnHtml}
        </div>
      </div>
    `;

    // Add line numbers
    if (window.AppSec?.CodeDisplay?.addLineNumbers) {
      const pre = container.querySelector('pre');
      window.AppSec.CodeDisplay.addLineNumbers(pre);

      // Highlight affected lines automatically
      const lines = config.vulnerabilities
        .map(v => v.line)
        .filter(Boolean);

      if (lines.length > 0 && window.AppSec.CodeDisplay.highlightLines) {
        window.AppSec.CodeDisplay.highlightLines(pre, lines);
      }
    }

    this.bindCollapseEvents(container);
    this.addStyles();
  },

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  },

  bindCollapseEvents(container) {
    const toggles = container.querySelectorAll('.vuln-toggle');
    toggles.forEach(btn => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        body.classList.toggle('open');
        btn.querySelector('.chevron').classList.toggle('rotated');
      });
    });
  },

  addStyles() {
    if (document.getElementById('code-review-styles-advanced')) return;

    const style = document.createElement('style');
    style.id = 'code-review-styles-advanced';

    style.textContent = `
      /* Count badge */
      .vuln-count {
        padding: 0.25rem 0.75rem;
        border-radius: 999px;
        background: var(--bg-tertiary);
        color: var(--text-secondary);
        border: 1px solid var(--border-color);
        font-size: 0.75rem;
        font-weight: 600;
      }

      /* Collapsible structure */
      .vuln-item {
        border-radius: 0.35rem;
        margin-bottom: 0.75rem;
        border: 1px solid var(--border-color);
        background: var(--bg-tertiary);
        overflow: hidden;
      }

      .vuln-toggle {
        width: 100%;
        padding: 0.6rem 0.8rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--text-primary);
      }

      .vuln-toggle-left { 
        display: flex;
        align-items: center;
        gap: 0.6rem;
      }

      .vuln-body {
        display: none;
        padding: 0.75rem 1rem;
        background: var(--bg-secondary);
        border-top: 1px solid var(--border-color);
      }
      .vuln-body.open { display: block; }

      .chevron { transition: transform 0.2s; }
      .chevron.rotated { transform: rotate(180deg); }

      /* Left severity border */
      .vuln-critical { border-left: 4px solid #dc3545; }
      .vuln-high { border-left: 4px solid #fd7e14; }
      .vuln-medium { border-left: 4px solid #ffc107; }
      .vuln-low { border-left: 4px solid #0dcaf0; }
      .vuln-info { border-left: 4px solid #6c757d; }

      /* Small badge */
      .vuln-badge {
        padding: 0.15rem 0.5rem;
        border-radius: 0.25rem;
        font-size: 0.7rem;
        font-weight: 600;
        color: white;
      }
      .vuln-badge-critical { background: #dc3545; }
      .vuln-badge-high { background: #fd7e14; }
      .vuln-badge-medium { background: #ffc107; color: black; }
      .vuln-badge-low { background: #0dcaf0; color: black; }
      .vuln-badge-info { background: #6c757d; }

      /* Light green tinted fix box */
      .vuln-fix {
        margin-top: 0.6rem;
        padding: 0.6rem;
        border-radius: 0.25rem;
        border: 1px solid rgba(0, 128, 0, 0.25);
        background: rgba(0, 255, 0, 0.10);
      }
      
      .vuln-fix > p {
        margin-bottom: 0px;
        font-size: 0.875rem;
      }

      /* Align line note */
      .vuln-line {
        font-size: 0.8rem;
        color: var(--text-secondary);
        margin-top: 0.4rem;
      }
    `;

    document.head.appendChild(style);
  }
};

/**
 * ============================================
 * 9. Vulnerability Timeline (REFACTORED - Dynamic Data)
 * ============================================
 */
AppSecWidgets.VulnerabilityTimeline = {
  create(containerId, data = {}) {
    const defaultData = {
      title: '📅 Vulnerability Timeline',
      vulnerabilities: [],
      placeholder: 'No vulnerability data available.'
    };
    const config = { ...defaultData, ...data };

    const container = document.getElementById(containerId);
    if (!container) return;

    if (config.vulnerabilities.length === 0) {
      container.classList.add('widget');
      container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${config.title}</h3>
        </div>
        <div class="widget-body">
          <p style="text-align: center; padding: 2rem; color: var(--text-secondary);">${config.placeholder}</p>
        </div>
      `;
      return;
    }

    const timelineHtml = config.vulnerabilities.map((vuln, idx) => `
      <div class="timeline-item">
        <div class="timeline-marker"></div>
        <div class="timeline-content">
          <div class="timeline-header">
            <strong>${vuln.id || `VULN-${idx + 1}`}</strong>
            <span class="timeline-date">${vuln.date || 'N/A'}</span>
          </div>
          <h4>${vuln.title || 'Vulnerability'}</h4>
          <p>${vuln.description || ''}</p>
          ${vuln.severity ? `
            <span class="severity-badge severity-${vuln.severity.toLowerCase()}">
              ${vuln.severity}
            </span>
          ` : ''}
          ${vuln.link ? `
            <a href="${vuln.link}" target="_blank" class="timeline-link">
              View Details →
            </a>
          ` : ''}
        </div>
      </div>
    `).join('');

    container.classList.add('widget');
    container.innerHTML = `
      <div class="widget-header">
        <h3 class="widget-title">${config.title}</h3>
      </div>
      <div class="widget-body">
        <div class="timeline">
          ${timelineHtml}
        </div>
      </div>
    `;

    this.addStyles();
  },

  addStyles() {
    if (!document.getElementById('timeline-styles')) {
      const style = document.createElement('style');
      style.id = 'timeline-styles';
      style.textContent = `
        .timeline { position: relative; padding-left: 2rem; }
        .timeline::before { content: ''; position: absolute; left: 0.5rem; top: 0; bottom: 0; width: 2px; background: var(--border-color); }
        .timeline-item { position: relative; margin-bottom: 2rem; }
        .timeline-marker { position: absolute; left: -1.6rem; top: 0.25rem; width: 1rem; height: 1rem; border-radius: 50%; background: var(--color-primary); border: 2px solid var(--bg-primary); }
        .timeline-content { background: var(--bg-secondary); padding: 1rem; border-radius: 0.5rem; }
        .timeline-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .timeline-header strong { color: var(--color-primary); }
        .timeline-date { font-size: 0.875rem; color: var(--text-secondary); }
        .timeline-content h4 { margin: 0.5rem 0; }
        .timeline-content p { color: var(--text-secondary); margin-bottom: 0.75rem; }
        .severity-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 0.25rem; font-size: 0.875rem; font-weight: 600; }
        .severity-critical { background: #dc3545; color: white; }
        .severity-high { background: #fd7e14; color: white; }
        .severity-medium { background: #ffc107; color: #000; }
        .severity-low { background: #0dcaf0; color: #000; }
        .timeline-link { display: inline-block; margin-top: 0.5rem; color: var(--color-primary); text-decoration: none; }
        .timeline-link:hover { text-decoration: underline; }
      `;
      document.head.appendChild(style);
    }
  }
};

/* ============================================================
 * 10. JSON-Driven Quiz Widget (improved, step-by-step by default)
 * ============================================================ */
AppSecWidgets.Quiz = {
  create(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !data || !Array.isArray(data.questions)) return;

    container.classList.add('widget', 'widget-quiz');

    const mode = data.mode || 'step';

    // Classic mode: render all questions at once + single "Check answers" button
    if (mode === 'classic') {
      const questionsHtml = data.questions.map((q, idx) => `
        <li class="quiz-question">
          <p>${q.text}</p>
          ${q.options.map((opt) => `
            <label class="quiz-option">
              <input type="radio" name="q${idx}" value="${opt.value}">
              ${opt.label}
            </label>
          `).join("")}
        </li>
      `).join("");

      // Inject only inner widget structure
      container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${data.title || "🗘️ Knowledge Check"}</h3>
        </div>
        <div class="widget-body">
          ${data.intro ? `<p class="quiz-intro">${data.intro}</p>` : ""}
          <ol class="quiz-list">${questionsHtml}</ol>
          <button class="btn btn-primary mt-1 quiz-check-btn">
            Check Answers
          </button>
          <div class="quiz-result mt-1" id="${containerId}-result"></div>
        </div>
      `;

      const checkBtn = container.querySelector(".quiz-check-btn");
      if (checkBtn) {
        checkBtn.addEventListener("click", () => {
          this.checkClassic(containerId, data.questions);
        });
      }
      return;
    }

    // STEP MODE (default): one question at a time with Start button
    AppSecWidgets._state[containerId] = {
      questions: data.questions,
      currentIndex: 0,
      score: 0
    };

    container.innerHTML = `
      <div class="widget-header">
        <h3 class="widget-title">${data.title || "🗘️ Knowledge Check"}</h3>
        <div class="quiz-meta" id="${containerId}-meta" style="display:none;">
          <span class="quiz-progress" id="${containerId}-progress"></span>
          <span class="quiz-score" id="${containerId}-score"></span>
        </div>
      </div>
      <div class="widget-body">
        ${data.intro ? `<p class="quiz-intro" id="${containerId}-intro">${data.intro}</p>` :
        `<p class="quiz-intro" id="${containerId}-intro">Short quiz to test your understanding.</p>`}
        <button class="btn btn-primary" id="${containerId}-start-btn">Start Quiz</button>
        <div class="quiz-question-container" id="${containerId}-question" style="display:none;"></div>
        <div class="quiz-result mt-1" id="${containerId}-result"></div>
      </div>
    `;

    const startBtn = document.getElementById(`${containerId}-start-btn`);
    if (startBtn) {
      startBtn.addEventListener("click", () => {
        this.start(containerId);
      });
    }
  },

  // Classic mode checker
  checkClassic(containerId, questions) {
    let score = 0;
    questions.forEach((q, idx) => {
      const selected = document.querySelector(`input[name="q${idx}"]:checked`);
      if (selected && q.options.find(o => o.correct && o.value === selected.value)) {
        score++;
      }
    });

    const result = document.getElementById(`${containerId}-result`);
    if (!result) return;
    result.innerHTML = `
      <div class="callout callout-info-solid">
        You scored <strong>${score}</strong> / <strong>${questions.length}</strong>
      </div>
    `;
  },

  start(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;

    const introEl = document.getElementById(`${containerId}-intro`);
    const startBtn = document.getElementById(`${containerId}-start-btn`);
    const metaEl = document.getElementById(`${containerId}-meta`);
    const questionContainer = document.getElementById(`${containerId}-question`);

    if (introEl) introEl.style.display = "none";
    if (startBtn) startBtn.style.display = "none";
    if (metaEl) metaEl.style.display = "flex";
    if (questionContainer) questionContainer.style.display = "block";

    state.currentIndex = 0;
    state.score = 0;
    this.renderQuestion(containerId);
  },

  renderQuestion(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;

    const { questions, currentIndex, score } = state;
    const q = questions[currentIndex];
    const total = questions.length;

    const progressEl = document.getElementById(`${containerId}-progress`);
    const scoreEl = document.getElementById(`${containerId}-score`);
    const questionContainer = document.getElementById(`${containerId}-question`);

    if (progressEl) progressEl.textContent = `Question ${currentIndex + 1}/${total}`;
    if (scoreEl) scoreEl.textContent = `Score: ${score}`;
    if (!questionContainer) return;

    const optionsHtml = q.options.map(opt => `
      <button type="button" class="quiz-option-btn" data-value="${opt.value}">
        ${opt.label}
      </button>
    `).join("");

    questionContainer.innerHTML = `
      <div class="quiz-question-card">
        <p class="quiz-question-text">${q.text}</p>
        <div class="quiz-options">
          ${optionsHtml}
        </div>
      </div>
    `;

    questionContainer.querySelectorAll(".quiz-option-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const value = e.currentTarget.getAttribute("data-value");
        this.handleAnswer(containerId, value);
      });
    });
  },

  handleAnswer(containerId, value) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;
    const { questions, currentIndex } = state;
    const q = questions[currentIndex];

    const isCorrect = q.options.some(o => o.correct && o.value === value);
    if (isCorrect) {
      state.score += 1;
    }

    const result = document.getElementById(`${containerId}-result`);
    if (result) {
      result.innerHTML = `
        <div class="alert ${isCorrect ? "alert-success-solid" : "alert-danger-solid"}">
          ${isCorrect ? "✅ Correct!" : "❌ Not quite. Review the concept above and try to reason why."}
        </div>
      `;
    }

    if (currentIndex + 1 < questions.length) {
      state.currentIndex += 1;
      this.renderQuestion(containerId);
    } else {
      this.finish(containerId);
    }
  },

  finish(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;
    const { questions, score } = state;

    const questionContainer = document.getElementById(`${containerId}-question`);
    const progressEl = document.getElementById(`${containerId}-progress`);
    const scoreEl = document.getElementById(`${containerId}-score`);
    const result = document.getElementById(`${containerId}-result`);

    if (questionContainer) {
      questionContainer.innerHTML = `
        <div class="quiz-question-card">
          <p class="quiz-question-text">Nice work! You answered all questions.</p>
        </div>
      `;
    }
    if (progressEl) progressEl.textContent = "Completed";
    if (scoreEl) scoreEl.textContent = `Final score: ${score}/${questions.length}`;

    if (result) {
      result.innerHTML = `
        <div class="callout callout-info-solid">
          You scored <strong>${score}</strong> out of <strong>${questions.length}</strong>.
        </div>
      `;
    }
  }
};

/**
 * ============================================
 * 11. Input Validation Trainer (NEW!)
 * ============================================
 * Purpose: Practice input validation patterns
 * Use for: Regex, sanitization, validation
 */
AppSecWidgets.ValidationTrainer = {
  create(containerId, data = {}) {
    const defaultPatterns = {
      email: {
        regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        examples: ['user@example.com', 'john.doe+tag@company.co.uk'],
        description: 'Valid email format'
      },
      url: {
        regex: /^https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/,
        examples: ['https://example.com', 'http://sub.example.com/path'],
        description: 'Valid HTTP/HTTPS URL'
      },
      phone: {
        regex: /^\+?1?\d{10,14}$/,
        examples: ['+12025551234', '2025551234'],
        description: 'Valid phone number'
      },
      ssn: {
        regex: /^\d{3}-\d{2}-\d{4}$/,
        examples: ['123-45-6789'],
        description: 'Valid SSN format (should be encrypted!)'
      },
      creditcard: {
        regex: /^\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}$/,
        examples: ['4532-1234-5678-9010', '4532123456789010'],
        description: 'Valid credit card format (should be tokenized!)'
      }
    };

    const config = {
      title: data.title || '✅ Input Validation Trainer',
      patterns: data.patterns || defaultPatterns
    };

    const ruleOptions = Object.keys(config.patterns).map(key => {
      const pattern = config.patterns[key];
      const label = pattern.label || key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1');
      return `<option value="${key}">${label}</option>`;
    }).join('');

    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.add('widget');
    container.innerHTML = `
      <div class="widget-header">
        <h3 class="widget-title">${config.title}</h3>
      </div>
      <div class="widget-body">
        <div class="grid grid-2">
          <div>
            <label><strong>Validation Rule</strong></label>
            <select id="${containerId}-rule" onchange="AppSecWidgets.ValidationTrainer.updateExample('${containerId}')">
              ${ruleOptions}
            </select>
            
            <label class="mt-1"><strong>Regex Pattern</strong></label>
            <input type="text" id="${containerId}-pattern" readonly>
            
            <label class="mt-1"><strong>Test Input</strong></label>
            <input type="text" id="${containerId}-input" placeholder="Enter test value...">
            
            <button class="btn btn-primary mt-1" onclick="AppSecWidgets.ValidationTrainer.validate('${containerId}')">Validate</button>
          </div>
          
          <div>
            <label><strong>Validation Result</strong></label>
            <div id="${containerId}-result" class="mt-1"></div>
            
            <label class="mt-1"><strong>Example Valid Inputs</strong></label>
            <div id="${containerId}-examples" style="background: var(--code-bg); padding: 1rem; border-radius: 0.5rem;"></div>
          </div>
        </div>
      </div>
    `;

    AppSecWidgets._state[containerId] = { config: config };
    this.updateExample(containerId);
  },

  updateExample(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;
    const config = state.config;
    const rule = document.getElementById(`${containerId}-rule`).value;
    const pattern = config.patterns[rule];

    document.getElementById(`${containerId}-pattern`).value = pattern.regex.toString();
    document.getElementById(`${containerId}-examples`).innerHTML =
      `<p><strong>${pattern.description}</strong></p>` +
      pattern.examples.map(ex => `<code>${ex}</code>`).join('<br>');
  },

  validate(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;
    const config = state.config;
    const rule = document.getElementById(`${containerId}-rule`).value;
    const input = document.getElementById(`${containerId}-input`).value;
    const result = document.getElementById(`${containerId}-result`);
    const pattern = config.patterns[rule];

    if (!input) {
      result.innerHTML = '<div class="alert alert-warning">⚠️ Please enter a value to validate</div>';
      return;
    }

    const isValid = pattern.regex.test(input);

    if (isValid) {
      result.innerHTML = `
        <div class="callout callout-success">
          <p><strong>✅ Valid Input</strong></p>
          <p>Matches pattern: ${pattern.description}</p>
        </div>
      `;
    } else {
      result.innerHTML = `
        <div class="callout callout-danger">
          <p><strong>❌ Invalid Input</strong></p>
          <p>Does not match required pattern</p>
          <p><strong>Expected:</strong> ${pattern.description}</p>
        </div>
      `;
    }
  }
};

/**
 * ============================================
 * 12. Threat Modeling Canvas (Guided + Context)
 * ============================================
 */
AppSecWidgets.ThreatModel = {
  prompts: {
    spoofing: [
      'Can an attacker pretend to be another user, service, or system?',
      'Are authentication tokens (cookies, JWTs, API keys) easily guessable or stealable?',
      'Is there any place where identity is inferred only from user-controlled data (e.g., headers, query params)?',
      'Are password reset, MFA, or device-trust flows protected against abuse?'
    ],
    tampering: [
      'Can an attacker modify parameters, hidden fields, or client-side data that the server trusts?',
      'Are critical configuration files or environment variables exposed or unprotected?',
      'Are messages between services protected against modification in transit?',
      'Are logs or audit trails tamper-resistant?'
    ],
    repudiation: [
      'Can a user deny performing an action because logs are missing or weak?',
      'Are high-risk actions (money movement, privilege changes) traceable to a specific identity?',
      'Are logs time-synchronized and protected from deletion?',
      'Are sensitive actions signed or strongly authenticated?'
    ],
    information: [
      'Can sensitive data be read from APIs, logs, caches, or error messages?',
      'Is any PII, secrets, or tokens stored or transmitted without encryption?',
      'Are access controls enforced at the object / tenant / row level?',
      'Are debug endpoints or verbose errors exposed in production?'
    ],
    dos: [
      'What happens if a single client sends too many requests or expensive operations?',
      'Are there endpoints that trigger heavy background jobs, reports, or database scans?',
      'Are there protections against abuse of authentication, password resets, or sign-up flows?',
      'Are upstream dependencies (DB, cache, queues) protected against overload?'
    ],
    elevation: [
      'Can a normal user gain admin-like capabilities via parameter changes or missing checks?',
      'Are role/permission checks centralized and consistent across services?',
      'Can an attacker abuse a low-privileged component or service to reach a high-privileged one?',
      'Are there hidden or debug endpoints that bypass authorization?'
    ]
  },

  create(containerId, prefill = null, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const title = options.title || '🎯 Threat Modeling Canvas (STRIDE)';
    container.classList.add('widget');

    const categories = [
      { id: 'spoofing', label: 'Spoofing', emoji: '🗝', color: 'var(--color-danger)' },
      { id: 'tampering', label: 'Tampering', emoji: '🔧', color: 'var(--color-danger)' },
      { id: 'repudiation', label: 'Repudiation', emoji: '📝', color: 'var(--color-warning)' },
      { id: 'information', label: 'Information Disclosure', emoji: '📢', color: 'var(--color-danger)' },
      { id: 'dos', label: 'Denial of Service', emoji: '⚡', color: 'var(--color-warning)' },
      { id: 'elevation', label: 'Elevation of Privilege', emoji: '👑', color: 'var(--color-danger)' }
    ];

    const categoriesHtml = categories.map(cat => {
      const prompts = (this.prompts[cat.id] || [])
        .map(p => `<li>${p}</li>`)
        .join('');
      return `
        <div class="threat-category">
          <h4 style="color: ${cat.color};">${cat.emoji} ${cat.label}</h4>
          <textarea id="${containerId}-${cat.id}" rows="4" placeholder="List concrete threats, scenarios, and affected components..."></textarea>
          <details class="threat-prompts mt-1">
            <summary>💡 Guided questions</summary>
            <ul class="mt-1" style="margin-left: 1.25rem; font-size: 0.85rem; color: var(--text-muted);">
              ${prompts}
            </ul>
          </details>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="widget-header">
        <h3 class="widget-title">${title}</h3>
      </div>
      <div class="widget-body">
        <!-- Architecture / Context Section -->
        <div class="grid grid-2 threat-architecture mb-1">
          <div>
            <h4>📦 System Overview</h4>
            <label class="mt-0-5">System / Feature Name</label>
            <input type="text" id="${containerId}-system-name" placeholder="e.g., Payments API, Login service">
            
            <label class="mt-0-5">System Type</label>
            <select id="${containerId}-system-type">
              <option value="">Select...</option>
              <option value="web-app">Web Application</option>
              <option value="api">Public / Internal API</option>
              <option value="mobile">Mobile App + Backend</option>
              <option value="saas-multitenant">SaaS (Multi-tenant)</option>
              <option value="microservices">Microservices / Event-driven</option>
              <option value="other">Other / Mixed</option>
            </select>

            <label class="mt-0-5">Primary Actors</label>
            <textarea id="${containerId}-actors" rows="3" placeholder="Users, admins, services, third parties..."></textarea>
          </div>
          <div>
            <h4>🧩 Assets, Data & Boundaries</h4>
            <label class="mt-0-5">Critical Assets</label>
            <textarea id="${containerId}-assets" rows="3" placeholder="What are we protecting? (money, PII, secrets, IP, availability)"></textarea>

            <label class="mt-0-5">Entry Points</label>
            <textarea id="${containerId}-entrypoints" rows="3" placeholder="Login, APIs, webhooks, message queues, admin interfaces..."></textarea>

            <label class="mt-0-5">Data Classification & Trust Boundaries</label>
            <textarea id="${containerId}-boundaries" rows="3" placeholder="Where does trust change? (internet ↔ edge, app ↔ DB, tenant ↔ tenant, etc.)"></textarea>
          </div>
        </div>

        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);">

        <!-- STRIDE Categories -->
        <div class="grid grid-3">
          ${categoriesHtml}
        </div>

        <div class="mt-1" style="display: flex; flex-wrap: wrap; gap: 0.5rem;">
          <button class="btn btn-primary" onclick="AppSecWidgets.ThreatModel.exportModel('${containerId}')">
            💽 Export JSON
          </button>
          <button class="btn btn-secondary" onclick="AppSecWidgets.ThreatModel.exportMarkdown('${containerId}')">
            📄 Export Markdown Summary
          </button>
        </div>
      </div>
    `;

    this.addStyles();

    // --- Auto‑populate if JSON provided ---
    if (prefill && typeof prefill === 'object') {
      // System fields
      if (prefill.system) {
        const sys = prefill.system;
        const assign = (id, val) => {
          const el = document.getElementById(`${containerId}-${id}`);
          if (el && typeof val === 'string') el.value = val;
        };
        assign('system-name', sys.name);
        assign('system-type', sys.type);
        assign('actors', sys.actors);
        assign('assets', sys.assets);
        assign('entrypoints', sys.entryPoints);
        assign('boundaries', sys.boundaries);
      }

      // STRIDE fields
      if (prefill.stride) {
        const stride = prefill.stride;
        const cats = ['spoofing', 'tampering', 'repudiation', 'information', 'dos', 'elevation'];
        cats.forEach(cat => {
          const el = document.getElementById(`${containerId}-${cat}`);
          if (el && typeof stride[cat] === 'string') el.value = stride[cat];
        });
      }
    }
  },

  addStyles() {
    if (document.getElementById('threat-model-styles')) return;
    const style = document.createElement('style');
    style.id = 'threat-model-styles';
    style.textContent = `
      .threat-architecture h4 {
        margin-bottom: 0.5rem;
      }
      .threat-architecture label {
        display: block;
        font-size: 0.85rem;
        color: var(--text-muted);
      }
      .threat-architecture input,
      .threat-architecture select,
      .threat-architecture textarea {
        width: 100%;
        margin-top: 0.25rem;
      }
      .threat-category textarea {
        width: 100%;
      }
      .threat-prompts summary {
        cursor: pointer;
        font-size: 0.85rem;
        color: var(--text-secondary);
      }
      .threat-prompts summary:hover {
        color: var(--color-primary);
      }
    `;
    document.head.appendChild(style);
  },

  exportModel(containerId) {
    const categories = ['spoofing', 'tampering', 'repudiation', 'information', 'dos', 'elevation'];

    const model = {
      system: {
        name: (document.getElementById(`${containerId}-system-name`) || {}).value || '',
        type: (document.getElementById(`${containerId}-system-type`) || {}).value || '',
        actors: (document.getElementById(`${containerId}-actors`) || {}).value || '',
        assets: (document.getElementById(`${containerId}-assets`) || {}).value || '',
        entryPoints: (document.getElementById(`${containerId}-entrypoints`) || {}).value || '',
        boundaries: (document.getElementById(`${containerId}-boundaries`) || {}).value || '',
        exportedAt: new Date().toISOString()
      },
      stride: {}
    };

    categories.forEach(cat => {
      const textarea = document.getElementById(`${containerId}-${cat}`);
      model.stride[cat] = textarea ? textarea.value : '';
    });

    const json = JSON.stringify(model, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat-model-stride.json';
    a.click();

    if (window.AppSec && window.AppSec.Notify) {
      window.AppSec.Notify.show('Threat model exported as JSON', 'success');
    }
  },

  exportMarkdown(containerId) {
    const getVal = (id) => {
      const el = document.getElementById(id);
      return el ? el.value : '';
    };

    const systemName = getVal(`${containerId}-system-name`);
    const systemType = getVal(`${containerId}-system-type`);
    const actors = getVal(`${containerId}-actors`);
    const assets = getVal(`${containerId}-assets`);
    const entryPoints = getVal(`${containerId}-entrypoints`);
    const boundaries = getVal(`${containerId}-boundaries`);

    const strideCategories = [
      { id: 'spoofing', title: 'Spoofing' },
      { id: 'tampering', title: 'Tampering' },
      { id: 'repudiation', title: 'Repudiation' },
      { id: 'information', title: 'Information Disclosure' },
      { id: 'dos', title: 'Denial of Service' },
      { id: 'elevation', title: 'Elevation of Privilege' }
    ];

    const strideSections = strideCategories.map(cat => {
      const text = getVal(`${containerId}-${cat.id}`);
      const safeText = text || '_No threats documented yet._';
      return `### ${cat.title}\n\n${safeText}\n`;
    }).join('\n');

    const md = `# Threat Model: ${systemName || 'Untitled System'}\n\n` +
      `**System Type:** ${systemType || 'N/A'}  \n` +
      `**Exported At:** ${new Date().toISOString()}\n\n` +
      `## 1. System Overview\n\n` +
      `**Primary Actors**\n\n${actors || '_Not documented._'}\n\n` +
      `**Critical Assets**\n\n${assets || '_Not documented._'}\n\n` +
      `**Entry Points**\n\n${entryPoints || '_Not documented._'}\n\n` +
      `**Data Classification & Trust Boundaries**\n\n${boundaries || '_Not documented._'}\n\n` +
      `## 2. STRIDE Threats\n\n` +
      `${strideSections}`;

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'threat-model-stride.md';
    a.click();

    if (window.AppSec && window.AppSec.Notify) {
      window.AppSec.Notify.show('Threat model exported as Markdown', 'success');
    }
  }
};

/**
 * ============================================
 * 13. API Security Tester (NEW!)
 * ============================================
 * Purpose: Test API authentication and authorization
 * Use for: JWT, API keys, rate limiting
 */
AppSecWidgets.APITester = {
  create(containerId, data = {}) {
    const defaultData = {
      title: '🐜 API Security Tester',
      endpoints: [
        { value: 'public', label: '/api/public', requiresAuth: false },
        { value: 'protected', label: '/api/protected', requiresAuth: true },
        { value: 'admin', label: '/api/admin', requiresAuth: true, requiresAdmin: true }
      ],
      rateLimit: 3,
      responses: {
        public: { status: 200, message: 'Public data accessible' },
        protected: {
          noAuth: { status: 401, error: 'Missing authentication token' },
          invalid: { status: 401, error: 'Invalid token' },
          success: { status: 200, message: 'Protected data', user: 'john@example.com' }
        },
        admin: {
          noAuth: { status: 401, error: 'Missing authentication' },
          forbidden: { status: 403, error: 'Insufficient permissions' },
          success: { status: 200, message: 'Admin data', users: 150 }
        }
      }
    };

    const config = { ...defaultData, ...data };

    const endpointOptions = config.endpoints.map(ep =>
      `<option value="${ep.value}">${ep.label}</option>`
    ).join('');

    const container = document.getElementById(containerId);
    if (!container) return;

    container.classList.add('widget');
    container.innerHTML = `
      <div class="widget-header">
        <h3 class="widget-title">${config.title}</h3>
      </div>
      <div class="widget-body">


            <label><strong>API Endpoint</strong></label>
            <select id="${containerId}-endpoint">
              ${endpointOptions}
            </select>
            
            <label class="mt-1"><strong>Authentication</strong></label>
            <input type="text" id="${containerId}-token" placeholder="Bearer token or API key">
            
            <label class="mt-1"><strong>Rate Limit Test</strong></label>
            <input type="number" id="${containerId}-requests" value="5" min="1" max="20">
            
            <button class="btn btn-primary mt-1" onclick="AppSecWidgets.APITester.testAuth('${containerId}')">Test Auth</button>
            <button class="btn btn-secondary mt-1" onclick="AppSecWidgets.APITester.testRateLimit('${containerId}')">Test Rate Limit</button>

          

            <label><strong>Response Log</strong></label>
            <pre id="${containerId}-log" style="background: var(--code-bg); padding: 0.5rem; border-radius: 0.5rem; min-height: 150px; max-height: 400px; overflow-y: auto;"></pre>


      </div>
    `;

    AppSecWidgets._state[containerId] = {
      requestCount: 0,
      lastRequest: 0,
      config: config
    };
  },

  testAuth(containerId) {
    const state = AppSecWidgets._state[containerId];
    if (!state) return;
    const config = state.config;

    const endpoint = document.getElementById(`${containerId}-endpoint`).value;
    const token = document.getElementById(`${containerId}-token`).value;
    const log = document.getElementById(`${containerId}-log`);

    let response = '';
    const timestamp = new Date().toLocaleTimeString();

    const endpointConfig = config.endpoints.find(ep => ep.value === endpoint);
    const responses = config.responses[endpoint];

    if (!endpointConfig.requiresAuth) {
      const data = responses.status ? responses : config.responses.public;
      response = `[${timestamp}] ✅ ${data.status} OK\n${JSON.stringify({ message: data.message }, null, 2)}\n\n`;
    } else if (endpointConfig.requiresAuth) {
      if (!token) {
        const data = responses.noAuth;
        response = `[${timestamp}] ❌ ${data.status} Unauthorized\n${JSON.stringify({ error: data.error }, null, 2)}\n\n`;
      } else if (token.includes('invalid')) {
        const data = responses.invalid || responses.noAuth;
        response = `[${timestamp}] ❌ ${data.status} Unauthorized\n${JSON.stringify({ error: data.error }, null, 2)}\n\n`;
      } else if (endpointConfig.requiresAdmin && !token.includes('admin')) {
        const data = responses.forbidden;
        response = `[${timestamp}] ❌ ${data.status} Forbidden\n${JSON.stringify({ error: data.error }, null, 2)}\n\n`;
      } else {
        const data = responses.success;
        const responseData = { message: data.message };
        if (data.user) responseData.user = data.user;
        if (data.users) responseData.users = data.users;
        response = `[${timestamp}] ✅ ${data.status} OK\n${JSON.stringify(responseData, null, 2)}\n\n`;
      }
    }

    if (log) {
      log.textContent = response + log.textContent;
    }
  },

  testRateLimit(containerId) {
    const requests = parseInt(document.getElementById(`${containerId}-requests`).value, 10);
    const log = document.getElementById(`${containerId}-log`);
    const state = AppSecWidgets._state[containerId];
    if (!state || !log) return;

    const rateLimit = state.config.rateLimit;
    let output = '';

    for (let i = 0; i < requests; i++) {
      const timestamp = new Date().toLocaleTimeString();
      state.requestCount++;

      if (state.requestCount <= rateLimit) {
        output += `[${timestamp}] Request ${i + 1}: ✅ 200 OK\n`;
      } else {
        output += `[${timestamp}] Request ${i + 1}: ❌ 429 Too Many Requests\n`;
      }
    }

    output += `\n⚠️ Rate limit: ${rateLimit} requests allowed\n`;
    output += `Total requests made: ${state.requestCount}\n\n`;

    log.textContent = output + log.textContent;

    if (state.requestCount > rateLimit) {
      if (window.AppSec && window.AppSec.Notify) {
        window.AppSec.Notify.show('Rate limit exceeded!', 'warning');
      }
    }

    // Reset counter after 5 seconds
    setTimeout(() => { state.requestCount = 0; }, 5000);
  }
};

// -------------------------------------------------------------
// 14. Checklist (Class-based, theme-friendly)
// -------------------------------------------------------------
AppSecWidgets.Checklist = {
  create(containerId, config = {}) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const title = config.title || "📝 Checklist";
    const items = config.items || [];
    const storageKey = "checklist-" + containerId;

    const saved = JSON.parse(localStorage.getItem(storageKey) || "{}");

    el.classList.add("widget");
    el.innerHTML = `
      <div class="widget-header">${title}</div>
      <div class="widget-body">
        <ul class="appsec-checklist">
          ${items
        .map((item, index) => {
          const id = `${containerId}-item-${index}`;
          const checked = saved[id] ? "checked" : "";
          return `
                <li class="appsec-checklist-item">
                  <input 
                    type="checkbox"
                    id="${id}"
                    data-checklist-id="${id}"
                    ${checked}
                    class="appsec-checklist-checkbox"
                  />
                  <label for="${id}" class="appsec-checklist-label">
                    ${item}
                  </label>
                </li>
              `;
        })
        .join("")}
        </ul>
      </div>
    `;

    const checkboxes = el.querySelectorAll(".appsec-checklist-checkbox");
    checkboxes.forEach(cb => {
      cb.addEventListener("change", () => {
        saved[cb.dataset.checklistId] = cb.checked;
        localStorage.setItem(storageKey, JSON.stringify(saved));

        if (window.AppSec?.Notify) {
          AppSec.Notify.show(
            cb.checked ? "Marked complete" : "Marked incomplete",
            "info",
            900
          );
        }
      });
    });
  }
};

// =============================================================
//  AppSecWidgets.PatternLibrary
//  A reusable pattern library viewer
// =============================================================
AppSecWidgets.PatternLibrary = {
  create(containerId, config) {
    const container = document.getElementById(containerId);
    if (!container) return console.error("PatternLibrary: container not found:", containerId);

    const title = config?.title || "📚 Security Pattern Library";
    const patterns = config?.patterns || [];

    container.classList.add("widget");

    // ------------------------------------------
    // Header
    // ------------------------------------------
    const header = document.createElement("div");
    header.className = "widget-header";
    header.textContent = title;
    container.appendChild(header);

    // ------------------------------------------
    // Body
    // ------------------------------------------
    const body = document.createElement("div");
    body.className = "widget-body";
    container.appendChild(body);

    if (!patterns.length) {
      body.innerHTML = `<p>No patterns defined.</p>`;
      return;
    }

    // ------------------------------------------
    // Render each pattern as a collapsible card
    // ------------------------------------------
    patterns.forEach((p) => {
      const card = document.createElement("div");
      card.className = "card mb-2";

      const cardHeader = document.createElement("div");
      cardHeader.className = "card-header pattern-header";
      cardHeader.textContent = `${p.title}`;
      cardHeader.style.cursor = "pointer";

      const cardBody = document.createElement("div");
      cardBody.className = "card-body";
      cardBody.style.display = "none";

      // Content
      const contextEl = document.createElement("p");
      contextEl.innerHTML = `<strong>Context:</strong> ${p.context}`;
      cardBody.appendChild(contextEl);

      if (Array.isArray(p.rules)) {
        const ul = document.createElement("ul");
        p.rules.forEach((r) => {
          const li = document.createElement("li");
          li.textContent = r;
          ul.appendChild(li);
        });
        cardBody.appendChild(ul);
      }

      // Toggle behavior
      cardHeader.addEventListener("click", () => {
        const visible = cardBody.style.display === "block";
        cardBody.style.display = visible ? "none" : "block";
      });

      card.appendChild(cardHeader);
      card.appendChild(cardBody);
      body.appendChild(card);
    });
  }
};

// Make available globally
window.AppSecWidgets = AppSecWidgets;

// Add line numbers to code blocks if available
document.querySelectorAll('pre').forEach(pre => {
  window.AppSec.CodeDisplay.addLineNumbers(pre);
});