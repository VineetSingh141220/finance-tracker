import pandas as pd
from datetime import datetime, timedelta


def analyze_spending(expenses: list, budgets: list) -> dict:
    """Analyze expenses and generate smart suggestions using Pandas."""
    if not expenses:
        return {
            "suggestions": [{"type": "info", "message": "No expenses found to analyze. Start tracking your spending!"}],
            "analysis": {"total": 0, "by_category": {}, "top_category": "N/A", "days_covered": 0}
        }

    df = pd.DataFrame(expenses)
    
    # Ensure necessary columns exist before processing
    if 'amount' not in df.columns or 'date' not in df.columns:
         return {
            "suggestions": [{"type": "info", "message": "Expense data is missing required fields for analysis."}],
            "analysis": {"total": 0, "by_category": {}, "top_category": "N/A", "days_covered": 0}
        }

    df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    df['date'] = pd.to_datetime(df['date'], errors='coerce').dt.tz_localize(None)

    # filter last 30 days
    cutoff = datetime.now() - timedelta(days=30)
    df = df[df['date'] >= cutoff]

    if df.empty:
        return {
            "suggestions": [{"type": "info", "message": "No recent expenses in the last 30 days to analyze."}],
            "analysis": {"total": 0, "by_category": {}, "top_category": "N/A", "days_covered": 0}
        }

    total = float(df['amount'].sum())
    by_cat = df.groupby('category')['amount'].sum().sort_values(ascending=False)
    top_cat = by_cat.index[0] if len(by_cat) > 0 else "N/A"
    
    match_days = (df['date'].max() - df['date'].min()).days + 1 if not df.empty else 0

    # build budget map
    budget_map = {b.get('category', ''): float(b.get('limit', 0)) for b in budgets}
    suggestions = []

    for cat, spent in by_cat.items():
        spent = float(spent)
        limit = budget_map.get(cat)

        if limit and limit > 0:
            pct = (spent / limit) * 100
            if pct > 100:
                suggestions.append({
                    "type": "danger",
                    "message": f"🚨 Exceeded {cat} budget by ₹{spent - limit:,.0f} ({pct:.0f}% of ₹{limit:,.0f} limit)"
                })
            elif pct > 80:
                suggestions.append({
                    "type": "warning",
                    "message": f"⚠️ {cat} is at {pct:.0f}% of budget (₹{spent:,.0f} / ₹{limit:,.0f})"
                })
        elif total > 0 and (spent / total) > 0.2:
            suggestions.append({
                "type": "info",
                "message": f"📌 No budget set for {cat} — you've spent ₹{spent:,.0f} here"
            })

        if total > 0 and (spent / total) > 0.4:
            suggestions.append({
                "type": "tip",
                "message": f"💡 {cat} is {(spent/total)*100:.0f}% of all spending — consider diversifying"
            })

    if not suggestions:
        suggestions.append({
            "type": "success",
            "message": "✅ Your spending looks healthy! All categories are within budget."
        })

    return {
        "suggestions": suggestions,
        "analysis": {
            "total": round(total, 2),
            "by_category": {str(k): round(float(v), 2) for k, v in by_cat.items()},
            "top_category": str(top_cat),
            "days_covered": int(match_days)
        }
    }
