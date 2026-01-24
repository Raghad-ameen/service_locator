import { CameraIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useEffect, useState,useRef } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import ConfirmToast from '../../component/ConfirmToast';

function PaymentReceiptUpload({ onChange }) {
  const [preview, setPreview] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

 const startCamera = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    streamRef.current = stream;

    if (videoRef.current) { // ✅ نتأكد إنه مش null
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
    }
    setPreview(null);
  } catch (err) {
    console.error("خطأ في تشغيل الكاميرا:", err);
  }
};

  const takePhoto = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], "receipt.jpg", { type: "image/jpeg" });
        onChange(file);
        setPreview(URL.createObjectURL(blob)); // معاينة الصورة
      }
    }, "image/jpeg");

    // إيقاف الكاميرا
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  return (
    <div>
      <label>صورة سند الدفع</label>
      <input
        type="file"
        accept="image/*,.pdf"
        onChange={(e) => {
  const file = e.target.files[0];
  if (file) {
    onChange(file);
    setPreview(URL.createObjectURL(file));
  }
}}

      />

      {!preview && (
        <>
          <button type="button" onClick={startCamera}>تشغيل الكاميرا</button>
          <video ref={videoRef} autoPlay width="300" height="200"></video>
          <button type="button" onClick={takePhoto}>التقاط صورة</button>
        </>
      )}

      <canvas ref={canvasRef} width="300" height="200" style={{display:"none"}}></canvas>

      {preview && (
        <div>
          <h4>الصورة الملتقطة:</h4>
          <img src={preview} alt="receipt preview" width="300" />
          <button type="button" onClick={startCamera}>إعادة التصوير</button>
        </div>
      )}
    </div>
  );
}

const advertisement = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [packageId, setPackageId] = useState("");
  const [ads, setAds] = useState([]);
  const [errors, setErrors] = useState({});
