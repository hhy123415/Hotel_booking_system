import Taro from '@tarojs/taro'

import type { Hotel, HotelDetail, PaginatedResponse } from '../types/hotel'

// 与 auth 保持一致，用 127.0.0.1 便于小程序模拟器访问本机后端
const BASE_URL = 'http://127.0.0.1:3001/api'

export interface HotelListParams {
  page?: number
  pageSize?: number
  keyword?: string
  star?: number
  checkIn?: string
  minPrice?: number
  maxPrice?: number
}

export async function fetchHotelList(
  params: HotelListParams = {},
): Promise<PaginatedResponse<Hotel>> {
  const { page = 1, pageSize = 10, keyword = '', star, checkIn, minPrice, maxPrice } = params

  // 只在有值时再把参数加到请求里，避免出现 star=undefined、checkIn=undefined
  const data: Record<string, unknown> = {
    page,
    pageSize,
  }

  const kw = keyword.trim()
  if (kw) data.keyword = kw
  if (typeof star === 'number' && star > 0) data.star = star
  if (checkIn) data.checkIn = checkIn
  if (typeof minPrice === 'number') data.minPrice = minPrice
  if (typeof maxPrice === 'number') data.maxPrice = maxPrice

  const res = await Taro.request<PaginatedResponse<Hotel>>({
    url: `${BASE_URL}/hotels`,
    method: 'GET',
    data,
  })

  return res.data
}

export async function fetchHotelDetail(id: number): Promise<HotelDetail> {
  const res = await Taro.request<{
    success: boolean
    data: HotelDetail
    message?: string
  }>({
    url: `${BASE_URL}/hotels/${id}`,
    method: 'GET',
  })

  if (!res.data.success) {
    throw new Error(res.data.message || '获取酒店详情失败')
  }

  return res.data.data
}

