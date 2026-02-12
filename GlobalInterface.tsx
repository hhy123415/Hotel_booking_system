//商户申请酒店信息
export interface ApplicationPayload {
  name_zh: string;
  name_en: string;
  address: string;
  star_rating: number | null;
  operating_period: string;
  description?: string;
  user_id?: string;
  id?: string; //申请记录id
}

//商户查看自己的申请记录
export interface ApplicationRecord {
  id?: string; //申请记录id
  name_zh: string;
  name_en: string;
  address: string;
  star_rating: number | null;
  operating_period: string;
  description?: string;
  status: string;
}

//管理员审核信息
export interface ApplicationCheck {
  name_zh: string;
  name_en: string;
  address: string;
  star_rating: number | null;
  operating_period: string;
  description?: string;
  user_id?: string;
  id?: string; //申请记录id
  created_at: string;
}

// 定义酒店数据接口
export interface Hotel {
  name_zh: string;
  name_en: string;
  address: string;
  star_rating: number | null;
  operating_period: string; // PG daterange 会以字符串形式返回，如 "[2023-01-01,2024-01-01)"
  description?: string;
  created_at: string;
  updated_at: string;
}
