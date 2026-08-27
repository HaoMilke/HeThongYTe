import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Image as ImageIcon,
  Pencil,
  Pill,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { authService } from "../services/authService";
import { doctorService } from "../services/doctorService";
import { prescriptionService } from "../services/prescriptionService";
import DashboardLayout from "../layouts/DashboardLayout";
import PageHeader from "../components/common/PageHeader";
import LoadingSkeleton from "../components/common/LoadingSkeleton";

const DOCTOR_IMAGE_KEY = "clinic_admin_doctor_images";
const MEDICINE_IMAGE_KEY = "clinic_admin_medicine_images";
const LOW_STOCK_LIMIT = 10;

const EMPTY_DOCTOR = {
  userId: "",
  fullName: "",
  specialtyId: "",
  licenseNumber: "",
  experienceYears: 0,
  phone: "",
  email: "",
  qualification: "",
  bio: "",
  available: true,
};

const EMPTY_SPECIALTY = {
  name: "",
  description: "",
  active: true,
};

const EMPTY_MEDICINE = {
  name: "",
  unit: "Viên",
  price: 0,
  stockQuantity: 0,
  active: true,
  description: "",
};

const ROLE_OPTIONS = [
  "ROLE_PATIENT",
  "ROLE_DOCTOR",
  "ROLE_RECEPTIONIST",
  "ROLE_ADMIN",
];

const rolesOf = (user) =>
  Array.isArray(user?.roles)
    ? user.roles.map((role) => role?.name || role)
    : [];

const money = (value) =>
  `${Number(value || 0).toLocaleString("vi-VN")} ₫`;

const readStoredImages = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
};

const ModalButtons = ({ saving, close }) => (
  <div className="flex gap-3 pt-3">
    <button
      type="button"
      onClick={close}
      className="btn-secondary flex-1"
    >
      Hủy
    </button>
    <button
      type="submit"
      disabled={saving}
      className="btn-primary flex-1"
    >
      {saving ? "Đang lưu..." : "Lưu"}
    </button>
  </div>
);

