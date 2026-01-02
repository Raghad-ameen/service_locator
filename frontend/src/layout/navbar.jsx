import { useEffect, useState } from "react";
import default_img from "../../public/media/user_profile/default.png";
import { useNavigate } from "react-router-dom";
import { HeartIcon } from "@heroicons/react/24/outline";
import { BellIcon } from "@heroicons/react/24/outline";
import { Squares2X2Icon, BuildingStorefrontIcon  } from '@heroicons/react/24/outline';
import logo from "../../public/logo.png"
import Search from "../component/search";
import Login from "../account/LoginForm";
import RegisterForm from "../account/RegisterForm";
import { useLocation } from 'react-router-dom';
const Navbar = ({ user, setUser, activeModal, setActiveModal }) => {
  const navigate= useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const [hasService, setHasService] = useState(false);
  const token = localStorage.getItem("token");
// console.log("بيانات المستخدم:", user);
// console.log("الهيدر المرسل:", { Authorization: `Token ${token}` });
  useEffect(() => {
    if (token) {
      fetch("http://127.0.0.1:8000/api/users/user/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          setUser(data);
          setHasService(data.has_service);
        })
        .catch((error) => console.error("خطأ في جلب بيانات المستخدم:", error));
    }
  }, []);
  useEffect(() => {
    if (user && token) {
      setActiveModal(null); // ← يغلق الفورم بعد نجاح الدخول
    }
  }, [user, token]);

    let navbarType;
    if (!token) {
        navbarType = "guest"; // الحالة 1
    } else{
        navbarType = "logged_no_service"; // الحالة 2
    }

  return (
    <nav className=" fixed z-50 w-full rounded-b-3xl bg-white border-b border-gray-200 shadow-md shadow-primary/5 font-['Montserrat-Arabic'] text-sm text-secondary-900 py-4 px-20">
        <div dir="rtl" className="flex w-full justify-between items-center gap-20">
          {/* logo */}
          <div onClick={() => navigate('/')} className="w-fit h-fit cursor-pointer">
            <img src={logo} className="w-12 h-13"/>
          </div>
          {/* nav item */}
          <div dir="rtl" className="flex flex-1 gap-6 w-fit">
            <a onClick={() => navigate("/", { state: { section: "hero" } })} className="w-15 mx-1 cursor-pointer">الرئيسية</a>
            <a onClick={() => navigate("/", { state: { section: "about" } })} className="w-15 mx-1 cursor-pointer">نبذة عنا</a>
            <a onClick={() => navigate("/", { state: { section: "service" } })} className="w-15 mx-1 cursor-pointer">الخدمات</a>
          </div>
          {/* search */}
          <Search/>
          {/*icon and user info*/}
          {navbarType === "logged_no_service" && (
            <div dir="rtl" className="flex items-center gap-6">
              <div className="flex gap-4 w-fit border-l border-gray-300 pl-5 py-1">
                <HeartIcon className="w-5 h-5"/>
                <BellIcon className="w-5 h-5"/>
                {user?.user_type === "admin" && (
                    <Squares2X2Icon onClick={() => navigate('/adminDashboard')} className={`h-5 w-5 cursor-pointer ${currentPath === '/adminDashboard' ? 'text-primary' : 'text-gray-900'}`} />
                )}
                {user?.has_service && (
                    <BuildingStorefrontIcon onClick={() => navigate('/serviceDashboard')} className={`h-5 w-5 cursor-pointer ${currentPath === '/serviceDashboard' ? 'text-primary' : 'text-gray-900'}`} />
                )}
              </div>
              {/* user info */}
              {user && (
                  <div onClick={() => navigate('/Userprofile')} className="flex cursor-pointer items-center gap-4 p-1 w-fit h-fit">
                    <div className="w-10 h-10">
                      <img src={user.profile_image} onError={(e) => { e.target.src = default_img }} alt="profile" className="w-10 h-10 object-cover rounded-full"/>
                    </div>
                    <div className="flex flex-col gap-1 w-25">
                      <span>{user.username}</span>
                      <span className="text-xs text-gray-500">{user.user_type_display}</span>
                    </div>
                  </div>
              )}
            </div>
          )}
          {/* button */}
          <div dir="ltr" className="flex flex-1 w-fit">
            <div className="flex gap-10">
              {((user?.user_type !== "owner" && !user?.has_service) || navbarType === "guest") && (
                <div className="w-fit">
                  <button onClick={() => navigate('Create')} className="border border-primary rounded-xl text-primary px-4 py-2 w-30 cursor-pointer"
                  > أضف خدمتك </button>
                </div>
              )}
              {navbarType === "guest" && (
                <div className="w-fit">
                  <button onClick={() => setActiveModal('login')} className="border border-primary rounded-xl text-primary px-4 py-2 w-32 cursor-pointer"> تسجيل الدخول</button>
                  {activeModal === 'login' && (
                    <Login
                      onClose={() => setActiveModal(null)}
                      onSwitch={() => setActiveModal('signup')}
                      setUser={setUser}
                    />
                  )}
                  {activeModal === 'signup' && (
                    <RegisterForm
                      onClose={() => setActiveModal(null)}
                      onSwitch={() => setActiveModal('login')}
                      setUser={setUser}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          
        </div>
    </nav>
  )
}

export default Navbar