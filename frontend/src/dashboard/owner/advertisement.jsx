import React from 'react'
import {CameraIcon} from '@heroicons/react/24/outline'
import { useEffect, useState } from "react";
import axios from "axios";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const advertisement = () => {
  const [packages, setPackages] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [image, setImage] = useState(null);
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [packageId, setPackageId] = useState("");
  const [ads, setAds] = useState([]);

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
    axios
      .get("http://127.0.0.1:8000/api/services/ads/approved/")
      .then(res => setAds(res.data))
      .catch(err => console.error("خطأ تحميل الإعلانات:", err));
  }, []);

  const submitAd = async (e) => {
    e.preventDefault();

    if (!image || !description || !startDate || !packageId) {
      alert("يرجى تعبئة جميع الحقول");
      return;
    }
    const today = new Date().toISOString().split("T")[0];
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("image", image);
    formData.append("description", description);
    formData.append("start_date", today);
   formData.append("package", packageId);

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

    alert("تم إرسال طلب الإعلان بنجاح");
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


  return (
    <div className="flex-1 p-4 md:p-10 bg-primary-50/30 font-['Montserrat-Arabic'] font-light text-[15px]">

        {/* ======================= الإعلانات المنشورة ======================= */}
        <h2 className="text-xl font-normal text-gray-900 mb-5 text-right">الاعلانات المنشورة</h2>
        <div className="flex flex-col gap-5">
        {ads.map((ad)=>(
          <div key={ad.id} className="bg-white rounded-2xl p-6 mb-6 flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="text-right">
              <p className="mb-2 font-normal">تم قبول الإعلان</p>
              <p className="text-gray-700 mb-2 w-150">{ad.description}</p>
            </div>

            <button onClick={() => handleDeleteAds(ad.id)} className="bg-red-700 text-white px-6 py-2 rounded-md hover:bg-red-600 transition w-fit cursor-pointer">
              حذف الإعلان
            </button>
          </div>
        ))}
          
        </div>

        {/* ====================== العنوان ====================== */}
        <h2 className="text-xl font-normal text-gray-900 mb-5 text-right">طلب إعلان جديد</h2>
        <form onSubmit={submitAd} className='py-4 px-6 flex flex-col gap-6 bg-white rounded-xl'>
          <div onClick={() => document.getElementById('addicon').click()} className="w-fit cursor-pointer flex items-center gap-1 text-primary-600">
            <CameraIcon className='w-6 h-6 ml-2'/>
            <label className="cursor-pointer">اضف صورة</label>
            <input
              id="addicon"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
          <div className='flex flex-col gap-2'>
            <label className="text-gray-600 font-light">اكتب وصفاً للإعلان</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب هنا"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
            <p className="text-sm text-gray-500 mt-1">
            </p>
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
            </div>
            {startDate && selectedPackage && (
              <div className="text-gray-600 mt-4 text-sm">
                من <span className="font-medium">{formatDate(startDate)}</span>
                {" "}سيستمر الإعلان إلى{" "}
                <span className="font-medium">{calculateEndDate()}</span>
              </div>
            )}
          </div>
          <button type='submit' className="bg-green-600 text-white px-10 py-2 rounded-md hover:bg-green-700 transition self-center mt-15"> إرسال الطلب</button>        
        </form>
    </div>
  )
}

export default advertisement