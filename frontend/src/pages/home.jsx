import { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
// FontAwesome icons for navigation buttons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";
// ===================== استيراد صور السلايدر =====================
import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/autoplay";
import "swiper/css/navigation";
import hero_img from "../../public/media/map.png"

// ===================== استيراد صورة النبذة =====================
import mapImage from "../assets/map.png";

const Home = () => {
  const [ads, setAds] = useState([]);
  const [categories, setCategories] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(1)
  const cols = Math.min(categories.length, 5);
  const swiperRef = useRef(null);
  const aboutRef = useRef(null);
  const serviceRef = useRef(null);
  const heroRef = useRef(null);
  // Track current and active slide index
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const { state } = useLocation();
  // ===================== استيراد الاقسام =====================
  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/services/categories/")
      .then(res => setCategories(res.data))
      .catch(err => console.error("خطأ في تحميل الأقسام:", err));
  }, []);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/services/ads/approved/")
      .then(res => setAds(res.data))
      .catch(err => console.error("خطأ تحميل الإعلانات:", err));
  }, []);

  useEffect(() => {
    if (!state) return;

    if (state.section === "hero") {
      heroRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (state.section === "about") {
      aboutRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    if (state.section === "service") {
      serviceRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [state]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 3000); // كل 4 ثواني

    return () => clearInterval(interval);
  }, []);

  const slides = [
    {
      title: "مرحباً بك في اسم الموقع",
      description: "كل ما تحتاجه بين يديك في مكان واحد",
      button: "ابدأ الآن",
      link: "/services",
    },
    {
      title: "اكتشف أفضل الخدمات بسهولة",
      description: "تصفح أحدث العروض واستفد من خدماتنا",
      button: "تصفح العروض",
      link: "/offers",
    },
    {
      title: "حلول ذكية وسريعة",
      description: "نوفر لك الوقت والجهد في الوصول للخدمة",
      button: "اكتشف المزيد",
      link: "/about",
    },
  ];


  return (
    <div dir="rtl" className="font-['Montserrat-Arabic'] font-light text-[15px] mx-auto">

      {/* ======================= السلايدر ======================= */}
      <section ref={heroRef} id="hero" className="scroll-mt-40 mx-auto relative z-2 overflow-hidden pt-5 lg:px-10 md:px-5">
        <div className="w-full lg:h-[85vh] h-[30vh] overflow-hidden md:rounded-3xl">
          {ads.length > 0 ? (
            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              key={ads.length}
              slidesPerView={1}
              loop={ads.length > 1}
              autoplay={ads.length > 1 ? { delay: 3000 } : undefined}
              speed={1000} // duration of fade
              effect="fade"
              fadeEffect={{ crossFade: true }}
              modules={[Autoplay, EffectFade, Navigation]}
              onSlideChange={(swiper) => {
                const slideNum = (swiper.realIndex); // يحسب الرقم بشكل صحيح من 1
                setCurrentSlide(slideNum);
                setActiveSlideIndex(swiper.activeIndex);
              }}
              initialSlide={0}
              navigation={{
                nextEl: ".swiper-button-next-custom",
                prevEl: ".swiper-button-prev-custom",
              }}
              className="h-full"
            >
              {ads.map((ad) => (
                <SwiperSlide key={ad.id}>
                  <div className="relative h-full">
                    {/* صورة الإعلان */}
                    <img
                      src={ad.image}
                      className="w-full h-full object-cover"
                      alt="advertisement"
                    />

                    {/* خلفية غامقة */}
                    <div className="absolute inset-0 bg-linear-to-l from-black/70 to-transparent z-10" />

                    {/* النص */}
                    <div className="absolute top-1/4 md:right-20 right-5 z-20">
                      <p className="text-white lg:text-5xl md:text-4xl text-2xl font-bold mb-6">
                        {ad.service_title}
                      </p>

                      <p className="text-white lg:text-2xl md:text-lg text-base leading-[2.2rem] max-w-125">
                        {ad.description}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            /* ==================== في حال لا يوجد إعلانات ==================== */
            <div className="relative h-full">
              {/* صورة ثابتة */}
              <img
                src= {hero_img}
                className="w-full h-full object-cover"
                alt="hero"
              />

              <div className="absolute inset-0 bg-linear-to-l from-black/70 to-transparent z-10" />

              <div className="absolute top-1/4 md:right-20 right-5 z-20 transition-all duration-700">
                <p className="text-white lg:text-5xl md:text-4xl text-2xl font-bold mb-6 animate-fade">
                  {slides.title}
                </p>

                <p className="text-white lg:text-2xl md:text-lg text-base leading-[2.2rem] max-w-125">
                  {slides.description}
                </p>
              </div>
            </div>
          )}
          {/* navigation button */}
          <div className="absolute sm:bottom-4 sm:right-5 bottom-5 small:right-[23%] right-[20%] translate-[-50%] flex gap-4 z-10 ">
            <button className="swiper-button-prev-custom  w-10 h-10 p-3.5 rounded-full inline-flex justify-start items-center gap-2.5 cursor-pointer border border-white/50">
              <FontAwesomeIcon icon={faChevronRight} size="lg" className="text-white" />
            </button>
            <button className="swiper-button-next-custom w-10 h-10 p-4 rounded-full inline-flex justify-center items-center cursor-pointer border border-white/50">
              <FontAwesomeIcon icon={faChevronLeft} size="lg" className="text-white" />
            </button>
          </div>
          {/* Slide number indicator row */}
          <div className="absolute bottom-12 left-20 gap-4 z-10 text-white tracking-widest sm:flex flex-row-reverse hidden">
            {ads.map((_, index) => (
              <div dir="ltr" key={index} className={`relative flex items-center cursor-pointer ${currentSlide === index ? 'w-20 number-progress' : 'w-12'}`} onClick={() => swiperRef.current?.slideTo(index)}>
                <span
                  className={`${currentSlide === index ? 'text-white' : 'text-white/50'
                    } text-right text-white text-base font-normal font-['Montserrat-Arabic'] leading-normal tracking-tight`}
                >
                  {String(index + 1).padStart(2, '0')} {/*to number start with 0*/}
                </span>
                {/* Progress bar for active slide */}
                {currentSlide === index && index !== ads.length - 1 && (
                  <span className="absolute left-1 ml-8 h-0.5 bg-white slide-progress w-12 origin-left"></span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* ======================= نبذة عنا ======================= */}
      <section ref={aboutRef} id="about" className="scroll-mt-40 grid lg:grid-cols-2 grid-cols-1 gap-20 px-13 md:py-15 py-8 md:mt-20 mt-15 lg:mx-8 md:mx-4">
        {/* النص */}
        <div className="">
          <h2 className="md:text-4xl text-2xl font-medium mb-6">نبذة عنا</h2>
          <p className="text-gray-700 leading-10 md:text-lg text-sm">
            نؤمن أن كل تجربة تستحق أن تُروى؛ من المطاعم والمقاهي، إلى المتاجر والخدمات.
            نحن نجمع لك آراء وتقييمات حقيقية من أشخاص جرّبوا قبلَك، لتختار الأفضل بثقة وسهولة.
            نحن أكثر من مجرد منصة مراجعات… نحن مجتمع يشاركك التجارب، ويكشف لك الكنوز
            المخفية في مدينتك.
            ابدأ رحلتك معنا، ودعنا نساعدك على اكتشاف الأفضل دائمًا.
          </p>
        </div>
        {/* الصورة */}
        <img src={mapImage} alt="map" className="w-137.5 max-w-[90%] h-auto object-contain drop-shadow-lg" />
      </section>

      {/* ======================= الخدمات ======================= */}
      <section ref={serviceRef} id="service" className="scroll-mt-40 px-13 py-8 mt-20 lg:mx-8 md:mx-4 flex flex-col items-center mx-auto">
        <h2 className="md:text-4xl text-2xl font-normal mb-20">الخدمات</h2>
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-${cols} md:gap-8 gap-12 mx-auto`}>
          {categories.map((cat) => (
            <Link key={cat.id} to={`/services?category=${cat.id}`}>
              <div className='relative rounded-xl p-4 shadow-md shadow-primary/10 border border-primary-50 flex flex-col items-center group cursor-pointer'>
                <div className='absolute -top-5 bg-white shadow-lg shadow-primary/30 rounded-t-xl rounded-b-full px-4 py-4 border border-primary-50'>
                  <img src={cat.icon} alt={cat.name} className='w-7 h-7 object-contain' />
                </div>
                <div className="pt-10 text-center flex flex-col">
                  <h3 className="font-medium text-lg text-gray-800">{cat.name}</h3>
                  <p className="text-gray-500 text-sm leading-6 py-3 w-45">{cat.description}</p>
                </div>
                <div className="icon-loop w-fit h-fit p-2 rounded-full flex items-center justify-center shadow-[0_0_6px_1px_rgba(14,159,110,0.2)] hover:shadow-[0_0_10px_1px_rgba(14,159,110,0.4)] transition my-2">
                  <ArrowRightIcon className="w-4 h-4 text-primary-600" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
