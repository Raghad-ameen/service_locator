// favoriteContext.js
import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const FavoriteContext = createContext();

export const FavoriteProvider = ({ children }) => {
  const [favorites, setFavorites] = useState([]);
  const token = localStorage.getItem("token");

  const fetchFavorites = async () => {
    if (!token) {
      setFavorites([]);
      return;
    }

    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/services/favorites/",
        {
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
      setFavorites(res.data);
    } catch {
      setFavorites([]);
    }
  };

  // تحميل المفضلة عند الدخول
  useEffect(() => {
    fetchFavorites();
  }, [token]);

  // toggle
const toggleFavorite = async (service) => {
  if (!token) {
    alert("يجب تسجيل الدخول أولاً");
    return;
  }

  try {
    await axios.post(
      `http://127.0.0.1:8000/api/services/favorites/${service.id}/toggle/`,
      {},
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    // ✅ بعد أي تغيير → أعد الجلب من السيرفر
    const res = await axios.get(
      "http://127.0.0.1:8000/api/services/favorites/",
      {
        headers: {
          Authorization: `Token ${token}`,
        },
      }
    );

    setFavorites(res.data);

    // 🔔 تحديث العداد بالناف
    window.dispatchEvent(new Event("favorites:updated"));
  } catch (err) {
    console.error("خطأ في المفضلة:", err);
  }
};



  return (
    <FavoriteContext.Provider value={{ favorites, toggleFavorite }}>
      {children}
    </FavoriteContext.Provider>
  );
};

export const useFavorites = () => useContext(FavoriteContext);
