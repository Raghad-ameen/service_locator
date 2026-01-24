import {useState, useEffect} from 'react'
import { useLocation } from "react-router-dom";
import { PlusIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import {PencilIcon, TrashIcon} from '../../component/icons'
import axios from 'axios';
import { toast } from "react-toastify";
import ConfirmToast from "../../component/ConfirmToast";


const Categories = () => {
  const location = useLocation();
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState(null);
  const [categories, setCategories] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const MAX_LENGTH = 150;

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const updatedSearch = queryParams.get("q") || "";
    if (updatedSearch !== searchTerm) {
      setSearchTerm(updatedSearch);
    }
  }, [location.search]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const fetchCategories = async () => {
      try {
        const query = searchTerm.trim();
        const url = query
          ? `https://service-locator-9aja.onrender.com/api/services/categories/?search=${encodeURIComponent(query)}`
          : `https://service-locator-9aja.onrender.com/api/services/categories/`;

        const res = await axios.get(url, {
          headers: { Authorization: `Token ${token}` }
        });

        setCategories(res.data);
      } catch (err) {
        console.error("خطأ في جلب الأقسام:", err);
      }
    };

    fetchCategories();
  }, [searchTerm]);


  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const errors = {};

    // التحقق من الاسم
    if (!newCategoryName.trim()) {
      errors.name = 'الاسم مطلوب';
    }

    // التحقق من الوصف
    if (!newCategoryDescription.trim()) {
      errors.description = 'الوصف مطلوب';
    }

    // التحقق من الأيقونة (مطلوبة فقط عند الإضافة)
    if (!editingCategory && !newCategoryIcon) {
      errors.icon = 'يرجى اختيار أيقونة للقسم';
    } else if (newCategoryIcon) {
      const allowedTypes = ['image/png', 'image/svg+xml'];
      if (!allowedTypes.includes(newCategoryIcon.type)) {
        errors.icon = 'يُسمح فقط برفع ملفات PNG أو SVG';
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setFormErrors({});

    const formData = new FormData();
    formData.append('name', newCategoryName);
    formData.append('description', newCategoryDescription);
    if (newCategoryIcon) formData.append('icon', newCategoryIcon);

    try {
      if (editingCategory) {
        // تعديل
        const res = await axios.patch(
          `https://service-locator-9aja.onrender.com/api/services/categories/${editingCategory.id}/`,
          formData,
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setCategories(
          categories.map((cat) =>
            cat.id === editingCategory.id ? res.data : cat
          )
        );
      } else {
        // إضافة
        const res = await axios.post(
          'https://service-locator-9aja.onrender.com/api/services/categories/',
          formData,
          {
            headers: {
              Authorization: `Token ${token}`,
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        setCategories((prev) => [...prev, res.data]);
      }

      handleCloseModal();
    } catch (error) {
    if (error.response && error.response.data) {
      let msg = error.response.data.name?.[0] || "حدث خطأ غير متوقع";

      // تحويل الرسالة للعربية
      if (msg.includes("already exists")) {
        msg = "احدى المعلومات المدخلة موجودة بالفعل";
      }

      setErrorMessage(msg);
    } else {
      setErrorMessage("فشل الاتصال بالخادم");
    }
  }
};

  const handleCloseModal = () => {
    setShowCategoryModal(false);
    setNewCategoryName('');
    setNewCategoryDescription('');
    setNewCategoryIcon(null);
    setFormErrors({});
    setEditingCategory(null); // 👈 مهم
  };


  const handleDeleteCategory = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`https://service-locator-9aja.onrender.com/api/services/categories/${id}/`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setCategories(categories.filter((cat) => cat.id !== id));
    } catch (err) {
      console.error('خطأ في حذف القسم:', err.response?.status, err.response?.data || err.message);
    }
  };

  const showConfirmToast = ({ message, onConfirm }) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          icon={<TrashIcon/>}
          title="حذف قسم"
          message={message}
          confirmText="حذف"
          cancelText="إلغاء"
          onConfirm={async () => {
            await onConfirm();
            closeToast();
          }}
          onCancel={closeToast}
        />
      ),
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
      }
    );
  };


  return (
    <div className='flex flex-col text-secondary-900 p-6 font-["Montserrat-Arabic"] text-[14px]'>
      <div className='flex justify-between px-4'>
        <h1 className='m-4 text-lg text-primary-600 font-normal'>إدارة الأقسام</h1>
        <button onClick={() => setShowCategoryModal(true)} className='flex h-fit items-center gap-2 cursor-pointer text-primary-600 bg-linear-to-l from-primary/10 to-primary/50 transition-colors duration-400 ease-in transform hover:from-primary/50 hover:to-primary/10  px-4 py-2.5 rounded-full'>
          <PlusIcon className='w-5'/>
           قسم جديد
        </button>
      </div>
      <div className='grid grid-cols-5 gap-2 auto-rows-min mt-10 px-10'>
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat.id} className='p-4 flex flex-col justify-center items-center gap-6 border border-primary-50 shadow-[0_0_8px] shadow-primary-50 rounded-2xl'>
              <div className='bg-primary-50 p-2 rounded-lg w-fit h-fit'>
                <img src={cat.icon} alt={cat.name} className='w-8 h-8 object-contain' />
              </div>
              <h3 className='h-6'>{cat.name}</h3>
              <p className='w-fit h-20 text-center text-gray-500 font-light wrap-anywhere'>{cat.description}</p>
              <div className='flex self-end gap-2 items-center h-10'>
                <TrashIcon OnClick={() =>showConfirmToast({message: `هل أنت متأكد من حذف قسم "${cat.name}"؟`, onConfirm: () => handleDeleteCategory(cat.id),})} className='cursor-pointer' />
                <PencilIcon 
                  OnClick={() => { 
                    setEditingCategory(cat);
                    setNewCategoryName(cat.name);
                    setNewCategoryDescription(cat.description);
                    setNewCategoryIcon(null);
                    setShowCategoryModal(true);
                    setErrorMessage("");
                  }} 
                  className='cursor-pointer' />
              </div>
            </div>
          ))) : (<p className="col-span-5 text-center text-gray-500 text-lg font-extralight">لا توجد عناصر تتطابق بحثك "{searchTerm}"</p>
        )}
      </div>

      {showCategoryModal && (
        <div onClick={(e) => { if (e.target === e.currentTarget) handleCloseModal(); }} className="fixed inset-0 bg-black/20 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-lg w-[50%]">
            <div className='flex justify-between'>
              <h2 className="mb-4 text-base">{editingCategory ? 'تعديل القسم' : 'أضف قسم جديد'}</h2>
              <XMarkIcon type="button" onClick={() => handleCloseModal()} className="w-7 h-7 text-gray-500 hover:text-primary cursor-pointer hover:bg-primary-50/40 p-1 rounded-full"/>
            </div>
            {errorMessage && (
              <p className="text-red-500 text-sm mt-2">{errorMessage}</p>
            )}
            <form onSubmit={handleSaveCategory} className='py-4 px-6 flex flex-col gap-6'>
              <div onClick={() => document.getElementById('addicon').click()} className="w-fit cursor-pointer flex items-center gap-1 text-primary-600">
                <PlusCircleIcon className='w-6 h-6'/>
                <label className="cursor-pointer">اضف أيقونة للقسم</label>
                <input 
                  id='addicon' 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewCategoryIcon(e.target.files[0])}
                  className="w-full hidden"
                />
              </div>
              {formErrors.icon && <p className="text-red-500 text-xs -mt-5 mr-1">{formErrors.icon}</p>}
              <div className="flex items-center gap-4">
                <label className="mb-1 text-gray-600 font-light">الاسم</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                />
              </div>
              {formErrors.name && <p className="text-red-500 text-xs -mt-4 mr-1">{formErrors.name}</p>}
              <div className='flex flex-col gap-2'>
                <label className="text-gray-600 font-light">الوصف</label>
                <textarea
                  value={newCategoryDescription}
                  maxLength={MAX_LENGTH}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {MAX_LENGTH - newCategoryDescription.length} حرف
                </p>
                {formErrors.description && <p className="text-red-500 text-xs">{formErrors.description}</p>}
              </div>
              <button type="submit" className="w-fit self-end bg-primary text-white px-4 py-2 rounded hover:bg-primary-700">{editingCategory ? 'حفظ التعديلات' : 'إضافة'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories