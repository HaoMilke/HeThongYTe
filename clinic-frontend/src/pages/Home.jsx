import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorService } from '../services/doctorService';
import { 
  Stethoscope, 
  Sparkles, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Award, 
  Users, 
  ArrowRight,
  HeartPulse,
  Activity,
  CheckCircle,
  Star,
  Building2,
  CheckCircle2,
  PhoneCall,
  Search,
  MapPin
} from 'lucide-react';

const doctorAvatars = [
  'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1594824813566-8885536489a6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=600&q=80',
];

const specialtyImages = {
  'Tai Mũi Họng': 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=600&q=80',
  'Tim Mạch': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
  'Nội tổng quát': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=80',
  'Nhi Khoa': 'https://images.unsplash.com/photo-1631815588090-d4bfec5b1cdb?auto=format&fit=crop&w=600&q=80',
};

export const Home = ({ onOpenAiModal }) => {
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [bookingDate, setBookingDate] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoadError('');
      try {
        const [specRes, docRes] = await Promise.all([
          doctorService.getActiveSpecialties(),
          doctorService.getAvailableDoctors()
        ]);

        setSpecialties(Array.isArray(specRes) ? specRes : []);
        setDoctors(Array.isArray(docRes) ? docRes : []);
      } catch (err) {
        console.error('Error fetching home data:', err);
        setSpecialties([]);
        setDoctors([]);
        setLoadError(err?.message || 'Không thể tải danh sách chuyên khoa và bác sĩ.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickBookSubmit = (e) => {
    e.preventDefault();
    let url = '/book?';
    if (selectedSpecialty) url += `specialty=${encodeURIComponent(selectedSpecialty)}&`;
    if (selectedDoctor) url += `doctorId=${selectedDoctor}&`;
    if (bookingDate) url += `date=${bookingDate}`;
    navigate(url);
  };

  return (
    <div className="space-y-16 pb-16">
      {loadError && <div className="max-w-7xl mx-auto px-4 pt-4"><div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700">{loadError}</div></div>}
      
      {/* 1. HERO BANNER & QUICK BOOKING WIDGET */}
      <section className="relative bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-extrabold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-blue-400" /> Hệ Thống Đa Khoa Quốc Tế MediClinic 2026
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight text-white">
              Bệnh Viện Đa Khoa <br />
              <span className="text-blue-400">Chất Lượng Chẩn Đoán Hàng Đầu</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Hệ thống phòng khám quy tụ đội ngũ Giáo sư, Bác sĩ CKII giàu kinh nghiệm, trang thiết bị xét nghiệm ISO 9001:2015 cùng Trợ lý AI tư vấn sức khỏe 24/7.
            </p>

            {/* QUICK BOOKING BAR - PERFECT HIGH CONTRAST */}
            <form onSubmit={handleQuickBookSubmit} className="saas-card bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4" /> Tra Cứu & Đặt Lịch Khám Nhanh
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={selectedSpecialty}
                  onChange={(e) => setSelectedSpecialty(e.target.value)}
                  className="input-field text-xs h-10 font-medium"
                >
                  <option value="">-- Chọn Chuyên khoa --</option>
                  {specialties.map(s => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>

                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="input-field text-xs h-10 font-medium"
                >
                  <option value="">-- Chọn Bác sĩ khám --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>

                <input
                  type="date"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="input-field text-xs h-10 font-medium"
                />
              </div>

              <button type="submit" className="btn-primary w-full h-11 text-xs font-bold shadow-md">
                <Search className="w-4 h-4" /> Tìm Bác Sĩ & Đặt Lịch Ngay
              </button>
            </form>

          </div>

          {/* Right Banner Image */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl border border-white/20 relative group">
              <img
                src="https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80"
                alt="Hospital Facility"
                className="w-full h-[420px] object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-slate-900/90 border border-white/20 backdrop-blur-md space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-400">ISO 9001:2015 Certified</span>
                <h4 className="font-bold text-sm text-white">Trung Tâm Xét Nghiệm & Chẩn Đoán Hình Ảnh</h4>
                <p className="text-[11px] text-slate-300">Trả kết quả nhanh chóng & chính xác tuyệt đối</p>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* 2. REASONS TO CHOOSE MEDICLINIC - HIGH CONTRAST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Dịch Vụ Y Tế Hàng Đầu
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Vì Sao Chọn MediClinic?
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="saas-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="card-title text-base font-bold text-slate-900 dark:text-white">Đội Ngũ Bác Sĩ Giỏi</h3>
            <p className="body-text text-xs text-slate-600 dark:text-slate-300">Các bác sĩ giàu kinh nghiệm công tác tại bệnh viện tuyến trung ương.</p>
          </div>

          <div className="saas-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="card-title text-base font-bold text-slate-900 dark:text-white">Xét Nghiệm Chính Xác</h3>
            <p className="body-text text-xs text-slate-600 dark:text-slate-300">Hệ thống máy móc hiện đại đạt chuẩn chất lượng quốc tế ISO 9001.</p>
          </div>

          <div className="saas-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="card-title text-base font-bold text-slate-900 dark:text-white">Trợ Lý AI Thông Minh</h3>
            <p className="body-text text-xs text-slate-600 dark:text-slate-300">Hỗ trợ phân tích triệu chứng ban đầu & gợi ý chuyên khoa khám phù hợp.</p>
          </div>

          <div className="saas-card space-y-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="card-title text-base font-bold text-slate-900 dark:text-white">Không Chờ Đợi</h3>
            <p className="body-text text-xs text-slate-600 dark:text-slate-300">Đặt lịch hẹn giờ khám chính xác, không mất thời gian chen chúc xếp hàng.</p>
          </div>
        </div>
      </section>

      {/* 3. SPECIALTIES CATALOG - HIGH CONTRAST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
              Danh Mục Khám Chữa Bệnh
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Chuyên Khoa Y Tế Phổ Biến
            </h2>
          </div>
          <Link to="/book" className="btn-secondary text-xs font-bold h-10">
            Xem toàn bộ bảng giá khám
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {specialties.map((spec) => {
            const img = specialtyImages[spec.name] || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80';
            return (
              <div
                key={spec.id}
                onClick={() => navigate(`/book?specialty=${encodeURIComponent(spec.name)}`)}
                className="saas-card p-0 overflow-hidden cursor-pointer group hover:border-blue-500 transition-all border border-slate-200 dark:border-slate-800"
              >
                <div className="h-40 overflow-hidden relative">
                  <img
                    src={img}
                    alt={spec.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
                  <span className="absolute bottom-3 left-4 font-bold text-lg text-white drop-shadow">{spec.name}</span>
                </div>

                <div className="p-5 space-y-3">
                  <p className="body-text text-xs text-slate-600 dark:text-slate-300 line-clamp-2">{spec.description}</p>
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="font-extrabold text-sm text-blue-600 dark:text-blue-400">
                      {spec.fee ? `${spec.fee.toLocaleString('vi-VN')} ₫` : '250.000 ₫'}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                      Đặt khám <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. FEATURED DOCTORS - HIGH CONTRAST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Chuyên Gia Y Tế
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Đội Ngũ Bác Sĩ Tiêu Biểu
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {doctors.slice(0, 4).map((doc, idx) => {
            const avatar = doctorAvatars[idx % doctorAvatars.length];
            return (
              <div key={doc.id} className="saas-card p-0 overflow-hidden group border border-slate-200 dark:border-slate-800">
                <div className="h-56 overflow-hidden relative">
                  <img
                    src={avatar}
                    alt={doc.fullName}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-full text-xs font-bold text-amber-500 flex items-center gap-1 shadow">
                    <Star className="w-3.5 h-3.5 fill-current" /> {doc.rating || 4.9}
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="card-title text-base font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{doc.fullName}</h3>
                    <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-0.5">{doc.specialization}</p>
                    <p className="small-text mt-1 text-slate-500 dark:text-slate-400">Kinh nghiệm: {doc.experienceYears ?? 0} năm</p>
                  </div>

                  <button
                    onClick={() => navigate(`/book?doctorId=${doc.id}`)}
                    className="btn-primary w-full h-10 text-xs font-bold"
                  >
                    Đặt Lịch Với Bác Sĩ
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. AI BANNER - HIGH CONTRAST */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="saas-card p-8 sm:p-12 bg-gradient-to-r from-purple-900 to-indigo-900 text-white space-y-6">
          <div className="max-w-2xl space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-extrabold uppercase">
              <Sparkles className="w-4 h-4" /> AI Diagnostic Assistant
            </span>
            <h2 className="text-3xl font-extrabold text-white">Trợ Lý AI Phân Tích Triệu Chứng Sức Khỏe</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Bạn đang gặp các biểu hiện sức khỏe bất thường? Nhập các triệu chứng của bạn để AI đưa ra khuyến nghị Chuyên khoa khám chính xác nhất.
            </p>
          </div>

          <button onClick={onOpenAiModal} className="btn-ai py-3.5 px-7 font-bold text-sm">
            <Sparkles className="w-5 h-5" /> Trải Nghiệm AI Chẩn Đoán Ngay
          </button>
        </div>
      </section>

    </div>
  );
};

export default Home;
