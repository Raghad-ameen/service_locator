import {Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Filler, Tooltip} from "chart.js";
import { useState, useEffect } from "react";
import axios from "axios";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip
);
import {StatCard, ProductItem, SuggestionItem} from '../../component/chart'; 

const serviceDashboard=()=> {

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
        const res = await axios.get("http://127.0.0.1:8000/api/services/owner-dashboard/", {
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
    <div dir="rtl" className="min-h-screen bg-[#F8FBFB] flex">
      {/* ===== Main ===== */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          الإحصائيات
        </h2>

        {/* ===== Stat Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          <StatCard title="عدد الزيارات" value={stats.visits} type="views" />
          <StatCard title="عدد المنتجات" value={stats.products} type="products" />
          <StatCard title="عدد الإعجابات" value={stats.likes} type="likes" />
        </div>

        {/* ===== آخر المنتجات المضافة ===== */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              آخر المنتجات المضافة
            </h3>
            <span className="text-green-600 text-sm font-medium cursor-pointer">
              عرض الكل
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {stats.latest_products.map((p, i) => (
              <ProductItem
                key={i}
                name={p.name}
                desc={p.description}
                price={`${p.price} ريال`}
                img={p.img || "https://i.pravatar.cc/40?img=1"}
              />
            ))}
          </div>
        </div>

        {/* ===== آخر الاقتراحات المضافة ===== */}
        <div>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800">
              آخر الاقتراحات المضافة
            </h3>
            <span className="text-green-600 text-sm font-medium cursor-pointer">
              عرض الكل
            </span>
          </div>

          <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
            {stats.latest_suggestions.map((s, i) => (
              <SuggestionItem
                key={i}
                name={s.name}
                text={s.text}
                img={s.img || "https://i.pravatar.cc/40?img=2"}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default serviceDashboard;

