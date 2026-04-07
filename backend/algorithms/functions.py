"""
Objective Functions for Optimization
"""
import re
import numpy as np


# ─── Safe Evaluation Namespace ──────────────────────────────────
SAFE_NAMESPACE = {
    'np': np,
    'sin': np.sin, 'cos': np.cos, 'tan': np.tan,
    'asin': np.arcsin, 'acos': np.arccos, 'atan': np.arctan,
    'sinh': np.sinh, 'cosh': np.cosh, 'tanh': np.tanh,
    'exp': np.exp, 'log': np.log, 'log10': np.log10, 'log2': np.log2,
    'sqrt': np.sqrt, 'abs': np.abs,
    'pi': np.pi, 'e': np.e,
    'pow': pow, 'floor': np.floor, 'ceil': np.ceil,
}

_FORBIDDEN_RE = re.compile(
    r'(__|\bimport\b|\bexec\b|\beval\b|\bcompile\b|\bgetattr\b|\bsetattr\b'
    r'|\bdelattr\b|\bglobals\b|\blocals\b|\bopen\b|\bos\b|\bsys\b'
    r'|\bsubprocess\b|\bbreakpoint\b|\bdir\b|\bvars\b|\btype\b)',
    re.IGNORECASE
)


def validate_expr(expr):
    """Validate a math expression string for safety."""
    if not isinstance(expr, str) or len(expr) > 500:
        raise ValueError("Expression must be a string of at most 500 characters")
    if _FORBIDDEN_RE.search(expr):
        raise ValueError("Expression contains forbidden keywords")
    return True


def safe_eval(expr, **variables):
    """Safely evaluate an expression with given variables."""
    ns = {**SAFE_NAMESPACE, **variables}
    return eval(expr, {"__builtins__": {}}, ns)


def safe_eval_1d_scalar(expr, x_val):
    """Safely evaluate a 1D expression at a scalar point."""
    return float(safe_eval(expr, x=float(x_val)))


def safe_eval_2d_scalar(expr, x_val, y_val):
    """Safely evaluate a 2D expression at a scalar point."""
    return float(safe_eval(expr, x=float(x_val), y=float(y_val)))


def numerical_derivative(expr, x_val, h=1e-7):
    """Numerical first derivative of a 1D expression."""
    return (safe_eval_1d_scalar(expr, x_val + h) - safe_eval_1d_scalar(expr, x_val - h)) / (2 * h)


def numerical_second_derivative(expr, x_val, h=1e-5):
    """Numerical second derivative of a 1D expression."""
    fp = safe_eval_1d_scalar(expr, x_val + h)
    fm = safe_eval_1d_scalar(expr, x_val - h)
    f0 = safe_eval_1d_scalar(expr, x_val)
    return (fp - 2 * f0 + fm) / (h * h)


def numerical_gradient_2d(expr, px, py, h=1e-7):
    """Numerical gradient of a 2D expression."""
    gx = (safe_eval_2d_scalar(expr, px + h, py) - safe_eval_2d_scalar(expr, px - h, py)) / (2 * h)
    gy = (safe_eval_2d_scalar(expr, px, py + h) - safe_eval_2d_scalar(expr, px, py - h)) / (2 * h)
    return [gx, gy]


def build_custom_1d_info(expr, domain=None):
    """Build a func_info dict for a custom 1D expression."""
    validate_expr(expr)
    # Quick test eval
    safe_eval_1d_scalar(expr, 0.0)
    if domain is None:
        domain = [-10, 10]
    return {
        "name": f"Custom: f(x) = {expr}",
        "expr": expr,
        "derivative": None,
        "second_derivative": None,
        "domain": domain,
        "minimum": None,
        "_custom": True,
    }


def build_custom_2d_info(expr, domain=None):
    """Build a func_info dict for a custom 2D expression."""
    validate_expr(expr)
    # Quick test eval
    safe_eval_2d_scalar(expr, 0.0, 0.0)
    if domain is None:
        domain = [[-5, 5], [-5, 5]]
    return {
        "name": f"Custom: f(x,y) = {expr}",
        "expr": expr,
        "gradient": None,
        "domain": domain,
        "minimum": None,
        "min_value": None,
        "_custom": True,
    }


