from pydantic import BaseModel, Field


class SymptomAnalysisRequest(BaseModel):
    age: int = Field(ge=0, le=120)
    symptoms: list[str]
    duration_days: int = Field(default=1, ge=0)
    severity: int = Field(default=5, ge=1, le=10)


class SymptomAnalysisResponse(BaseModel):
    risk_level: str
    recommended_specialization: str
    matched_symptoms: list[str]
    advice: str