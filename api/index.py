"""
Vercel serverless function entry point
"""
import sys
import os
from pathlib import Path

# Add backend directory to path
backend_path = Path(__file__).parent.parent / 'backend'
sys.path.insert(0, str(backend_path))

# Import after path is set
from flask import Flask, jsonify, request
from flask.json.provider import DefaultJSONProvider
from flask_cors import CORS
import numpy as np

from algorithms.functions import (
    FUNCTIONS_1D, FUNCTIONS_2D, eval_1d, eval_1d_derivative,
    generate_surface_data, gradient_2d, eval_2d_at_point,
    validate_expr, build_custom_1d_info, build_custom_2d_info
)
from algorithms.single_variable import bisection_method, newton_raphson, secant_method
from algorithms.bracketing import exhaustive_search, bounding_phase
from algorithms.region_elimination import interval_halving, fibonacci_search, golden_section_search
from algorithms.multivariable import (
    gradient_descent, compute_numerical_hessian,
    compute_gradient_field, analyze_convexity
)


class NumpyJSONProvider(DefaultJSONProvider):
    @staticmethod
    def default(o):
        if isinstance(o, np.ndarray):
            return o.tolist()
        if hasattr(o, 'item'):
            return o.item()
        return DefaultJSONProvider.default(o)


app = Flask(__name__)
app.json_provider_class = NumpyJSONProvider
app.json = NumpyJSONProvider(app)
CORS(app)


# Helper functions
def _resolve_1d(data):
    custom = data.get('custom_expr')
    if custom:
        try:
            domain = data.get('domain', [-10, 10])
            return build_custom_1d_info(custom, domain), None
        except Exception as e:
            return None, (jsonify({"error": str(e)}), 400)
    key = data.get('function', 'quadratic')
    if key not in FUNCTIONS_1D:
        return None, (jsonify({"error": "Unknown function"}), 400)
    return FUNCTIONS_1D[key], None


def _resolve_2d(data):
    custom = data.get('custom_expr')
    if custom:
        try:
            domain = data.get('domain', [[-5, 5], [-5, 5]])
            return build_custom_2d_info(custom, domain), None
        except Exception as e:
            return None, (jsonify({"error": str(e)}), 400)
    key = data.get('function', 'paraboloid')
    if key not in FUNCTIONS_2D:
        return None, (jsonify({"error": "Unknown function"}), 400)
    return FUNCTIONS_2D[key], None


# API Routes
@app.route('/')
def index():
    return jsonify({"status": "ok", "message": "OPTIMIZER API is running"})


@app.route('/api')
def api_index():
    return jsonify({"status": "ok", "message": "OPTIMIZER API is running"})


@app.route('/api/functions')
def get_functions():
    funcs_1d = {k: {"name": v["name"], "domain": v["domain"]} for k, v in FUNCTIONS_1D.items()}
    funcs_2d = {k: {"name": v["name"], "domain": v["domain"], "minimum": v["minimum"]}
                for k, v in FUNCTIONS_2D.items()}
    return jsonify({"functions_1d": funcs_1d, "functions_2d": funcs_2d})


@app.route('/api/surface', methods=['POST'])
def get_surface():
    data = request.get_json()
    info, err = _resolve_2d(data)
    if err:
        return err
    resolution = min(int(data.get('resolution', 60)), 120)
    result = generate_surface_data(info, resolution)
    return jsonify(result)


@app.route('/api/eval1d', methods=['POST'])
def eval_1d_route():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    n_points = min(int(data.get('points', 200)), 1000)
    x_vals = np.linspace(info["domain"][0], info["domain"][1], n_points).tolist()
    y_vals = eval_1d(info, x_vals)
    dy_vals = eval_1d_derivative(info, x_vals)
    return jsonify({
        "x": x_vals, "y": y_vals, "dy": dy_vals,
        "name": info["name"], "domain": info["domain"]
    })


