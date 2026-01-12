import React from "react";
import { toast } from "react-toastify";

const ToastMess = ({ closeToast, toastId, handleDeleteAccount }) => {
  return (
    <div className="flex flex-col gap-6 font-['Montserrat-Arabic'] font-light text-[15px] mr-0!">
        <span className='pt-6'>هل أنت متأكد أنك تريد حذف حسابك نهائياً ؟</span>
        <div className="flex gap-4 justify-end">
        <button onClick={() => {handleDeleteAccount(); toast.dismiss(toastId);}} className="bg-red-600 cursor-pointer text-white px-3 py-1 rounded-md">حذف</button>
        <button onClick={closeToast} className="bg-gray-200 cursor-pointer text-black px-3 py-1 rounded-md">إلغاء</button>
        </div>
    </div>
  )
}
const ToastSuccess = ({ onConfirm }) => {
  return (
    <div className="flex flex-col gap-6 font-['Montserrat-Arabic'] text-[15px] text-center">
      <span className="pt-6 mx-5 my-1 font-medium text-gray-600">تم ارسال معلومات خدمتك بنجاح  <br/> سيتم مراجعة معلوماتك و التواصل معك باقرب وقت</span>
      <button onClick={onConfirm} className="bg-primary text-white py-2 rounded-md cursor-pointer">
        تم
      </button>
    </div>
  );
};
export  {ToastMess, ToastSuccess}