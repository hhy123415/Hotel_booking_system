import Taro from '@tarojs/taro'
import type { OrderCreateParams, MyOrdersResponse } from '../types/order'
import { getToken } from './auth'

const BASE_URL = 'http://127.0.0.1:3001/api'

export async function createOrder(params: OrderCreateParams): Promise<{ success: boolean; message?: string; data?: unknown }> {
  const token = getToken()
  if (!token) {
    Taro.showToast({ title: '请先登录', icon: 'none' })
    return { success: false, message: '请先登录' }
  }
  const res = await Taro.request<{ success: boolean; message?: string; data?: unknown }>({
    url: `${BASE_URL}/orders`,
    method: 'POST',
    header: { Authorization: `Bearer ${token}` },
    data: params,
  })
  return res.data
}

export async function getMyOrders(page = 1, pageSize = 10): Promise<MyOrdersResponse> {
  const token = getToken()
  const res = await Taro.request<MyOrdersResponse>({
    url: `${BASE_URL}/my_orders`,
    method: 'GET',
    header: { Authorization: `Bearer ${token}` },
    data: { page, pageSize },
  })
  return res.data
}
