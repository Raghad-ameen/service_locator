import { useEffect, useState } from "react";
import { TrashIcon, PencilIcon } from "../../component/icons";
import default_img from "../../../public/media/user_profile/default.png";
import {
  CheckIcon,
  NoSymbolIcon,
  XMarkIcon,
  PlusCircleIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/outline";
import axios from "axios";
import { toast } from "react-toastify";
import ConfirmToast from "../../component/ConfirmToast";

const ManageAdv = () => {
  const token = localStorage.getItem("token");

  const [activeSection, setActiveSection] = useState("pending");
  const [ads, setAds] = useState([]);
  const [packages, setPackages] = useState([]);
  const [pendingCount, setPendingCount] = useState(0);

  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [selectedAdId, setSelectedAdId] = useState(null);

  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [packageForm, setPackageForm] = useState({
    name: "",
    duration_days: "",
    price: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [accounts, setAccounts] = useState([]);
  const [accountForm, setAccountForm] = useState({
    bank_name: "",
    account_number: "",
    account_name: "",
  });
  const [accountErrors, setAccountErrors] = useState({});
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const openCreatePackage = () => {
    setEditingPackage(null);
    setPackageForm({ name: "", duration_days: "", price: "" });
    setFormErrors({});
    setShowPackageModal(true);
  };

  const openEditPackage = (pkg) => {
    setEditingPackage(pkg);
    setPackageForm({
      name: pkg.name,
      duration_days: pkg.duration_days,
      price: pkg.price,
    });
    setFormErrors({});
    setShowPackageModal(true);
  };

  const savePackage = async (e) => {
    e.preventDefault();

    const errors = {};

    // الاسم
    if (!packageForm.name.trim()) {
      errors.name = "اسم الباقة مطلوب";
    }

    // المدة
    if (!packageForm.duration_days) {
      errors.duration_days = "مدة الباقة مطلوبة";
    } else if (
      isNaN(packageForm.duration_days) ||
      Number(packageForm.duration_days) <= 0
    ) {
      errors.duration_days = "المدة يجب أن تكون رقمًا أكبر من صفر";
    }

    // السعر
    if (!packageForm.price) {
      errors.price = "سعر الباقة مطلوب";
    } else if (
      isNaN(packageForm.price) ||
      Number(packageForm.price) <= 0
    ) {
      errors.price = "السعر يجب أن يكون رقمًا أكبر من صفر";
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const url = editingPackage
      ? `http://127.0.0.1:8000/api/services/admin/packages/${editingPackage.id}/`
      : `http://127.0.0.1:8000/api/services/admin/packages/`;

    const method = editingPackage ? "patch" : "post";

    try {
      await axios({
        method,
        url,
        data: packageForm,
        headers: { Authorization: `Token ${token}` },
      });

      handleCloseModal();
      fetchPackages();
      fetchAccounts();

    } catch (err) {
      console.error("خطأ في حفظ الباقة:", err);
    }
  };

  const handleCloseModal = () => {
    setShowPackageModal(false);
    setEditingPackage(null);
    setPackageForm({ name: "", duration_days: "", price: "" });
  };

  /* ================= FETCH ================= */
  useEffect(() => {
    fetchPendingAds();
    fetchPackages();
    fetchAccounts();

  }, []);

  const fetchPendingAds = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/api/services/admin/ads/pending/",
      { headers: { Authorization: `Token ${token}` } }
    );
    setAds(res.data);
    setPendingCount(res.data.length);
  };

  const fetchPackages = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/api/services/admin/packages/",
      { headers: { Authorization: `Token ${token}` } }
    );
    setPackages(res.data);
  };
  const fetchAccounts = async () => {
    const res = await axios.get(
      "http://127.0.0.1:8000/api/services/admin/payment-accounts/",
      { headers: { Authorization: `Token ${token}` } }
    );
    setAccounts(res.data);
  };

  /* ================= ACTIONS ================= */
  // قبول الإعلان
  const approveAd = async (id) => {
    await axios.post(
      `http://127.0.0.1:8000/api/services/admin/ads/${id}/approve/`,
      {}, // لا بيانات مطلوبة
      { headers: { Authorization: `Token ${token}` } }
    );
    fetchPendingAds();
  };

  // رفض الإعلان
  const rejectAd = async () => {
    if (!selectedAdId) return; // تأكد إنه معرف الإعلان

    try {
      await axios.post(
        `http://127.0.0.1:8000/api/services/admin/ads/${selectedAdId}/reject/`,
        { reason: rejectReason },  // السبب نرسلها للباك
        { headers: { Authorization: `Token ${token}` } }
      );
      setShowRejectForm(false);
      setRejectReason("");
      fetchPendingAds(); // تحديث القائمة بعد الرفض
    } catch (err) {
      console.error(err);
      alert("حدث خطأ أثناء رفض الإعلان");
    }
  };

  const deletePackage = async (id) => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/services/admin/packages/${id}/`,
        { headers: { Authorization: `Token ${token}` } }
      );

      toast.success("تم حذف الباقة بنجاح");
      fetchPackages();

    } catch (err) {
      if (err.response?.status === 400) {
        toast.error(err.response.data.detail);
        return; // ⬅️ نوقف هنا
      }

      // هذا فقط للأخطاء غير المتوقعة
      console.error(err);
      toast.error("حدث خطأ غير متوقع");
    }
  };

  const showConfirmToast = ({ message, onConfirm }) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
          title="حذف باقة"
          message={message}
          confirmText="حذف"
          cancelText="إلغاء"
          onConfirm={async () => {
            await onConfirm();
            closeToast();
          }}
          onCancel={closeToast}
        />
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("ar-YE", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  const addAccount = async () => {
    const errors = {};

    if (!accountForm.bank_name.trim()) {
      errors.bank_name = "اسم البنك أو المحفظة مطلوب";
    }

    if (!accountForm.account_name.trim()) {
      errors.account_name = "اسم صاحب الحساب مطلوب";
    }

    if (!accountForm.account_number.trim()) {
      errors.account_number = "رقم الحساب مطلوب";
    } else if (!/^[0-9A-Za-z]+$/.test(accountForm.account_number)) {
      errors.account_number = "رقم الحساب يجب أن يحتوي على أرقام أو أحرف فقط";
    } else if (accountForm.account_number.length < 10) {
      errors.account_number = "رقم الحساب قصير جدًا";
    }

    if (Object.keys(errors).length > 0) {
      setAccountErrors(errors);
      return;
    }
    setAccountErrors({});

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/services/admin/payment-accounts/",
        accountForm,
        { headers: { Authorization: `Token ${token}` } }
      );

      toast.success("تم إضافة الحساب بنجاح");
      setAccountForm({ bank_name: "", account_number: "", account_name: "" });
      setAccountErrors({});
      fetchAccounts();
    } catch (err) {
      console.error(err);
      toast.error("حدث خطأ أثناء الإضافة");
    }
  };


  /* ================= UI ================= */
  return (
    <div dir="rtl" className="p-6 text-sm font-light">
      <h2 className="m-4 text-lg text-primary-600">إدارة الإعلانات</h2>

      {/* Tabs */}
      <div className="flex gap-10 mx-10 my-5 font-normal">
        <button
          onClick={() => setActiveSection("pending")}
          className={`pb-2 cursor-pointer relative after:absolute after:-bottom-2 after:right-0 after:h-0.5 after:w-0 after:bg-primary transition duration-700 after:transition-all ${activeSection === "pending" ? "text-primary after:w-full" : "hover:text-primary-600 hover:after:w-full text-gray-900"}`}
        >
          إعلانات بانتظار الموافقة
          {pendingCount > 0 && <span className="text-red-500 mr-1">*</span>}
        </button>
        <button
          onClick={() => setActiveSection("package")}
          className={`pb-2 cursor-pointer relative after:absolute after:-bottom-2 after:right-0 after:h-0.5 after:w-0 after:bg-primary transition duration-700 after:transition-all ${activeSection === "package" ? "text-primary after:w-full" : "hover:text-primary-600 hover:after:w-full text-gray-900"}`}
        >
          باقات الإعلانات
        </button>
        <button
          onClick={() => setActiveSection("accounts")}
          className={`pb-2 cursor-pointer relative after:absolute after:-bottom-2 after:right-0 after:h-0.5 after:w-0 after:bg-primary transition duration-700 after:transition-all ${activeSection === "accounts"
            ? "text-primary after:w-full"
            : "hover:text-primary-600 hover:after:w-full text-gray-900"
            }`}
        >
          حسابات الدفع
        </button>

      </div>

      {/* ================= PACKAGES ================= */}
      {activeSection === "package" && (
        <div className="px-10 mt-10">
          <button
            onClick={openCreatePackage}
            className="flex items-center gap-2 text-primary cursor-pointer font-normal"
          >
            <PlusCircleIcon className="w-6 h-6" />
            باقة جديدة
          </button>
          <div className="grid grid-cols-5 gap-4 px-10 mt-10">
            {packages.map((p) => (
              <div key={p.id} className="p-4 flex flex-col items-center gap-4 border border-primary/40 rounded-xl">
                <h3>{p.name}</h3>
                <p className="text-gray-500">{p.duration_days} أيام</p>
                <p className="text-gray-500">{p.price} ريال</p>

                <div className="flex gap-3 self-end mt-2">
                  <TrashIcon OnClick={() => showConfirmToast({ message: "هل أنت متأكد من انك تريد حذف هذه الباقة", onConfirm: () => deletePackage(p.id) })} />
                  <PencilIcon OnClick={() => openEditPackage(p)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= add or edit package MODAL ================= */}
      {showPackageModal && (
        <div onClick={(e) => e.target === e.currentTarget && handleCloseModal()}
          className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-[50%]">
            <div className="flex justify-between">
              <h2>{editingPackage ? "تعديل الباقة" : "إضافة باقة جديدة"}</h2>
              <XMarkIcon onClick={handleCloseModal} className="w-7 h-7 cursor-pointer" />
            </div>
            <form onSubmit={savePackage} className="py-4 px-6 flex flex-col gap-6">
              <div>
                <label>اسم الباقة</label>
                <input
                  value={packageForm.name}
                  onChange={(e) =>
                    setPackageForm({ ...packageForm, name: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                {formErrors.name && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                )}
              </div>
              <div>
                <label>المدة (أيام)</label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={packageForm.duration_days}
                  onChange={(e) =>
                    setPackageForm({
                      ...packageForm,
                      duration_days: e.target.value,
                    })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                {formErrors.duration_days && (
                  <p className="text-red-500 text-xs mt-1">
                    {formErrors.duration_days}
                  </p>
                )}
              </div>
              <div>
                <label>السعر</label>
                <input
                  type="number"
                  min="1000"
                  step="1"
                  value={packageForm.price}
                  onChange={(e) =>
                    setPackageForm({ ...packageForm, price: e.target.value })
                  }
                  className="w-full border rounded px-3 py-2"
                />
                {formErrors.price && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.price}</p>
                )}
              </div>
              <button className="self-end bg-primary text-white px-4 py-2 rounded">
                {editingPackage ? "حفظ التعديلات" : "إضافة"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= PENDING ADS ================= */}
      {activeSection === "pending" && (
        <div className="mt-10 border rounded-lg">
          {ads.map((ad) => (
            <div key={ad.id} className="p-5 border-b">
              <p className="text-xs text-primary mb-3">
                {new Date(ad.start_date).toLocaleDateString("ar")}
              </p>
              <div className="flex justify-between">
                <div className="flex gap-4">
                  <img
                    src={ad.image || default_img}
                    className="w-12 h-12 rounded"
                  />
                  <div>
                    <p>{ad.owner_name}</p>
                    <p>{ad.owner_phone}</p>
                    <p>{ad.service_title}</p>
                    <p className="text-xs text-gray-500">{ad.description}</p>
                    <p className="text-xs">
                      مدة الباقة: ({ad.package.duration_days} يوم)
                    </p>
                    <p className="text-xs">
                      سعر الباقة: ({ad.package.price} ريال)
                    </p>
                    <p className="text-xs text-gray-600 mt-1">
                      من <span className="font-medium">{formatDate(ad.start_date)}</span>
                      {" "}إلى{" "}
                      <span className="font-medium">{formatDate(ad.end_date)}</span>
                    </p>
                    {ad.payment_image && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500">صورة الدفع:</p>
                        <img
                          src={ad.payment_image}
                          alt="receipt"
                          className="w-32 h-auto rounded border cursor-pointer"
                          onClick={() => {
                            setSelectedImage(ad.payment_image);
                            setShowImageModal(true);
                          }}
                        />
                      </div>
                    )}

                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => approveAd(ad.id)}
                    className="flex items-center gap-1 text-green-600"
                  >
                    <CheckIcon className="w-4 h-4" /> قبول
                  </button>

                  <button
                    onClick={() => {
                      setSelectedAdId(ad.id);
                      setShowRejectForm(true);
                    }}
                    className="flex items-center gap-1 text-red-600"
                  >
                    <NoSymbolIcon className="w-4 h-4" /> رفض
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= REJECT MODAL ================= */}
      {showRejectForm && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <div className="flex justify-between mb-4">
              <h3>سبب الرفض</h3>
              <XMarkIcon
                className="w-6 h-6 cursor-pointer"
                onClick={() => setShowRejectForm(false)}
              />
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full border rounded p-2 text-xs"
            />
            <button
              onClick={rejectAd}
              className="mt-4 bg-red-500 text-white px-4 py-1 rounded"
            >
              تأكيد
            </button>
          </div>
        </div>
      )}
      {/* ================= PAYMENT ACCOUNTS ================= */}
      {activeSection === "accounts" && (
        <div className="px-10 mt-10">

          {/* إضافة حساب جديد */}
          <div className="bg-white border rounded-xl p-6 mb-10">
            <h3 className="mb-4 font-normal text-primary">إضافة حساب بنكي</h3>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder=" اسم البنك او المحفظة"
                value={accountForm.bank_name}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, bank_name: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              {accountErrors.bank_name && (
                <p className="text-red-500 text-xs mt-1">{accountErrors.bank_name}</p>
              )}
              <input
                type="text"
                placeholder=" اسم صاحب الحساب "
                value={accountForm.account_name}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, account_name: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              {accountErrors.account_name && (
                <p className="text-red-500 text-xs mt-1">{accountErrors.account_name}</p>
              )}
              <input
                type="text"
                placeholder="رقم الحساب / IBAN"
                value={accountForm.account_number}
                onChange={(e) =>
                  setAccountForm({ ...accountForm, account_number: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              {accountErrors.account_number && (
                <p className="text-red-500 text-xs mt-1">{accountErrors.account_number}</p>
              )}
            </div>

            <button
              onClick={addAccount}
              className="mt-4 bg-primary text-white px-6 py-2 rounded"
            >
              إضافة الحساب
            </button>
          </div>

          {/* عرض الحسابات */}
          <div className="grid grid-cols-3 gap-6">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="border border-primary/40 rounded-xl p-4"
              >
                <h3 className="font-medium">{acc.bank_name}</h3>
                <p className="text-sm text-gray-500">{acc.account_number}</p>
                <p className="text-sm text-gray-500">{acc.account_name}</p>

                <div className="flex gap-3 mt-4">
                  <TrashIcon
                    OnClick={() =>
                      showConfirmToast({
                        message: "هل أنت متأكد من حذف هذا الحساب؟",
                        onConfirm: async () => {
                          await axios.delete(
                            `http://127.0.0.1:8000/api/services/admin/payment-accounts/${acc.id}/`,
                            { headers: { Authorization: `Token ${token}` } }
                          );
                          fetchAccounts();
                        },
                      })
                    }
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* ================ show payment image ================= */}
      {showImageModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowImageModal(false)} // يغلق عند الضغط على الخلفية فقط
        >
          <div
            className="bg-white p-4 rounded-lg relative"
            onClick={(e) => e.stopPropagation()} // يمنع إغلاق النافذة عند الضغط داخلها
          >
            <div className="flex justify-between mb-4">
              {/* زر الإغلاق */}
              <XMarkIcon
                className="w-6 h-6 cursor-pointer absolute top-2 right-2 text-gray-600 hover:text-red-600"
                onClick={() => setShowImageModal(false)}
              />
            </div>

            {/* الصورة */}
            <img
              src={selectedImage}
              alt="receipt large"
              className="w-300 h-130"
            />
          </div>
        </div>
      )}

    </div>
  );
};

export default ManageAdv;
