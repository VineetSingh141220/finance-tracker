from flask import Flask, request, jsonify
from flask_cors import CORS
from analyzer import analyze_spending
import os
import traceback

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400

        expenses = data.get('expenses', [])
        budgets = data.get('budgets', [])

        result = analyze_spending(expenses, budgets)
        return jsonify(result)

    except Exception as e:
        # Log the full traceback for debugging purposes
        traceback.print_exc()
        print(f"Error in /analyze: {e}")
        return jsonify({
            "suggestions": [{"type": "danger", "message": f"Analysis failed: {str(e)}. Please check the input data."}],
            "analysis": {"total": 0, "by_category": {}, "top_category": "N/A", "days_covered": 0}
        }), 200 # Return 200 with error msg to avoid frontend crash


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=True)
