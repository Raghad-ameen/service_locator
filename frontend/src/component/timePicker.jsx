import { useState, useRef, useEffect } from "react";

export default function TimePickerCustom({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  const hours = Array.from({ length: 12 }, (_, i) =>
    String(i + 1).padStart(2, "0")
  );
  const minutes = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];
  const periods = ["AM", "PM"];

  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("PM");

  // 🔥 دالة التحويل إلى 24 ساعة
  function convertTo24(hour, minute, period) {
    let h = parseInt(hour, 10);
    if (period === "AM") {
      if (h === 12) h = 0;
    } else {
      if (h !== 12) h += 12;
    }
    return `${String(h).padStart(2, "0")}:${minute}`;
  }

  useEffect(() => {
    function clickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", clickOutside);
    return () => document.removeEventListener("mousedown", clickOutside);
  }, []);

  // 🔥 return وقت جاهز للباك
  useEffect(() => {
    if (onChange) onChange(convertTo24(hour, minute, period));
  }, [hour, minute, period]);

  return (
    <div ref={wrapperRef} className="relative w-[160px] font-['Montserrat-Arabic'] font-light text-[14px]">
      {/* INPUT */}
      <div
        onClick={() => setOpen(!open)}
        className={`border border-primary text-primary-700 px-3 py-2 rounded-md text-center w-full cursor-pointer bg-white transition-all duration-150 ${
          open ? "border-primary shadow-sm scale-[1.02]" : ""
        }`}
      >
        {hour}:{minute} {period}
      </div>

      {/* DROPDOWN */}
      <div
        className={`absolute left-0 mt-2 w-full bg-white border border-primary/30 rounded-lg shadow-lg p-2 z-50 flex justify-between transition-all duration-200 ease-out origin-top ${
          open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"
        }`}
      >
        {/* MINUTES */}
        <div className="h-40 overflow-y-auto text-center flex-1 no-scrollbar">
          {minutes.map((m) => (
            <div
              key={m}
              onClick={() => setMinute(m)}
              className={`py-1 cursor-pointer ${
                minute === m ? "bg-primary/50 text-white font-bold" : "hover:bg-primary-50"
              }`}
            >
              {m}
            </div>
          ))}
        </div>

        {/* HOURS */}
        <div className="h-40 overflow-y-auto text-center flex-1 no-scrollbar">
          {hours.map((h) => (
            <div
              key={h}
              onClick={() => setHour(h)}
              className={`py-1 cursor-pointer ${
                hour === h ? "bg-primary/50 text-white font-bold" : "hover:bg-primary-50"
              }`}
            >
              {h}
            </div>
          ))}
        </div>

        {/* PERIOD */}
        <div className="h-40 overflow-y-auto text-center flex-1 no-scrollbar">
          {periods.map((p) => (
            <div
              key={p}
              onClick={() => setPeriod(p)}
              className={`py-1 cursor-pointer ${
                period === p ? "bg-primary/50 text-white font-bold" : "hover:bg-primary-50"
              }`}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
