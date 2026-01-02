import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip
);
import {ChartCard, StatCard, ProductItem, SuggestionItem} from '../../component/chart'; 

const serviceDashboard=()=> {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FBFB] flex">
      {/* ===== Main ===== */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10">

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          الإحصائيات
        </h2>

        {/* ===== Stat Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-10">
          <StatCard title="عدد الزيارات" value="300" type="views" />
          <StatCard title="عدد المنتجات" value="50" type="products" />
          <StatCard title="عدد الإعجابات" value="100" type="likes" />
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
            <ProductItem
              name="لاتيه كرامل"
              desc="اسبريسو + حليب + موس كراميل"
              price="1500 ريال"
              img="https://i.pravatar.cc/40?img=1"
            />
            <ProductItem
              name="موكا"
              desc="اسبريسو + شوكولاتة + حليب"
              price="1000 ريال"
              img="https://i.pravatar.cc/40?img=2"
            />
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
            <SuggestionItem
              name="صالح النوار"
              text="اقترح إضافة مشروبات جديدة وتفعيل نظام نقاط للعملاء الدائمين."
              img="https://i.pravatar.cc/40?img=3"
            />
            <SuggestionItem
              name="علي الشيخ"
              text="نحتاج تحسين سرعة الطلب وإضافة خيار الدفع الإلكتروني."
              img="https://i.pravatar.cc/40?img=4"
            />
          </div>
        </div>

      </main>
    </div>
  );
}
export default serviceDashboard

