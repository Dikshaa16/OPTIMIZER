"""
Region Elimination Methods
- Interval Halving
- Fibonacci Search
- Golden Section Search
"""
import numpy as np
from .functions import FUNCTIONS_1D, safe_eval_1d_scalar


def _eval_f(expr, x_val):
    return safe_eval_1d_scalar(expr, x_val)


def interval_halving(func_key, a, b, tol=1e-6, max_iter=100, func_info=None):
    """
    Interval Halving Method: evaluates function at midpoint and
    two quarter-points, eliminating half the interval each step.
    """
    info = func_info if func_info else FUNCTIONS_1D[func_key]
    func_expr = info["expr"]
    iterations = []

    for i in range(max_iter):
        xm = (a + b) / 2.0
        L = b - a
        x1 = a + L / 4.0
        x2 = b - L / 4.0

        f1 = _eval_f(func_expr, x1)
        fm = _eval_f(func_expr, xm)
        f2 = _eval_f(func_expr, x2)

        iterations.append({
            "iteration": i + 1,
            "a": round(a, 8),
            "b": round(b, 8),
            "x1": round(x1, 8),
            "xm": round(xm, 8),
            "x2": round(x2, 8),
            "f_x1": round(f1, 8),
            "f_xm": round(fm, 8),
            "f_x2": round(f2, 8),
            "interval_width": round(L, 8),
        })

        if L < tol:
            break

        if f1 < fm:
            b = xm
        elif f2 < fm:
            a = xm
        else:
            a = x1
            b = x2

    xm = (a + b) / 2.0
    return {
        "algorithm": "Interval Halving",
        "function": info["name"],
        "result": round(xm, 8),
        "f_result": round(_eval_f(func_expr, xm), 8),
        "interval": [round(a, 8), round(b, 8)],
        "iterations": iterations,
        "converged": (b - a) < tol,
        "total_iterations": len(iterations),
    }


def fibonacci_search(func_key, a, b, n=20, func_info=None):
    """
    Fibonacci Search: uses Fibonacci numbers to determine evaluation points,
    progressively narrowing the interval.
    """
    info = func_info if func_info else FUNCTIONS_1D[func_key]
    func_expr = info["expr"]

    # Generate Fibonacci numbers
    fib = [1, 1]
    while len(fib) <= n + 2:
        fib.append(fib[-1] + fib[-2])

    iterations = []
    L = b - a
    rho = 1 - fib[n] / fib[n + 1]

    x1 = a + rho * (b - a)
    x2 = a + (1 - rho) * (b - a)
    f1 = _eval_f(func_expr, x1)
    f2 = _eval_f(func_expr, x2)

    for k in range(1, n):
        iterations.append({
            "iteration": k,
            "a": round(a, 8),
            "b": round(b, 8),
            "x1": round(x1, 8),
            "x2": round(x2, 8),
            "f_x1": round(f1, 8),
            "f_x2": round(f2, 8),
            "interval_width": round(b - a, 8),
            "fibonacci_ratio": round(rho, 8),
        })

        if f1 > f2:
            a = x1
            x1 = x2
            f1 = f2
            rho = 1 - fib[n - k] / fib[n - k + 1] if n - k + 1 < len(fib) else 0.5
            x2 = a + (1 - rho) * (b - a)
            f2 = _eval_f(func_expr, x2)
        else:
            b = x2
            x2 = x1
            f2 = f1
            rho = 1 - fib[n - k] / fib[n - k + 1] if n - k + 1 < len(fib) else 0.5
            x1 = a + rho * (b - a)
            f1 = _eval_f(func_expr, x1)

    xm = (a + b) / 2.0
    return {
        "algorithm": "Fibonacci Search",
        "function": info["name"],
        "result": round(xm, 8),
        "f_result": round(_eval_f(func_expr, xm), 8),
        "interval": [round(a, 8), round(b, 8)],
        "iterations": iterations,
        "converged": True,
        "total_iterations": len(iterations),
    }


def golden_section_search(func_key, a, b, tol=1e-6, max_iter=100, func_info=None):
    """
    Golden Section Search: uses the golden ratio to eliminate intervals.
    """
    info = func_info if func_info else FUNCTIONS_1D[func_key]
    func_expr = info["expr"]
    iterations = []

    gr = (np.sqrt(5) - 1) / 2  # Golden ratio ≈ 0.618

    x1 = b - gr * (b - a)
    x2 = a + gr * (b - a)
    f1 = _eval_f(func_expr, x1)
    f2 = _eval_f(func_expr, x2)

    for i in range(max_iter):
        iterations.append({
            "iteration": i + 1,
            "a": round(a, 8),
            "b": round(b, 8),
            "x1": round(x1, 8),
            "x2": round(x2, 8),
            "f_x1": round(f1, 8),
            "f_x2": round(f2, 8),
            "interval_width": round(b - a, 8),
            "ratio": round(gr, 8),
        })

        if (b - a) < tol:
            break

        if f1 < f2:
            b = x2
            x2 = x1
            f2 = f1
            x1 = b - gr * (b - a)
            f1 = _eval_f(func_expr, x1)
        else:
            a = x1
            x1 = x2
            f1 = f2
            x2 = a + gr * (b - a)
            f2 = _eval_f(func_expr, x2)

    xm = (a + b) / 2.0
    return {
        "algorithm": "Golden Section Search",
        "function": info["name"],
        "result": round(xm, 8),
        "f_result": round(_eval_f(func_expr, xm), 8),
        "interval": [round(a, 8), round(b, 8)],
        "iterations": iterations,
        "converged": (b - a) < tol,
        "total_iterations": len(iterations),
    }
