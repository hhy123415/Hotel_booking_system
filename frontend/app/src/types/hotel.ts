export interface RoomType {
  id: number;
  hotel_id: number | null;
  name: string;
  base_price: string;
  capacity: number | null;
  total_inventory: number | null;
}

export interface Hotel {
  id: number;
  name_zh: string;
  name_en: string;
  address: string;
  star_rating: number | null;
  operating_period: unknown;
  description: string | null;
  created_at: string;
  updated_at: string;
  active: boolean | null;
}

export interface HotelDetail {
  hotel: Hotel;
  roomTypes: RoomType[];
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: Pagination;
}

