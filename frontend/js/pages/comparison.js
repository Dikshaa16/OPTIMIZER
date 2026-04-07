/* ═════════════════════════════════════════════════════════════
   COMPARISON LAB
   ═════════════════════════════════════════════════════════════ */

const ComparisonPage = {
    render() {
        return `
        <div class="page-enter space-y-6">
            <div class="tab-bar">
                <button class="tab-btn active" onclick="ComparisonPage.switchTab('1d', this)">1D Algorithm Comparison</button>
                <button class="tab-btn" onclick="ComparisonPage.switchTab('2d', this)">2D Starting Point Analysis</button>
                <button class="tab-btn" onclick="ComparisonPage.switchTab('leaderboard', this)">Performance Leaderboard</button>
                <button class="tab-btn" onclick="ComparisonPage.switchTab('demo', this)">Auto Demo</button>
            </div>
            <div id="comp-content"></div>
        </div>
        `;
    },

    init() {
        this.switchTab('1d');
    },

    switchTab(tab, btn) {
        document.querySelectorAll('.tab-bar .tab-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        else document.querySelector('.tab-bar .tab-btn')?.classList.add('active');
        const el = document.getElementById('comp-content');
        el.innerHTML = '';
        setTimeout(() => this['render_' + tab](el), 50);
    },

    /* ═══ 1D COMPARISON ═══════════════════════════════════════ */
    render_1d(el) {
        el.innerHTML = `
        <div class="space-y-4 stagger">
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-4">Compare 1D Optimization Algorithms</h4>
                <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    <div>
                        <label class="form-label">Function</label>
                        <select id="cmp-func" class="form-select" onchange="Utils.toggleCustomInput('cmp')">
                            <option value="quadratic">f(x) = x²</option>
                            <option value="cubic">f(x) = x³ - 3x</option>
                            <option value="polynomial">f(x) = x⁴ - 4x² + 3</option>
                            ${Utils.customOption1D()}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Interval a</label>
                        <input id="cmp-a" type="number" class="form-input" value="-5" step="0.5">
                    </div>
                    <div>
                        <label class="form-label">Interval b</label>
                        <input id="cmp-b" type="number" class="form-input" value="5" step="0.5">
                    </div>
                    <div>
                        <label class="form-label">Tolerance</label>
                        <input id="cmp-tol" type="number" class="form-input" value="0.000001">
                    </div>
                </div>
                ${Utils.customInput1D('cmp')}
                <div class="flex flex-wrap gap-2 mb-4">
                    <label class="flex items-center gap-2 text-xs"><input type="checkbox" id="cmp-bisection" checked class="accent-cyan-500"> Bisection</label>
                    <label class="flex items-center gap-2 text-xs"><input type="checkbox" id="cmp-newton" checked class="accent-purple-500"> Newton-Raphson</label>
                    <label class="flex items-center gap-2 text-xs"><input type="checkbox" id="cmp-secant" checked class="accent-pink-500"> Secant</label>
                    <label class="flex items-center gap-2 text-xs"><input type="checkbox" id="cmp-golden" checked class="accent-green-500"> Golden Section</label>
                    <label class="flex items-center gap-2 text-xs"><input type="checkbox" id="cmp-fibonacci" checked class="accent-yellow-500"> Fibonacci</label>
                    <label class="flex items-center gap-2 text-xs"><input type="checkbox" id="cmp-halving" checked class="accent-orange-500"> Interval Halving</label>
                </div>
                <button class="btn-primary" onclick="ComparisonPage.runComparison()">
                    <i data-lucide="play" class="w-4 h-4"></i> Run All Selected
                </button>
            </div>

            <div class="grid md:grid-cols-2 gap-4">
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-3">Convergence Comparison</h4>
                    <div id="cmp-convergence" class="chart-container" style="height:400px"></div>
                </div>
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-3">Iteration Count</h4>
                    <div id="cmp-bars" class="chart-container" style="height:400px"></div>
                </div>
            </div>

            <div class="glass-card p-6">
                <h4 class="font-semibold mb-3">Results Summary</h4>
                <div class="overflow-x-auto" id="cmp-summary">
                    <p class="text-xs text-gray-500">Run comparison to see results</p>
                </div>
            </div>
        </div>
        `;
    },

    async runComparison() {
        const func = Utils.getFunc('cmp');
        const a = parseFloat(document.getElementById('cmp-a').value);
        const b = parseFloat(document.getElementById('cmp-b').value);
        const tol = parseFloat(document.getElementById('cmp-tol').value);
        const x0 = a + (b - a) * 0.7; // starting point for newton/secant

        const algorithms = [];
        const colors = ['#00f5ff', '#bf00ff', '#ff006e', '#00ff88', '#fbbf24', '#f97316'];
        const promises = [];
        const names = [];

        if (document.getElementById('cmp-bisection').checked) {
            promises.push(API.bisection(func, a, b, tol, 100));
            names.push('Bisection');
        }
        if (document.getElementById('cmp-newton').checked) {
            promises.push(API.newton(func, x0, tol, 100));
            names.push('Newton-Raphson');
        }
        if (document.getElementById('cmp-secant').checked) {
            promises.push(API.secant(func, a * 0.7, b * 0.7, tol, 100));
            names.push('Secant');
        }
        if (document.getElementById('cmp-golden').checked) {
            promises.push(API.goldenSection(func, a, b, tol));
            names.push('Golden Section');
        }
        if (document.getElementById('cmp-fibonacci').checked) {
            promises.push(API.fibonacci(func, a, b, 30));
            names.push('Fibonacci');
        }
        if (document.getElementById('cmp-halving').checked) {
            promises.push(API.intervalHalving(func, a, b, tol));
            names.push('Interval Halving');
        }

        if (promises.length === 0) {
            Utils.toast('Select at least one algorithm', 'warning');
            return;
        }

        try {
            const results = await Promise.all(promises);

            // Convergence plot
            const convTraces = results.map((res, idx) => {
                const iters = res.iterations;
                let errorVals;
                if (iters[0]?.interval_width !== undefined) {
                    errorVals = iters.map(it => it.interval_width);
                } else if (iters[0]?.df_x !== undefined) {
                    errorVals = iters.map(it => Math.abs(it.df_x));
                } else if (iters[0]?.df_curr !== undefined) {
                    errorVals = iters.map(it => Math.abs(it.df_curr));
                } else if (iters[0]?.df_mid !== undefined) {
                    errorVals = iters.map(it => Math.abs(it.df_mid));
                } else {
                    errorVals = iters.map((_, i) => 1 / (i + 1));
                }

                return {
                    x: iters.map(it => it.iteration),
                    y: errorVals,
                    type: 'scatter', mode: 'lines+markers',
                    name: names[idx],
                    line: { color: colors[idx % colors.length], width: 2 },
                    marker: { size: 4, color: colors[idx % colors.length] },
                };
            });

            Plotly.newPlot('cmp-convergence', convTraces, Utils.plotlyDarkLayout('Error Convergence', {
                xaxis: { title: 'Iteration' },
                yaxis: { title: 'Error / Interval Width', type: 'log' },
            }), Utils.plotlyConfig());

            // Bar chart
            Plotly.newPlot('cmp-bars', [{
                x: names,
                y: results.map(r => r.total_iterations),
                type: 'bar',
                marker: {
                    color: colors.slice(0, results.length),
                    line: { color: 'rgba(255,255,255,0.1)', width: 1 },
                },
                text: results.map(r => r.total_iterations),
                textposition: 'outside',
                textfont: { color: 'rgba(255,255,255,0.7)' },
            }], Utils.plotlyDarkLayout('Iterations Required', {
                xaxis: { title: '' },
                yaxis: { title: 'Iterations' },
            }), Utils.plotlyConfig());

            // Summary table
            let html = '<table class="data-table"><thead><tr><th>Algorithm</th><th>Result</th><th>f(x*)</th><th>Iterations</th><th>Converged</th></tr></thead><tbody>';
            results.forEach((r, i) => {
                html += `<tr>
                    <td><span style="color:${colors[i % colors.length]}">●</span> ${names[i]}</td>
                    <td>${Utils.fmt(r.result, 8)}</td>
                    <td>${Utils.fmt(r.f_result, 8)}</td>
                    <td>${r.total_iterations}</td>
                    <td><span class="badge ${r.converged ? 'badge-success' : 'badge-warning'}">${r.converged ? 'Yes' : 'No'}</span></td>
                </tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('cmp-summary').innerHTML = html;

            Utils.toast(`Compared ${results.length} algorithms`, 'success');
        } catch (e) {
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    /* ═══ 2D STARTING POINT ANALYSIS ══════════════════════════ */
    render_2d(el) {
        el.innerHTML = `
        <div class="space-y-4 stagger">
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-4">Starting Point Sensitivity Analysis</h4>
                <p class="text-xs text-gray-400 mb-4">
                    Run gradient descent from multiple starting points to see how initial conditions affect convergence.
                </p>
                <div class="grid sm:grid-cols-3 gap-3 mb-4">
                    <div>
                        <label class="form-label">Function</label>
                        <select id="sp-func" class="form-select" onchange="Utils.toggleCustomInput('sp')">
                            <option value="himmelblau">Himmelblau (4 minima)</option>
                            <option value="rosenbrock">Rosenbrock (narrow valley)</option>
                            <option value="rastrigin">Rastrigin (many local minima)</option>
                            ${Utils.customOption2D()}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Learning Rate</label>
                        <input id="sp-lr" type="number" class="form-input" value="0.005" step="0.001">
                    </div>
                    <div>
                        <label class="form-label">Grid Size (n×n starts)</label>
                        <select id="sp-grid" class="form-select">
                            <option value="3">3×3 (9 starts)</option>
                            <option value="4" selected>4×4 (16 starts)</option>
                            <option value="5">5×5 (25 starts)</option>
                        </select>
                    </div>
                </div>
                ${Utils.customInput2D('sp')}
                <button class="btn-primary" onclick="ComparisonPage.runStartingPoints()">
                    <i data-lucide="play" class="w-4 h-4"></i> Analyze All Starting Points
                </button>
            </div>

            <div class="glass-card p-6">
                <div id="sp-3d-plot" class="chart-container" style="height:550px">
                    <div class="flex items-center justify-center h-full text-gray-500 text-sm">Click "Analyze" to run</div>
                </div>
            </div>

            <div class="glass-card p-6">
                <div id="sp-contour-plot" class="chart-container" style="height:450px"></div>
            </div>

            <div class="glass-card p-6">
                <h4 class="font-semibold mb-3">Results by Starting Point</h4>
                <div class="overflow-x-auto" id="sp-table">
                    <p class="text-xs text-gray-500">Run analysis to see results</p>
                </div>
            </div>
        </div>
        `;
    },

    async runStartingPoints() {
        const func = Utils.getFunc('sp');
        const lr = parseFloat(document.getElementById('sp-lr').value);
        const gridSize = parseInt(document.getElementById('sp-grid').value);

        try {
            const surface = await API.getSurface(func, 50);
            const domain = surface.domain;

            // Generate starting points
            const starts = [];
            const margin = 0.2;
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const x = domain[0][0] * (1 - margin) + (domain[0][1] * (1 - margin) - domain[0][0] * (1 - margin)) * i / (gridSize - 1);
                    const y = domain[1][0] * (1 - margin) + (domain[1][1] * (1 - margin) - domain[1][0] * (1 - margin)) * j / (gridSize - 1);
                    starts.push([x, y]);
                }
            }

            // Run all in parallel (batches)
            const allResults = await Promise.all(
                starts.map(([x, y]) => API.gradientDescent(func, x, y, lr, 500, 1e-8))
            );

            const pathColors = [
                '#00f5ff', '#bf00ff', '#ff006e', '#00ff88', '#fbbf24', '#f97316',
                '#ef4444', '#a78bfa', '#67e8f9', '#f472b6', '#34d399', '#fcd34d',
                '#fb923c', '#c084fc', '#22d3ee', '#f87171', '#4ade80', '#facc15',
                '#2dd4bf', '#e879f9', '#38bdf8', '#fb7185', '#a3e635', '#fde047',
                '#818cf8',
            ];

            // 3D plot
            const traces = [{
                type: 'surface', x: surface.x, y: surface.y, z: surface.z,
                colorscale: Utils.neonColorscale(), opacity: 0.6, showscale: false,
            }];

            allResults.forEach((res, idx) => {
                const path = res.path;
                if (path.length < 2) return;
                const color = pathColors[idx % pathColors.length];
                traces.push({
                    type: 'scatter3d', mode: 'lines',
                    x: path.map(p => p.x), y: path.map(p => p.y), z: path.map(p => p.f),
                    line: { color, width: 3 },
                    name: `(${starts[idx][0].toFixed(1)}, ${starts[idx][1].toFixed(1)})`,
                    showlegend: false,
                });
                traces.push({
                    type: 'scatter3d', mode: 'markers',
                    x: [path[0].x], y: [path[0].y], z: [path[0].f],
                    marker: { size: 4, color },
                    showlegend: false,
                });
            });

            Plotly.newPlot('sp-3d-plot', traces, Utils.plotlyDarkLayout(surface.name + ' — Multi-Start Gradient Descent', {
                scene: { camera: { eye: { x: 1.5, y: 1.5, z: 1 } } },
            }), Utils.plotlyConfig());

            // Contour + paths
            const contourTraces = [{
                type: 'contour', x: surface.x, y: surface.y, z: surface.z,
                colorscale: Utils.neonColorscale(), ncontours: 30,
                showscale: false, contours: { coloring: 'heatmap' }, opacity: 0.6,
            }];

            allResults.forEach((res, idx) => {
                const path = res.path;
                const color = pathColors[idx % pathColors.length];
                contourTraces.push({
                    type: 'scatter', mode: 'lines+markers',
                    x: path.map(p => p.x), y: path.map(p => p.y),
                    line: { color, width: 1.5 },
                    marker: { size: 2, color },
                    showlegend: false,
                });
            });

            Plotly.newPlot('sp-contour-plot', contourTraces, Utils.plotlyDarkLayout('Contour — All Paths', {
                xaxis: { title: 'x', scaleanchor: 'y' }, yaxis: { title: 'y' },
            }), Utils.plotlyConfig());

            // Table
            let html = '<table class="data-table"><thead><tr><th>#</th><th>Start (x₀, y₀)</th><th>End (x*, y*)</th><th>f(x*)</th><th>Iterations</th><th>Converged</th></tr></thead><tbody>';
            allResults.forEach((r, i) => {
                html += `<tr>
                    <td><span style="color:${pathColors[i % pathColors.length]}">●</span> ${i + 1}</td>
                    <td>(${starts[i][0].toFixed(2)}, ${starts[i][1].toFixed(2)})</td>
                    <td>(${Utils.fmt(r.result.x, 4)}, ${Utils.fmt(r.result.y, 4)})</td>
                    <td>${Utils.fmt(r.f_result, 6)}</td>
                    <td>${r.total_iterations}</td>
                    <td><span class="badge ${r.converged ? 'badge-success' : 'badge-warning'}">${r.converged ? 'Yes' : 'No'}</span></td>
                </tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('sp-table').innerHTML = html;

            Utils.toast(`Analyzed ${allResults.length} starting points`, 'success');
        } catch (e) {
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    /* ═══ PERFORMANCE LEADERBOARD ══════════════════════════════ */
    render_leaderboard(el) {
        el.innerHTML = `
        <div class="space-y-4 stagger">
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-4">Algorithm Performance Rankings</h4>
                <p class="text-xs text-gray-400 mb-4">
                    Compare algorithms across speed, accuracy, and reliability metrics.
                </p>
                <div class="grid sm:grid-cols-3 gap-3 mb-4">
                    <div>
                        <label class="form-label">Function</label>
                        <select id="lb-func" class="form-select" onchange="Utils.toggleCustomInput('lb')">
                            <option value="quadratic">Quadratic (easy)</option>
                            <option value="cubic">Cubic (moderate)</option>
                            <option value="polynomial" selected>Polynomial (hard)</option>
                            ${Utils.customOption1D()}
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Search Interval</label>
                        <select id="lb-interval" class="form-select">
                            <option value="narrow">Narrow [-2, 2]</option>
                            <option value="medium" selected>Medium [-5, 5]</option>
                            <option value="wide">Wide [-10, 10]</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Tolerance</label>
                        <input id="lb-tol" type="number" class="form-input" value="0.000001" step="0.000001">
                    </div>
                </div>
                ${Utils.customInput1D('lb')}
                <button class="btn-primary" onclick="ComparisonPage.benchmarkAll()">
                    <i data-lucide="zap" class="w-4 h-4"></i> Run All Benchmarks
                </button>
            </div>

            <div class="grid lg:grid-cols-2 gap-4">
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-3">⚡ Speed Ranking</h4>
                    <div id="lb-speed" class="chart-container" style="height:400px"></div>
                </div>
                <div class="glass-card p-6">
                    <h4 class="font-semibold mb-3">🎯 Accuracy Ranking</h4>
                    <div id="lb-accuracy" class="chart-container" style="height:400px"></div>
                </div>
            </div>

            <div class="glass-card p-6">
                <h4 class="font-semibold mb-3">📊 Overall Leaderboard</h4>
                <div class="overflow-x-auto" id="lb-table">
                    <p class="text-xs text-gray-500">Run benchmarks to see rankings</p>
                </div>
            </div>

            <div class="glass-card p-6">
                <div class="flex items-center justify-between mb-4">
                    <h4 class="font-semibold">Export Options</h4>
                </div>
                <div class="flex flex-wrap gap-2">
                    <button class="btn-secondary text-xs" onclick="ExportUtils.exportTableAsCSV(document.querySelector('#lb-table table'), 'algorithm-leaderboard.csv')">
                        <i data-lucide="download" class="w-3 h-3"></i> Export CSV
                    </button>
                    <button class="btn-secondary text-xs" onclick="ExportUtils.exportPlotlyAsPNG('lb-speed', 'speed-ranking.png')">
                        <i data-lucide="image" class="w-3 h-3"></i> Speed Chart
                    </button>
                    <button class="btn-secondary text-xs" onclick="ExportUtils.exportPlotlyAsPNG('lb-accuracy', 'accuracy-ranking.png')">
                        <i data-lucide="image" class="w-3 h-3"></i> Accuracy Chart
                    </button>
                </div>
            </div>
        </div>
        `;
    },

    async benchmarkAll() {
        const func = Utils.getFunc('lb');
        const intervals = { narrow: [-2, 2], medium: [-5, 5], wide: [-10, 10] };
        const [a, b] = intervals[document.getElementById('lb-interval').value];
        const tol = parseFloat(document.getElementById('lb-tol').value);
        const x0 = a + (b - a) * 0.7;

        Utils.toast('Benchmarking all algorithms...', 'info');

        const algorithms = [
            { name: 'Bisection', api: () => API.bisection(func, a, b, tol, 100) },
            { name: 'Golden Section', api: () => API.goldenSection(func, a, b, tol) },
            { name: 'Fibonacci', api: () => API.fibonacci(func, a, b, 30) },
            { name: 'Interval Halving', api: () => API.intervalHalving(func, a, b, tol) },
            { name: 'Newton-Raphson', api: () => API.newton(func, x0, tol, 100) },
            { name: 'Secant', api: () => API.secant(func, a * 0.7, b * 0.7, tol, 100) },
        ];

        try {
            const results = await Promise.all(
                algorithms.map(async (algo) => {
                    const start = performance.now();
                    const result = await algo.api();
                    const time = performance.now() - start;
                    return {
                        name: algo.name,
                        time,
                        iterations: result.total_iterations,
                        result: result.result,
                        converged: result.converged,
                        error: Math.abs(result.f_result),
                    };
                })
            );

            // Sort by metrics
            const bySpeed = [...results].sort((a, b) => a.time - b.time);
            const byAccuracy = [...results].sort((a, b) => a.error - b.error);

            // Speed chart
            Plotly.newPlot('lb-speed', [{
                x: bySpeed.map(r => r.name),
                y: bySpeed.map(r => r.time),
                type: 'bar',
                marker: { color: '#00f5ff' },
                text: bySpeed.map(r => r.time.toFixed(1) + 'ms'),
                textposition: 'outside',
            }], Utils.plotlyDarkLayout('Execution Time (ms)', {
                xaxis: { title: '' },
                yaxis: { title: 'Time (ms)' },
            }), Utils.plotlyConfig());

            // Accuracy chart
            Plotly.newPlot('lb-accuracy', [{
                x: byAccuracy.map(r => r.name),
                y: byAccuracy.map(r => r.error),
                type: 'bar',
                marker: { color: '#bf00ff' },
                text: byAccuracy.map(r => r.error.toExponential(2)),
                textposition: 'outside',
            }], Utils.plotlyDarkLayout('Absolute Error', {
                xaxis: { title: '' },
                yaxis: { title: 'Error (log)', type: 'log' },
            }), Utils.plotlyConfig());

            // Leaderboard table with scoring
            let html = '<table class="data-table"><thead><tr><th>Rank</th><th>Algorithm</th><th>Speed</th><th>Accuracy</th><th>Iterations</th><th>Converged</th><th>Score</th></tr></thead><tbody>';
            results.forEach((r, idx) => {
                const speedRank = bySpeed.findIndex(x => x.name === r.name) + 1;
                const accuracyRank = byAccuracy.findIndex(x => x.name === r.name) + 1;
                const score = (1/speedRank + 1/accuracyRank).toFixed(2);
                const medal = ['🥇', '🥈', '🥉'][idx] || '•';
                html += `<tr>
                    <td>${medal}</td>
                    <td>${r.name}</td>
                    <td>${r.time.toFixed(2)}ms (${speedRank})</td>
                    <td>${r.error.toExponential(2)} (${accuracyRank})</td>
                    <td>${r.iterations}</td>
                    <td><span class="badge ${r.converged ? 'badge-success' : 'badge-warning'}">${r.converged ? 'Yes' : 'No'}</span></td>
                    <td><strong>${score}</strong></td>
                </tr>`;
            });
            html += '</tbody></table>';
            document.getElementById('lb-table').innerHTML = html;

            Utils.toast('Benchmarks complete!', 'success');
        } catch (e) {
            Utils.toast('Benchmark error: ' + e.message, 'error');
        }
    },

    /* ═══ AUTO DEMO TAB ════════════════════════════════════════ */
    render_demo(el) {
        el.innerHTML = `
        <div class="space-y-4 stagger">
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-4">Automated Algorithm Demonstration</h4>
                <p class="text-xs text-gray-400 mb-4">
                    Watch algorithms automatically solve optimization problems with real-time visualization.
                </p>
                <div class="flex flex-wrap gap-2">
                    <button class="btn-primary" onclick="ComparisonPage.toggleDemo1D()" id="demo-1d-btn">
                        <i data-lucide="play" class="w-4 h-4"></i> <span id="demo-1d-label">Start 1D Demo</span>
                    </button>
                    <button class="btn-neon" onclick="ComparisonPage.toggleDemo2D()" id="demo-2d-btn">
                        <i data-lucide="play" class="w-4 h-4"></i> <span id="demo-2d-label">Start 2D Demo</span>
                    </button>
                    <button class="btn-secondary" onclick="ComparisonPage.toggleFullTour()" id="demo-tour-btn">
                        <i data-lucide="play" class="w-4 h-4"></i> <span id="demo-tour-label">Full Tour</span>
                    </button>
                    <button class="btn-secondary text-xs" onclick="ComparisonPage.recordDemo()" id="record-demo-btn">
                        <i data-lucide="video" class="w-4 h-4"></i> Record Demo
                    </button>
                </div>
            </div>

            <div id="demo-container" class="space-y-4"></div>
        </div>
        `;

        // Initialize button UI and icons after render
        setTimeout(() => {
            try {
                lucide.createIcons();
            } catch (e) {
                console.warn('Lucide init error:', e);
            }
        }, 100);
    },

    toggleDemo1D() {
        try {
            if (AutoDemo.isRunning) {
                AutoDemo.stopDemo();
            } else {
                AutoDemo.startDemo1D();
            }
        } catch (e) {
            console.error('Toggle 1D error:', e);
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    toggleDemo2D() {
        try {
            if (AutoDemo.isRunning) {
                AutoDemo.stopDemo();
            } else {
                AutoDemo.startDemo2D();
            }
        } catch (e) {
            console.error('Toggle 2D error:', e);
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    toggleFullTour() {
        try {
            if (AutoDemo.isRunning) {
                AutoDemo.stopDemo();
            } else {
                AutoDemo.startFullTour();
            }
        } catch (e) {
            console.error('Toggle Tour error:', e);
            Utils.toast('Error: ' + e.message, 'error');
        }
    },

    recordingStartTime: 0,
    isRecordingDemo: false,

    async recordDemo() {
        const demoCanvas = document.createElement('canvas');
        demoCanvas.width = window.innerWidth * 0.8;
        demoCanvas.height = window.innerHeight * 0.8;
        document.body.appendChild(demoCanvas);

        const success = await RecordingUtils.startCanvasRecording(demoCanvas, 30);
        if (!success) return;

        this.isRecordingDemo = true;
        this.recordingStartTime = performance.now();
        document.getElementById('record-demo-btn').textContent = '⏹ Stop Recording';

        // Update recording time display
        const updateTimer = setInterval(() => {
            const elapsed = Math.floor((performance.now() - this.recordingStartTime) / 1000);
            document.getElementById('record-demo-btn').textContent = `⏹ ${RecordingUtils.formatRecordingTime(elapsed)}`;
        }, 100);

        // Run demo and stop recording after
        await AutoDemo.startFullTour();
        await Utils.sleep(1000);

        await RecordingUtils.stopCanvasRecording('optimization-demo.webm');
        clearInterval(updateTimer);
        this.isRecordingDemo = false;
        document.getElementById('record-demo-btn').textContent = '⏸ Record Demo';
        document.body.removeChild(demoCanvas);
    },
};
