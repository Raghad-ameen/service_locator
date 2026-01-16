import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Outlet, NavLink } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, UserGroupIcon, Square3Stack3DIcon, ShoppingBagIcon, MegaphoneIcon, UserCircleIcon, ArrowRightStartOnRectangleIcon, HeartIcon, BellIcon, Squares2X2Icon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';
import logo from "../../../public/logo.png";
import Search from '../../component/search';
import NotificationsDropdown from '../../component/NotificationsDropdown';
import axios from "axios";
import FavoriteDropdown from "../../component/favoriteDropdown";
import { useFavorites } from "../../context/favoriteContext";

const AdminNav = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [pendingCount, setPendingCount] = useState(0);
  const [AdvpendingCount, setAdvPendingCount] = useState(0);
  const hideSearchOff = ["/adminDashboard", "/manageAdv"];

  // console.log("بيانات المستخدم:", user);
  // console.log("الهيدر المرسل:", { Authorization: `Token ${token}` });

  const { favorites } = useFavorites();
  const favoriteCount = favorites.length;

  const [showFavorites, setShowFavorites] = useState(false);
  const favBtnRef = useRef(null);
  const favoritesBoxRef = useRef(null);

  /* ✅ مكان الفورم */
  const [favPos, setFavPos] = useState({ top: 0, left: 0 });

  const updateFavPosition = () => {
    const btn = favBtnRef.current;
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const top = rect.bottom + 12;
    const left = rect.left + rect.width / 2;

    setFavPos({ top, left });
  };

  const toggleFavorites = (e) => {
    e.stopPropagation();
    setShowFavorites((prev) => {
      const next = !prev;
      if (!prev) setTimeout(updateFavPosition, 0);
      return next;
    });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        showFavorites &&
        favoritesBoxRef.current &&
        !favoritesBoxRef.current.contains(e.target) &&
        favBtnRef.current &&
        !favBtnRef.current.contains(e.target)
      ) {
        setShowFavorites(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [showFavorites]);

  /* إعادة ضبط المكان عند scroll / resize */
  useEffect(() => {
    if (!showFavorites) return;

    const handler = () => updateFavPosition();
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);

    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [showFavorites]);


  const sideNavItem = [
    { to: "/adminDashboard", label: "الرئيسية", icon: HomeIcon },
    { to: "/userlist", label: "إدارة المستخدمين", icon: UserGroupIcon },
    { to: "/categories", label: "إدارة الأقسام", icon: Square3Stack3DIcon },
    { to: "/serviceslist", label: "إدارة الخدمات", icon: ShoppingBagIcon },
    { to: "/manageAdv", label: "إدارة الإعلانات", icon: MegaphoneIcon },
  ];
  //بيانات الخدمة
  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/services/service/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        const count = res.data.filter(
          (s) => s.status === "pending"
        ).length;
        setPendingCount(count);
      })
      .catch((err) => {
        console.error("خطأ في جلب الخدمات:", err);
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;

    axios
      .get("http://127.0.0.1:8000/api/services/admin/ads/pending/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
      .then((res) => {
        setAdvPendingCount(res.data.length);
      })
      .catch((err) => {
        console.error("خطأ في جلب الإعلانات:", err);
      });
  }, [token]);

  //logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div dir='rtl' className="flex font-['Montserrat-Arabic'] text-sm text-secondary-900">
      <div className="fixed flex flex-col items-center w-60 h-full border-l border-primary/30">
        <div onClick={() => navigate('/')} className="w-fit h-fit cursor-pointer mt-5">
          <img src={logo} className="w-10 h-12" />
        </div>
        <div className='mt-10 h-full pb-10 flex flex-col justify-between gap-60'>
          <div className="flex flex-col gap-6">
            {sideNavItem.map(({ to, label, icon: Icon }) => (
              <NavLink key={to + label} to={to}
                className={({ isActive }) => `flex gap-4 w-full items-center group px-8 py-2 hover:bg-primary-50 rounded cursor-pointer ${isActive ? "bg-primary-50" : "hover:bg-primary-50"}`}>
                {({ isActive }) => (
                  <>
                    <Icon className={`w-5 h-5 text-gray-500 ${isActive ? "text-primary-600" : "group-hover:text-primary-600"}`} />
                    <span className={`text-gray-900 ${isActive ? "text-primary-600" : "group-hover:text-primary-600"}`} >{label} </span>
                    {label === "إدارة الخدمات" && pendingCount > 0 && (
                      <span className={`mr-1 ${isActive ? "bg-primary" : "group-hover:bg-primary bg-red-500"} text-white text-[10px] px-1.75 py-0.5 rounded-full`}>
                        {pendingCount}
                      </span>
                    )}
                    {label === "إدارة الإعلانات" && AdvpendingCount > 0 && (
                      <span className={`mr-1 ${isActive ? "bg-primary" : "group-hover:bg-primary bg-red-500"} text-white text-[10px] px-1.75 py-0.5 rounded-full`}>
                        {AdvpendingCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
          <div className='flex flex-col gap-4'>
            <NavLink to="/Adminprofile" className={({ isActive }) => `flex gap-3 w-full items-center group px-8 py-2 hover:bg-primary-50 rounded cursor-pointer ${isActive ? 'bg-primary-50' : 'hover:bg-primary-50'}`}>
              {({ isActive }) => (
                <>
                  <UserCircleIcon className={`w-5 h-5 text-gray-500 ${isActive ? 'text-primary-600' : 'group-hover:text-primary-600'}`} />
                  <span className={`text-gray-900 ${isActive ? 'text-primary-600' : 'group-hover:text-primary-600'}`}>إدارة الحساب</span>
                </>
              )}
            </NavLink>
            <NavLink onClick={handleLogout} to="" className={({ isActive }) => `flex gap-3 w-full items-center group px-8 py-2 hover:bg-primary-50 rounded cursor-pointer ${isActive ? 'bg-primary-50' : 'hover:bg-primary-50'}`}>
              {({ isActive }) => (
                <>
                  <ArrowRightStartOnRectangleIcon className={`w-5 h-5 text-gray-500 ${isActive ? 'text-primary-600' : 'group-hover:text-primary-600'}`} />
                  <span className={`text-gray-900 ${isActive ? 'text-primary-600' : 'group-hover:text-primary-600'}`}>تسجيل الخروج</span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>
      <div className='flex-1 mr-60 w-full overflow-hidden items-center'>
        <div dir="rtl" className='fixed z-20 flex w-[85%] items-center gap-20 bg-white px-20 py-4 border-b border-primary/30 justify-between'>
          {/* nav item */}
          <div dir="rtl" className="flex gap-6 w-fit">
            <h1>مرحبا بك . <span>{user?.username}</span></h1>
          </div>
          {/* search */}
          {!hideSearchOff.includes(currentPath) && <Search />}
          {/* button icon and user info */}
          <div dir="ltr" className="flex w-fit items-center">
            {user?.user_type !== "owner" && !user?.has_service && (
              <div className="w-fit">
                <button
                  onClick={() => navigate('Create')}
                  className="border border-primary rounded-xl text-primary px-4 py-2 cursor-pointer"
                >
                  أضف خدمتك
                </button>
              </div>
            )}

            {/* icon and user info */}
            <div dir="rtl" className="flex items-center gap-6">
              <div className="flex gap-4 items-center w-fit border-l border-gray-300 pl-5 py-1">
                {/*  المفضلة */}
                <button
                  ref={favBtnRef}
                  onClick={toggleFavorites}
                  className="relative"
                >
                  <HeartIcon className="w-5 h-5.5 cursor-pointer" />
                  {favoriteCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[8px] px-1.5 py-0.5 rounded-full">
                      {favoriteCount}
                    </span>
                  )}
                </button>

                <NotificationsDropdown />
                {user?.user_type === "admin" && (
                  <Squares2X2Icon onClick={() => navigate('/adminDashboard')} className='h-5 w-5 cursor-pointer text-primary' />
                )}
                {user?.has_service && (
                  <BuildingStorefrontIcon onClick={() => navigate('/serviceDashboard')} className={`h-5 w-5 cursor-pointer ${currentPath === '/serviceDashboard' ? 'text-primary' : 'text-gray-900'}`} />
                )}
              </div>
              {/* user info */}
              {user && (
                <div onClick={() => navigate('/Adminprofile')} className="flex cursor-pointer items-center gap-4 p-1 w-fit h-fit">
                  <div className="w-10 h-10">
                    <img src={user.profile_image} onError={(e) => { e.target.src = default_img }} alt="profile" className="w-10 h-10 object-cover rounded-full" />
                  </div>
                  <div className="flex flex-col gap-1 w-25">
                    <span>{user.username}</span>
                    <span className="text-xs font-medium text-gray-500">{user.user_type_display}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        {showFavorites && (
          <div
            ref={favoritesBoxRef}
            style={{
              position: "fixed",
              top: favPos.top,
              left: favPos.left,
              transform: "translateX(-30%)",
              zIndex: 9999,
            }}
          >
            <FavoriteDropdown />
          </div>
        )}

        <div className='mt-20 overflow-hidden'>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminNav;
