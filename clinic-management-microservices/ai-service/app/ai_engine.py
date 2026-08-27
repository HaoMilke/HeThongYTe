import re
import unicodedata

from app.schemas import SymptomAnalysisRequest


SPECIALIZATION_RULES = {
    "Tim mạch": [
        "dau nguc",
        "tuc nguc",
        "kho tho",
        "tim dap nhanh",
        "hoi hop",
        "dau tim",
    ],

    "Tai Mũi Họng": [
        "dau hong",
        "nghet mui",
        "so mui",
        "dau tai",
        "u tai",
        "khan tieng",
        "viem hong",
    ],

    "Nội tổng quát": [
        "dau dau",
        "chong mat",
        "met moi",
        "sot",
        "ho",
        "kho tho",
        "te tay",
        "te chan",
        "mat ngu",
        "suy nhuoc",
    ],

    "Nhi khoa": [
        "tre em",
        "tre nho",
        "em be",
        "be bi",
        "be sot",
        "be ho",
    ],

    "Da liễu": [
        "ngua",
        "phat ban",
        "noi man",
        "mun",
        "di ung da",
        "viem da",
        "noi me day",
    ],

    "Mắt": [
        "dau mat",
        "do mat",
        "mo mat",
        "ngua mat",
        "chay nuoc mat",
        "nhuc mat",
        "giam thi luc",
    ],

    "Cơ Xương Khớp": [
        "dau lung",
        "dau khop",
        "dau goi",
        "dau vai",
        "dau co",
        "dau xuong",
        "dau cot song",
        "cung khop",
    ],

    "Tiêu hóa": [
        "dau bung",
        "buon non",
        "non",
        "tieu chay",
        "day bung",
        "dau da day",
        "tao bon",
        "trao nguoc",
    ],
}


HIGH_RISK_KEYWORDS = {
    "dau nguc",
    "kho tho nang",
    "mat y thuc",
    "co giat",
    "liet",
    "ho ra mau",
    "ngat",
    "non ra mau",
    "di ngoai ra mau",
    "dau dau du doi",
}


SELF_CARE_BY_SPECIALTY = {
    "Tim mạch": [
        "Nghỉ ngơi, tránh gắng sức trong lúc đang có triệu chứng.",
        "Theo dõi huyết áp và nhịp tim nếu có thiết bị tại nhà.",
        "Không tự ý dùng thuốc tim mạch khi chưa có chỉ định.",
    ],
    "Tai Mũi Họng": [
        "Uống đủ nước và giữ ấm vùng cổ.",
        "Có thể súc họng bằng nước muối sinh lý nếu phù hợp.",
        "Tránh khói thuốc, bụi và các tác nhân gây kích ứng.",
    ],
    "Nội tổng quát": [
        "Nghỉ ngơi và uống đủ nước.",
        "Theo dõi nhiệt độ và sự thay đổi của triệu chứng.",
        "Ăn uống nhẹ, dễ tiêu nếu đang mệt hoặc chán ăn.",
    ],
    "Nhi khoa": [
        "Cho trẻ nghỉ ngơi và bổ sung đủ nước phù hợp lứa tuổi.",
        "Theo dõi nhiệt độ, nhịp thở và mức độ tỉnh táo của trẻ.",
        "Không tự ý dùng thuốc cho trẻ nếu chưa chắc về liều dùng.",
    ],
    "Da liễu": [
        "Giữ vùng da sạch và khô.",
        "Tránh gãi hoặc tự bôi thuốc không rõ thành phần.",
        "Ngừng sử dụng sản phẩm mới nếu nghi ngờ gây kích ứng.",
    ],
    "Mắt": [
        "Hạn chế dụi mắt.",
        "Cho mắt nghỉ ngơi nếu sử dụng màn hình nhiều.",
        "Không tự ý dùng thuốc nhỏ mắt có kháng sinh hoặc corticoid.",
    ],
    "Cơ Xương Khớp": [
        "Hạn chế vận động gây đau và tránh mang vật nặng.",
        "Có thể nghỉ ngơi và theo dõi mức độ đau.",
        "Duy trì tư thế làm việc và nghỉ ngơi phù hợp.",
    ],
    "Tiêu hóa": [
        "Uống đủ nước, đặc biệt nếu có tiêu chảy hoặc nôn.",
        "Ăn thức ăn mềm, dễ tiêu và chia nhỏ bữa.",
        "Tránh rượu bia, thức ăn nhiều dầu mỡ và cay trong lúc có triệu chứng.",
    ],
}


