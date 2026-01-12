import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";


const ComplaintsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const { token } = useAuth();
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(
          "http://127.0.0.1:8000/api/users/suggestions/",
          {
            headers: {
             Authorization: `Token ${token}`
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

  const handleReply = async () => {
    if (!reply.trim()) return;

    await axios.post(
      `http://127.0.0.1:8000/api/users/suggestions/${selected.id}/reply/`,
      { response: reply },
      {
        headers: {
          Authorization: `Token ${localStorage.getItem("token")}`,
        },
      }
    );

    // تحديث القائمة بدون إعادة تحميل
    setComplaints((prev) =>
      prev.map((c) =>
        c.id === selected.id ? { ...c, response: reply } : c
      )
    );

    setReply("");
    setSelected(null);
  };

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
          <p className="text-xs mb-5 text-primary">
                {new Date(item.created_at).toLocaleDateString("ar", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            <img
              src={item.user_image}
              className="w-10 h-10 rounded-full"
            />

            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm">{item.user_name}</p>

              <p className="text-xs text-gray-500 line-clamp-2">
                {item.message}
              </p>

              {!item.response && (
                <button
                  onClick={() => setSelected(item)}
                  className="mt-2 text-xs text-primary hover:underline"
                >
                  رد على الاقتراح
                </button>
              )}

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

      {selected && (
        <div
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
        >
          <div className="bg-white p-5 rounded-xl w-[400px] flex flex-col gap-4">
            <h3 className="text-sm font-medium">الرد على الاقتراح</h3>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              className="border rounded-lg p-2 text-sm"
              placeholder="اكتب ردك هنا"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-gray-500"
              >
                إلغاء
              </button>

              <button
                onClick={handleReply}
                className="bg-primary text-white px-4 py-1 rounded-lg text-sm"
              >
                إرسال
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default ComplaintsPage;
