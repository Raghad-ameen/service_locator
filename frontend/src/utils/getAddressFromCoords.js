// utils/getAddressFromCoords.js
export const getAddressFromCoords = async (lat, lon) => {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=ar`
    );
    const data = await res.json();
    return data.address; // يحتوي على street, suburb, city, etc.
  } catch (err) {
    console.error("خطأ في جلب العنوان:", err);
    return null;
  }
};
