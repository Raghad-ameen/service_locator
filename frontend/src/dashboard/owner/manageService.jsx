import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {PencilIcon, TrashIcon} from "../../component/icons"
import {PlusCircleIcon} from "@heroicons/react/24/outline";
import AddWH from "../../component/addWH";
import TimePickerCustom from "../../component/timePicker";
const manageService = () => {
  const [service, setService] = useState(null);
  const [activeField, setActiveField] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const titleRef = useRef(null);
  const descriptionRef = useRef(null);
  const categoryRef = useRef(null);
  const emailRef = useRef(null);
  const phoneRef = useRef(null);
  const whatsappRef = useRef(null);
  const coverRef = useRef(null);
  const logoRef = useRef(null);
  const [showAddWH, setShowAddWH] = useState(false);
  const [newWorkHours, setNewWorkHours] = useState(null);
  const addWHRef = useRef();
  useEffect(() => {
  if (activeField === 'title' && titleRef.current) {
    titleRef.current.focus();
  }
  if (activeField === 'description' && descriptionRef.current) {
    descriptionRef.current.focus();
  }
  if (activeField === 'category' && categoryRef.current) {
    descriptionRef.current.focus();
  }
  if (activeField === 'email' && emailRef.current) {
    emailRef.current.focus();
  }
  if (activeField === 'phone' && phoneRef.current) {
    phoneRef.current.focus();
  }
  if (activeField === 'whatsapp' && whatsappRef.current) {
    whatsappRef.current.focus();
  }
}, [activeField]);

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

  useEffect(() => {
    fetchService();
  }, []);

  const fetchService = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(
        "http://127.0.0.1:8000/api/services/service/my_service/",
        {
          headers: { Authorization: `Token ${token}` },
        }
      );
      const data = res.data;
      data.work_schedules = data.work_schedules.map(ws => ({
        ...ws,
        _originalDay: ws.day,
      }));

      setService(res.data);
    } catch (err) {
      console.error("خطأ في تحميل الخدمة", err);
    }
  };

  const handleChange = (field, value) => {
    setService((prev) => {
      const updated = { ...prev, [field]: value };
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      data.append("title", service.title);
      data.append("description", service.description);
      data.append("email", service.email);
      data.append("phone", service.phone);
      data.append("whatsapp", service.whatsapp);
      data.append("category_id", service.category?.id || service.category);

      if (service.cover_image instanceof File) {
        data.append("cover_image", service.cover_image);
      }
      if (service.logo_image instanceof File) {
        data.append("logo_image", service.logo_image);
      }

      // 1️⃣ حفظ الخدمة
      await axios.patch(
        `http://127.0.0.1:8000/api/services/service/${service.id}/`,
        data,
        {
          headers: {
            Authorization: `Token ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // 2️⃣ حفظ الدوام

      for (const ws of service.work_schedules || []) {

        // 🆕 دوام جديد → POST
        if (ws._isNew) {
          await axios.post(
            "http://127.0.0.1:8000/api/services/work-schedules/",
            {
              service: service.id,
              day: ws.day,
              start_time: ws.start_time,
              end_time: ws.end_time,
            },
            { headers: { Authorization: `Token ${token}` } }
          );
          continue;
        }

        // ✏️ دوام قديم لكن لم يتغير → تجاهله
        if (!ws._changed) continue;

        // ✏️ دوام قديم وتغيّر → PATCH
        const payload = {
          start_time: ws.start_time,
          end_time: ws.end_time,
        };

        if (ws._originalDay && ws.day !== ws._originalDay) {
          payload.day = ws.day;
        }

        await axios.patch(
          `http://127.0.0.1:8000/api/services/work-schedules/${ws.id}/`,
          payload,
          { headers: { Authorization: `Token ${token}` } }
        );
      }

      alert("تم حفظ التعديلات ✅");
      setHasChanges(false);
      fetchService();
    } catch (err) {
      console.error("خطأ في الحفظ:", err.response?.data);
    }
  };

  const handleImageChange = (field, file) => {
    setService(prev => ({
      ...prev,
      [field]: file, // نخزن الملف فقط
    }));
    setHasChanges(true);
  };

  const handleWorkScheduleChange = (id, field, value) => {
    setService(prev => ({
      ...prev,
      work_schedules: prev.work_schedules.map(ws =>
        ws.id === id ? { ...ws, [field]: value, _changed: true } : ws
      )
    }));
    setHasChanges(true);
  };

  const handleDeleteWorkSchedule = async (id) => {
  if (!window.confirm("هل تريد حذف هذا اليوم؟")) return;

  try {
    const token = localStorage.getItem("token");

    // لو السجل محفوظ بالباك
    if (id) {
      await fetch(
        `http://127.0.0.1:8000/api/services/work-schedules/${id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Token ${token}`,
          },
        }
      );
    }

    // حدّث الواجهة مباشرة
    setService((prev) => ({
      ...prev,
      work_schedules: prev.work_schedules.filter((wh) => wh.id !== id),
    }));
  } catch (err) {
    console.error("خطأ في حذف الدوام", err);
  }
  };

  if (!service) return <p>لا توجد خدمة</p>;

  const infoRows = [
      {
        label: "نوع الخدمة",
        content: (
          <select
            ref={categoryRef}
            disabled={activeField !== "category"}
            value={service.category?.id || service.category || ""}
            onChange={(e) => handleChange("category", Number(e.target.value))}
            className={`focus:outline-none ${
              activeField === "category" ? "text-gray-900 appearance-auto cursor-pointer" : "text-gray-700 appearance-none pointer-events-none"
            }`}
          >
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        ),
        action: (
          <PencilIcon
            OnClick={() => setActiveField("category")}
            className="cursor-pointer"
          />
        ),
      },
      {
        label: "اسم الخدمة",
        content: (
          <input
            ref={titleRef}
            disabled={activeField !== "title"}
            value={service.title || ""}
            onChange={(e) => handleChange("title", e.target.value)}
            onBlur={() => setActiveField(null)}
            className={`focus:outline-none ${
              activeField === "title" ? "text-gray-900" : "text-gray-700"
            }`}
          />
        ),
        action: (
          <PencilIcon
            OnClick={() => setActiveField("title")}
            className="cursor-pointer"
          />
        ),
      },
      {
        label: "وصف الخدمة",
        content: (
          <input
            ref={descriptionRef}
            disabled={activeField !== "description"}
            value={service.description || ""}
            onChange={(e) => handleChange("description", e.target.value)}
            onBlur={() => setActiveField(null)}
            className={`focus:outline-none ${
              activeField === "description" ? "text-gray-900" : "text-gray-700"
            }`}
          />
        ),
        action: (
          <PencilIcon
            OnClick={() => setActiveField("description")}
            className="cursor-pointer"
          />
        ),
      },
    ];
  
  const contactFields = [
    { key: "email", label: "البريد الإلكتروني", type: "email" },
    { key: "phone", label: "رقم الهاتف", type: "text" },
    { key: "whatsapp", label: "رقم الواتس", type: "text" },
  ];

  return (
    <div className="my-10 font-['Montserrat-Arabic'] text-[14px] font-light">
      <form onSubmit={(e) => {e.preventDefault(); handleSave();}} className="w-full px-15 flex flex-col items-center gap-10">
      {/* /////////////////////////images//////////////////////////// */}
        <div className="w-full flex flex-col items-center">
          <div className="relative w-fit">
            <img src={
                service.cover_image instanceof File
                  ? URL.createObjectURL(service.cover_image)
                  : service.cover_image
              }
              className='h-60 w-150 rounded-xl'
            />
            <input
              type="file"
              accept="image/*"
              hidden
              ref={coverRef}
              onChange={(e) => handleImageChange("cover_image", e.target.files[0])}
            />
            <PencilIcon
              OnClick={() => coverRef.current.click()}
              className="absolute bottom-2 left-2 bg-white rounded-full p-1 border border-primary/30"
              imageclass="h-4 w-4"
            />
          </div>
          <div className="relative">
            <img src={
                service.logo_image instanceof File
                  ? URL.createObjectURL(service.logo_image)
                  : service.logo_image
              }
              className="h-20 w-20 rounded-full -mt-12"
            />
            <input
              type="file"
              accept="image/*"
              hidden
              ref={logoRef}
              onChange={(e) => handleImageChange("logo_image", e.target.files[0])}
            />
            <PencilIcon
              OnClick={() => logoRef.current.click()}
              className="absolute bottom-0 left-0 bg-white rounded-full p-1 border border-primary/30"
              imageclass="h-4 w-4"
            />
          </div>
        </div>
      {/* /////////////////////////service's info/////////////////// */}
        <div className="w-full">
          <h2 className="font-normal text-lg">معلومات الخدمة</h2>
          <div className="w-full border border-gray-300 rounded-xl flex flex-col mt-5 shadow-md">
            {infoRows.map((row, index) => (
              <div
                key={index}
                className="not-last-of-type:border-b border-gray-300 flex items-center gap-3"
              >
                <label className="border-l border-gray-300 w-50  h-15 pr-5 pt-5">
                  {row.label}
                </label>

                <div className="flex-1">
                  {row.content}
                </div>

                {row.action && (
                  <div className="ml-4">
                    {row.action}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* <div>
          <h2>الموقع</h2>
          <div></div>
        </div> */}

        <div className="w-full">
          <h2 className="font-normal text-lg">معلومات التواصل</h2>
          <div className="w-full border border-gray-300 rounded-xl flex flex-col mt-5 shadow-md">
            {contactFields.map((field) => (
              <div key={field.key} className="flex items-center gap-4 not-last-of-type:border-b border-gray-300">
                <label className="w-50 border-l border-gray-300 py-5 pr-5">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  ref={field.key === "email" ? emailRef : field.key === "phone" ? phoneRef : field.key === "whatsapp" ? whatsappRef : null}
                  value={service[field.key] || ""}
                  disabled={activeField !== field.key}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  onBlur={() => setActiveField(null)}
                  className={`flex-1 focus:outline-none
                    ${activeField === field.key
                      ? "text-gray-900"
                      : "text-gray-500"
                    }`}
                />
                <PencilIcon
                  OnClick={() => setActiveField(field.key)}
                  className="cursor-pointer ml-4"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="w-full">
          <h2 className="font-normal text-lg">معلومات الدوام</h2>
          <table className="mt-5 w-full shadow-md rounded-2xl overflow-hidden">
            <thead className="bg-gray-50 border-b border-gray-300">
              <tr className="">
                <th className="font-medium p-3 w-1/4 text-right border-l border-gray-300">اليوم</th> 
                <th className="font-medium text-right pr-12">ساعات الدوام</th> 
                <th className="p-3">
                  <PlusCircleIcon
                    className="h-6 w-6 text-gray-600 cursor-pointer"
                    onClick={() => setShowAddWH(true)}
                  />
                </th>
              </tr>
            </thead>
            <tbody>
              {service.work_schedules?.map((wh, index) => (
                <tr key={wh.id ?? `new-${index}`}>
                  <td className="font-medium p-3 w-1/4 border-l border-b border-gray-300">
                    <select
                      value={wh.day}
                      disabled={activeRowId !== wh.id}
                      onChange={(e) =>
                        handleWorkScheduleChange(wh.id, "day", e.target.value)
                      }
                      className={`focus:outline-none ${
                        activeRowId === wh.id
                          ? "text-gray-900 appearance-auto cursor-pointer"
                          : "text-gray-700 appearance-none pointer-events-none"
                      }`}
                    >
                      <option value="السبت">السبت</option>
                      <option value="الأحد">الأحد</option>
                      <option value="الاثنين">الاثنين</option>   {/* ← بدون همزة */}
                      <option value="الثلاثاء">الثلاثاء</option>
                      <option value="الأربعاء">الأربعاء</option>
                      <option value="الخميس">الخميس</option>
                      <option value="الجمعة">الجمعة</option>
                    </select>
                  </td>
                  <td className="py-3 text-right border border-gray-300 border-l-0">
                    <div className="flex items-center">
                      <TimePickerCustom
                        disabled={activeRowId !== wh.id}
                        value={wh.start_time?.slice(0, 5) || ""}
                        onChange={(value) =>
                          handleWorkScheduleChange(wh.id, "start_time", value)
                        }
                        className=""
                      />
                      <span className="mx-1">-</span>
                      <TimePickerCustom
                        disabled={activeRowId !== wh.id}
                        value={wh.end_time?.slice(0, 5) || ""}
                        onChange={(value) =>
                          handleWorkScheduleChange(wh.id, "end_time", value)
                        }
                        className=""
                      />
                    </div>
                  </td>
                  <td className="border-b border-gray-300">
                    <div className="flex gap-4">
                      <PencilIcon
                        OnClick={() => setActiveRowId(wh.id)}
                        className="cursor-pointer"
                      />
                      <TrashIcon 
                      OnClick={() => handleDeleteWorkSchedule(wh.id)}
                      className=""/>
                    </div>
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>

          {showAddWH && (
            <div onClick={() => setShowAddWH(false)} className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
              <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-xl p-6 w-[600px]">
                <h3 className="text-lg mb-4">إضافة دوام جديد</h3>
                <AddWH
                  ref={addWHRef}
                  value={newWorkHours}
                  onChange={setNewWorkHours}
                />
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    className="px-4 py-2 border border-gray-500 text-gray-700 rounded-lg cursor-pointer"
                    onClick={() => setShowAddWH(false)}
                  >
                    إلغاء
                  </button>

                  <button
                    className="px-4 py-2 bg-primary text-white rounded-lg cursor-pointer"
                    onClick={() => {
                      if (!addWHRef.current.validate()) return;

                      const payload =
                        newWorkHours.mode === "unified"
                          ? newWorkHours.days.map(day => ({
                              day,
                              start_time: newWorkHours.unified.from,
                              end_time: newWorkHours.unified.to,
                              _isNew: true,
                            }))
                          : newWorkHours.days.map(day => ({
                              day,
                              start_time: newWorkHours.customTimes[day].from,
                              end_time: newWorkHours.customTimes[day].to,
                              _isNew: true,
                            }));

                      setService(prev => ({
                        ...prev,
                        work_schedules: [...prev.work_schedules, ...payload],
                      }));

                      setHasChanges(true);
                      setShowAddWH(false);
                      setNewWorkHours(null);
                    }}
                  >
                    إضافة
                  </button>
                </div>
              </div>
            </div>
          )}
        <button
          type="submit"
          disabled={!hasChanges}
          className={`rounded-lg px-4 py-2 ${
            hasChanges
              ? "bg-primary text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          حفظ التعديلات
        </button>
      </form>
    </div>
  )
}

export default manageService