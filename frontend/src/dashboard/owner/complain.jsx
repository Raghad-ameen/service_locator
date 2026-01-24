import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import ConfirmToast from "../../component/ConfirmToast";
import { toast } from "react-toastify";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import { TrashIcon } from "../../component/icons";


const ComplainsPage = () => {
  const [complaints, setComplaints] = useState([]);
  const [selected, setSelected] = useState(null);
  const [reply, setReply] = useState("");
  const { token } = useAuth();
  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(
          "https://service-locator-9aja.onrender.com/api/users/suggestions/",
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
      `https://service-locator-9aja.onrender.com/api/users/suggestions/${selected.id}/reply/`,
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

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://service-locator-9aja.onrender.com/api/users/suggestions/${id}/`,
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );

      // تحديث القائمة بدون إعادة تحميل
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("فشل حذف الشكوى:", err);
    }
  };

  const showConfirmToast = ({ message, onConfirm }) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
          title="حذف اقتراح"
          message={message}
          confirmText="حذف"
          cancelText="إلغاء"
          onConfirm={async () => {
            await onConfirm();
            closeToast();
          }}
          onCancel={closeToast}
        />
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
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
              className="flex flex-col items-start gap-4 w-full px-6 py-4 hover:bg-gray-50 not-last-of-type:border-b-2 border-gray-200"
            >
              {/* التاريخ اللي وصل به الاقتراح */}
              <p className="text-xs mb-5 text-primary">
                {new Date(item.created_at).toLocaleDateString("ar", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              {/* buttons and info */}
              <div className="flex justify-between w-full">
                {/* معلومات المستخدم */}
                <div className="flex gap-5">
                  <img
                    src={item.user_image}
                    className="w-10 h-10 rounded-full inline"
                  />
                  {/* اسم و اقتراح المستخدم */}
                  <div className="">
                    <p className="font-medium text-sm mb-1">{item.user_name}</p>
                    {/* الاقتراح */}
                    <p className="text-xs text-gray-500 line-clamp-2">
                      {item.message}
                    </p>
                  </div>
                </div>
                {/* buttons */}
                <div className="flex items-center gap-5">
                  {/* زر الرد على الاقتراح */}
                  {item.response ? (
                    <div className="mt-2 flex flex-col gap-2 text-xs">
                      <span className="text-gray-700 font-medium">
                        تم الرد على الاقتراح
                      </span>
                      <button
                        onClick={() => setSelected(item)}
                        className="text-primary cursor-pointer"
                      >
                        الرد مرة أخرى
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelected(item)}
                      className="mt-2 text-xs text-primary cursor-pointer"
                    >
                      رد على الاقتراح
                    </button>
                  )}
                  {/* delete sug */}
                  <TrashIcon
                    OnClick={() => showConfirmToast({ message: "هل أنت متأكد من انك تريد حذف هذا الاقتراح ؟", onConfirm: () => handleDelete(item.id), })}
                    className="cursor-pointer"
                  />
                </div>
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
          <div className="bg-white p-5 rounded-xl flex flex-col gap-4">
            <h3 className="text-sm font-medium">الرد على الاقتراح</h3>

            <textarea
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              rows={4}
              className="border border-gray-400 rounded-lg p-2 text-sm min-h-40 focus:outline-none placeholder:text-xs"
              placeholder="اكتب ردك هنا"
            />

            <div className="flex justify-center gap-3 mt-5">
              <button
                onClick={() => setSelected(null)}
                className="text-sm text-gray-500 border px-4 py-1 rounded-lg border-gray-400 cursor-pointer"
              >
                إلغاء
              </button>

              <button
                onClick={handleReply}
                className="bg-primary text-white px-4 py-1 rounded-lg text-sm cursor-pointer"
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
export default ComplainsPage;