WARNING_SIGNS_BY_SPECIALTY = {
    "Tim mạch": [
        "Đau ngực dữ dội hoặc kéo dài.",
        "Khó thở tăng nhanh, ngất hoặc vã mồ hôi lạnh.",
        "Đau lan lên hàm, vai hoặc cánh tay.",
    ],
    "Tai Mũi Họng": [
        "Khó thở hoặc khó nuốt tăng nhanh.",
        "Sốt cao kéo dài hoặc sưng vùng cổ.",
        "Chảy máu tai hoặc mất thính lực đột ngột.",
    ],
    "Nội tổng quát": [
        "Lơ mơ, ngất, co giật hoặc khó thở.",
        "Sốt cao kéo dài hoặc tình trạng xấu đi nhanh.",
        "Đau dữ dội bất thường.",
    ],
    "Nhi khoa": [
        "Trẻ li bì, khó đánh thức hoặc co giật.",
        "Khó thở, tím tái hoặc bỏ bú hoàn toàn.",
        "Sốt cao kéo dài hoặc mất nước rõ.",
    ],
    "Da liễu": [
        "Phát ban kèm khó thở hoặc sưng môi/lưỡi.",
        "Tổn thương lan nhanh, đau nhiều hoặc có mủ.",
        "Sốt kèm phát ban toàn thân.",
    ],
    "Mắt": [
        "Mất thị lực hoặc giảm thị lực đột ngột.",
        "Đau mắt dữ dội.",
        "Chấn thương mắt hoặc hóa chất bắn vào mắt.",
    ],
    "Cơ Xương Khớp": [
        "Yếu hoặc liệt tay chân.",
        "Mất kiểm soát tiểu tiện hoặc đại tiện.",
        "Đau sau chấn thương mạnh hoặc biến dạng chi.",
    ],
    "Tiêu hóa": [
        "Nôn ra máu hoặc đi ngoài ra máu.",
        "Đau bụng dữ dội, bụng cứng.",
        "Nôn liên tục hoặc dấu hiệu mất nước rõ.",
    ],
}


FOLLOW_UP_BY_SPECIALTY = {
    "Tim mạch": [
        "Cơn đau ngực kéo dài bao lâu và có lan đi đâu không?",
        "Bạn có khó thở, hồi hộp hoặc choáng/ngất không?",
        "Bạn có tiền sử tăng huyết áp hoặc bệnh tim không?",
    ],
    "Tai Mũi Họng": [
        "Triệu chứng bắt đầu từ bao giờ?",
        "Có sốt, ho, nghẹt mũi hoặc khó nuốt không?",
        "Có đau tai, ù tai hoặc giảm thính lực không?",
    ],
    "Nội tổng quát": [
        "Triệu chứng bắt đầu từ bao giờ và đang tăng hay giảm?",
        "Bạn có sốt, khó thở, chóng mặt hoặc đau ở vị trí nào khác không?",
        "Bạn đang dùng thuốc hoặc có bệnh nền nào không?",
    ],
    "Nhi khoa": [
        "Trẻ bao nhiêu tuổi và triệu chứng kéo dài bao lâu?",
        "Trẻ có sốt, bỏ bú/bỏ ăn hoặc khó thở không?",
        "Trẻ có còn tỉnh táo và đi tiểu bình thường không?",
    ],
    "Da liễu": [
        "Tổn thương da xuất hiện ở vị trí nào và có lan rộng không?",
        "Có ngứa, đau, rỉ dịch hoặc sốt không?",
        "Gần đây bạn có dùng mỹ phẩm, thuốc hoặc thức ăn mới không?",
    ],
    "Mắt": [
        "Bạn bị một mắt hay cả hai mắt?",
        "Có đau, đỏ mắt, nhìn mờ hoặc sợ ánh sáng không?",
        "Có chấn thương hoặc dị vật vào mắt không?",
    ],
    "Cơ Xương Khớp": [
        "Đau xuất hiện sau vận động hay chấn thương không?",
        "Có sưng, nóng, đỏ khớp hoặc hạn chế vận động không?",
        "Có tê, yếu tay chân hoặc đau lan không?",
    ],
    "Tiêu hóa": [
        "Đau bụng ở vị trí nào và có liên quan đến ăn uống không?",
        "Có nôn, tiêu chảy, táo bón hoặc sốt không?",
        "Có máu trong phân hoặc chất nôn không?",
    ],
}


