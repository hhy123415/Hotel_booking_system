import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";

function Adm_query() {
  const [data, setData] = useState([]);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get("/admin_query");
        setData(res.data.data);
      } catch (err) {
        console.log(err);
        alert("权限已失效，请重新登录");
        logout();
      }
    };

    fetchAdminData();
  }, [logout]);

  return (
    <div>
      <h1>管理员查询页面</h1>
      {/* 渲染数据 */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default Adm_query;
