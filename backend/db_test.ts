import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

// 连接数据库配置
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || ""),
});

// 测试连接
pool
  .connect()
  .then((client) => {
    console.log("成功连接到数据库");
    client.release();
  })
  .catch((err) => console.error("数据库连接失败:", err));

// 立即调用这个异步函数
(async () => {
  console.log("即将执行数据库查询..."); // 更明确的日志
  try {
    const queryText = `
        SELECT * FROM hotels
      `;
    const dataResult = await pool.query(queryText);

    console.log("查询到数据:", dataResult.rows); // 通常数据在 .rows 属性中
  } catch (err) {
    console.error("数据库查询失败:", err);
  } finally {
    // 可选：你可能希望在所有操作完成后关闭连接池
    // pool.end(); // 警告：这会关闭所有连接，在生产环境中通常不在这里调用
  }
})(); // 注意这里的 ()，它会立即执行上面的函数
