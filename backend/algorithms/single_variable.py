"""
Single Variable Optimization Algorithms
- Bisection Method
- Newton-Raphson Method
- Secant Method
"""
import numpy as np
from .functions import (
    FUNCTIONS_1D, safe_eval_1d_scalar, numerical_derivative,
    numerical_second_derivative
)


def _eval_f(expr, x_val):
    return safe_eval_1d_scalar(expr, x_val)


def _eval_deriv(info, x_val):
    if info.get("_custom") or info.get("derivative") is None:
        return numerical_derivative(info["expr"], float(x_val))
    return _eval_f(info["derivative"], x_val)


def _eval_second_deriv(info, x_val):
    if info.get("_custom") or info.get("second_derivative") is None:
        return numerical_second_derivative(info["expr"], float(x_val))
    return _eval_f(info["second_derivative"], x_val)


def bisection_method(func_key, a, b, tol=1e-6, max_iter=50, func_info=None):
    """
    Bisection method for finding minimum of a unimodal function.
    Uses derivative = 0 root finding approach.
    """
    info = func_info if func_info else FUNCTIONS_1D[func_key]
    func_expr = info["expr"]
    iterations = []

    for i in range(max_iter):
        mid = (a + b) / 2.0
        fa = _eval_deriv(info, a)
        fb = _eval_deriv(info, b)
        fm = _eval_deriv(info, mid)
        f_val = _eval_f(func_expr, mid)

        iterations.append({
            "iteration": i + 1,
            "a": round(a, 8),
            "b": round(b, 8),
            "mid": round(mid, 8),
            "f_mid": round(f_val, 8),
            "df_mid": round(fm, 8),
            "interval_width": round(b - a, 8),
        })

        if abs(fm) < tol or (b - a) / 2 < tol:
            break

        if fa * fm < 0:
            b = mid
        else:
            a = mid

    return {
        "algorithm": "Bisection Method",
        "function": info["name"],
        "result": round(mid, 8),
        "f_result": round(_eval_f(func_expr, mid), 8),
        "iterations": iterations,
        "converged": abs(_eval_deriv(info, mid)) < tol or (b - a) / 2 < tol,
        "total_iterations": len(iterations),
    }


def newton_raphson(func_key, x0, tol=1e-6, max_iter=50, func_info=None):
    """
    Newton-Raphson method for finding minimum.
    Uses x_{n+1} = x_n - f'(x_n)/f''(x_n).
    """
    info = func_info if func_info else FUNCTIONS_1D[func_key]
    func_expr = info["expr"]
    iterations = []
    x = float(x0)

    for i in range(max_iter):
        fx = _eval_f(func_expr, x)
        dfx = _eval_deriv(info, x)
        ddfx = _eval_second_deriv(info, x)

        iterations.append({
            "iteration": i + 1,
            "x": round(x, 8),
            "f_x": round(fx, 8),
            "df_x": round(dfx, 8),
            "ddf_x": round(ddfx, 8),
        })

        if abs(dfx) < tol:
            break

        if abs(ddfx) < 1e-12:
            break

        x_new = x - dfx / ddfx
        x = x_new

    return {
        "algorithm": "Newton-Raphson",
        "function": info["name"],
        "result": round(x, 8),
        "f_result": round(_eval_f(func_expr, x), 8),
        "iterations": iterations,
        "converged": abs(_eval_deriv(info, x)) < tol,
        "total_iterations": len(iterations),
    }


def secant_method(func_key, x0, x1, tol=1e-6, max_iter=50, func_info=None):
    """
    Secant method for finding minimum (root of derivative).
    """
    info = func_info if func_info else FUNCTIONS_1D[func_key]
    func_expr = info["expr"]
    iterations = []
    xp = float(x0)
    xc = float(x1)

    for i in range(max_iter):
        fp = _eval_deriv(info, xp)
        fc = _eval_deriv(info, xc)

        iterations.append({
            "iteration": i + 1,
            "x_prev": round(xp, 8),
            "x_curr": round(xc, 8),
            "df_prev": round(fp, 8),
            "df_curr": round(fc, 8),
            "f_curr": round(_eval_f(func_expr, xc), 8),
        })

        if abs(fc) < tol:
            break

        if abs(fc - fp) < 1e-15:
            break

        x_new = xc - fc * (xc - xp) / (fc - fp)
        xp = xc
        xc = x_new

    return {
        "algorithm": "Secant Method",
        "function": info["name"],
        "result": round(xc, 8),
        "f_result": round(_eval_f(func_expr, xc), 8),
        "iterations": iterations,
        "converged": abs(_eval_deriv(info, xc)) < tol,
        "total_iterations": len(iterations),
    }
