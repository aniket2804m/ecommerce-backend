import sys
import json
import math

def calculate_size_advisor(data):
    height = float(data.get("height", 170))  # cm
    weight = float(data.get("weight", 70))    # kg
    fit_pref = data.get("fit_preference", "regular").lower() # slim, regular, loose
    gender = data.get("gender", "men").lower()

    # Calculate BMI
    bmi = weight / ((height / 100.0) ** 2)

    # Base size calculation
    if bmi < 18.5:
        base_size = "S"
        chest_inch = 36
    elif 18.5 <= bmi < 23.0:
        base_size = "M"
        chest_inch = 38
    elif 23.0 <= bmi < 27.5:
        base_size = "L"
        chest_inch = 41
    elif 27.5 <= bmi < 32.0:
        base_size = "XL"
        chest_inch = 44
    else:
        base_size = "XXL"
        chest_inch = 47

    # Adjust for fit preference
    sizes = ["S", "M", "L", "XL", "XXL"]
    current_idx = sizes.index(base_size)

    if fit_pref == "loose" and current_idx < len(sizes) - 1:
        recommended_size = sizes[current_idx + 1]
        fit_note = "Upsized by 1 for a trendy, comfortable loose fit."
    elif fit_pref == "slim" and current_idx > 0:
        recommended_size = sizes[current_idx - 1]
        fit_note = "Downsized by 1 for a sleek, tailored body fit."
    else:
        recommended_size = base_size
        fit_note = "True to standard Indian size fit."

    confidence = min(98, max(85, int(95 - abs(bmi - 22) * 1.2)))

    return {
        "status": "success",
        "recommended_size": recommended_size,
        "confidence_score": f"{confidence}%",
        "bmi": round(bmi, 1),
        "estimated_chest_inches": chest_inch,
        "fit_note": fit_note
    }

def process_command(cmd, payload):
    if cmd == "size_advisor":
        return calculate_size_advisor(payload)
    else:
        return {"error": f"Unknown command {cmd}"}

if __name__ == "__main__":
    if len(sys.argv) > 2:
        command = sys.argv[1]
        raw_payload = sys.argv[2]
        try:
            payload = json.loads(raw_payload)
            print(json.dumps(process_command(command, payload)))
        except Exception as e:
            print(json.dumps({"error": str(e)}))
    else:
        print(json.dumps(calculate_size_advisor({"height": 175, "weight": 72, "fit_preference": "regular"})))
