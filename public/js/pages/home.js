/* ═════════════════════════════════════════════════════════════
   HOME PAGE
   ═════════════════════════════════════════════════════════════ */

const HomePage = {
    render() {
        return `
        <div class="page-enter space-y-8">
            <!-- Hero -->
            <div class="glass-card p-8 md:p-12 relative overflow-hidden">
                <div class="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                <div class="relative z-10 max-w-3xl">
                    <div class="flex items-center gap-2 mb-4">
                        <span class="badge badge-info">v1.0</span>
                        <span class="text-xs text-gray-400">Optimization Course Visual Lab</span>
                    </div>
                    <h1 class="hero-title mb-4">Optimization<br>Techniques Lab</h1>
                    <p class="text-gray-400 text-sm leading-relaxed max-w-xl mb-6">
                        Explore optimization algorithms interactively. Visualize gradient descent on 3D surfaces,
                        compare convergence rates, and build intuition for classical methods — all in real time.
                    </p>
                    <div class="flex flex-wrap gap-3">
                        <button class="btn-primary" onclick="App.navigate('playground')">
                            <i data-lucide="box" class="w-4 h-4"></i>
                            Explore 3D Surfaces
                        </button>
                        <button class="btn-secondary" onclick="App.navigate('algorithms')">
                            <i data-lucide="play-circle" class="w-4 h-4"></i>
                            Run Algorithms
                        </button>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 stagger">
                <div class="glass-card stat-card p-5">
                    <div class="text-xs text-gray-400 mb-1">Algorithms</div>
                    <div class="text-2xl font-bold neon-text-cyan">8</div>
                    <div class="text-[10px] text-gray-500 mt-1">Classical methods</div>
                </div>
                <div class="glass-card stat-card p-5">
                    <div class="text-xs text-gray-400 mb-1">Functions</div>
                    <div class="text-2xl font-bold neon-text-purple">10</div>
                    <div class="text-[10px] text-gray-500 mt-1">1D & 2D test functions</div>
                </div>
                <div class="glass-card stat-card p-5">
                    <div class="text-xs text-gray-400 mb-1">Visualizations</div>
                    <div class="text-2xl font-bold neon-text-green">3D</div>
                    <div class="text-[10px] text-gray-500 mt-1">Interactive surfaces</div>
                </div>
                <div class="glass-card stat-card p-5">
                    <div class="text-xs text-gray-400 mb-1">Concepts</div>
                    <div class="text-2xl font-bold neon-text-pink">12+</div>
                    <div class="text-[10px] text-gray-500 mt-1">Visual explanations</div>
                </div>
            </div>

            <!-- Feature Sections -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                <!-- Unit 1 -->
                <div class="glass-card p-6 cursor-pointer" onclick="App.navigate('concepts')">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-500/5 flex items-center justify-center mb-4">
                        <i data-lucide="book-open" class="w-5 h-5 text-cyan-400"></i>
                    </div>
                    <h3 class="font-semibold mb-2">Unit 1: Foundations</h3>
                    <p class="text-xs text-gray-400 leading-relaxed mb-3">
                        Problem identification, classification of optimization, vector calculus, convexity analysis.
                    </p>
                    <div class="flex flex-wrap gap-1">
                        <span class="concept-tag linear">Linear</span>
                        <span class="concept-tag convex">Convex</span>
                        <span class="concept-tag nonlinear">Non-linear</span>
                    </div>
                </div>

                <!-- Unit 2 -->
                <div class="glass-card p-6 cursor-pointer" onclick="App.navigate('algorithms')">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-500/5 flex items-center justify-center mb-4">
                        <i data-lucide="play-circle" class="w-5 h-5 text-purple-400"></i>
                    </div>
                    <h3 class="font-semibold mb-2">Unit 2: Classical Methods</h3>
                    <p class="text-xs text-gray-400 leading-relaxed mb-3">
                        Bisection, Newton-Raphson, Secant, Golden Section, Fibonacci Search, and more.
                    </p>
                    <div class="flex flex-wrap gap-1">
                        <span class="badge badge-info">8 Algorithms</span>
                        <span class="badge badge-success">Animated</span>
                    </div>
                </div>

                <!-- Playground -->
                <div class="glass-card p-6 cursor-pointer" onclick="App.navigate('playground')">
                    <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center mb-4">
                        <i data-lucide="box" class="w-5 h-5 text-green-400"></i>
                    </div>
                    <h3 class="font-semibold mb-2">3D Playground</h3>
                    <p class="text-xs text-gray-400 leading-relaxed mb-3">
                        Explore Rosenbrock, Himmelblau, Rastrigin surfaces. Rotate, zoom, and trace optimization paths.
                    </p>
                    <div class="flex flex-wrap gap-1">
                        <span class="badge badge-info">Interactive</span>
                        <span class="badge badge-success">Real-time</span>
                    </div>
                </div>
            </div>

            <!-- Live Demo -->
            <div class="glass-card p-6">
                <div class="section-header">
                    <div class="section-icon bg-gradient-to-br from-cyan-500/20 to-purple-500/20">
                        <i data-lucide="activity" class="w-5 h-5 text-cyan-400"></i>
                    </div>
                    <div>
                        <h3 class="section-title">Live Preview</h3>
                        <p class="section-desc">Rosenbrock function with gradient descent path</p>
                    </div>
                </div>
                <div id="home-demo-plot" class="chart-container" style="height:450px"></div>
            </div>
        </div>
        `;
    },

    async init() {
        try {
            const [surface, descent] = await Promise.all([
                API.getSurface('rosenbrock', 50),
                API.gradientDescent('rosenbrock', -1.5, 2.0, 0.001, 500, 1e-8),
            ]);

            const path = descent.path;
            const traces = [
                {
                    type: 'surface',
                    x: surface.x, y: surface.y, z: surface.z,
                    colorscale: Utils.neonColorscale(),
                    opacity: 0.85,
                    showscale: false,
                    contours: {
                        z: { show: true, usecolormap: true, highlightcolor: '#ffffff', project: { z: true } }
                    },
                },
                {
                    type: 'scatter3d',
                    mode: 'lines+markers',
                    x: path.map(p => p.x),
                    y: path.map(p => p.y),
                    z: path.map(p => p.f),
                    line: { color: '#00f5ff', width: 4 },
                    marker: { size: 2, color: '#00f5ff' },
                    name: 'Gradient Descent Path',
                },
                {
                    type: 'scatter3d',
                    mode: 'markers',
                    x: [path[0].x], y: [path[0].y], z: [path[0].f],
                    marker: { size: 6, color: '#ff006e', symbol: 'diamond' },
                    name: 'Start',
                },
                {
                    type: 'scatter3d',
                    mode: 'markers',
                    x: [path[path.length-1].x], y: [path[path.length-1].y], z: [path[path.length-1].f],
                    marker: { size: 6, color: '#00ff88', symbol: 'diamond' },
                    name: 'End',
                },
            ];

            const layout = Utils.plotlyDarkLayout('Rosenbrock Function — Gradient Descent', {
                scene: {
                    camera: { eye: { x: 1.5, y: 1.5, z: 1.2 } },
                    xaxis: { title: 'x' },
                    yaxis: { title: 'y' },
                    zaxis: { title: 'f(x,y)' },
                },
            });

            Plotly.newPlot('home-demo-plot', traces, layout, Utils.plotlyConfig());
        } catch (e) {
            document.getElementById('home-demo-plot').innerHTML =
                '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Start the backend server to see the live demo</div>';
        }
    },
};
