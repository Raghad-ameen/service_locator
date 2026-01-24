import { useEffect, useState } from "react";
import {TrashIcon} from "../../component/icons"
import { useLocation } from "react-router-dom";
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import default_img from "../../../public/media/user_profile/default.png";
import {CheckIcon, NoSymbolIcon, XMarkIcon, ExclamationTriangleIcon} from "@heroicons/react/24/outline";
import axios from 'axios';
import ConfirmToast from "../../component/ConfirmToast";
import { toast } from "react-toastify";
import { useAuth } from "../../context/AuthContext";

const ServicesList = () => {
  const location = useLocation();
  const [services, setServices] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState("services");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const {updateUser } = useAuth();
//جلب بيانات الخدمة
  useEffect(() => {
    refreshServices();
  }, []);

  const refreshServices = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://127.0.0.1:8000/api/services/service/", {
        headers: { Authorization: `Token ${token}` }
      });
      setServices(res.data);

      const count = res.data.filter(s => s.status === "pending").length;
      setPendingCount(count);

    } catch (err) {
      console.error("خطأ في تحميل الخدمات:", err);
    }
  }
//تحديث حالة الخدمة لمقبولة
  const approveService = async (id) => {
    const token = localStorage.getItem("token");
    await axios.post(`http://127.0.0.1:8000/api/services/service/${id}/approve/`,
      {},
      { headers: { Authorization: `Token ${token}` } }
    );
    setServices(prevServices => 
      prevServices.map(s => s.id === id ? { ...s, status: "approved" } : s)
    );
    refreshServices(); 
    updateUser({ has_service: true });
  };
//تحديث حالة الخدمة لمرفوضه
  const rejectService = async (id, reason) => {
    const token = localStorage.getItem("token");
    await axios.post(`http://127.0.0.1:8000/api/services/service/${id}/reject/`,
      { reason },
      { headers: { Authorization: `Token ${token}` } }
    );
    setServices(prevServices =>
      prevServices.map(s => s.id === id ? { ...s, status: "rejected" } : s)
    );
    refreshServices(); 
  };