const ImagePreview = ({ src, alt = "Ảnh", compact = false }) => {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={
          compact
            ? "w-12 h-12 rounded-xl object-cover border border-slate-200"
            : "w-28 h-28 rounded-2xl object-cover border border-slate-200"
        }
      />
    );
  }

  return (
    <div
      className={
        compact
          ? "w-12 h-12 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400"
          : "w-28 h-28 rounded-2xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400"
      }
    >
      <ImageIcon className={compact ? "w-5 h-5" : "w-8 h-8"} />
    </div>
  );
};

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

  const [doctorImages, setDoctorImages] = useState(() =>
    readStoredImages(DOCTOR_IMAGE_KEY)
  );
  const [medicineImages, setMedicineImages] = useState(() =>
    readStoredImages(MEDICINE_IMAGE_KEY)
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [modal, setModal] = useState(null);
  const [editingDoctorId, setEditingDoctorId] = useState(null);
  const [editingMedicineId, setEditingMedicineId] = useState(null);

  const [doctorForm, setDoctorForm] = useState(EMPTY_DOCTOR);
  const [specialtyForm, setSpecialtyForm] = useState(EMPTY_SPECIALTY);
  const [medicineForm, setMedicineForm] = useState(EMPTY_MEDICINE);

  const [doctorImageDraft, setDoctorImageDraft] = useState("");
  const [medicineImageDraft, setMedicineImageDraft] = useState("");

  const [doctorSearch, setDoctorSearch] = useState("");
  const [medicineSearch, setMedicineSearch] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [doctorData, specialtyData, medicineData, userData] =
        await Promise.all([
          doctorService.getAllDoctors(),
          doctorService.getAllSpecialties(),
          prescriptionService.getAllMedicines(),
          authService.getAllUsers(),
        ]);

      setDoctors(Array.isArray(doctorData) ? doctorData : []);
      setSpecialties(Array.isArray(specialtyData) ? specialtyData : []);
      setMedicines(Array.isArray(medicineData) ? medicineData : []);
      setUsers(Array.isArray(userData) ? userData : []);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Không thể tải dữ liệu quản trị từ backend."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const doctorAccounts = useMemo(
    () =>
      users.filter((user) =>
        rolesOf(user).includes("ROLE_DOCTOR")
      ),
    [users]
  );

  const availableDoctorAccounts = useMemo(() => {
    const usedUserIds = new Set(
      doctors.map((doctor) => String(doctor.userId))
    );

    return doctorAccounts.filter(
      (user) => !usedUserIds.has(String(user.id))
    );
  }, [doctorAccounts, doctors]);

  const filteredDoctors = useMemo(() => {
    const keyword = doctorSearch.trim().toLowerCase();
    if (!keyword) return doctors;

    return doctors.filter((doctor) =>
      [
        doctor.fullName,
        doctor.specialization,
        doctor.email,
        doctor.phone,
        doctor.licenseNumber,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [doctors, doctorSearch]);

  const filteredMedicines = useMemo(() => {
    const keyword = medicineSearch.trim().toLowerCase();
    if (!keyword) return medicines;

    return medicines.filter((medicine) =>
      [medicine.name, medicine.unit, medicine.description]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [medicines, medicineSearch]);

  const notify = (message) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 2500);
  };

  const saveLocalImage = (
    storageKey,
    setImageMap,
    id,
    imageData
  ) => {
    setImageMap((current) => {
      const next = { ...current };

      if (imageData) {
        next[String(id)] = imageData;
      } else {
        delete next[String(id)];
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        setError(
          "Không thể lưu ảnh vào trình duyệt. Hãy chọn ảnh nhỏ hơn."
        );
      }

      return next;
    });
  };

  const readImage = (file, setter) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Ảnh chỉ hỗ trợ JPG, PNG hoặc WEBP.");
      return;
    }

    if (file.size > 1.5 * 1024 * 1024) {
      setError("Ảnh phải nhỏ hơn 1.5 MB để lưu ở frontend.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setter(String(reader.result || ""));
    reader.onerror = () => setError("Không thể đọc file ảnh.");
    reader.readAsDataURL(file);
  };

  const closeModal = () => {
    setModal(null);
    setEditingDoctorId(null);
    setEditingMedicineId(null);
    setDoctorForm(EMPTY_DOCTOR);
    setMedicineForm(EMPTY_MEDICINE);
    setSpecialtyForm(EMPTY_SPECIALTY);
    setDoctorImageDraft("");
    setMedicineImageDraft("");
  };

  const openCreateDoctor = () => {
    setEditingDoctorId(null);
    setDoctorForm(EMPTY_DOCTOR);
    setDoctorImageDraft("");
    setModal("doctor");
  };

  const openEditDoctor = (doctor) => {
    const specialty =
      specialties.find(
        (item) =>
          String(item.id) === String(doctor.specialtyId)
      ) ||
      specialties.find(
        (item) =>
          item.name?.toLowerCase() ===
          doctor.specialization?.toLowerCase()
      );

    setEditingDoctorId(doctor.id);
    setDoctorForm({
      userId: String(doctor.userId ?? ""),
      fullName: doctor.fullName || "",
      specialtyId: String(specialty?.id ?? doctor.specialtyId ?? ""),
      licenseNumber: doctor.licenseNumber || "",
      experienceYears: doctor.experienceYears ?? 0,
      phone: doctor.phone || "",
      email: doctor.email || "",
      qualification: doctor.qualification || "",
      bio: doctor.bio || "",
      available: doctor.available !== false,
    });
    setDoctorImageDraft(
      doctorImages[String(doctor.id)] || ""
    );
    setModal("doctor");
  };

  const selectDoctorAccount = (userId) => {
    const account = doctorAccounts.find(
      (user) => String(user.id) === String(userId)
    );

    setDoctorForm((current) => ({
      ...current,
      userId,
      fullName: account?.fullName || current.fullName,
      email: account?.email || current.email,
      phone: account?.phone || current.phone,
    }));
  };

  const submitDoctor = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const specialty = specialties.find(
        (item) =>
          String(item.id) === String(doctorForm.specialtyId)
      );

      const payload = {
        ...doctorForm,
        userId: Number(doctorForm.userId),
        specialtyId: Number(doctorForm.specialtyId),
        specialization: specialty?.name || "",
        experienceYears:
          Number(doctorForm.experienceYears) || 0,
        available: doctorForm.available !== false,
      };

      if (editingDoctorId) {
        const updated = await doctorService.updateDoctor(
          editingDoctorId,
          payload
        );

        saveLocalImage(
          DOCTOR_IMAGE_KEY,
          setDoctorImages,
          editingDoctorId,
          doctorImageDraft
        );

        notify(
          `Đã cập nhật bác sĩ ${updated?.fullName || payload.fullName}.`
        );
      } else {
        const created = await doctorService.createDoctor(payload);

        if (created?.id) {
          saveLocalImage(
            DOCTOR_IMAGE_KEY,
            setDoctorImages,
            created.id,
            doctorImageDraft
          );
        }

        notify("Đã tạo hồ sơ bác sĩ.");
      }

      closeModal();
      await loadData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          (editingDoctorId
            ? "Không thể cập nhật bác sĩ."
            : "Không thể tạo bác sĩ.")
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleDoctorAvailability = async (doctor) => {
    setError("");

    try {
      await doctorService.updateDoctor(doctor.id, {
        ...doctor,
        available: doctor.available === false,
      });

      notify(
        doctor.available === false
          ? "Bác sĩ đã trở lại làm việc."
          : "Đã chuyển bác sĩ sang trạng thái tạm nghỉ."
      );

      await loadData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Không thể cập nhật trạng thái bác sĩ."
      );
    }
  };

  const createSpecialty = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      await doctorService.createSpecialty(specialtyForm);
      closeModal();
      notify("Đã tạo chuyên khoa.");
      await loadData();
    } catch (requestError) {
      setError(
        requestError?.message || "Không thể tạo chuyên khoa."
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleSpecialty = async (specialty) => {
    setError("");

    try {
      await doctorService.setSpecialtyActive(
        specialty.id,
        specialty.active === false
      );
      notify("Đã cập nhật chuyên khoa.");
      await loadData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Không thể cập nhật chuyên khoa."
      );
    }
  };

  const openCreateMedicine = () => {
    setEditingMedicineId(null);
    setMedicineForm(EMPTY_MEDICINE);
    setMedicineImageDraft("");
    setModal("medicine");
  };

  const openEditMedicine = (medicine) => {
    setEditingMedicineId(medicine.id);
    setMedicineForm({
      name: medicine.name || "",
      unit: medicine.unit || "Viên",
      price: medicine.price ?? 0,
      stockQuantity: medicine.stockQuantity ?? 0,
      active: medicine.active !== false,
      description: medicine.description || "",
    });
    setMedicineImageDraft(
      medicineImages[String(medicine.id)] || ""
    );
    setModal("medicine");
  };

  const submitMedicine = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        ...medicineForm,
        price: Number(medicineForm.price),
        stockQuantity: Number(medicineForm.stockQuantity),
        active: medicineForm.active !== false,
      };

      if (editingMedicineId) {
        await prescriptionService.updateMedicine(
          editingMedicineId,
          payload
        );

        saveLocalImage(
          MEDICINE_IMAGE_KEY,
          setMedicineImages,
          editingMedicineId,
          medicineImageDraft
        );

        notify("Đã cập nhật thông tin thuốc.");
      } else {
        const created =
          await prescriptionService.createMedicine(payload);

        if (created?.id) {
          saveLocalImage(
            MEDICINE_IMAGE_KEY,
            setMedicineImages,
            created.id,
            medicineImageDraft
          );
        }

        notify("Đã thêm thuốc.");
      }

      closeModal();
      await loadData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          (editingMedicineId
            ? "Không thể cập nhật thuốc."
            : "Không thể thêm thuốc.")
      );
    } finally {
      setSaving(false);
    }
  };

  const toggleMedicineActive = async (medicine) => {
    setError("");

    try {
      if (medicine.active === false) {
        await prescriptionService.updateMedicine(medicine.id, {
          active: true,
        });
        notify("Đã mở lại thuốc.");
      } else {
        await prescriptionService.deactivateMedicine(
          medicine.id
        );
        notify("Đã ngừng sử dụng thuốc.");
      }

      await loadData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Không thể cập nhật trạng thái thuốc."
      );
    }
  };

  const toggleUser = async (user) => {
    setError("");

    try {
      await authService.setUserEnabled(
        user.id,
        user.enabled === false
      );
      notify("Đã cập nhật trạng thái tài khoản.");
      await loadData();
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Không thể cập nhật tài khoản."
      );
    }
  };

  const toggleRole = async (user, role) => {
    setError("");

    try {
      if (rolesOf(user).includes(role)) {
        await authService.removeRole(user.id, role);
      } else {
        await authService.addRole(user.id, role);
      }

      notify("Đã cập nhật quyền.");
      await loadData();
    } catch (requestError) {
      setError(
        requestError?.message || "Không thể cập nhật quyền."
      );
    }
  };

  const tabs = [
    { id: "doctors", label: "Bác sĩ" },
    { id: "specialties", label: "Chuyên khoa" },
    { id: "medicines", label: "Kho thuốc" },
    { id: "users", label: "Tài khoản & quyền" },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Quản trị hệ thống"
        description="Dữ liệu thật được tải qua API Gateway; ảnh bác sĩ và thuốc được lưu cục bộ trên trình duyệt."
        action={
          <button
            type="button"
            onClick={loadData}
            className="btn-secondary"
          >
            <RefreshCw className="w-4 h-4" />
            Làm mới
          </button>
        }
      />

      {error && (
        <div className="mb-5 p-4 rounded-xl bg-rose-50 text-rose-700 flex gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 rounded-xl bg-emerald-50 text-emerald-700">
          {success}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {[
          ["Bác sĩ", doctors.length, Stethoscope],
          ["Chuyên khoa", specialties.length, Users],
          ["Thuốc", medicines.length, Pill],
          ["Tài khoản", users.length, ShieldCheck],
        ].map(([label, value, Icon]) => (
          <div
            key={label}
            className="saas-card flex justify-between"
          >
            <div>
              <span className="small-text">{label}</span>
              <div className="text-3xl font-extrabold">
                {value}
              </div>
            </div>
            <Icon className="w-8 h-8 text-blue-600" />
          </div>
        ))}
      </div>

      <div className="flex gap-3 border-b mb-5 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => navigate(`/admin/${tab.id}`)}
            className={`py-3 px-2 font-bold text-sm ${
              activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-slate-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton.TableSkeleton rows={5} />
      ) : (
        <>
          {activeTab === "doctors" && (
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <h3 className="card-title">
                  Danh sách bác sĩ
                </h3>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="input-field pl-9"
                      placeholder="Tìm bác sĩ..."
                      value={doctorSearch}
                      onChange={(event) =>
                        setDoctorSearch(event.target.value)
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={openCreateDoctor}
                  >
                    <Plus className="w-4 h-4" />
                    Thêm bác sĩ
                  </button>
                </div>
              </div>

              <Table
                heads={[
                  "Ảnh",
                  "ID",
                  "Họ tên",
                  "Chuyên khoa",
                  "Liên hệ",
                  "Kinh nghiệm",
                  "Trạng thái",
                  "Thao tác",
                ]}
              >
                {filteredDoctors.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <ImagePreview
                        compact
                        src={doctorImages[String(item.id)]}
                        alt={item.fullName}
                      />
                    </td>
                    <td>DOC-{item.id}</td>
                    <td>
                      <div className="font-semibold">
                        {item.fullName}
                      </div>
                      <div className="small-text">
                        {item.qualification || "Chưa cập nhật bằng cấp"}
                      </div>
                    </td>
                    <td>{item.specialization || "---"}</td>
                    <td>
                      <div>{item.phone || "---"}</div>
                      <div className="small-text">
                        {item.email || "---"}
                      </div>
                    </td>
                    <td>
                      {item.experienceYears ?? 0} năm
                    </td>
                    <td>
                      <span
                        className={
                          item.available === false
                            ? "text-amber-600 font-semibold"
                            : "text-emerald-600 font-semibold"
                        }
                      >
                        {item.available === false
                          ? "Tạm nghỉ"
                          : "Đang làm việc"}
                      </span>
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          className="text-blue-600 font-bold flex items-center gap-1"
                          onClick={() => openEditDoctor(item)}
                        >
                          <Pencil className="w-4 h-4" />
                          Sửa
                        </button>

                        <button
                          type="button"
                          className={
                            item.available === false
                              ? "text-emerald-600 font-bold"
                              : "text-amber-600 font-bold"
                          }
                          onClick={() =>
                            toggleDoctorAvailability(item)
                          }
                        >
                          {item.available === false
                            ? "Làm việc lại"
                            : "Tạm nghỉ"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </Table>
            </section>
          )}

          {activeTab === "specialties" && (
            <section>
              <Header
                title="Danh sách chuyên khoa"
                action={() => setModal("specialty")}
                label="Thêm chuyên khoa"
              />

              <div className="grid md:grid-cols-3 gap-4">
                {specialties.map((item) => (
                  <div key={item.id} className="saas-card">
                    <div className="font-bold">{item.name}</div>
                    <p className="small-text my-2">
                      {item.description || "Chưa có mô tả"}
                    </p>
                    <div className="flex justify-between items-center">
                      <span
                        className={
                          item.active === false
                            ? "text-rose-600"
                            : "text-emerald-600"
                        }
                      >
                        {item.active === false
                          ? "Ngừng hoạt động"
                          : "Đang hoạt động"}
                      </span>

                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => toggleSpecialty(item)}
                      >
                        {item.active === false
                          ? "Mở lại"
                          : "Tạm ngừng"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === "medicines" && (
            <section>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="card-title">Kho thuốc</h3>
                  <div className="small-text mt-1">
                    Tồn kho dưới {LOW_STOCK_LIMIT} sẽ được cảnh báo.
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      className="input-field pl-9"
                      placeholder="Tìm thuốc..."
                      value={medicineSearch}
                      onChange={(event) =>
                        setMedicineSearch(event.target.value)
                      }
                    />
                  </div>

                  <button
                    type="button"
                    className="btn-primary"
                    onClick={openCreateMedicine}
                  >
                    <Plus className="w-4 h-4" />
                    Thêm thuốc
                  </button>
                </div>
              </div>

              <Table
                heads={[
                  "Ảnh",
                  "ID",
                  "Tên",
                  "Đơn vị",
                  "Giá",
                  "Tồn kho",
                  "Mô tả",
                  "Trạng thái",
                  "Thao tác",
                ]}
              >
                {filteredMedicines.map((item) => {
                  const lowStock =
                    Number(item.stockQuantity || 0) <
                    LOW_STOCK_LIMIT;

                  return (
                    <tr key={item.id}>
                      <td>
                        <ImagePreview
                          compact
                          src={medicineImages[String(item.id)]}
                          alt={item.name}
                        />
                      </td>
                      <td>MED-{item.id}</td>
                      <td className="font-semibold">
                        {item.name}
                      </td>
                      <td>{item.unit}</td>
                      <td>{money(item.price)}</td>
                      <td>
                        <div className="font-semibold">
                          {item.stockQuantity}
                        </div>
                        {lowStock && (
                          <div className="text-xs font-bold text-rose-600">
                            Sắp hết
                          </div>
                        )}
                      </td>
                      <td className="max-w-xs">
                        <div className="truncate">
                          {item.description ||
                            "Chưa có mô tả"}
                        </div>
                      </td>
                      <td>
                        <span
                          className={
                            item.active === false
                              ? "text-rose-600 font-semibold"
                              : "text-emerald-600 font-semibold"
                          }
                        >
                          {item.active === false
                            ? "Ngừng dùng"
                            : "Đang dùng"}
                        </span>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-3">
                          <button
                            type="button"
                            className="text-blue-600 font-bold flex items-center gap-1"
                            onClick={() =>
                              openEditMedicine(item)
                            }
                          >
                            <Pencil className="w-4 h-4" />
                            Sửa
                          </button>

                          <button
                            type="button"
                            className={
                              item.active === false
                                ? "text-emerald-600 font-bold"
                                : "text-rose-600 font-bold"
                            }
                            onClick={() =>
                              toggleMedicineActive(item)
                            }
                          >
                            {item.active === false
                              ? "Mở lại"
                              : "Ngừng dùng"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Table>
            </section>
          )}

          {activeTab === "users" && (
            <section>
              <h3 className="card-title mb-4">
                Tài khoản và phân quyền
              </h3>

              <div className="space-y-3">
                {users.map((user) => (
                  <div key={user.id} className="saas-card">
                    <div className="flex flex-wrap justify-between gap-3">
                      <div>
                        <div className="font-bold">
                          {user.fullName}{" "}
                          <span className="small-text">
                            #{user.id}
                          </span>
                        </div>
                        <div className="small-text">
                          {user.email}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => toggleUser(user)}
                        className={
                          user.enabled === false
                            ? "btn-primary"
                            : "btn-secondary"
                        }
                      >
                        {user.enabled === false
                          ? "Kích hoạt"
                          : "Khóa"}
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {ROLE_OPTIONS.map((role) => (
                        <button
                          type="button"
                          key={role}
                          onClick={() =>
                            toggleRole(user, role)
                          }
                          className={`px-2 py-1 rounded text-xs font-bold ${
                            rolesOf(user).includes(role)
                              ? "bg-blue-600 text-white"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {modal && (
        <div className="modal-overlay">
          <div className="modal-container p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="card-title mb-5">
              {modal === "doctor"
                ? editingDoctorId
                  ? "Cập nhật bác sĩ"
                  : "Thêm bác sĩ"
                : modal === "specialty"
                  ? "Thêm chuyên khoa"
                  : editingMedicineId
                    ? "Cập nhật thuốc"
                    : "Thêm thuốc"}
            </h3>

            {modal === "doctor" && (
              <form
                onSubmit={submitDoctor}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <ImagePreview
                    src={doctorImageDraft}
                    alt="Ảnh bác sĩ"
                  />

                  <div className="flex-1 space-y-2">
                    <label className="font-semibold text-sm">
                      Ảnh đại diện
                    </label>
                    <input
                      className="input-field"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        readImage(
                          event.target.files?.[0],
                          setDoctorImageDraft
                        )
                      }
                    />
                    <div className="small-text">
                      JPG, PNG hoặc WEBP, tối đa 1.5 MB.
                      Ảnh chỉ lưu trên trình duyệt hiện tại.
                    </div>
                    {doctorImageDraft && (
                      <button
                        type="button"
                        className="text-rose-600 text-sm font-bold"
                        onClick={() =>
                          setDoctorImageDraft("")
                        }
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>

                {!editingDoctorId ? (
                  <label className="block">
                    <span className="font-semibold text-sm">
                      Tài khoản bác sĩ
                    </span>
                    <select
                      className="input-field mt-1"
                      required
                      value={doctorForm.userId}
                      onChange={(event) =>
                        selectDoctorAccount(
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        -- Tài khoản có ROLE_DOCTOR --
                      </option>
                      {availableDoctorAccounts.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} - {user.email}
                        </option>
                      ))}
                    </select>
                    <span className="small-text">
                      Chọn tài khoản sẽ tự điền họ tên,
                      email và số điện thoại nếu có.
                    </span>
                  </label>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <div className="small-text">
                      User ID liên kết
                    </div>
                    <div className="font-bold">
                      #{doctorForm.userId}
                    </div>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-3">
                  <label>
                    <span className="font-semibold text-sm">
                      Họ tên bác sĩ
                    </span>
                    <input
                      className="input-field mt-1"
                      required
                      value={doctorForm.fullName}
                      onChange={(event) =>
                        setDoctorForm({
                          ...doctorForm,
                          fullName: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span className="font-semibold text-sm">
                      Chuyên khoa
                    </span>
                    <select
                      className="input-field mt-1"
                      required
                      value={doctorForm.specialtyId}
                      onChange={(event) =>
                        setDoctorForm({
                          ...doctorForm,
                          specialtyId: event.target.value,
                        })
                      }
                    >
                      <option value="">
                        -- Chuyên khoa --
                      </option>
                      {specialties
                        .filter(
                          (item) =>
                            item.active !== false ||
                            String(item.id) ===
                              String(
                                doctorForm.specialtyId
                              )
                        )
                        .map((item) => (
                          <option
                            key={item.id}
                            value={item.id}
                          >
                            {item.name}
                          </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    <span className="font-semibold text-sm">
                      Số giấy phép
                    </span>
                    <input
                      className="input-field mt-1"
                      required
                      value={doctorForm.licenseNumber}
                      onChange={(event) =>
                        setDoctorForm({
                          ...doctorForm,
                          licenseNumber:
                            event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span className="font-semibold text-sm">
                      Số năm kinh nghiệm
                    </span>
                    <input
                      className="input-field mt-1"
                      type="number"
                      min="0"
                      value={doctorForm.experienceYears}
                      onChange={(event) =>
                        setDoctorForm({
                          ...doctorForm,
                          experienceYears:
                            event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span className="font-semibold text-sm">
                      Điện thoại
                    </span>
                    <input
                      className="input-field mt-1"
                      value={doctorForm.phone}
                      onChange={(event) =>
                        setDoctorForm({
                          ...doctorForm,
                          phone: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span className="font-semibold text-sm">
                      Email
                    </span>
                    <input
                      className="input-field mt-1"
                      type="email"
                      value={doctorForm.email}
                      onChange={(event) =>
                        setDoctorForm({
                          ...doctorForm,
                          email: event.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="font-semibold text-sm">
                    Bằng cấp / chứng chỉ
                  </span>
                  <input
                    className="input-field mt-1"
                    placeholder="Ví dụ: Bác sĩ CKI Nội khoa"
                    value={doctorForm.qualification}
                    onChange={(event) =>
                      setDoctorForm({
                        ...doctorForm,
                        qualification: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-sm">
                    Giới thiệu bác sĩ
                  </span>
                  <textarea
                    className="input-field mt-1 min-h-24"
                    placeholder="Kinh nghiệm, thế mạnh chuyên môn..."
                    value={doctorForm.bio}
                    onChange={(event) =>
                      setDoctorForm({
                        ...doctorForm,
                        bio: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={doctorForm.available}
                    onChange={(event) =>
                      setDoctorForm({
                        ...doctorForm,
                        available: event.target.checked,
                      })
                    }
                  />
                  <span className="font-semibold text-sm">
                    Đang làm việc
                  </span>
                </label>

                <ModalButtons
                  saving={saving}
                  close={closeModal}
                />
              </form>
            )}

            {modal === "specialty" && (
              <form
                onSubmit={createSpecialty}
                className="space-y-3"
              >
                <label className="block">
                  <span className="font-semibold text-sm">
                    Tên chuyên khoa
                  </span>
                  <input
                    className="input-field mt-1"
                    required
                    value={specialtyForm.name}
                    onChange={(event) =>
                      setSpecialtyForm({
                        ...specialtyForm,
                        name: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-sm">
                    Mô tả
                  </span>
                  <textarea
                    className="input-field mt-1 min-h-24"
                    value={specialtyForm.description}
                    onChange={(event) =>
                      setSpecialtyForm({
                        ...specialtyForm,
                        description: event.target.value,
                      })
                    }
                  />
                </label>

                <ModalButtons
                  saving={saving}
                  close={closeModal}
                />
              </form>
            )}

            {modal === "medicine" && (
              <form
                onSubmit={submitMedicine}
                className="space-y-4"
              >
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  <ImagePreview
                    src={medicineImageDraft}
                    alt="Ảnh thuốc"
                  />

                  <div className="flex-1 space-y-2">
                    <label className="font-semibold text-sm">
                      Hình ảnh thuốc
                    </label>
                    <input
                      className="input-field"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(event) =>
                        readImage(
                          event.target.files?.[0],
                          setMedicineImageDraft
                        )
                      }
                    />
                    <div className="small-text">
                      JPG, PNG hoặc WEBP, tối đa 1.5 MB.
                      Ảnh chỉ lưu trên trình duyệt hiện tại.
                    </div>
                    {medicineImageDraft && (
                      <button
                        type="button"
                        className="text-rose-600 text-sm font-bold"
                        onClick={() =>
                          setMedicineImageDraft("")
                        }
                      >
                        Xóa ảnh
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <label>
                    <span className="font-semibold text-sm">
                      Tên thuốc
                    </span>
                    <input
                      className="input-field mt-1"
                      required
                      value={medicineForm.name}
                      onChange={(event) =>
                        setMedicineForm({
                          ...medicineForm,
                          name: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span className="font-semibold text-sm">
                      Đơn vị
                    </span>
                    <input
                      className="input-field mt-1"
                      required
                      value={medicineForm.unit}
                      onChange={(event) =>
                        setMedicineForm({
                          ...medicineForm,
                          unit: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span className="font-semibold text-sm">
                      Giá
                    </span>
                    <input
                      className="input-field mt-1"
                      required
                      type="number"
                      min="1"
                      value={medicineForm.price}
                      onChange={(event) =>
                        setMedicineForm({
                          ...medicineForm,
                          price: event.target.value,
                        })
                      }
                    />
                  </label>

                  <label>
                    <span className="font-semibold text-sm">
                      Tồn kho
                    </span>
                    <input
                      className="input-field mt-1"
                      required
                      type="number"
                      min="0"
                      value={medicineForm.stockQuantity}
                      onChange={(event) =>
                        setMedicineForm({
                          ...medicineForm,
                          stockQuantity:
                            event.target.value,
                        })
                      }
                    />
                  </label>
                </div>

                <label className="block">
                  <span className="font-semibold text-sm">
                    Mô tả thuốc
                  </span>
                  <textarea
                    className="input-field mt-1 min-h-24"
                    placeholder="Công dụng, dạng bào chế hoặc ghi chú..."
                    value={medicineForm.description}
                    onChange={(event) =>
                      setMedicineForm({
                        ...medicineForm,
                        description: event.target.value,
                      })
                    }
                  />
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={medicineForm.active}
                    onChange={(event) =>
                      setMedicineForm({
                        ...medicineForm,
                        active: event.target.checked,
                      })
                    }
                  />
                  <span className="font-semibold text-sm">
                    Đang sử dụng
                  </span>
                </label>

                <ModalButtons
                  saving={saving}
                  close={closeModal}
                />
              </form>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

const Header = ({ title, action, label }) => (
  <div className="flex justify-between mb-4">
    <h3 className="card-title">{title}</h3>
    <button
      type="button"
      className="btn-primary"
      onClick={action}
    >
      <Plus className="w-4 h-4" />
      {label}
    </button>
  </div>
);

const Table = ({ heads, children }) => (
  <div className="saas-table-container overflow-x-auto">
    <table className="saas-table">
      <thead>
        <tr>
          {heads.map((head) => (
            <th key={head}>{head}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

export default AdminDashboard;
