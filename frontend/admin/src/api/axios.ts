import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001/api", //后期需要根据服务器ip地址进行调整，不能使用localhost，否则无法正常访问
  withCredentials: true, // 必须设置，否则 Cookie 不会发送
  timeout: 5000,
});

// 响应拦截器：处理 Token 过期或未登录
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config.url !== "/me") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
