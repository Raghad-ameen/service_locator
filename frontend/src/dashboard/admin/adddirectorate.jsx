function AddDirectorate() {
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    await axios.post("/api/directorates/", { name });
    alert("تم إضافة المديرية");
  };

  return (
    <div>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم المديرية" />
      <button onClick={handleSubmit}>حفظ</button>
    </div>
  );
};

function AddStreet() {
  const [name, setName] = useState("");
  const [directorateId, setDirectorateId] = useState("");
  const [directorates, setDirectorates] = useState([]);

  useEffect(() => {
    axios.get("/api/directorates/").then(res => setDirectorates(res.data));
  }, []);

  const handleSubmit = async () => {
    await axios.post("/api/streets/", { name, directorate_id: directorateId });
    alert("تم إضافة الشارع مع الإحداثيات");
  };

  return (
    <div>
      <select onChange={e => setDirectorateId(e.target.value)}>
        <option>اختر المديرية</option>
        {directorates.map(d => (
          <option key={d.id} value={d.id}>{d.name}</option>
        ))}
      </select>
      <input value={name} onChange={e => setName(e.target.value)} placeholder="اسم الشارع" />
      <button onClick={handleSubmit}>حفظ</button>
    </div>
  );
}
export {AddDirectorate, AddStreet}