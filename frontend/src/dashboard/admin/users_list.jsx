import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import default_img from "../../../public/media/user_profile/default.png";
import {TrashIcon} from "../../component/icons"

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const location = useLocation(); 
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const updatedSearch = queryParams.get("q") || "";
    setSearchTerm(updatedSearch);
  }, [location.search]);

  //جلب بيانات المستخدم الحالي
  const fetchCurrentUser = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/users/user/", {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      if (!res.ok) throw new Error("فشل في جلب بيانات المستخدم");
      const user = await res.json();
      if (user.user_type !== "admin") {
        navigate("/");
      }
    } catch (err) {
      console.error("خطأ في التحقق من صلاحيات المستخدم:", err);
      navigate("/");
    }
  };
  // مراجعة بيانات المستخدم الحالي عند تحديث الصفحة
  useEffect(() => {
    fetchCurrentUser();
  }, []);

  //لجلب البيانات حسب البحث
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchData = async () => {
      const query = searchTerm.trim();

      const url = query
        ? `http://127.0.0.1:8000/api/users/search-users/?q=${encodeURIComponent(query)}`
        : `http://127.0.0.1:8000/api/users/users_list/`;

      try {
        const res = await fetch(url, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error("خطأ في جلب المستخدمين:", err);
      }
    };

    fetchData();
  }, [searchTerm]);

  // حذف المستخدم
  const deleteUser = async (userId) => {
    const token = localStorage.getItem("token");
    const confirmed = window.confirm("هل أنت متأكد أنك تريد حذف هذا المستخدم نهائيًا؟");

    if (!confirmed) return;

    await fetch(`http://127.0.0.1:8000/api/users/${userId}/delete_user/`, {
      method: "DELETE",
      headers: {
        Authorization: `Token ${token}`,
      },
    });

    // تحديث القائمة بعد الحذف
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userId));

    const currentUserId = localStorage.getItem("user_id");
    if (String(userId) === currentUserId) {
      localStorage.removeItem("token");
      localStorage.removeItem("user_id");
      localStorage.removeItem("user_type");
      navigate("/");
    }
  };

  // // تعيين ادمن \ تعيين كمستخدم عادي
  // const toggleAdminStatus = async (userId, isAdmin) => {
  //   const token = localStorage.getItem("token");
  //   const action = isAdmin ? "demote" : "promote";

  //   const confirmed = window.confirm(
  //     isAdmin
  //       ? "هل تريد إزالة صلاحيات المدير من هذا المستخدم؟"
  //       : "هل تريد منح صلاحيات المدير لهذا المستخدم؟"
  //   );

  //   if (!confirmed || !token) return;

  //   try {
  //     const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/${action}_admin/`, {
  //       method: "POST",
  //       headers: {
  //         Authorization: `Token ${token}`,
  //         "Content-Type": "application/json",
  //       },
  //     });

  //     if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

  //     const updatedUser = await res.json();
  //     // ✅ Get current user ID
  //     const currentUserId = parseInt(localStorage.getItem("user_id"), 10);

  //     // ✅ Update localStorage with new user info
  //     localStorage.setItem("user", JSON.stringify(updatedUser));

  //     // ✅ Update user in the list
  //     setUsers((prevUsers) =>
  //       prevUsers.map((u) => (u.id === userId ? updatedUser : u))
  //     );
  //     // window.location.reload();
  //     // ✅ If current user was demoted, log out and redirect
  //   } catch (err) {
  //     console.error("خطأ في تغيير صلاحيات المستخدم:", err);
  //   }
  // };

  return (
    <div dir="rtl" className="text-secondary-900 p-6 font-['Montserrat-Arabic'] text-[14px]">
      <h2 className="m-4 text-lg text-primary-600 font-normal">ادارة المستخدمين</h2>
      <div className="p-10">
        <table className="w-full">
        {users.length > 0 &&(
          <thead>
            <tr className="text-center flex text-primary p-2 bg-primary-50/30 rounded">
              <th className="p-2 flex-1 font-medium">الصورة</th>
              <th className="p-2 flex-1 font-medium">الاسم</th>
              <th className="p-2 flex-[2] font-medium">الإيميل</th>
              <th className="p-2 flex-1 font-medium">رقم الهاتف</th>
              <th className="p-2 flex-1 font-medium">نوع المستخدم</th>
              <th className="p-2 flex-1 font-medium"/>
            </tr>
          </thead>
        )}
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="text-center text-secondary-900 font-light py-2 last:border-none border-b border-primary/30 flex items-center justify-between my-4"
                >
                  <td className="p-2 flex-1">
                    <img
                      src={user.profile_image || default_img}
                      onError={(e) => { e.target.src = default_img }}
                      alt="صورة"
                      className="w-10 h-10 rounded-full mx-auto object-cover"
                    />
                  </td>
                  <td className="p-2 flex-1">{user.username}</td>
                  <td className="p-2 flex-[2]">{user.email}</td>
                  <td className="p-2 flex-1">{user.phone}</td>
                  <td className="p-2 flex-1">{user.user_type_display}</td>
                  <td className="p-2 flex-1 flex gap-4 items-center justify-center">
                    <TrashIcon
                      OnClick={() => deleteUser(user.id)}
                      className="brightness-150 hover:brightness-110 cursor-pointer"
                    />
                    {/* {user.user_type === "admin" ? (
                      <ShieldCheckSolid
                        className="h-6 w-6 text-primary hover:text-primary-600 cursor-pointer"
                        onClick={() => toggleAdminStatus(user.id, true)}
                      />
                    ) : (
                      <ShieldCheckOutline
                        className="h-6 w-6 text-primary hover:text-primary-600 cursor-pointer"
                        onClick={() => toggleAdminStatus(user.id, false)}
                      />
                    )} */}
                  </td>
                </tr>
              ))) : (<tr><td colSpan="5" className="text-center text-gray-500 py-6"> ليس هناك مستخدم بـ "{searchTerm}"</td></tr>)}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
