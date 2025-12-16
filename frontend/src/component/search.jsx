import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
const Search = () => {    
    const location = useLocation();
    const currentPath = location.pathname;

    const token = localStorage.getItem("token");
    const [user, setUser] = useState(null);

    const [hasService, setHasService] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
    if (token) {
        fetch("http://127.0.0.1:8000/api/users/user/", {
        headers: {
            Authorization: `Token ${token}`,
        },
        })
        .then((res) => res.json())
        .then((data) => {
            setUser(data); // ← هنا يتم تخزين بيانات المستخدم
            setHasService(data.has_service); // ← وهنا نعرف إذا عنده خدمة
        })
        .catch((error) => console.error("خطأ في جلب بيانات المستخدم:", error));
    }
    }, []);


    const getSearchPlaceholder = () => {
        if (!user) return "ابحث...";
        const isAdmin = user.user_type === "admin";
        const isOwner = user.user_type === "owner";
        const isNormal = user.user_type === "user";
        // Admin logic
        if (isAdmin) {
            if (currentPath.includes("/userlist")) return "ابحث عن مستخدم...";
            if (currentPath.includes("/categories")) return "ابحث عن قسم ...";
            if (currentPath.includes("/serviceslist")) return "ابحث عن معلومات خدمة...";
            return "ابحث عن خدمة...";
        }
        // Owner logic
        if (isOwner) {
            if (currentPath.includes("/product")) return "ابحث عن منتج...";
            return "ابحث عن خدمة...";
        }
        // Normal user
        if (isNormal) {
            return "ابحث عن خدمة...";
        }

        return "ابحث...";
    };


    const handleSearch = (e) => {
        e.preventDefault();

        const query = searchTerm.trim();

        if (user?.user_type === "admin" && currentPath.includes("/userlist")) {
            // ✅ Admin searching in user list
            navigate(query ? `/userlist?q=${encodeURIComponent(query)}` : `/userlist`);

        } else if (user?.user_type === "admin" && currentPath.includes("/categories")) {
            // ✅ Admin searching in categories
            navigate(query ? `/categories?q=${encodeURIComponent(query)}` : `/categories`);

        }else if (user?.user_type === "admin" && currentPath.includes("/serviceslist")) {
            // ✅ Admin searching in servicelist
            navigate(query ? `/serviceslist?q=${encodeURIComponent(query)}` : `/serviceslist`);

        } else if (hasService && currentPath.includes("/dashboard/products")) {
            navigate(query ? `/dashboard/products?q=${encodeURIComponent(query)}` : `/dashboard/products`);
        } else if (hasService && currentPath.includes("/dashboard/ads")) {
            navigate(query ? `/dashboard/ads?q=${encodeURIComponent(query)}` : `/dashboard/ads`);
        } else {
            navigate(query ? `/services?q=${encodeURIComponent(query)}` : `/services`);
        }
    };

    useEffect(() => {
    if (user?.user_type === "admin" && currentPath.includes("/userlist")) {
        if (searchTerm.trim() === "") {
        // ✅ إذا مربع البحث صار فاضي، نرجع لعرض الكل
        navigate(`/userlist`);
        }
    }

    if (user?.user_type === "admin" && currentPath.includes("/categories")) {
        if (searchTerm.trim() === "") {
        // ✅ إذا مربع البحث صار فاضي، نرجع لعرض الكل
        navigate(`/categories`);
        }
    }

    if (user?.user_type === "admin" && currentPath.includes("/serviceslist")) {
        if (searchTerm.trim() === "") {
        // ✅ إذا مربع البحث صار فاضي، نرجع لعرض الكل
        navigate(`/serviceslist`);
        }
    }
    }, [searchTerm, user, currentPath, navigate]);

  return (
    <form
      onSubmit={handleSearch}
      className="border border-gray-300 w-100 flex justify-between px-4 py-2 rounded-3xl"
    >
      <input
        type="text"
        placeholder={getSearchPlaceholder()}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="outline-none w-full"
      />
      <button type="submit">
        <MagnifyingGlassIcon className="w-4 h-4 text-gray-500" />
      </button>
    </form>
  );
};

export default Search;
