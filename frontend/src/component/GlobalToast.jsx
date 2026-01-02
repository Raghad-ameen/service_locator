import { useEffect, useState } from "react";

export default function GlobalToast() {
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    const onNewPending = (e) => {
      const { newCount } = e.detail || {};
      setMsg(`وصل طلب جديد. الطلبات المعلقة الآن: ${newCount}`);
      setTimeout(() => setMsg(null), 5000);
    };

    window.addEventListener("NEW_PENDING_REQUEST", onNewPending);
    return () => window.removeEventListener("NEW_PENDING_REQUEST", onNewPending);
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
      <div className="rounded-lg bg-slate-800 text-white shadow-xl px-4 py-3">
        {msg}
      </div>
    </div>
  );
}
