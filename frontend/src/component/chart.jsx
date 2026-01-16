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
import { EyeIcon, HeartIcon, Square3Stack3DIcon } from '@heroicons/react/24/outline';

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Filler,
  Tooltip
);

function ChartCard({ title, value, data = [], labels, month, year, onMonthChange, onYearChange, y, m }) {
  const chartData = {
    labels: labels || [
      "الأسبوع 4",
      "الأسبوع 3",
      "الأسبوع 2",
      "الأسبوع 1"
    ],
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
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => `عدد: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      x: {
        display: true, // 👈 مهم: نُظهر الأسابيع
        grid: { display: false },

      },
      y: {
        display: false,
      },
    },
  };

  const SITE_START_YEAR = 2025; // ← عدليها لسنة افتتاح موقعك
  const currentYear = new Date().getFullYear();

  const years = Array.from(
    { length: currentYear - SITE_START_YEAR + 1 },
    (_, i) => SITE_START_YEAR + i
  );

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      {/* Value */}
      <div className="text-2xl font-bold text-gray-800 mb-2">
        {value}
      </div>
      {/* Header */}
      <div className="flex items-center justify-start gap-5 text-sm mb-2">
        <h3 className="text-gray-600">{title}</h3>
        <span className="text-gray-500">{y}</span>
        {onYearChange && (
          <select
            value={year}
            onChange={(e) => onYearChange(Number(e.target.value))}
            className="text-primary mr-1 focus:outline-none"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        )}
        {/* Month selector */}
        <span className="text-gray-500">{m}</span>
        {onMonthChange && (
          <select
            value={month}
            onChange={(e) => onMonthChange(Number(e.target.value))}
            className="text-primary mr-1 focus:outline-none"
          >
            <span>aiv</span>
            <option value={1}>يناير</option>
            <option value={2}>فبراير</option>
            <option value={3}>مارس</option>
            <option value={4}>أبريل</option>
            <option value={5}>مايو</option>
            <option value={6}>يونيو</option>
            <option value={7}>يوليو</option>
            <option value={8}>أغسطس</option>
            <option value={9}>سبتمبر</option>
            <option value={10}>أكتوبر</option>
            <option value={11}>نوفمبر</option>
            <option value={12}>ديسمبر</option>
          </select>
        )}
      </div>
      {/* Chart */}
      <div className="h-40">
        <Line data={chartData} options={options} />
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
    Category: {
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
        <EyeIcon className="h-10 w-7 text-primary" />
      ),
    },
    products: {
      bar: "bg-yellow-300",
      iconBg: "bg-yellow-50",
      icon: (
        <Square3Stack3DIcon className="h-10 w-7 text-yellow-300"/>
      ),
    },
    likes: {
      bar: "bg-red-300",
      iconBg: "bg-red-50",
      icon: (
        <HeartIcon className="h-10 w-7 text-red-300"/>
      ),
    },
  };

  const c = config[type] || config.services;

  return (
    <div className="relative bg-white rounded-2xl border border-[#E5F6EF] px-5 py-5 flex justify-between shadow-sm">
      <span className={`absolute right-2 top-5 bottom-5 w-0.75 rounded-full ${c.bar}`} />

      <div className="text-right">
        <p className="text-gray-700 font-light text-base md:text-lg mb-2">{title}</p>
        <p className="text-3xl md:text-4xl text-gray-900">{value}</p>
      </div>

      <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center ${c.iconBg}`}>
        {c.icon}
      </div>
    </div>
  );
}

function ProductItem({ name, desc, price, image, onclick }) {
  return (
    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-3 px-5 py-4">

      {/* الصورة + النص */}
      <div className="flex items-center gap-3">
        <img src={image} onClick={onclick} alt="" className="w-8 h-8 rounded-full cursor-pointer" />

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
export { ChartCard, StatCard, ProductItem, SuggestionItem }
