import os
import random
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_PATH = os.path.join(MODEL_DIR, "random_forest_model.pkl")

class ModelTrainer:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=100, random_state=42)
        self.is_trained = False
        self.r2_score = 0.88

    def generate_training_data(self, samples: int = 1200) -> pd.DataFrame:
        """
        Generates realistic training dataset for queue wait predictions based on queue parameters.
        """
        data = []
        random.seed(42)

        for _ in range(samples):
            people_ahead = random.randint(0, 30)
            avg_service = round(random.uniform(3.0, 25.0), 1)
            active_counters = random.randint(1, 6)
            hour = random.randint(8, 18)
            day = random.randint(0, 6)
            hist_avg_wait = round(random.uniform(5.0, 45.0), 1)
            cancel_rate = round(random.uniform(0.01, 0.12), 3)
            no_show_rate = round(random.uniform(0.01, 0.08), 3)

            # Target actual wait calculation with peak hour and counter factors
            peak_factor = 1.25 if (10 <= hour <= 12 or 14 <= hour <= 16) else 0.95
            weekend_factor = 0.85 if day >= 5 else 1.05

            baseline = (people_ahead * avg_service) / max(active_counters, 1)
            actual_wait = max(
                0.0,
                baseline * peak_factor * weekend_factor * (1.0 - cancel_rate) + random.uniform(-1.5, 1.5)
            )

            data.append({
                "people_ahead": people_ahead,
                "average_service_time": avg_service,
                "active_counters": active_counters,
                "hour_of_day": hour,
                "day_of_week": day,
                "historical_average_wait": hist_avg_wait,
                "cancellation_rate": cancel_rate,
                "no_show_rate": no_show_rate,
                "actual_wait": round(actual_wait, 2)
            })

        return pd.DataFrame(data)

    def train_model(self) -> dict:
        os.makedirs(MODEL_DIR, exist_ok=True)
        df = self.generate_training_data()

        feature_cols = [
            "people_ahead", "average_service_time", "active_counters",
            "hour_of_day", "day_of_week", "historical_average_wait",
            "cancellation_rate", "no_show_rate"
        ]
        X = df[feature_cols]
        y = df["actual_wait"]

        self.model.fit(X, y)
        predictions = self.model.predict(X)
        self.r2_score = round(float(r2_score(y, predictions)), 3)
        self.is_trained = True

        # Save model
        joblib.dump({"model": self.model, "r2_score": self.r2_score}, MODEL_PATH)

        return {
            "status": "success",
            "samples_count": len(df),
            "r2_score": self.r2_score,
            "algorithm": "RandomForestRegressor",
            "model_path": MODEL_PATH
        }

trainer = ModelTrainer()
