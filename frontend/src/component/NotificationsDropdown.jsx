import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { BellIcon as Bell } from "@heroicons/react/24/outline";

const NotificationsDropdown = () => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/notifications/",
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );
      setNotifications(res.data);
    } catch (err) {
      console.error("Error fetching notifications", err);
    }
  };

  // ✅ تحميل مرة واحدة عند الدخول (للبادج)
  useEffect(() => {
    fetchNotifications();
  }, []);

  // ✅ عند الضغط على الجرس فقط
  const handleToggle = () => {
    setOpen((prev) => !prev);
    fetchNotifications(); // تحديث عند الفتح
  };

  // إغلاق عند الضغط خارج القائمة
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openNotification = async (id) => {
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/notifications/${id}/open/`,
        {},
        {
          headers: {
            Authorization: `Token ${localStorage.getItem("token")}`,
          },
        }
      );
      fetchNotifications(); // تحديث بعد القراءة
    } catch (err) {
      console.error("Error opening notification", err);
    }
  };

  return (
    <div className="relative -mb-1.5" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative cursor-pointer"
      >
        <Bell className="w-5 h-5 text-gray-700" />
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 overflow-hidden">
          {notifications.length === 0 ? (
            <p className="p-4 text-sm text-gray-500">
              لا توجد إشعارات
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => openNotification(n.id)}
                className="p-3 border-b last:border-b-0 hover:bg-gray-100 cursor-pointer text-sm"
              >
                {n.message}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsDropdown;
