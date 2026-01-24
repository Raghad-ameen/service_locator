import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFacebookF,
  faInstagram,
  faLinkedinIn,
  faYoutube,
  faTwitter,// استخدم faTwitter كبديل لـ "X / Twitter" في النسخة المجانية
} from '@fortawesome/free-brands-svg-icons';
const Footer = () => {
  const navigate= useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axios.get('https://service-locator-9aja.onrender.com/api/services/categories/')
    .then(res => setCategories(res.data))
    .catch(err => console.error('خطأ في تحميل الأقسام:', err));
  }, []);

  const socialIcons = [
    { icon: faFacebookF },
    { icon: faLinkedinIn },
    { icon: faYoutube },
    { icon: faTwitter },
    { icon: faInstagram },
  ];

  return (
    <footer dir="rtl" className="bg-black/90 text-white mt-10 rounded-t-[40px] overflow-hidden font-['Montserrat-Arabic'] font-light text-[15px] px-10">
      {/* ====================== الأعمدة ====================== */}
      <div className="grid lg:grid-cols-3 grid-cols-1 grid-rows-1 lg:gap-30 relative sm:py-15 lg:mb-15 px-4 lg:py-14 py-9 ">
        
        {/* ==========  اللوجو + النص ========== */}
        <div className="col-1 flex flex-col gap-8 w-fit lg:mb-0 mb-10">
          <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className='w-fit h-fit cursor-pointer'>
            <img src="/logo.png" alt="logo" className="w-18 h-22 mr-6" />
          </div>
          <div className="text-gray-300 text-base font-light leading-normal tracking-wide">
            دليلك لاكتشاف أفضل الأماكن والخدمات في مدينتك، حيث نمنحك آراء
            وتجارب حقيقية وموثوقة تساعدك على اتخاذ قراراتك بثقة وراحة، ونوفر لك
            وسيلة سهلة للوصول إلى ما تبحث عنه بسرعة، لتعيش تجربة أفضل في كل
            اختيار تقوم به..
          </div>
        </div>

        {/* ============== باقي الأعمدة ============== */}
        <div className="col-span-2 flex sm:flex-row flex-col sm:gap-10 mt-6 gap-0 sm:justify-between">

          {/* ========== الروابط السريعة ========== */}
          <div className="flex flex-col lg:gap-8 gap-2 w-full">
            <h3 className="font-normal text-gray-100">روابط سريعة</h3>
            <ul className="space-y-2 text-sm text-gray-400 md:mb-0 mb-6">
              <li onClick={() =>navigate("/", { state: { section: "hero" } })} className="cursor-pointer hover:text-white transition">الرئيسية</li> 
              <li onClick={() =>navigate("/", { state: { section: "about" } })} className="cursor-pointer hover:text-white transition">نبذه عنا</li> 
              <li onClick={() =>navigate("/", { state: { section: "service" } })} className="cursor-pointer hover:text-white transition">الخدمات</li>
            </ul>
          </div>

          {/* ========== الخدمات ========== */}
          <div className="flex flex-col lg:gap-8 gap-2 w-full">
            <h3 className="font-normal text-gray-100">الخدمات</h3>
            <ul className="space-y-2 text-sm text-gray-400 md:mb-0 mb-6">
              {categories.map((cat, index) => (
                <li key={index} className='cursor-pointer w-fit hover:text-white transition'>{cat.name}</li>
              ))}
            </ul>
          </div>

          {/* ==========  تواصل معنا ========== */}
          <div className="flex flex-col lg:gap-8 gap-2 w-full">
            <h3 className="font-normal text-gray-100">تواصل معنا</h3>
            <div>
              <p className="text-sm text-gray-400 cursor-pointer w-fit hover:text-white transition mb-1">+967 777123369</p>
              <p className="text-sm text-gray-400 cursor-pointer w-fit hover:text-white transition">servicelocator@gmail.com</p>
            </div>
          </div>
        </div>
      </div>
      {/* ====================== السوشيال ====================== */}
      <div className="border-t border-primary-700 py-5 text-center">
        <div className="flex justify-center items-center gap-4 mt-2">

          {socialIcons.map((item, index) => (
            <FontAwesomeIcon  
              key={index}
              icon={item.icon}
              size='lg'
              className="text-gray-400 hover:text-gray-200 transition cursor-pointer hover:-rotate-8 hover:scale-130"
            />
          ))}

        </div>
      </div>
    </footer>
  );
}
export default Footer
