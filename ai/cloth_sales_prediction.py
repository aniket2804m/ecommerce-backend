import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib

def main():
    print("="*60)
    print(" E-COMMERCE CLOTH SHOP - AI MODEL INTEGRATION WORKFLOW ")
    print("="*60)

    # -------------------------------------------------------------
    # STEP 1: LOAD DATA
    # -------------------------------------------------------------
    print("\n[STEP 1] LOAD DATA")
    csv_file = os.path.join(os.path.dirname(__file__), "clothing_sales_data.csv")
    
    if not os.path.exists(csv_file):
        np.random.seed(42)
        n_samples = 300
        
        original_price = np.random.randint(499, 4999, size=n_samples)
        discount_percent = np.random.choice([10, 15, 20, 25, 30, 40, 50], size=n_samples)
        final_price = original_price * (1 - discount_percent / 100.0)
        stock_quantity = np.random.randint(10, 200, size=n_samples)
        rating = np.round(np.random.uniform(3.0, 5.0, size=n_samples), 1)
        category_code = np.random.choice([0, 1, 2, 3], size=n_samples) # 0: Men, 1: Women, 2: Kids, 3: Ethnic
        
        sales_units = (
            (5000 - final_price) * 0.02 + 
            discount_percent * 1.5 + 
            rating * 15 + 
            (200 - stock_quantity) * 0.1 + 
            np.random.normal(0, 5, size=n_samples)
        )
        sales_units = np.clip(np.round(sales_units), 5, 250).astype(int)

        df = pd.DataFrame({
            'Original_Price': original_price,
            'Discount_Percent': discount_percent,
            'Final_Price': final_price,
            'Stock_Quantity': stock_quantity,
            'Rating': rating,
            'Category_Code': category_code,
            'Sales_Units': sales_units
        })
        df.to_csv(csv_file, index=False)
        print(f"-> Created synthetic dataset with {n_samples} clothing items at: {csv_file}")
    else:
        df = pd.read_csv(csv_file)
        print(f"-> Loaded dataset successfully from: {csv_file}")

    # -------------------------------------------------------------
    # STEP 2: EXPLORE DATA (EDA)
    # -------------------------------------------------------------
    print("\n[STEP 2] EXPLORE DATA (EDA)")
    print("\n--- First 5 Rows ---")
    print(df.head())
    
    print("\n--- Dataset Summary Statistics ---")
    print(df.describe())
    
    print("\n--- Missing Values Check ---")
    print(df.isnull().sum())

    # -------------------------------------------------------------
    # STEP 3: DEFINE X (Features)
    # -------------------------------------------------------------
    print("\n[STEP 3] DEFINE X (Features)")
    feature_cols = ['Original_Price', 'Discount_Percent', 'Stock_Quantity', 'Rating', 'Category_Code']
    X = df[feature_cols]
    print(f"Features (X) selected: {list(X.columns)}")
    print(f"Shape of X: {X.shape}")

    # -------------------------------------------------------------
    # STEP 4: DEFINE y (Target)
    # -------------------------------------------------------------
    print("\n[STEP 4] DEFINE y (Target Variable)")
    y = df['Sales_Units']
    print(f"Target (y) selected: '{y.name}' (Predicted sales units of clothing item)")
    print(f"Shape of y: {y.shape}")

    # -------------------------------------------------------------
    # STEP 5: SPLIT DATA
    # -------------------------------------------------------------
    print("\n[STEP 5] SPLIT DATA")
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    print(f"Training Set: {X_train.shape[0]} samples (80%)")
    print(f"Testing Set:  {X_test.shape[0]} samples (20%)")

    # -------------------------------------------------------------
    # STEP 6: TRAIN MODEL
    # -------------------------------------------------------------
    print("\n[STEP 6] TRAIN MODEL")
    model = RandomForestRegressor(n_estimators=100, max_depth=8, random_state=42)
    model.fit(X_train, y_train)
    print("-> Model (RandomForestRegressor) trained successfully!")

    # Save trained model
    model_path = os.path.join(os.path.dirname(__file__), "cloth_sales_model.pkl")
    joblib.dump(model, model_path)
    print(f"-> Saved trained model to: {model_path}")

    # -------------------------------------------------------------
    # STEP 7: MAKE PREDICTIONS
    # -------------------------------------------------------------
    print("\n[STEP 7] MAKE PREDICTIONS")
    y_pred = model.predict(X_test)
    
    new_item = pd.DataFrame([{
        'Original_Price': 2499,
        'Discount_Percent': 25,
        'Stock_Quantity': 50,
        'Rating': 4.5,
        'Category_Code': 1 # Women's Wear
    }])
    sample_pred = model.predict(new_item)[0]
    print(f"\nPrediction for New Product (Price INR 2499, 25% Off, Stock 50, Rating 4.5, Category Women):")
    print(f"-> Estimated Sales: ~{round(sample_pred)} units")

    # -------------------------------------------------------------
    # STEP 8: CALCULATE LOSS / ERROR METRICS
    # -------------------------------------------------------------
    print("\n[STEP 8] CALCULATE LOSS / ERROR METRICS")
    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print(f"  * Mean Absolute Error (MAE): {mae:.2f} units")
    print(f"  * Mean Squared Error (MSE / Loss): {mse:.2f}")
    print(f"  * Root Mean Squared Error (RMSE): {rmse:.2f} units")
    print(f"  * R-squared (R2) Score: {r2:.4f} ({r2*100:.2f}% variance explained)")

    # -------------------------------------------------------------
    # STEP 9: COMPARE ACTUAL VS PREDICTED
    # -------------------------------------------------------------
    print("\n[STEP 9] COMPARE ACTUAL VS PREDICTED (Sample Test Cases)")
    comparison_df = pd.DataFrame({
        'Actual_Sales': y_test.values[:10],
        'Predicted_Sales': np.round(y_pred[:10], 1),
        'Difference (Error)': np.round(y_test.values[:10] - y_pred[:10], 1)
    })
    print(comparison_df.to_string(index=False))

    # -------------------------------------------------------------
    # STEP 10: EXPLAIN OVERFITTING & UNDERFITTING
    # -------------------------------------------------------------
    print("\n[STEP 10] EXPLAIN OVERFITTING VS UNDERFITTING")
    train_r2 = model.score(X_train, y_train)
    test_r2 = model.score(X_test, y_test)
    
    print(f"  * Training Set Score (R2): {train_r2:.4f}")
    print(f"  * Testing Set Score (R2):  {test_r2:.4f}")

    print("\nDIAGNOSIS & EXPLANATION:")
    if train_r2 > 0.95 and test_r2 < 0.60:
        print("-> OVERFITTING DETECTED (High Variance):")
        print("  - The model performed extremely well on training data but poorly on test data.")
        print("  - Solution: Reduce model depth (`max_depth`), add regularization, or get more training data.")
    elif train_r2 < 0.50 and test_r2 < 0.50:
        print("-> UNDERFITTING DETECTED (High Bias):")
        print("  - The model performs poorly on both training and test data.")
        print("  - Solution: Use a more complex model, engineer better features, or train for more epochs.")
    else:
        print("-> GOOD FIT (Balanced Model):")
        print("  - The model generalizes well. Both Training R2 and Testing R2 are close and strong.")
        print("  - This model is ready for integration into your E-commerce Backend!")

if __name__ == '__main__':
    main()
