import os
import joblib
import numpy as np
import pandas as pd
from app.schemas import PredictionRequest, PredictionResponse
from app.trainer import MODEL_PATH, trainer

class QueuePredictor:
    def __init__(self):
        self.model = None
        self.r2_score = 0.87
        self._load_model()

    def _load_model(self):
        if os.path.exists(MODEL_PATH):
            try:
                data = joblib.load(MODEL_PATH)
                self.model = data["model"]
                self.r2_score = data.get("r2_score", 0.87)
            except Exception:
                self.model = None
        else:
            # Train initial model automatically
            try:
                result = trainer.train_model()
                data = joblib.load(MODEL_PATH)
                self.model = data["model"]
                self.r2_score = data.get("r2_score", 0.87)
            except Exception:
                self.model = None

    def calculate_baseline(self, req: PredictionRequest) -> int:
        counters = max(req.active_counters, 1)
        wait = (req.people_ahead * req.average_service_time) / counters
        return max(1, int(round(wait)))

    def predict(self, req: PredictionRequest) -> PredictionResponse:
        baseline_val = self.calculate_baseline(req)

        # If model is not loaded or sparse, use baseline formula
        if self.model is None:
            return PredictionResponse(
                predicted_wait_minutes=baseline_val,
                confidence=0.70,
                algorithm_used="Baseline Formula"
            )

        try:
            input_df = pd.DataFrame([{
                "people_ahead": req.people_ahead,
                "average_service_time": req.average_service_time,
                "active_counters": max(req.active_counters, 1),
                "hour_of_day": req.hour_of_day,
                "day_of_week": req.day_of_week,
                "historical_average_wait": req.historical_average_wait,
                "cancellation_rate": req.cancellation_rate,
                "no_show_rate": req.no_show_rate
            }])

            predicted = self.model.predict(input_df)[0]
            predicted_minutes = max(1, int(round(predicted)))

            # Calculate realistic confidence based on model performance
            confidence = min(0.95, max(0.65, round(self.r2_score, 2)))

            return PredictionResponse(
                predicted_wait_minutes=predicted_minutes,
                confidence=confidence,
                algorithm_used="RandomForestRegressor"
            )
        except Exception:
            return PredictionResponse(
                predicted_wait_minutes=baseline_val,
                confidence=0.70,
                algorithm_used="Baseline Fallback"
            )

predictor = QueuePredictor()
