import React, { useEffect, useState } from "react";
import axios from "axios";
import { ChartCard, StatCard } from "../../component/chart";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    counts: {
      services: 0,
      users: 0,
      Category: 0,
    },
  });

  const [serviceMonth, setServiceMonth] = useState(new Date().getMonth() + 1);
  const [userMonth, setUserMonth] = useState(new Date().getMonth() + 1);

  const [servicesChart, setServicesChart] = useState({ labels: [], data: [] });
  const [usersChart, setUsersChart] = useState({ labels: [], data: [] });

  const year = new Date().getFullYear();

  useEffect(() => {
    if (!token) return;
    axios
      .get("http://127.0.0.1:8000/api/services/dashboard/stats/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error("Dashboard stats error:", err);
      })
  }, []);

  useEffect(() => {
    if (!token) return;
    axios.get(
      `http://127.0.0.1:8000/api/services/services-monthly/?year=${year}&month=${serviceMonth}`,
      { headers: { Authorization: `Token ${token}` } }
    ).then(res => setServicesChart(res.data))
    .catch(err => console.error("Services chart error:", err));
  }, [serviceMonth, year]);

  useEffect(() => {
    if (!token) return;
    axios.get(
      `http://127.0.0.1:8000/api/services/users-monthly/?year=${year}&month=${userMonth}`,
      { headers: {Authorization: `Token ${token}` } }
    ).then(res => setUsersChart(res.data));
  }, [userMonth, year]);

  return (
    <div dir="rtl" className="min-h-screen bg-[#F8FBFB] flex">
      <main className="flex-1 px-4 py-6 md:px-6 lg:px-10">

        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          الإحصائيات
        </h2>

        {/* ===== Stat Cards ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="عدد الأقسام"
            value={stats.counts.Category}
            type="Category"
          />
          <StatCard
            title="عدد المستخدمين"
            value={stats.counts.users}
            type="users"
          />
          <StatCard
            title="عدد الخدمات"
            value={stats.counts.services}
            type="services"
          />
        </div>

        {/* ===== Charts ===== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">

  <ChartCard
    title="الخدمات المقبولة خلال شهر"
    value={(servicesChart.data|| []).reduce((a, b) => a + b, 0)}
    data={servicesChart.data}
    labels={servicesChart.labels}
    month={serviceMonth}
    onMonthChange={setServiceMonth}
  />

  <ChartCard
    title="المستخدمين الجدد خلال شهر"
    value={(usersChart.data|| []).reduce((a, b) => a + b, 0)}
    data={usersChart.data}
    labels={usersChart.labels}
    month={userMonth}
    onMonthChange={setUserMonth}
  />

</div>
      </main>
    </div>
  );
};

export default AdminDashboard;
