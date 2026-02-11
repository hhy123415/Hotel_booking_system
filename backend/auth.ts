import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config(); // 确保在这个文件读取 process.env 之前加载

const SECRET_KEY = process.env.JWT_SECRET || "";

export const authenticateToken = (
  req: any,
  res: Response,
  next: NextFunction,
) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ success: false, message: "请先登录" });
  }

  jwt.verify(token, SECRET_KEY, (err: any, decoded: any) => {
    if (err) {
      console.log(err);
      return res
        .status(401)
        .json({ success: false, message: "登录失效，请重新登录" });
    }
    req.user = decoded; // 将解码后的用户信息（userId, username, isAdmin）存入 req
    next();
  });
};

// 专门验证管理员权限的中间件
export const authenticateAdmin = (req: any, res: Response, next: any) => {
  // 先运行基础令牌验证
  if (!req.user) {
    return res.status(401).json({ success: false, message: "未授权" });
  }

  if (req.user.isAdmin !== true) {
    return res
      .status(403)
      .json({ success: false, message: "权限不足，需要管理员身份" });
  }

  next();
};
