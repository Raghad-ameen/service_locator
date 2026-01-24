import axios from "axios";
import { useState, useEffect } from "react";
import { PlusIcon, PlusCircleIcon, XMarkIcon,ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { PencilIcon, TrashIcon } from "../../component/icons";
import { toast } from "react-toastify";
import ConfirmToast from '../../component/ConfirmToast';

const ProductsPage = () => {

  const [service, setService] = useState(null);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [existingImages, setExistingImages] = useState([]);
  const [deletedImageIds, setDeletedImageIds] = useState([]);
  const [newImages, setNewImages] = useState([]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [errors, setErrors] = useState({
    name: "",
    price: "",
    images: "",
  });

  // ================== جلب المنتجات ==================
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchService = async () => {
      try {
        const res = await axios.get(
          "https://service-locator-9aja.onrender.com/api/services/service/my_service/",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        setService(res.data);
      } catch (err) {
        console.error("خطأ في جلب الخدمة:", err);
      }
    };

    if (token) fetchService();
  }, []);

  useEffect(() => {
    if (!service?.id) return;

    const token = localStorage.getItem("token");

    const fetchProducts = async () => {
      try {
        const res = await axios.get(
          `https://service-locator-9aja.onrender.com/api/services/products/?service=${service.id}`,
          { headers: { Authorization: `Token ${token}` } }
        );
        setProducts(res.data);
      } catch (err) {
        console.error("خطأ في تحميل المنتجات:", err);
      }
    };

    fetchProducts();
  }, [service]);

  // ================== فتح مودال إضافة ==================
  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setDesc("");
    setPrice("");
    setNewImages([]);
    setShowModal(true);
    setExistingImages("");
  };

  // ================== فتح مودال تعديل ==================
  const openEditModal = (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDesc(prod.description);
    setPrice(prod.price);

    setExistingImages(prod.images); // صور الباك
    setDeletedImageIds([]);          // لا شيء محذوف
    setNewImages([]);                // لا صور جديدة

    setShowModal(true);
  };

  const validateForm = () => {
    const newErrors = {
      name: "",
      price: "",
      images: "",
    };

    // الاسم
    if (!name.trim()) {
      newErrors.name = "اسم المنتج مطلوب";
    }

    // السعر
    if (!price || Number(price) <= 0) {
      newErrors.price = "السعر مطلوب ويجب أن يكون أكبر من صفر";
    }

    // الصور
    if (!editingProduct) {
      // إضافة
      if (newImages.length === 0) {
        newErrors.images = "يجب إضافة صورة واحدة على الأقل";
      }
    } else {
      // تعديل
      if (existingImages.length === 0 && newImages.length === 0) {
        newErrors.images = "يجب أن يحتوي المنتج على صورة واحدة على الأقل";
      }
    }

    setErrors(newErrors);

    // لو في أي خطأ رجّع false
    return !Object.values(newErrors).some((err) => err !== "");
  };

  // ================== حفظ المنتج ==================
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", desc);
    formData.append("price", price);

    newImages.forEach((file) => {
      formData.append("photos", file);
    });

    try {
      // ✏️ تعديل
      if (editingProduct) {
        deletedImageIds.forEach((id) => {
          formData.append("deleted_images", id);
        });

        await axios.patch(
          `https://service-locator-9aja.onrender.com/api/services/products/${editingProduct.id}/`,
          formData,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }
      // ➕ إضافة
      else {
        await axios.post(
          "https://service-locator-9aja.onrender.com/api/services/products/",
          formData,
          {
            headers: {
              Authorization: `Token ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      closeModal();
      window.location.reload();
    } catch (err) {
      console.error("خطأ في الحفظ:", err.response?.data || err);
    }
  };


  // ================== حذف المنتج ==================
  const deleteProduct = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(
      `https://service-locator-9aja.onrender.com/api/services/products/${id}/`,
      { headers: { Authorization: `Token ${token}` } }
    );

    setProducts(products.filter((p) => p.id !== id));
  };

  const closeModal = () => {
    setShowModal(false);
    setNewImages([]);
    setDeletedImageIds([]);
  };

  const showConfirmToast = ({message, onConfirm}) => {
    toast(
      ({ closeToast }) => (
        <ConfirmToast
          icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-600" />}
          title ="حذف منتج"
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
    <div className="">
      {/* ---------------------- الهيدر ---------------------- */}
      <div className="flex justify-between items-center px-4 my-8 mx-5">
        <h1 className="text-lg text-primary-600 font-normal">إدارة المنتجات</h1>
        <button onClick={openAddModal} className="flex h-fit items-center gap-2 cursor-pointer text-primary-600 bg-linear-to-l from-primary/10 to-primary/50 px-4 py-2.5 rounded-full">
          <PlusIcon className="w-5" />
          منتج جديد
        </button>
      </div>

      {/* ---------------------- جدول المنتجات ---------------------- */}
      <div className="p-10">
        <table className="w-full">
          {products.length > 0 && (
            <thead>
              <tr className="text-center flex text-primary p-2 bg-primary-50/30 rounded">
                <th className="p-2 flex-1">الصورة</th>
                <th className="p-2 flex-1">الاسم</th>
                <th className="p-2 flex-2">الوصف</th>
                <th className="p-2 flex-1">السعر</th>
                <th className="p-2 flex-1" />
              </tr>
            </thead>
          )}

          <tbody>
            {products.length > 0 ? (
              products.map((prod) => (
                <tr
                  key={prod.id}
                  className="text-center py-2 border-b border-primary/30 flex items-center justify-between my-4"
                >
                  <td className="p-2 flex-1">
                    <img
                      src={prod.images[0]?.photo}
                      onClick={() => { setExistingImages(prod.images); setShowModal("preview"); }}
                      className="w-14 h-14 rounded cursor-pointer object-cover mx-auto"
                    />
                  </td>

                  <td className="p-2 flex-1">{prod.name}</td>
                  <td className="p-2 flex-2">{prod.description}</td>
                  <td className="p-2 flex-1">{prod.price} ريال</td>

                  <td className="p-2 flex-1 flex gap-4 items-center justify-center">
                    <PencilIcon
                      OnClick={() => openEditModal(prod)}
                      className="cursor-pointer"
                    />

                    <TrashIcon
                      OnClick={() =>showConfirmToast({message: "هل أنت متأكد من انك تريد حذف هذا المنتج ؟", onConfirm: () => deleteProduct(prod.id),}) }
                      className="cursor-pointer"
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-gray-500 py-6">
                  ليس هناك منتجات للعرض
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ---------------------- مودال إضافة/تعديل ---------------------- */}
      {showModal === true && (
        <div
          className="fixed inset-0 bg-black/20 flex justify-center items-center z-50"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div className="bg-white rounded-lg p-6 shadow-lg w-[50%]">
            <div className="flex justify-between">
              <h2 className="mb-4 text-base">
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h2>

              <XMarkIcon
                className="w-7 h-7 text-gray-500 cursor-pointer"
                onClick={closeModal}
              />
            </div>
            {/* صور المنتج الحالية عند التعديل */}
            {existingImages.length > 0 && (
              <div className="grid grid-cols-8 gap-4 my-4">
                {existingImages.map((img) => (
                  <div key={img.id} className="relative">
                    <img
                      src={img.photo}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <XMarkIcon
                      className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                      onClick={() => {
                        setDeletedImageIds((prev) => [...prev, img.id]);
                        setExistingImages((prev) =>
                          prev.filter((i) => i.id !== img.id)
                        );
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
            {/* الصورة المختارة الجديدة */}
            {newImages.length > 0 && (
              <div className="grid grid-cols-8 gap-4 my-4">
                {newImages.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      className="w-20 h-20 rounded object-cover"
                    />
                    <XMarkIcon
                      className="absolute top-1 left-1 w-5 h-5 bg-red-500 text-white rounded-full p-1 cursor-pointer"
                      onClick={() =>
                        setNewImages((prev) => prev.filter((_, i) => i !== index))
                      }
                    />
                  </div>
                ))}
              </div>
            )}

            {/* فورم */}
            <form className="py-4 px-6 flex flex-col gap-6" onSubmit={handleSaveProduct}>
              {/* رفع الصور */}
              <div
                onClick={() => document.getElementById("addPhotos").click()}
                className="w-fit cursor-pointer flex items-center gap-1 text-primary-600"
              >
                <PlusCircleIcon className="w-6 h-6" />
                <label className="cursor-pointer">اضف صور للمنتج</label>

                <input
                  id="addPhotos"
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setNewImages((prev) => [...prev, ...files]);
                  }}
                />
              </div>
              {errors.images && (
                <span className="text-xs text-red-500 -mt-4">{errors.images}</span>
              )}
              {/* الاسم */}
              <div className="flex items-center gap-4">
                <label>الاسم</label>
                <input
                  type="text"
                  className="w-full border rounded-lg px-3 py-2"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              {errors.name && (
                <span className="text-xs text-red-500 -mt-4">{errors.name}</span>
              )}
              {/* الوصف */}
              <div className="flex flex-col">
                <label>الوصف</label>
                <textarea
                  className="border rounded-lg px-3 py-2"
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                />
              </div>
              {/* السعر */}
              <div className="flex items-center gap-4">
                <label>السعر</label>
                <input
                  type="number"
                  className="w-full border rounded-lg px-3 py-2"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />

              </div>
              {errors.price && (
                <span className="text-xs text-red-500 -mt-4">{errors.price}</span>
              )}
              <button className="w-fit self-end bg-primary text-white px-4 py-2 rounded">
                {editingProduct ? "حفظ التعديلات" : "إضافة"}
              </button>
            </form>
          </div>
        </div>
      )}
      {/* ---------------------- مودال عرض الصور ---------------------- */}
      {showModal === "preview" && (
        <div
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
          className="fixed inset-0 bg-black/30 flex justify-center items-center z-50"
        >
          <div className="bg-white p-6 rounded-xl w-fit">
            <div className="flex justify-between mb-4">
              <h2 className="text-base">صور المنتج</h2>

              <XMarkIcon
                onClick={() => setShowModal(false)}
                className="w-7 h-7 cursor-pointer p-1 rounded-full hover:bg-primary-50"
              />
            </div>

            <div className={`grid gap-4 w-fit grid-cols-${Math.min(existingImages.length, 4)}`}>
              {existingImages.map((img) => (
                <img
                  key={img.id}
                  src={img.photo}
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
