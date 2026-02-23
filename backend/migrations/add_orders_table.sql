-- 订单表（预订记录）
-- 执行: psql -U your_user -d your_db -f backend/migrations/add_orders_table.sql

CREATE TABLE IF NOT EXISTS orders (
  id               SERIAL PRIMARY KEY,
  user_id          INTEGER NOT NULL REFERENCES user_info(user_id) ON DELETE CASCADE,
  hotel_id         INTEGER NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
  room_type_id     INTEGER NOT NULL REFERENCES room_types(id) ON DELETE RESTRICT,
  check_in_date    DATE NOT NULL,
  check_out_date   DATE NOT NULL,
  num_rooms        INTEGER NOT NULL DEFAULT 1 CHECK (num_rooms >= 1),
  total_price      NUMERIC(12,2) NOT NULL,
  status           VARCHAR(32) NOT NULL DEFAULT 'pending_payment',
  created_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN orders.status IS 'pending_payment | paid | cancelled | completed';

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