const [transactionNumber, setTransactionNumber] = useState("");
const [paymentNotes, setPaymentNotes] = useState("");
const [paymentReceipt, setPaymentReceipt] = useState(null);
const [accounts, setAccounts] = useState([]);



  useEffect(() => {
    const token = localStorage.getItem("token");
    axios
      .get("http://127.0.0.1:8000/api/services/provider/packages/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setPackages(res.data))
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios.get(
      "http://127.0.0.1:8000/api/services/provider/ads/approved/",
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
      .then(res => setAds(res.data))
      .catch(err => {
        console.error("خطأ تحميل الإعلانات:", err.response?.status, err.response?.data);
      });
  }, []);
useEffect(() => {
  const token = localStorage.getItem("token");
  axios.get("http://127.0.0.1:8000/api/services/payment-accounts/", {
    headers: {
      Authorization: `Token ${token}`
    }
  })
  .then(res => setAccounts(res.data))
  .catch(err => console.error("خطأ في جلب الحسابات:", err));
}, []);

  const validateForm = () => {
    const newErrors = {};

    if (!image) {
      newErrors.image = "صورة الإعلان مطلوبة";
    }

    if (!description.trim()) {
      newErrors.description = "وصف الإعلان مطلوب";
    } else if (description.length < 10) {
      newErrors.description = "الوصف يجب أن يكون 10 أحرف على الأقل";
    }

    if (!startDate) {
      newErrors.startDate = "تاريخ بدء الإعلان مطلوب";
    }

    if (!packageId) {
      newErrors.package = "يرجى اختيار باقة إعلان";
    }
if (!paymentReceipt) {
  newErrors.paymentReceipt = "صورة سند الدفع مطلوبة";
}


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submitAd = async (e) => {
    e.preventDefault();

     console.log("image:", image);
  console.log("paymentReceipt:", paymentReceipt);
  console.log("description:", description);
  console.log("packageId:", packageId);
  console.log("startDate:", startDate);

    if (!validateForm()) return;

    const toLocalYMD = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const formattedStartDate = toLocalYMD(startDate);
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);
    formData.append("start_date", formattedStartDate);
    formData.append("package", packageId);

formData.append("receipt_image", paymentReceipt);


    await axios.post(
      "http://127.0.0.1:8000/api/services/provider/ads/",
      formData,
      {
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    toast.success("تم إرسال طلب الإعلان بنجاح");
    setImage(null);
    setDescription("");
setTransactionNumber("");
setPaymentNotes("");
setPaymentReceipt(null);

    setStartDate(null);
    setPackageId("");
    setSelectedPackage(null);
  };

  const calculateEndDate = () => {
    if (!startDate || !selectedPackage) return null;

    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + selectedPackage.duration_days);

    return end.toLocaleDateString("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("ar", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleDeleteAds = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/services/provider/ads/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setAds(ads.filter((ad) => ad.id !== id));
    } catch (err) {
      console.error('خطأ في حذف الاعلان:', err.response?.status, err.response?.data || err.message);
    }
  };

  const showConfirmToast = ({ message, onConfirm }) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
          title="حذف إعلان"
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

  return (
    <div className="flex-1 p-4 md:p-10 bg-primary-50/30 font-['Montserrat-Arabic'] font-light text-[15px]">

      {/* ======================= الإعلانات المنشورة ======================= */}
      <h2 className="text-xl font-normal text-gray-900 mb-5 text-right">الاعلانات المنشورة</h2>
      <div className="flex flex-col gap-5">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="text-right">
              <p className="mb-2 font-normal">تم قبول الإعلان</p>
              <p className="text-gray-700 mb-2 w-150">{ad.description}</p>
              <p className="text-gray-500 text-xs mt-4 w-150">سيستمر الاعلان من <span className='text-primary mx-1'>{ad.start_date}</span> الى <span className='text-primary mx-1'>{ad.end_date}</span></p>
            </div>

            <button onClick={() => showConfirmToast({ message: "هل أنت متأكد من انك تريد حذف هذا الإعلان؟", onConfirm: () => handleDeleteAds(ad.id), })} className="bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-600 transition w-fit cursor-pointer">
              حذف الإعلان
            </button>
          </div>
        ))}

      </div>

      {/* ====================== العنوان ====================== */}
      <h2 className="text-xl font-normal text-gray-900 mb-5 text-right">طلب إعلان جديد</h2>
      <form onSubmit={submitAd} className='py-4 px-6 flex flex-col gap-6 bg-white rounded-xl'>
        <div onClick={() => document.getElementById('addicon').click()} className="w-fit cursor-pointer flex items-center gap-1 text-primary-600">
          <CameraIcon className='w-6 h-6 ml-2' />
          <label className="cursor-pointer">اضف صورة</label>
          <input
            id="addicon"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </div>
        {errors.image && (
          <p className="text-red-500 text-xs -mt-3">{errors.image}</p>
        )}
        <div className='flex flex-col gap-2'>
          <label className="text-gray-600 font-light">اكتب وصفاً للإعلان</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب هنا"
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
          {errors.description && (
            <p className="text-red-500 text-xs mt-1">{errors.description}</p>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-6">

          {/* تاريخ بدء الإعلان */}
          <div className="w-full md:w-64">
            <div className="relative">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                minDate={new Date()}
                placeholderText="حدد تاريخ بدء الإعلان"
                dateFormat="yyyy-MM-dd"
                calendarStartDay={6}
                className="w-full border border-gray-300 rounded-xl px-4 py-2 focus:outline-none tabular-nums"
                onChangeRaw={(e) => e.preventDefault()}
              />
            </div>
            {errors.startDate && (
              <p className="text-red-500 text-xs mt-1">{errors.startDate}</p>
            )}
          </div>

          {/* باقة الإعلان */}
          <div className="w-full md:w-72">
            <div className="relative border border-gray-300 rounded-xl px-5 py-2">
              <select
                value={packageId}
                onChange={(e) => {
                  const selectedId = Number(e.target.value);
                  setPackageId(selectedId);

                  const pkg = packages.find(p => p.id === selectedId);
                  setSelectedPackage(pkg);
                }}
                className="w-full"
              >
                <option hidden>اختر باقة (مدة الإعلان و سعره)</option>
                {packages.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.duration_days} أيام – {p.price} ريال
                  </option>
                ))}
              </select>
            </div>
            {errors.package && (
              <p className="text-red-500 text-xs mt-1">{errors.package}</p>
            )}
          </div>
          {startDate && selectedPackage && (
            <div className="text-gray-600 mt-4 text-sm">
              من <span className="font-medium">{formatDate(startDate)}</span>
              {" "}سيستمر الإعلان إلى{" "}
              <span className="font-medium">{calculateEndDate()}</span>
            </div>
          )}
        </div>
{/* ================== تفاصيل الدفع ================== */}
<div className="border-t pt-6 mt-6 space-y-4">

  <h3 className="text-lg font-normal text-gray-800 text-right">
    تفاصيل الدفع
  </h3>

  <p className="text-sm text-gray-500 text-right">
    يتم الدفع خارج المنصة. يرجى رفع صورة سند الدفع ليتم تفعيل الإعلان.
  </p>

 <div className="overflow-x-auto mt-6">
  <table className="w-full border border-gray-200 text-sm text-right">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-3 border">اسم البنك</th>
        <th className="p-3 border">رقم الحساب</th>
        <th className="p-3 border">اسم صاحب الحساب</th>
      </tr>
    </thead>
    <tbody>
      {accounts.length === 0 ? (
        <tr>
          <td colSpan="3" className="p-4 text-center text-gray-500">
            لا توجد حسابات دفع مضافة حالياً
          </td>
        </tr>
      ) : (
        accounts.map(acc => (
          <tr key={acc.id} className="hover:bg-gray-50">
            <td className="p-3 border">{acc.bank_name}</td>
            <td className="p-3 border font-mono">{acc.account_number}</td>
            <td className="p-3 border">{acc.account_name}</td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

  <PaymentReceiptUpload onChange={setPaymentReceipt}/>

  

</div>


        <button type='submit' className="bg-green-600 text-white px-10 py-2 rounded-md hover:bg-green-700 transition self-center mt-15"> إرسال الطلب</button>
      </form>
    </div>
  )
}

export default advertisement