FUNCTIONS_1D = {
    "quadratic": {
        "name": "Quadratic: f(x) = x²",
        "expr": "x**2",
        "derivative": "2*x",
        "second_derivative": "2",
        "domain": [-5, 5],
        "minimum": 0.0,
    },
    "cubic": {
        "name": "Cubic: f(x) = x³ - 3x",
        "expr": "x**3 - 3*x",
        "derivative": "3*x**2 - 3",
        "second_derivative": "6*x",
        "domain": [-3, 3],
        "minimum": -2.0,
    },
    "sinusoidal": {
        "name": "Sinusoidal: f(x) = sin(x) + sin(2x)",
        "expr": "np.sin(x) + np.sin(2*x)",
        "derivative": "np.cos(x) + 2*np.cos(2*x)",
        "second_derivative": "-np.sin(x) - 4*np.sin(2*x)",
        "domain": [-2 * np.pi, 2 * np.pi],
        "minimum": None,
    },
    "polynomial": {
        "name": "Polynomial: f(x) = x⁴ - 4x² + 3",
        "expr": "x**4 - 4*x**2 + 3",
        "derivative": "4*x**3 - 8*x",
        "second_derivative": "12*x**2 - 8",
        "domain": [-3, 3],
        "minimum": -1.0,
    },
}

FUNCTIONS_2D = {
    "paraboloid": {
        "name": "Paraboloid: f(x,y) = x² + y²",
        "expr": "x**2 + y**2",
        "gradient": ["2*x", "2*y"],
        "domain": [[-5, 5], [-5, 5]],
        "minimum": [0.0, 0.0],
        "min_value": 0.0,
    },
    "rosenbrock": {
        "name": "Rosenbrock: f(x,y) = (1-x)² + 100(y-x²)²",
        "expr": "(1 - x)**2 + 100*(y - x**2)**2",
        "gradient": [
            "-2*(1 - x) - 400*x*(y - x**2)",
            "200*(y - x**2)"
        ],
        "domain": [[-2, 2], [-1, 3]],
        "minimum": [1.0, 1.0],
        "min_value": 0.0,
    },
    "himmelblau": {
        "name": "Himmelblau: f(x,y) = (x²+y-11)² + (x+y²-7)²",
        "expr": "(x**2 + y - 11)**2 + (x + y**2 - 7)**2",
        "gradient": [
            "4*x*(x**2 + y - 11) + 2*(x + y**2 - 7)",
            "2*(x**2 + y - 11) + 4*y*(x + y**2 - 7)"
        ],
        "domain": [[-5, 5], [-5, 5]],
        "minimum": [3.0, 2.0],
        "min_value": 0.0,
    },
    "rastrigin": {
        "name": "Rastrigin: f(x,y) = 20 + x² + y² - 10(cos2πx + cos2πy)",
        "expr": "20 + x**2 + y**2 - 10*(np.cos(2*np.pi*x) + np.cos(2*np.pi*y))",
        "gradient": [
            "2*x + 20*np.pi*np.sin(2*np.pi*x)",
            "2*y + 20*np.pi*np.sin(2*np.pi*y)"
        ],
        "domain": [[-5.12, 5.12], [-5.12, 5.12]],
        "minimum": [0.0, 0.0],
        "min_value": 0.0,
    },
    "beale": {
        "name": "Beale: f(x,y) = (1.5-x+xy)² + (2.25-x+xy²)² + (2.625-x+xy³)²",
        "expr": "(1.5 - x + x*y)**2 + (2.25 - x + x*y**2)**2 + (2.625 - x + x*y**3)**2",
        "gradient": [
            "2*(1.5-x+x*y)*(-1+y) + 2*(2.25-x+x*y**2)*(-1+y**2) + 2*(2.625-x+x*y**3)*(-1+y**3)",
            "2*(1.5-x+x*y)*x + 2*(2.25-x+x*y**2)*2*x*y + 2*(2.625-x+x*y**3)*3*x*y**2"
        ],
        "domain": [[-4.5, 4.5], [-4.5, 4.5]],
        "minimum": [3.0, 0.5],
        "min_value": 0.0,
    },
    "booth": {
        "name": "Booth: f(x,y) = (x+2y-7)² + (2x+y-5)²",
        "expr": "(x + 2*y - 7)**2 + (2*x + y - 5)**2",
        "gradient": [
            "2*(x+2*y-7) + 4*(2*x+y-5)",
            "4*(x+2*y-7) + 2*(2*x+y-5)"
        ],
        "domain": [[-10, 10], [-10, 10]],
        "minimum": [1.0, 3.0],
        "min_value": 0.0,
    },
}


