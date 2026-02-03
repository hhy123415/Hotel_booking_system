import { useState } from "react";
import type { ChangeEvent, SubmitEvent } from "react";
import { useNavigate } from "react-router-dom";
import style from "../css/Register.module.css";
import axios, { AxiosError } from "axios";

// 创建axios实例，配置基础URL
const api = axios.create({
  baseURL: "http://localhost:3001/api", //后期需要根据服务器ip地址进行调整，不能使用localhost，否则无法正常访问
  timeout: 5000,
});

interface FormData {
  username: string;
  password: string;
  email: string;
}

interface Errors {
  username?: string;
  password?: string;
  submit?: string;
  email?: string;
}

interface RegisterResponse {
  success: boolean;
  message?: string;
}

function Register() {
  const [formData, setFormData] = useState<FormData>({
    username: "",
    password: "",
    email: "",
  }); //表单数据
  const [errors, setErrors] = useState<Errors>({}); //注册错误
  const [isLoading, setIsLoading] = useState<boolean>(false); //加载状态
  const navigate = useNavigate(); //导航跳转

  // 处理表单数据改变
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    // 清除对应字段的错误
    if (errors[name as keyof Errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // 规范数据形式，若有误则返回对应的错误
  const validateForm = (): Errors => {
    const newErrors: Errors = {};

    if (!formData.username.trim()) {
      newErrors.username = "请输入用户名";
    }

    if (!formData.password) {
      newErrors.password = "请输入密码";
    } else if (formData.password.length < 6) {
      newErrors.password = "密码长度至少6位";
    }

    //邮箱格式验证可由input type属性实现
    if (!formData.email) {
      newErrors.email = "请输入邮箱";
    }
    return newErrors;
  };

  const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 清除之前的submit错误
    if (errors.submit) {
      setErrors((prev) => ({ ...prev, submit: undefined }));
    }

    // 输入验证
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    // API调用
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const response = await api.post<RegisterResponse>("/register", {
        username: formData.username,
        password: formData.password,
        email: formData.email,
      });

      if (response.data.success) {
        alert("注册成功，请重新登录")
        navigate("/login");
      } else {
        setErrors({ submit: response.data.message || "注册失败" });
      }
    } catch (error) {
      console.error("注册失败:", error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<RegisterResponse>;
        // 服务器返回了错误状态码
        setErrors({
          submit: axiosError.response?.data?.message || "注册失败",
        });
      } else {
        // 未连接
        setErrors({ submit: "无法连接至服务器" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    // 可以跳转到登录页面
    navigate("/login");
  };

  return (
    <div className={style[`register-container`]}>
      <div className={style["register-wrapper"]}>
        <div className={style["register-header"]}>
          <p className={style["register-title"]}>请注册您的账户</p>
        </div>

        {/* 注册用户名输入项 */}
        <form className={style["register-form"]} onSubmit={handleSubmit}>
          <div className={style["form-group"]}>
            <label htmlFor="username" className={style["form-label"]}>
              用户名
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`${style["form-input"]} ${errors.username ? style.error : ""}`}
              placeholder="请输入用户名"
            />
            {errors.username && (
              <span className={style["error-message"]}>{errors.username}</span>
            )}
          </div>

          {/* 注册密码输入项 */}
          <div className={style["form-group"]}>
            <label htmlFor="password" className={style["form-label"]}>
              密码
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`${style["form-input"]} ${errors.password ? style.error : ""}`}
              placeholder="请输入至少6位密码"
            />
            {errors.password && (
              <span className={style["error-message"]}>{errors.password}</span>
            )}
          </div>

          {/* 注册邮箱输入项 */}
          <div className={style["form-group"]}>
            <label htmlFor="email" className={style["form-label"]}>
              邮箱
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`${style["form-input"]} ${errors.email ? style.error : ""}`}
              placeholder="请输入邮箱"
            />
            {errors.password && (
              <span className={style["error-message"]}>{errors.email}</span>
            )}
          </div>

          {errors.submit && (
            <div className={style["submit-error"]}>{errors.submit}</div>
          )}

          <button
            type="submit"
            className={style["register-button"]}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className={style["loading-spinner"]}>
                <span className={style["spinner"]}></span>
                注册中...
              </span>
            ) : (
              "注册"
            )}
          </button>
        </form>

        <div className={style["divider"]}>
          <span>或</span>
        </div>

        <div className={style["alternative-login"]}>
          <p className={style["link"]}>
            已有账户？{" "}
            <button
              type="button"
              className={style["login-button"]}
              onClick={handleLoginRedirect}
            >
              立即登录
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
