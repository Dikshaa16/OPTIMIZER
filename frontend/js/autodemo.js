/* ═════════════════════════════════════════════════════════════
   AUTO DEMO MODE — Automatic Algorithm Demonstration
   ═════════════════════════════════════════════════════════════ */

const AutoDemo = {
    isRunning: false,
    currentAlgorithm: 0,
    algorithms: [
        { name: 'Bisection', func: 'quadratic', type: '1d' },
        { name: 'Newton-Raphson', func: 'cubic', type: '1d' },
        { name: 'Golden Section', func: 'polynomial', type: '1d' },
        { name: 'Gradient Descent', func: 'rosenbrock', type: '2d' },
        { name: 'Contour Analysis', func: 'himmelblau', type: '2d' },
    ],

    /**
     * Run a single 1D algorithm demo
     */
    async runSingleDemo1D(demoIndex) {
        const algos = [
            { name: 'Bisection', api: API.bisection, params: { a: -5, b: 5, tol: 0.0001, maxIter: 100 } },
            { name: 'Newton-Raphson', api: API.newton, params: { x0: 4, tol: 0.0001, maxIter: 100 } },
            { name: 'Golden Section', api: API.goldenSection, params: { a: -5, b: 5, tol: 0.0001 } },
        ];

        const algo = algos[demoIndex];
        const func = 'quadratic';

        Utils.toast(`Running: ${algo.name}`, 'info');

        try {
            let result;
            if (demoIndex === 0) {
                result = await API.bisection(func, algo.params.a, algo.params.b, algo.params.tol, algo.params.maxIter);
            } else if (demoIndex === 1) {
                result = await API.newton(func, algo.params.x0, algo.params.tol, algo.params.maxIter);
            } else {
                result = await API.goldenSection(func, algo.params.a, algo.params.b, algo.params.tol);
            }

            this.visualizeConvergence1D(result, algo.name);
        } catch (err) {
            console.error('1D Demo error:', err);
            Utils.toast('Error: ' + err.message, 'error');
        }
    },

    /**
     * Run a single 2D algorithm demo
     */
    async runSingleDemo2D() {
        const functions = ['rosenbrock', 'himmelblau', 'rastrigin'];
        const func = functions[Math.floor(Math.random() * functions.length)];

        Utils.toast(`Running: Gradient Descent on ${func}`, 'info');

        try {
            const x0 = (Math.random() - 0.5) * 4;
            const y0 = (Math.random() - 0.5) * 4;

            const result = await API.gradientDescent(func, x0, y0, 0.01, 200, 0.001);
            const surface = await API.getSurface(func, 60);
            const trajectory = result.iterations.map((it, idx) => ({
                x: it.x,
                y: it.y,
                iteration: idx,
                value: it.f_x
            }));

            this.visualizeDemo2D(surface, trajectory, func);
        } catch (err) {
            console.error('2D Demo error:', err);
            Utils.toast('Error: ' + err.message, 'error');
        }
    },

    /**
     * Start 1D demo loop
     */
    async startDemo1D() {
        this.isRunning = true;
        this.updateDemoUI();

        try {
            for (let i = 0; i < 5 && this.isRunning; i++) {
                const demoIndex = i % 3;
                await this.runSingleDemo1D(demoIndex);
                if (this.isRunning) {
                    await Utils.sleep(2500);
                }
            }
            this.isRunning = false;
            this.updateDemoUI();
            Utils.toast('1D Demo complete!', 'success');
        } catch (err) {
            console.error('Demo error:', err);
            this.isRunning = false;
            this.updateDemoUI();
        }
    },

    /**
     * Start 2D demo loop
     */
    async startDemo2D() {
        this.isRunning = true;
        this.updateDemoUI();

        try {
            for (let i = 0; i < 5 && this.isRunning; i++) {
                await this.runSingleDemo2D();
                if (this.isRunning) {
                    await Utils.sleep(3500);
                }
            }
            this.isRunning = false;
            this.updateDemoUI();
            Utils.toast('2D Demo complete!', 'success');
        } catch (err) {
            console.error('Demo error:', err);
            this.isRunning = false;
            this.updateDemoUI();
        }
    },

    /**
     * Visualize 1D convergence
     */
    visualizeConvergence1D(result, algoName) {
        const container = document.getElementById('demo-convergence') || 
                         this.createDemoContainer('1D Convergence', 'demo-convergence');

        const iters = result.iterations;
        let errorVals = iters.map((it, idx) => {
            if (it.interval_width !== undefined) return it.interval_width;
            if (it.df_x !== undefined) return Math.abs(it.df_x);
            return 1 / (idx + 1);
        });

        Plotly.newPlot(container.id, [{
            x: iters.map(it => it.iteration),
            y: errorVals,
            type: 'scatter',
            mode: 'lines+markers',
            name: algoName,
            line: { color: '#00f5ff', width: 3 },
            marker: { size: 5, color: '#00f5ff' },
        }], Utils.plotlyDarkLayout('Convergence: ' + algoName, {
            xaxis: { title: 'Iteration' },
            yaxis: { title: 'Error', type: 'log' },
        }), Utils.plotlyConfig());
    },

    /**
     * Visualize 2D trajectory on surface
     */
    visualizeDemo2D(surface, trajectory, funcName) {
        const container = document.getElementById('demo-surface') || 
                         this.createDemoContainer('2D Surface with Trajectory', 'demo-surface');

        const z = surface.surface_data;
        const x_range = Array.from({length: z[0].length}, (_, i) => surface.x_min + (surface.x_max - surface.x_min) * i / (z[0].length - 1));
        const y_range = Array.from({length: z.length}, (_, i) => surface.y_min + (surface.y_max - surface.y_min) * i / (z.length - 1));

        Plotly.newPlot(container.id, [
            {
                x: x_range,
                y: y_range,
                z: z,
                type: 'surface',
                colorscale: 'Viridis',
                opacity: 0.8,
                showscale: false,
            },
            {
                x: trajectory.map(t => t.x),
                y: trajectory.map(t => t.y),
                z: trajectory.map(t => t.value),
                type: 'scatter3d',
                mode: 'lines+markers',
                line: { color: '#ff006e', width: 4 },
                marker: { size: 4, color: '#ff006e' },
                name: 'Trajectory',
            }
        ], Utils.plotlyDarkLayout(funcName, {
            scene: { xaxis: {title: 'x'}, yaxis: {title: 'y'}, zaxis: {title: 'f(x,y)'} }
        }), Utils.plotlyConfig());
    },

    /**
     * Create demo container if needed
     */
    createDemoContainer(title, id) {
        let container = document.getElementById(id);
        if (!container) {
            const demoSection = document.getElementById('demo-section') || this.createDemoSection();
            container = document.createElement('div');
            container.id = id;
            container.className = 'glass-card p-6';
            container.innerHTML = `<h4 class="font-semibold mb-3">${title}</h4><div id="${id}-plot" class="chart-container" style="height:500px"></div>`;
            demoSection.appendChild(container);
        }
        return document.getElementById(id + '-plot');
    },

    /**
     * Create demo section
     */
    createDemoSection() {
        let section = document.getElementById('demo-section');
        if (!section) {
            const pageContainer = document.getElementById('page-container');
            section = document.createElement('div');
            section.id = 'demo-section';
            section.className = 'mt-8 space-y-4';
            pageContainer.appendChild(section);
        }
        return section;
    },

    /**
     * Stop demo
     */
    stopDemo() {
        this.isRunning = false;
        this.currentAlgorithm = 0;
        this.updateDemoUI();
        Utils.toast('Demo stopped', 'info');
    },

    /**
     * Update demo button UI based on running state
     */
    updateDemoUI() {
        const buttons = {
            '1d': document.getElementById('demo-1d-btn'),
            '2d': document.getElementById('demo-2d-btn'),
            'tour': document.getElementById('demo-tour-btn'),
        };

        const labels = {
            '1d': document.getElementById('demo-1d-label'),
            '2d': document.getElementById('demo-2d-label'),
            'tour': document.getElementById('demo-tour-label'),
        };

        Object.entries(buttons).forEach(([key, btn]) => {
            if (!btn || !labels[key]) return;
            
            try {
                const icon = btn.querySelector('i');
                
                if (this.isRunning) {
                    btn.classList.remove('btn-primary', 'btn-neon', 'btn-secondary');
                    btn.classList.add('btn-danger');
                    if (icon) {
                        icon.setAttribute('data-lucide', 'stop-circle');
                    }
                    labels[key].textContent = 'Stop Demo';
                } else {
                    btn.classList.remove('btn-danger');
                    if (key === '1d') {
                        btn.classList.add('btn-primary');
                        if (icon) icon.setAttribute('data-lucide', 'play');
                        labels[key].textContent = 'Start 1D Demo';
                    } else if (key === '2d') {
                        btn.classList.add('btn-neon');
                        if (icon) icon.setAttribute('data-lucide', 'play');
                        labels[key].textContent = 'Start 2D Demo';
                    } else {
                        btn.classList.add('btn-secondary');
                        if (icon) icon.setAttribute('data-lucide', 'play');
                        labels[key].textContent = 'Full Tour';
                    }
                }
            } catch (e) {
                console.warn('Error updating button:', key, e);
            }
        });

        // Re-initialize Lucide icons if available
        if (typeof lucide !== 'undefined' && lucide.createIcons) {
            setTimeout(() => {
                try {
                    lucide.createIcons();
                } catch (e) {
                    console.warn('Lucide error:', e);
                }
            }, 50);
        }
    },

    /**
     * Start full automated tour
     */
    async startFullTour() {
        this.isRunning = true;
        this.updateDemoUI();
        Utils.toast('Starting full optimization tour...', 'info');

        try {
            // Run 1D demos
            for (let i = 0; i < 3 && this.isRunning; i++) {
                await this.runSingleDemo1D(i % 3);
                if (this.isRunning) {
                    await Utils.sleep(2500);
                }
            }

            if (!this.isRunning) {
                this.updateDemoUI();
                return;
            }

            await Utils.sleep(1000);

            // Run 2D demos
            for (let i = 0; i < 3 && this.isRunning; i++) {
                await this.runSingleDemo2D();
                if (this.isRunning) {
                    await Utils.sleep(3500);
                }
            }

            this.isRunning = false;
            this.updateDemoUI();
            Utils.toast('Tour complete!', 'success');
        } catch (err) {
            console.error('Tour error:', err);
            this.isRunning = false;
            this.updateDemoUI();
        }
    }
};
