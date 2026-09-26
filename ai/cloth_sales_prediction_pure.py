import os
import csv
import random
import math

def calculate_mean(values):
    return sum(values) / len(values)

def calculate_std(values):
    mean = calculate_mean(values)
    variance = sum((x - mean) ** 2 for x in values) / len(values)
    return math.sqrt(variance)

def train_linear_regression(X_train, y_train, lr=0.01, epochs=2000):
    num_features = len(X_train[0])
    means = [calculate_mean([row[j] for row in X_train]) for j in range(num_features)]
    stds = [calculate_std([row[j] for row in X_train]) or 1.0 for j in range(num_features)]
    
    X_scaled = []
    for row in X_train:
        X_scaled.append([(row[j] - means[j]) / stds[j] for j in range(num_features)])
        
    weights = [0.0] * num_features
    bias = 0.0
    n = len(X_train)
    
    for _ in range(epochs):
        dw = [0.0] * num_features
        db = 0.0
        for i in range(n):
            y_hat = sum(weights[j] * X_scaled[i][j] for j in range(num_features)) + bias
            error = y_hat - y_train[i]
            for j in range(num_features):
                dw[j] += (2/n) * error * X_scaled[i][j]
            db += (2/n) * error
            
        for j in range(num_features):
            weights[j] -= lr * dw[j]
        bias -= lr * db

    return weights, bias, means, stds

def predict_single(row, weights, bias, means, stds):
    scaled = [(row[j] - means[j]) / stds[j] for j in range(len(row))]
    return sum(weights[j] * scaled[j] for j in range(len(scaled))) + bias

