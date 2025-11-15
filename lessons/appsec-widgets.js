/**
 * ============================================
 * AppSec Learning Widgets Library v2.0
 * Fixed issues + New powerful widgets
 * ============================================
 */

const AppSecWidgets = {
  _state: {} // Global state for widgets
};

/**
 * ============================================
 * 1. HTTP Request/Response Simulator (FIXED)
 * ============================================
 */
AppSecWidgets.HTTPSimulator = {
  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🌐 HTTP Request/Response Simulator</h3>
        </div>
        <div class="widget-body">
          <div class="grid grid-2">
            <div>
              <label><strong>Request Builder</strong></label>
              <textarea id="${containerId}-request" rows="12" placeholder="GET /api/users?id=1 HTTP/1.1
Host: example.com
Authorization: Bearer token123
User-Agent: AppSec-Student

"></textarea>
              <button class="btn btn-primary mt-1" onclick="AppSecWidgets.HTTPSimulator.sendRequest('${containerId}')">Send Request</button>
            </div>
            <div>
              <label><strong>Server Response</strong></label>
              <textarea id="${containerId}-response" rows="12" readonly placeholder="Response will appear here..."></textarea>
            </div>
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
      responseText += 'SQL Error: You have an error in your SQL syntax near \'"\'';
      window.AppSec.Notify.show('⚠️ SQLi detected!', 'warning');
    } else if (path && path.includes('../')) {
      responseText = 'HTTP/1.1 403 Forbidden\nContent-Type: text/html\n\n';
      responseText += 'Path traversal attempt detected and blocked';
      window.AppSec.Notify.show('🛡️ Path traversal blocked', 'danger');
    } else if (request.includes('X-Forwarded-For:')) {
      responseText += '{"message": "User IP logged from X-Forwarded-For header", "warning": "Trusting client headers can be dangerous!"}';
      window.AppSec.Notify.show('💡 X-Forwarded-For spoofing', 'info');
    } else {
      responseText += '{"users": [{"id": 1, "name": "Alice", "role": "admin"}]}';
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
  create(containerId, insecureCode, secureCode) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🔒 Secure vs Insecure Config</h3>
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
      </div>
    `;

    document.getElementById(`${containerId}-insecure-btn`).onclick = () => this.showMode(containerId, 'insecure');
    document.getElementById(`${containerId}-secure-btn`).onclick = () => this.showMode(containerId, 'secure');
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
  create(containerId, steps) {
    AppSecWidgets._state[containerId] = { steps, currentStep: 0 };
    this.render(containerId);
    this.addStyles();
  },

  render(containerId) {
    const state = AppSecWidgets._state[containerId];
    const { steps, currentStep } = state;
    const container = document.getElementById(containerId);

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
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🔄 Flow Visualizer</h3>
        </div>
        <div class="widget-body">
          <div class="flow-container">${stepsHtml}</div>
          <div class="flow-controls mt-1">
            <button class="btn btn-secondary" id="${containerId}-prev" ${currentStep === 0 ? 'disabled' : ''}>← Previous</button>
            <span>Step ${currentStep + 1} / ${steps.length}</span>
            <button class="btn btn-primary" id="${containerId}-next" ${currentStep === steps.length - 1 ? 'disabled' : ''}>Next →</button>
          </div>
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
        .flow-content { flex: 1; padding: 0.5rem; }
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
 * 4. Attack/Defense Toggle
 * ============================================
 */
AppSecWidgets.AttackDefense = {
  create(containerId, vulnerability, attackContent, defenseContent) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">⚔️ ${vulnerability}: Attack vs Defense</h3>
          <div>
            <button class="btn btn-danger" id="${containerId}-attack-btn">🔴 Attack Mode</button>
            <button class="btn btn-success" id="${containerId}-defense-btn">🛡️ Defense Mode</button>
          </div>
        </div>
        <div class="widget-body">
          <div id="${containerId}-attack" style="display: block;">
            <div class="callout callout-danger"><strong>⚠️ Red Team Perspective</strong></div>
            ${attackContent}
          </div>
          <div id="${containerId}-defense" style="display: none;">
            <div class="callout callout-success"><strong>✅ Blue Team Perspective</strong></div>
            ${defenseContent}
          </div>
        </div>
      </div>
    `;

    document.getElementById(`${containerId}-attack-btn`).onclick = () => this.showMode(containerId, 'attack');
    document.getElementById(`${containerId}-defense-btn`).onclick = () => this.showMode(containerId, 'defense');
  },

  showMode(containerId, mode) {
    document.getElementById(`${containerId}-attack`).style.display = mode === 'attack' ? 'block' : 'none';
    document.getElementById(`${containerId}-defense`).style.display = mode === 'defense' ? 'block' : 'none';
  }
};

