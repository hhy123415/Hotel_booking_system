export default interface ApplicationPayload {
  name_zh: string;
  name_en: string;
  address: string;
  star_rating?: number | null;
  operating_period: string;
  description?: string;
  user_id?: string;
  created_at?: string;
  id?: string; //申请记录id
}
