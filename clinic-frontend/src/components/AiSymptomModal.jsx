import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../services/aiService';
import { Sparkles, X, Activity, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export const AiSymptomModal = ({ isOpen, onClose }) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError('Vui lòng nhập triệu chứng của bạn');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await aiService.analyzeSymptoms(symptoms);
      setResult(res);
    } catch (err) {
      console.error('AI Analysis error:', err);
      setError(err?.message || 'AI Service hiện không phản hồi. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleBookSpecialty = () => {
    onClose();
    if (result?.suggestedSpecialty) {
      navigate(`/book?specialty=${encodeURIComponent(result.suggestedSpecialty)}`);
    } else {
      navigate('/book');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container p-6 animate-fade-in relative overflow-hidden border border-purple-500/30">
        
        {/* Decorative AI Glow background */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-purple-600 to-indigo-500 bg-clip-text text-transparent">
                Trợ lý AI Chẩn đoán Triệu chứng
              </h3>
              <p className="text-xs text-slate-500">FastAPI ML Engine - Tư vấn Chuyên khoa tự động</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAnalyze} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Mô tả triệu chứng của bạn (Ví dụ: Ho kéo dài, đau họng, sốt nhẹ vào buổi chiều)
            </label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              rows={3}
              placeholder="Nhập chi tiết biểu hiện mệt mỏi, đau nhức, thời gian bị triệu chứng..."
              className="input-field resize-none focus:ring-2 focus:ring-purple-500/20"
            />
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
                <span>AI đang phân tích dữ liệu y khoa...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Phân tích ngay bằng AI</span>
              </>
            )}
          </button>
        </form>

        {/* Analysis Result Card */}
        {result && (
          <div className="mt-6 p-4 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/50 animate-fade-in space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Kết quả phân tích gợi ý
              </span>
              {result.confidenceScore && (
                <span className="badge badge-purple">
                  Độ tin cậy: {result.confidenceScore}%
                </span>
              )}
            </div>

            <div>
              <p className="text-xs text-slate-500">Chuyên khoa phù hợp nhất:</p>
              <h4 className="text-xl font-black text-slate-900 dark:text-white">
                {result.suggestedSpecialty || result.specialty || 'Nội tổng quát'}
              </h4>
            </div>

            {result.advice && (
              <div className="p-3 rounded-lg bg-white/80 dark:bg-slate-900/80 text-xs text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-900">
                <strong className="text-purple-600 dark:text-purple-400">Lời khuyên chuyên môn: </strong>
                {result.advice}
              </div>
            )}

            <div className="pt-2">
              <button
                onClick={handleBookSpecialty}
                className="btn-primary w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2"
              >
                <span>Đặt lịch khám chuyên khoa này ngay</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiSymptomModal;
