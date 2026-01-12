import {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import TimePicker from "../component/timePicker";

const DAYS = [
  "السبت",
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
];

const AddWH = forwardRef(({ value, onChange }, ref) => {
  const [selectedDays, setSelectedDays] = useState([]);
  const [mode, setMode] = useState("unified");
  const [unified, setUnified] = useState({ from: "", to: "" });
  const [customTimes, setCustomTimes] = useState({});
  const [errors, setErrors] = useState({});

  /* ===============================
     تحميل القيم القادمة من الأب (مرة عند التغيير)
     =============================== */
  useEffect(() => {
    if (!value) return;

    setSelectedDays(value.days ?? []);
    setMode(value.mode ?? "unified");
    setUnified(value.unified ?? { from: "", to: "" });
    setCustomTimes(value.customTimes ?? {});
  }, [value]);

  /* ===============================
     إرسال التحديث للأب (يدوي)
     =============================== */
  const updateParent = (data) => {
    onChange?.({
      days: data.days ?? selectedDays,
      mode: data.mode ?? mode,
      unified: data.unified ?? unified,
      customTimes: data.customTimes ?? customTimes,
    });
  };

  /* ===============================
     التحقق (يُنادى من الأب)
     =============================== */
  const validate = () => {
    let newErrors = {};

    if (selectedDays.length === 0) {
      newErrors.days = "اختر يوم واحد على الأقل";
    }

    if (mode === "unified") {
      if (!unified.from || !unified.to) {
        newErrors.unified = "الوقت الموحد مطلوب";
      } else if (unified.from >= unified.to) {
        newErrors.unified = "وقت البداية يجب أن يكون قبل النهاية";
      }
    }

    if (mode === "custom") {
      selectedDays.forEach((day) => {
        if (!customTimes[day]?.from || !customTimes[day]?.to) {
          newErrors[`time_${day}`] = `وقت (${day}) مطلوب`;
        } else if (customTimes[day].from >= customTimes[day].to) {
          newErrors[`time_${day}`] =
            `وقت البداية يجب أن يكون قبل النهاية`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useImperativeHandle(ref, () => ({ validate }));

  /* ===============================
     UI
     =============================== */
  return (
    <div className="flex flex-col gap-10 w-full mb-10">
      <legend className="text-lg font-normal text-center mb-6">
        معلومات الدوام
      </legend>

      {/* الأيام */}
      <div className="flex flex-col gap-3">
        <label className="text-gray-600">اختر أيام العمل:</label>
        {errors.days && (
          <p className="text-red-500 text-sm">{errors.days}</p>
        )}

        <div className="grid grid-cols-3 gap-3">
          {DAYS.map((day) => (
            <button
              type="button"
              key={day}
              onClick={() => {
                const newDays = selectedDays.includes(day)
                  ? selectedDays.filter((d) => d !== day)
                  : [...selectedDays, day];

                setSelectedDays(newDays);
                updateParent({ days: newDays });
              }}
              className={`px-3 py-2 rounded-lg border text-center cursor-pointer
                ${
                  selectedDays.includes(day)
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-gray-300 bg-white"
                }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* نوع الدوام */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === "unified"}
            onChange={() => {
              setMode("unified");
              updateParent({ mode: "unified" });
            }}
            className="accent-primary"
          />
          <span>دوام موحد</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            checked={mode === "custom"}
            onChange={() => {
              setMode("custom");
              updateParent({ mode: "custom" });
            }}
            className="accent-primary"
          />
          <span>دوام مخصص لكل يوم</span>
        </label>
      </div>

      {/* دوام موحد */}
      {mode === "unified" && (
        <div>
          <div className="flex gap-10">
            <div className="flex items-center gap-2">
              <span>من</span>
              <TimePicker
                value={unified.from}
                onChange={(v) => {
                  const newUnified = { ...unified, from: v };
                  setUnified(newUnified);
                  updateParent({ unified: newUnified });
                }}
                className="border border-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <span>إلى</span>
              <TimePicker
                value={unified.to}
                onChange={(v) => {
                  const newUnified = { ...unified, to: v };
                  setUnified(newUnified);
                  updateParent({ unified: newUnified });
                }}
                className="border border-primary"
              />
            </div>
          </div>

          {errors.unified && (
            <p className="text-red-500 text-sm mt-2">{errors.unified}</p>
          )}
        </div>
      )}

      {/* دوام مخصص */}
      {mode === "custom" && selectedDays.length > 0 && (
        <div className="flex flex-col gap-5">
          {selectedDays.map((day) => (
            <div key={day}>
              <div className="flex items-center gap-6">
                <span className="w-20">{day}</span>

                <div className="flex items-center gap-2">
                  <span>من</span>
                  <TimePicker
                    value={customTimes[day]?.from || ""}
                    onChange={(v) => {
                      const newTimes = {
                        ...customTimes,
                        [day]: { ...customTimes[day], from: v },
                      };
                      setCustomTimes(newTimes);
                      updateParent({ customTimes: newTimes });
                    }}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span>إلى</span>
                  <TimePicker
                    value={customTimes[day]?.to || ""}
                    onChange={(v) => {
                      const newTimes = {
                        ...customTimes,
                        [day]: { ...customTimes[day], to: v },
                      };
                      setCustomTimes(newTimes);
                      updateParent({ customTimes: newTimes });
                    }}
                  />
                </div>
              </div>

              {errors[`time_${day}`] && (
                <p className="text-red-500 text-sm mt-1">
                  {errors[`time_${day}`]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default AddWH;