@app.route('/api/gradient', methods=['POST'])
def get_gradient():
    data = request.get_json()
    info, err = _resolve_2d(data)
    if err:
        return err
    px = float(data.get('x', 0))
    py = float(data.get('y', 0))
    grad = gradient_2d(info, px, py)
    fval = eval_2d_at_point(info, px, py)
    return jsonify({"gradient": grad, "point": [px, py], "f_value": fval})


@app.route('/api/hessian', methods=['POST'])
def get_hessian():
    data = request.get_json()
    info, err = _resolve_2d(data)
    if err:
        return err
    px = float(data.get('x', 0))
    py = float(data.get('y', 0))
    result = compute_numerical_hessian(None, px, py, func_info=info)
    return jsonify(result)


@app.route('/api/gradient-field', methods=['POST'])
def get_gradient_field():
    data = request.get_json()
    info, err = _resolve_2d(data)
    if err:
        return err
    res = min(int(data.get('resolution', 15)), 25)
    result = compute_gradient_field(None, res, func_info=info)
    return jsonify(result)


@app.route('/api/convexity', methods=['POST'])
def get_convexity():
    data = request.get_json()
    info, err = _resolve_2d(data)
    if err:
        return err
    result = analyze_convexity(None, resolution=8, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/bisection', methods=['POST'])
def run_bisection():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    a = float(data.get('a', -5))
    b = float(data.get('b', 5))
    tol = float(data.get('tol', 1e-6))
    max_iter = min(int(data.get('max_iter', 50)), 200)
    result = bisection_method(None, a, b, tol, max_iter, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/newton', methods=['POST'])
def run_newton():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    x0 = float(data.get('x0', 2.0))
    tol = float(data.get('tol', 1e-6))
    max_iter = min(int(data.get('max_iter', 50)), 200)
    result = newton_raphson(None, x0, tol, max_iter, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/secant', methods=['POST'])
def run_secant():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    x0 = float(data.get('x0', -3.0))
    x1 = float(data.get('x1', 3.0))
    tol = float(data.get('tol', 1e-6))
    max_iter = min(int(data.get('max_iter', 50)), 200)
    result = secant_method(None, x0, x1, tol, max_iter, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/exhaustive', methods=['POST'])
def run_exhaustive():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    a = float(data.get('a', -5))
    b = float(data.get('b', 5))
    n = min(int(data.get('n', 100)), 1000)
    result = exhaustive_search(None, a, b, n, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/bounding-phase', methods=['POST'])
def run_bounding_phase():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    x0 = float(data.get('x0', -3.0))
    delta = float(data.get('delta', 0.1))
    result = bounding_phase(None, x0, delta, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/interval-halving', methods=['POST'])
def run_interval_halving():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    a = float(data.get('a', -5))
    b = float(data.get('b', 5))
    tol = float(data.get('tol', 1e-6))
    result = interval_halving(None, a, b, tol, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/fibonacci', methods=['POST'])
def run_fibonacci():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    a = float(data.get('a', -5))
    b = float(data.get('b', 5))
    n = min(int(data.get('n', 20)), 50)
    result = fibonacci_search(None, a, b, n, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/golden-section', methods=['POST'])
def run_golden_section():
    data = request.get_json()
    info, err = _resolve_1d(data)
    if err:
        return err
    a = float(data.get('a', -5))
    b = float(data.get('b', 5))
    tol = float(data.get('tol', 1e-6))
    result = golden_section_search(None, a, b, tol, func_info=info)
    return jsonify(result)


@app.route('/api/optimize/gradient-descent', methods=['POST'])
def run_gradient_descent():
    data = request.get_json()
    info, err = _resolve_2d(data)
    if err:
        return err
    x0 = float(data.get('x0', 4.0))
    y0 = float(data.get('y0', 4.0))
    lr = float(data.get('learning_rate', 0.01))
    max_iter = min(int(data.get('max_iter', 200)), 2000)
    tol = float(data.get('tol', 1e-8))
    lr = max(1e-6, min(lr, 1.0))
    result = gradient_descent(None, x0, y0, lr, max_iter, tol, func_info=info)
    return jsonify(result)


# Vercel handler
handler = app