/**
 * ============================================
 * 5. Vulnerable App Simulator
 * ============================================
 */
AppSecWidgets.VulnApp = {
  users: [
    { id: 1, username: 'alice', password: 'pass123', role: 'admin', secret: 'FLAG{admin_secret_key}' },
    { id: 2, username: 'bob', password: 'pass456', role: 'user', secret: 'Just a regular user' }
  ],

  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🎯 Vulnerable App Simulator</h3>
        </div>
        <div class="widget-body">
          <div class="grid grid-2">
            <div>
              <label>SQL Query (try SQLi!)</label>
              <input type="text" id="${containerId}-sql" placeholder="Enter user ID (try: 1' OR '1'='1)">
              <button class="btn btn-primary mt-1" onclick="AppSecWidgets.VulnApp.executeQuery('${containerId}')">Execute Query</button>
            </div>
            <div>
              <label>IDOR Test (access control)</label>
              <input type="number" id="${containerId}-idor" placeholder="Enter user ID (try 1 or 2)">
              <button class="btn btn-primary mt-1" onclick="AppSecWidgets.VulnApp.testIDOR('${containerId}')">Get User Data</button>
            </div>
          </div>
          <div class="mt-1">
            <label><strong>Output:</strong></label>
            <pre id="${containerId}-output" style="min-height: 150px; background: var(--code-bg); padding: 1rem; border-radius: 0.5rem;">Results will appear here...</pre>
          </div>
        </div>
      </div>
    `;
  },

  executeQuery(containerId) {
    const input = document.getElementById(`${containerId}-sql`).value;
    const output = document.getElementById(`${containerId}-output`);

    if (input.includes("'") && (input.toLowerCase().includes('or') || input.includes('--'))) {
      output.textContent = 'SQL Injection Successful! 🎉\n\n' +
        'All users returned:\n' +
        JSON.stringify(this.users, null, 2) +
        '\n\n⚠️ Vulnerability: SQL injection due to unsanitized input';
      window.AppSec.Notify.show('🚨 SQLi exploit successful!', 'danger');
    } else if (/^\d+$/.test(input)) {
      const user = this.users.find(u => u.id === parseInt(input));
      output.textContent = user ? `User found:\n${JSON.stringify(user, null, 2)}` : 'No user found';
    } else {
      output.textContent = 'Invalid input';
    }
  },

  testIDOR(containerId) {
    const input = document.getElementById(`${containerId}-idor`).value;
    const output = document.getElementById(`${containerId}-output`);
    const userId = parseInt(input);
    const user = this.users.find(u => u.id === userId);

    if (user) {
      output.textContent = `IDOR Exploit! Accessing user ${userId}'s data:\n\n` +
        JSON.stringify(user, null, 2) +
        '\n\n⚠️ Vulnerability: No authorization check';

      if (user.role === 'admin') {
        window.AppSec.Notify.show('🎯 Admin account compromised!', 'danger');
      }
    } else {
      output.textContent = 'User not found';
    }
  }
};

/**
 * ============================================
 * 6. Crypto Playground
 * ============================================
 */
