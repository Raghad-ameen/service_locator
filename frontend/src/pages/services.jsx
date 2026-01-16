import 'leaflet/dist/leaflet.css';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';
const services = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    rating: null,
    district: "",
    street: "",
  });
  const [sortByRating, setSortByRating] = useState(false);

  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (err) => console.error("خطأ في الحصول على الموقع:", err)
      );
    }
  }, []);

  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // نصف قطر الأرض بالكيلومتر
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // المسافة بالكيلومتر
  }

  const [sortByDistance, setSortByDistance] = useState(false);



  // const filteredServices = services
  //   .filter(s => {
  //     if (category && String(s.category?.id) !== String(category)) {
  //       return false;
  //     }

  //     if (filters.district && s.district !== filters.district) {
  //       return false;
  //     }

  //     if (filters.street && s.street !== filters.street) {
  //       return false;
  //     }

  //     return true;
  //   })
  //   .sort((a, b) => {
  //     if (filters.price === "low") {
  //       return a.price - b.price;
  //     }
  //     if (filters.price === "high") {
  //       return b.price - a.price;
  //     }
  //     return 0;
  //   });


  const filteredServices = useMemo(() => {
    let result = services
      .filter(s => {
        if (!s.latitude || !s.longitude) return false;
        if (category && String(s.category?.id) !== String(category)) return false;
        if (filters.district && s.district !== filters.district) return false;
        if (filters.street && s.street !== filters.street) return false;
        return true;
      });

    // ترتيب حسب التقييم أولاً
    if (sortByRating) {
      result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    // ترتيب حسب المسافة
    if (sortByDistance && userLocation) {
      result.sort((a, b) => {
        const distA = getDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude);
        const distB = getDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude);
        return distA - distB;
      });
    }

    return result;
  }, [services, filters, sortByRating, sortByDistance, category, userLocation]);



  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/services/service/`)
      .then(res => {
        setServices(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("خطأ في تحميل الخدمة:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div dir="rtl" className="w-full px-20 pt-5 flex flex-col gap-3 font-['Montserrat-Arabic'] font-light text-[15px]">
      {/* ================= الفلاترة ================== */}
      <div className="flex gap-3 justify-start text-sm text-gray-600 pb-2">
        <button
          onClick={() => setSortByDistance(prev => !prev)}
          className={`shrink-0 border rounded-xl px-4 py-2 ${sortByDistance ? "bg-blue-50 border-blue-300" : "bg-white"}`}
        >
          الأقرب إلى موقعك
        </button>
        <button onClick={() => setSortByRating(prev => !prev)} className={`shrink-0 border border-gray-200 rounded-xl px-4 py-2 ${sortByRating ? "bg-yellow-50 border-yellow-300" : "bg-white"}`}>
          الأعلى تقييماً
        </button>
        {/* المديرية */}
        <select
          value={filters.district}
          onChange={(e) =>
            setFilters({ ...filters, district: e.target.value })
          }
          className="focus:outline-none cursor-pointer"
        >
          <option value="">المديرية</option>
          <option value="السبعين">مديرية السبعين</option>
          <option value="التحرير">مديرية التحرير</option>
        </select>

        {/* الشارع */}
        <select
          value={filters.street}
          onChange={(e) =>
            setFilters({ ...filters, street: e.target.value })
          }
          className="focus:outline-none cursor-pointer"
        >
          <option value="">الشارع</option>
          <option value="حدة">شارع حدة</option>
          <option value="صفر">شارع صفر</option>
        </select>
      </div>

      {/* ================== الخريطة + الكروت ================== */}
      <div className="flex lg:flex-row flex-col gap-6 mt-2">

        {/* -------- الكروت -------- */}
        <div className="lg:w-[50%] w-full flex flex-col gap-4">
          {filteredServices.length === 0 && !loading && (
            <div className="text-center text-gray-500 py-10 text-lg">
              لا يوجد خدمات بهذا القسم
            </div>
          )}

          {filteredServices.map((s) => (
            <div key={s.id} onClick={async () => {
              try {
                await axios.post(`http://127.0.0.1:8000/api/services/service/${s.id}/add_visit/`);
              } catch (err) {
                console.error("خطأ في زيادة الزيارة:", err);
              }
              navigate(`/ServicePage/${s.id}`);
            }}
              className="w-full rounded-3xl shadow-sm py-4 px-6 flex gap-4 border border-gray-200 items-center cursor-pointer">
              <img src={s.logo_image} className="w-14 h-14 rounded-full object-cover border border-gray-200" />
              <div className="flex flex-col text-right gap-2 w-full">
                <h3 className="text-base font-medium text-gray-800">{s.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{s.description} </p>
                <div className='flex gap-4 mt-2'>
                  <div className="flex gap-1  bg-gray-100 py-1 px-2 rounded-full">
                    <MapPinIcon className='text-red-500 h-4 w-4' />
                    <span className='text-xs' >شارع الستين الشمالي-جولة عمران </span>
                  </div>
                  <div className="flex gap-1 bg-gray-100 py-1 px-2 rounded-full">
                    <StarIcon className='text-yellow-400 h-4 w-4' />
                    <span className="text-xs">
                      {s.average_rating ? s.average_rating.toFixed(1) : "بدون تقييم"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* -------- الخريطة -------- */}
        <div className="lg:w-[50%] w-full h-125 rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <MapContainer
            center={
              filteredServices.length
                ? [filteredServices[0].latitude, filteredServices[0].longitude]
                : [15.3694, 44.191]
            }

            zoom={13}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {filteredServices.map(service => (
              <Marker
                key={service.id}
                position={[service.latitude, service.longitude]}
              >
                <Popup>
                  <strong>{service.title}</strong><br />
                  ⭐ {service.average_rating?.toFixed(1) || "بدون تقييم"}
                </Popup>

              </Marker>
            ))}

          </MapContainer>
        </div>

      </div>
    </div>
  );
}
export default services
