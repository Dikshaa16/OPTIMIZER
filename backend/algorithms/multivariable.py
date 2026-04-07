"""
Multivariable Optimization & Vector Calculus Utilities
- Gradient Descent with path tracking
- Gradient, Hessian, Jacobian computation
- Convexity analysis
"""
import numpy as np
from .functions import FUNCTIONS_2D, eval_2d_at_point, gradient_2d


def gradient_descent(func_key, x0, y0, learning_rate=0.01, max_iter=200, tol=1e-8, func_info=None):
    """
    Gradient descent on a 2D function, tracking the full path.
    """
    info = func_info if func_info else FUNCTIONS_2D[func_key]
    fi = info  # pass info dict to helper functions
    path = []
    x, y = float(x0), float(y0)

    for i in range(max_iter):
        fval = eval_2d_at_point(fi, x, y)
        grad = gradient_2d(fi, x, y)
        grad_norm = np.sqrt(grad[0]**2 + grad[1]**2)

        path.append({
            "iteration": i,
            "x": round(x, 8),
            "y": round(y, 8),
            "f": round(fval, 8),
            "grad_x": round(grad[0], 8),
            "grad_y": round(grad[1], 8),
            "grad_norm": round(grad_norm, 8),
        })

        if grad_norm < tol:
            break

        x -= learning_rate * grad[0]
        y -= learning_rate * grad[1]

        # Clamp to domain
        dom = info["domain"]
        x = max(dom[0][0], min(dom[0][1], x))
        y = max(dom[1][0], min(dom[1][1], y))

    return {
        "algorithm": "Gradient Descent",
        "function": info["name"],
        "result": {"x": round(x, 8), "y": round(y, 8)},
        "f_result": round(eval_2d_at_point(fi, x, y), 8),
        "path": path,
        "converged": path[-1]["grad_norm"] < tol if path else False,
        "total_iterations": len(path),
    }


def compute_numerical_hessian(func_key, px, py, h=1e-5, func_info=None):
    """
    Compute 2x2 Hessian matrix numerically using finite differences.
    """
    fi = func_info if func_info else func_key
    f = lambda x, y: eval_2d_at_point(fi, x, y)

    fxx = (f(px + h, py) - 2 * f(px, py) + f(px - h, py)) / (h * h)
    fyy = (f(px, py + h) - 2 * f(px, py) + f(px, py - h)) / (h * h)
    fxy = (f(px + h, py + h) - f(px + h, py - h) - f(px - h, py + h) + f(px - h, py - h)) / (4 * h * h)

    hessian = [[round(fxx, 6), round(fxy, 6)],
               [round(fxy, 6), round(fyy, 6)]]

    eigenvalues = np.linalg.eigvalsh(np.array(hessian))

    if all(e > 0 for e in eigenvalues):
        definiteness = "Positive Definite"
    elif all(e < 0 for e in eigenvalues):
        definiteness = "Negative Definite"
    elif all(e >= 0 for e in eigenvalues):
        definiteness = "Positive Semi-Definite"
    elif all(e <= 0 for e in eigenvalues):
        definiteness = "Negative Semi-Definite"
    else:
        definiteness = "Indefinite"

    return {
        "hessian": hessian,
        "eigenvalues": [round(float(e), 6) for e in eigenvalues],
        "definiteness": definiteness,
        "is_convex": definiteness in ["Positive Definite", "Positive Semi-Definite"],
        "point": [px, py],
    }


def compute_gradient_field(func_key, resolution=15, func_info=None):
    """
    Compute gradient field over the domain for quiver plot.
    """
    info = func_info if func_info else FUNCTIONS_2D[func_key]
    fi = info
    xr = info["domain"][0]
    yr = info["domain"][1]
    x_pts = np.linspace(xr[0], xr[1], resolution)
    y_pts = np.linspace(yr[0], yr[1], resolution)

    points = []
    for xi in x_pts:
        for yi in y_pts:
            grad = gradient_2d(fi, float(xi), float(yi))
            norm = np.sqrt(grad[0]**2 + grad[1]**2)
            if norm > 1e-10:
                points.append({
                    "x": round(float(xi), 6),
                    "y": round(float(yi), 6),
                    "gx": round(-grad[0] / norm, 6),  # Negative gradient = descent direction
                    "gy": round(-grad[1] / norm, 6),
                    "magnitude": round(norm, 6),
                })

    return {
        "function": info["name"],
        "field": points,
        "domain": info["domain"],
    }


def analyze_convexity(func_key, resolution=10, func_info=None):
    """
    Analyze convexity by computing Hessian at multiple points.
    """
    info = func_info if func_info else FUNCTIONS_2D[func_key]
    xr = info["domain"][0]
    yr = info["domain"][1]

    x_pts = np.linspace(xr[0] * 0.8, xr[1] * 0.8, resolution)
    y_pts = np.linspace(yr[0] * 0.8, yr[1] * 0.8, resolution)

    results = []
    all_convex = True

    for xi in x_pts:
        for yi in y_pts:
            h = compute_numerical_hessian(func_key, float(xi), float(yi), func_info=func_info)
            results.append({
                "x": round(float(xi), 4),
                "y": round(float(yi), 4),
                "definiteness": h["definiteness"],
                "eigenvalues": h["eigenvalues"],
                "is_convex": h["is_convex"],
            })
            if not h["is_convex"]:
                all_convex = False

    return {
        "function": info["name"],
        "globally_convex": all_convex,
        "sample_points": results,
        "total_points": len(results),
    }
