import 'leaflet/dist/leaflet.css';
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { StarIcon } from '@heroicons/react/24/solid';
import { MapPinIcon } from '@heroicons/react/24/outline';
import L from 'leaflet';
import { useMap } from "react-leaflet";

const FlyToLocation = ({ position, zoom = 16 }) => {
  const map = useMap();

  useEffect(() => {
    if (position) {
      map.flyTo(position, zoom, { duration: 1.2 });
    }
  }, [position]);

  return null;
};


const defaultIcon = L.icon({
  iconUrl: '/media/marker-icon-2x-blue.png',
  shadowUrl: '/media/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const highlightedIcon = L.icon({
  iconUrl: '/media/marker-icon-2x-red.png',
  shadowUrl: '/media/marker-shadow.png',
  iconSize: [40, 60],
  iconAnchor: [20, 60],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const getStreetFromCoords = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`
    );
    const data = await res.json();
    return data.address?.road || "شارع غير معروف";
  } catch (error) {
    console.error("خطأ في جلب الشارع:", error);
    return "شارع غير معروف";
  }
};


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
  const [addresses, setAddresses] = useState({});
  const [hoveredServiceId, setHoveredServiceId] = useState(null);
  const [selectedStreet, setSelectedStreet] = useState(null);
  const [streets, setStreets] = useState([]);
  const [directorates, setDirectorates] = useState([]);
  const [focusedPosition, setFocusedPosition] = useState(null);
  const searchQuery = params.get("q") || "";
  const [sortByDistance, setSortByDistance] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [previousState, setPreviousState] = useState(null);


  //OSM
  const getAddressFromCoords = async (lat, lon) => {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ar`);
      const data = await response.json();
      return data.display_name?.split(",").slice(0, 3).join("،");;
    }
    catch (error) {
      console.error("خطأ في جلب العنوان:", error);
      return "عنوان غير معروف";
    }
  };

  //GPS
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

  // الاقرب
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

  // الفلترة
  const filteredServices = useMemo(() => {
    // أول شيء: نتأكد أن كل الخدمات فيها إحداثيات
    let result = services.filter(s => s.latitude && s.longitude);

    // الفلترة حسب القسم
    if (category) {
      result = result.filter(s => String(s.category?.id) === String(category));
    }

    // الفلترة حسب المديرية
    if (filters.district) {
      result = result.filter(s => s.directorate?.name === filters.district);
    }

    // الفلترة حسب الشارع
    if (filters.street) {
      result = result.filter(s => String(s.street_id) === String(filters.street));
    }

    // الفلترة حسب كلمة البحث
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(s =>
        (s.title && s.title.toLowerCase().includes(q)) ||
        (s.description && s.description.toLowerCase().includes(q)) ||
        (s.directorate?.name && s.directorate.name.toLowerCase().includes(q)) ||
        (s.street_name && s.street_name.toLowerCase().includes(q)) ||
        (s.category?.name && s.category.name.toLowerCase().includes(q))
      );
    }

    // الفرز حسب التقييم
    if (sortByRating) {
      result.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
    }

    // الفرز حسب المسافة
    if (sortByDistance && userLocation) {
      result.sort((a, b) => {
        const distA = getDistance(userLocation.lat, userLocation.lng, +a.latitude, +a.longitude);
        const distB = getDistance(userLocation.lat, userLocation.lng, +b.latitude, +b.longitude);
        return distA - distB;
      });
    }

    return result;
  }, [services, filters, sortByRating, sortByDistance, category, userLocation, searchQuery]);


  //الخدمات
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await axios.get(`https://service-locator-9aja.onrender.com/api/services/service/`);
        setLoading(false);

        // جلب العناوين من Nominatim
        const results = await Promise.all(
          res.data.map(async (s) => {
            if (s.latitude && s.longitude) {
              const addr = await getAddressFromCoords(s.latitude, s.longitude);
              const parts = addr.split(",");
              const shortAddress = parts.slice(0, 3).join("،").trim(); // أول 3 عناصر فقط
              const streetName = parts.length > 1 ? parts[1].trim() : "";

              return { id: s.id, address: shortAddress, street: streetName };
            }
            return { id: s.id, address: "عنوان غير معروف", street: "" };
          })
        );

        const addrMap = {};
        results.forEach(r => { addrMap[r.id] = r.address; });
        setAddresses(addrMap);

        const enriched = res.data.map(s => ({
          ...s,
          street_id: s.street?.id, // ID من الـ API مباشرة
          street_name: s.street?.name // الاسم للعرض فقط
        }));

        setServices(enriched);

        setLoading(false);


      } catch (err) {
        console.error("خطأ في تحميل الخدمة:", err);
        setLoading(false);
      }
    };

    fetchServices(); // استدعاء الدالة
  }, []);

  useEffect(() => {
    const fetchDirectorates = async () => {
      try {
        const res = await axios.get("https://service-locator-9aja.onrender.com/api/services/directorates/");
        setDirectorates(res.data);
      } catch (err) {
        console.error("خطأ في تحميل المديريات:", err);
      }
    };
    fetchDirectorates();
  }, []);

  //الشوارع
  useEffect(() => {
    const fetchStreets = async () => {
      try {
        const res = await axios.get("https://service-locator-9aja.onrender.com/api/services/streets/");
        setStreets(res.data);
      } catch (err) {
        console.error("خطأ في تحميل الشوارع:", err);
      }
    };
    fetchStreets();
  }, []);


  return (
    <div dir="rtl" className="w-full px-20 pt-5 flex flex-col gap-3 font-['Montserrat-Arabic'] font-light text-[15px]">
      {/* ================= الفلاترة ================== */}
      <div className="flex gap-3 justify-start text-sm text-gray-600 pb-2">
        <button
          onClick={() => {
            if (!showAll) {
              // أول ضغطة: نخزن الحالة الحالية (القسم + الفلاتر + البحث)
              setPreviousState({
                category,
                filters,
                sortByRating,
                sortByDistance,
                selectedStreet,
                searchQuery
              });

              // نفرغ الفلاتر ونرجع كل الخدمات
              setFilters({ rating: null, district: "", street: "" });
              setSortByRating(false);
              setSortByDistance(false);
              setSelectedStreet(null);
              navigate("/services");
              setShowAll(true);
            } else {
              // الضغطة الثانية: نرجع للحالة السابقة
              if (previousState) {
                setFilters(previousState.filters);
                setSortByRating(previousState.sortByRating);
                setSortByDistance(previousState.sortByDistance);
                setSelectedStreet(previousState.selectedStreet);

                if (previousState.category) {
                  navigate(`/services?category=${previousState.category}`);
                } else if (previousState.searchQuery) {
                  navigate(`/services?q=${encodeURIComponent(previousState.searchQuery)}`);
                } else {
                  navigate("/services");
                }
              }
              setShowAll(false);
            }
          }}
          className={`shrink-0 border rounded-xl px-4 py-2 ${showAll ? "bg-green-50 border-green-300" : "bg-white"}`}
        >
          عرض كل الخدمات
        </button>
        <button
          onClick={() => {
            if (!sortByDistance) {
              // إذا لم يكن مفعل، نحاول الحصول على الموقع
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    const location = {
                      lat: position.coords.latitude,
                      lng: position.coords.longitude,
                    };
                    setUserLocation(location);
                    setSortByDistance(true); // تفعيل الفرز حسب المسافة
                  },
                  (err) => {
                    console.error("خطأ في تحديد الموقع:", err);
                    alert("يرجى السماح للمتصفح بالوصول إلى موقعك.");
                  }
                );
              } else {
                alert("المتصفح لا يدعم تحديد الموقع.");
              }
            } else {
              // إذا مفعل مسبقاً، نلغي الفرز حسب المسافة
              setSortByDistance(false);
            }
          }}
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
          onChange={(e) => setFilters({ ...filters, district: e.target.value })}
        >
          <option value="">المديرية</option>
          {directorates.map(d => (
            <option key={d.id} value={d.name}>{d.name}</option>
          ))}
        </select>

        <select
          value={filters.street}
          onChange={(e) => setFilters({ ...filters, street: e.target.value })}
        >
          <option value="">الشارع</option>
          {streets.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
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
          {/* زر إلغاء التصفية 
  {selectedStreet && ( 
    <button onClick={() => setSelectedStreet(null)} 
    className="text-sm text-blue-600 underline mb-2 self-end" > عرض جميع الخدمات </button> )} */}

          {filteredServices
            .filter(s => !selectedStreet || s.street_name_from_coords === selectedStreet)
            .map((s) => (
              <div
                key={s.id}
                onClick={async () => {
                  try {
                    await axios.post(`https://service-locator-9aja.onrender.com/api/services/service/${s.id}/add_visit/`);
                  } catch (err) {
                    console.error("خطأ في زيادة الزيارة:", err);
                  }
                  navigate(`/ServicePage/${s.id}`);
                }}
                onMouseEnter={() => {
                  setHoveredServiceId(s.id);
                  setFocusedPosition([+s.latitude, +s.longitude]);
                }}

                onMouseLeave={() => setHoveredServiceId(null)}
                className="w-full rounded-3xl shadow-sm py-4 px-6 flex gap-4 border border-gray-200 items-center cursor-pointer"
              >
                <img src={s.logo_image} className="w-14 h-14 rounded-full object-cover border border-gray-200" />
                <div className="flex flex-col text-right gap-2 w-full">
                  <h3 className="text-base font-medium text-gray-800">{s.title}</h3>
                  <p className="text-gray-500 text-xs mt-1">{s.description}</p>
                  <div className='flex gap-4 mt-2'>
                    <div className="flex gap-1 bg-gray-100 py-1 px-2 rounded-full">
                      <MapPinIcon className='text-red-500 h-4 w-4' />
                      <span className='text-xs'>
                        {addresses[s.id] || `${s.latitude}, ${s.longitude}`}
                      </span>
                    </div>
                    <div className="flex gap-1 bg-gray-100 py-1 px-2 rounded-full">
                      <StarIcon className='text-yellow-400 h-4 w-4' />

                      <span className="text-xs">
                        {s.average_rating ? s.average_rating.toFixed(1) : 0}
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
            whenCreated={(map) => {
              map.on("click", async (e) => {
                const street = await getStreetFromCoords(e.latlng.lat, e.latlng.lng);
                if (street) {
                  setSelectedStreet(street);
                }
              });
            }}

          >
            <FlyToLocation position={focusedPosition} />
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors" />
            {filteredServices.map(service => (
              <Marker
                key={service.id}
                position={[service.latitude, service.longitude]}
                icon={service.id === hoveredServiceId ? highlightedIcon : defaultIcon}
              >
                <Popup>
                  <strong>{service.title}</strong><br />
                  {addresses[service.id] || "عنوان غير معروف"}
                  <br />
                  ⭐ {service.average_rating?.toFixed(1) || 0}
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
