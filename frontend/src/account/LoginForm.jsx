import { useState } from "react";
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = ({onClose, onSwitch}) => {
  const { login } = useAuth ();
  const [formData, setFormData] = useState({
    phone: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  const { phone, password } = formData;
  const errors = [];

  // تحقق من الحقول الفارغة
  if (!phone.trim()) {
    errors.push("يرجى إدخال رقم الهاتف");
  }

  if (!password.trim()) {
    errors.push("يرجى إدخال كلمة المرور");
  }

  // تحقق من رقم الهاتف
  if (!/^7\d{8}$/.test(phone)) {
    errors.push("رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 9 أرقام");
  }

  if (errors.length > 0) {
    setMessage( errors.join("، "));
    return;
  }

  // إرسال البيانات للخادم
  try {
    const res = await fetch("http://127.0.0.1:8000/api/users/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, password })
    });

    const data = await res.json();


    if (res.status === 200) {
      login(
      {
        id: data.id,
        username: data.username,
        // email: data.email,
        phone: data.phone,
        profile_image: data.profile_image,
        user_type: data.user_type,
        user_type_display:
          data.user_type === "admin"
            ? "مشرف"
            : data.user_type === "owner"
            ? "صاحب خدمة"
            : "مستخدم عادي",
        has_service: data.has_service,
      },
      data.token
    );
  setFormData({
      phone: "",
      password: ""
    });
  if (data.user_type === "admin") {
    navigate("/adminDashboard");
  } else if (data.user_type === "owner") {
    navigate("/serviceDashboard");
  } else {
    navigate("/");
    onClose();
  }
}
 else {
  // تحقق من الرسالة القادمة من backend
  setMessage(data.detail || data.non_field_errors?.[0] || "بيانات الدخول غير صحيحة");
}
  } catch (error) {
    setMessage(" حدث خطأ في الاتصال بالخادم");
  }
};

  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  return (
    <motion.div
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-screen w-full fixed top-0 left-0 bg-black/50 flex items-center justify-center">
      <motion.div dir="rtl" 
        onClick={handleContentClick}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3,  }}    
        className="max-w-md w-full bg-white shadow p-10 rounded-2xl font-['Montserrat-Arabic']">
        <h2 className="text-2xl text-center mb-4 text-gray-900">تسجيل الدخول</h2>
        <form onSubmit={handleSubmit} dir="rtl" className="space-y-3 text-gray-700 font-light text-sm">
          {message && (
            <p className="text-center mb-3 text-red-600">
              {message}
            </p>
          )}
          {/* phone number */}
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder=" رقم الهاتف"
            className="w-full border border-gray-400 bg-gray-50 px-5 py-3.5 rounded-xl"
          />
          {/*password*/}
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="كلمة المرور"
            className="w-full border border-gray-400 bg-gray-50 px-5 py-3.5 rounded-xl"
          />
          {/*login button*/}
          <button type="submit" className="bg-green-600 text-white w-full px-5 py-3.5 rounded-xl hover:bg-green-700 disabled:opacity-60 text-base">
            دخول
          </button>
           <div className="text-center mt-4">
            <span>ليس لديك حساب؟ </span>
            <span onClick={onSwitch} className="text-green-600 hover:text-green-700 cursor-pointer">إنشاء حساب</span>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Login;
