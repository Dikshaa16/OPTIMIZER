/* ═════════════════════════════════════════════════════════════
   Utility Functions
   ═════════════════════════════════════════════════════════════ */

const Utils = {
    /* Dark Plotly layout base */
    plotlyDarkLayout(title = '', extra = {}) {
        const isLight = document.body.classList.contains('light');
        const textColor = isLight ? '#334155' : 'rgba(255,255,255,0.7)';
        const gridColor = isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)';
        const bgColor = 'rgba(0,0,0,0)';
        return {
            title: { text: title, font: { color: textColor, size: 14, family: 'Inter' } },
            paper_bgcolor: bgColor,
            plot_bgcolor: bgColor,
            font: { color: textColor, family: 'Inter', size: 11 },
            margin: { l: 50, r: 30, t: title ? 50 : 20, b: 50 },
            xaxis: { gridcolor: gridColor, zerolinecolor: gridColor, ...(extra.xaxis || {}) },
            yaxis: { gridcolor: gridColor, zerolinecolor: gridColor, ...(extra.yaxis || {}) },
            scene: {
                xaxis: { gridcolor: gridColor, backgroundcolor: bgColor, ...(extra.scene?.xaxis || {}) },
                yaxis: { gridcolor: gridColor, backgroundcolor: bgColor, ...(extra.scene?.yaxis || {}) },
                zaxis: { gridcolor: gridColor, backgroundcolor: bgColor, ...(extra.scene?.zaxis || {}) },
                bgcolor: bgColor,
                ...(extra.scene || {}),
            },
            legend: { font: { color: textColor, size: 11 }, bgcolor: 'rgba(0,0,0,0)' },
            ...extra,
        };
    },

    plotlyConfig() {
        return { responsive: true, displaylogo: false, modeBarButtonsToRemove: ['lasso2d', 'select2d'] };
    },

    /* Toast notification */
    toast(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        const colors = {
            info: 'var(--neon-cyan)',
            success: 'var(--neon-green)',
            error: 'var(--neon-pink)',
            warning: '#fbbf24',
        };
        toast.className = 'toast';
        toast.innerHTML = `
            <div style="width:4px;height:28px;border-radius:2px;background:${colors[type]}"></div>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.classList.add('toast-out');
            setTimeout(() => toast.remove(), 200);
        }, duration);
    },

    /* Debounce */
    debounce(fn, delay = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    },

    /* Number formatting */
    fmt(n, decimals = 6) {
        if (n === null || n === undefined) return '—';
        return Number(n).toFixed(decimals);
    },

    /* Generate nice colorscale */
    neonColorscale() {
        return [
            [0, '#0c0a3e'],
            [0.15, '#1b0a5e'],
            [0.3, '#3a0ca3'],
            [0.45, '#7209b7'],
            [0.6, '#f72585'],
            [0.75, '#ff6b35'],
            [0.9, '#ffd23f'],
            [1, '#ffffff']
        ];
    },

    coolColorscale() {
        return [
            [0, '#0d1b2a'],
            [0.2, '#1b263b'],
            [0.35, '#0ea5e9'],
            [0.5, '#06b6d4'],
            [0.65, '#10b981'],
            [0.8, '#84cc16'],
            [0.9, '#fbbf24'],
            [1, '#f97316']
        ];
    },

    surfaceColorscale() {
        return [
            [0, '#1a1a2e'],
            [0.1, '#16213e'],
            [0.2, '#0f3460'],
            [0.3, '#155e75'],
            [0.4, '#0d9488'],
            [0.5, '#16a34a'],
            [0.6, '#84cc16'],
            [0.7, '#eab308'],
            [0.8, '#f97316'],
            [0.9, '#ef4444'],
            [1, '#ec4899']
        ];
    },

    /* Sleep */
    sleep(ms) { return new Promise(r => setTimeout(r, ms)); },

    /* Element creation helper */
    el(tag, classes = '', html = '') {
        const e = document.createElement(tag);
        if (classes) e.className = classes;
        if (html) e.innerHTML = html;
        return e;
    },

    /* ── Custom Equation Helpers ──────────────────────────────── */

    // Toggle visibility of custom expression input based on select value
    toggleCustomInput(prefix) {
        const sel = document.getElementById(prefix + '-func');
        const wrap = document.getElementById(prefix + '-custom-wrap');
        if (sel && wrap) wrap.classList.toggle('hidden', sel.value !== 'custom');
    },

    // Get function key or custom expression string for API calls
    getFunc(prefix) {
        const sel = document.getElementById(prefix + '-func');
        if (sel.value === 'custom') {
            const expr = document.getElementById(prefix + '-custom-expr').value.trim();
            if (!expr) throw new Error('Please enter a custom equation');
            return '__custom__:' + expr;
        }
        return sel.value;
    },

    // HTML snippet for "Custom" option in a 1D function select
    customOption1D() {
        return '<option value="custom">✏️ Custom f(x)</option>';
    },

    // HTML snippet for "Custom" option in a 2D function select
    customOption2D() {
        return '<option value="custom">✏️ Custom f(x,y)</option>';
    },

    // HTML snippet for the custom expression input (hidden by default)
    customInput1D(prefix, placeholder) {
        return `<div id="${prefix}-custom-wrap" class="hidden">
            <label class="form-label">Custom f(x)</label>
            <input id="${prefix}-custom-expr" type="text" class="form-input" placeholder="${placeholder || 'e.g. x**3 - 2*x + sin(x)'}">
            <p class="text-[10px] text-gray-500 mt-1">Use: x, sin, cos, exp, log, sqrt, pi, abs, **</p>
        </div>`;
    },

    customInput2D(prefix, placeholder) {
        return `<div id="${prefix}-custom-wrap" class="hidden">
            <label class="form-label">Custom f(x,y)</label>
            <input id="${prefix}-custom-expr" type="text" class="form-input" placeholder="${placeholder || 'e.g. x**2 + y**2 - cos(x)*cos(y)'}">
            <p class="text-[10px] text-gray-500 mt-1">Use: x, y, sin, cos, exp, log, sqrt, pi, abs, **</p>
        </div>`;
    },
};
