from fastapi import FastAPI

from app.schemas import (
    SymptomAnalysisRequest,
    SymptomAnalysisResponse,
)

from app.ai_engine import analyze_symptoms


app = FastAPI(
    title="Clinic AI Service",
    version="1.0.0"
)


@app.get("/")
def home():
    return {
        "service": "AI Service",
        "status": "running"
    }


@app.get("/health")
def health():
    return {
        "status": "UP"
    }


@app.post(
    "/api/ai/analyze",
    response_model=SymptomAnalysisResponse
)
def analyze(request: SymptomAnalysisRequest):

    result = analyze_symptoms(request)

    return SymptomAnalysisResponse(**result)