def eval_1d(func_key_or_info, x_values):
    """Evaluate a 1D function."""
    info = func_key_or_info if isinstance(func_key_or_info, dict) else FUNCTIONS_1D[func_key_or_info]
    x = np.array(x_values, dtype=float)
    y = safe_eval(info["expr"], x=x)
    return y.tolist() if hasattr(y, 'tolist') else [float(y)]


def eval_1d_derivative(func_key_or_info, x_values):
    """Evaluate 1st derivative of a 1D function."""
    info = func_key_or_info if isinstance(func_key_or_info, dict) else FUNCTIONS_1D[func_key_or_info]
    if info.get("_custom") or info.get("derivative") is None:
        return [numerical_derivative(info["expr"], float(xv)) for xv in x_values]
    x = np.array(x_values, dtype=float)
    y = safe_eval(info["derivative"], x=x)
    return y.tolist() if hasattr(y, 'tolist') else [float(y)]


def eval_1d_second_derivative(func_key_or_info, x_values):
    """Evaluate 2nd derivative of a 1D function."""
    info = func_key_or_info if isinstance(func_key_or_info, dict) else FUNCTIONS_1D[func_key_or_info]
    if info.get("_custom") or info.get("second_derivative") is None:
        return [numerical_second_derivative(info["expr"], float(xv)) for xv in x_values]
    x = np.array(x_values, dtype=float)
    y = safe_eval(info["second_derivative"], x=x)
    return y.tolist() if hasattr(y, 'tolist') else [float(y)]


def eval_2d(func_key_or_info, x_grid, y_grid):
    """Evaluate a 2D function on a meshgrid."""
    info = func_key_or_info if isinstance(func_key_or_info, dict) else FUNCTIONS_2D[func_key_or_info]
    x = np.array(x_grid, dtype=float)
    y = np.array(y_grid, dtype=float)
    z = safe_eval(info["expr"], x=x, y=y)
    return z.tolist()


def eval_2d_at_point(func_key_or_info, px, py):
    """Evaluate a 2D function at a single point."""
    info = func_key_or_info if isinstance(func_key_or_info, dict) else FUNCTIONS_2D[func_key_or_info]
    return safe_eval_2d_scalar(info["expr"], px, py)


def gradient_2d(func_key_or_info, px, py):
    """Compute gradient of a 2D function at a point."""
    info = func_key_or_info if isinstance(func_key_or_info, dict) else FUNCTIONS_2D[func_key_or_info]
    if info.get("_custom") or info.get("gradient") is None:
        return numerical_gradient_2d(info["expr"], float(px), float(py))
    x = float(px)
    y = float(py)
    gx = float(safe_eval(info["gradient"][0], x=x, y=y))
    gy = float(safe_eval(info["gradient"][1], x=x, y=y))
    return [gx, gy]


def generate_surface_data(func_key_or_info, resolution=60):
    """Generate full surface data for 3D plotting."""
    info = func_key_or_info if isinstance(func_key_or_info, dict) else FUNCTIONS_2D[func_key_or_info]
    xr = info["domain"][0]
    yr = info["domain"][1]
    x_lin = np.linspace(xr[0], xr[1], resolution)
    y_lin = np.linspace(yr[0], yr[1], resolution)
    X, Y = np.meshgrid(x_lin, y_lin)
    Z = safe_eval(info["expr"], x=X, y=Y)
    return {
        "x": x_lin.tolist(),
        "y": y_lin.tolist(),
        "z": Z.tolist(),
        "name": info["name"],
        "domain": info["domain"],
        "minimum": info.get("minimum"),
        "min_value": info.get("min_value"),
    }
