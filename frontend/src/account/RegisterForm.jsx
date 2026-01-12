import { useState } from "react";
import { motion } from 'framer-motion';
import { useNavigate } from "react-router-dom";
import { CameraIcon } from "@heroicons/react/24/outline";
import { useAuth } from "../context/AuthContext";
const RegisterForm = ({ onClose, onSwitch }) => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    // email: "",
    password: "",
    password2: "",
    phone: "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files.length > 0) {
      setProfileImage(files[0]);
      setErrors((prev) => ({ ...prev, profile_image: "" }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    const newErrors = {};

    // ✅ التحقق من الاسم
    if (!formData.username.trim()) newErrors.username = "الاسم مطلوب";

    // ✅ التحقق من البريد الإلكتروني
    // if (!formData.email.trim()) {
    //   newErrors.email = "البريد الإلكتروني مطلوب";
    // } else if (
    //   !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email)
    // ) {
    //   newErrors.email = "البريد الإلكتروني غير صحيح";
    // }

    // ✅ التحقق من كلمة المرور
    const pass = formData.password;
    if (!pass.trim()) {
      newErrors.password = "كلمة المرور مطلوبة";
    } else {
      const rules = [];
      if (pass.length < 8) rules.push("8 أحرف على الأقل");
      if (!/[A-Z]/.test(pass)) rules.push("حرف كبير واحد على الأقل");
      if (!/[a-z]/.test(pass)) rules.push("حرف صغير واحد على الأقل");
      if (!/\d/.test(pass)) rules.push("رقم واحد على الأقل");
      if (!/[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/;']/.test(pass))
        rules.push("رمز خاص واحد على الأقل");
      if (rules.length > 0)
        newErrors.password = "كلمة المرور ضعيفة: " + rules.join("، ");
    }

    // ✅ تأكيد كلمة المرور
    if (!formData.password2.trim()) {
      newErrors.password2 = "تأكيد كلمة المرور مطلوب";
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = "كلمتا المرور غير متطابقتان";
    }

    // ✅ التحقق من رقم الهاتف
    if (!formData.phone.trim()) {
      newErrors.phone = "رقم الهاتف مطلوب";
    } else if (!/^7\d{8}$/.test(formData.phone)) {
      newErrors.phone = "يجب أن يبدأ بـ 7 ويتكون من 9 أرقام";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // ✅ تجهيز البيانات للإرسال
    const dataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) =>
      dataToSend.append(key, value)
    );
    if (profileImage) dataToSend.append("profile_image", profileImage);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/register/", {
        method: "POST",
        body: dataToSend,
      });

      const text = await res.text();
      console.log("Response text:", text);
      

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = null;
      }

      if (res.status === 201 && data) {
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
          username: "",
          // email: "",
          password: "",
          password2: "",
          phone: "",
        });
        setProfileImage(null);
        navigate("/");
        onClose();
      } else {
        const serverErrors = {};
          if (data) {
          const translateError = (msg, field = "") => {
            if (!msg) return "";
            msg = msg.toLowerCase();

            // رسائل الأخطاء الشائعة مترجمة
            if (msg.includes("already exists") || msg.includes("exists")) {
              if (field === "username") return "اسم المستخدم مستخدم مسبقًا";
              // if (field === "email") return "البريد الإلكتروني مستخدم مسبقًا";
              if (field === "phone") return "رقم الهاتف مستخدم مسبقًا";
              return "القيمة مستخدمة مسبقًا";
            }
            if (msg.includes("invalid")) return "القيمة غير صالحة";
            if (msg.includes("password")) return "كلمة المرور غير صالحة";
            if (msg.includes("required")) return "هذا الحقل مطلوب";
            if (msg.includes("blank")) return "لا يمكن أن يكون هذا الحقل فارغًا";

            // fallback: النص الأصلي من السيرفر
            return msg;
          };

          if (data.username)
            serverErrors.username = translateError(
              Array.isArray(data.username) ? data.username[0] : data.username,
              "username"
            );

          // if (data.email)
          //   serverErrors.email = translateError(
          //     Array.isArray(data.email) ? data.email[0] : data.email,
          //     "email"
          //   );

          if (data.phone)
            serverErrors.phone = translateError(
              Array.isArray(data.phone) ? data.phone[0] : data.phone,
              "phone"
            );

          if (data.password)
            serverErrors.password = translateError(
              Array.isArray(data.password) ? data.password[0] : data.password,
              "password"
            );

          if (data.non_field_errors)
            serverErrors.general = translateError(
              Array.isArray(data.non_field_errors)
                ? data.non_field_errors[0]
                : data.non_field_errors
            );
        }

        setErrors(serverErrors);
        setMessage("حدث خطأ أثناء التسجيل، حاول مرة أخرى");
        console.error("Server error:", data);
      }
    } catch (error) {
      console.error("خطأ في الاتصال بالخادم:", error);
      setMessage("حدث خطأ في الاتصال بالخادم");
    }
  };
  const handleContentClick = (e) => {
    e.stopPropagation();
  };
  return (
    <motion.div
      onClick={onClose}
     
     className="h-[100vh] w-full fixed top-0 left-0 bg-black/50 flex items-center justify-center">
      <motion.div dir="rtl" 
        onClick={handleContentClick}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-md w-full bg-white shadow p-10 rounded-2xl font-['Montserrat-Arabic']">
        <h2 className="text-2xl text-center mb-4 text-gray-900">إنشاء حساب</h2>
        {message && (
          <p className="text-center mb-3 text-sm text-green-600">
            {message}
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-3 text-gray-700 font-light text-sm" encType="multipart/form-data">
          {/* username */}
          <div>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="الاسم (يمكنك ادخاله باللغة العربية)"
              className="w-full border border-gray-400 bg-gray-50 px-5 py-3.5 rounded-xl"
            />
            {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
          </div>

          {/* email*/}
          {/* <div>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="البريد الإلكتروني"
              className="w-full border border-gray-400 bg-gray-50 px-5 py-3.5 rounded-xl"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div> */}

          {/* password*/}
          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="كلمة المرور"
              className="w-full border border-gray-400 bg-gray-50 px-5 py-3.5 rounded-xl"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* confirm password*/}
          <div>
            <input
              type="password"
              name="password2"
              value={formData.password2}
              onChange={handleChange}
              placeholder="تأكيد كلمة المرور"
              className="w-full border border-gray-400 bg-gray-50 px-5 py-3.5 rounded-xl"
            />
            {errors.password2 && <p className="text-red-500 text-xs mt-1">{errors.password2}</p>}
          </div>

          {/* phone number*/}
          <div>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="رقم الهاتف"
              className="w-full border border-gray-400 bg-gray-50 px-5 py-3.5 rounded-xl"
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* image */}
          <div className="mt-5">
            <div onClick={() => document.getElementById('accountImage').click()} className="flex items-center">
              <CameraIcon className='w-6 h-6 ml-2 text-gray-400'/>
              <label className="cursor-pointer text-gray-400">اضف صورة</label>
            </div>
            <input
              id="accountImage"
              type="file"
              name="profile_image"
              accept="image/*"
              onChange={handleChange}
              className="hidden w-full border border-gray-400 bg-gray-50 px-5 py-3.5 rounded-xl"
            />
            {errors.profile_image && (
              <p className="text-red-500 text-xs mt-1">{errors.profile_image}</p>
            )}
          </div>
          {/* signup button */}
          <button
            type="submit"
            className="bg-green-600 text-white w-full px-5 py-3.5 rounded-xl hover:bg-green-700 disabled:opacity-60 text-base"
          >
          انشاء حساب          
          </button>
          <div className="text-center mt-4">
            <span>لديك حساب؟ </span>
            <span onClick={onSwitch} className="text-green-600 hover:text-green-700 cursor-pointer">تسجيل الدخول</span>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}
export default RegisterForm