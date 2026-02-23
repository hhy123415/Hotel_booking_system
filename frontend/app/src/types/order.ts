export interface OrderCreateParams {
  hotel_id: number
  room_type_id: number
  check_in_date: string
  check_out_date: string
  num_rooms: number
}

export interface Order {
  id: number
  hotel_id: number
  room_type_id: number
  check_in_date: string
  check_out_date: string
  num_rooms: number
  total_price: string | number
  status: string
  created_at: string
}

export interface OrderListItem extends Order {
  hotel_name_zh?: string
  hotel_name_en?: string
  room_type_name?: string
  base_price?: string
}

export interface MyOrdersResponse {
  success: boolean
  data: OrderListItem[]
  pagination: { total: number; page: number; pageSize: number; totalPages: number }
}
