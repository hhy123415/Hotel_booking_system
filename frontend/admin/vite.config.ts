import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 3000,      // 将端口设置为 3000
    strictPort: true, // 如果端口被占用，直接报错退出；若为 false，则尝试下一个可用端口
    host: true,       // 监听所有地址，包括局域网 IP
    open: true,    // 启动服务后是否自动在浏览器打开
  },
})
