import { useEffect, useState } from "react";
import api from "../api/axios";
import styles from "../css/AdmQuery.module.css";
import type { Hotel } from "../../Interface";
import Pagination from "../component/pagination";

function Adm_query() {
  const [data, setData] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // 编辑状态
  const [editingHotelId, setEditingHotelId] = useState<number | null>(null); // 存储当前正在编辑的酒店ID
  const [currentEditingData, setCurrentEditingData] = useState<Hotel | null>(
    null,
  ); // 存储编辑中的数据

  const fetchAdminData = async (page: number) => {
    setLoading(true);
    setError(null);
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
      setError("获取数据失败或权限已失效");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData(currentPage);
  }, [currentPage]);

  // 处理页码改变
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setEditingHotelId(null); // 切换页面时取消编辑
      setCurrentEditingData(null);
    }
  };

  // --- 编辑相关功能 ---

  // 进入编辑模式
  const handleEditClick = (hotel: Hotel) => {
    setEditingHotelId(hotel.id);
    // 初始化编辑数据，确保字段匹配EditingHotel接口
    setCurrentEditingData({
      id: hotel.id,
      name_zh: hotel.name_zh,
      name_en: hotel.name_en,
      address: hotel.address,
      star_rating: hotel.star_rating,
      operating_period: hotel.operating_period,
      description: hotel.description,
      active: hotel.active,
    });
  };

  // 取消编辑
  const handleCancelEdit = () => {
    setEditingHotelId(null);
    setCurrentEditingData(null);
  };

  // 处理输入框变化
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setCurrentEditingData((prev) => {
      if (!prev) return null;

      let newValue: string | number | boolean = value; // 定义一个通用类型变量

      if (name === "star_rating") {
        newValue = parseInt(value, 10);
      } else if (name === "active") {
        // --- 核心修改点：将字符串 "true" 或 "false" 转换为布尔值 ---
        newValue = value === "true"; // 如果 value 是 "true" 则为 true，否则为 false
      }
      // 对于其他字段（如name_zh, name_en, address, operating_period, description），newValue 保持为字符串

      return {
        ...prev,
        [name]: newValue,
      };
    });
  };

  // 保存修改
  const handleSaveEdit = async () => {
    if (!currentEditingData || !editingHotelId) return;

    setLoading(true);
    setError(null);
    try {
      // 发送PUT请求到后端更新数据
      await api.put(`/admin_query/${editingHotelId}`, currentEditingData);

      // 更新前端的data状态，替换掉原有的酒店数据
      setData((prevData) =>
        prevData.map((hotel) =>
          hotel.id === editingHotelId
            ? { ...hotel, ...currentEditingData }
            : hotel,
        ),
      );

      setEditingHotelId(null); // 退出编辑模式
      setCurrentEditingData(null); // 清除编辑中的数据
      alert("酒店信息更新成功！");
    } catch (err) {
      console.error("更新酒店信息失败:", err);
      setError("更新酒店信息失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>酒店管理列表</h1>

      {loading && <div className={styles.loadingText}>加载中...</div>}
      {error && <div className={styles.errorText}>错误: {error}</div>}

      {!loading && !error && (
        <>
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>ID</th> {/* 添加ID列方便查看 */}
                  <th>中文名</th>
                  <th>英文名</th>
                  <th>地址</th>
                  <th>星级</th>
                  <th>运营周期</th>
                  <th>描述信息</th>
                  <th>是否上线</th>
                  <th>操作</th> {/* 新增操作列 */}
                </tr>
              </thead>
              <tbody>
                {data.map((hotel) => (
                  <tr key={hotel.id}>
                    {" "}
                    {/* 使用 hotel.id 作为 key */}
                    <td>{hotel.id}</td>
                    {editingHotelId === hotel.id && currentEditingData ? (
                      <>
                        <td>
                          <input
                            type="text"
                            name="name_zh"
                            value={currentEditingData.name_zh}
                            onChange={handleInputChange}
                            className={styles.editInput}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="name_en"
                            value={currentEditingData.name_en}
                            onChange={handleInputChange}
                            className={styles.editInput}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="address"
                            value={currentEditingData.address}
                            onChange={handleInputChange}
                            className={styles.editInput}
                          />
                        </td>
                        <td>
                          <select
                            name="star_rating"
                            value={currentEditingData.star_rating}
                            onChange={handleInputChange}
                            className={styles.editSelect}
                          >
                            {[1, 2, 3, 4, 5].map((star) => (
                              <option key={star} value={star}>
                                {star}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <textarea
                            name="operating_period"
                            value={currentEditingData.operating_period}
                            onChange={handleInputChange}
                            className={styles.editTextArea}
                          />
                        </td>
                        <td>
                          <textarea
                            name="description"
                            value={currentEditingData.description}
                            onChange={handleInputChange}
                            className={styles.editTextArea}
                          />
                        </td>
                        <td>
                          <select
                            name="active"
                            value={String(currentEditingData.active)}
                            onChange={handleInputChange}
                            className={styles.editSelect}
                          >
                            {[
                              { value: true, label: "上线" },
                              { value: false, label: "下线" },
                            ].map((option) => (
                              <option
                                key={String(option.value)}
                                value={String(option.value)}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <button
                            onClick={handleSaveEdit}
                            className={`${styles.btn} ${styles.saveBtn}`}
                          >
                            保存
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className={`${styles.btn} ${styles.cancelBtn}`}
                          >
                            取消
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
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
                        <td>{hotel.active ? "上线中" : "已下线"}</td>
                        <td>
                          <button
                            onClick={() => handleEditClick(hotel)}
                            className={`${styles.btn} ${styles.editBtn}`}
                          >
                            编辑
                          </button>
                        </td>
                      </>
                    )}
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

export default Adm_query;
