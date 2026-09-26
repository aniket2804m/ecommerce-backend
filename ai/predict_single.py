import sys
import os
import json
import pandas as pd
import joblib

def predict(data):
    model_path = os.path.join(os.path.dirname(__file__), "cloth_sales_model.pkl")
    if not os.path.exists(model_path):
        return {"error": "Model not trained yet. Run cloth_sales_prediction.py first."}
    
    model = joblib.load(model_path)
    
    # Expected keys: original_price, discount_percent, stock_quantity, rating, category_code
    input_df = pd.DataFrame([{
        'Original_Price': float(data.get('original_price', 1999)),
        'Discount_Percent': float(data.get('discount_percent', 20)),
        'Stock_Quantity': float(data.get('stock_quantity', 50)),
        'Rating': float(data.get('rating', 4.2)),
        'Category_Code': int(data.get('category_code', 0))
    }])
    
    predicted_units = model.predict(input_df)[0]
    estimated_revenue = round(predicted_units * (input_df['Original_Price'][0] * (1 - input_df['Discount_Percent'][0]/100.0)), 2)
    
    return {
        "status": "success",
        "predicted_sales_units": int(round(predicted_units)),
        "estimated_revenue_inr": estimated_revenue,
        "input_summary": data
    }

if __name__ == '__main__':
    if len(sys.argv) > 1:
        raw_json = sys.argv[1]
        try:
            parsed = json.loads(raw_json)
            print(json.dumps(predict(parsed)))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        # Default test
        print(json.dumps(predict({"original_price": 2499, "discount_percent": 25, "stock_quantity": 40, "rating": 4.5, "category_code": 1})))
