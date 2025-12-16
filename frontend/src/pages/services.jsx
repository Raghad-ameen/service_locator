import 'leaflet/dist/leaflet.css'; 
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { StarIcon } from '@heroicons/react/24/solid';
import {MapPinIcon} from '@heroicons/react/24/outline';
const services = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const category = params.get("category");
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const filteredServices = category
  ? services.filter(s => String(s.category.id) === String(category))
  : services;

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
    <div dir="rtl" className="w-full px-20 pt-[20px] flex flex-col gap-3 font-['Montserrat-Arabic'] font-light text-[15px]">
      {/* ================== الفلاتر ================== */}
      <div className="flex gap-3 justify-start text-sm text-gray-600 pb-2">
        <button className="flex-shrink-0 border border-gray-200 rounded-xl px-4 py-2 bg-white hover:bg-gray-50"> الأقرب إلى موقعك</button>
        <button className="flex-shrink-0 border border-gray-200 rounded-xl px-4 py-2 bg-white hover:bg-gray-50">الأعلى تقييماً</button>
        {/* المديرية */}
        <div className="relative flex-shrink-0 border border-gray-200 rounded-xl p-2">
          <select className="focus:outline-none cursor-pointer">
            <option hidden>المديرية</option>
            <option>مديرية السبعين</option>
            <option>مديرية التحرير</option>
          </select>
        </div>
        {/* الشارع */}
        <div className="relative flex-shrink-0 border border-gray-200 rounded-xl p-2">
          <select className="focus:outline-none cursor-pointer">
            <option hidden>الشارع</option>
            <option>شارع حدة</option>
            <option>شارع صفر</option>
          </select>
        </div>
        {/* السعر */}
        <div className="relative flex-shrink-0 border border-gray-200 rounded-xl p-2">
          <select className="focus:outline-none cursor-pointer">
            <option hidden>السعر</option>
            <option>من الأقل إلى الأعلى</option>
            <option>من الأعلى إلى الأقل</option>
          </select>
        </div>
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
            <div key={s.id} onClick={() => navigate(`/ServicePage/${s.id}`)} className="w-full rounded-3xl shadow-sm py-4 px-6 flex gap-4 border border-gray-200 items-center cursor-pointer">
              <img src={s.logo_image} className="w-14 h-14 rounded-full object-cover border border-gray-200"/>
              <div className="flex flex-col text-right gap-2 w-full">
                <h3 className="text-base font-medium text-gray-800">{s.title}</h3>
                <p className="text-gray-500 text-xs mt-1">{s.description} </p>
                <div className='flex gap-4 mt-2'>
                  <div className="flex gap-1  bg-gray-100 py-1 px-2 rounded-full">
                  <MapPinIcon className='text-red-500 h-4 w-4'/>
                  <span className='text-xs' >شارع الستين الشمالي-جولة عمران </span>      
                  </div>
                  <div className="flex gap-1 bg-gray-100 py-1 px-2 rounded-full">
                    <StarIcon className='text-yellow-400 h-4 w-4'/>
                    <span className='text-xs'>4.5</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* -------- الخريطة -------- */}
        <div className="lg:w-[50%] w-full h-[500px] rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <MapContainer
            center={[15.3694, 44.191]}
            zoom={13}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[15.3694, 44.191]}>
              <Popup>صنعاء - اليمن</Popup>
            </Marker>
          </MapContainer>
        </div>

      </div>
    </div>
  );
}
export default services
