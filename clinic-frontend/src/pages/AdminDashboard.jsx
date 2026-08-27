import React, { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Pill, Plus, RefreshCw, ShieldCheck, Stethoscope, Users } from "lucide-react";
import { authService } from "../services/authService";
import { doctorService } from "../services/doctorService";
import { prescriptionService } from "../services/prescriptionService";
import { patientService } from "../services/patientService";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/common/PageHeader";
import LoadingSkeleton from "../components/common/LoadingSkeleton";

const EMPTY_DOCTOR = { userId: "", fullName: "", specialtyId: "", licenseNumber: "", experienceYears: 0, available: true };
const EMPTY_SPECIALTY = { name: "", description: "", active: true };
const EMPTY_MEDICINE = { name: "", unit: "Viên", price: 0, stockQuantity: 0, active: true, description: "" };
const ROLE_OPTIONS = ["ROLE_PATIENT", "ROLE_DOCTOR", "ROLE_RECEPTIONIST", "ROLE_ADMIN"];
const rolesOf = (user) => Array.isArray(user?.roles) ? user.roles.map((role) => role?.name || role) : [];
const money = (value) => `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const ModalButtons = ({ saving, close }) => <div className="flex gap-3 pt-2"><button type="button" onClick={close} className="btn-secondary flex-1">Hủy</button><button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? "Đang lưu..." : "Lưu"}</button></div>;

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("doctors");
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
    } catch (requestError) { setError(requestError?.message || "Không thể tải dữ liệu quản trị từ backend."); }
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
      setDoctorForm(EMPTY_DOCTOR); setModal(null); notify("Đã tạo hồ sơ bác sĩ."); await loadData();
    } catch (requestError) { setError(requestError?.message || "Không thể tạo bác sĩ."); }
    finally { setSaving(false); }
  };
  const createSpecialty = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try { await doctorService.createSpecialty(specialtyForm); setSpecialtyForm(EMPTY_SPECIALTY); setModal(null); notify("Đã tạo chuyên khoa."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "Không thể tạo chuyên khoa."); } finally { setSaving(false); }
  };
  const createMedicine = async (event) => {
    event.preventDefault(); setSaving(true); setError("");
    try { await prescriptionService.createMedicine({ ...medicineForm, price: Number(medicineForm.price), stockQuantity: Number(medicineForm.stockQuantity) }); setMedicineForm(EMPTY_MEDICINE); setModal(null); notify("Đã thêm thuốc."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "Không thể thêm thuốc."); } finally { setSaving(false); }
  };
  const toggleUser = async (user) => {
    setError(""); try { await authService.setUserEnabled(user.id, user.enabled === false); notify("Đã cập nhật trạng thái tài khoản."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "Không thể cập nhật tài khoản."); }
  };
  const toggleRole = async (user, role) => {
    setError(""); try { if (rolesOf(user).includes(role)) await authService.removeRole(user.id, role); else await authService.addRole(user.id, role); notify("Đã cập nhật quyền."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "Không thể cập nhật quyền."); }
  };

  const toggleSpecialty = async (specialty) => {
    setError("");
    try { await doctorService.setSpecialtyActive(specialty.id, specialty.active === false); notify("Đã cập nhật chuyên khoa."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "Không thể cập nhật chuyên khoa."); }
  };

  const addMedicineStock = async (medicine) => {
    const raw = window.prompt(`Nhập số lượng tồn kho mới cho ${medicine.name}:`, String(medicine.stockQuantity ?? 0));
    if (raw === null) return;
    const quantity = Number(raw);
    if (!Number.isInteger(quantity) || quantity < 0) { setError("Số lượng tồn kho phải là số nguyên không âm."); return; }
    setError("");
    try { await prescriptionService.updateMedicineStock(medicine.id, quantity); notify("Đã cập nhật tồn kho."); await loadData(); }
    catch (requestError) { setError(requestError?.message || "Không thể cập nhật tồn kho."); }
  };

  const createPatientProfile = async (user) => {
    setError("");
    try {
      await patientService.createPatient({
        userId: user.id,
        fullName: user.fullName,
        phone: user.phone || "",
      });
      notify("Đã tạo hồ sơ bệnh nhân cho tài khoản.");
    } catch (requestError) {
      setError(requestError?.message || "Không thể tạo hồ sơ bệnh nhân.");
    }
  };

  const tabs = [{ id: "doctors", label: "Bác sĩ" }, { id: "specialties", label: "Chuyên khoa" }, { id: "medicines", label: "Kho thuốc" }, { id: "users", label: "Tài khoản & quyền" }];

  return <DashboardLayout>
    <PageHeader title="Quản trị hệ thống" description="Dữ liệu thật được tải qua API Gateway; không sử dụng dữ liệu mẫu." action={<button type="button" onClick={loadData} className="btn-secondary"><RefreshCw className="w-4 h-4" /> Làm mới</button>} />
    {error && <div className="mb-5 p-4 rounded-xl bg-rose-50 text-rose-700 flex gap-2"><AlertCircle className="w-5 h-5 shrink-0" />{error}</div>}
    {success && <div className="mb-5 p-4 rounded-xl bg-emerald-50 text-emerald-700">{success}</div>}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
      {[["Bác sĩ", doctors.length, Stethoscope], ["Chuyên khoa", specialties.length, Users], ["Thuốc", medicines.length, Pill], ["Tài khoản", users.length, ShieldCheck]].map(([label, value, Icon]) => <div key={label} className="saas-card flex justify-between"><div><span className="small-text">{label}</span><div className="text-3xl font-extrabold">{value}</div></div><Icon className="w-8 h-8 text-blue-600" /></div>)}
    </div>
    <div className="flex gap-3 border-b mb-5 overflow-x-auto">{tabs.map((tab) => <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`py-3 px-2 font-bold text-sm ${activeTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500"}`}>{tab.label}</button>)}</div>
    {loading ? <LoadingSkeleton.TableSkeleton rows={5} /> : <>
      {activeTab === "doctors" && <section><Header title="Danh sách bác sĩ" action={() => setModal("doctor")} label="Thêm bác sĩ" /><Table heads={["ID", "Họ tên", "Chuyên khoa", "Kinh nghiệm", "Trạng thái"]}>{doctors.map((item) => <tr key={item.id}><td>DOC-{item.id}</td><td>{item.fullName}</td><td>{item.specialization || "---"}</td><td>{item.experienceYears ?? 0} năm</td><td>{item.available === false ? "Tạm nghỉ" : "Đang làm việc"}</td></tr>)}</Table></section>}
      {activeTab === "specialties" && <section><Header title="Danh sách chuyên khoa" action={() => setModal("specialty")} label="Thêm chuyên khoa" /><div className="grid md:grid-cols-3 gap-4">{specialties.map((item) => <div key={item.id} className="saas-card"><div className="font-bold">{item.name}</div><p className="small-text my-2">{item.description || "Chưa có mô tả"}</p><div className="flex justify-between items-center"><span className={item.active === false ? "text-rose-600" : "text-emerald-600"}>{item.active === false ? "Ngừng hoạt động" : "Đang hoạt động"}</span><button type="button" className="btn-secondary" onClick={() => toggleSpecialty(item)}>{item.active === false ? "Mở lại" : "Tạm ngừng"}</button></div></div>)}</div></section>}
      {activeTab === "medicines" && <section><Header title="Kho thuốc" action={() => setModal("medicine")} label="Thêm thuốc" /><Table heads={["ID", "Tên", "Đơn vị", "Giá", "Tồn kho", "Trạng thái", "Thao tác"]}>{medicines.map((item) => <tr key={item.id}><td>MED-{item.id}</td><td>{item.name}</td><td>{item.unit}</td><td>{money(item.price)}</td><td>{item.stockQuantity}</td><td>{item.active === false ? "Ngừng dùng" : "Đang dùng"}</td><td><button type="button" className="text-blue-600 font-bold" onClick={() => addMedicineStock(item)}>Cập nhật kho</button>{item.active !== false && <button type="button" className="ml-3 text-rose-600 font-bold" onClick={async () => { try { await prescriptionService.deactivateMedicine(item.id); await loadData(); } catch (requestError) { setError(requestError?.message || "Không thể ngừng thuốc."); } }}>Ngừng dùng</button>}</td></tr>)}</Table></section>}
      {activeTab === "users" && <section><h3 className="card-title mb-4">Tài khoản và phân quyền</h3><div className="space-y-3">{users.map((user) => <div key={user.id} className="saas-card"><div className="flex flex-wrap justify-between gap-3"><div><div className="font-bold">{user.fullName} <span className="small-text">#{user.id}</span></div><div className="small-text">{user.email}</div></div><div className="flex gap-2">{rolesOf(user).includes("ROLE_PATIENT") && <button type="button" onClick={() => createPatientProfile(user)} className="btn-secondary">Tạo hồ sơ Patient</button>}<button type="button" onClick={() => toggleUser(user)} className={user.enabled === false ? "btn-primary" : "btn-secondary"}>{user.enabled === false ? "Kích hoạt" : "Khóa"}</button></div></div><div className="flex flex-wrap gap-2 mt-3">{ROLE_OPTIONS.map((role) => <button type="button" key={role} onClick={() => toggleRole(user, role)} className={`px-2 py-1 rounded text-xs font-bold ${rolesOf(user).includes(role) ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>{role}</button>)}</div></div>)}</div></section>}
    </>}
    {modal && <div className="modal-overlay"><div className="modal-container p-6"><h3 className="card-title mb-4">{modal === "doctor" ? "Thêm bác sĩ" : modal === "specialty" ? "Thêm chuyên khoa" : "Thêm thuốc"}</h3>
      {modal === "doctor" && <form onSubmit={createDoctor} className="space-y-3"><select className="input-field" required value={doctorForm.userId} onChange={(e) => setDoctorForm({ ...doctorForm, userId: e.target.value })}><option value="">-- Tài khoản có ROLE_DOCTOR --</option>{doctorAccounts.map((user) => <option key={user.id} value={user.id}>{user.fullName} - {user.email}</option>)}</select><input className="input-field" required placeholder="Họ tên bác sĩ" value={doctorForm.fullName} onChange={(e) => setDoctorForm({ ...doctorForm, fullName: e.target.value })} /><select className="input-field" required value={doctorForm.specialtyId} onChange={(e) => setDoctorForm({ ...doctorForm, specialtyId: e.target.value })}><option value="">-- Chuyên khoa --</option>{specialties.filter((item) => item.active !== false).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><input className="input-field" required placeholder="Số giấy phép" value={doctorForm.licenseNumber} onChange={(e) => setDoctorForm({ ...doctorForm, licenseNumber: e.target.value })} /><input className="input-field" type="number" min="0" placeholder="Số năm kinh nghiệm" value={doctorForm.experienceYears} onChange={(e) => setDoctorForm({ ...doctorForm, experienceYears: e.target.value })} /><ModalButtons saving={saving} close={() => setModal(null)} /></form>}
      {modal === "specialty" && <form onSubmit={createSpecialty} className="space-y-3"><input className="input-field" required placeholder="Tên chuyên khoa" value={specialtyForm.name} onChange={(e) => setSpecialtyForm({ ...specialtyForm, name: e.target.value })} /><textarea className="input-field" placeholder="Mô tả" value={specialtyForm.description} onChange={(e) => setSpecialtyForm({ ...specialtyForm, description: e.target.value })} /><ModalButtons saving={saving} close={() => setModal(null)} /></form>}
      {modal === "medicine" && <form onSubmit={createMedicine} className="space-y-3"><input className="input-field" required placeholder="Tên thuốc" value={medicineForm.name} onChange={(e) => setMedicineForm({ ...medicineForm, name: e.target.value })} /><input className="input-field" required placeholder="Đơn vị" value={medicineForm.unit} onChange={(e) => setMedicineForm({ ...medicineForm, unit: e.target.value })} /><input className="input-field" required type="number" min="0" placeholder="Giá" value={medicineForm.price} onChange={(e) => setMedicineForm({ ...medicineForm, price: e.target.value })} /><input className="input-field" required type="number" min="0" placeholder="Tồn kho" value={medicineForm.stockQuantity} onChange={(e) => setMedicineForm({ ...medicineForm, stockQuantity: e.target.value })} /><ModalButtons saving={saving} close={() => setModal(null)} /></form>}
    </div></div>}
  </DashboardLayout>;
};

const Header = ({ title, action, label }) => <div className="flex justify-between mb-4"><h3 className="card-title">{title}</h3><button type="button" className="btn-primary" onClick={action}><Plus className="w-4 h-4" />{label}</button></div>;
const Table = ({ heads, children }) => <div className="saas-table-container"><table className="saas-table"><thead><tr>{heads.map((head) => <th key={head}>{head}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
export default AdminDashboard;
