import joblib
import os
from services.feature_extractor import extract_features

# Load model once
MODEL_PATH = os.path.join(os.path.dirname(__file__), "phishing_model.pkl")
model = joblib.load(MODEL_PATH)


def predict_url(url: str):
    try:
        features = extract_features(url)
        prediction = model.predict([features])[0]
        probabilities = model.predict_proba([features])[0]

        benign_prob = probabilities[0]
        defacement_prob = probabilities[1]
        phishing_prob = probabilities[2]

        # Convert to ML score (0–100)
        ml_score = round(
            (defacement_prob * 50) +
            (phishing_prob * 100)
        )

        reasons = []

        if prediction == 2:
            reasons.append("The URL Structure closely matches known phishing patterns")
        elif prediction == 1:
            reasons.append("Machine Learning Model detected moderately suspicious patterns")
        else:
            reasons.append("Machine Learning Model found no significant risk patterns")

        return ml_score, reasons

    except Exception as e:
        return 0, [f"ML prediction failed: {str(e)}"]