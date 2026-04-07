"""
Bracketing Methods
- Exhaustive Search
- Bounding Phase Method
"""
import numpy as np
from .functions import FUNCTIONS_1D, safe_eval_1d_scalar


def _eval_f(expr, x_val):
    return safe_eval_1d_scalar(expr, x_val)


def exhaustive_search(func_key, a, b, n=100, func_info=None):
    """
    Exhaustive Search: evaluates the function at n equally spaced points
    and finds the interval containing the minimum.
    """
    info = func_info if func_info else FUNCTIONS_1D[func_key]
    func_expr = info["expr"]
    dx = (b - a) / n
    iterations = []
    min_val = float('inf')
    min_x = a
    min_idx = 0

    points = []
    for i in range(n + 1):
        xi = a + i * dx
        fi = _eval_f(func_expr, xi)
        points.append({"x": round(xi, 8), "f_x": round(fi, 8)})
        if fi < min_val:
            min_val = fi
            min_x = xi
            min_idx = i

    # Build iteration log showing interval narrowing
    step_size = n // 10 if n >= 10 else 1
    for step in range(0, n + 1, max(step_size, 1)):
        end = min(step + step_size, n)
        local_min_x = points[step]["x"]
        local_min_f = points[step]["f_x"]
        for j in range(step, end + 1):
            if j <= n and points[j]["f_x"] < local_min_f:
                local_min_f = points[j]["f_x"]
                local_min_x = points[j]["x"]
        iterations.append({
            "iteration": len(iterations) + 1,
            "search_start": round(a + step * dx, 8),
            "search_end": round(a + end * dx, 8),
            "best_x": round(local_min_x, 8),
            "best_f": round(local_min_f, 8),
        })

    left = max(0, min_idx - 1)
    right = min(n, min_idx + 1)

    return {
        "algorithm": "Exhaustive Search",
        "function": info["name"],
        "result": round(min_x, 8),
        "f_result": round(min_val, 8),
        "interval": [round(points[left]["x"], 8), round(points[right]["x"], 8)],
        "iterations": iterations,
        "all_points": points,
        "total_evaluations": n + 1,
        "total_iterations": len(iterations),
    }


def bounding_phase(func_key, x0, delta=0.1, max_iter=100, func_info=None):
    """
    Bounding Phase Method: starts from x0, expands in the direction of
    decreasing function value using exponentially growing steps.
    """
    info = func_info if func_info else FUNCTIONS_1D[func_key]
    func_expr = info["expr"]
    iterations = []

    f0 = _eval_f(func_expr, x0)
    fp = _eval_f(func_expr, x0 + abs(delta))
    fm = _eval_f(func_expr, x0 - abs(delta))

    # Determine search direction
    if fm < f0 < fp:
        delta = -abs(delta)
    elif fp < f0 < fm:
        delta = abs(delta)
    elif fm < f0 and fp < f0:
        # Both sides decrease — pick the steeper one
        delta = -abs(delta) if fm < fp else abs(delta)
    else:
        # Already at a good point
        return {
            "algorithm": "Bounding Phase Method",
            "function": info["name"],
            "result": round(x0, 8),
            "f_result": round(f0, 8),
            "interval": [round(x0 - abs(delta), 8), round(x0 + abs(delta), 8)],
            "iterations": [{"iteration": 1, "x": round(x0, 8), "f_x": round(f0, 8),
                            "step": round(delta, 8), "bracket_a": round(x0 - abs(delta), 8),
                            "bracket_b": round(x0 + abs(delta), 8)}],
            "total_iterations": 1,
        }

    k = 0
    x_prev = x0
    x_curr = x0 + delta
    f_prev = f0
    f_curr = _eval_f(func_expr, x_curr)

    iterations.append({
        "iteration": 1,
        "x": round(x_curr, 8),
        "f_x": round(f_curr, 8),
        "step": round(delta, 8),
        "bracket_a": round(min(x_prev, x_curr), 8),
        "bracket_b": round(max(x_prev, x_curr), 8),
    })

    for k in range(1, max_iter):
        step = (2 ** k) * delta
        x_next = x_curr + step

        # Clamp to reasonable domain
        dom = info["domain"]
        if x_next < dom[0] or x_next > dom[1]:
            break

        f_next = _eval_f(func_expr, x_next)

        iterations.append({
            "iteration": k + 1,
            "x": round(x_next, 8),
            "f_x": round(f_next, 8),
            "step": round(step, 8),
            "bracket_a": round(min(x_prev, x_next), 8),
            "bracket_b": round(max(x_prev, x_next), 8),
        })

        if f_next > f_curr:
            # Found the bracket
            a = min(x_prev, x_next)
            b = max(x_prev, x_next)
            return {
                "algorithm": "Bounding Phase Method",
                "function": info["name"],
                "result": round(x_curr, 8),
                "f_result": round(f_curr, 8),
                "interval": [round(a, 8), round(b, 8)],
                "iterations": iterations,
                "total_iterations": len(iterations),
            }

        x_prev = x_curr
        f_prev = f_curr
        x_curr = x_next
        f_curr = f_next

    a = min(x_prev, x_curr)
    b = max(x_prev, x_curr)
    return {
        "algorithm": "Bounding Phase Method",
        "function": info["name"],
        "result": round(x_curr, 8),
        "f_result": round(f_curr, 8),
        "interval": [round(a, 8), round(b, 8)],
        "iterations": iterations,
        "total_iterations": len(iterations),
    }
