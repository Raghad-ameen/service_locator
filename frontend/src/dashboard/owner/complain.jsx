const complaints = [
  {
    id: 1,
    name: "صالح النوار",
    avatar: "https://i.pravatar.cc/40?img=1",
    message:
      "المشكلة ما بين سعر معقول مقابل مسميات ما لها معنى، وتقلقنا وساعدنا الله الذي نرجو أخذها بعين الاعتبار",
  },
  {
    id: 2,
    name: "سارة الصعيدي",
    avatar: "https://i.pravatar.cc/40?img=2",
    message:
      "الخدمة جيدة لكن نحتاج سرعة أكثر في الرد ومعالجة الشكاوى",
  },
  {
    id: 3,
    name: "صالح النوار",
    avatar: "https://i.pravatar.cc/40?img=3",
    message:
      "أتمنى إضافة فلترة أفضل وتحسين تجربة المستخدم",
  },
];

const ComplaintsPage = ()=> {
  return (
    <div dir="rtl" className="flex flex-col w-full bg-primary-50/30 h-full font-['Montserrat-Arabic'] py-8 px-10">
      <h1 className="text-xl font-normal mb-6">
        الاقتراحات و الشكاوي
      </h1>
      <div className="bg-white rounded-2xl shadow p-5 w-full">
        {complaints.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 not-last-of-type:border-b-2 border-gray-200"
          >
            <img
              src={item.avatar}
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                {item.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default ComplaintsPage;