AppSecWidgets.CryptoPlayground = {
  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🔐 Crypto Playground</h3>
        </div>
        <div class="widget-body">
          <div class="grid grid-2">
            <div>
              <label>Input Text</label>
              <textarea id="${containerId}-input" rows="4" placeholder="Enter text to hash..."></textarea>
              
              <label class="mt-1">Algorithm</label>
              <select id="${containerId}-algo">
                <option value="SHA-256">SHA-256</option>
                <option value="SHA-384">SHA-384</option>
                <option value="SHA-512">SHA-512</option>
              </select>
              
              <button class="btn btn-primary mt-1" onclick="AppSecWidgets.CryptoPlayground.hash('${containerId}')">Generate Hash</button>
              <button class="btn btn-secondary mt-1" onclick="AppSecWidgets.CryptoPlayground.generatePKCE('${containerId}')">Generate PKCE Pair</button>
            </div>
            <div>
              <label>Output</label>
              <textarea id="${containerId}-output" rows="10" readonly placeholder="Hash output..."></textarea>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  async hash(containerId) {
    const input = document.getElementById(`${containerId}-input`).value;
    const algo = document.getElementById(`${containerId}-algo`).value;
    const output = document.getElementById(`${containerId}-output`);

    if (!input) {
      window.AppSec.Notify.show('Please enter text to hash', 'warning');
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest(algo, data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    output.value = `Algorithm: ${algo}\nHash: ${hashHex}\nLength: ${hashHex.length * 4} bits`;
    window.AppSec.Notify.show('Hash generated successfully', 'success');
  },

  async generatePKCE(containerId) {
    const output = document.getElementById(`${containerId}-output`);

    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const codeVerifier = btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const codeChallenge = btoa(String.fromCharCode(...hashArray))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');

    output.value = `PKCE Pair Generated:\n\n` +
      `code_verifier:\n${codeVerifier}\n\n` +
      `code_challenge (SHA-256):\n${codeChallenge}\n\n` +
      `code_challenge_method: S256`;

    window.AppSec.Notify.show('PKCE pair generated', 'success');
  }
};

/**
 * ============================================
 * 7. Log Analyzer (FIXED - Modal popup)
 * ============================================
 */
AppSecWidgets.LogAnalyzer = {
  create(containerId) {
    const logs = [
      { id: 1, time: '10:23:41', ip: '192.168.1.100', endpoint: '/api/users', status: 200, flag: false, details: 'Normal request - No issues detected' },
      { id: 2, time: '10:23:42', ip: '192.168.1.100', endpoint: '/api/admin', status: 403, flag: true, details: 'Unauthorized access attempt to admin endpoint without proper credentials' },
      { id: 3, time: '10:23:45', ip: '192.168.1.100', endpoint: '/api/fetch?url=http://169.254.169.254', status: 200, flag: true, details: 'SSRF attempt detected! Trying to access AWS metadata service at 169.254.169.254' },
      { id: 4, time: '10:24:01', ip: '10.0.0.50', endpoint: '/login', status: 401, flag: false, details: 'Failed login attempt' },
      { id: 5, time: '10:24:02', ip: '10.0.0.50', endpoint: '/login', status: 401, flag: false, details: 'Failed login attempt' },
      { id: 6, time: '10:24:03', ip: '10.0.0.50', endpoint: '/login', status: 401, flag: true, details: 'Brute force attack detected! Multiple failed login attempts from same IP within 3 seconds' },
      { id: 7, time: '10:24:10', ip: '172.16.0.1', endpoint: '/api/users', status: 200, flag: false, details: 'Normal request - No issues detected' }
    ];

    const container = document.getElementById(containerId);
    const logsHtml = logs.map(log => `
      <tr style="cursor: pointer; ${log.flag ? 'background: rgba(220, 53, 69, 0.1);' : ''}" 
          onclick="AppSecWidgets.LogAnalyzer.showModal(${log.id}, '${containerId}')">
        <td>${log.time}</td>
        <td>${log.ip}</td>
        <td><code>${log.endpoint}</code></td>
        <td><span style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: ${log.status < 300 ? 'var(--color-success)' : log.status < 400 ? 'var(--color-warning)' : 'var(--color-danger)'}; color: white;">${log.status}</span></td>
        <td>${log.flag ? '🚩' : '✅'}</td>
      </tr>
    `).join('');

    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">📋 Security Log Analyzer</h3>
        </div>
        <div class="widget-body">
          <p>Click on any log entry to see detailed analysis.</p>
          <div style="overflow-x: auto;">
            <table style="min-width: 700px;">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>IP Address</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Flag</th>
                </tr>
              </thead>
              <tbody>${logsHtml}</tbody>
            </table>
          </div>
        </div>
      </div>

      <div id="${containerId}-modal" class="modal" style="display: none;">
        <div class="modal-content">
          <span class="modal-close" onclick="AppSecWidgets.LogAnalyzer.closeModal('${containerId}')">&times;</span>
          <h3>🔍 Log Analysis</h3>
          <div id="${containerId}-modal-body"></div>
        </div>
      </div>
    `;

    AppSecWidgets._state[containerId] = { logs };
    this.addModalStyles();
  },

  showModal(logId, containerId) {
    const state = AppSecWidgets._state[containerId];
    const log = state.logs.find(l => l.id === logId);

    const modal = document.getElementById(`${containerId}-modal`);
    const modalBody = document.getElementById(`${containerId}-modal-body`);

    modalBody.innerHTML = `
      <div class="alert ${log.flag ? 'alert-danger' : 'alert-success'}">
        <p><strong>Time:</strong> ${log.time}</p>
        <p><strong>IP Address:</strong> ${log.ip}</p>
        <p><strong>Endpoint:</strong> <code>${log.endpoint}</code></p>
        <p><strong>Status Code:</strong> ${log.status}</p>
        <p><strong>Security Flag:</strong> ${log.flag ? '🚩 Suspicious' : '✅ Clean'}</p>
        <hr style="margin: 1rem 0; border: none; border-top: 1px solid var(--border-color);">
        <p><strong>Analysis:</strong></p>
        <p>${log.details}</p>
      </div>
    `;

    modal.style.display = 'flex';
  },

  closeModal(containerId) {
    document.getElementById(`${containerId}-modal`).style.display = 'none';
  },

  addModalStyles() {
    if (!document.getElementById('modal-styles')) {
      const style = document.createElement('style');
      style.id = 'modal-styles';
      style.textContent = `
        .modal {
          display: none; position: fixed; z-index: 1000; left: 0; top: 0;
          width: 100%; height: 100%; background-color: rgba(0,0,0,0.5);
          align-items: center; justify-content: center;
        }
        .modal-content {
          background-color: var(--bg-primary); padding: 2rem; border-radius: 0.75rem;
          max-width: 600px; width: 90%; box-shadow: var(--shadow-lg); position: relative;
          max-height: 80vh; overflow-y: auto;
        }
        .modal-close {
          position: absolute; top: 1rem; right: 1.5rem; font-size: 2rem;
          font-weight: bold; cursor: pointer; color: var(--text-secondary);
        }
        .modal-close:hover { color: var(--color-danger); }
      `;
      document.head.appendChild(style);
    }
  }
};

/**
 * ============================================
 * 8. JWT Decoder & Analyzer
 * ============================================
 */
AppSecWidgets.JWTAnalyzer = {
  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🎫 JWT Decoder & Security Analyzer</h3>
        </div>
        <div class="widget-body">
          <label>Paste JWT Token</label>
          <textarea id="${containerId}-input" rows="3" placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."></textarea>
          <button class="btn btn-primary mt-1" onclick="AppSecWidgets.JWTAnalyzer.decode('${containerId}')">Decode & Analyze</button>
          
          <div id="${containerId}-output" class="mt-1" style="display: none;">
            <h4>📄 Header</h4>
            <pre id="${containerId}-header"></pre>
            
            <h4>📦 Payload</h4>
            <pre id="${containerId}-payload"></pre>
            
            <h4>🔍 Security Analysis</h4>
            <div id="${containerId}-analysis"></div>
          </div>
        </div>
      </div>
    `;
  },

  decode(containerId) {
    const input = document.getElementById(`${containerId}-input`).value.trim();
    const output = document.getElementById(`${containerId}-output`);

    if (!input) {
      window.AppSec.Notify.show('Please enter a JWT token', 'warning');
      return;
    }

    try {
      const parts = input.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT format');

      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));

      document.getElementById(`${containerId}-header`).textContent = JSON.stringify(header, null, 2);
      document.getElementById(`${containerId}-payload`).textContent = JSON.stringify(payload, null, 2);

      const issues = [];
      if (header.alg === 'none') {
        issues.push('<div class="alert alert-danger">🚨 Critical: Algorithm set to "none" - signature bypassed!</div>');
      }
      if (header.alg === 'HS256' && !payload.exp) {
        issues.push('<div class="alert alert-warning">⚠️ Warning: No expiration time set</div>');
      }
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        issues.push('<div class="alert alert-danger">🚨 Token expired</div>');
      }
      if (!payload.iss) {
        issues.push('<div class="alert alert-warning">⚠️ No issuer claim</div>');
      }
      if (issues.length === 0) {
        issues.push('<div class="alert alert-success">✅ No major security issues detected</div>');
      }

      document.getElementById(`${containerId}-analysis`).innerHTML = issues.join('');
      output.style.display = 'block';
      window.AppSec.Notify.show('JWT decoded successfully', 'success');
    } catch (error) {
      window.AppSec.Notify.show('Invalid JWT format', 'danger');
    }
  }
};

