import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import styles from "../css/My_req.module.css";
import type { ApplicationRecord } from "../../../../GlobalInterface";

function My_req() {
  const [data, setData] = useState<ApplicationRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const { logout, auth } = useAuth();

  const fetchMyData = async (page: number, user_id: string) => {
    setLoading(true);
    try {
      // 发送带分页参数的请求
      const res = await api.get(
        `/my_req?page=${page}&pageSize=${pageSize}&user_id=${user_id}`,
      );
      setData(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
      alert("获取数据失败或权限已失效");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyData(currentPage, auth.user_id);
  }, [currentPage, auth, logout]);

  // 处理页码改变
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>我的申请列表</h1>

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
                  <th>描述信息</th>
                  <th>审核状态</th>
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
                    <td>{hotel.description}</td>
                    <td>{hotel.status}</td>
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

export default My_req;
