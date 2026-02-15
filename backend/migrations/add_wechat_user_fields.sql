-- 为微信登录与头像昵称扩展 user_info 表（PostgreSQL）
-- 在 backend 目录执行: psql -U your_user -d your_db -f migrations/add_wechat_user_fields.sql

ALTER TABLE user_info
  ADD COLUMN IF NOT EXISTS openid VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS nickname VARCHAR(100),
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- 为已有用户保留的 password/email 仍为 NOT NULL；微信用户用占位值即可
