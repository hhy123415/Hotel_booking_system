"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const pg_1 = require("pg");
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = require("./auth");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
// 连接数据库配置
const pool = new pg_1.Pool({
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
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
//前端来源(localhost后续应改为服务器ip)
const allowedOrigins = ["http://localhost:3000"];
app.use((0, cors_1.default)({
    origin: allowedOrigins,
    credentials: true,
}));
app.use(express_1.default.json());
const SECRET_KEY = process.env.JWT_SECRET || "";
// --- 注册接口 ---
app.post("/api/register", async (req, res) => {
    const { username, password, email, adminCode, role } = req.body;
    try {
        // 检查用户是否已存在 (使用泛型确保返回类型)
        const userExists = await pool.query("SELECT * FROM user_info WHERE user_name = $1", [username]);
        if (userExists.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "用户名已存在",
            });
        }
        // 检查邮箱是否已存在
        const emailExists = await pool.query("SELECT * FROM user_info WHERE email = $1", [email]);
        if (emailExists.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "邮箱已存在",
            });
        }
        //完善密码加密
        const saltRounds = 10;
        const hashedPassword = await bcrypt_1.default.hash(password, saltRounds);
        // 判断是否是管理员（注册码后续可优化）
        let is_admin = false;
        if (role === "admin") {
            if (adminCode === "6666") {
                is_admin = true;
            }
            else {
                return res.status(403).json({
                    success: false,
                    message: "注册码错误",
                });
            }
        }
        // 插入新用户 (存储加密后的密码)
        await pool.query("INSERT INTO user_info (user_name, password, email, is_admin) VALUES ($1, $2, $3, $4)", [username, hashedPassword, email, is_admin]);
        res.status(201).json({
            success: true,
            message: "注册成功",
        });
    }
    catch (err) {
        console.error("注册错误:", err);
        res.status(500).json({
            success: false,
            message: "服务器内部错误",
        });
    }
});
// --- 登录接口 ---
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;
    try {
        // 查询用户
        const result = await pool.query("SELECT * FROM user_info WHERE user_name = $1", [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "用户名或密码错误",
            });
        }
        const user = result.rows[0];
        // 验证密码（比较哈希值）
        const validPassword = await bcrypt_1.default.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                message: "用户名或密码错误",
            });
        }
        // 登录成功,生成token
        const token = jsonwebtoken_1.default.sign({
            user_id: user.user_id,
            username: user.user_name,
            isAdmin: user.is_admin,
        }, SECRET_KEY, { expiresIn: "24h" });
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
            user_id: user.user_id,
            user_name: user.user_name,
            isAdmin: user.is_admin,
        });
    }
    catch (err) {
        console.error("登录错误:", err);
        res.status(500).json({
            success: false,
            message: "服务器内部错误",
        });
    }
});
// --- 获取当前用户信息接口 (AuthProvider 初始化时调用) ---
app.get("/api/me", auth_1.authenticateToken, async (req, res) => {
    res.json({
        success: true,
        user: {
            user_id: req.user?.user_id,
            username: req.user?.username,
            isAdmin: req.user?.isAdmin,
        },
    });
});
// --- 登出接口 ---
app.post("/api/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ success: true, message: "登出成功" });
});
app.get("/", (req, res) => {
    res.json({
        message: "API服务器正在运行 (TypeScript 版)",
    });
});
//---管理员获取酒店信息---
app.get("/api/admin_query", auth_1.authenticateToken, auth_1.authenticateAdmin, async (req, res) => {
    try {
        // 获取分页参数，设置默认值
        const page = parseInt(String(req.query.page)) || 1;
        const pageSize = parseInt(String(req.query.pageSize)) || 10;
        const offset = (page - 1) * pageSize;
        // 查询总条数（用于计算分页）
        const countResult = await pool.query("SELECT COUNT(*) FROM hotels");
        const totalCount = parseInt(countResult.rows[0].count);
        // 分页查询数据
        // 注意：这里使用了 order by 以保证分页顺序稳定
        const queryText = `
        SELECT * FROM hotels 
        ORDER BY id 
        LIMIT $1 OFFSET $2
      `;
        const dataResult = await pool.query(queryText, [
            pageSize,
            offset,
        ]);
        // 返回包含分页信息的数据
        res.json({
            success: true,
            data: dataResult.rows,
            pagination: {
                total: totalCount,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "服务器内部错误" });
    }
});
// 管理员更新数据库信息
app.put("/api/admin_query/:id", // :id 是动态参数
auth_1.authenticateToken, auth_1.authenticateAdmin, async (req, res) => {
    const hotelId = parseInt(req.params.id, 10); // 从URL获取酒店ID
    const { name_zh, name_en, address, star_rating, operating_period, description, active, } = req.body; // 从请求体获取更新数据
    // 1. 数据验证
    if (isNaN(hotelId) || hotelId <= 0) {
        return res
            .status(400)
            .json({ success: false, message: "无效的酒店ID。" });
    }
    if (!name_zh || !name_en || !address || !operating_period) {
        return res.status(400).json({
            success: false,
            message: "中文名、英文名、地址、运营周期为必填项。",
        });
    }
    if (typeof star_rating !== "number" || star_rating < 1 || star_rating > 5) {
        return res
            .status(400)
            .json({ success: false, message: "星级必须是1到5之间的整数。" });
    }
    try {
        // 2. 执行数据库更新
        const updateQuery = `
        UPDATE hotels
        SET 
          name_zh = $1,
          name_en = $2,
          address = $3,
          star_rating = $4,
          operating_period = $5,
          description = $6,
          updated_at = CURRENT_TIMESTAMP,
          active = $7
        WHERE id = $8
        RETURNING *; -- 返回更新后的记录
      `;
        const result = await pool.query(updateQuery, [
            name_zh,
            name_en,
            address,
            star_rating,
            operating_period,
            description || null, // description 可能为空
            active,
            hotelId,
        ]);
        // 3. 检查更新结果
        if (result.rows.length === 0) {
            return res
                .status(404)
                .json({ success: false, message: "酒店未找到或更新失败。" });
        }
        // 4. 返回更新后的酒店信息
        res.status(200).json({
            success: true,
            message: "酒店信息更新成功。",
            data: result.rows[0], // 返回更新后的酒店数据
        });
    }
    catch (err) {
        console.error(`更新酒店ID ${hotelId} 失败:`, err);
        // 根据错误类型返回更详细的错误信息，例如数据库约束错误
        if (err.code === "23505") {
            // PostgreSQL unique violation code
            return res
                .status(409)
                .json({ success: false, message: "存在重复的酒店名称或标识符。" });
        }
        res.status(500).json({
            success: false,
            message: "服务器内部错误，无法更新酒店信息。",
        });
    }
});
//获取申请信息
app.get("/api/admin_check", auth_1.authenticateToken, auth_1.authenticateAdmin, async (req, res) => {
    try {
        // 获取分页参数，设置默认值
        const page = parseInt(String(req.query.page)) || 1;
        const pageSize = parseInt(String(req.query.pageSize)) || 10;
        const offset = (page - 1) * pageSize;
        // 查询待处理总条数（用于计算分页）
        const countResult = await pool.query("SELECT COUNT(*) FROM hotel_applications WHERE status = $1", ["pending"]);
        const totalCount = parseInt(countResult.rows[0].count);
        // 分页查询数据
        // 注意：这里使用了 order by 以保证分页顺序稳定
        const queryText = `
        SELECT 
          id, user_id, name_zh, name_en, address, star_rating, 
          operating_period, description, created_at
        FROM hotel_applications WHERE status = $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
        const dataResult = await pool.query(queryText, [
            "pending",
            pageSize,
            offset,
        ]);
        // 返回包含分页信息的数据
        res.json({
            success: true,
            data: dataResult.rows,
            pagination: {
                total: totalCount,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "服务器内部错误" });
    }
});
// 处理审核请求
app.post("/api/handle_application", auth_1.authenticateToken, auth_1.authenticateAdmin, async (req, res) => {
    const { id, action, admin_remark } = req.body; // action: 'approve' 或 'reject'
    const client = await pool.connect();
    try {
        await client.query("BEGIN"); // 开启事务
        if (action === "approve") {
            // 获取申请详情
            const result = await client.query("SELECT * FROM hotel_applications WHERE id = $1 AND status = 'pending' FOR UPDATE", [id]);
            if (result.rowCount === 0) {
                throw new Error("申请不存在或已被处理");
            }
            const res = result.rows[0];
            // 插入到 hotels 表
            const insertHotelQuery = `
          INSERT INTO hotels (name_zh, name_en, address, star_rating, operating_period, description, active, user_id)
          VALUES ($1, $2, $3, $4, $5, $6, true, $7)
        `;
            await client.query(insertHotelQuery, [
                res.name_zh,
                res.name_en,
                res.address,
                res.star_rating,
                res.operating_period,
                res.description,
                res.user_id,
            ]);
            // 更新申请表状态
            await client.query("UPDATE hotel_applications SET status = 'approved', admin_remark = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2", [admin_remark, id]);
        }
        else {
            // 拒绝逻辑比较简单，只更新状态
            const result = await client.query("UPDATE hotel_applications SET status = 'rejected', admin_remark = $1, processed_at = CURRENT_TIMESTAMP WHERE id = $2 AND status = 'pending'", [admin_remark, id]);
            if (result.rowCount === 0)
                throw new Error("申请不存在或已被处理");
        }
        await client.query("COMMIT"); // 提交事务
        res.json({
            success: true,
            message: action === "approve" ? "已批准并导入酒店" : "已拒绝申请",
        });
    }
    catch (err) {
        await client.query("ROLLBACK"); // 回滚
        console.error(err);
        res.status(500).json({ error: "服务器内部错误" });
    }
    finally {
        client.release();
    }
});
//---商户申请新的酒店---
app.post("/api/new_request", auth_1.authenticateToken, async (req, res) => {
    try {
        const { name_zh, name_en, address, star_rating, operating_period, description, } = req.body;
        const user_id = req.user?.user_id;
        // 基础后台校验
        if (!name_zh ||
            !name_en ||
            !address ||
            !star_rating ||
            !operating_period) {
            return res.status(400).json({
                success: false,
                message: "必填内容缺失",
            });
        }
        const insertQuery = `
        INSERT INTO hotel_applications (
          user_id, 
          name_zh, 
          name_en, 
          address, 
          star_rating, 
          operating_period, 
          description,
          status
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
        RETURNING id;
      `;
        const values = [
            user_id,
            name_zh,
            name_en,
            address,
            star_rating,
            operating_period,
            description || null,
            "pending", // 初始状态为待审核
        ];
        const result = await pool.query(insertQuery, values);
        //返回成功响应
        return res.status(201).json({
            success: true,
            message: "申请提交成功",
            applicationId: result.rows[0].id,
        });
    }
    catch (err) {
        console.error("数据库操作失败:", err);
        return res.status(500).json({
            success: false,
            message: "服务器内部错误",
        });
    }
});
//---商户查看自己的申请记录---
app.get("/api/my_req", auth_1.authenticateToken, async (req, res) => {
    try {
        // 获取分页参数，设置默认值
        const page = parseInt(String(req.query.page)) || 1;
        const pageSize = parseInt(String(req.query.pageSize)) || 10;
        const user_id = req.user?.user_id;
        const offset = (page - 1) * pageSize;
        // 查询待处理总条数（用于计算分页）
        const countResult = await pool.query("SELECT COUNT(*) FROM hotel_applications WHERE user_id = $1", [user_id]);
        const totalCount = parseInt(countResult.rows[0].count);
        // 分页查询数据
        // 注意：这里使用了 order by 以保证分页顺序稳定
        const queryText = `
        SELECT 
          id, name_zh, name_en, address, star_rating, 
          operating_period, description, status, admin_remark
        FROM hotel_applications WHERE user_id = $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
        const dataResult = await pool.query(queryText, [user_id, pageSize, offset]);
        // 返回包含分页信息的数据
        res.json({
            success: true,
            data: dataResult.rows,
            pagination: {
                total: totalCount,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "服务器内部错误" });
    }
});
//---商户获取自己已经审核通过的酒店信息---
app.get("/api/my_hotel", auth_1.authenticateToken, async (req, res) => {
    try {
        // 获取分页参数，设置默认值
        const page = parseInt(String(req.query.page)) || 1;
        const pageSize = parseInt(String(req.query.pageSize)) || 10;
        const user_id = req.user?.user_id;
        const offset = (page - 1) * pageSize;
        // 查询待处理总条数（用于计算分页）
        const countResult = await pool.query("SELECT COUNT(*) FROM hotels WHERE user_id = $1", [user_id]);
        const totalCount = parseInt(countResult.rows[0].count);
        // 分页查询数据
        // 注意：这里使用了 order by 以保证分页顺序稳定
        const queryText = `
        SELECT 
          id, name_zh, name_en, address, star_rating, 
          operating_period, description, status, admin_remark
        FROM hotel_applications WHERE user_id = $1
        ORDER BY created_at DESC 
        LIMIT $2 OFFSET $3
      `;
        const dataResult = await pool.query(queryText, [user_id, pageSize, offset]);
        // 返回包含分页信息的数据
        res.json({
            success: true,
            data: dataResult.rows,
            pagination: {
                total: totalCount,
                page: page,
                pageSize: pageSize,
                totalPages: Math.ceil(totalCount / pageSize),
            },
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "服务器内部错误" });
    }
});
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
});
