/* ═════════════════════════════════════════════════════════════
   ALGORITHM VISUALIZER PAGE
   ═════════════════════════════════════════════════════════════ */

const AlgorithmsPage = {
    currentCategory: 'single-variable',
    animationTimer: null,

    render() {
        return `
        <div class="page-enter space-y-6">
            <div class="tab-bar">
                <button class="tab-btn active" onclick="AlgorithmsPage.switchCategory('single-variable', this)">Single Variable</button>
                <button class="tab-btn" onclick="AlgorithmsPage.switchCategory('bracketing', this)">Bracketing Methods</button>
                <button class="tab-btn" onclick="AlgorithmsPage.switchCategory('region-elimination', this)">Region Elimination</button>
                <button class="tab-btn" onclick="AlgorithmsPage.switchCategory('gradient-descent', this)">Gradient Descent</button>
            </div>
            <div id="algo-content"></div>
        </div>
        `;
    },

    init() {
        this.switchCategory('single-variable');
    },

    switchCategory(cat, btn) {
        this.currentCategory = cat;
        if (this.animationTimer) { clearInterval(this.animationTimer); this.animationTimer = null; }
        document.querySelectorAll('.tab-bar .tab-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        else document.querySelector('.tab-bar .tab-btn')?.classList.add('active');

        const el = document.getElementById('algo-content');
        el.innerHTML = '';
        setTimeout(() => this['render_' + cat.replace(/-/g, '_')](el), 50);
    },

    /* ═══ SINGLE VARIABLE ═══════════════════════════════════════ */
    render_single_variable(el) {
        el.innerHTML = `
        <div class="space-y-4 stagger">
            <div class="grid lg:grid-cols-3 gap-4">
                <!-- Controls Panel -->
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-4">Controls</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="form-label">Algorithm</label>
                            <select id="sv-algo" class="form-select">
                                <option value="bisection">Bisection Method</option>
                                <option value="newton">Newton-Raphson</option>
                                <option value="secant">Secant Method</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Function</label>
                            <select id="sv-func" class="form-select" onchange="Utils.toggleCustomInput('sv')">
                                <option value="quadratic">f(x) = x²</option>
                                <option value="cubic">f(x) = x³ - 3x</option>
                                <option value="polynomial">f(x) = x⁴ - 4x² + 3</option>
                                <option value="sinusoidal">f(x) = sin(x) + sin(2x)</option>
                                ${Utils.customOption1D()}
                            </select>
                        </div>
                        ${Utils.customInput1D('sv')}
                        <div id="sv-params"></div>
                        <div>
                            <label class="form-label">Tolerance</label>
                            <input id="sv-tol" type="number" class="form-input" value="0.000001" step="0.000001">
                        </div>
                        <div>
                            <label class="form-label">Max Iterations</label>
                            <input id="sv-maxiter" type="number" class="form-input" value="50" min="1" max="200">
                        </div>
                        <button class="btn-primary w-full" onclick="AlgorithmsPage.runSingleVariable()">
                            <i data-lucide="play" class="w-4 h-4"></i> Run Algorithm
                        </button>
                        <button class="btn-neon w-full" id="sv-animate-btn" onclick="AlgorithmsPage.animateSingleVariable()" disabled>
                            <i data-lucide="film" class="w-4 h-4"></i> Animate Steps
                        </button>
                        <button class="btn-secondary w-full" id="sv-record-btn" onclick="AlgorithmsPage.recordAnimation('sv')" disabled>
                            <i data-lucide="video" class="w-4 h-4"></i> Record Video
                        </button>
                        <button class="btn-secondary w-full text-xs" onclick="ExportUtils.exportPlotlyAsPNG('sv-plot', 'algorithm-convergence.png')" disabled id="sv-export-btn">
                            <i data-lucide="download" class="w-3 h-3"></i> Export Chart
                        </button>
                    </div>
                </div>

                <!-- Plot -->
                <div class="lg:col-span-2 glass-card p-6">
                    <div id="sv-plot" class="chart-container" style="height:420px"></div>
                    <div id="sv-status" class="mt-3 flex items-center gap-3 text-xs text-gray-400"></div>
                </div>
            </div>

            <!-- Results Table -->
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-3">Iteration History</h4>
                <div class="overflow-x-auto" id="sv-table-container">
                    <p class="text-xs text-gray-500">Run an algorithm to see results</p>
                </div>
            </div>

            <!-- Convergence Plot -->
            <div class="glass-card p-6">
                <div id="sv-convergence" class="chart-container" style="height:300px"></div>
            </div>
        </div>
        `;
        this._updateSVParams();
        document.getElementById('sv-algo').addEventListener('change', () => this._updateSVParams());
    },

    _updateSVParams() {
        const algo = document.getElementById('sv-algo')?.value;
        const el = document.getElementById('sv-params');
        if (!el) return;

        if (algo === 'bisection') {
            el.innerHTML = `
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="form-label">a (left)</label><input id="sv-a" type="number" class="form-input" value="-5" step="0.5"></div>
                    <div><label class="form-label">b (right)</label><input id="sv-b" type="number" class="form-input" value="5" step="0.5"></div>
                </div>`;
        } else if (algo === 'newton') {
            el.innerHTML = `<div><label class="form-label">Initial x₀</label><input id="sv-x0" type="number" class="form-input" value="3" step="0.5"></div>`;
        } else if (algo === 'secant') {
            el.innerHTML = `
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="form-label">x₀</label><input id="sv-x0" type="number" class="form-input" value="-3" step="0.5"></div>
                    <div><label class="form-label">x₁</label><input id="sv-x1" type="number" class="form-input" value="3" step="0.5"></div>
                </div>`;
        }
    },

    _svResult: null,
    _svFuncData: null,

    async runSingleVariable() {
        const algo = document.getElementById('sv-algo').value;
        const func = Utils.getFunc('sv');
        const tol = parseFloat(document.getElementById('sv-tol').value);
        const maxIter = parseInt(document.getElementById('sv-maxiter').value);

        try {
            let result;
            if (algo === 'bisection') {
                const a = parseFloat(document.getElementById('sv-a').value);
                const b = parseFloat(document.getElementById('sv-b').value);
                result = await API.bisection(func, a, b, tol, maxIter);
            } else if (algo === 'newton') {
                const x0 = parseFloat(document.getElementById('sv-x0').value);
                result = await API.newton(func, x0, tol, maxIter);
            } else {
                const x0 = parseFloat(document.getElementById('sv-x0').value);
                const x1 = parseFloat(document.getElementById('sv-x1').value);
                result = await API.secant(func, x0, x1, tol, maxIter);
            }

            const funcData = await API.eval1D(func, 300);
            this._svResult = result;
            this._svFuncData = funcData;

            this._plotSVResult(result, funcData, result.iterations.length);
            this._tableSVResult(result);
            this._plotSVConvergence(result);

            document.getElementById('sv-animate-btn').disabled = false;
            document.getElementById('sv-record-btn').disabled = false;
            document.getElementById('sv-export-btn').disabled = false;
            document.getElementById('sv-status').innerHTML = `
                <span class="badge ${result.converged ? 'badge-success' : 'badge-warning'}">${result.converged ? 'Converged' : 'Max Iterations'}</span>
                <span>${result.algorithm} → x* = ${Utils.fmt(result.result, 6)} | f(x*) = ${Utils.fmt(result.f_result, 6)} | ${result.total_iterations} iterations</span>
            `;
            Utils.toast(`${result.algorithm} completed in ${result.total_iterations} iterations`, 'success');
        } catch (e) {
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    _plotSVResult(result, funcData, upToIter) {
        const traces = [{
            x: funcData.x, y: funcData.y,
            type: 'scatter', mode: 'lines', name: 'f(x)',
            line: { color: '#0ea5e9', width: 2 },
        }];

        const iters = result.iterations.slice(0, upToIter);

        if (result.algorithm === 'Bisection Method') {
            iters.forEach((it, idx) => {
                const opacity = 0.1 + 0.9 * (idx / iters.length);
                traces.push({
                    x: [it.a, it.a, null, it.b, it.b],
                    y: [Math.min(...funcData.y) * 1.1, Math.max(...funcData.y) * 1.1, null, Math.min(...funcData.y) * 1.1, Math.max(...funcData.y) * 1.1],
                    type: 'scatter', mode: 'lines', showlegend: false,
                    line: { color: `rgba(0,245,255,${opacity})`, width: 1, dash: 'dot' },
                });
            });
            const last = iters[iters.length - 1];
            traces.push({
                x: [last.mid], y: [last.f_mid],
                type: 'scatter', mode: 'markers', name: 'Current',
                marker: { size: 12, color: '#ff006e', symbol: 'star' },
            });
        } else {
            const xPts = iters.map(it => it.x || it.x_curr);
            const yPts = iters.map(it => it.f_x);
            traces.push({
                x: xPts, y: yPts,
                type: 'scatter', mode: 'lines+markers', name: 'Iterations',
                line: { color: '#00f5ff', width: 1, dash: 'dash' },
                marker: { size: 6, color: iters.map((_, i) => i === iters.length - 1 ? '#00ff88' : '#bf00ff') },
            });
        }

        // Mark result
        traces.push({
            x: [result.result], y: [result.f_result],
            type: 'scatter', mode: 'markers', name: 'Minimum',
            marker: { size: 14, color: '#00ff88', symbol: 'diamond', line: { color: 'white', width: 2 } },
        });

        Plotly.newPlot('sv-plot', traces, Utils.plotlyDarkLayout(result.algorithm + ' — ' + result.function, {
            xaxis: { title: 'x' }, yaxis: { title: 'f(x)' },
        }), Utils.plotlyConfig());
    },

    _tableSVResult(result) {
        const iters = result.iterations;
        if (!iters.length) return;
        const keys = Object.keys(iters[0]);
        let html = '<table class="data-table"><thead><tr>';
        keys.forEach(k => { html += `<th>${k}</th>`; });
        html += '</tr></thead><tbody>';
        iters.forEach(it => {
            html += '<tr>';
            keys.forEach(k => { html += `<td>${typeof it[k] === 'number' ? Utils.fmt(it[k], 6) : it[k]}</td>`; });
            html += '</tr>';
        });
        html += '</tbody></table>';
        document.getElementById('sv-table-container').innerHTML = html;
    },

    _plotSVConvergence(result) {
        const iters = result.iterations;
        let errorVals;
        if (result.algorithm === 'Bisection Method') {
            errorVals = iters.map(it => it.interval_width);
        } else {
            errorVals = iters.map(it => Math.abs(it.df_x || it.df_curr || 0));
        }

        Plotly.newPlot('sv-convergence', [{
            x: iters.map(it => it.iteration),
            y: errorVals,
            type: 'scatter', mode: 'lines+markers',
            line: { color: '#bf00ff', width: 2 },
            marker: { size: 4, color: '#bf00ff' },
            name: 'Error',
        }], Utils.plotlyDarkLayout('Convergence Plot', {
            xaxis: { title: 'Iteration' },
            yaxis: { title: 'Error', type: 'log' },
        }), Utils.plotlyConfig());
    },

    async animateSingleVariable() {
        if (!this._svResult || !this._svFuncData) return;
        if (this.animationTimer) { clearInterval(this.animationTimer); this.animationTimer = null; }

        const totalIters = this._svResult.iterations.length;
        let step = 0;

        this.animationTimer = setInterval(() => {
            step++;
            if (step > totalIters) {
                clearInterval(this.animationTimer);
                this.animationTimer = null;
                return;
            }
            this._plotSVResult(this._svResult, this._svFuncData, step);
        }, 400);
    },

    /* ═══ BRACKETING METHODS ═══════════════════════════════════ */
    render_bracketing(el) {
        el.innerHTML = `
        <div class="space-y-4 stagger">
            <div class="grid lg:grid-cols-3 gap-4">
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-4">Controls</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="form-label">Algorithm</label>
                            <select id="br-algo" class="form-select" onchange="AlgorithmsPage._updateBRParams()">
                                <option value="exhaustive">Exhaustive Search</option>
                                <option value="bounding-phase">Bounding Phase</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Function</label>
                            <select id="br-func" class="form-select" onchange="Utils.toggleCustomInput('br')">
                                <option value="quadratic">f(x) = x²</option>
                                <option value="cubic">f(x) = x³ - 3x</option>
                                <option value="polynomial">f(x) = x⁴ - 4x² + 3</option>
                                ${Utils.customOption1D()}
                            </select>
                        </div>
                        ${Utils.customInput1D('br')}
                        <div id="br-params"></div>
                        <button class="btn-primary w-full" onclick="AlgorithmsPage.runBracketing()">
                            <i data-lucide="play" class="w-4 h-4"></i> Run Algorithm
                        </button>
                    </div>
                </div>
                <div class="lg:col-span-2 glass-card p-6">
                    <div id="br-plot" class="chart-container" style="height:420px"></div>
                    <div id="br-status" class="mt-3 text-xs text-gray-400"></div>
                </div>
            </div>
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-3">Iteration History</h4>
                <div class="overflow-x-auto" id="br-table-container">
                    <p class="text-xs text-gray-500">Run an algorithm to see results</p>
                </div>
            </div>
        </div>
        `;
        this._updateBRParams();
    },

    _updateBRParams() {
        const algo = document.getElementById('br-algo')?.value;
        const el = document.getElementById('br-params');
        if (!el) return;
        if (algo === 'exhaustive') {
            el.innerHTML = `
                <div class="grid grid-cols-2 gap-2">
                    <div><label class="form-label">a</label><input id="br-a" type="number" class="form-input" value="-5" step="0.5"></div>
                    <div><label class="form-label">b</label><input id="br-b" type="number" class="form-input" value="5" step="0.5"></div>
                </div>
                <div><label class="form-label">Number of points</label><input id="br-n" type="number" class="form-input" value="100" min="10" max="1000"></div>`;
        } else {
            el.innerHTML = `
                <div><label class="form-label">Start x₀</label><input id="br-x0" type="number" class="form-input" value="-3" step="0.5"></div>
                <div><label class="form-label">Delta (step size)</label><input id="br-delta" type="number" class="form-input" value="0.1" step="0.05"></div>`;
        }
    },

    async runBracketing() {
        const algo = document.getElementById('br-algo').value;
        const func = Utils.getFunc('br');

        try {
            let result;
            if (algo === 'exhaustive') {
                const a = parseFloat(document.getElementById('br-a').value);
                const b = parseFloat(document.getElementById('br-b').value);
                const n = parseInt(document.getElementById('br-n').value);
                result = await API.exhaustive(func, a, b, n);
            } else {
                const x0 = parseFloat(document.getElementById('br-x0').value);
                const delta = parseFloat(document.getElementById('br-delta').value);
                result = await API.boundingPhase(func, x0, delta);
            }

            const funcData = await API.eval1D(func, 300);

            // Plot
            const traces = [{
                x: funcData.x, y: funcData.y,
                type: 'scatter', mode: 'lines', name: 'f(x)',
                line: { color: '#0ea5e9', width: 2 },
            }];

            if (result.all_points) {
                traces.push({
                    x: result.all_points.map(p => p.x),
                    y: result.all_points.map(p => p.f_x),
                    type: 'scatter', mode: 'markers', name: 'Evaluated Points',
                    marker: { size: 3, color: 'rgba(191,0,255,0.4)' },
                });
            }

            // Bracket interval
            if (result.interval) {
                const yMin = Math.min(...funcData.y);
                const yMax = Math.max(...funcData.y);
                traces.push({
                    x: [result.interval[0], result.interval[0], result.interval[1], result.interval[1], result.interval[0]],
                    y: [yMin, yMax, yMax, yMin, yMin],
                    type: 'scatter', fill: 'toself',
                    fillcolor: 'rgba(0,245,255,0.08)',
                    line: { color: 'rgba(0,245,255,0.4)', width: 2 },
                    name: 'Bracket',
                });
            }

            traces.push({
                x: [result.result], y: [result.f_result],
                type: 'scatter', mode: 'markers', name: 'Minimum',
                marker: { size: 14, color: '#00ff88', symbol: 'diamond', line: { color: 'white', width: 2 } },
            });

            Plotly.newPlot('br-plot', traces, Utils.plotlyDarkLayout(result.algorithm, {
                xaxis: { title: 'x' }, yaxis: { title: 'f(x)' },
            }), Utils.plotlyConfig());

            // Table
            const tableEl = document.getElementById('br-table-container');
            const keys = Object.keys(result.iterations[0] || {});
            let html = '<table class="data-table"><thead><tr>';
            keys.forEach(k => { html += `<th>${k}</th>`; });
            html += '</tr></thead><tbody>';
            result.iterations.forEach(it => {
                html += '<tr>';
                keys.forEach(k => { html += `<td>${typeof it[k] === 'number' ? Utils.fmt(it[k], 6) : it[k]}</td>`; });
                html += '</tr>';
            });
            html += '</tbody></table>';
            tableEl.innerHTML = html;

            document.getElementById('br-status').innerHTML = `
                <span class="badge badge-success">${result.algorithm}</span>
                <span class="ml-2">x* ≈ ${Utils.fmt(result.result, 6)} | f(x*) = ${Utils.fmt(result.f_result, 6)} | Bracket: [${Utils.fmt(result.interval[0], 4)}, ${Utils.fmt(result.interval[1], 4)}]</span>
            `;
            Utils.toast(`${result.algorithm} completed`, 'success');
        } catch (e) {
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    /* ═══ REGION ELIMINATION ════════════════════════════════════ */
    render_region_elimination(el) {
        el.innerHTML = `
        <div class="space-y-4 stagger">
            <div class="grid lg:grid-cols-3 gap-4">
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-4">Controls</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="form-label">Algorithm</label>
                            <select id="re-algo" class="form-select" onchange="AlgorithmsPage._updateREParams()">
                                <option value="interval-halving">Interval Halving</option>
                                <option value="fibonacci">Fibonacci Search</option>
                                <option value="golden-section">Golden Section Search</option>
                            </select>
                        </div>
                        <div>
                            <label class="form-label">Function</label>
                            <select id="re-func" class="form-select" onchange="Utils.toggleCustomInput('re')">
                                <option value="quadratic">f(x) = x²</option>
                                <option value="cubic">f(x) = x³ - 3x</option>
                                <option value="polynomial">f(x) = x⁴ - 4x² + 3</option>
                                ${Utils.customOption1D()}
                            </select>
                        </div>
                        ${Utils.customInput1D('re')}
                        <div class="grid grid-cols-2 gap-2">
                            <div><label class="form-label">a</label><input id="re-a" type="number" class="form-input" value="-5" step="0.5"></div>
                            <div><label class="form-label">b</label><input id="re-b" type="number" class="form-input" value="5" step="0.5"></div>
                        </div>
                        <div id="re-params"></div>
                        <button class="btn-primary w-full" onclick="AlgorithmsPage.runRegionElimination()">
                            <i data-lucide="play" class="w-4 h-4"></i> Run Algorithm
                        </button>
                        <button class="btn-neon w-full" id="re-animate-btn" onclick="AlgorithmsPage.animateRE()" disabled>
                            <i data-lucide="film" class="w-4 h-4"></i> Animate Interval Shrinking
                        </button>
                    </div>
                </div>
                <div class="lg:col-span-2 glass-card p-6">
                    <div id="re-plot" class="chart-container" style="height:420px"></div>
                    <div id="re-status" class="mt-3 text-xs text-gray-400"></div>
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-3">Iteration History</h4>
                    <div class="overflow-x-auto" id="re-table-container" style="max-height:400px">
                        <p class="text-xs text-gray-500">Run an algorithm to see results</p>
                    </div>
                </div>
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-3">Interval Width vs Iteration</h4>
                    <div id="re-convergence" class="chart-container" style="height:320px"></div>
                </div>
            </div>
        </div>
        `;
        this._updateREParams();
    },

    _updateREParams() {
        const algo = document.getElementById('re-algo')?.value;
        const el = document.getElementById('re-params');
        if (!el) return;
        if (algo === 'fibonacci') {
            el.innerHTML = `<div><label class="form-label">Number of iterations (n)</label><input id="re-n" type="number" class="form-input" value="20" min="5" max="50"></div>`;
        } else {
            el.innerHTML = `<div><label class="form-label">Tolerance</label><input id="re-tol" type="number" class="form-input" value="0.000001" step="0.000001"></div>`;
        }
    },

    _reResult: null,
    _reFuncData: null,

    async runRegionElimination() {
        const algo = document.getElementById('re-algo').value;
        const func = Utils.getFunc('re');
        const a = parseFloat(document.getElementById('re-a').value);
        const b = parseFloat(document.getElementById('re-b').value);

        try {
            let result;
            if (algo === 'interval-halving') {
                result = await API.intervalHalving(func, a, b, parseFloat(document.getElementById('re-tol').value));
            } else if (algo === 'fibonacci') {
                result = await API.fibonacci(func, a, b, parseInt(document.getElementById('re-n').value));
            } else {
                result = await API.goldenSection(func, a, b, parseFloat(document.getElementById('re-tol').value));
            }

            const funcData = await API.eval1D(func, 300);
            this._reResult = result;
            this._reFuncData = funcData;

            this._plotREResult(result, funcData, result.iterations.length);
            this._tableREResult(result);
            this._plotREConvergence(result);

            document.getElementById('re-animate-btn').disabled = false;
            document.getElementById('re-status').innerHTML = `
                <span class="badge ${result.converged ? 'badge-success' : 'badge-info'}">Done</span>
                <span class="ml-2">${result.algorithm} → x* = ${Utils.fmt(result.result, 6)} | f(x*) = ${Utils.fmt(result.f_result, 6)} | ${result.total_iterations} iters</span>
            `;
            Utils.toast(`${result.algorithm}: ${result.total_iterations} iterations`, 'success');
        } catch (e) {
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    _plotREResult(result, funcData, upToIter) {
        const traces = [{
            x: funcData.x, y: funcData.y,
            type: 'scatter', mode: 'lines', name: 'f(x)',
            line: { color: '#0ea5e9', width: 2 },
        }];

        const iters = result.iterations.slice(0, upToIter);
        const yMin = Math.min(...funcData.y);
        const yMax = Math.max(...funcData.y);

        // Show intervals narrowing
        iters.forEach((it, idx) => {
            const opacity = 0.05 + 0.3 * (idx / iters.length);
            traces.push({
                x: [it.a, it.a, it.b, it.b, it.a],
                y: [yMin, yMax, yMax, yMin, yMin],
                type: 'scatter', fill: 'toself',
                fillcolor: `rgba(0,245,255,${opacity * 0.3})`,
                line: { color: `rgba(0,245,255,${opacity})`, width: 1 },
                showlegend: idx === 0, name: idx === 0 ? 'Search Intervals' : undefined,
            });
        });

        traces.push({
            x: [result.result], y: [result.f_result],
            type: 'scatter', mode: 'markers', name: 'Minimum',
            marker: { size: 14, color: '#00ff88', symbol: 'diamond', line: { color: 'white', width: 2 } },
        });

        Plotly.newPlot('re-plot', traces, Utils.plotlyDarkLayout(result.algorithm + ' — Interval Narrowing', {
            xaxis: { title: 'x' }, yaxis: { title: 'f(x)' },
        }), Utils.plotlyConfig());
    },

    _tableREResult(result) {
        const iters = result.iterations;
        if (!iters.length) return;
        const keys = Object.keys(iters[0]);
        let html = '<table class="data-table"><thead><tr>';
        keys.forEach(k => { html += `<th>${k}</th>`; });
        html += '</tr></thead><tbody>';
        iters.forEach(it => {
            html += '<tr>';
            keys.forEach(k => { html += `<td>${typeof it[k] === 'number' ? Utils.fmt(it[k], 6) : it[k]}</td>`; });
            html += '</tr>';
        });
        html += '</tbody></table>';
        document.getElementById('re-table-container').innerHTML = html;
    },

    _plotREConvergence(result) {
        const iters = result.iterations;
        Plotly.newPlot('re-convergence', [{
            x: iters.map(it => it.iteration),
            y: iters.map(it => it.interval_width),
            type: 'scatter', mode: 'lines+markers',
            line: { color: '#bf00ff', width: 2 },
            marker: { size: 5, color: '#bf00ff' },
            name: 'Interval Width',
        }], Utils.plotlyDarkLayout('Interval Width vs Iteration', {
            xaxis: { title: 'Iteration' },
            yaxis: { title: 'Interval Width', type: 'log' },
        }), Utils.plotlyConfig());
    },

    async animateRE() {
        if (!this._reResult || !this._reFuncData) return;
        if (this.animationTimer) { clearInterval(this.animationTimer); this.animationTimer = null; }

        const total = this._reResult.iterations.length;
        let step = 0;
        this.animationTimer = setInterval(() => {
            step++;
            if (step > total) { clearInterval(this.animationTimer); this.animationTimer = null; return; }
            this._plotREResult(this._reResult, this._reFuncData, step);
        }, 300);
    },

    /* ═══ GRADIENT DESCENT ═════════════════════════════════════ */
    render_gradient_descent(el) {
        el.innerHTML = `
        <div class="space-y-4 stagger">
            <div class="grid lg:grid-cols-3 gap-4">
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-4">Controls</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="form-label">Function</label>
                            <select id="gd-func" class="form-select" onchange="Utils.toggleCustomInput('gd')">
                                <option value="paraboloid">Paraboloid</option>
                                <option value="rosenbrock">Rosenbrock</option>
                                <option value="himmelblau">Himmelblau</option>
                                <option value="beale">Beale</option>
                                <option value="booth">Booth</option>
                                ${Utils.customOption2D()}
                            </select>
                        </div>
                        ${Utils.customInput2D('gd')}
                        <div class="grid grid-cols-2 gap-2">
                            <div><label class="form-label">Start x₀</label><input id="gd-x0" type="number" class="form-input" value="-1.5" step="0.5"></div>
                            <div><label class="form-label">Start y₀</label><input id="gd-y0" type="number" class="form-input" value="2.0" step="0.5"></div>
                        </div>
                        <div>
                            <label class="form-label">Learning Rate: <span id="gd-lr-val">0.010</span></label>
                            <input id="gd-lr" type="range" class="form-range" min="0.0001" max="0.5" step="0.0001" value="0.01" oninput="document.getElementById('gd-lr-val').textContent=parseFloat(this.value).toFixed(4)">
                        </div>
                        <div>
                            <label class="form-label">Max Iterations</label>
                            <input id="gd-maxiter" type="number" class="form-input" value="300" min="10" max="2000">
                        </div>
                        <button class="btn-primary w-full" onclick="AlgorithmsPage.runGradientDescent()">
                            <i data-lucide="play" class="w-4 h-4"></i> Run Gradient Descent
                        </button>
                        <button class="btn-neon w-full" id="gd-animate-btn" onclick="AlgorithmsPage.animateGD()" disabled>
                            <i data-lucide="film" class="w-4 h-4"></i> Animate Path
                        </button>
                    </div>
                </div>
                <div class="lg:col-span-2 glass-card p-6">
                    <div id="gd-plot" class="chart-container" style="height:500px"></div>
                    <div id="gd-status" class="mt-3 text-xs text-gray-400"></div>
                </div>
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-3">Convergence</h4>
                    <div id="gd-convergence" class="chart-container" style="height:300px"></div>
                </div>
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-3">Gradient Norm</h4>
                    <div id="gd-gradnorm" class="chart-container" style="height:300px"></div>
                </div>
            </div>
        </div>
        `;
    },

    _gdResult: null,
    _gdSurface: null,

    async runGradientDescent() {
        const func = Utils.getFunc('gd');
        const x0 = parseFloat(document.getElementById('gd-x0').value);
        const y0 = parseFloat(document.getElementById('gd-y0').value);
        const lr = parseFloat(document.getElementById('gd-lr').value);
        const maxIter = parseInt(document.getElementById('gd-maxiter').value);

        try {
            const [result, surface] = await Promise.all([
                API.gradientDescent(func, x0, y0, lr, maxIter, 1e-8),
                API.getSurface(func, 50),
            ]);

            this._gdResult = result;
            this._gdSurface = surface;

            this._plotGDResult(result, surface, result.path.length);
            this._plotGDConvergence(result);

            document.getElementById('gd-animate-btn').disabled = false;
            document.getElementById('gd-status').innerHTML = `
                <span class="badge ${result.converged ? 'badge-success' : 'badge-warning'}">${result.converged ? 'Converged' : 'Max Iterations'}</span>
                <span class="ml-2">Result: (${Utils.fmt(result.result.x, 4)}, ${Utils.fmt(result.result.y, 4)}) | f = ${Utils.fmt(result.f_result, 6)} | ${result.total_iterations} steps</span>
            `;
            Utils.toast(`Gradient Descent: ${result.total_iterations} iterations`, 'success');
        } catch (e) {
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    _plotGDResult(result, surface, upToStep) {
        const path = result.path.slice(0, upToStep);
        const traces = [
            {
                type: 'surface',
                x: surface.x, y: surface.y, z: surface.z,
                colorscale: Utils.neonColorscale(),
                opacity: 0.8, showscale: false,
                contours: { z: { show: true, usecolormap: true, highlightcolor: '#fff', project: { z: true } } },
            },
            {
                type: 'scatter3d', mode: 'lines',
                x: path.map(p => p.x), y: path.map(p => p.y), z: path.map(p => p.f),
                line: { color: '#00f5ff', width: 5 },
                name: 'Descent Path',
            },
            {
                type: 'scatter3d', mode: 'markers',
                x: path.map(p => p.x), y: path.map(p => p.y), z: path.map(p => p.f),
                marker: { size: 2.5, color: path.map((_, i) => i), colorscale: 'YlOrRd', showscale: false },
                name: 'Steps',
            },
            {
                type: 'scatter3d', mode: 'markers',
                x: [path[0].x], y: [path[0].y], z: [path[0].f],
                marker: { size: 8, color: '#ff006e', symbol: 'diamond' },
                name: 'Start',
            },
            {
                type: 'scatter3d', mode: 'markers',
                x: [path[path.length - 1].x], y: [path[path.length - 1].y], z: [path[path.length - 1].f],
                marker: { size: 8, color: '#00ff88', symbol: 'diamond' },
                name: 'End',
            },
        ];

        Plotly.newPlot('gd-plot', traces, Utils.plotlyDarkLayout('Gradient Descent on ' + surface.name, {
            scene: {
                camera: { eye: { x: 1.8, y: 1.8, z: 1.2 } },
                xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f(x,y)' },
            },
        }), Utils.plotlyConfig());
    },

    _plotGDConvergence(result) {
        const path = result.path;
        Plotly.newPlot('gd-convergence', [{
            x: path.map(p => p.iteration),
            y: path.map(p => p.f),
            type: 'scatter', mode: 'lines',
            line: { color: '#0ea5e9', width: 2 },
            name: 'f(x,y)',
        }], Utils.plotlyDarkLayout('f(x,y) vs Iteration', {
            xaxis: { title: 'Iteration' }, yaxis: { title: 'f(x,y)' },
        }), Utils.plotlyConfig());

        Plotly.newPlot('gd-gradnorm', [{
            x: path.map(p => p.iteration),
            y: path.map(p => p.grad_norm),
            type: 'scatter', mode: 'lines',
            line: { color: '#bf00ff', width: 2 },
            name: '‖∇f‖',
        }], Utils.plotlyDarkLayout('Gradient Norm vs Iteration', {
            xaxis: { title: 'Iteration' }, yaxis: { title: '‖∇f‖', type: 'log' },
        }), Utils.plotlyConfig());
    },

    async animateGD() {
        if (!this._gdResult || !this._gdSurface) return;
        if (this.animationTimer) { clearInterval(this.animationTimer); this.animationTimer = null; }

        const total = this._gdResult.path.length;
        const stepSize = Math.max(1, Math.floor(total / 60));
        let step = 1;

        this.animationTimer = setInterval(() => {
            step += stepSize;
            if (step > total) {
                step = total;
                clearInterval(this.animationTimer);
                this.animationTimer = null;
            }
            this._plotGDResult(this._gdResult, this._gdSurface, step);
        }, 100);
    },

    /**
     * Record algorithm animation
     */
    async recordAnimation(type) {
        const plotId = type + '-plot';
        const plotElement = document.getElementById(plotId);
        if (!plotElement) {
            Utils.toast('Plot not found', 'error');
            return;
        }

        const canvas = await html2canvas(plotElement);
        const success = await RecordingUtils.startCanvasRecording(canvas, 30);
        if (!success) return;

        // Run animation while recording
        let recordBtn = document.getElementById(type + '-record-btn');
        recordBtn.textContent = '⏹ Stop Recording';
        
        if (type === 'sv') {
            await this.animateSingleVariable();
        }

        await RecordingUtils.stopCanvasRecording('algorithm-animation.webm');
        recordBtn.textContent = '🎥 Record Video';
    },
};
