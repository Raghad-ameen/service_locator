import { useEffect, useRef, useState } from "react";
import { HeartIcon } from "@heroicons/react/24/outline";
import { useFavorites } from "../context/favoriteContext";
import FavoriteDropdown from "./favoriteDropdown";

const FavoritesMenu = () => {
  const { favorites } = useFavorites();
  const [open, setOpen] = useState(false);

  const btnRef = useRef(null);
  const boxRef = useRef(null);

  // إغلاق عند الضغط خارج الفورم
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
      {/* زر القلب */}
      <button
        ref={btnRef}
        onClick={() => setOpen((prev) => !prev)}
        className="relative"
      >
        <HeartIcon className="w-5 h-5 cursor-pointer" />

        {favorites.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
            {favorites.length}
          </span>
        )}
      </button>

      {/* فورم المفضلة */}
      {open && (
        <div
          ref={boxRef}
          className="absolute top-10 left-200 right-0 z-9999"
        >
          <FavoriteDropdown />
        </div>
      )}
    </div>
  );
};

export default FavoritesMenu;
