import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getMyOrders } from '../../services/order'
import { getUser } from '../../services/auth'
import type { OrderListItem } from '../../types/order'
import './index.css'

const statusText: Record<string, string> = {
  pending_payment: '待支付',
  paid: '已支付',
  cancelled: '已取消',
  completed: '已完成',
}

const OrderListPage: FC = () => {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const load = async (p = 1) => {
    const user = getUser()
    if (!user) {
      Taro.showToast({ title: '请先登录', icon: 'none' })
      setTimeout(() => Taro.redirectTo({ url: '/pages/login/index' }), 500)
      return
    }
    setLoading(true)
    try {
      const res = await getMyOrders(p, 10)
      setOrders(res.data)
      setTotalPages(res.pagination.totalPages)
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '加载失败', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(page)
  }, [page])

  return (
    <View className='page order-list-page'>
      <View className='order-list-header'>
        <Text className='order-list-title'>我的订单</Text>
      </View>

      {loading && orders.length === 0 ? (
        <View className='order-list-empty'>
          <Text>加载中...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View className='order-list-empty'>
          <Text>暂无订单</Text>
          <Text
            className='order-list-link'
            onClick={() => Taro.navigateBack()}
          >
            返回
          </Text>
        </View>
      ) : (
        <ScrollView className='order-list-scroll' scrollY>
          {orders.map((order) => (
            <View key={order.id} className='order-card'>
              <View className='order-card-header'>
                <Text className='order-hotel-name'>
                  {order.hotel_name_zh || order.hotel_name_en || `酒店 #${order.hotel_id}`}
                </Text>
                <Text className={'order-status order-status--' + order.status}>
                  {statusText[order.status] || order.status}
                </Text>
              </View>
              <Text className='order-room'>{order.room_type_name || `房型 #${order.room_type_id}`}</Text>
              <Text className='order-dates'>
                {order.check_in_date} 至 {order.check_out_date} · {order.num_rooms} 间
              </Text>
              <View className='order-card-footer'>
                <Text className='order-total'>¥{order.total_price}</Text>
              </View>
            </View>
          ))}
          {page < totalPages && (
            <View
              className='order-list-more'
              onClick={() => setPage((p) => p + 1)}
            >
              <Text>加载更多</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

export default OrderListPage
