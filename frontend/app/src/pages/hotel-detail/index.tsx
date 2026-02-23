import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { View, Text, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

import { fetchHotelDetail } from '../../services/hotel'
import type { HotelDetail } from '../../types/hotel'

import './index.css'

const DEFAULT_HOTEL_ID = 1

const HotelDetailPage: FC = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [detail, setDetail] = useState<HotelDetail | null>(null)
  const [loadFailed, setLoadFailed] = useState(false)

  useEffect(() => {
    const idParam = (router.params?.id as string) ?? ''
    const id = idParam ? Number(idParam) : DEFAULT_HOTEL_ID
    if (Number.isNaN(id) || id < 1) {
      setLoading(false)
      setLoadFailed(true)
      return
    }

    const load = async () => {
      try {
        setLoading(true)
        setLoadFailed(false)
        const data = await fetchHotelDetail(id)
        setDetail(data)
      } catch (error) {
        console.error('加载酒店详情失败', error)
        setLoadFailed(true)
        Taro.showToast({
          title: '暂时无法获取酒店详情',
          icon: 'none',
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router.params?.id])

  if (loading) {
    return (
      <View className='page hotel-detail-page'>
        <Text>正在加载酒店详情...</Text>
      </View>
    )
  }

  if (loadFailed || !detail) {
    return (
      <View className='page hotel-detail-page'>
        <Text className='error-tip'>暂无酒店详情，请检查网络或从首页选择酒店</Text>
        <Button
          type='primary'
          onClick={() => Taro.reLaunch({ url: '/pages/index/index' })}
        >
          去首页
        </Button>
      </View>
    )
  }

  const { hotel, roomTypes } = detail

  return (
    <View className='page hotel-detail-page'>
      <View className='hotel-header-card'>
        <Text className='hotel-name-zh'>{hotel.name_zh}</Text>
        <Text className='hotel-name-en'>{hotel.name_en}</Text>
        <Text className='hotel-address'>{hotel.address}</Text>
        {hotel.star_rating && (
          <Text className='hotel-star'>{hotel.star_rating} 星级酒店</Text>
        )}
      </View>

      <View className='section'>
        <Text className='section-title'>酒店简介</Text>
        <Text className='section-content'>
          {hotel.description || '该酒店暂未填写详细介绍。'}
        </Text>
      </View>

      <View className='section'>
        <Text className='section-title'>房型与价格</Text>
        {roomTypes.length === 0 ? (
          <Text className='section-content'>暂未配置房型信息。</Text>
        ) : (
          roomTypes.map((room) => (
            <View key={room.id} className='room-card'>
              <View className='room-header'>
                <Text className='room-name'>{room.name}</Text>
                <Text className='room-price'>¥{room.base_price}/晚起</Text>
              </View>
              <Text className='room-meta'>
                可住人数：{room.capacity ?? 2} 人 | 房量：{room.total_inventory ?? 10} 间
              </Text>
            </View>
          ))
        )}
      </View>

      <View className='footer'>
        <Button
          className='reserve-button'
          type='primary'
          onClick={() =>
            Taro.navigateTo({
              url: `/pages/order-create/index?hotelId=${hotel.id}`,
            })
          }
        >
          立即预订
        </Button>
      </View>
    </View>
  )
}

export default HotelDetailPage

