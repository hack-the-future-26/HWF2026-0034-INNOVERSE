from pydantic import BaseModel, Field

class PredictionRequest(BaseModel):
    people_ahead: int = Field(..., example=6)
    average_service_time: float = Field(..., example=5.0)
    active_counters: int = Field(..., example=3)
    hour_of_day: int = Field(..., example=14)
    day_of_week: int = Field(..., example=2)
    historical_average_wait: float = Field(default=20.0, example=20.0)
    cancellation_rate: float = Field(default=0.05, example=0.05)
    no_show_rate: float = Field(default=0.03, example=0.03)

class PredictionResponse(BaseModel):
    predicted_wait_minutes: int = Field(..., example=18)
    confidence: float = Field(..., example=0.87)
    algorithm_used: str = Field(..., example="RandomForestRegressor")
