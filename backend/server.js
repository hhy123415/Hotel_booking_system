const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");
const cors = require("cors");

//连接数据库
const pool = new Pool({
  user: "hhy",
  host: "47.98.251.110",
  database: "ctrip_db",
  password: "123456",
  port: 5432,
});

// 测试连接
pool
  .connect()
  .then((client) => {
    console.log("成功连接到数据库");
    client.release();
  })
  .catch((err) => console.error("数据库连接失败:", err));

const app = express();
app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析JSON请求体

// 注册接口
app.post("/api/register", async (req, res) => {
  const { username, password, email, adminCode, role } = req.body;

  try {
    // 检查用户是否已存在
    const userExists = await pool.query(
      "SELECT * FROM user_info WHERE user_name = $1",
      [username],
    );

    if (userExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "用户名已存在",
      });
    }

    // 检查邮箱是否已存在
    const emailExists = await pool.query(
      "SELECT * FROM user_info WHERE email = $1",
      [email],
    );

    if (emailExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "邮箱已存在",
      });
    }

    //密码加密（待实现）

    //判断是否是管理员(这里先采用固定的注册码，后续可添加动态生成一定时效的注册码功能)
    let is_admin = false;
    if (role == "admin") {
      if (adminCode === "6666") {
        is_admin = true;
      } else {
        return res.status(409).json({
          success: false,
          message: "注册码错误",
        });
      }
    }

    // 插入新用户
    const result = await pool.query(
      "INSERT INTO user_info (user_name, password, email,is_admin) VALUES ($1, $2,$3,$4)",
      [username, password, email, is_admin],
    );

    res.status(201).json({
      success: true,
      message: "注册成功",
    });
  } catch (err) {
    console.error("注册错误:", err);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
});

// 登录接口
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // 查询用户
    const result = await pool.query(
      "SELECT * FROM user_info WHERE user_name = $1",
      [username],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    const user = result.rows[0];

    // 验证密码（实际项目中比较哈希值）
    // const validPassword = await bcrypt.compare(password, user.password);
    const validPassword = password === user.password; // 简化版本

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 登录成功
    res.json({
      success: true,
      message: "登录成功",
      user_name: user.user_name,
      isAdmin: user.is_admin,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
});

app.get("/", (req, res) => {
  res.json({
    message: "API服务器正在运行",
  });
});

app.listen(3001, () => {
  console.log("服务器运行在 http://localhost:3001");
});
