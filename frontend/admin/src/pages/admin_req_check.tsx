import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import styles from "../css/AdmCheck.module.css";
import type ApplicationPayload from "../../../../GlobalInterface";
import dayjs from "dayjs";

function Adm_req_check() {
  const [data, setData] = useState<ApplicationPayload[]>([]);
  const [loading, setLoading] = useState(false);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;
  //审核状态
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject">("approve");
  const [remark, setRemark] = useState("");

  const { logout } = useAuth();

  const fetchAdminData = async (page: number) => {
    setLoading(true);
    try {
      // 发送带分页参数的请求
      const res = await api.get(
        `/admin_check?page=${page}&pageSize=${pageSize}`,
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

  // 打开模态框
  const openReviewModal = (id: string, type: "approve" | "reject") => {
    setSelectedId(id);
    setActionType(type);
    setRemark(""); // 重置备注
    setIsModalOpen(true);
  };

  // 提交审核
  const handleReviewSubmit = async () => {
    if (!selectedId) return;
    try {
      await api.post("/handle_application", {
        id: selectedId,
        action: actionType,
        admin_remark: remark,
      });
      alert("处理成功");
      setIsModalOpen(false);
      fetchAdminData(currentPage); // 刷新列表
    } catch (err) {
      console.log(err);
      alert("操作失败");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>酒店申请信息列表</h1>

      {loading ? (
        <div className={styles.loadingText}>加载中...</div>
      ) : (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>用户id</th>
                  <th>中文名</th>
                  <th>英文名</th>
                  <th>地址</th>
                  <th>星级</th>
                  <th>运营周期</th>
                  <th>描述信息</th>
                  <th>申请时间</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.map((hotel, index) => (
                  <tr key={index}>
                    <td>{hotel.user_id}</td>
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
                    <td>
                      {" "}
                      {hotel.created_at
                        ? dayjs(hotel.created_at).format("YYYY-MM-DD HH:mm:ss")
                        : "-"}
                    </td>
                    <td>
                      <button
                        className={styles.approveBtn}
                        onClick={() =>
                          openReviewModal(hotel.id ?? "", "approve")
                        }
                      >
                        通过
                      </button>
                      <button
                        className={styles.rejectBtn}
                        onClick={() =>
                          openReviewModal(hotel.id ?? "", "reject")
                        }
                      >
                        拒绝
                      </button>
                    </td>
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
          
          {/* 弹窗 */}
          {isModalOpen && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h3>确认{actionType === "approve" ? "通过" : "拒绝"}申请？</h3>
                <textarea
                  placeholder="输入备注/理由..."
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className={styles.remarkInput}
                />
                <div className={styles.modalActions}>
                  <button onClick={() => setIsModalOpen(false)}>取消</button>
                  <button
                    className={
                      actionType === "approve"
                        ? styles.confirmBtn
                        : styles.dangerBtn
                    }
                    onClick={handleReviewSubmit}
                  >
                    确认提交
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Adm_req_check;
