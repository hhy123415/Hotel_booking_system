import styles from "../css/My_hotel.module.css";
import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import type { Hotel } from "../../Interface";
import Pagination from "../component/pagination";


function My_hotel() {
  const [data, setData] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const { logout, auth } = useAuth();

  const fetchMyData = async (page: number) => {
    setLoading(true);
    try {
      // 发送带分页参数的请求
      const res = await api.get(`/my_req?page=${page}&pageSize=${pageSize}`);
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
    fetchMyData(currentPage);
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}

export default My_hotel;
