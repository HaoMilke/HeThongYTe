import api from "./api";

export const aiService = {
  analyzeSymptoms: async (payload) => {
    const data =
      typeof payload === "string"
        ? { symptoms: payload }
        : payload;

    const response = await api.post(
      "/api/ai/analyze",
      data
    );

    return {
      ...response,

      suggestedSpecialty:
        response?.suggestedSpecialty ||
        response?.recommended_specialization ||
        response?.recommendedSpecialization ||
        "Nội tổng quát",

      riskLevel:
        response?.riskLevel ||
        response?.risk_level ||
        "LOW",

      matchedSymptoms:
        response?.matchedSymptoms ||
        response?.matched_symptoms ||
        [],

      selfCare:
        response?.selfCare ||
        response?.self_care ||
        [],

      warningSigns:
        response?.warningSigns ||
        response?.warning_signs ||
        [],

      followUpQuestions:
        response?.followUpQuestions ||
        response?.follow_up_questions ||
        [],

      whenToSeekCare:
        response?.whenToSeekCare ||
        response?.when_to_seek_care ||
        "",
    };
  },
};

export default aiService;
