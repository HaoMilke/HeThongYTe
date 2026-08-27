import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { aiService } from "../services/aiService";
import {
  Sparkles,
  X,
  Activity,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  HeartPulse,
  ListChecks,
  CircleHelp,
} from "lucide-react";

const riskMeta = {
  LOW: {
    label: "Nguy cơ thấp",
    className:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
  },
  MEDIUM: {
    label: "Cần theo dõi",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300",
  },
  HIGH: {
    label: "Cần đánh giá sớm",
    className:
      "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300",
  },
};

const ResultList = ({ title, icon: Icon, items, className = "" }) => {
  if (!items?.length) return null;

  return (
    <div className={`rounded-xl border p-4 ${className}`}>
      <h5 className="font-bold text-sm flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" />
        {title}
      </h5>

      <ul className="space-y-1.5 text-xs leading-relaxed">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex gap-2">
            <span className="font-black">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const AiSymptomModal = ({ isOpen, onClose }) => {
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAnalyze = async (event) => {
    event.preventDefault();

    if (!symptoms.trim()) {
      setError("Vui lòng nhập triệu chứng của bạn");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await aiService.analyzeSymptoms(symptoms);
      setResult(response);
    } catch (requestError) {
      console.error("AI Analysis error:", requestError);

      setError(
        requestError?.message ||
          "AI Service hiện không phản hồi. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBookSpecialty = () => {
    const specialty =
      result?.suggestedSpecialty ||
      result?.recommended_specialization ||
      "Nội tổng quát";

    onClose();

    navigate(
      `/book?specialty=${encodeURIComponent(specialty)}`
    );
  };

  const risk = riskMeta[result?.riskLevel || result?.risk_level] ||
    riskMeta.LOW;

  return (
    <div className="modal-overlay">
      <div className="modal-container p-6 animate-fade-in relative overflow-y-auto max-h-[92vh] border border-purple-500/30">
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>

            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                Trợ lý AI Tư vấn Triệu chứng
              </h3>

              <p className="text-xs text-slate-500">
                Hỗ trợ định hướng chuyên khoa và mức độ cần đi khám
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Mô tả triệu chứng của bạn
            </label>

            <textarea
              value={symptoms}
              onChange={(event) =>
                setSymptoms(event.target.value)
              }
              rows={4}
              placeholder="Ví dụ: đau bụng quanh rốn, buồn nôn từ hôm qua, ăn uống kém..."
              className="input-field resize-none focus:ring-2 focus:ring-purple-500/20"
            />

            <p className="small-text mt-1">
              Mô tả càng rõ vị trí đau, thời gian bị và triệu chứng kèm theo thì kết quả càng hữu ích.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-ai w-full py-3 text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                <span>Đang phân tích triệu chứng...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Nhận tư vấn từ AI</span>
              </>
            )}
          </button>
        </form>

        {result && (
          <div className="mt-5 space-y-3 animate-fade-in">
            <div className="p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Kết quả định hướng
                </span>

                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${risk.className}`}>
                  {risk.label}
                </span>
              </div>

              <p className="text-xs text-slate-500">
                Chuyên khoa được gợi ý
              </p>

              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {result.suggestedSpecialty ||
                  result.recommended_specialization ||
                  "Nội tổng quát"}
              </h4>

              {result.summary && (
                <p className="text-sm leading-relaxed mt-2 text-slate-700 dark:text-slate-300">
                  {result.summary}
                </p>
              )}
            </div>

            {result.advice && (
              <div className="p-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30">
                <h5 className="font-bold text-sm flex items-center gap-2 mb-1">
                  <HeartPulse className="w-4 h-4" />
                  Hướng xử trí
                </h5>

                <p className="text-xs leading-relaxed">
                  {result.advice}
                </p>

                {result.whenToSeekCare && (
                  <p className="text-xs leading-relaxed mt-2 font-semibold">
                    {result.whenToSeekCare}
                  </p>
                )}
              </div>
            )}

            <ResultList
              title="Có thể làm ngay"
              icon={ListChecks}
              items={result.selfCare}
              className="border-emerald-200 bg-emerald-50/70 dark:border-emerald-900 dark:bg-emerald-950/30"
            />

            <ResultList
              title="Dấu hiệu cần đi khám ngay"
              icon={ShieldAlert}
              items={result.warningSigns}
              className="border-rose-200 bg-rose-50/70 dark:border-rose-900 dark:bg-rose-950/30"
            />

            <ResultList
              title="Thông tin nên theo dõi thêm"
              icon={CircleHelp}
              items={result.followUpQuestions}
              className="border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
            />

            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-xs text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
              {result.disclaimer ||
                "Kết quả chỉ hỗ trợ định hướng, không thay thế chẩn đoán của bác sĩ."}
            </div>

            <button
              type="button"
              onClick={handleBookSpecialty}
              className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
            >
              <span>Đặt lịch khám chuyên khoa này</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AiSymptomModal;
