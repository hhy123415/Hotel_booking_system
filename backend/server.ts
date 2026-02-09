//数据库表结构

//                                         Table "public.user_info"
//   Column   |          Type          | Collation | Nullable |                  Default
// -----------+------------------------+-----------+----------+--------------------------------------------
//  user_id   | integer                |           | not null | nextval('user_info_user_id_seq'::regclass)
//  user_name | character varying(50)  |           | not null |
//  password  | character varying(255) |           | not null |
//  email     | character varying(100) |           | not null |
//  is_admin  | boolean                |           |          | false
// Indexes:
//     "user_info_pkey" PRIMARY KEY, btree (user_id)
//     "user_info_email_unique" UNIQUE CONSTRAINT, btree (email)
//     "user_info_user_name_key" UNIQUE CONSTRAINT, btree (user_name)

//                                           Table "public.hotels"
//       Column      |           Type           | Collation | Nullable |              Default
// ------------------+--------------------------+-----------+----------+------------------------------------
//  id               | integer                  |           | not null | nextval('hotels_id_seq'::regclass)
//  name_zh          | character varying(255)   |           | not null |
//  name_en          | character varying(255)   |           | not null |
//  address          | text                     |           | not null |
//  star_rating      | integer                  |           |          |
//  operating_period | daterange                |           | not null |
//  description      | text                     |           |          |
//  created_at       | timestamp with time zone |           |          | CURRENT_TIMESTAMP
//  updated_at       | timestamp with time zone |           |          | CURRENT_TIMESTAMP
// Indexes:
//     "hotels_pkey" PRIMARY KEY, btree (id)
//     "idx_hotels_operating_period" gist (operating_period)
// Check constraints:
//     "hotels_star_rating_check" CHECK (star_rating >= 1 AND star_rating <= 5)
// Referenced by:
//     TABLE "room_types" CONSTRAINT "room_types_hotel_id_fkey" FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE

//                                          Table "public.room_types"
//      Column      |           Type           | Collation | Nullable |                Default
// -----------------+--------------------------+-----------+----------+----------------------------------------
//  id              | integer                  |           | not null | nextval('room_types_id_seq'::regclass)
//  hotel_id        | integer                  |           |          |
//  name            | character varying(100)   |           | not null |
//  base_price      | numeric(10,2)            |           | not null |
//  capacity        | integer                  |           |          | 2
//  total_inventory | integer                  |           |          | 10
//  created_at      | timestamp with time zone |           |          | CURRENT_TIMESTAMP
// Indexes:
//     "room_types_pkey" PRIMARY KEY, btree (id)
// Foreign-key constraints:
//     "room_types_hotel_id_fkey" FOREIGN KEY (hotel_id) REFERENCES hotels(id) ON DELETE CASCADE

import express, { Request, Response } from "express";
import { Pool, QueryResult } from "pg";
import bcrypt from "bcrypt";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import { authenticateToken, authenticateAdmin } from "./auth";
import jwt from "jsonwebtoken";
dotenv.config();

// 定义用户在数据库中的结构
interface UserRow {
  user_id?: number;
  user_name: string;
  password: string;
  email: string;
  is_admin: boolean;
}

// 定义 Token 载荷类型
interface JwtPayload {
  userId: number;
  username: string;
  isAdmin: boolean;
}

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

const app = express();
app.use(cookieParser());

//前端来源(localhost后续应改为服务器ip)
const allowedOrigins = ["http://localhost:3000"];
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(express.json());

const SECRET_KEY = process.env.JWT_SECRET || "";

// --- 注册接口 ---
app.post("/api/register", async (req: Request, res: Response) => {
  const { username, password, email, adminCode, role } = req.body;

  try {
    // 检查用户是否已存在 (使用泛型确保返回类型)
    const userExists: QueryResult<UserRow> = await pool.query(
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
    const emailExists: QueryResult<UserRow> = await pool.query(
      "SELECT * FROM user_info WHERE email = $1",
      [email],
    );

    if (emailExists.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "邮箱已存在",
      });
    }

    //完善密码加密
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 判断是否是管理员（注册码后续可优化）
    let is_admin = false;
    if (role === "admin") {
      if (adminCode === "6666") {
        is_admin = true;
      } else {
        return res.status(403).json({
          success: false,
          message: "注册码错误",
        });
      }
    }

    // 插入新用户 (存储加密后的密码)
    await pool.query(
      "INSERT INTO user_info (user_name, password, email, is_admin) VALUES ($1, $2, $3, $4)",
      [username, hashedPassword, email, is_admin],
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

// --- 登录接口 ---
app.post("/api/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    // 查询用户
    const result: QueryResult<UserRow> = await pool.query(
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

    // 验证密码（比较哈希值）
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        success: false,
        message: "用户名或密码错误",
      });
    }

    // 登录成功,生成token
    const token = jwt.sign(
      {
        userId: user.user_id,
        username: user.user_name,
        isAdmin: user.is_admin,
      },
      SECRET_KEY,
      { expiresIn: "24h" }, // 有效期 24 小时
    );

    // 设置 HTTP-Only Cookie
    res.cookie("token", token, {
      httpOnly: true, // 防止 JavaScript 读取，防 XSS
      secure: false, // 允许http,true时仅允许https
      sameSite: "lax", // 防止 CSRF
      maxAge: 24 * 60 * 60 * 1000, // 与 JWT 有效期一致
      path: "/", // 确保 cookie 在所有路径下可用
    });

    // 返回用户信息给前端（不含 Token）
    res.json({
      success: true,
      message: "登录成功",
      user_name: user.user_name,
      isAdmin: user.is_admin,
    });
  } catch (err) {
    console.error("登录错误:", err);
    res.status(500).json({
      success: false,
      message: "服务器内部错误",
    });
  }
});

// --- 获取当前用户信息接口 (AuthProvider 初始化时调用) ---
app.get("/api/me", authenticateToken, (req: any, res: Response) => {
  res.json({
    success: true,
    user: {
      username: req.user.username,
      isAdmin: req.user.isAdmin,
    },
  });
});

// --- 登出接口 ---
app.post("/api/logout", (req: Request, res: Response) => {
  res.clearCookie("token");
  res.json({ success: true, message: "登出成功" });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "API服务器正在运行 (TypeScript 版)",
  });
});

app.get(
  "/api/admin_query",
  authenticateToken,
  authenticateAdmin,
  async (req, res) => {
    const users = await pool.query(
      "SELECT user_id, user_name, email FROM user_info",
    );
    res.json({ success: true, data: users.rows });
  },
);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
