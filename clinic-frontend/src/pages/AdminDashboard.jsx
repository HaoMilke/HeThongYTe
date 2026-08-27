import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AlertCircle, Pill, Plus, RefreshCw, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { authService } from "../services/authService";
import { doctorService } from "../services/doctorService";
import { prescriptionService } from "../services/prescriptionService";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/common/PageHeader";
import LoadingSkeleton from "../components/common/LoadingSkeleton";

const EMPTY_DOCTOR = { userId: "", fullName: "", specialtyId: "", licenseNumber: "", experienceYears: 0, available: true };
const EMPTY_SPECIALTY = { name: "", description: "", active: true };
const EMPTY_MEDICINE = { name: "", unit: "ViĂªn", price: 0, stockQuantity: 0, active: true, description: "" };
const ROLE_OPTIONS = ["ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_RECEPTIONIST", "ROLE_ADMIN"];
const rolesOf = (user) => Array.isArray(user?.roles) ? user.roles.map((role) => role?.name || role) : [];
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} â‚«`;

const ModalButtons = ({ saving, close }) => <div className="flex gap-3 pt-2"><button type="button" onClick={close} className="btn-secondary flex-1">Há»§y</button><button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Äang lÆ°u..." : "LÆ°u"}</button></div>;

export const AdminDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const activeTab = useMemo(() => {
    if (location.pathname === "/admin/specialties") return "specialties";
    if (location.pathname === "/admin/medicines") return "medicines";
    if (location.pathname === "/admin/users") return "users";
    return "doctors";
  }, [location.pathname]);
  const [doctors, setDoctors] = useState([]);
  const [specialties, setSpecialties] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [modal, setModal] = useState(null);
  const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR);
  const [specialtyForm, setSpecialtyForm] = useState(EMPTY_SPECIALTY);
  const [medicineForm, setMedicineForm] = useState(EMPTY_MEDICINE);

  const loadData = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const [doctorData, specialtyData, medicineData, userData] = await Promise.all([
        doctorService.getAllDoctors(), doctorService.getAllSpecialties(),
        prescriptionService.getAllMedicines(), authService.getAllUsers(),
      ]);
      setDoctors(Array.isArray(doctorData) ? doctorData : []);
      setSpecialties(Array.isArray(specialtyData) ? specialtyData : []);
      setMedicines(Array.isArray(medicineData) ? medicineData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ táº£i dá»¯ liá»‡u quáº£n trá»‹ tá»« backend."); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);
  const doctorAccounts = useMemo(() => users.filter((user) => rolesOf(user).includes("ROLE_DOCTOR")), [users]);
  const notify = (message) => { setSuccess(message); window.setTimeout(() => setSuccess(""), 2500); };

  const createDoctor = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try {
      const specialty = specialties.find((item) => String(item.id) === String(doctorForm.specialtyId));
      await doctorService.createDoctor({ ...doctorForm, userId: Number(doctorForm.userId), specialtyId: Number(doctorForm.specialtyId), specialization: specialty?.name || "", experienceYears: Number(doctorForm.experienceYears) || 0 });
      setDoctorForm(EMPTY_DOCTOR); setModal(null); notify("ÄĂ£ táº¡o há»“ sÆ¡ bĂ¡c sÄ©."); await loadData();
    } catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ táº¡o bĂ¡c sÄ©."); }
    finally { setSaving(false); }
  };
  const createSpecialty = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try { await doctorService.createSpecialty(specialtyForm); setSpecialtyForm(EMPTY_SPECIALTY); setModal(null); notify("ÄĂ£ táº¡o chuyĂªn khoa."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ táº¡o chuyĂªn khoa."); } finally { setSaving(false); }
  };
  const createMedicine = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try { await prescriptionService.createMedicine({ ...medicineForm, price: Number(medicineForm.price), stockQuantity: Number(medicineForm.stockQuantity) }); setMedicineForm(EMPTY_MEDICINE); setModal(null); notify("ÄĂ£ thĂªm thuá»‘c."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ thĂªm thuá»‘c."); } finally { setSaving(false); }
  };
  const toggleUser = async (user) => {
    setError(""); try { await authService.setUserEnabled(user.id, user.enabled === false); notify("ÄĂ£ cáº­p nháº­t tráº¡ng thĂ¡i tĂ i khoáº£n."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ cáº­p nháº­t tĂ i khoáº£n."); }
  };
  const toggleRole = async (user, role) => {
    setError(""); try { if (rolesOf(user).includes(role)) await authService.removeRole(user.id, role); else await authService.addRole(user.id, role); notify("ÄĂ£ cáº­p nháº­t quyá»n."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ cáº­p nháº­t quyá»n."); }
  };

  const toggleSpecialty = async (specialty) => {
    setError("");
    try { await doctorService.setSpecialtyActive(specialty.id, specialty.active === false); notify("ÄĂ£ cáº­p nháº­t chuyĂªn khoa."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ cáº­p nháº­t chuyĂªn khoa."); }
  };

  const addMedicineStock = async (medicine) => {
    const raw = window.prompt(`Nháº­p sá»‘ lÆ°á»£ng tá»“n kho má»›i cho ${medicine.name}:`, String(medicine.stockQuantity ?? 0));
    if (raw === null) return;
    const quantity = Number(raw);
    if (!Number.isInteger(quantity) || quantity < 0) { setError("Sá»‘ lÆ°á»£ng tá»“n kho pháº£i lĂ  sá»‘ nguyĂªn khĂ´ng Ă¢m."); return; }
    setError("");
    try { await prescriptionService.updateMedicineStock(medicine.id, quantity); notify("ÄĂ£ cáº­p nháº­t tá»“n kho."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ cáº­p nháº­t tá»“n kho."); }
  };

  const tabs = [{ id: "doctors", label: "BĂ¡c sÄ©" }, { id: "specialties", label: "ChuyĂªn khoa" }, { id: "medicines", label: "Kho thuá»‘c" }, { id: "users", label: "TĂ i khoáº£n & quyá»n" }];

  return <DashboardLayout>
    <PageHeader title="Quáº£n trá»‹ há»‡ thá»‘ng" description="Dá»¯ liá»‡u tháº­t Ä‘Æ°á»£c táº£i qua API Gateway; khĂ´ng sá»­ dá»¥ng dá»¯ liá»‡u máº«u." action={<button type="button" onClick={loadData} className="btn-secondary"><RefreshCw className="w-4 h-4" /> LĂ m má»›i</button>} />
    {error && <div className="mb-5 p-4 rounded-xl bg-rose-50 text-rose-700 flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
    {success && <div className="mb-5 p-4 rounded-xl bg-emerald-50 text-emerald-700">{success}</div>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {[["BĂ¡c sÄ©", doctors.length, Stethoscope], ["ChuyĂªn khoa", specialties.length, Users], ["Thuá»‘c", medicines.length, Pill], ["TĂ i khoáº£n", users.length, ShieldCheck]].map(([label, value, Icon]) => <div key={label} className="saas-card flex justify-between"><div><span className="small-text">{label}</span><div className="text-3xl font-extrabold">{value}</div></div><Icon className="w-8 h-8 text-blue-600" /></div>)}
    </div>
    <div className="flex gap-3 border-b mb-5 overflow-x-auto">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => navigate(`/admin/${tab.id}`)} className={`py-3 px-2 font-bold text-sm ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}>{tab.label}</button>)}</div>
    {loading ? <LoadingSkeleton.TableSkeleton rows={5} /> : <>
      {activeTab === "doctors" && <section><Header title="Danh sĂ¡ch bĂ¡c sÄ©" action={() => setModal("doctor")} label="ThĂªm bĂ¡c sÄ©" /><Table heads={["ID", "Há» tĂªn", "ChuyĂªn khoa", "Kinh nghiá»‡m", "Tráº¡ng thĂ¡i"]}>{doctors.map((item) => <tr key={item.id}><td>DOC-{item.id}</td><td>{item.fullName}</td><td>{item.specialization || "---"}</td><td>{item.experienceYears ?? 0} nÄƒm</td><td>{item.available === false ? "Táº¡m nghá»‰" : "Äang lĂ m viá»‡c"}</td></tr>)}</Table></section>}
      {activeTab === "specialties" && <section><Header title="Danh sĂ¡ch chuyĂªn khoa" action={() => setModal("specialty")} label="ThĂªm chuyĂªn khoa" /><div className="grid md:grid-cols-3 gap-4">{specialties.map((item) => <div key={item.id} className="saas-card"><div className="font-bold">{item.name}</div><p className="small-text my-2">{item.description || "ChÆ°a cĂ³ mĂ´ táº£"}</p><div className="flex justify-between items-center"><span className={item.active === false ? "text-rose-600" : "text-emerald-600"}>{item.active === false ? "Ngá»«ng hoáº¡t Ä‘á»™ng" : "Äang hoáº¡t Ä‘á»™ng"}</span><button type="button" className="btn-secondary" onClick={() => toggleSpecialty(item)}>{item.active === false ? "Má»Ÿ láº¡i" : "Táº¡m ngá»«ng"}</button></div></div>)}</div></section>}
      {activeTab === "medicines" && <section><Header title="Kho thuá»‘c" action={() => setModal("medicine")} label="ThĂªm thuá»‘c" /><Table heads={["ID", "TĂªn", "ÄÆ¡n vá»‹", "GiĂ¡", "Tá»“n kho", "Tráº¡ng thĂ¡i", "Thao tĂ¡c"]}>{medicines.map((item) => <tr key={item.id}><td>MED-{item.id}</td><td>{item.name}</td><td>{item.unit}</td><td>{money(item.price)}</td><td>{item.stockQuantity}</td><td>{item.active === false ? "Ngá»«ng dĂ¹ng" : "Äang dĂ¹ng"}</td><td><button type="button" className="text-blue-600 font-bold" onClick={() => addMedicineStock(item)}>Cáº­p nháº­t kho</button>{item.active !== false && <button type="button" className="ml-3 text-rose-600 font-bold" onClick={async () => { try { await prescriptionService.deactivateMedicine(item.id); await loadData(); } catch (requestError) { setError(requestError?.message || "KhĂ´ng thá»ƒ ngá»«ng thuá»‘c."); } }}>Ngá»«ng dĂ¹ng</button>}</td></tr>)}</Table></section>}
      {activeTab === "users" && <section><h3 className="card-title mb-4">TĂ i khoáº£n vĂ  phĂ¢n quyá»n</h3><div className="space-y-3">{users.map((user) => <div key={user.id} className="saas-card"><div className="flex flex-wrap justify-between gap-3"><div><div className="font-bold">{user.fullName} <span className="small-text">#{user.id}</span></div><div className="small-text">{user.email}</div></div><div className="flex gap-2"><button type="button" onClick={() => toggleUser(user)} className={user.enabled === false ? "btn-primary" : "btn-secondary"}>{user.enabled === false ? "KĂ­ch hoáº¡t" : "KhĂ³a"}</button></div></div><div className="flex flex-wrap gap-2 mt-3">{ROLE_OPTIONS.map((role) => <button type="button" key={role} onClick={() => toggleRole(user, role)} className={`px-2 py-1 rounded text-xs font-bold ${rolesOf(user).includes(role) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{role}</button>)}</div></div>)}</div></section>}
    </>}
    {modal && <div className="modal-overlay"><div className="modal-container p-6"><h3 className="card-title mb-4">{modal === "doctor" ? "ThĂªm bĂ¡c sÄ©" : modal === "specialty" ? "ThĂªm chuyĂªn khoa" : "ThĂªm thuá»‘c"}</h3>
      {modal === "doctor" && <form onSubmit={createDoctor} className="space-y-3"><select className="input-field" required value={doctorForm.userId} onChange={(e) => setDoctorForm({ ...doctorForm, userId: e.target.value })}><option value="">-- TĂ i khoáº£n cĂ³ ROLE_DOCTOR --</option>{doctorAccounts.map((user) => <option key={user.id} value={user.id}>{user.fullName} - {user.email}</option>)}</select><input className="input-field" required placeholder="Há» tĂªn bĂ¡c sÄ©" value={doctorForm.fullName} onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })} /><select className="input-field" required value={doctorForm.specialtyId} onChange={(e) => setDoctorForm({ ...doctorForm, specialtyId: e.target.value })}><option value="">-- ChuyĂªn khoa --</option>{specialties.filter((item) => item.active !== false).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input className="input-field" required placeholder="Sá»‘ giáº¥y phĂ©p" value={doctorForm.licenseNumber} onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })} /><input className="input-field" type="number" min="0" placeholder="Sá»‘ nÄƒm kinh nghiá»‡m" value={doctorForm.experienceYears} onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: e.target.value })} /><ModalButtons saving={saving} close={() => setModal(null)} /></form>}
      {modal === "specialty" && <form onSubmit={createSpecialty} className="space-y-3"><input className="input-field" required placeholder="TĂªn chuyĂªn khoa" value={specialtyForm.name} onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })} /><textarea className="input-field" placeholder="MĂ´ táº£" value={specialtyForm.description} onChange={(e) => setSpecialtyForm({ ...specialtyForm, description: e.target.value })} /><ModalButtons saving={saving} close={() => setModal(null)} /></form>}
      {modal === "medicine" && <form onSubmit={createMedicine} className="space-y-3"><input className="input-field" required placeholder="TĂªn thuá»‘c" value={medicineForm.name} onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })} /><input className="input-field" required placeholder="ÄÆ¡n vá»‹" value={medicineForm.unit} onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })} /><input className="input-field" required type="number" min="0" placeholder="GiĂ¡" value={medicineForm.price} onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })} /><input className="input-field" required type="number" min="0" placeholder="Tá»“n kho" value={medicineForm.stockQuantity} onChange={(e) => setMedicineForm({ ...medicineForm, stockQuantity: e.target.value })} /><ModalButtons saving={saving} close={() => setModal(null)} /></form>}
    </div></div>}
  </DashboardLayout>;
};

const Header = ({ title, action, label }) => <div className="flex justify-between mb-4"><h3 className="card-title">{title}</h3><button type="button" className="btn-primary" onClick={action}><Plus className="w-4 h-4" />{label}</button></div>;
const Table = ({ heads, children }) => <div className="saas-table-container"><table className="saas-table"><thead><tr>{heads.map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
export default AdminDashboard;
