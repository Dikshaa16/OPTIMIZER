# 🚀 Optimization Techniques Visual Lab

A premium interactive web application for visualizing optimization algorithms and mathematical concepts.

![Python](https://img.shields.io/badge/Python-3.11+-blue)
![Flask](https://img.shields.io/badge/Flask-3.0+-green)
![Plotly](https://img.shields.io/badge/Plotly.js-2.27-orange)
![License](https://img.shields.io/badge/License-MIT-purple)

---

## 📐 Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Browser (SPA)                         │
│   ┌──────────┬───────────┬───────────┬───────────┬────────┐  │
│   │   Home   │ Concepts  │ Algorithm │ 3D Play-  │ Compare│  │
│   │          │ Explorer  │ Visualizer│  ground   │   Lab  │  │
│   └────┬─────┴─────┬─────┴─────┬─────┴─────┬─────┴───┬────┘  │
│        │  Plotly.js │   GSAP    │ Tailwind  │  Fetch  │       │
│        │  3D Graphs │ Animations│    CSS    │   API   │       │
└────────┼───────────┼───────────┼───────────┼─────────┼───────┘
         │           │           │           │         │
    ─────┼───────────┼───────────┼───────────┼─────────┼────
         │         REST API (JSON)                     │
    ─────┼─────────────────────────────────────────────┼────
         │                                             │
┌────────┴─────────────────────────────────────────────┴──────┐
│                    Flask Backend (Python)                     │
│   ┌──────────────────────────────────────────────────────┐   │
│   │                    API Routes                         │   │
│   │  /api/surface  /api/gradient  /api/optimize/*        │   │
│   └───────────┬──────────────┬───────────────────────────┘   │
│               │              │                               │
│   ┌───────────┴──┐  ┌───────┴────────┐  ┌────────────────┐  │
│   │  Functions   │  │  Algorithms    │  │  Calculus      │  │
│   │  (1D & 2D)   │  │  Bisection    │  │  Gradient      │  │
│   │  Rosenbrock  │  │  Newton       │  │  Hessian       │  │
│   │  Himmelblau  │  │  Secant       │  │  Jacobian      │  │
│   │  Rastrigin   │  │  Golden Sec.  │  │  Convexity     │  │
│   │  Beale       │  │  Fibonacci    │  │  Definiteness  │  │
│   └──────────────┘  │  Exhaustive   │  └────────────────┘  │
│                     │  Bounding Ph. │                       │
│                     │  Interval Hlv.│                       │
│                     │  Grad. Descent│                       │
│                     └───────────────┘                       │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🧠 Concept Explorer
- **Classification**: Linear/Non-linear, Convex/Non-convex, Constrained/Unconstrained
- **Vector Calculus**: Gradient field visualization, Hessian matrix computation, Jacobian explanation
- **Convexity Analysis**: Hessian definiteness test across function domains

### 🎯 Algorithm Visualizer
- **Single Variable**: Bisection, Newton-Raphson, Secant Method
- **Bracketing**: Exhaustive Search, Bounding Phase Method
- **Region Elimination**: Interval Halving, Fibonacci Search, Golden Section Search
- **Multivariable**: Gradient Descent with animated 3D path

### 🌌 3D Graph Playground
- Interactive rotatable/zoomable surfaces
- 6 test functions (Rosenbrock, Himmelblau, Rastrigin, etc.)
- Multiple color themes
- Overlay gradient descent paths
- Gradient vector field visualization
- Contour plots

### 📊 Comparison Lab
- Side-by-side convergence comparison of all 1D algorithms
- Multi-start gradient descent analysis
- Starting point sensitivity visualization

### 🎨 UI/UX
- Glassmorphism design
- Animated gradient background
- Neon glow effects
- Dark/Light mode toggle
- Responsive layout
- Smooth page transitions

---

## 🚀 Quick Start

### Prerequisites
- Python 3.9+

### Local Run

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the server
cd backend
python app.py
```

Open **http://localhost:5000** in your browser.

### Docker

```bash
docker compose up --build
```

Open **http://localhost:5000**.

---

## 📁 Project Structure

```
OPTIMIZER/
├── backend/
│   ├── app.py                    # Flask server + API routes
│   └── algorithms/
│       ├── __init__.py
│       ├── functions.py          # 1D & 2D objective functions
│       ├── single_variable.py    # Bisection, Newton, Secant
│       ├── bracketing.py         # Exhaustive search, Bounding phase
│       ├── region_elimination.py # Interval halving, Fibonacci, Golden section
│       └── multivariable.py      # Gradient descent, Hessian, convexity
├── frontend/
│   ├── index.html                # Main SPA entry point
│   ├── css/
│   │   └── styles.css            # Premium UI styles
│   └── js/
│       ├── app.js                # Router, theme, lifecycle
│       ├── api.js                # Backend API client
│       ├── utils.js              # Helpers, Plotly config
│       └── pages/
│           ├── home.js           # Dashboard page
│           ├── concepts.js       # Concept Explorer
│           ├── algorithms.js     # Algorithm Visualizer
│           ├── playground.js     # 3D Playground
│           └── comparison.js     # Comparison Lab
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/functions` | List all available functions |
| POST | `/api/surface` | Generate 3D surface data |
| POST | `/api/eval1d` | Evaluate 1D function |
| POST | `/api/gradient` | Compute gradient at point |
| POST | `/api/hessian` | Compute Hessian matrix |
| POST | `/api/gradient-field` | Compute gradient vector field |
| POST | `/api/convexity` | Analyze function convexity |
| POST | `/api/optimize/bisection` | Run Bisection method |
| POST | `/api/optimize/newton` | Run Newton-Raphson |
| POST | `/api/optimize/secant` | Run Secant method |
| POST | `/api/optimize/exhaustive` | Run Exhaustive search |
| POST | `/api/optimize/bounding-phase` | Run Bounding phase |
| POST | `/api/optimize/interval-halving` | Run Interval halving |
| POST | `/api/optimize/fibonacci` | Run Fibonacci search |
| POST | `/api/optimize/golden-section` | Run Golden section |
| POST | `/api/optimize/gradient-descent` | Run Gradient descent |

---

## 🛠 Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Python 3.11, Flask, NumPy |
| Frontend | HTML5, CSS3, JavaScript (ES6+) |
| Styling | Tailwind CSS, Custom Glassmorphism |
| 3D Plots | Plotly.js 2.27 |
| Animations | GSAP 3.12 |
| Icons | Lucide |
| Container | Docker |

---

## 📦 Deployment

### Render
1. Connect your GitHub repo
2. Set build command: `pip install -r requirements.txt`
3. Set start command: `cd backend && python app.py`

### Railway
1. Connect repo → auto-detects Dockerfile
2. Deploys automatically