/**
 * ============================================
 * 9. Password Strength Meter
 * ============================================
 */
AppSecWidgets.PasswordMeter = {
  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🔑 Password Strength Analyzer</h3>
        </div>
        <div class="widget-body">
          <label>Enter Password</label>
          <input type="text" id="${containerId}-input" placeholder="Type password..." oninput="AppSecWidgets.PasswordMeter.analyze('${containerId}')">
          
          <div class="mt-1">
            <div style="display: flex; align-items: center; gap: 1rem;">
              <div style="flex: 1; height: 20px; background: var(--bg-tertiary); border-radius: 10px; overflow: hidden;">
                <div id="${containerId}-bar" style="height: 100%; width: 0%; transition: all 0.3s ease;"></div>
              </div>
              <span id="${containerId}-label" style="font-weight: bold; min-width: 100px;">-</span>
            </div>
          </div>
          
          <div id="${containerId}-details" class="mt-1"></div>
        </div>
      </div>
    `;
  },

  analyze(containerId) {
    const password = document.getElementById(`${containerId}-input`).value;
    const bar = document.getElementById(`${containerId}-bar`);
    const label = document.getElementById(`${containerId}-label`);
    const details = document.getElementById(`${containerId}-details`);

    if (!password) {
      bar.style.width = '0%';
      label.textContent = '-';
      details.innerHTML = '';
      return;
    }

    let score = 0;
    const checks = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    score += Math.min(password.length * 4, 40);
    if (checks.uppercase) score += 10;
    if (checks.lowercase) score += 10;
    if (checks.numbers) score += 10;
    if (checks.special) score += 15;
    if (password.length >= 16) score += 15;

    let charset = 0;
    if (checks.lowercase) charset += 26;
    if (checks.uppercase) charset += 26;
    if (checks.numbers) charset += 10;
    if (checks.special) charset += 32;
    const entropy = password.length * Math.log2(charset);

    let strength, color;
    if (score < 30) {
      strength = 'Very Weak';
      color = '#dc3545';
    } else if (score < 50) {
      strength = 'Weak';
      color = '#fd7e14';
    } else if (score < 70) {
      strength = 'Fair';
      color = '#ffc107';
    } else if (score < 85) {
      strength = 'Strong';
      color = '#28a745';
    } else {
      strength = 'Very Strong';
      color = '#20c997';
    }

    bar.style.width = Math.min(score, 100) + '%';
    bar.style.background = color;
    label.textContent = strength;
    label.style.color = color;

    details.innerHTML = `
      <p><strong>Entropy:</strong> ${entropy.toFixed(1)} bits</p>
      <p><strong>Criteria:</strong></p>
      <ul style="margin-left: 1.5rem;">
        <li style="color: ${checks.length ? 'var(--color-success)' : 'var(--color-danger)'}">${checks.length ? '✅' : '❌'} At least 12 characters</li>
        <li style="color: ${checks.uppercase ? 'var(--color-success)' : 'var(--color-danger)'}">${checks.uppercase ? '✅' : '❌'} Uppercase letters</li>
        <li style="color: ${checks.lowercase ? 'var(--color-success)' : 'var(--color-danger)'}">${checks.lowercase ? '✅' : '❌'} Lowercase letters</li>
        <li style="color: ${checks.numbers ? 'var(--color-success)' : 'var(--color-danger)'}">${checks.numbers ? '✅' : '❌'} Numbers</li>
        <li style="color: ${checks.special ? 'var(--color-success)' : 'var(--color-danger)'}">${checks.special ? '✅' : '❌'} Special characters</li>
      </ul>
    `;
  }
};

/**
 * ============================================
 * 10. Threat Modeling Canvas (Guided + Context)
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

  create(containerId, prefill = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const categories = [
      { id: 'spoofing', label: 'Spoofing', emoji: '🎭', color: 'var(--color-danger)' },
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
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🎯 Threat Modeling Canvas (STRIDE)</h3>
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
              📥 Export JSON
            </button>
            <button class="btn btn-secondary" onclick="AppSecWidgets.ThreatModel.exportMarkdown('${containerId}')">
              📄 Export Markdown Summary
            </button>
          </div>
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
 * 11. Interactive Flowchart Builder (NEW!)
 * ============================================
 * Purpose: Create security flowcharts and diagrams
 * Use for: Attack trees, decision flows, architecture diagrams
 */
AppSecWidgets.FlowchartBuilder = {
  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🗺️ Security Flowchart Builder</h3>
          <div>
            <button class="btn btn-primary" onclick="AppSecWidgets.FlowchartBuilder.addNode('${containerId}', 'box')">+ Box</button>
            <button class="btn btn-success" onclick="AppSecWidgets.FlowchartBuilder.addNode('${containerId}', 'diamond')">+ Decision</button>
            <button class="btn btn-secondary" onclick="AppSecWidgets.FlowchartBuilder.clear('${containerId}')">Clear</button>
          </div>
        </div>
        <div class="widget-body">
          <div id="${containerId}-canvas" style="min-height: 400px; background: var(--bg-tertiary); border-radius: 0.5rem; padding: 1rem; position: relative;">
            <p style="text-align: center; color: var(--text-muted); padding-top: 10rem;">Click buttons above to add shapes</p>
          </div>
        </div>
      </div>
    `;

    AppSecWidgets._state[containerId] = { nodes: [], nextId: 1 };
    this.addFlowchartStyles();
  },

  addNode(containerId, type) {
    const state = AppSecWidgets._state[containerId];
    const canvas = document.getElementById(`${containerId}-canvas`);

    if (state.nodes.length === 0) {
      canvas.innerHTML = '';
    }

    const nodeId = `${containerId}-node-${state.nextId++}`;
    const node = {
      id: nodeId,
      type: type,
      text: type === 'diamond' ? 'Decision?' : 'Process',
      x: Math.random() * 200 + 50,
      y: Math.random() * 200 + 50
    };

    state.nodes.push(node);

    const nodeDiv = document.createElement('div');
    nodeDiv.id = nodeId;
    nodeDiv.className = `flowchart-node flowchart-${type}`;
    nodeDiv.style.left = node.x + 'px';
    nodeDiv.style.top = node.y + 'px';
    nodeDiv.innerHTML = `
      <div class="flowchart-node-content" contenteditable="true">${node.text}</div>
      <button class="flowchart-node-delete" onclick="AppSecWidgets.FlowchartBuilder.deleteNode('${containerId}', '${nodeId}')">&times;</button>
    `;

    this.makeDraggable(nodeDiv);
    canvas.appendChild(nodeDiv);
  },

  deleteNode(containerId, nodeId) {
    const state = AppSecWidgets._state[containerId];
    state.nodes = state.nodes.filter(n => n.id !== nodeId);
    document.getElementById(nodeId).remove();

    if (state.nodes.length === 0) {
      const canvas = document.getElementById(`${containerId}-canvas`);
      canvas.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding-top: 10rem;">Click buttons above to add shapes</p>';
    }
  },

  clear(containerId) {
    AppSecWidgets._state[containerId] = { nodes: [], nextId: 1 };
    const canvas = document.getElementById(`${containerId}-canvas`);
    canvas.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding-top: 10rem;">Click buttons above to add shapes</p>';
  },

  makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      if (e.target.contentEditable === 'true') return;
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + "px";
      element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  },

  addFlowchartStyles() {
    if (!document.getElementById('flowchart-styles')) {
      const style = document.createElement('style');
      style.id = 'flowchart-styles';
      style.textContent = `
        .flowchart-node {
          position: absolute; cursor: move; user-select: none;
          background: var(--bg-primary); border: 2px solid var(--color-primary);
          padding: 1rem; border-radius: 0.5rem; min-width: 120px;
          box-shadow: var(--shadow-md); transition: all 0.2s ease;
        }
        .flowchart-node:hover { box-shadow: var(--shadow-lg); z-index: 10; }
        .flowchart-box { border-radius: 0.5rem; }
        .flowchart-diamond {
          border-radius: 0; transform: rotate(45deg);
          min-width: 100px; min-height: 100px; display: flex;
          align-items: center; justify-content: center;
        }
        .flowchart-diamond .flowchart-node-content {
          transform: rotate(-45deg); text-align: center;
        }
        .flowchart-node-content {
          outline: none; min-height: 20px; word-break: break-word;
        }
        .flowchart-node-delete {
          position: absolute; top: -10px; right: -10px; width: 24px; height: 24px;
          border-radius: 50%; background: var(--color-danger); color: white;
          border: none; cursor: pointer; font-size: 16px; line-height: 20px;
        }
        .flowchart-node-delete:hover { background: #c82333; }
      `;
      document.head.appendChild(style);
    }
  }
};

