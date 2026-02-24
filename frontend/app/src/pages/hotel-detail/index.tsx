import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { View, Text, Button, Image, Picker } from '@tarojs/components'
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
  const [checkInText, setCheckInText] = useState('')
  const [checkOutText, setCheckOutText] = useState('')
  const [nightCount, setNightCount] = useState<number | null>(null)
  const [guestCount, setGuestCount] = useState<number>(2)

  useEffect(() => {
    const idParam = (router.params?.id as string) ?? ''
    const id = idParam ? Number(idParam) : DEFAULT_HOTEL_ID
    if (Number.isNaN(id) || id < 1) {
      setLoading(false)
      setLoadFailed(true)
      return
    }

    const checkIn = (router.params?.checkIn as string) || ''
    const checkOut = (router.params?.checkOut as string) || ''
    setCheckInText(checkIn)
    setCheckOutText(checkOut)

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
  }, [router.params?.id, router.params?.checkIn, router.params?.checkOut])

  // 根据当前选择的入住 / 离店日期，动态计算晚数
  useEffect(() => {
    if (checkInText && checkOutText) {
      const start = new Date(checkInText)
      const end = new Date(checkOutText)
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
        const diff = Math.round(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        )
        setNightCount(diff)
        return
      }
    }
    setNightCount(null)
  }, [checkInText, checkOutText])

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
      <View className='detail-nav'>
        <View
          className='detail-nav-back'
          onClick={() => Taro.navigateBack({ delta: 1 })}
        >
          <Text className='detail-nav-back-icon'>{'‹'}</Text>
          <Text className='detail-nav-back-text'>酒店列表</Text>
        </View>
        <Text className='detail-nav-title' numberOfLines={1}>
          {hotel.name_zh}
        </Text>
      </View>

      <View className='detail-banner'>
        {hotel.image_url && (
          <Image
            className='detail-banner-img'
            src={`http://127.0.0.1:3001${hotel.image_url}`}
            mode='aspectFill'
          />
        )}
        <View className='detail-banner-overlay'>
          <Text className='detail-hotel-name'>{hotel.name_zh}</Text>
          {hotel.star_rating && (
            <Text className='detail-hotel-star'>{hotel.star_rating} 星级酒店</Text>
          )}
          <Text className='detail-hotel-address'>{hotel.address}</Text>
        </View>
      </View>

      <View className='detail-base-card'>
        <View className='detail-tags-row'>
          {hotel.star_rating && (
            <Text className='detail-tag'>{hotel.star_rating} 星</Text>
          )}
          <Text className='detail-tag'>快速入住</Text>
          <Text className='detail-tag'>交通便捷</Text>
        </View>
        <View className='detail-score-row'>
          <View className='detail-score-main'>
            <Text className='detail-score-number'>5.0</Text>
            <Text className='detail-score-text'>分</Text>
          </View>
          <View className='detail-score-sub'>
            <Text className='detail-score-desc'>100 条点评 · 环境优质</Text>
          </View>
        </View>
      </View>

      {/* 单独的酒店简介卡片 */}
      <View className='section detail-intro'>
        <Text className='section-title'>酒店简介</Text>
        <Text className='section-content'>
          {hotel.description || '该酒店暂未填写详细介绍。'}
        </Text>
      </View>

      <View className='detail-date-bar'>
        <View className='detail-date-left'>
          <Picker
            mode='date'
            value={checkInText}
            onChange={(e) => setCheckInText(e.detail.value)}
          >
            <View className='detail-date-row'>
              <Text className='detail-date-label'>入住</Text>
              <Text className='detail-date-value'>
                {checkInText || '请选择入住日期'}
              </Text>
            </View>
          </Picker>
          <Picker
            mode='date'
            value={checkOutText}
            onChange={(e) => setCheckOutText(e.detail.value)}
          >
            <View className='detail-date-row'>
              <Text className='detail-date-label'>离店</Text>
              <Text className='detail-date-value'>
                {checkOutText || '请选择离店日期'}
              </Text>
            </View>
          </Picker>
        </View>
        <View className='detail-date-right'>
          <Text className='detail-date-night'>
            {nightCount ? `${nightCount} 晚` : '1 晚'}
          </Text>
          <View className='detail-guest-row'>
            <Text className='detail-date-guest-label'>入住人数</Text>
            <View className='detail-guest-controls'>
              <Text
                className='guest-btn'
                onClick={() => setGuestCount((prev) => Math.max(1, prev - 1))}
              >
                −
              </Text>
              <Text className='guest-count'>{guestCount} 人</Text>
              <Text
                className='guest-btn'
                onClick={() => setGuestCount((prev) => Math.min(6, prev + 1))}
              >
                +
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View className='section'>
        <Text className='section-title'>当前房型与价格</Text>
        {roomTypes.length === 0 ? (
          <Text className='section-content'>暂未配置房型信息。</Text>
        ) : (
          roomTypes.map((room) => (
            <View key={room.id} className='room-card'>
              <View className='room-card-main'>
                <View className='room-info'>
                  <Text className='room-name'>{room.name}</Text>
                  <Text className='room-meta'>
                    可住人数：{room.capacity ?? 2} 人 · 房量：{room.total_inventory ?? 10} 间
                  </Text>
                </View>
                <View className='room-price-block'>
                  <Text className='room-price'>
                    ¥{room.base_price}
                  </Text>
                  <Text className='room-price-unit'>起 / 晚</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <View className='footer'>
        <Button
          className='reserve-button'
          type='primary'
          onClick={() => {
            const params: string[] = [`hotelId=${hotel.id}`]
            if (checkInText) params.push(`checkIn=${checkInText}`)
            if (checkOutText) params.push(`checkOut=${checkOutText}`)
            if (guestCount) params.push(`guestCount=${guestCount}`)
            const url = `/pages/order-create/index?${params.join('&')}`
            Taro.navigateTo({ url })
          }}
        >
          立即预订
        </Button>
      </View>
    </View>
  )
}

export default HotelDetailPage

