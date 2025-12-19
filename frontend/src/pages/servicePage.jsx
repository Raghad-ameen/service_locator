import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import { HeartIcon, StarIcon, XMarkIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { StarIcon as StarOutline, CameraIcon } from '@heroicons/react/24/outline';
import { Magicpen, Star } from '../component/icons';
import default_image from '../assets/haraz.png';
const ServicePage = () => {
  const { id } = useParams(); // رقم الخدمة
  const [service, setService] = useState(null);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [opensuggestion, setOpensuggestion] = useState(false);
  const [addreview, setAddreview] = useState(false);
  const [comments, setComments] = useState([]);
  const [userRating, setUserRating] = useState(null);
  const [ratingSummary, setRatingSummary] = useState({average: 0, count: 0});
  const [message, setMessage] = useState("");
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [images, setImages] = useState([]);


  const navigate = useNavigate();
  function formatTimeToArabic(time) {
    if (!time) return "";

    let [hour, minute] = time.split(":");
    hour = Number(hour);
    const suffix = hour >= 12 ? "م" : "ص";

    // convert to 12 hours
    hour = hour % 12 || 12;

    return `${hour}:${minute} ${suffix}`;
  }

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/services/service/${id}/`)
      .then(res => {
        setService(res.data);
      })
      .catch(err => {
        console.error("خطأ في تحميل الخدمة:", err);
      });
  }, [id]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/services/public/products/?service=${id}`
        );
        setProducts(res.data);
      } catch (err) {
        console.log("خطأ في تحميل المنتجات:", err);
      }
    };

    fetchProducts();
  }, [id]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    axios.get(
      `http://127.0.0.1:8000/api/users/my-rating/?service=${id}`,
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    )
    .then(res => {
      setUserRating(res.data.rating); // صح 100%
    })
    .catch(() => setUserRating(null));
  }, [id]);

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/users/service-rating/?service=${id}`)
      .then(res => setRatingSummary(res.data))
      .catch(() => setRatingSummary({ average: 0, count: 0 }));
  }, [id]);


  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/users/comments/?service=${id}`)
      .then(res => setComments(res.data))
      .catch(err => console.error(err));
  }, [id]);


  const handleSubmit = async () => {
    if (!message.trim()) return;

    try {
      await axios.post(
        "http://127.0.0.1:8000/api/users/suggestions/create/",
        {
          message,
          service_id: id, // ✅ هذا الصحيح
        },
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );

      setMessage("");
      setOpensuggestion(false);
    } catch (err) {
      console.error("خطأ في إرسال الاقتراح:", err.response?.data || err.message);
    }
  };

  const handleSubmitAll = async () => {
    if (!userRating && !rating && !comment.trim()) {
      alert("أضيفي تقييم أو تعليق على الأقل");
      return;
    }

    try {
      // ⭐ 1. إرسال التقييم إذا ما قيّم سابقًا
      if (!userRating && rating) {
        await axios.post(
          "http://127.0.0.1:8000/api/users/reviews/",
          { service: id, rating },
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );
        setUserRating(rating);
      }

      // 💬 2. إرسال التعليق + الصور
      if (comment.trim()) {
        const formData = new FormData();
        formData.append("service", id);
        formData.append("text", comment);

        images.forEach(img => {
          formData.append("images", img);
        });

        await axios.post(
          "http://127.0.0.1:8000/api/users/comments/",
          formData,
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );

        const res = await axios.get(
          `http://127.0.0.1:8000/api/users/comments/?service=${id}`
        );
        setComments(res.data);
      }

      // 🧹 3. تنظيف وإغلاق
      setRating(0);
      setComment("");
      setImages([]);
      setAddreview(false);

    } catch (err) {
      console.error(err.response?.data || err);
      alert("حدث خطأ أثناء الإرسال");
    }
  };



  if (!service) return <div>الخدمة غير موجودة</div>;

  return (
    <div dir="rtl" className="px-10 font-['Montserrat-Arabic'] font-light text-[15px] flex flex-row min-h-screen">
      {/* بيانات الخدمة */}
      <div className="flex flex-col items-center gap-5 sticky w-[660px] top-20 h-fit self-start pt-10">
        <div className="relative flex justify-center">
          <img src={service.cover_image} className="h-70 w-150 rounded-3xl object-cover" alt="" />
          <img src={service.logo_image} className='absolute -bottom-10 rounded-full shadow-[0_4px_6px_1px_rgba(0,0,0,0.2)] h-30 w-30' />
        </div>
        <h1 className="text-2xl font-bold mt-12">{service.title}</h1>
        <p className="text-gray-600 text-wrap w-80 text-center">{service.description}</p>
        <div className='flex gap-6'>
          <HeartIcon className='h-6 w-6 text-red-500' />
          <div className='flex gap-2'>
            <StarIcon className='h-6 w-6 text-yellow-300' />
            <span className="text-base font-normal">
              {ratingSummary.average}
            </span>
          </div>
        </div>
        <div className='flex gap-8 mt-6'>
          <button onClick={() => setAddreview(true)} className='bg-primary px-4 py-2 rounded-lg text-white flex gap-2 cursor-pointer'><Star />اضف تقييم</button>
          <button onClick={() => setOpensuggestion(true)} className='px-4 py-2 border border-primary rounded-lg text-primary flex gap-2 cursor-pointer'><Magicpen /> اكتب ملاحظتك</button>
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
                    onClick={() => { setPreviewImages(prod.images); setShowModal("preview"); }}
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
          <p>{service.location}</p>
        </div>
        {/* أوقات الدوام */}
        <div className="mt-10">
          <h2 className="text-lg font-medium mb-3">أوقات الدوام:</h2>

          <div className="space-y-2 text-gray-500 font-medium">
            {service.work_schedules?.map((s) => (
              <p key={s.id}> <span className='text-black'>{s.day} :</span> {formatTimeToArabic(s.start_time)} - {formatTimeToArabic(s.end_time)} </p>
            ))}
          </div>
        </div>
        {/* التعليقات */}
        <div className="mt-10">
          <h2 className="text-lg font-medium mb-3">التعليقات</h2>

          {comments.length === 0 && (
            <p className="text-sm text-gray-500">لا توجد تقييمات بعد</p>
          )}

          {comments.map((c) => (
            <div key={c.id} className="border-b py-4 flex gap-3">
              <img
                src={c.user_image || "/default-avatar.png"}
                className="w-10 h-10 rounded-full"
              />

              <div className="flex-1">
                <p className="font-semibold">{c.user_name}</p>
                <p className="text-sm text-gray-600">{c.text}</p>

                {c.images?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {c.images.map(img => (
                      <img
                        key={img.id}
                        src={img.image}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                    ))}
                  </div>
                )}
              </div>
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

            {/* 🔥 dynamic grid */}
            {(() => {
              const cols = Math.min(previewImages.length, 4);
              const colClass = {
                1: "grid-cols-1",
                2: "grid-cols-2",
                3: "grid-cols-3",
                4: "grid-cols-4",
              }[cols];

              return (
                <div className={`grid gap-4 w-fit ${colClass}`}>
                  {previewImages.map((img) => (
                    <img
                      key={img.id}
                      src={img.photo}
                      className="w-full h-32 object-cover rounded"
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}
      {opensuggestion && (
        <div onClick={(e) => e.target === e.currentTarget && setOpensuggestion(false)}
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
          <div className='bg-white p-6 rounded-xl w-fit flex flex-col gap-5'>
            <div className='flex items-center gap-12'>
              <ChevronRightIcon onClick={() => setOpensuggestion(false)} className='h-6 w-5 hover:text-primary cursor-pointer' />
              <h3 className='text-lg'>اضف ملاحظتك</h3>
            </div>
            <p className='font-extralight text-gray-700'>نرحب بكل آرائك وملاحظاتك .. <br />
              شاركنا أي اقتراح أو شكوى بخصوص  تجربتك <br />للخدمة</p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder='اكتب هنا'
              rows={4}
              className='border border-gray-300 rounded-lg p-2 placeholder:text-xs focus:outline-none'
            />
            <button onClick={handleSubmit} className='bg-primary text-white py-1 rounded-lg'>إرسال</button>
          </div>
        </div>
      )}
      {addreview && (
        <div
          onClick={(e) => e.target === e.currentTarget && setAddreview(false)}
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-xl w-fit flex flex-col gap-5">
            <div className="flex items-center gap-12">
              <ChevronRightIcon
                onClick={() => setAddreview(false)}
                className="h-6 w-5 hover:text-primary cursor-pointer"
              />
              <h3 className="text-lg">اضف تقييم</h3>
            </div>

            {!userRating && (
              <div>
                <p className="font-extralight text-gray-700">
                  تقيمك للخدمة يساعدنا في تقديم الافضل
                </p>
                {/* ⭐ Rating */}
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      onClick={() => !userRating && setRating(star)}
                      className={`h-6 w-6 cursor-pointer ${(userRating || rating) >= star
                          ? "text-yellow-400"
                          : "text-gray-300"
                        }`}
                    />
                  ))}
                </div>
                <hr className="text-gray-300" />
              </div>
            )}

            <h4 className="font-normal text-sm text-gray-900">اكتب تعليقاً</h4>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="اكتب هنا"
              rows={4}
              className="border border-gray-300 rounded-lg p-2 placeholder:text-xs focus:outline-none"
            />

            <div
              onClick={() => document.getElementById("comImage").click()}
              className="flex items-center cursor-pointer"
            >
              <CameraIcon className="w-6 h-6 ml-2 text-primary-700" />
              <span className="text-primary-700">اضف صورة</span>
            </div>

            <input
              id="comImage"
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => setImages(Array.from(e.target.files))}
            />

            <button
              onClick={handleSubmitAll}
              className="bg-primary text-white py-1 rounded-lg"
            >
              إرسال
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default ServicePage;
