import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import styles from "../css/AdmQuery.module.css";

// 定义酒店数据接口
interface Hotel {
  name_zh: string;
  name_en: string;
  address: string;
  star_rating: number;
  operating_period: string; // PG daterange 会以字符串形式返回，如 "[2023-01-01,2024-01-01)"
  description: string;
  created_at: string;
  updated_at: string;
}

function Adm_query() {
  const [data, setData] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const { logout } = useAuth();

  const fetchAdminData = async (page: number) => {
    setLoading(true);
    try {
      // 发送带分页参数的请求
      const res = await api.get(
        `/admin_query?page=${page}&pageSize=${pageSize}`,
      );
      setData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
      alert("获取数据失败或权限已失效");
      // logout(); // 根据具体逻辑决定是否强制登出
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData(currentPage);
  }, [currentPage, logout]);

  // 处理页码改变
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>酒店管理列表</h1>

      {loading ? (
        <div className={styles.loadingText}>加载中...</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>中文名</th>
                  <th>英文名</th>
                  <th>地址</th>
                  <th>星级</th>
                  <th>运营周期</th>
                  <th>创建时间</th>
                </tr>
              </thead>
              <tbody>
                {data.map((hotel, index) => (
                  <tr key={index}>
                    <td>{hotel.name_zh}</td>
                    <td>{hotel.name_en}</td>
                    <td>{hotel.address}</td>
                    <td className={styles.starColumn}>
                      {hotel.star_rating} ⭐
                    </td>
                    <td className={styles.periodColumn}>
                      {hotel.operating_period}
                    </td>
                    <td>{new Date(hotel.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className={styles.pagination}>
            <button
              className={styles.btn}
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              上一页
            </button>

            <span className={styles.pageInfo}>
              第 <strong>{currentPage}</strong> 页 / 共 {totalPages} 页
            </span>

            <button
              className={styles.btn}
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              下一页
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Adm_query;
