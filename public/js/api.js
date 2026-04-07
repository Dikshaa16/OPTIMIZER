/* ═════════════════════════════════════════════════════════════
   API Client
   ═════════════════════════════════════════════════════════════ */

const API = {
    BASE: '',

    async _post(url, data) {
        const res = await fetch(this.BASE + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!res.ok) {
            const body = await res.json().catch(() => ({}));
            throw new Error(body.error || `API error: ${res.status}`);
        }
        return res.json();
    },

    async _get(url) {
        const res = await fetch(this.BASE + url);
        if (!res.ok) throw new Error(`API error: ${res.status}`);
        return res.json();
    },

    // Helper: build body with either function key or custom_expr
    _funcBody(funcOrExpr, extra = {}) {
        if (funcOrExpr && funcOrExpr.startsWith && funcOrExpr.startsWith('__custom__:')) {
            return { custom_expr: funcOrExpr.slice(11), ...extra };
        }
        return { function: funcOrExpr, ...extra };
    },

    /* Catalog */
    getFunctions() { return this._get('/api/functions'); },

    /* Surface data */
    getSurface(func, resolution = 60) {
        return this._post('/api/surface', this._funcBody(func, { resolution }));
    },

    /* 1D evaluation */
    eval1D(func, points = 200) {
        return this._post('/api/eval1d', this._funcBody(func, { points }));
    },

    /* Gradients & Hessian */
    getGradient(func, x, y) {
        return this._post('/api/gradient', this._funcBody(func, { x, y }));
    },
    getHessian(func, x, y) {
        return this._post('/api/hessian', this._funcBody(func, { x, y }));
    },
    getGradientField(func, resolution = 15) {
        return this._post('/api/gradient-field', this._funcBody(func, { resolution }));
    },
    getConvexity(func) {
        return this._post('/api/convexity', this._funcBody(func));
    },

    /* Single variable optimization */
    bisection(func, a, b, tol, maxIter) {
        return this._post('/api/optimize/bisection', this._funcBody(func, { a, b, tol, max_iter: maxIter }));
    },
    newton(func, x0, tol, maxIter) {
        return this._post('/api/optimize/newton', this._funcBody(func, { x0, tol, max_iter: maxIter }));
    },
    secant(func, x0, x1, tol, maxIter) {
        return this._post('/api/optimize/secant', this._funcBody(func, { x0, x1, tol, max_iter: maxIter }));
    },

    /* Bracketing */
    exhaustive(func, a, b, n) {
        return this._post('/api/optimize/exhaustive', this._funcBody(func, { a, b, n }));
    },
    boundingPhase(func, x0, delta) {
        return this._post('/api/optimize/bounding-phase', this._funcBody(func, { x0, delta }));
    },

    /* Region elimination */
    intervalHalving(func, a, b, tol) {
        return this._post('/api/optimize/interval-halving', this._funcBody(func, { a, b, tol }));
    },
    fibonacci(func, a, b, n) {
        return this._post('/api/optimize/fibonacci', this._funcBody(func, { a, b, n }));
    },
    goldenSection(func, a, b, tol) {
        return this._post('/api/optimize/golden-section', this._funcBody(func, { a, b, tol }));
    },

    /* Gradient descent */
    gradientDescent(func, x0, y0, lr, maxIter, tol) {
        return this._post('/api/optimize/gradient-descent', this._funcBody(func, {
            x0, y0, learning_rate: lr, max_iter: maxIter, tol,
        }));
    },

    /* Health check */
    async ping() {
        try {
            await this._get('/api/functions');
            return true;
        } catch { return false; }
    },
};
