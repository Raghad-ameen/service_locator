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

function ChartCard({ title, value, percent, data }) {
  const chartData = {
    labels: ["س", "ح", "ن", "ث", "ر", "خ", "ج"],
    datasets: [
      {
        data,
        fill: true,
        borderColor: "#34D399",
        backgroundColor: "rgba(52,211,153,0.2)",
        tension: 0.45,
        pointRadius: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } },
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-5 md:p-6 shadow-sm">

      <div className="flex justify-between items-start mb-3">
        <div className="text-right">
          <p className="text-xl md:text-2xl font-bold text-gray-900">
            {value}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {title}
          </p>
        </div>

        <span className="text-green-600 text-sm font-semibold">
          {percent} ↑
        </span>
      </div>

      <div className="h-[120px] md:h-[140px]">
        <Line data={chartData} options={options} />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-500 mt-4">
        <span>آخر 7 أيام</span>
        <span className="text-green-600 cursor-pointer font-medium">
          عرض المزيد
        </span>
      </div>

    </div>
  );
}

/* ================= Components ================= */

function StatCard({ title, value, type }) {
  const config = {
    services: {
      bar: "bg-red-300",
      iconBg: "bg-red-50",
      icon: (
        <svg width="26" height="26" fill="none" stroke="#F87171" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="3" />
          <path d="M8 8h8M8 12h8M8 16h5" />
        </svg>
      ),
    },
    users: {
      bar: "bg-yellow-300",
      iconBg: "bg-yellow-50",
      icon: (
        <svg width="26" height="26" fill="none" stroke="#FACC15" strokeWidth="2">
          <circle cx="12" cy="9" r="4" />
          <path d="M4 20c1.5-3 14.5-3 16 0" />
        </svg>
      ),
    },
    departments: {
      bar: "bg-green-300",
      iconBg: "bg-green-50",
      icon: (
        <svg width="26" height="26" fill="none" stroke="#34D399" strokeWidth="2">
          <path d="M12 2l9 5-9 5-9-5 9-5z" />
          <path d="M3 12l9 5 9-5" />
          <path d="M3 17l9 5 9-5" />
        </svg>
      ),
    },
    views: {
      bar: "bg-green-300",
      iconBg: "bg-green-50",
      icon: (
        <svg width="26" height="26" fill="none" stroke="#34D399" strokeWidth="2">
          <path d="M12 2l9 5-9 5-9-5 9-5z" />
          <path d="M3 12l9 5 9-5" />
          <path d="M3 17l9 5 9-5" />
        </svg>
      ),
    },
    products:{
      bar: "bg-green-300",
      iconBg: "bg-green-50",
      icon: (
        <svg width="26" height="26" fill="none" stroke="#34D399" strokeWidth="2">
          <path d="M12 2l9 5-9 5-9-5 9-5z" />
          <path d="M3 12l9 5 9-5" />
          <path d="M3 17l9 5 9-5" />
        </svg>
      ),
    },
    likes:{
      bar: "bg-green-300",
      iconBg: "bg-green-50",
      icon: (
        <svg width="26" height="26" fill="none" stroke="#34D399" strokeWidth="2">
          <path d="M12 2l9 5-9 5-9-5 9-5z" />
          <path d="M3 12l9 5 9-5" />
          <path d="M3 17l9 5 9-5" />
        </svg>
      ),
    },
  };

  const c = config[type];

  return (
    <div className="relative bg-white rounded-2xl border border-[#E5F6EF] px-5 py-5 flex items-center justify-between shadow-sm">
      <span className={`absolute right-2 top-5 bottom-5 w-[3px] rounded-full ${c.bar}`} />

      <div className="text-right">
        <p className="text-[#374151] text-base md:text-lg mb-2">{title}</p>
        <p className="text-3xl md:text-4xl font-semibold text-[#111827]">{value}</p>
      </div>

      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${c.iconBg}`}>
        {c.icon}
      </div>
    </div>
  );
}



function ProductItem({ name, desc, price, image }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-5 py-4">

      {/* الصورة + النص */}
      <div className="flex items-center gap-3">
        <img src={image} alt="" className="w-8 h-8 rounded-full" />

        <div className="text-right">
          <p className="text-sm font-medium text-gray-800">
            {name}
          </p>

          <p className="text-xs text-gray-500">
            {desc}
          </p>

          {/* السعر يظهر تحت الوصف فقط في الموبايل */}
          <p className="text-sm text-gray-700 mt-1 md:hidden">
            {price}
          </p>
        </div>
      </div>

      {/* السعر يظهر على الطرف في التابلت والديسكتوب */}
      <span className="hidden md:block text-sm text-gray-600">
        {price}
      </span>

    </div>
  );
}

function SuggestionItem({ name, text, image }) {
  return (
    <div className="flex gap-3 px-5 py-4">
      <img src={image} alt="" className="w-8 h-8 rounded-full" />
      <div>
        <p className="text-sm font-medium text-gray-800">{name}</p>
        <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
export {ChartCard, StatCard, ProductItem, SuggestionItem}
