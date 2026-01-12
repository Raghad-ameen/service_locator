import { HeartIcon } from "@heroicons/react/24/solid";
import { useFavorites } from "../context/favoriteContext";
import default_image from "../assets/haraz.png";

const FavoriteDropdown = () => {
  const { favorites, toggleFavorite } = useFavorites();

  return (
    <div
      dir="rtl"
      className="w-[420px] bg-white rounded-[22px] overflow-hidden border border-[#E6EAF0] shadow-[0_6px_18px_rgba(0,0,0,0.10)]"
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

            {/* ❤️ التعديل الوحيد هنا */}
            <button
              onClick={() => toggleFavorite({ id: service.id })}
              className="flex-shrink-0"
            >
              <HeartIcon className="w-6 h-6 text-red-500" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoriteDropdown;
