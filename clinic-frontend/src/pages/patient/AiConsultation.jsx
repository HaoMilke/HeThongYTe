import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { aiService } from '../../services/aiService';
import { Sparkles, Activity, CheckCircle2, ArrowRight, ShieldAlert, HeartPulse } from 'lucide-react';

const commonSymptomsList = [
  { id: 'fever', label: 'Sốt / Thân nhiệt cao' },
  { id: 'cough', label: 'Ho khan / Ho có đờm' },
  { id: 'sore_throat', label: 'Đau rát họng' },
  { id: 'headache', label: 'Đau đầu / Chóng mặt' },
  { id: 'chest_pain', label: 'Đau ngực / Tức ngực' },
  { id: 'shortness_breath', label: 'Khó thở / Thở gấp' },
  { id: 'stomach_pain', label: 'Đau bụng / Trào ngược' },
  { id: 'skin_rash', label: 'Mẩn ngứa / Dị ứng da' },
  { id: 'eye_redness', label: 'Đau mắt / Đỏ mắt' },
  { id: 'fatigue', label: 'Mệt mỏi / Uể uải toàn thân' },
];

export const AiConsultation = () => {
  const [age, setAge] = useState(30);
  const [selectedSymptoms, setSelectedSymptoms] = useState(['fever', 'sore_throat']);
  const [customSymptom, setCustomSymptom] = useState('');
  const [durationDays, setDurationDays] = useState(2);
  const [severity, setSeverity] = useState(5);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const toggleSymptom = (id) => {
    if (selectedSymptoms.includes(id)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== id));
    } else {
      setSelectedSymptoms([...selectedSymptoms, id]);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    const symptomLabels = selectedSymptoms.map(
      (id) => commonSymptomsList.find((s) => s.id === id)?.label
    );
    if (customSymptom) symptomLabels.push(customSymptom);

    const payload = {
      age: Number(age),
      symptoms: symptomLabels,
      duration_days: Number(durationDays),
      severity: Number(severity),
    };

    try {
      const res = await aiService.analyzeSymptoms(payload);
      setResult(res);
    } catch (err) {
      console.error('AI analysis failed:', err);
      setResult({
        error: err?.message || 'AI Service hiện không phản hồi. Vui lòng thử lại sau.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div className="text-center space-y-2">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-purple-500/30">
          <Sparkles className="w-7 h-7 animate-pulse" />
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">
          Trợ Lý AI Tư Vấn Chuyên Khoa
        </h1>
        <p className="text-sm text-slate-500 max-w-lg mx-auto">
          Thuật toán Machine Learning phân tích triệu chứng & tư vấn Chuyên khoa khám phù hợp
        </p>
      </div>

      {/* Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-xs text-purple-700 dark:text-purple-300 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 shrink-0 text-purple-600" />
        <span>
          <strong>Lưu ý quan trọng: </strong> Kết quả AI chỉ mang tính hỗ trợ tham khảo, không thay thế cho chẩn đoán chính thức từ bác sĩ chuyên khoa.
        </span>
      </div>

      <div className="glass-panel p-6 sm:p-8 space-y-6 border border-purple-500/20 shadow-2xl relative">
        <form onSubmit={handleAnalyze} className="space-y-6">
          
          {/* 1. AGE */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
              1. Độ tuổi của bạn (Tuổi): <span className="text-purple-600 font-extrabold">{age} tuổi</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full accent-purple-600"
            />
          </div>

          {/* 2. SYMPTOMS CHECKLIST */}
          <div>
            <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
              2. Chọn các triệu chứng bạn đang gặp phải:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commonSymptomsList.map((item) => {
                const checked = selectedSymptoms.includes(item.id);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleSymptom(item.id)}
                    className={`p-2.5 rounded-xl border text-left text-xs font-semibold transition-all flex items-center gap-2 ${
                      checked
                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/20'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-purple-300'
                    }`}
                  >
                    <input type="checkbox" checked={checked} readOnly className="accent-purple-600" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-3">
              <input
                type="text"
                value={customSymptom}
                onChange={(e) => setCustomSymptom(e.target.value)}
                placeholder="Triệu chứng khác (nếu có)..."
                className="input-field text-xs"
              />
            </div>
          </div>

          {/* 3. DURATION & SEVERITY */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                3. Thời gian đã bị triệu chứng:
              </label>
              <select
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                className="input-field text-xs"
              >
                <option value="1">1 Ngày</option>
                <option value="2">2 - 3 Ngày</option>
                <option value="5">4 - 7 Ngày</option>
                <option value="14">Trên 1 Tuần</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                4. Mức độ mệt mỏi/đau nhức: <span className="text-purple-600 font-extrabold">{severity}/10</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full accent-purple-600"
              />
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn-ai w-full py-4 text-base font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Activity className="w-5 h-5 animate-spin" />
                <span>AI đang phân tích triệu chứng...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Phân tích & Đề xuất Chuyên khoa</span>
              </>
            )}
          </button>

        </form>

        {/* AI RESULT BOARD */}
        {result?.error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>{result.error}</span>
          </div>
        )}

        {result && !result.error && (
          <div className="p-6 rounded-2xl bg-purple-50/80 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-800 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-5 h-5" /> Kết Quả Phân Tích AI
              </span>
              <span className="badge badge-purple">Độ tin cậy: {result.confidenceScore || 90}%</span>
            </div>

            <div>
              <span className="text-xs text-slate-500 block">Chuyên khoa khám khuyến nghị:</span>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                {result.suggestedSpecialty || 'Nội tổng quát'}
              </h3>
            </div>

            {result.advice && (
              <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 border border-purple-100 dark:border-purple-900">
                <strong className="text-purple-600 dark:text-purple-400">Lời khuyên chuyên môn: </strong>
                {result.advice}
              </div>
            )}

            <button
              onClick={() => navigate(`/patient/book?specialty=${encodeURIComponent(result.suggestedSpecialty || 'Nội tổng quát')}`)}
              className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              <span>Xem danh sách bác sĩ {result.suggestedSpecialty} & Đặt lịch</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AiConsultation;