//حذف
  const handleDeleteService = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`http://127.0.0.1:8000/api/services/service/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setServices(services.filter((service) => service.id !== id));
    } catch (err) {
      console.error('خطأ في حذف الخدمة:', err.response?.status, err.response?.data || err.message);
    }
  };

  const showConfirmToast = ({message, onConfirm}) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
          title ="حذف خدمة"
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
//ايقاف

//بحث
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const updatedSearch = queryParams.get("q") || "";
    if (updatedSearch !== searchTerm) {
      setSearchTerm(updatedSearch);
    }
  }, [location.search]);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchServices = async () => {
      try {
        const query = searchTerm.trim();
        const url = query
          ? `http://127.0.0.1:8000/api/services/service/?search=${encodeURIComponent(query)}`
          : `http://127.0.0.1:8000/api/services/service/`;

        const res = await axios.get(url, {
          headers: { Authorization: `Token ${token}` }
        });

        setServices(res.data);

        const count = res.data.filter(s => s.status === "pending").length;
        setPendingCount(count);

      } catch (err) {
        console.error("خطأ في جلب الأقسام:", err);
      }
    };

    fetchServices();
  }, [searchTerm]);

  return (
    <div dir="rtl" className="mx-auto text-secondary-900 p-6 font-['Montserrat-Arabic'] text-[14px]">
      <div className="flex justify-between">
        <h2 className="m-4 text-lg text-primary-600 font-normal">ادارة الخدمات</h2>
      </div>
      <div className="flex gap-10 mx-10 my-5 text-[14.5px]">
        <button onClick={() => setActiveSection("services")} className={`cursor-pointer relative after:absolute after:-bottom-2 after:right-0 after:h-0.5 after:w-0 after:bg-primary transition duration-700 after:transition-all ${activeSection === "services" ? "text-primary after:w-full" : "hover:text-primary-600 hover:after:w-full text-gray-700"}`}>قائمة الخدمات</button>
        <button onClick={() => setActiveSection("pending")} className={`cursor-pointer relative after:absolute after:-bottom-2 after:right-0 after:h-0.5 after:w-0 after:bg-primary transition duration-700 after:transition-all ${activeSection === "pending" ? "text-primary after:w-full" : "hover:text-primary-600 after:bg-primary-600 hover:after:w-full text-gray-700"}`}>خدمات بإنتظار الموافقة 
         {pendingCount > 0 && (
          <span className="text-red-500 text-xl mr-1">*</span>
          )}
        </button>
      </div>
      {activeSection === "services" && ( 
        <div className="p-10"> 
          <table className="w-full">
            {services.length > 0 &&( 
              <thead> 
                <tr className="text-center flex text-primary p-2 bg-primary-50/30 rounded">
                  <th className="p-2 flex-1 font-medium">الصورة</th> 
                  <th className="p-2 flex-1 font-medium">الاسم</th> 
                  <th className="p-2 flex-2 font-medium">النوع</th> 
                  <th className="p-2 flex-1 font-medium">صاحب الخدمة</th> 
                  <th className="p-2 flex-1 font-medium"/>
                </tr>
              </thead> 
            )}
            <tbody>
              {services.length > 0 ? (
                services
                  .filter(service => service.status === "approved")   // ← هنا الفلترة
                  .map((service) => ( // العرض
                    <tr key={service.id} className="text-center flex text-secondary-900 font-light p-2 border-b border-primary/30 items-center justify-between my-4">
                      <td className="p-2 flex-1">
                        <img
                          src={service.logo_image || default_img}
                          onError={(e) => { e.target.src = default_img }}
                          alt="صورة"
                          className="w-10 h-10 rounded-full mx-auto object-cover"
                        />
                      </td>
                      <td className="p-2 flex-1">{service.title}</td>
                      <td className="p-2 flex-2">{service.category?.name}</td>
                      <td className="p-2 flex-1">{service.owner}</td>
                      <td className="p-2 flex-1 flex gap-4 items-center justify-center">
                        <TrashIcon OnClick={() =>showConfirmToast({message: "هل أنت متأكد من انك تريد حذف هذه الخدمة ؟", onConfirm: () => handleDeleteService(service.id)}) } className="cursor-pointer" />
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-6">لا توجد خدمات حالياً </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {activeSection === "pending" && (
        <div className="mt-10 shadow-md shadow-primary/20 rounded-lg border border-primary/30">
          {services.filter(s => s.status === "pending").map(s => (
            <div key={s.id} className="p-5 text-sm border border-primary/30">
            {/*  تاريخ انشاء الخدمة*/}
              <p className="text-xs mb-5 text-primary">
                {new Date(s.created_at).toLocaleDateString("ar", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            {/* معلومات الخدمة */}
              <div className="flex justify-between">
                {/* معلومات صاحب الخدمة */}
                <div className="flex flex-col gap-2">
                  {/* اسم و صورة صاحب الخدمة */}
                  <div className="flex gap-5 items-center">
                    <img src={s.owner_image || default_img} onError={(e) => { e.target.src = default_img }} className="w-10 h-10 rounded-full object-cover" />
                    <p className="text-gray-500">{s.owner}</p>
                  </div>
                  {/* الايميل \ رقم الهاتف \رقم الواتس */}
                  <div className="flex flex-col gap-2">
                    {/* <p><span className="text-gray-500 ml-2 text-xs font-light">البريد الالكتروني :</span>{s.email}</p> */}
                    <p><span className="text-gray-500 ml-2 text-xs font-light">رقم الهاتف :</span>{s.phone}</p>
                    <p><span className="text-gray-500 ml-2 text-xs font-light">رقم الواتس :</span>{s.whatsapp}</p>
                  </div>
                </div>
                {/*معلومات الخدمة نفسها */}
                <div className="flex flex-col gap-2">
                {/* صورة الخدمة و اسمها */}
                  <div className="flex gap-5 items-center">
                    <img src={s.logo_image || default_img} onError={(e) => { e.target.src = default_img }} className="w-10 h-10 rounded-full object-cover" />
                    <h3><span className="text-gray-500 ml-2 font-light text-xs">اسم الخدمة :</span>{s.title}</h3>
                  </div>
                  {/* نوع القسم \الوصف \اوقات الدوام */}
                  <div className="flex flex-col gap-2">
                    <p><span className="text-gray-500 ml-2 text-xs font-light">القسم :</span>{s.category?.name}</p>
                    <p className="w-100"><span className="text-gray-500 ml-2 font-light text-xs">الوصف :</span>{s.description}</p>
                    <div><span className="text-gray-500 text-xs font-light">أوقات الدوام :</span>
                      {s.work_schedules.map(ws => (
                        <div key={ws.id} className="my-2">
                          <span>{ws.day}: {ws.start_time} - {ws.end_time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {/* ازرار القبول او الرفض */}
                <div className="text-sm flex gap-4 text-gray-500 w-fit self-start">
                  <button onClick={() => approveService(s.id)} className="px-4 py-1.5 border border-gray-400 rounded-lg flex gap-2 items-center cursor-pointer group hover:text-white hover:bg-primary hover:border-primary"><CheckIcon className="w-4 h-4 text-primary group-hover:text-white"/>قبول</button>
                  <button onClick={() => {setSelectedServiceId(s.id); setShowRejectForm(true);} } className="px-4 py-1.5 border border-gray-400 rounded-lg flex gap-2 items-center cursor-pointer group hover:text-white hover:bg-red-500 hover:border-red-500"><NoSymbolIcon className="w-4 h-4 text-red-500 group-hover:text-white"/>رفض</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {showRejectForm && (
        <div onClick={() => setShowRejectForm(false)}  className="fixed inset-0 bg-black/20 flex justify-center items-center z-50">
          <div onClick={(e) => e.stopPropagation()} className="bg-white p-6 rounded-lg shadow-lg w-fit">
            <div className="flex justify-between">
              <h2 className="mb-6 text-base text-gray-800">سبب الرفض</h2>
              <XMarkIcon type="button" onClick={() => setShowRejectForm(false)} className="w-7 h-7 text-gray-500 hover:text-primary cursor-pointer hover:bg-primary-50/40 p-1 rounded-full"/>
            </div>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="اكتب سبب الرفض هنا..."
              className="w-80 h-30 border border-gray-300 rounded p-2 mb-4 text-xs"
            />
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  rejectService(selectedServiceId, rejectReason); // ← هنا يتم إرسال السبب
                  setShowRejectForm(false);
                  setRejectReason("");
                }} className="px-4 py-1 bg-red-500 text-white rounded">تأكيد </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicesList;