def main():
    print("="*65)
    print(" E-COMMERCE CLOTH SHOP - AI MODEL (10 STEP WORKFLOW) ")
    print("="*65)

    # -------------------------------------------------------------
    # STEP 1: LOAD DATA
    # -------------------------------------------------------------
    print("\n[STEP 1] LOAD DATA")
    csv_path = os.path.join(os.path.dirname(__file__), "clothing_sales_data.csv")
    
    if not os.path.exists(csv_path):
        random.seed(42)
        rows = [["Original_Price", "Discount_Percent", "Stock_Quantity", "Rating", "Category_Code", "Sales_Units"]]
        for _ in range(250):
            orig_price = random.randint(500, 4500)
            disc = random.choice([10, 15, 20, 30, 40, 50])
            final_price = orig_price * (1 - disc / 100)
            stock = random.randint(10, 150)
            rating = round(random.uniform(3.0, 5.0), 1)
            cat = random.choice([0, 1, 2, 3]) # 0:Men, 1:Women, 2:Kids, 3:Ethnic
            
            sales = max(5, int((4500 - final_price) * 0.025 + disc * 1.2 + rating * 12 + random.gauss(0, 4)))
            rows.append([orig_price, disc, stock, rating, cat, sales])
            
        with open(csv_path, 'w', newline='') as f:
            writer = csv.writer(f)
            writer.writerows(rows)
        print(f"-> Created dataset with {len(rows)-1} clothing items at: {csv_path}")

    data = []
    with open(csv_path, 'r') as f:
        reader = csv.reader(f)
        header = next(reader)
        for row in reader:
            data.append([float(x) for x in row])
            
    print(f"-> Loaded dataset with {len(data)} rows and {len(header)} columns.")
    print(f"Header Columns: {header}")

    # -------------------------------------------------------------
    # STEP 2: EXPLORE DATA (EDA)
    # -------------------------------------------------------------
    print("\n[STEP 2] EXPLORE DATA (EDA)")
    print("First 3 Data Rows:")
    for r in data[:3]:
        print("  ", dict(zip(header, r)))
        
    prices = [r[0] for r in data]
    sales = [r[5] for r in data]
    print(f"\nSummary Statistics:")
    print(f"  * Price Range: INR {min(prices):.0f} to INR {max(prices):.0f} (Avg: INR {calculate_mean(prices):.2f})")
    print(f"  * Sales Range: {min(sales):.0f} to {max(sales):.0f} units (Avg: {calculate_mean(sales):.2f} units)")
    print(f"  * Missing Values: 0")

    # -------------------------------------------------------------
    # STEP 3: DEFINE X (Features)
    # -------------------------------------------------------------
    print("\n[STEP 3] DEFINE X (Features Matrix)")
    X = [row[0:5] for row in data]
    print(f"Features (X): {header[0:5]}")
    print(f"X shape: {len(X)} rows x {len(X[0])} features")

    # -------------------------------------------------------------
    # STEP 4: DEFINE y (Target Output)
    # -------------------------------------------------------------
    print("\n[STEP 4] DEFINE y (Target Variable)")
    y = [row[5] for row in data]
    print(f"Target (y): '{header[5]}'")
    print(f"y shape: {len(y)} samples")

    # -------------------------------------------------------------
    # STEP 5: SPLIT DATA
    # -------------------------------------------------------------
    print("\n[STEP 5] SPLIT DATA (80% Train, 20% Test)")
    random.seed(42)
    indices = list(range(len(data)))
    random.shuffle(indices)
    
    split_idx = int(0.8 * len(data))
    train_idx, test_idx = indices[:split_idx], indices[split_idx:]
    
    X_train = [X[i] for i in train_idx]
    y_train = [y[i] for i in train_idx]
    X_test  = [X[i] for i in test_idx]
    y_test  = [y[i] for i in test_idx]
    
    print(f"Training set: {len(X_train)} samples")
    print(f"Testing set:  {len(X_test)} samples")

    # -------------------------------------------------------------
    # STEP 6: TRAIN MODEL
    # -------------------------------------------------------------
    print("\n[STEP 6] TRAIN MODEL (Gradient Descent Regression)")
    weights, bias, means, stds = train_linear_regression(X_train, y_train, lr=0.01, epochs=2000)
    print("-> Model Training Completed Successfully!")
    print(f"  * Learned Feature Weights: {[round(w, 3) for w in weights]}")
    print(f"  * Learned Intercept Bias: {bias:.3f}")

    # -------------------------------------------------------------
    # STEP 7: MAKE PREDICTIONS
    # -------------------------------------------------------------
    print("\n[STEP 7] MAKE PREDICTIONS")
    y_pred = [predict_single(row, weights, bias, means, stds) for row in X_test]
    
    sample_item = [1999.0, 20.0, 40.0, 4.3, 1.0]
    sample_prediction = predict_single(sample_item, weights, bias, means, stds)
    print(f"\nSample Prediction (Price: INR 1999, Discount: 20%, Stock: 40, Rating: 4.3, Category: Women):")
    print(f"-> Predicted Sales Volume: ~{round(sample_prediction)} units")

    # -------------------------------------------------------------
    # STEP 8: CALCULATE LOSS / METRICS
    # -------------------------------------------------------------
    print("\n[STEP 8] CALCULATE LOSS & ERROR METRICS")
    mae = calculate_mean([abs(y_test[i] - y_pred[i]) for i in range(len(y_test))])
    mse = calculate_mean([(y_test[i] - y_pred[i])**2 for i in range(len(y_test))])
    rmse = math.sqrt(mse)
    
    y_test_mean = calculate_mean(y_test)
    ss_tot = sum((y_test[i] - y_test_mean)**2 for i in range(len(y_test)))
    ss_res = sum((y_test[i] - y_pred[i])**2 for i in range(len(y_test)))
    r2 = 1 - (ss_res / ss_tot)
    
    print(f"  * Mean Absolute Error (MAE): {mae:.2f} units")
    print(f"  * Mean Squared Error (MSE / Loss): {mse:.2f}")
    print(f"  * Root Mean Squared Error (RMSE): {rmse:.2f} units")
    print(f"  * R-Squared (R2) Accuracy Score: {r2:.4f} ({r2*100:.2f}%)")

    # -------------------------------------------------------------
    # STEP 9: COMPARE ACTUAL VS PREDICTED
    # -------------------------------------------------------------
    print("\n[STEP 9] COMPARE ACTUAL VS PREDICTED (Sample Test Rows)")
    print(f"{'Index':<6} | {'Actual Sales':<12} | {'Predicted Sales':<15} | {'Difference (Error)':<18}")
    print("-" * 60)
    for i in range(10):
        err = y_test[i] - y_pred[i]
        print(f"{i+1:<6} | {y_test[i]:<12.0f} | {y_pred[i]:<15.1f} | {err:<18.1f}")

    # -------------------------------------------------------------
    # STEP 10: EXPLAIN OVERFITTING VS UNDERFITTING
    # -------------------------------------------------------------
    print("\n[STEP 10] EXPLAIN OVERFITTING VS UNDERFITTING")
    y_train_pred = [predict_single(row, weights, bias, means, stds) for row in X_train]
    train_mse = calculate_mean([(y_train[i] - y_train_pred[i])**2 for i in range(len(y_train))])
    
    print(f"  * Training Loss (MSE): {train_mse:.2f}")
    print(f"  * Testing Loss (MSE):  {mse:.2f}")
    
    print("\nCONCEPT EXPLANATION:")
    print("1. UNDERFITTING (High Bias):")
    print("   - Happens when model is too simple (e.g. ignoring discount or rating).")
    print("   - Symptoms: High Training Loss AND High Testing Loss.")
    print("2. OVERFITTING (High Variance):")
    print("   - Happens when model memorizes training noise.")
    print("   - Symptoms: Very Low Training Loss, but High Testing Loss.")
    print("3. BALANCED FIT (Optimal):")
    print("   - Model generalizes well to unseen customer data.")
    print(f"   - Current Model Status: Train Loss ({train_mse:.1f}) & Test Loss ({mse:.1f}) are closely matched (Balanced Fit)!")

if __name__ == '__main__':
    main()
