import axios from "axios";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { PlusIcon, PlusCircleIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { PencilIcon, TrashIcon } from "../../component/icons";

const ProductsPage = () => {
  const location = useLocation();
  const serviceId = location.state?.service_id;

  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const [editingProduct, setEditingProduct] = useState(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [photos, setPhotos] = useState([]);

  const [errorMessage, setErrorMessage] = useState("");

  // ================== جلب المنتجات ==================
  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/api/services/products/?service=${serviceId}`,
          { headers: { Authorization: `Token ${token}` } }
        );
        setProducts(res.data);
      } catch (err) {
        console.error("خطأ في تحميل المنتجات:", err);
      }
    };

    fetchData();
  }, [serviceId]);

  // ================== فتح مودال إضافة ==================
  const openAddModal = () => {
    setEditingProduct(null);
    setName("");
    setDesc("");
    setPrice("");
    setPhotos([]);
    setShowModal(true);
  };

  // ================== فتح مودال تعديل ==================
  const openEditModal = async (prod) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDesc(prod.description);
    setPrice(prod.price);
    setPhotos([]);
    setShowModal(true);
  };

  // ================== حفظ المنتج ==================
  const handleSaveProduct = async (e) => {
    e.preventDefault();

    if (!name || !price) {
      setErrorMessage("الاسم والسعر مطلوبان");
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    formData.append("service", serviceId);
    formData.append("name", name);
    formData.append("description", desc);
    formData.append("price", price);

    photos.forEach((p) => formData.append("photos", p));

    try {
      if (editingProduct) {
        await axios.put(
          `http://127.0.0.1:8000/api/services/products/${editingProduct.id}/`,
          formData,
          { headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" } }
        );
      } else {
        await axios.post(
          "http://127.0.0.1:8000/api/services/products/",
          formData,
          { headers: { Authorization: `Token ${token}`, "Content-Type": "multipart/form-data" } }
        );
      }

      window.location.reload();
    } catch (err) {
      console.error("خطأ في الحفظ:", err);
    }
  };

  // ================== حذف صورة ==================
  const deleteImage = async (imageId) => {
    const token = localStorage.getItem("token");

    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/services/delete-image/${imageId}/`,
        { headers: { Authorization: `Token ${token}` } }
      );

      // تحديث صور المودال
      setEditingProduct((prev) => ({
        ...prev,
        images: prev.images.filter((img) => img.id !== imageId),
      }));

      // تحديث صور الجدول الرئيسي
      setProducts((prev) =>
        prev.map((p) =>
          p.id === editingProduct.id
            ? { ...p, images: p.images.filter((img) => img.id !== imageId) }
            : p
        )
      );
    } catch (err) {
      console.error("خطأ في حذف الصورة:", err);
    }
  };

  // ================== حذف المنتج ==================
  const deleteProduct = async (id) => {
    const token = localStorage.getItem("token");

    await axios.delete(
      `http://127.0.0.1:8000/api/services/products/${id}/`,
      { headers: { Authorization: `Token ${token}` } }
    );

    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* ---------------------- الهيدر ---------------------- */}
      <div className="flex justify-between px-4">
        <h1 className="m-4 text-lg text-primary-600 font-normal">إدارة المنتجات</h1>
        <button onClick={openAddModal} className="flex h-fit items-center gap-2 cursor-pointer text-primary-600 bg-gradient-to-l from-primary/10 to-primary/50 px-4 py-2.5 rounded-full">
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
                <th className="p-2 flex-[2]">الوصف</th>
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
                      onClick={() => {setPreviewImages(prod.images);setShowModal("preview");}}
                      className="w-14 h-14 rounded cursor-pointer object-cover mx-auto"
                    />
                  </td>

                  <td className="p-2 flex-1">{prod.name}</td>
                  <td className="p-2 flex-[2]">{prod.description}</td>
                  <td className="p-2 flex-1">{prod.price} ريال</td>

                  <td className="p-2 flex-1 flex gap-4 items-center justify-center">
                    <PencilIcon
                      OnClick={() => openEditModal(prod)}
                      className="cursor-pointer"
                    />

                    <TrashIcon
                      OnClick={() => deleteProduct(prod.id)}
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
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="bg-white rounded-lg p-6 shadow-lg w-[50%]">
            <div className="flex justify-between">
              <h2 className="mb-4 text-base">
                {editingProduct ? "تعديل المنتج" : "إضافة منتج جديد"}
              </h2>

              <XMarkIcon
                className="w-7 h-7 text-gray-500 cursor-pointer"
                onClick={() => setShowModal(false)}
              />
            </div>

            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

            {/* صور المنتج الحالية عند التعديل */}
            {editingProduct && editingProduct.images?.length > 0 && (
              <div className="grid grid-cols-8 w-fit gap-4 my-4">
                {editingProduct.images.map((img) => (
                  <div key={img.id} className="relative">
                    <img src={img.photo} className="w-20 h-20 rounded object-cover" />
                      <XMarkIcon className="absolute top-1 left-1 w-5 h-5 text-white cursor-pointer bg-red-500 rounded-full p-1" onClick={() => deleteImage(img.id)}/>
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
                  onChange={(e) => setPhotos([...e.target.files])}
                />
              </div>

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

            <div className={`grid gap-4 w-fit grid-cols-${Math.min(previewImages.length, 4)}`}>
              {previewImages.map((img) => (
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
