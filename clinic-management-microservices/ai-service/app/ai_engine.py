from app.schemas import SymptomAnalysisRequest


SPECIALIZATION_RULES = {
    "Cardiology": [
        "dau nguc",
        "kho tho",
        "tim dap nhanh",
        "hoi hop",
        "dau tim",
    ],

    "Neurology": [
        "dau dau",
        "chong mat",
        "te tay",
        "te chan",
        "co giat",
        "mat y thuc",
    ],

    "Gastroenterology": [
        "dau bung",
        "buon non",
        "non",
        "tieu chay",
        "day bung",
    ],

    "Dermatology": [
        "ngua",
        "phat ban",
        "noi man",
        "mun",
        "di ung da",
    ],

    "ENT": [
        "dau hong",
        "nghet mui",
        "so mui",
        "dau tai",
        "u tai",
    ],

    "Respiratory": [
        "ho",
        "kho tho",
        "dau nguc khi tho",
        "kho khe",
    ],
}


HIGH_RISK_KEYWORDS = {
    "dau nguc",
    "kho tho nang",
    "mat y thuc",
    "co giat",
    "liet",
    "ho ra mau",
}


def analyze_symptoms(request: SymptomAnalysisRequest) -> dict:

    symptoms = [
        symptom.strip().lower()
        for symptom in request.symptoms
    ]

    scores: dict[str, int] = {}

    matched_symptoms: list[str] = []

    for specialization, keywords in SPECIALIZATION_RULES.items():

        score = 0

        for symptom in symptoms:
            for keyword in keywords:

                if keyword in symptom:
                    score += 1

                    if symptom not in matched_symptoms:
                        matched_symptoms.append(symptom)

        scores[specialization] = score

    recommended_specialization = max(
        scores,
        key=scores.get
    )

    if scores[recommended_specialization] == 0:
        recommended_specialization = "General Medicine"

    high_risk_detected = any(
        keyword in symptom
        for symptom in symptoms
        for keyword in HIGH_RISK_KEYWORDS
    )

    if high_risk_detected or request.severity >= 9:
        risk_level = "HIGH"

    elif (
        request.severity >= 6
        or request.duration_days >= 7
        or request.age >= 65
    ):
        risk_level = "MEDIUM"

    else:
        risk_level = "LOW"

    if risk_level == "HIGH":
        advice = (
            "Triệu chứng có dấu hiệu nguy cơ cao. "
            "Nên được nhân viên y tế đánh giá sớm."
        )

    elif risk_level == "MEDIUM":
        advice = (
            "Nên đặt lịch khám với chuyên khoa được gợi ý "
            "để được đánh giá trực tiếp."
        )

    else:
        advice = (
            "Có thể theo dõi triệu chứng và đặt lịch khám "
            "nếu triệu chứng kéo dài hoặc nặng hơn."
        )

    return {
        "risk_level": risk_level,
        "recommended_specialization": recommended_specialization,
        "matched_symptoms": matched_symptoms,
        "advice": advice,
    }