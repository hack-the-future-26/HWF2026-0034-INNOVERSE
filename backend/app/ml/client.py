import os
import httpx
from datetime import datetime
from typing import Optional, Dict, Any

class MLServiceClient:
    def __init__(self):
        self.base_url = os.getenv("ML_SERVICE_URL", "http://127.0.0.1:8001")
        self._client = httpx.Client(timeout=0.8)

    def predict_wait_time_sync(
        self,
        people_ahead: int,
        average_service_time: float,
        active_counters: int,
        hour_of_day: Optional[int] = None,
        day_of_week: Optional[int] = None,
        historical_average_wait: float = 20.0,
        cancellation_rate: float = 0.05,
        no_show_rate: float = 0.03
    ) -> Dict[str, Any]:
        now = datetime.now()
        if hour_of_day is None:
            hour_of_day = now.hour
        if day_of_week is None:
            day_of_week = now.weekday()

        payload = {
            "people_ahead": max(0, people_ahead),
            "average_service_time": max(1.0, float(average_service_time)),
            "active_counters": max(1, active_counters),
            "hour_of_day": hour_of_day,
            "day_of_week": day_of_week,
            "historical_average_wait": float(historical_average_wait),
            "cancellation_rate": float(cancellation_rate),
            "no_show_rate": float(no_show_rate)
        }

        try:
            response = self._client.post(f"{self.base_url}/predict", json=payload)
            if response.status_code == 200:
                data = response.json()
                return {
                    "predicted_wait_minutes": int(data.get("predicted_wait_minutes", 0)),
                    "confidence": float(data.get("confidence", 0.87)),
                    "ai_powered": True
                }
        except Exception:
            pass

        # Fallback baseline formula
        counters = max(1, active_counters)
        baseline = int((max(0, people_ahead) * max(1.0, float(average_service_time))) / counters)
        return {
            "predicted_wait_minutes": baseline,
            "confidence": 0.70,
            "ai_powered": False
        }

    async def get_wait_time_prediction(
        self,
        people_ahead: int,
        average_service_time: float,
        active_counters: int,
        hour_of_day: Optional[int] = None,
        day_of_week: Optional[int] = None,
        historical_average_wait: float = 20.0,
        cancellation_rate: float = 0.05,
        no_show_rate: float = 0.03
    ) -> Dict[str, Any]:
        return self.predict_wait_time_sync(
            people_ahead=people_ahead,
            average_service_time=average_service_time,
            active_counters=active_counters,
            hour_of_day=hour_of_day,
            day_of_week=day_of_week,
            historical_average_wait=historical_average_wait,
            cancellation_rate=cancellation_rate,
            no_show_rate=no_show_rate
        )

ml_client = MLServiceClient()

