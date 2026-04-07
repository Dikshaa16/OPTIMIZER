/* ═════════════════════════════════════════════════════════════
   CONCEPT EXPLORER PAGE
   ═════════════════════════════════════════════════════════════ */

const ConceptsPage = {
    currentTab: 'classification',

    render() {
        return `
        <div class="page-enter space-y-6">
            <div class="tab-bar">
                <button class="tab-btn active" onclick="ConceptsPage.switchTab('classification', this)">Classification</button>
                <button class="tab-btn" onclick="ConceptsPage.switchTab('calculus', this)">Vector Calculus</button>
                <button class="tab-btn" onclick="ConceptsPage.switchTab('convexity', this)">Convexity</button>
                <button class="tab-btn" onclick="ConceptsPage.switchTab('functions', this)">Test Functions</button>
            </div>
            <div id="concept-content"></div>
        </div>
        `;
    },

    init() {
        this.switchTab('classification');
    },

    switchTab(tab, btn) {
        this.currentTab = tab;
        document.querySelectorAll('.tab-bar .tab-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        else document.querySelector(`.tab-bar .tab-btn`)?.classList.add('active');

        const el = document.getElementById('concept-content');
        el.innerHTML = '<div class="flex items-center justify-center py-20 text-gray-500">Loading...</div>';
        setTimeout(() => this['render_' + tab](el), 50);
    },

    /* ─── Classification Tab ─────────────────────────────────── */
    render_classification(el) {
        el.innerHTML = `
        <div class="space-y-6 stagger">
            <!-- Linear vs Non-linear -->
            <div class="grid md:grid-cols-2 gap-4">
                <div class="glass-card p-6 glow-border-cyan">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="concept-tag linear">Linear</span>
                        <h4 class="font-semibold text-sm">Linear Optimization</h4>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed mb-4">
                        The objective function and all constraints are linear. The feasible region is a convex polytope.
                        Solutions lie at vertices of the feasible region.
                    </p>
                    <div class="code-block mb-4">minimize  c<sup>T</sup>x<br>subject to  Ax ≤ b, x ≥ 0</div>
                    <div id="plot-linear" class="chart-container" style="height:280px"></div>
                </div>
                <div class="glass-card p-6 glow-border-purple">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="concept-tag nonlinear">Non-linear</span>
                        <h4 class="font-semibold text-sm">Non-linear Optimization</h4>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed mb-4">
                        The objective or constraints involve non-linear terms. May have multiple local optima. Requires iterative methods.
                    </p>
                    <div class="code-block mb-4">minimize  f(x) = x₁² + sin(x₂)<br>subject to  g(x) ≤ 0</div>
                    <div id="plot-nonlinear" class="chart-container" style="height:280px"></div>
                </div>
            </div>

            <!-- Convex vs Non-convex -->
            <div class="grid md:grid-cols-2 gap-4">
                <div class="glass-card p-6 glow-border-green">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="concept-tag convex">Convex</span>
                        <h4 class="font-semibold text-sm">Convex Optimization</h4>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed mb-4">
                        Any local minimum is a global minimum. Gradient-based methods guarantee convergence.
                        The Hessian is positive semi-definite everywhere.
                    </p>
                    <div id="plot-convex" class="chart-container" style="height:280px"></div>
                </div>
                <div class="glass-card p-6 glow-border-pink">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="concept-tag nonconvex">Non-convex</span>
                        <h4 class="font-semibold text-sm">Non-convex Optimization</h4>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed mb-4">
                        Multiple local minima exist. Global optimization is NP-hard in general.
                        Different starting points can lead to different solutions.
                    </p>
                    <div id="plot-nonconvex" class="chart-container" style="height:280px"></div>
                </div>
            </div>

            <!-- Constrained vs Unconstrained -->
            <div class="grid md:grid-cols-2 gap-4">
                <div class="glass-card p-6">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="badge badge-info">Constrained</span>
                        <h4 class="font-semibold text-sm">Constrained Optimization</h4>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed mb-3">
                        Optimizes subject to equality/inequality constraints. Uses Lagrange multipliers or KKT conditions. The optimal solution may lie on the boundary of the feasible region.
                    </p>
                    <div class="code-block">minimize  f(x)<br>subject to  h(x) = 0<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;g(x) ≤ 0</div>
                </div>
                <div class="glass-card p-6">
                    <div class="flex items-center gap-2 mb-3">
                        <span class="badge badge-success">Unconstrained</span>
                        <h4 class="font-semibold text-sm">Unconstrained Optimization</h4>
                    </div>
                    <p class="text-xs text-gray-400 leading-relaxed mb-3">
                        No constraints on the variables. Solution found where gradient = 0. Hessian determines the nature of the critical point.
                    </p>
                    <div class="code-block">minimize  f(x)<br>∇f(x*) = 0  (necessary condition)<br>∇²f(x*) ≻ 0  (sufficient for minimum)</div>
                </div>
            </div>
        </div>
        `;

        this._plotClassificationGraphs();
    },

    async _plotClassificationGraphs() {
        // Linear
        const xLin = Array.from({ length: 50 }, (_, i) => -5 + i * 0.2);
        Plotly.newPlot('plot-linear', [{
            x: xLin, y: xLin.map(x => 2 * x + 3),
            type: 'scatter', mode: 'lines', name: 'f(x) = 2x + 3',
            line: { color: '#00f5ff', width: 3 },
        }, {
            x: [0, 5, 5, 0], y: [0, 0, 13, 3],
            type: 'scatter', fill: 'toself', fillcolor: 'rgba(0,245,255,0.05)',
            line: { color: 'rgba(0,245,255,0.3)' }, name: 'Feasible Region',
        }], Utils.plotlyDarkLayout('', { xaxis: { title: 'x' }, yaxis: { title: 'f(x)' } }), Utils.plotlyConfig());

        // Non-linear
        const xNl = Array.from({ length: 100 }, (_, i) => -3 + i * 0.06);
        Plotly.newPlot('plot-nonlinear', [{
            x: xNl, y: xNl.map(x => Math.sin(3 * x) * x ** 2 * 0.3),
            type: 'scatter', mode: 'lines', name: 'f(x) = sin(3x)·x²/3',
            line: { color: '#bf00ff', width: 3 },
        }], Utils.plotlyDarkLayout('', { xaxis: { title: 'x' }, yaxis: { title: 'f(x)' } }), Utils.plotlyConfig());

        // Convex surface
        try {
            const sd = await API.getSurface('paraboloid', 40);
            Plotly.newPlot('plot-convex', [{
                type: 'surface', x: sd.x, y: sd.y, z: sd.z,
                colorscale: Utils.coolColorscale(), showscale: false, opacity: 0.9,
            }], Utils.plotlyDarkLayout('', {
                scene: { camera: { eye: { x: 1.6, y: 1.6, z: 1 } }, xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f' } }
            }), Utils.plotlyConfig());
        } catch {}

        // Non-convex surface
        try {
            const sd = await API.getSurface('rastrigin', 50);
            Plotly.newPlot('plot-nonconvex', [{
                type: 'surface', x: sd.x, y: sd.y, z: sd.z,
                colorscale: Utils.neonColorscale(), showscale: false, opacity: 0.9,
            }], Utils.plotlyDarkLayout('', {
                scene: { camera: { eye: { x: 1.6, y: 1.6, z: 1 } }, xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f' } }
            }), Utils.plotlyConfig());
        } catch {}
    },

    /* ─── Vector Calculus Tab ────────────────────────────────── */
    render_calculus(el) {
        el.innerHTML = `
        <div class="space-y-6 stagger">
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-2">Select Function</h4>
                <select id="calc-func" class="form-select w-64" onchange="Utils.toggleCustomInput('calc'); ConceptsPage.updateCalculus()">
                    <option value="paraboloid">Paraboloid: x² + y²</option>
                    <option value="rosenbrock">Rosenbrock</option>
                    <option value="himmelblau">Himmelblau</option>
                    <option value="booth">Booth</option>
                    ${Utils.customOption2D()}
                </select>
                ${Utils.customInput2D('calc')}
                <button class="btn-primary mt-2 hidden" id="calc-custom-btn" onclick="ConceptsPage.updateCalculus()">Load Custom</button>
            </div>

            <div class="grid lg:grid-cols-2 gap-4">
                <!-- Gradient Visualization -->
                <div class="glass-card p-6">
                    <div class="section-header">
                        <div class="section-icon bg-gradient-to-br from-cyan-500/20 to-cyan-500/5">
                            <i data-lucide="arrow-right" class="w-5 h-5 text-cyan-400"></i>
                        </div>
                        <div>
                            <h4 class="section-title">Gradient Field ∇f</h4>
                            <p class="section-desc">Direction of steepest ascent at each point</p>
                        </div>
                    </div>
                    <p class="text-xs text-gray-400 mb-3">
                        The gradient ∇f = [∂f/∂x, ∂f/∂y] points in the direction of steepest increase.
                        Arrows show negative gradient (descent direction).
                    </p>
                    <div id="plot-gradient-field" class="chart-container" style="height:400px"></div>
                </div>

                <!-- Hessian -->
                <div class="glass-card p-6">
                    <div class="section-header">
                        <div class="section-icon bg-gradient-to-br from-purple-500/20 to-purple-500/5">
                            <i data-lucide="grid-3x3" class="w-5 h-5 text-purple-400"></i>
                        </div>
                        <div>
                            <h4 class="section-title">Hessian Matrix ∇²f</h4>
                            <p class="section-desc">Second-order curvature information</p>
                        </div>
                    </div>
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label class="form-label">Point x</label>
                            <input id="hess-x" type="number" class="form-input" value="1" step="0.5" onchange="ConceptsPage.updateHessian()">
                        </div>
                        <div>
                            <label class="form-label">Point y</label>
                            <input id="hess-y" type="number" class="form-input" value="1" step="0.5" onchange="ConceptsPage.updateHessian()">
                        </div>
                    </div>
                    <div id="hessian-result" class="space-y-3"></div>
                </div>
            </div>

            <!-- Jacobian explanation -->
            <div class="glass-card p-6">
                <div class="section-header">
                    <div class="section-icon bg-gradient-to-br from-green-500/20 to-green-500/5">
                        <i data-lucide="table" class="w-5 h-5 text-green-400"></i>
                    </div>
                    <div>
                        <h4 class="section-title">Jacobian Matrix</h4>
                        <p class="section-desc">Generalization of the gradient for vector-valued functions</p>
                    </div>
                </div>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <p class="text-xs text-gray-400 leading-relaxed mb-3">
                            For a function <strong>F: ℝⁿ → ℝᵐ</strong>, the Jacobian is an m×n matrix of first-order partial derivatives. For scalar functions (m=1), the Jacobian reduces to the gradient (transpose).
                        </p>
                        <div class="code-block">
J = ⎡ ∂F₁/∂x₁  ∂F₁/∂x₂  ...  ∂F₁/∂xₙ ⎤
    ⎢ ∂F₂/∂x₁  ∂F₂/∂x₂  ...  ∂F₂/∂xₙ ⎥
    ⎣ ∂Fₘ/∂x₁  ∂Fₘ/∂x₂  ...  ∂Fₘ/∂xₙ ⎦
                        </div>
                    </div>
                    <div>
                        <p class="text-xs text-gray-400 leading-relaxed mb-3">
                            <strong>Key relationships:</strong>
                        </p>
                        <ul class="text-xs text-gray-400 space-y-2">
                            <li class="flex gap-2"><span class="text-cyan-400">▸</span> Gradient = Jacobian<sup>T</sup> for scalar functions</li>
                            <li class="flex gap-2"><span class="text-purple-400">▸</span> Hessian = Jacobian of the gradient</li>
                            <li class="flex gap-2"><span class="text-green-400">▸</span> Chain rule: J(f∘g) = J(f) · J(g)</li>
                            <li class="flex gap-2"><span class="text-pink-400">▸</span> Used in Newton's method: x ← x - J⁻¹ · F(x)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        `;
        this.updateCalculus();
    },

    async updateCalculus() {
        const sel = document.getElementById('calc-func')?.value || 'paraboloid';
        if (sel === 'custom' && !document.getElementById('calc-custom-input')?.value.trim()) return;
        const func = Utils.getFunc('calc');

        try {
            const field = await API.getGradientField(func, 15);
            const surface = await API.getSurface(func, 40);

            // Contour + gradient arrows
            const traces = [];
            traces.push({
                type: 'contour',
                x: surface.x, y: surface.y, z: surface.z,
                colorscale: Utils.surfaceColorscale(),
                showscale: false,
                contours: { coloring: 'heatmap' },
                ncontours: 30,
            });

            // Arrows as annotations approach — use cone plot in 2D
            const f = field.field;
            const arrowX = f.map(p => p.x);
            const arrowY = f.map(p => p.y);
            const arrowU = f.map(p => p.gx * 0.3);
            const arrowV = f.map(p => p.gy * 0.3);
            const mags = f.map(p => p.magnitude);

            // Use quiver-like scatter
            for (let i = 0; i < f.length; i++) {
                traces.push({
                    type: 'scatter', mode: 'lines',
                    x: [f[i].x, f[i].x + f[i].gx * 0.4],
                    y: [f[i].y, f[i].y + f[i].gy * 0.4],
                    line: { color: 'rgba(255,255,255,0.6)', width: 1.5 },
                    showlegend: false, hoverinfo: 'skip',
                });
            }

            const layout = Utils.plotlyDarkLayout('Gradient Field (Negative Gradient = Descent Direction)', {
                xaxis: { title: 'x', scaleanchor: 'y' },
                yaxis: { title: 'y' },
                showlegend: false,
            });
            Plotly.newPlot('plot-gradient-field', traces, layout, Utils.plotlyConfig());
        } catch (e) {
            document.getElementById('plot-gradient-field').innerHTML =
                '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Connect backend to load</div>';
        }

        this.updateHessian();
    },

    async updateHessian() {
        const func = document.getElementById('calc-func')?.value || 'paraboloid';
        const px = parseFloat(document.getElementById('hess-x')?.value || 1);
        const py = parseFloat(document.getElementById('hess-y')?.value || 1);
        const el = document.getElementById('hessian-result');

        try {
            const [hData, gData] = await Promise.all([
                API.getHessian(func, px, py),
                API.getGradient(func, px, py),
            ]);

            const H = hData.hessian;
            const defColors = {
                'Positive Definite': 'neon-text-green',
                'Negative Definite': 'neon-text-pink',
                'Indefinite': 'neon-text-purple',
                'Positive Semi-Definite': 'text-yellow-400',
                'Negative Semi-Definite': 'text-orange-400',
            };

            el.innerHTML = `
                <div class="code-block mb-3">
∇f(${px}, ${py}) = [${Utils.fmt(gData.gradient[0], 4)}, ${Utils.fmt(gData.gradient[1], 4)}]
f(${px}, ${py}) = ${Utils.fmt(gData.f_value, 4)}
                </div>
                <div class="code-block mb-3">
H = ⎡ ${Utils.fmt(H[0][0], 4)}  ${Utils.fmt(H[0][1], 4)} ⎤
    ⎣ ${Utils.fmt(H[1][0], 4)}  ${Utils.fmt(H[1][1], 4)} ⎦

Eigenvalues: λ₁ = ${Utils.fmt(hData.eigenvalues[0], 4)}, λ₂ = ${Utils.fmt(hData.eigenvalues[1], 4)}
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs text-gray-400">Definiteness:</span>
                    <span class="text-sm font-semibold ${defColors[hData.definiteness] || ''}">${hData.definiteness}</span>
                </div>
                <div class="flex items-center gap-3 mt-1">
                    <span class="text-xs text-gray-400">Convex at this point:</span>
                    <span class="badge ${hData.is_convex ? 'badge-success' : 'badge-error'}">${hData.is_convex ? 'Yes' : 'No'}</span>
                </div>
            `;
        } catch {
            el.innerHTML = '<p class="text-gray-500 text-xs">Connect backend to compute Hessian</p>';
        }
    },

    /* ─── Convexity Tab ──────────────────────────────────────── */
    render_convexity(el) {
        el.innerHTML = `
        <div class="space-y-6 stagger">
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-4">Convexity Analysis Tool</h4>
                <div class="flex flex-wrap gap-3 mb-4">
                    <select id="convex-func" class="form-select w-64" onchange="Utils.toggleCustomInput('convex')">
                        <option value="paraboloid">Paraboloid (Convex)</option>
                        <option value="rosenbrock">Rosenbrock (Non-convex)</option>
                        <option value="himmelblau">Himmelblau (Non-convex)</option>
                        <option value="rastrigin">Rastrigin (Non-convex)</option>
                        <option value="booth">Booth (Convex)</option>
                        ${Utils.customOption2D()}
                    </select>
                    <button class="btn-primary" onclick="ConceptsPage.runConvexity()">Analyze Convexity</button>
                </div>
                ${Utils.customInput2D('convex')}
                <div id="convexity-result"></div>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div class="glass-card p-6">
                    <h5 class="font-semibold text-green-400 mb-3">Convex Sets & Functions</h5>
                    <p class="text-xs text-gray-400 leading-relaxed mb-3">
                        A set S is <strong>convex</strong> if for any two points x, y ∈ S,
                        the line segment between them lies entirely in S: θx + (1-θ)y ∈ S for all θ ∈ [0,1].
                    </p>
                    <p class="text-xs text-gray-400 leading-relaxed mb-3">
                        A function f is <strong>convex</strong> if for any x, y in its domain:
                    </p>
                    <div class="code-block">f(θx + (1-θ)y) ≤ θf(x) + (1-θ)f(y)</div>
                </div>
                <div class="glass-card p-6">
                    <h5 class="font-semibold text-purple-400 mb-3">Hessian Definiteness Test</h5>
                    <p class="text-xs text-gray-400 leading-relaxed mb-2">
                        For twice-differentiable functions, convexity can be verified:
                    </p>
                    <ul class="text-xs text-gray-400 space-y-1.5">
                        <li class="flex gap-2"><span class="text-green-400 font-bold">✓</span> <strong>Positive Definite</strong> (all eigenvalues > 0) → Strictly convex</li>
                        <li class="flex gap-2"><span class="text-green-400">✓</span> <strong>Positive Semi-Definite</strong> (all eigenvalues ≥ 0) → Convex</li>
                        <li class="flex gap-2"><span class="text-pink-400 font-bold">✗</span> <strong>Negative Definite</strong> (all eigenvalues < 0) → Strictly concave</li>
                        <li class="flex gap-2"><span class="text-purple-400 font-bold">~</span> <strong>Indefinite</strong> (mixed signs) → Neither convex nor concave</li>
                    </ul>
                </div>
            </div>

            <div id="convexity-surface" class="glass-card p-6">
                <div id="plot-convexity" class="chart-container" style="height:450px"></div>
            </div>
        </div>
        `;
    },

    async runConvexity() {
        const func = Utils.getFunc('convex');
        const el = document.getElementById('convexity-result');
        el.innerHTML = '<p class="text-gray-400 text-sm">Analyzing...</p>';

        try {
            const [result, surface] = await Promise.all([
                API.getConvexity(func),
                API.getSurface(func, 40),
            ]);

            const convexCount = result.sample_points.filter(p => p.is_convex).length;
            const total = result.total_points;
            const pct = ((convexCount / total) * 100).toFixed(1);

            el.innerHTML = `
                <div class="flex items-center gap-4 mb-3">
                    <span class="badge ${result.globally_convex ? 'badge-success' : 'badge-error'}">
                        ${result.globally_convex ? 'Globally Convex' : 'Not Globally Convex'}
                    </span>
                    <span class="text-xs text-gray-400">${convexCount}/${total} sample points are locally convex (${pct}%)</span>
                </div>
                <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div class="h-full rounded-full ${result.globally_convex ? 'bg-green-500' : 'bg-gradient-to-r from-green-500 to-pink-500'}" style="width:${pct}%"></div>
                </div>
            `;

            // Surface with convexity markers
            const convexPts = result.sample_points.filter(p => p.is_convex);
            const nonConvexPts = result.sample_points.filter(p => !p.is_convex);

            const traces = [{
                type: 'surface', x: surface.x, y: surface.y, z: surface.z,
                colorscale: Utils.surfaceColorscale(), showscale: false, opacity: 0.7,
            }];

            if (convexPts.length > 0) {
                traces.push({
                    type: 'scatter3d', mode: 'markers',
                    x: convexPts.map(p => p.x), y: convexPts.map(p => p.y),
                    z: convexPts.map(p => { const xi = p.x, yi = p.y; return 0; }),
                    marker: { size: 3, color: '#00ff88' },
                    name: 'Convex points',
                });
            }
            if (nonConvexPts.length > 0) {
                traces.push({
                    type: 'scatter3d', mode: 'markers',
                    x: nonConvexPts.map(p => p.x), y: nonConvexPts.map(p => p.y),
                    z: nonConvexPts.map(p => 0),
                    marker: { size: 3, color: '#ff006e' },
                    name: 'Non-convex points',
                });
            }

            Plotly.newPlot('plot-convexity', traces, Utils.plotlyDarkLayout(result.function + ' — Convexity Map', {
                scene: { camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } } }
            }), Utils.plotlyConfig());

        } catch (e) {
            el.innerHTML = '<p class="text-red-400 text-sm">Error: ' + e.message + '</p>';
        }
    },

    /* ─── Test Functions Tab ─────────────────────────────────── */
    render_functions(el) {
        el.innerHTML = `
        <div class="space-y-6">
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-2">Test Function Gallery</h4>
                <p class="text-xs text-gray-400 mb-4">Click any function to view its 3D surface</p>
                <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3" id="func-gallery"></div>
            </div>
            <div id="func-detail" class="glass-card p-6 hidden">
                <div id="plot-func-detail" class="chart-container" style="height:500px"></div>
            </div>
        </div>
        `;
        this._loadFunctionGallery();
    },

    async _loadFunctionGallery() {
        try {
            const data = await API.getFunctions();
            const gallery = document.getElementById('func-gallery');
            let html = '';

            // 1D functions
            for (const [key, info] of Object.entries(data.functions_1d)) {
                html += `
                <div class="algo-card" onclick="ConceptsPage.showFunction1D('${key}')">
                    <span class="badge badge-info mb-2">1D</span>
                    <h5 class="font-semibold text-sm mb-1">${info.name.split(':')[0]}</h5>
                    <p class="text-[10px] text-gray-500">${info.name.split(':')[1] || ''}</p>
                </div>`;
            }
            // 2D functions
            for (const [key, info] of Object.entries(data.functions_2d)) {
                html += `
                <div class="algo-card" onclick="ConceptsPage.showFunction2D('${key}')">
                    <span class="badge badge-success mb-2">2D/3D</span>
                    <h5 class="font-semibold text-sm mb-1">${info.name.split(':')[0]}</h5>
                    <p class="text-[10px] text-gray-500">${info.name.split(':')[1] || ''}</p>
                </div>`;
            }
            gallery.innerHTML = html;
        } catch {
            document.getElementById('func-gallery').innerHTML = '<p class="text-gray-500 text-sm col-span-3">Start backend to load functions</p>';
        }
    },

    async showFunction1D(key) {
        const detail = document.getElementById('func-detail');
        detail.classList.remove('hidden');
        try {
            const data = await API.eval1D(key, 300);
            Plotly.newPlot('plot-func-detail', [
                { x: data.x, y: data.y, type: 'scatter', mode: 'lines', name: 'f(x)', line: { color: '#00f5ff', width: 3 } },
                { x: data.x, y: data.dy, type: 'scatter', mode: 'lines', name: "f'(x)", line: { color: '#bf00ff', width: 2, dash: 'dash' } },
            ], Utils.plotlyDarkLayout(data.name, { xaxis: { title: 'x' }, yaxis: { title: 'y' } }), Utils.plotlyConfig());
        } catch {}
    },

    async showFunction2D(key) {
        const detail = document.getElementById('func-detail');
        detail.classList.remove('hidden');
        try {
            const sd = await API.getSurface(key, 60);
            Plotly.newPlot('plot-func-detail', [{
                type: 'surface', x: sd.x, y: sd.y, z: sd.z,
                colorscale: Utils.neonColorscale(), showscale: false, opacity: 0.9,
                contours: { z: { show: true, usecolormap: true, highlightcolor: '#fff', project: { z: true } } },
            }], Utils.plotlyDarkLayout(sd.name, {
                scene: { camera: { eye: { x: 1.8, y: 1.8, z: 1 } }, xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f(x,y)' } }
            }), Utils.plotlyConfig());
        } catch {}
    },
};
