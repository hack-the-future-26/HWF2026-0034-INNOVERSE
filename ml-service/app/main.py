from fastapi import FastAPI, status
from app.schemas import PredictionRequest, PredictionResponse
from app.predictor import predictor
from app.trainer import trainer

app = FastAPI(
    title="Smart Queue ML Prediction Service",
    description="AI-Powered wait time prediction engine using Scikit-Learn RandomForestRegressor.",
    version="1.0.0"
)

@app.get("/")
def root():
    return {
        "service": "Smart Queue ML Prediction Engine",
        "status": "online",
        "model_trained": predictor.model is not None,
        "version": "1.0.0"
    }

@app.post("/predict", response_model=PredictionResponse)
def predict_wait_time(request: PredictionRequest):
    return predictor.predict(request)

@app.post("/train")
def train_model():
    res = trainer.train_model()
    predictor._load_model()
    return res
