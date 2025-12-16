import { useEffect, useState } from "react";
import axios from "axios";

const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/users/suggestions/",
          {
            headers: {
              Authorization: `Token ${localStorage.getItem("token")}`,
            },
          }
        );
        setComplaints(res.data);
      } catch (err) {
        console.error("خطأ في تحميل الاقتراحات:", err);
      }
    };

    fetchComplaints();
  }, []);

  return (
    <div dir="rtl" className="flex flex-col w-full bg-primary-50/30 h-full font-['Montserrat-Arabic'] py-8 px-10">
      <h1 className="text-xl font-normal mb-6">
        الاقتراحات و الشكاوي
      </h1>
      <div className="bg-white rounded-2xl shadow p-5 w-full">
      {complaints.length > 0 ? (
        complaints.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 not-last-of-type:border-b-2 border-gray-200"
          >
            <img
              src="https://i.pravatar.cc/40"
              className="w-10 h-10 rounded-full"
            />

            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm">{item.user_name}</p>

              <p className="text-xs text-gray-500 line-clamp-2">
                {item.message}
              </p>

              {item.response && (
                <p className="text-xs text-primary mt-1">
                  ردك: {item.response}
                </p>
              )}
            </div>
          </div>
        ))
      ) : (
        <p className="text-center text-gray-500 py-6">
          لا توجد اقتراحات حاليًا
        </p>
      )}
      </div>

    </div>
  );
}
export default ComplaintsPage;
