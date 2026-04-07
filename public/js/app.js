/* ═════════════════════════════════════════════════════════════
   MAIN APPLICATION — Router, Theme, Lifecycle
   ═════════════════════════════════════════════════════════════ */

const App = {
    currentPage: 'home',

    pages: {
        home:       { module: HomePage,      title: 'Dashboard',           subtitle: 'Interactive optimization exploration' },
        concepts:   { module: ConceptsPage,  title: 'Concept Explorer',    subtitle: 'Foundations of optimization theory' },
        algorithms: { module: AlgorithmsPage, title: 'Algorithm Visualizer', subtitle: 'Step-by-step algorithm execution' },
        playground: { module: PlaygroundPage, title: '3D Graph Playground', subtitle: 'Explore mathematical surfaces' },
        comparison: { module: ComparisonPage, title: 'Comparison Lab',     subtitle: 'Compare algorithms side by side' },
    },

    /* ─── Initialization ─────────────────────────────────────── */
    async init() {
        // Loading screen
        const loadingScreen = document.getElementById('loading-screen');
        const loadingText = loadingScreen.querySelector('.loading-text');

        loadingText.textContent = 'Checking backend connection...';
        const isOnline = await API.ping();

        if (isOnline) {
            document.getElementById('api-status').textContent = '●';
            document.getElementById('api-status').className = 'text-green-400';
            loadingText.textContent = 'Backend connected ✓';
        } else {
            document.getElementById('api-status').textContent = '●';
            document.getElementById('api-status').className = 'text-red-400';
            loadingText.textContent = 'Backend offline — some features limited';
        }

        await Utils.sleep(800);

        // Initialize icons
        lucide.createIcons();

        // Setup navigation
        this._setupNav();
        this._setupTheme();
        this._setupMobile();

        // Hide loader
        gsap.to(loadingScreen, {
            opacity: 0,
            duration: 0.5,
            onComplete: () => { loadingScreen.style.display = 'none'; }
        });

        // Navigate to home
        this.navigate('home');
    },

    /* ─── Navigation ─────────────────────────────────────────── */
    navigate(page, sub) {
        if (!this.pages[page]) return;

        const prevPage = this.currentPage;
        this.currentPage = page;

        // Update nav
        document.querySelectorAll('.nav-item').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === page && !btn.dataset.sub);
        });

        // Update header
        document.getElementById('page-title').textContent = this.pages[page].title;
        document.getElementById('page-subtitle').textContent = this.pages[page].subtitle;

        // Render page
        const container = document.getElementById('page-container');
        container.innerHTML = this.pages[page].module.render();

        // Init page
        if (this.pages[page].module.init) {
            setTimeout(() => this.pages[page].module.init(sub), 100);
        }

        // Re-initialize Lucide icons
        setTimeout(() => lucide.createIcons(), 150);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    _setupNav() {
        document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                const sub = btn.dataset.sub;
                this.navigate(page, sub);

                // Close mobile menu
                document.getElementById('sidebar').classList.remove('open');
            });
        });
    },

    /* ─── Theme Toggle ───────────────────────────────────────── */
    _setupTheme() {
        const saved = localStorage.getItem('optim-theme') || 'dark';
        if (saved === 'light') {
            document.body.classList.remove('dark');
            document.body.classList.add('light');
        }
        this._updateThemeUI();

        document.getElementById('theme-toggle').addEventListener('click', () => {
            document.body.classList.toggle('dark');
            document.body.classList.toggle('light');
            const theme = document.body.classList.contains('light') ? 'light' : 'dark';
            localStorage.setItem('optim-theme', theme);
            this._updateThemeUI();
        });
    },

    _updateThemeUI() {
        const isLight = document.body.classList.contains('light');
        const icon = document.getElementById('theme-icon');
        const label = document.getElementById('theme-label');
        if (icon) icon.setAttribute('data-lucide', isLight ? 'sun' : 'moon');
        if (label) label.textContent = isLight ? 'Light Mode' : 'Dark Mode';
        lucide.createIcons();
    },

    /* ─── Mobile Menu ────────────────────────────────────────── */
    _setupMobile() {
        document.getElementById('mobile-menu')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('open');
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            const sidebar = document.getElementById('sidebar');
            const menuBtn = document.getElementById('mobile-menu');
            if (window.innerWidth < 1024 && sidebar.classList.contains('open') &&
                !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
                sidebar.classList.remove('open');
            }
        });
    },
};

// ─── Boot ───────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => App.init());