def normalize_text(value: str) -> str:
    value = (value or "").strip().lower()
    value = value.replace("đ", "d")

    value = "".join(
        char
        for char in unicodedata.normalize("NFD", value)
        if unicodedata.category(char) != "Mn"
    )

    value = re.sub(r"\s+", " ", value)
    return value.strip()


def prepare_symptoms(raw_symptoms: str | list[str]) -> list[str]:
    if isinstance(raw_symptoms, str):
        items = re.split(r"[,;\n]+", raw_symptoms)
    else:
        items = raw_symptoms

    return [
        normalized
        for item in items
        if (normalized := normalize_text(item))
    ]


def analyze_symptoms(request: SymptomAnalysisRequest) -> dict:
    symptoms = prepare_symptoms(request.symptoms)

    scores: dict[str, int] = {
        specialization: 0
        for specialization in SPECIALIZATION_RULES
    }

    matched_symptoms: list[str] = []

    for specialization, keywords in SPECIALIZATION_RULES.items():
        for symptom in symptoms:
            for keyword in keywords:
                if keyword in symptom:
                    scores[specialization] += 1

                    if symptom not in matched_symptoms:
                        matched_symptoms.append(symptom)

    if request.age <= 15 and symptoms:
        scores["Nhi khoa"] += 2

    recommended_specialization = max(
        scores,
        key=scores.get,
    )

    if scores[recommended_specialization] == 0:
        recommended_specialization = "Nội tổng quát"

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

    if matched_symptoms:
        summary = (
            "Các triệu chứng bạn mô tả có một số dấu hiệu phù hợp "
            f"để ưu tiên đánh giá tại chuyên khoa {recommended_specialization}."
        )
    else:
        summary = (
            "Triệu chứng hiện chưa đủ đặc hiệu để định hướng một chuyên khoa rõ ràng, "
            "nên ưu tiên khám Nội tổng quát để được đánh giá ban đầu."
        )

    if risk_level == "HIGH":
        advice = (
            "Có dấu hiệu cần được đánh giá y tế sớm. "
            "Không nên chỉ theo dõi tại nhà nếu triệu chứng đang nặng lên."
        )
        when_to_seek_care = (
            "Nên đến cơ sở y tế hoặc liên hệ cấp cứu ngay nếu đang có "
            "khó thở, đau ngực dữ dội, ngất, co giật, yếu liệt, chảy máu bất thường "
            "hoặc tình trạng xấu đi nhanh."
        )

    elif risk_level == "MEDIUM":
        advice = (
            "Nên đặt lịch khám trong thời gian sớm để bác sĩ đánh giá trực tiếp, "
            "đặc biệt nếu triệu chứng kéo dài hoặc ảnh hưởng sinh hoạt."
        )
        when_to_seek_care = (
            "Nên đi khám sớm trong ngày hoặc trong 24-48 giờ nếu triệu chứng không cải thiện; "
            "đi cấp cứu nếu xuất hiện dấu hiệu cảnh báo."
        )

    else:
        advice = (
            "Hiện chưa thấy dấu hiệu nguy cơ cao từ thông tin đã nhập. "
            "Bạn có thể theo dõi thêm và đặt lịch nếu triệu chứng kéo dài hoặc tái diễn."
        )
        when_to_seek_care = (
            "Có thể theo dõi tại nhà trong thời gian ngắn nếu tình trạng ổn định; "
            "đi khám nếu kéo dài, nặng hơn hoặc xuất hiện dấu hiệu cảnh báo."
        )

    return {
        "risk_level": risk_level,
        "recommended_specialization": recommended_specialization,
        "matched_symptoms": matched_symptoms,
        "summary": summary,
        "advice": advice,
        "self_care": SELF_CARE_BY_SPECIALTY.get(
            recommended_specialization,
            SELF_CARE_BY_SPECIALTY["Nội tổng quát"],
        ),
        "warning_signs": WARNING_SIGNS_BY_SPECIALTY.get(
            recommended_specialization,
            WARNING_SIGNS_BY_SPECIALTY["Nội tổng quát"],
        ),
        "follow_up_questions": FOLLOW_UP_BY_SPECIALTY.get(
            recommended_specialization,
            FOLLOW_UP_BY_SPECIALTY["Nội tổng quát"],
        ),
        "when_to_seek_care": when_to_seek_care,
        "disclaimer": (
            "Kết quả này chỉ nhằm hỗ trợ định hướng ban đầu, không phải chẩn đoán y khoa "
            "và không thay thế việc thăm khám trực tiếp với bác sĩ."
        ),
    }
