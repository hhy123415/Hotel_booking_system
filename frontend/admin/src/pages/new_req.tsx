import { useState } from "react";
import api from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import styles from "../css/new_req.module.css";
import axios, { AxiosError } from "axios";
import type {ApplicationPayload} from "../../../../GlobalInterface";

interface BackendError {
  message?: string;
  success?: boolean;
}

function New_req() {
  const { logout, auth } = useAuth();
  const [nameZh, setNameZh] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [address, setAddress] = useState("");
  const [starRating, setStarRating] = useState<number | "">("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!nameZh.trim()) return "请填写酒店中文名";
    if (!nameEn.trim()) return "请填写酒店英文名";
    if (!address.trim()) return "请填写地址";
    if (!startDate || !endDate) return "请选择运营时间";
    if (new Date(startDate) > new Date(endDate))
      return "开始日期不能晚于结束日期";
    if (starRating == "" || starRating < 1 || starRating > 5)
      return "星级须在 1 到 5 之间";
    return null;
  };

  const handleSubmit = async (e: React.SubmitEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const vErr = validate();
    if (vErr) {
      setErrorMsg(vErr);
      return;
    }

    const operating_period = `[${startDate},${endDate})`;

    const payload: ApplicationPayload = {
      name_zh: nameZh.trim(),
      name_en: nameEn.trim(),
      address: address.trim(),
      star_rating: starRating === "" ? null : Number(starRating),
      operating_period,
      description: description.trim() || undefined,
      user_id: auth.user_id,
    };

    setLoading(true);

    try {
      const res = await api.post("/new_request", payload);
      if (res.data.success) {
        setSuccessMsg("申请提交成功，等待管理员审核。");
        // 清空表单
        setNameZh("");
        setNameEn("");
        setAddress("");
        setStarRating("");
        setStartDate("");
        setEndDate("");
        setDescription("");
      }
    } catch (err: unknown) {
      console.error("提交申请失败:", err);

      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<BackendError>;

        if (axiosError.response?.status === 401) {
          alert("登录状态已过期，请重新登录。");
          logout();
          return;
        }

        const msg =
          axiosError.response?.data?.message ||
          axiosError.message ||
          "提交失败";
        setErrorMsg(String(msg));
      } else {
        setErrorMsg("发生了一个意外错误");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>新增酒店申请</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        {errorMsg && <div className={styles.errorText}>{errorMsg}</div>}
        {successMsg && <div className={styles.successText}>{successMsg}</div>}

        <label className={styles.label}>
          中文名 *
          <input
            className={styles.input}
            value={nameZh}
            onChange={(e) => setNameZh(e.target.value)}
            maxLength={255}
            required
          />
        </label>

        <label className={styles.label}>
          英文名 *
          <input
            className={styles.input}
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            maxLength={255}
            required
          />
        </label>

        <label className={styles.label}>
          地址 *
          <textarea
            className={styles.textarea}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </label>

        <label className={styles.label}>
          星级（1-5）
          <input
            className={styles.input}
            type="number"
            min={1}
            max={5}
            step={1}
            value={starRating}
            onChange={(e) => {
              const v = e.target.value;
              setStarRating(v === "" ? "" : Number(v));
            }}
          />
        </label>

        <div className={styles.row}>
          <label className={styles.label}>
            运营开始日期 *
            <input
              className={styles.input}
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
          </label>

          <label className={styles.label}>
            运营结束日期 *
            <input
              className={styles.input}
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </label>
        </div>

        <label className={styles.label}>
          描述
          <textarea
            className={styles.textarea}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>

        <div className={styles.actions}>
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "提交中..." : "提交申请"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default New_req;
