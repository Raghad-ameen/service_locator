import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const AddLocation = () => {
  const { token } = useAuth();
  const [directorateName, setDirectorateName] = useState("");
  const [streetName, setStreetName] = useState("");
  const [directorateId, setDirectorateId] = useState("");
  const [directorates, setDirectorates] = useState([]);
  const [streets, setStreets] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // ➕ إضافة مديرية
      if (directorateName) {
        const res = await axios.post(
          "http://127.0.0.1:8000/api/services/directorates/",
          { name: directorateName },
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        setDirectorates((prev) => [...prev, res.data]);
        setDirectorateName("");
        alert("تم إضافة المديرية");
      }

      // ➕ إضافة شارع
      if (streetName && directorateId) {
        console.log("إرسال بيانات الشارع:", { streetName, directorateId }); 
        const res = await axios.post(
          "http://127.0.0.1:8000/api/services/streets/",
          {
            name: streetName,
            directorate_id: directorateId,
          },
          {
            headers: {
              Authorization: `Token ${token}`,
            },
          }
        );
        
        setStreets((prev) => [...prev, res.data]);
        console.log({ streetName, directorateId });
        setStreetName("");
        setDirectorateId("");
        alert("تم إضافة الشارع");
      }
    } catch (error) {
      console.error(error.response?.data);
      alert("حصل خطأ");
    }
  };

  useEffect(() => {
    // جلب المديريات
    axios
      .get("http://127.0.0.1:8000/api/services/directorates/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setDirectorates(res.data))
      .catch((err) => console.error(err));

    // جلب الشوارع
    axios
      .get("http://127.0.0.1:8000/api/services/streets/", {
        headers: { Authorization: `Token ${token}` },
      })
      .then((res) => setStreets(res.data))
      .catch((err) => console.error(err));
  }, [token]);

  return (
    <div className="flex flex-col p-6">
      <h1 className="m-4 text-lg">إدارة النطاق</h1>

      <form className="flex gap-10" onSubmit={handleSubmit}>
        <div>
          <h3>إضافة مديرية</h3>
          <input
            value={directorateName}
            onChange={(e) => setDirectorateName(e.target.value)}
            placeholder="اسم المديرية"
          />
        </div>

        <div>
          <h3>إضافة شارع</h3>
          <select
            value={directorateId}
            onChange={(e) => setDirectorateId(e.target.value ? parseInt(e.target.value) : "")}
          >
            <option value="">اختر المديرية</option>
            {Array.isArray(directorates) &&
              directorates.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
          </select>

          <input
            value={streetName}
            onChange={(e) => setStreetName(e.target.value)}
            placeholder="اسم الشارع"
          />
        </div>

        <button type="submit">ارسال التحديثات</button>
      </form>

      {/* ✅ عرض المديريات */}
      <h2 className="mt-6">المديريات</h2>
      <ul>
        {Array.isArray(directorates) &&
          directorates.map((d) => (
            <li key={d.id}>
              {d.name}
            </li>
          ))}
      </ul>

      {/* ✅ عرض الشوارع مع الإحداثيات */}
      <h2 className="mt-6">الشوارع</h2>
      <table className="border-collapse border border-gray-400">
        <thead>
          <tr>
            <th className="border border-gray-400 px-2">الاسم</th>
            <th className="border border-gray-400 px-2">المديرية</th>
            <th className="border border-gray-400 px-2">Latitude</th>
            <th className="border border-gray-400 px-2">Longitude</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(streets) &&
            streets.map((s) => (
              <tr key={s.id}>
                <td className="border border-gray-400 px-2">{s.name}</td>
                <td className="border border-gray-400 px-2">
                  {s.directorate?.name}
                </td>
                <td className="border border-gray-400 px-2">{s.latitude}</td>
                <td className="border border-gray-400 px-2">{s.longitude}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default AddLocation;