/* ═════════════════════════════════════════════════════════════
   3D GRAPH PLAYGROUND
   ═════════════════════════════════════════════════════════════ */

const PlaygroundPage = {
    render() {
        return `
        <div class="page-enter space-y-6">
            <div class="grid lg:grid-cols-4 gap-4">
                <!-- Controls -->
                <div class="glass-card p-6 space-y-4">
                    <h4 class="font-semibold">Surface Controls</h4>
                    <div>
                        <label class="form-label">Function</label>
                        <select id="pg-func" class="form-select" onchange="Utils.toggleCustomInput('pg'); PlaygroundPage.loadSurface()">
                            <option value="paraboloid">Paraboloid</option>
                            <option value="rosenbrock" selected>Rosenbrock</option>
                            <option value="himmelblau">Himmelblau</option>
                            <option value="rastrigin">Rastrigin</option>
                            <option value="beale">Beale</option>
                            <option value="booth">Booth</option>
                            ${Utils.customOption2D()}
                        </select>
                    </div>
                    ${Utils.customInput2D('pg')}
                    <div>
                        <label class="form-label">Color Theme</label>
                        <select id="pg-colorscale" class="form-select" onchange="PlaygroundPage.loadSurface()">
                            <option value="neon">Neon</option>
                            <option value="cool">Cool</option>
                            <option value="surface">Spectrum</option>
                            <option value="Viridis">Viridis</option>
                            <option value="Plasma">Plasma</option>
                            <option value="Inferno">Inferno</option>
                            <option value="Hot">Hot</option>
                            <option value="Electric">Electric</option>
                        </select>
                    </div>
                    <div>
                        <label class="form-label">Resolution: <span id="pg-res-val">60</span></label>
                        <input id="pg-res" type="range" class="form-range" min="20" max="100" value="60" oninput="document.getElementById('pg-res-val').textContent=this.value">
                    </div>
                    <div>
                        <label class="form-label">Opacity: <span id="pg-opacity-val">0.90</span></label>
                        <input id="pg-opacity" type="range" class="form-range" min="0.3" max="1" step="0.05" value="0.9" oninput="document.getElementById('pg-opacity-val').textContent=parseFloat(this.value).toFixed(2)">
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="pg-contours" checked class="accent-cyan-500" onchange="PlaygroundPage.loadSurface()">
                        <label class="text-xs text-gray-400" for="pg-contours">Show Contours</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <input type="checkbox" id="pg-wireframe" class="accent-cyan-500" onchange="PlaygroundPage.loadSurface()">
                        <label class="text-xs text-gray-400" for="pg-wireframe">Wireframe</label>
                    </div>
                    <button class="btn-primary w-full" onclick="PlaygroundPage.loadSurface()">
                        <i data-lucide="refresh-cw" class="w-4 h-4"></i> Refresh
                    </button>

                    <hr class="border-white/5">

                    <h4 class="font-semibold">Overlay Gradient Descent</h4>
                    <div class="grid grid-cols-2 gap-2">
                        <div><label class="form-label">x₀</label><input id="pg-x0" type="number" class="form-input" value="-1.5" step="0.5"></div>
                        <div><label class="form-label">y₀</label><input id="pg-y0" type="number" class="form-input" value="2" step="0.5"></div>
                    </div>
                    <div>
                        <label class="form-label">Learning Rate: <span id="pg-lr-val">0.0010</span></label>
                        <input id="pg-lr" type="range" class="form-range" min="0.0001" max="0.1" step="0.0001" value="0.001" oninput="document.getElementById('pg-lr-val').textContent=parseFloat(this.value).toFixed(4)">
                    </div>
                    <button class="btn-neon w-full" onclick="PlaygroundPage.overlayGD()">
                        <i data-lucide="trending-down" class="w-4 h-4"></i> Run & Overlay
                    </button>

                    <hr class="border-white/5">

                    <h4 class="font-semibold text-xs">Export Options</h4>
                    <div class="space-y-1">
                        <button class="btn-secondary w-full text-xs" onclick="ExportUtils.exportPlotlyAsPNG('pg-plot', 'surface-3d.png')">
                            <i data-lucide="image" class="w-3 h-3"></i> 3D Surface PNG
                        </button>
                        <button class="btn-secondary w-full text-xs" onclick="ExportUtils.exportPlotlyAsPNG('pg-contour-plot', 'contour-map.png')">
                            <i data-lucide="map" class="w-3 h-3"></i> Contour Map
                        </button>
                        <button class="btn-secondary w-full text-xs" onclick="ExportUtils.exportPlotlyAsPNG('pg-gradient-plot', 'gradient-field.png')">
                            <i data-lucide="arrow-up-right" class="w-3 h-3"></i> Gradient Field
                        </button>
                    </div>
                </div>

                <!-- Main Plot -->
                <div class="lg:col-span-3 glass-card p-6">
                    <div id="pg-plot" class="chart-container" style="height:620px"></div>
                    <div id="pg-info" class="mt-3 flex flex-wrap gap-3 text-xs text-gray-400"></div>
                </div>
            </div>

            <!-- Contour below -->
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-3">2D Contour View</h4>
                <div id="pg-contour-plot" class="chart-container" style="height:450px"></div>
            </div>

            <!-- Gradient field -->
            <div class="glass-card p-6">
                <h4 class="font-semibold mb-3">Gradient Vector Field</h4>
                <div id="pg-gradient-plot" class="chart-container" style="height:450px"></div>
            </div>
        </div>
        `;
    },

    init() {
        this.loadSurface();
    },

    _surfaceData: null,

    async loadSurface() {
        const funcSel = document.getElementById('pg-func').value;
        if (funcSel === 'custom' && !document.getElementById('pg-custom-expr')?.value.trim()) return;
        const func = Utils.getFunc('pg');
        const res = parseInt(document.getElementById('pg-res').value);
        const opacity = parseFloat(document.getElementById('pg-opacity').value);
        const csName = document.getElementById('pg-colorscale').value;
        const showContours = document.getElementById('pg-contours').checked;
        const wireframe = document.getElementById('pg-wireframe').checked;

        let colorscale;
        if (csName === 'neon') colorscale = Utils.neonColorscale();
        else if (csName === 'cool') colorscale = Utils.coolColorscale();
        else if (csName === 'surface') colorscale = Utils.surfaceColorscale();
        else colorscale = csName;

        try {
            const sd = await API.getSurface(func, res);
            this._surfaceData = sd;

            // 3D Surface
            const surfaceTrace = {
                type: 'surface',
                x: sd.x, y: sd.y, z: sd.z,
                colorscale: colorscale,
                opacity: opacity,
                showscale: true,
                colorbar: { len: 0.5, thickness: 15, tickfont: { size: 10 } },
            };

            if (showContours) {
                surfaceTrace.contours = {
                    z: { show: true, usecolormap: true, highlightcolor: '#ffffff', project: { z: true } },
                    x: { show: false },
                    y: { show: false },
                };
            }

            if (wireframe) {
                surfaceTrace.hidesurface = true;
                surfaceTrace.contours = {
                    x: { show: true, color: 'rgba(0,245,255,0.3)', width: 1 },
                    y: { show: true, color: 'rgba(191,0,255,0.3)', width: 1 },
                    z: { show: true, color: 'rgba(0,255,136,0.3)', width: 1 },
                };
            }

            // Minimum marker
            const traces = [surfaceTrace];
            if (sd.minimum) {
                traces.push({
                    type: 'scatter3d', mode: 'markers',
                    x: [sd.minimum[0]], y: [sd.minimum[1]], z: [sd.min_value],
                    marker: { size: 8, color: '#00ff88', symbol: 'diamond', line: { color: 'white', width: 2 } },
                    name: 'Global Minimum',
                });
            }

            Plotly.newPlot('pg-plot', traces, Utils.plotlyDarkLayout(sd.name, {
                scene: {
                    camera: { eye: { x: 1.5, y: 1.5, z: 1 } },
                    xaxis: { title: 'x' }, yaxis: { title: 'y' }, zaxis: { title: 'f(x,y)' },
                    aspectratio: { x: 1, y: 1, z: 0.7 },
                },
            }), Utils.plotlyConfig());

            // Contour
            Plotly.newPlot('pg-contour-plot', [{
                type: 'contour',
                x: sd.x, y: sd.y, z: sd.z,
                colorscale: colorscale,
                contours: { coloring: 'heatmap' },
                ncontours: 40,
                showscale: true,
                colorbar: { len: 0.8, thickness: 15, tickfont: { size: 10 } },
            }, ...(sd.minimum ? [{
                type: 'scatter', mode: 'markers',
                x: [sd.minimum[0]], y: [sd.minimum[1]],
                marker: { size: 12, color: '#00ff88', symbol: 'star', line: { color: 'white', width: 2 } },
                name: 'Minimum',
            }] : [])], Utils.plotlyDarkLayout('Contour Plot — ' + sd.name, {
                xaxis: { title: 'x' }, yaxis: { title: 'y', scaleanchor: 'x' },
            }), Utils.plotlyConfig());

            // Gradient field
            const field = await API.getGradientField(func, 15);
            const fieldTraces = [{
                type: 'contour',
                x: sd.x, y: sd.y, z: sd.z,
                colorscale: colorscale,
                contours: { coloring: 'heatmap' },
                ncontours: 25,
                showscale: false,
                opacity: 0.5,
            }];

            for (const p of field.field) {
                fieldTraces.push({
                    type: 'scatter', mode: 'lines',
                    x: [p.x, p.x + p.gx * 0.3],
                    y: [p.y, p.y + p.gy * 0.3],
                    line: { color: 'rgba(255,255,255,0.5)', width: 1.2 },
                    showlegend: false, hoverinfo: 'skip',
                });
            }

            Plotly.newPlot('pg-gradient-plot', fieldTraces, Utils.plotlyDarkLayout('Gradient Field (Descent Direction)', {
                xaxis: { title: 'x', scaleanchor: 'y' }, yaxis: { title: 'y' },
                showlegend: false,
            }), Utils.plotlyConfig());

            // Info
            document.getElementById('pg-info').innerHTML = `
                <span class="badge badge-info">${func}</span>
                <span>Domain: [${sd.domain[0]}] × [${sd.domain[1]}]</span>
                ${sd.minimum ? `<span>Min at (${sd.minimum[0]}, ${sd.minimum[1]}) = ${sd.min_value}</span>` : ''}
                <span>Resolution: ${res}×${res}</span>
            `;

        } catch (e) {
            document.getElementById('pg-plot').innerHTML =
                '<div class="flex items-center justify-center h-full text-gray-500 text-sm">Start the backend server to load surfaces</div>';
        }
    },

    async overlayGD() {
        const func = Utils.getFunc('pg');
        const x0 = parseFloat(document.getElementById('pg-x0').value);
        const y0 = parseFloat(document.getElementById('pg-y0').value);
        const lr = parseFloat(document.getElementById('pg-lr').value);

        try {
            const result = await API.gradientDescent(func, x0, y0, lr, 500, 1e-8);
            const path = result.path;

            // Add to existing 3D plot
            Plotly.addTraces('pg-plot', [
                {
                    type: 'scatter3d', mode: 'lines',
                    x: path.map(p => p.x), y: path.map(p => p.y), z: path.map(p => p.f),
                    line: { color: '#00f5ff', width: 5 },
                    name: 'GD Path',
                },
                {
                    type: 'scatter3d', mode: 'markers',
                    x: [path[0].x], y: [path[0].y], z: [path[0].f],
                    marker: { size: 6, color: '#ff006e' },
                    name: 'Start',
                },
                {
                    type: 'scatter3d', mode: 'markers',
                    x: [path[path.length - 1].x], y: [path[path.length - 1].y], z: [path[path.length - 1].f],
                    marker: { size: 6, color: '#00ff88' },
                    name: 'End',
                },
            ]);

            // Add to contour plot
            Plotly.addTraces('pg-contour-plot', [{
                type: 'scatter', mode: 'lines+markers',
                x: path.map(p => p.x), y: path.map(p => p.y),
                line: { color: '#00f5ff', width: 2 },
                marker: { size: 3, color: path.map((_, i) => i), colorscale: 'YlOrRd', showscale: false },
                name: 'GD Path',
            }]);

            Utils.toast(`GD: ${result.total_iterations} steps → (${Utils.fmt(result.result.x, 3)}, ${Utils.fmt(result.result.y, 3)})`, 'success');
        } catch (e) {
            Utils.toast('Error: ' + e.message, 'error');
        }
    },
};
