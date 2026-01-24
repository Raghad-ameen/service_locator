import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip } from "chart.js";
import { useState, useEffect } from "react";
import axios from "axios";
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useNavigate } from "react-router-dom";
import { StatCard, ProductItem, SuggestionItem } from '../../component/chart';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip
);

const serviceDashboard = () => {
  const [previewImages, setPreviewImages] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    visits: 0,
    likes: 0,
    products: 0,
    latest_products: [],
    latest_suggestions: []
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const fetchDashboard = async () => {
      try {
        const res = await axios.get("https://service-locator-9aja.onrender.com/api/services/owner-dashboard/", {
          headers: { Authorization: `Token ${token}` }
        });
        setStats(res.data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div dir="rtl" className="min-h-screen flex">
      {/* ===== Main ===== */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">

        <h2 className="text-xl text-gray-800 mb-6">
          الإحصائيات
        </h2>

        {/* ===== Stat Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          <StatCard title="عدد الزيارات" value={stats.visits} type="views" />
          <StatCard title="عدد المنتجات" value={stats.products} type="products" />
          <StatCard title="عدد الإعجابات" value={stats.likes} type="likes" />
        </div>

        {/* ===== آخر المنتجات المضافة ===== */}
        <div className="mb-15">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg text-gray-800">
              آخر المنتجات المضافة
            </h3>
            <span onClick={() => navigate('/product')} className="text-green-600 text-sm font-medium cursor-pointer">
              عرض الكل
            </span>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.latest_products.map((p, i) => (
              <ProductItem
                key={i}
                name={p.name}
                desc={p.description}
                price={`${p.price} ريال`}
                image={p.images[0]?.photo}
                onclick={() => { setPreviewImages(p.images); setShowModal("preview"); }}
              />
            ))}
          </div>
        </div>

        {/* ===== آخر الاقتراحات المضافة ===== */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg text-gray-800">
              آخر الاقتراحات المضافة
            </h3>
            <span onClick={() => navigate('/complain')} className="text-green-600 text-sm font-medium cursor-pointer">
              عرض الكل
            </span>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.latest_suggestions.map((s, i) => (
              <SuggestionItem
                key={i}
                name={s.user_name}
                text={s.message}
                image={s.user_image}
              />
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
      </main>
    </div>
  );
};

export default serviceDashboard;

