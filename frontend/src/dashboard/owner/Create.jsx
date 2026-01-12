import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ChevronRightIcon, ArrowUpTrayIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons';
import { faEnvelope } from '@fortawesome/free-regular-svg-icons';
import AddWH from '../../component/addWH';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastSuccess } from '../../component/toast';

const Create = () => {
  const navigate = useNavigate();
  const workHoursRef = useRef();
  const [workHours, setWorkHours] = useState({});
  const [errors, setErrors] = useState({});
  // الحقول
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  //const [directorate, setDirectorate] = useState('');
  //const [street, setStreet] = useState('');
  //const [locationMap, setLocationMap] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [coverImage, setCoverImage] = useState(null);
  const [logoImage, setLogoImage] = useState(null);


  const token = localStorage.getItem('token');

  // جلب أنواع الخدمات
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('لا يوجد توكن في localStorage');
      return;
    }

    axios.get('http://127.0.0.1:8000/api/services/categories/', {
      headers: {
        Authorization: `Token ${token}`
      }
    })
    .then(res => setCategories(res.data))
    .catch(err => console.error('خطأ في تحميل الأقسام:', err));
  }, []);

  const isValidImageType = (file) => {
    if (!file) return false;
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    return allowed.includes(file.type);
  };

  const validateForm = () => {
    let newErrors = {};

    if (!title.trim()) newErrors.title = "اسم الخدمة مطلوب";
    if (!description.trim()) newErrors.description = "الوصف مطلوب";
    
    if (!category) newErrors.category = "الرجاء اختيار نوع الخدمة";

    if (!phone.trim()) {
        newErrors.phone = "رقم الهاتف مطلوب";
    } 
    else if (!/^[7][0-9]{8}$/.test(phone)) {
        newErrors.phone = "يجب أن يكون الرقم 9 أرقام ويبدأ بـ 7";
    }
    if (!whatsapp.trim()) {
        newErrors.whatsapp = "رقم الواتساب مطلوب";
    } 
    else if (!/^[7][0-9]{8}$/.test(whatsapp)) {
        newErrors.whatsapp = "يجب أن يكون الرقم 9 أرقام ويبدأ بـ 7";
    }
    if (!coverImage) newErrors.coverImage = "صورة الغلاف مطلوبة";
    else if (!isValidImageType(coverImage))
      newErrors.coverImage = "يجب أن تكون الصورة PNG أو JPG";

    if (!logoImage) newErrors.logoImage = "شعار الخدمة مطلوب";
    else if (!isValidImageType(logoImage))
      newErrors.logoImage = "يجب أن يكون الشعار PNG أو JPG";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  //////////////////////////////////////////////////////////////////
  const showBackdrop = () => {
    const backdrop = document.createElement("div");
    backdrop.id = "toast-backdrop";
    backdrop.className =
      "fixed inset-0 bg-black/30 backdrop-blur-sm z-[998]";
    document.body.appendChild(backdrop);
    document.body.style.overflow = "hidden";
  };

  const removeBackdrop = () => {
    const backdrop = document.getElementById("toast-backdrop");
    if (backdrop) backdrop.remove();
    document.body.style.overflow = "auto";

  };
  ////////////////////////////////////////////////////////////////
  // إرسال الخدمة
  const handleSubmit = async (e) => {
    e.preventDefault();

    const isFormValid = validateForm();
    const isWorkHoursValid = workHoursRef.current?.validate();

    if (!isFormValid || !isWorkHoursValid) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('category_id', category);
    // formData.append('directorate', directorate);
    // formData.append('street', street);
    // formData.append('location_map', locationMap);
    formData.append('phone', phone);
    formData.append('whatsapp', whatsapp);
    if (coverImage) formData.append('cover_image', coverImage);
    if (logoImage) formData.append('logo_image', logoImage);
    try {
      // 1️⃣ إنشاء الخدمة
      const res = await axios.post('http://127.0.0.1:8000/api/services/service/', formData, {
        headers: {
          Authorization: `Token ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const newService = res.data;

      // إضافة مواعيد الدوام
      let schedulePayload = [];

      if (workHours.mode === "unified") {
        schedulePayload = workHours.days.map(day => ({
          day,
          start_time: workHours.unified.from,
          end_time: workHours.unified.to,
        }));
      } else {
        schedulePayload = workHours.days.map(day => ({
          day,
          start_time: workHours.customTimes[day].from,
          end_time: workHours.customTimes[day].to,
        }));
      }

      for (let entry of schedulePayload) {
        await axios.post(
          "http://127.0.0.1:8000/api/services/work-schedules/",
          {
            service: newService.id,
            ...entry,
          },
          { headers: { Authorization: `Token ${token}` } }
        );
      }
      showBackdrop(); //← أول شيء الــ blur
      let toastId;

      toastId = toast(
        (
          <ToastSuccess
            toastId={toastId}
            onConfirm={() => {
              removeBackdrop(); // ← يشيل الضباب
              toast.dismiss(toastId); // ← يقفل التوست
              navigate("/"); // ← يرجع للهوم
            }}
          />
        ),
        {
          autoClose: false,
          closeOnClick: false,
          draggable: false,
          position: "top-center",
          className: "toast-success-only",
        }
      );
      } catch (err) {
        console.error("FULL ERROR:", err);
        alert("❌ " + JSON.stringify(err.response?.data));
      }
  };

  return (
    <div className='px-50 pt-10 pb-5 font-["Montserrat-Arabic"] font-light text-[14px] w-full'>
      <div dir='rtl' className='flex gap-5'>
        <ChevronRightIcon onClick={()=> navigate('/')} className='h-7 w-6 text-primary-700 cursor-pointer'/>
        <h2 className='text-xl font-medium'>انشاء خدمة</h2>
      </div>
      <div dir='rtl' className='flex items-center justify-center mt-10 w-full'>
        <form onSubmit={handleSubmit} className='w-full flex flex-col items-center justify-center mx-60'>
        {/* service info */}
          <fieldset className='flex flex-col w-full mb-10'>
            <legend className='text-lg font-normal text-center mb-10'>معلومات عن الخدمة:</legend>
            {/* type */}
            <div className='flex justify-between border-b border-gray-200 pb-5'>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className='text-gray-500 w-full focus:outline-none'
                >
                <option value="">نوع الخدمة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder='اسم الخدمة/ اسم صاحب الخدمة اذا كنت صاحب عمل حر' className='w-full focus:outline-none border-b border-gray-200 pb-5 mt-10' />
            {errors.title && <p className="text-red-500 text-sm">{errors.title}</p>}
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder='وصف الخدمة' className='w-full focus:outline-none border-b border-gray-200 mt-10' />
            {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}

            {/* images */}
            <div className='flex gap-6 mb-4 mt-10'>
              <div className='flex-1/3'>
                <h3 className='text-gray-500 mb-3 mr-1'>صورة الغلاف</h3>
                <div className='border-2 border-dashed border-gray-300 rounded-lg py-4 bg-gray-50 flex flex-col items-center gap-2'>
                  <ArrowUpTrayIcon className='h-6 text-gray-500'/>
                  <span className="font-medium text-gray-600">Click to upload</span>
                  <p className="text-sm text-gray-400">PNG or JPG</p>
                  <label className="bg-primary text-white px-3 py-1 mt-1 rounded cursor-pointer">
                  اختر ملف
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCoverImage(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.coverImage && (
                  <p className="text-red-500 text-sm mt-1">{errors.coverImage}</p>
                )}
              </div>
              <div className='flex-1/5'>
                <h3 className='text-gray-500 mb-3 mr-1'>صورة الخدمة (الشعار)</h3>
                <div className='border-2 border-dashed border-gray-300 rounded-lg py-4 bg-gray-50 flex flex-col items-center gap-2'>
                  <ArrowUpTrayIcon className='h-6 text-gray-500'/>
                  <span className="font-medium text-gray-600">Click to upload</span>
                  <p className="text-sm text-gray-400">PNG or JPG</p>
                  <label className="bg-primary text-white px-3 py-1 mt-1 rounded cursor-pointer">
                  اختر ملف
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setLogoImage(e.target.files[0])}
                      className="hidden"
                    />
                  </label>
                </div>
                {errors.logoImage && (
                  <p className="text-red-500 text-sm mt-1">{errors.logoImage}</p>
                )}
              </div>

            </div>
            {/* location */}
            {/* <div className='flex gap-8'>
              <div className='flex flex-1 justify-between border-b border-gray-300 pb-5'>
                <label htmlFor="service" className='text-gray-500'>موقع الخدمة حسب المديرية</label>
                <select
                  name="service"
                  value={''}
                  onChange={''}
                  className=''
                  >
                  <option value=""/>
                  <option value={''}></option>
                  <option value={''}></option>
                  <option value={''}></option>
                </select>
              </div>
              <div className='flex flex-1 justify-between border-b border-gray-300 pb-5'>
                <label htmlFor="service" className='text-gray-500'>موقع الخدمة حسب الشارع</label>
                <select
                  name="service"
                  value={''}
                  onChange={''}
                  className=''
                  >
                  <option value=""/>
                  <option value={''}></option>
                  <option value={''}></option>
                  <option value={''}></option>
                </select>
              </div>
            </div>
            <h3 className='font-normal'>لتحديد موقع خدمتك بشكل أدق استخدم الخريطة</h3>
            <div>map</div> */}
          </fieldset>
        {/* contact info */}
          <fieldset className='flex flex-col justify-center w-full mb-10'>
            <legend className='text-lg font-normal text-center mb-10'>معلومات التواصل:</legend>
            <div className='flex gap-3 border-b border-gray-200 mt-5'>
              <PhoneIcon className='h-7 text-primary border-l border-gray-300 py-1 pl-3.5'/>
              <input placeholder='رقم الهاتف' value={phone} onChange={(e) => setPhone(e.target.value)} className='w-full focus:outline-none pb-5' />
            </div>
            {errors.phone && <p className="text-red-500 text-sm">{errors.phone}</p>}
            <div className='flex gap-3 border-b border-gray-200 mt-5'>
              <FontAwesomeIcon icon={faWhatsapp} size='lg' className='text-primary border-l border-gray-300 pl-3 py-1' />
              <input placeholder='رقم الواتساب' value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className='w-full focus:outline-none pb-5' />
            </div>
            {errors.whatsapp && <p className="text-red-500 text-sm">{errors.whatsapp}</p>}
           
          </fieldset>
        {/* work info */}
          <fieldset>
            <AddWH
              ref={workHoursRef}
              value={workHours}
              onChange={setWorkHours}
            />


          </fieldset>
        {/* submit button */}
          <button type='submit' className='rounded-lg text-base border border-primary-600 text-primary-600 self-center px-8 py-2 cursor-pointer'>
            اضف الخدمة
          </button>
        </form>
      </div>
       <ToastContainer
        position="top-center"
        autoClose={false}
        hideProgressBar={false}
        closeButton={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default Create