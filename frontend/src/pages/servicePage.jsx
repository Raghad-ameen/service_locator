import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { HeartIcon, StarIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Magicpen, Star } from '../component/icons';
import default_image from '../assets/haraz.png';

// خريطة
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

// دالة جلب العنوان من Nominatim
const getAddressFromCoords = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`
    );
    const data = await res.json();
    return data.address;
  } catch (err) {
    console.error("خطأ في جلب العنوان:", err);
    return null;
  }
};

const ServicePage = () => {
  const { id } = useParams(); // رقم الخدمة
  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [address, setAddress] = useState(null);

  const navigate = useNavigate();

  function formatTimeToArabic(time) {
    if (!time) return "";
    let [hour, minute] = time.split(":");
    hour = Number(hour);
    const suffix = hour >= 12 ? "م" : "ص";
    hour = hour % 12 || 12;
    return `${hour}:${minute} ${suffix}`;
  }

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/services/service/${id}/`)
      .then(async (res) => {
        setService(res.data);

        // جلب العنوان من Nominatim
        if (res.data.latitude && res.data.longitude) {
          const addr = await getAddressFromCoords(res.data.latitude, res.data.longitude);
          setAddress(addr);
        }

        setLoading(false);
      })
      .catch(err => {
        console.error("خطأ في تحميل الخدمة:", err);
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/services/products/?service=${id}`
        );
        setProducts(res.data);
      } catch (err) {
        console.log("خطأ في تحميل المنتجات:", err);
      }
    };
    fetchProducts();
  }, [id]);

  if (loading) return <div>جاري تحميل البيانات...</div>;
  if (!service) return <div>الخدمة غير موجودة</div>;

  return (
    <div dir="rtl" className="px-10 font-['Montserrat-Arabic'] font-light text-[15px] flex flex-row min-h-screen">
      {/* بيانات الخدمة */}
      <div className="flex flex-col items-center gap-5 sticky w-[660px] top-20 h-fit self-start pt-10">
        <div className="relative flex justify-center">
          <img src={service.cover_image} className="h-70 w-150 rounded-3xl object-cover" alt=""/>
          <img src={service.logo_image} className='absolute -bottom-10 rounded-full shadow-[0_4px_6px_1px_rgba(0,0,0,0.2)] h-30 w-30' alt=""/>
        </div>
        <h1 className="text-2xl font-bold mt-12">{service.title}</h1>
        <p className="text-gray-600 text-wrap w-80 text-center">{service.description}</p>
        <div className='flex gap-6'>
          <HeartIcon className='h-6 w-6 text-red-500'/>
          <div className='flex gap-2'>
            <StarIcon className='h-6 w-6 text-yellow-300'/>
            <span className='text-base font-normal'>4.5</span>
          </div>
        </div>
        <div className='flex gap-8 mt-6'>
          <button className='bg-primary px-4 py-2 rounded-lg text-white flex gap-2 cursor-pointer'><Star/>اضف تقييم</button>
          <button className='px-4 py-2 border border-primary rounded-lg text-primary flex gap-2 cursor-pointer'><Magicpen/> اكتب ملاحظتك</button>
        </div>
      </div>

      <div className='flex-1 flex flex-col overflow-y-auto pt-10 pr-10'>
        {/* المنتجات */}
        <div>
          <h2 className="text-lg mb-3 font-medium">المنتجات</h2>
          {products && products.length > 0 ? (
            <div className='pl-20'>
              {products.slice(0, 5).map((prod) => (
                <div key={prod.id} className="flex gap-4 py-3">
                  <img
                    src={prod.images?.[0]?.photo || default_image}
                    onClick={() => {setPreviewImages(prod.images || []); setShowModal("preview");}}
                    className="w-30 h-25 rounded-2xl object-cover"
                    alt=""
                  />
                  <div className="flex flex-col gap-2">
                    <h3 className="font-semibold">{prod.name}</h3>
                    <p className="text-gray-500">({prod.description})</p>
                    <p className="text-primary-700 text-sm">{prod.price} ريال</p>
                  </div>
                </div>
              ))}
              {products.length > 5 && (
                <button onClick={() => navigate(`/productList?service=${id}`)} className="mt-10 px-4 py-2 bg-gray-100 rounded-lg w-full text-base cursor-pointer">
                  عرض الكل
                </button>
              )}
            </div>
          ) : (
            <p>لا توجد منتجات</p>
          )}
        </div>

        {/* معلومات التواصل */}
        <div className="mt-10 w-fit">
          <h2 className="text-lg font-medium mb-3">معلومات التواصل</h2>
          <p className='pb-3 mb-2'>الهاتف: {service.phone}</p>
          <p className='border-t border-gray-300 py-2 mb-2'>الواتس: {service.whatsapp}</p>
          <p className='border-t border-gray-300 py-2 mb-2'>الإيميل: {service.email}</p>
        </div>

        {/* الموقع */}
        <div className="mt-10">
          <h2 className="text-lg font-medium mb-3">الموقع</h2>
          <p>
            {address
              ? `${address.road || ""}، ${address.suburb || address.city || ""}`
              : (service.latitude && service.longitude
                  ? `${service.latitude}, ${service.longitude}`
                  : "لم يتم تحديد الموقع")}
          </p>

          {service.latitude && service.longitude && (
            <div className="w-full h-[400px] rounded-3xl shadow-sm border border-gray-200 overflow-hidden mt-4">
              <MapContainer
                center={[service.latitude, service.longitude]}
                zoom={15}
                style={{ width: "100%", height: "100%" }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[service.latitude, service.longitude]}>
                  <Popup>{service.title}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>

        {/* أوقات الدوام */}
        <div className="mt-10">
          <h2 className="text-lg font-medium mb-3">أوقات الدوام:</h2>
          <div className="space-y-2 text-gray-500 font-medium">
            {service.work_schedules?.map((s) => (
              <p key={s.id}>
                <span className='text-black'>{s.day} :</span> {formatTimeToArabic(s.start_time)} - {formatTimeToArabic(s.end_time)}
              </p>
            ))}
          </div>
        </div>

        {/* التعليقات */}
        <div className="mt-10">
          <h2 className="text-lg font-medium mb-3">التعليقات</h2>
          {service.reviews?.map((review) => (
            <div key={review.id} className="border-b py-4">
              <p className="font-semibold">{review.user}</p>
              <p className="text-sm text-gray-600">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>

      {showModal === "preview" && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-xl w-fit">
            <div className="flex justify-between mb-4">
              <h2 className="text-base">صور المنتج</h2>
              <XMarkIcon
                onClick={() => setShowModal(false)}
                className="w-7 h-7 cursor-pointer p-1 rounded-full hover:bg-primary-50"
              />
            </div>

            {/* dynamic grid */}
            {(() => {
              const imgs = previewImages || [];
              const cols = Math.min(imgs.length, 4);
              const colClass = {
                1: "grid-cols-1",
                2: "grid-cols-2",
                3: "grid-cols-3",
                4: "grid-cols-4",
              }[cols] || "grid-cols-1";

              return (
                <div className={`grid gap-4 w-fit ${colClass}`}>
                  {imgs.map((img) => (
                    <img
                      key={img.id || img.photo}
                      src={img.photo || default_image}
                      className="w-full h-32 object-cover rounded"
                      alt=""
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;
