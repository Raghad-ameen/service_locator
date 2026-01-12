import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {PencilIcon} from "../component/icons"
import default_img from "../../public/media/user_profile/default.png";
import {ToastMess} from "../component/toast"
import { motion } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';

function Profile() {
  const BASE_URL = "http://127.0.0.1:8000/api/users/";
  const [activeField, setActiveField] = useState(null);
  const [originalInfo, setOriginalInfo] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [hasChanges, setHasChanges] = useState(false);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const [user, setUser] = useState(null);
  const navigate= useNavigate();

  useEffect(() => {
  if (activeField === 'username' && usernameRef.current) {
    usernameRef.current.focus();
  }
  if (activeField === 'email' && emailRef.current) {
    emailRef.current.focus();
  }
  if (activeField === 'phone' && phoneRef.current) {
    phoneRef.current.focus();
  }
}, [activeField]);


  const [info, setInfo] = useState({
    username: '',
    email: '',
    phone: '',
    profile_image: '',
    password: ''
  });

  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  // Preview selected image
  useEffect(() => {
    if (info.profile_image && typeof info.profile_image !== 'string') {
      const objectUrl = URL.createObjectURL(info.profile_image);
      setPreviewImage(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreviewImage(info.profile_image);
    }
  }, [info.profile_image]);

  // Check if any info or password changed
  const checkForChanges = (updatedInfo = info, updatedPasswords = passwords) => {
    const sameImage =
      (typeof updatedInfo.profile_image === 'string' &&
        updatedInfo.profile_image === originalInfo.profile_image) ||
      (updatedInfo.profile_image instanceof File && !originalInfo.profile_image);

    const infoChanged =
      updatedInfo.username !== originalInfo.username ||
      updatedInfo.email !== originalInfo.email ||
      updatedInfo.phone !== originalInfo.phone ||
      !sameImage;

    const passwordChanged =
      !!updatedPasswords.old_password ||
      !!updatedPasswords.new_password ||
      !!updatedPasswords.confirm_password;

    setHasChanges(infoChanged || passwordChanged);
  };

  // Fetch current user
  useEffect(() => {
    axios
      .get(`${BASE_URL}user/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      })
      .then((res) => {
        const userData = {
          username: res.data.username || '',
          email: res.data.email || '',
          phone: res.data.phone || '',
          profile_image: res.data.profile_image || '',
          password: ''
        };
        setInfo(userData);
        setOriginalInfo(userData);
        setHasChanges(false);
      })
      .catch((err) => console.error(err));
  }, []);

  // Validate and save password
  const handlePasswordSave = () => {
    const errors = {};
    const pass = passwords.new_password;
    const confirm = passwords.confirm_password;

    if (!passwords.old_password.trim()) {
      errors.old_password = "يرجى إدخال كلمة المرور الحالية";
    }

    if (!pass.trim()) {
      errors.new_password = "يرجى إدخال كلمة المرور الجديدة";
    } else {
      const rules = [];
      if (pass.length < 8) rules.push("8 أحرف على الأقل");
      if (!/[A-Z]/.test(pass)) rules.push("حرف كبير واحد على الأقل");
      if (!/[a-z]/.test(pass)) rules.push("حرف صغير واحد على الأقل");
      if (!/\d/.test(pass)) rules.push("رقم واحد على الأقل");
      if (!/[!@#$%^&*(),.?\":{}|<>_\-+=\[\]\\\/;']/.test(pass))
        rules.push("رمز خاص واحد على الأقل");

      if (rules.length > 0) {
        errors.new_password = "كلمة المرور ضعيفة: " + rules.join("، ");
      }
    }

    if (!confirm.trim()) {
      errors.confirm_password = "تأكيد كلمة المرور مطلوب";
    } else if (pass !== confirm) {
      errors.confirm_password = "كلمتا المرور غير متطابقتان";
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    updateProfile(true);
  };

  const validateInfo = () => {
    const errors = [];

    if (!info.username.trim()) {
      errors.push("الاسم مطلوب");
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!info.email.trim()) {
      errors.push("البريد الإلكتروني مطلوب");
    } else if (!emailRegex.test(info.email)) {
      errors.push("صيغة البريد الإلكتروني غير صحيحة");
    }

    const phoneRegex = /^7\d{8}$/;
    if (!info.phone.trim()) {
      errors.push("رقم الهاتف مطلوب");
    } else if (!phoneRegex.test(info.phone)) {
      errors.push("رقم الهاتف يجب أن يبدأ بـ 7 ويتكون من 9 أرقام");
    }

    return errors;
  };

  // Update profile or password
  const updateProfile = (shouldClosePopup = false) => {
    const infoErrors = validateInfo();
    if (infoErrors.length > 0) {
      infoErrors.forEach(msg => toast.error(msg));
      return;
    }
    const data = new FormData();
    data.append('username', info.username);
    data.append('email', info.email);
    data.append('phone', info.phone);

    if (info.profile_image && typeof info.profile_image !== 'string') {
      data.append('profile_image', info.profile_image);
    }

    // append password fields only if user changing them
    if (passwords.old_password || passwords.new_password || passwords.confirm_password) {
      data.append('old_password', passwords.old_password);
      data.append('new_password', passwords.new_password);
      data.append('confirm_password', passwords.confirm_password);
    }

    axios
      .put(`${BASE_URL}update_user/`, data, {
        headers: {
          Authorization: `Token ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      .then((res) => {
        const updatedInfo = {
          username: res.data.username || info.username,
          email: res.data.email || info.email,
          phone: res.data.phone || info.phone,
          profile_image: res.data.profile_image || info.profile_image,
          password: ''
        };
        setInfo(updatedInfo);
        setOriginalInfo(updatedInfo);
        setPasswords({ old_password: '', new_password: '', confirm_password: '' });
        setValidationErrors({});
        if (shouldClosePopup) setShowPasswordPopup(false);
        setHasChanges(false);
        window.location.reload();
      })
     .catch(err => {
        const error = err.response?.data || {};
        console.log("Server error:", error);
        const formatted = {};
        const details = error.errors || error;

        for (const key in details) {
          const msg = Array.isArray(details[key]) ? details[key][0] : details[key];

          if (msg) {
            // ✅ عرض التوست فقط للأخطاء الخاصة بـ الاسم، الإيميل، ورقم الهاتف
            if (['username', 'email', 'phone'].includes(key)) {
              toast.error(msg);
            }

            // ✅ تخزين كل الأخطاء لعرضها تحت الحقول (خاصة كلمة المرور)
            formatted[key] = msg;
          }
        }

        // ✅ عرض التوست فقط للرسائل العامة
        if (details.detail) {
          formatted.old_password = details.detail;
          toast.error(details.detail);
        }

        if (details.non_field_errors) {
          formatted.old_password = details.non_field_errors[0];
          toast.error(details.non_field_errors[0]);
        }

        if (Object.keys(formatted).length === 0) {
          formatted.old_password = "حدث خطأ أثناء تحديث كلمة المرور.";
        }

        setValidationErrors(formatted);
      });
  };

  // Handle inputs
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (files && files[0]) {
      const file = files[0];
      const updatedInfo = { ...info, profile_image: file };
      setInfo(updatedInfo);
      checkForChanges(updatedInfo, passwords);
      return;
    }

    if (['old_password', 'new_password', 'confirm_password'].includes(name)) {
      const updatedPasswords = { ...passwords, [name]: value };
      setPasswords(updatedPasswords);
      checkForChanges(info, updatedPasswords);
    } else {
      const updatedInfo = { ...info, [name]: value };
      setInfo(updatedInfo);
      checkForChanges(updatedInfo, passwords);
    }
  };

  //logout
  const handleLogout = () => {
    localStorage.removeItem("user");   // امسح بيانات المستخدم
    localStorage.removeItem("token");  // امسح التوكن
    setUser(null);  
      setTimeout(() => {
        navigate("/");
      }, 1800);  // ← توجيه لصفحة الدخول
      toast.success("تم تسجيل الخروج");
  };

  //delete confirm message
  const confirmDeleteAccount = () => {
      let toastId; // declare variable

      toastId = toast(
        ({ closeToast }) => (
          <ToastMess
            closeToast={closeToast}
            toastId={toastId} // now this will be set correctly
            handleDeleteAccount={handleDeleteAccount}
          />
        ),
        {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          position: "top-center",
        }
      );
  };

  //delete account
  const handleDeleteAccount = async () => {
    try {
      await axios.delete(`${BASE_URL}delete_own_account/`, {
        headers: { Authorization: `Token ${localStorage.getItem('token')}` }
      });
      localStorage.removeItem("user");   // امسح بيانات المستخدم
      localStorage.removeItem("token");  // امسح التوكن
      setUser(null);  
      navigate("/");
    } catch (err) {
      toast.error("حدث خطأ أثناء حذف الحساب");
    }
  };

  const fields = [
    { 
      name: "username", 
      label: "الاسم", 
      ref: usernameRef 
    },
    { 
      name: "email", 
      label: "عنوان البريد الالكتروني", 
      ref: emailRef 
    },
    { 
      name: "phone", 
      label: "رقم الهاتف", 
      ref: phoneRef 
    },
  ];
  return (
    <div dir='ltr' className='bg-secondary-50 flex flex-col gap-6 justify-between items-end w-full px-20 pt-10 pb-5 font-["Montserrat-Arabic"] font-light text-[15px]'>
      <h3 className='text-primary mb-5 text-xl font-normal'>الملف الشخصي</h3>

      <form onSubmit={(e) => { e.preventDefault(); updateProfile(false); }} className='w-full flex flex-col gap-20'>
        <div dir='rtl' className='flex justify-between items-center w-full'>
          <div className='flex flex-col items-center'>
            <img
              src={previewImage || default_img}
              onError={(e) => { e.target.src = default_img }}
              alt="الصورة الشخصية"
              className="w-42 h-42 mb-10 rounded-full object-cover"
            />
            <label
              onClick={() => document.getElementById('profileImageInput').click()}
              className='rounded-lg text-white bg-primary px-4 py-2 cursor-pointer'
            >
              تعديل الصورة
            </label>
            <input type="file" accept="image/*" id="profileImageInput" name="profile_image" onChange={handleChange} className='hidden' />
          </div>
          <div className='border bg-white border-gray-200 rounded-xl shadow-md w-[75%]'>
            {/* name/ email/ phone */}
            {fields.map(({ name, label, ref }) => (
              <div key={name} className='border-b border-gray-200 px-4 flex items-center w-full'>
                <label className='w-80 border-l border-gray-200 py-6'>{label}</label>
                <input
                  ref={ref}
                  className={`flex-1 py-6 pr-4 focus:outline-none ${
                    activeField === name ? "text-gray-900" : "text-gray-700"
                  }`}
                  name={name}
                  disabled={activeField !== name}
                  value={info[name] || ""}
                  onChange={handleChange}
                />
                <PencilIcon
                  OnClick={() => setActiveField(name)}
                  className="h-5 w-5 cursor-pointer text-primary"
                />
              </div>
            ))}
            {/* password */}
            <div className='px-4 flex items-center w-full'>
              <label className='w-80 py-6 border-l border-gray-200'>كلمة المرور</label>
              <span className='flex-1 pr-4 text-gray-500'>••••••••</span>
              <PencilIcon OnClick={() => setShowPasswordPopup(true)} className="h-5 w-5 cursor-pointer text-primary" />
            </div>
          </div>
        </div>

        <button
          type='submit'
          className={`rounded-lg px-4 py-2 cursor-pointer self-start ${hasChanges ? 'bg-primary text-white' : 'border border-primary text-primary bg-white'}`}
        >
          حفظ التعديلات
        </button>
      </form>

      {showPasswordPopup && (
        <motion.div
          dir='rtl'
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowPasswordPopup(false); }}
          className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50"
        >
          <motion.div
            initial={{ scale: 0.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white p-6 rounded-lg shadow-lg w-96 flex flex-col gap-5 text-sm"
          >
            <h4 className="text-lg text-primary">تغيير كلمة المرور</h4>
            <form onSubmit={(e) => e.preventDefault()} className='flex flex-col'>
              <input type="password" name="old_password" placeholder="كلمة المرور الحالية" value={passwords.old_password} onChange={handleChange} className="w-full px-2 py-3 border border-gray-300 rounded-lg mt-4 focus:outline-none"/>
              {validationErrors.old_password && <p className="text-red-500 text-xs mt-1">{validationErrors.old_password}</p>}

              <input type="password" name="new_password" placeholder="كلمة المرور الجديدة" value={passwords.new_password} onChange={handleChange} className="w-full px-2 py-3 border border-gray-300 rounded-lg mt-4 focus:outline-none"/>
              {validationErrors.new_password && <p className="text-red-500 text-xs mt-1">{validationErrors.new_password}</p>}

              <input type="password" name="confirm_password" placeholder="تأكيد كلمة المرور الجديدة" value={passwords.confirm_password || ''} onChange={handleChange} className="w-full px-2 py-3 border border-gray-300 rounded-lg mt-4 focus:outline-none"/>
              {validationErrors.confirm_password && <p className="text-red-500 text-xs mt-1">{validationErrors.confirm_password}</p>}
            </form>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={() => { setShowPasswordPopup(false); setValidationErrors({}); }} className="px-4 py-2 border border-primary text-primary cursor-pointer rounded-lg">إلغاء</button>
              <button type="button" onClick={handlePasswordSave} className="px-4 py-2 bg-primary text-white cursor-pointer rounded-lg">حفظ</button>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div dir='rtl' className='flex gap-10 self-center mt-6'>
        <button onClick={handleLogout} className='rounded-lg text-white bg-primary px-5 py-3 cursor-pointer'>تسجيل الخروج</button>
        <button onClick={confirmDeleteAccount} className='rounded-lg text-white bg-red-600 px-5 py-3 cursor-pointer'>حذف الحساب</button>
      </div>
    </div>
  );
}

export default Profile;
