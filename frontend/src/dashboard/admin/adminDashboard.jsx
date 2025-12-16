import React from 'react'
import { ChartCard, StatCard  } from '../../component/chart';

const adminDashboard=() => {
  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FBFB] flex">
      {/* ===== Main ===== */}
      <main className="flex-1 px-4 py-6 md:px-6 lg:px-10">

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          الإحصائيات
        </h2>

        {/* ===== Stat Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <StatCard title="عدد الأقسام" value="10" type="departments" />
          <StatCard title="عدد المستخدمين" value="5530" type="users" />
          <StatCard title="عدد الخدمات" value="100" type="services" />
        </div>

        {/* ===== Charts ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <ChartCard
            title="خدمة جديدة هذا الأسبوع"
            value="50"
            percent="12%"
            data={[30, 22, 28, 24, 35, 26, 18]}
          />
          <ChartCard
            title="مستخدم جديد هذا الأسبوع"
            value="130"
            percent="32%"
            data={[60, 55, 70, 65, 90, 72, 50]}
          />
        </div>

        {/* ===== العنوان + عرض الكل (ريسبونس) ===== */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-6 gap-2">
          <h3 className="text-right text-lg font-semibold text-gray-500">
            آخر الخدمات <span className="text-gray-400">(في انتظار الموافقة)</span>
          </h3>

          <span className="text-green-600 text-sm font-medium cursor-pointer self-start sm:self-auto">
            عرض الكل
          </span>
        </div>

      </main>
    </div>
  );
}
export default adminDashboard