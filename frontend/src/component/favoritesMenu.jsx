import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { HeartIcon as HeartOutline } from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import default_image from "../assets/haraz.png";
import { useAuth } from "../context/AuthContext";

const FavoritesMenu = () => {
  const { user, token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [open, setOpen] = useState(false);

  const btnRef = useRef(null);
  const boxRef = useRef(null);

  const fetchFavorites = async () => {
    if (!user || !token) {
      setFavorites([]);
      return;
    }

    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/services/favorites/",
        { headers: { Authorization: `Token ${token}` } }
      );
      setFavorites(res.data);
    } catch {
      setFavorites([]);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, [user, token]);

  const toggleFavorite = async ({ id }) => {
    if (!user || !token) return;

    await axios.post(
      `http://127.0.0.1:8000/api/services/favorites/${id}/toggle/`,
      {},
      { headers: { Authorization: `Token ${token}` } }
    );

    fetchFavorites();
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (
        boxRef.current &&
        !boxRef.current.contains(e.target) &&
        btnRef.current &&
        !btnRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => setOpen(!open)} className="relative">
        <HeartOutline className="w-5 h-5" />
        {favorites.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {open && (
        <div ref={boxRef} className="absolute top-10 right-0 z-[9999]">
          <div
            dir="rtl"
            className="w-[420px] bg-white rounded-[22px] overflow-hidden
                       border border-[#E6EAF0]
                       shadow-[0_6px_18px_rgba(0,0,0,0.10)]"
          >
            <div className="bg-[#17A36B] text-white text-center py-3 font-semibold">
              {favorites.length} خدمات مفضلة
            </div>

            <div className="p-4 space-y-4 max-h-[320px] overflow-y-auto">
              {favorites.length === 0 && (
                <p className="text-center text-gray-500 text-sm">
                  لا توجد خدمات مفضلة
                </p>
              )}

              {favorites.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between border-b border-black/30 pb-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        service.logo_image ||
                        service.cover_image ||
                        default_image
                      }
                      alt={service.title}
                      className="w-12 h-12 rounded-full object-cover"
                    />

                    <div className="text-right max-w-[230px]">
                      <h4 className="font-semibold text-sm truncate">
                        {service.title}
                      </h4>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFavorite({ id: service.id })}
                  >
                    <HeartSolid className="w-6 h-6 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FavoritesMenu;



