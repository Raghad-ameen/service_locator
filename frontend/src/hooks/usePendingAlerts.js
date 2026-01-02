import { useEffect, useRef, useState } from "react";

export function usePendingAlerts({ token, intervalMs = 30000 }) {
  const [pending, setPending] = useState(0);
  const prevRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    const fetchCount = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/services/pending-count/", {
          headers: { Authorization: `Token ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const count = Number(data?.pending ?? 0);

        setPending(count);

        if (prevRef.current !== null && count > prevRef.current) {
          window.dispatchEvent(
            new CustomEvent("NEW_PENDING_REQUEST", { detail: { newCount: count } })
          );
        }
        prevRef.current = count;
      } catch (err) {
        console.error("خطأ في جلب عدد الخدمات:", err);
      }
    };

    fetchCount();
    const timer = setInterval(fetchCount, intervalMs);
    return () => clearInterval(timer);
  }, [token, intervalMs]);

  return { pending };
}