/**
 * ============================================
 * 12. Interactive XSS Playground (NEW!)
 * ============================================
 * Purpose: Safe XSS testing environment
 * Use for: Understanding XSS contexts and bypasses
 */
AppSecWidgets.XSSPlayground = {
  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">⚠️ XSS Testing Playground</h3>
        </div>
        <div class="widget-body">
          <div class="callout callout-warning">
            <strong>⚠️ Safe Learning Environment:</strong> This widget demonstrates XSS without actually executing malicious code.
          </div>
          
          <div class="grid grid-2">
            <div>
              <label><strong>Injection Context</strong></label>
              <select id="${containerId}-context">
                <option value="html">HTML Context</option>
                <option value="attribute">HTML Attribute</option>
                <option value="javascript">JavaScript Context</option>
                <option value="url">URL Parameter</option>
              </select>
              
              <label class="mt-1"><strong>Your Payload</strong></label>
              <textarea id="${containerId}-input" rows="4" placeholder="Try: <script>alert('XSS')</script>"></textarea>
              
              <button class="btn btn-primary mt-1" onclick="AppSecWidgets.XSSPlayground.test('${containerId}')">Test Payload</button>
            </div>
            
            <div>
              <label><strong>Sanitized Output</strong></label>
              <pre id="${containerId}-output" style="background: var(--code-bg); padding: 1rem; border-radius: 0.5rem; min-height: 100px;"></pre>
              
              <label class="mt-1"><strong>Security Analysis</strong></label>
              <div id="${containerId}-analysis"></div>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  test(containerId) {
    const context = document.getElementById(`${containerId}-context`).value;
    const input = document.getElementById(`${containerId}-input`).value;
    const output = document.getElementById(`${containerId}-output`);
    const analysis = document.getElementById(`${containerId}-analysis`);

    let sanitized = '';
    let issues = [];

    switch (context) {
      case 'html':
        sanitized = input.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        if (input.includes('<script>')) {
          issues.push('<div class="alert alert-danger">🚨 <script> tag detected and neutralized</div>');
        }
        if (input.includes('onerror=') || input.includes('onload=')) {
          issues.push('<div class="alert alert-danger">🚨 Event handler detected</div>');
        }
        break;

      case 'attribute':
        sanitized = input.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        if (input.includes('"') || input.includes("'")) {
          issues.push('<div class="alert alert-danger">🚨 Quote escape attempt detected</div>');
        }
        break;

      case 'javascript':
        sanitized = JSON.stringify(input);
        if (input.includes('\\') || input.includes('"')) {
          issues.push('<div class="alert alert-warning">⚠️ Escape characters detected</div>');
        }
        break;

      case 'url':
        sanitized = encodeURIComponent(input);
        if (input.includes('javascript:') || input.includes('data:')) {
          issues.push('<div class="alert alert-danger">🚨 Dangerous URL scheme detected</div>');
        }
        break;
    }

    if (issues.length === 0) {
      issues.push('<div class="alert alert-success">✅ No obvious XSS patterns detected</div>');
    }

    output.textContent = sanitized;
    analysis.innerHTML = issues.join('');
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
  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">🔌 API Security Tester</h3>
        </div>
        <div class="widget-body">
          <div class="grid grid-2">
            <div>
              <label><strong>API Endpoint</strong></label>
              <select id="${containerId}-endpoint">
                <option value="public">/api/public</option>
                <option value="protected">/api/protected</option>
                <option value="admin">/api/admin</option>
              </select>
              
              <label class="mt-1"><strong>Authentication</strong></label>
              <input type="text" id="${containerId}-token" placeholder="Bearer token or API key">
              
              <label class="mt-1"><strong>Rate Limit Test</strong></label>
              <input type="number" id="${containerId}-requests" value="5" min="1" max="20">
              
              <button class="btn btn-primary mt-1" onclick="AppSecWidgets.APITester.testAuth('${containerId}')">Test Auth</button>
              <button class="btn btn-secondary mt-1" onclick="AppSecWidgets.APITester.testRateLimit('${containerId}')">Test Rate Limit</button>
            </div>
            
            <div>
              <label><strong>Response Log</strong></label>
              <pre id="${containerId}-log" style="background: var(--code-bg); padding: 1rem; border-radius: 0.5rem; min-height: 300px; overflow-y: auto;"></pre>
            </div>
          </div>
        </div>
      </div>
    `;

    AppSecWidgets._state[containerId] = { requestCount: 0, lastRequest: 0 };
  },

  testAuth(containerId) {
    const endpoint = document.getElementById(`${containerId}-endpoint`).value;
    const token = document.getElementById(`${containerId}-token`).value;
    const log = document.getElementById(`${containerId}-log`);

    let response = '';
    const timestamp = new Date().toLocaleTimeString();

    if (endpoint === 'public') {
      response = `[${timestamp}] ✅ 200 OK\n{"message": "Public data accessible"}\n\n`;
    } else if (endpoint === 'protected') {
      if (!token) {
        response = `[${timestamp}] ❌ 401 Unauthorized\n{"error": "Missing authentication token"}\n\n`;
      } else if (token.includes('invalid')) {
        response = `[${timestamp}] ❌ 401 Unauthorized\n{"error": "Invalid token"}\n\n`;
      } else {
        response = `[${timestamp}] ✅ 200 OK\n{"message": "Protected data", "user": "john@example.com"}\n\n`;
      }
    } else if (endpoint === 'admin') {
      if (!token) {
        response = `[${timestamp}] ❌ 401 Unauthorized\n{"error": "Missing authentication"}\n\n`;
      } else if (!token.includes('admin')) {
        response = `[${timestamp}] ❌ 403 Forbidden\n{"error": "Insufficient permissions"}\n\n`;
      } else {
        response = `[${timestamp}] ✅ 200 OK\n{"message": "Admin data", "users": 150}\n\n`;
      }
    }

    log.textContent = response + log.textContent;
  },

  testRateLimit(containerId) {
    const requests = parseInt(document.getElementById(`${containerId}-requests`).value);
    const log = document.getElementById(`${containerId}-log`);
    const state = AppSecWidgets._state[containerId];

    const rateLimit = 3; // Max 3 requests
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
      window.AppSec.Notify.show('Rate limit exceeded!', 'warning');
    }

    // Reset counter after 5 seconds
    setTimeout(() => { state.requestCount = 0; }, 5000);
  }
};

/**
 * ============================================
 * 14. Input Validation Trainer (NEW!)
 * ============================================
 * Purpose: Practice input validation patterns
 * Use for: Regex, sanitization, validation
 */
AppSecWidgets.ValidationTrainer = {
  create(containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
      <div class="widget">
        <div class="widget-header">
          <h3 class="widget-title">✅ Input Validation Trainer</h3>
        </div>
        <div class="widget-body">
          <div class="grid grid-2">
            <div>
              <label><strong>Validation Rule</strong></label>
              <select id="${containerId}-rule" onchange="AppSecWidgets.ValidationTrainer.updateExample('${containerId}')">
                <option value="email">Email Address</option>
                <option value="url">URL</option>
                <option value="phone">Phone Number</option>
                <option value="ssn">SSN (redacted)</option>
                <option value="creditcard">Credit Card</option>
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
      </div>
    `;

    this.updateExample(containerId);
  },

  patterns: {
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
  },

  updateExample(containerId) {
    const rule = document.getElementById(`${containerId}-rule`).value;
    const pattern = this.patterns[rule];

    document.getElementById(`${containerId}-pattern`).value = pattern.regex.toString();
    document.getElementById(`${containerId}-examples`).innerHTML =
      `<p><strong>${pattern.description}</strong></p>` +
      pattern.examples.map(ex => `<code>${ex}</code>`).join('<br>');
  },

  validate(containerId) {
    const rule = document.getElementById(`${containerId}-rule`).value;
    const input = document.getElementById(`${containerId}-input`).value;
    const result = document.getElementById(`${containerId}-result`);
    const pattern = this.patterns[rule];

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

/* ============================================================
 * JSON-Driven Quiz Widget (improved, step-by-step by default)
 * ============================================================ */
AppSecWidgets.Quiz = {
  create(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !data || !Array.isArray(data.questions)) return;

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

      // Add widget classes to container itself
      container.classList.add("widget", "widget-quiz");

      // Inject only inner widget structure
      container.innerHTML = `
        <div class="widget-header">
          <h3 class="widget-title">${data.title || "📝 Knowledge Check"}</h3>
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
        <h3 class="widget-title">${data.title || "📝 Knowledge Check"}</h3>
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

// Make available globally
window.AppSecWidgets = AppSecWidgets;
