import React from 'react'
import { useLocation } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";
import { XMarkIcon } from '@heroicons/react/24/solid';

const ProductList = () => {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const serviceId = params.get("service");
    const [showModal, setShowModal] = useState(false);
    const [products, setProducts] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);
    

    useEffect(() => {
        axios
        .get(`http://127.0.0.1:8000/api/services/public/products/?service=${serviceId}`)
        .then(res => setProducts(res.data))
        .catch(err => console.log("خطأ في تحميل المنتجات:", err));
    }, [serviceId]);

  return (
    <div dir='rtl' className='mt-15 px-20'>
      <div className='grid grid-cols-5 gap-2'>
        {products.length > 0 ? (
            products.map(p => (
            <div key={p.id} className='mx-auto flex flex-col gap-1'>
                <img 
                    src={p.images?.[0]?.photo || default_image} 
                    onClick={() => {setPreviewImages(p.images); setShowModal("preview");}} 
                    className="w-50 h-40 rounded-2xl object-cover" alt=""
                />
                <h3 className='mt-2 text-lg'>{p.name}</h3>
                <p className='text-gray-500 text-sm w-40'>{p.description}</p>
                <p className='text-primary'>{p.price} ريال</p>
            </div>
            ))
        ) : (
            <p>لا توجد منتجات</p>
        )}
      </div>
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

            {/* 🔥 dynamic grid */}
            {(() => {
                const cols = Math.min(previewImages.length, 4);
                const colClass = {
                1: "grid-cols-1",
                2: "grid-cols-2",
                3: "grid-cols-3",
                4: "grid-cols-4",
                }[cols];

                return (
                <div className={`grid gap-4 w-fit ${colClass}`}>
                    {previewImages.map((img) => (
                    <img
                        key={img.id}
                        src={img.photo}
                        className="w-full h-32 object-cover rounded"
                    />
                    ))}
                </div>
                );
            })()}
            </div>
        </div>
        )}
    </div>
  )
}

export default ProductList