import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { View, Text, Button, Picker } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { fetchHotelDetail } from '../../services/hotel'
import { createOrder } from '../../services/order'
import type { HotelDetail } from '../../types/hotel'
import type { RoomType } from '../../types/hotel'
import './index.css'

const OrderCreatePage: FC = () => {
  const router = useRouter()
  const [detail, setDetail] = useState<HotelDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null)
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [numRooms, setNumRooms] = useState(1)

  const hotelId = Number(router.params?.hotelId || 0)

  useEffect(() => {
    if (!hotelId || hotelId < 1) {
      Taro.showToast({ title: '缺少酒店信息', icon: 'none' })
      setLoading(false)
      return
    }
    const load = async () => {
      try {
        const data = await fetchHotelDetail(hotelId)
        setDetail(data)
        if (data.roomTypes.length > 0 && !selectedRoom) {
          setSelectedRoom(data.roomTypes[0])
        }
      } catch (e) {
        console.error(e)
        Taro.showToast({ title: '加载失败', icon: 'none' })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [hotelId])

  const handleSubmit = async () => {
    if (!detail || !selectedRoom) {
      Taro.showToast({ title: '请选择房型', icon: 'none' })
      return
    }
    if (!checkInDate || !checkOutDate) {
      Taro.showToast({ title: '请选择入住和离店日期', icon: 'none' })
      return
    }
    if (new Date(checkOutDate) <= new Date(checkInDate)) {
      Taro.showToast({ title: '离店日期须晚于入住日期', icon: 'none' })
      return
    }
    setSubmitting(true)
    try {
      const res = await createOrder({
        hotel_id: detail.hotel.id,
        room_type_id: selectedRoom.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        num_rooms: numRooms,
      })
      if (res.success) {
        Taro.showToast({ title: '订单已创建', icon: 'success' })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/order-list/index' })
        }, 800)
      } else {
        Taro.showToast({ title: res.message || '下单失败', icon: 'none' })
      }
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading || !detail) {
    return (
      <View className='page order-create-page'>
        <Text>加载中...</Text>
      </View>
    )
  }

  const { hotel, roomTypes } = detail

  return (
    <View className='page order-create-page'>
      <View className='order-create-card'>
        <Text className='order-create-title'>填写预订信息</Text>
        <View className='order-hotel-name'>{hotel.name_zh}</View>

        <View className='form-block'>
          <Text className='form-label'>选择房型</Text>
          <View className='room-options'>
            {roomTypes.map((room) => (
              <View
                key={room.id}
                className={'room-option' + (selectedRoom?.id === room.id ? ' room-option--active' : '')}
                onClick={() => setSelectedRoom(room)}
              >
                <Text className='room-option-name'>{room.name}</Text>
                <Text className='room-option-price'>¥{room.base_price}/晚</Text>
              </View>
            ))}
          </View>
        </View>

        <View className='form-block'>
          <Text className='form-label'>入住日期</Text>
          <Picker
            mode='date'
            value={checkInDate}
            start={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setCheckInDate(e.detail.value)}
          >
            <View className='picker-value'>{checkInDate || '请选择入住日期'}</View>
          </Picker>
        </View>
        <View className='form-block'>
          <Text className='form-label'>离店日期</Text>
          <Picker
            mode='date'
            value={checkOutDate}
            start={checkInDate || new Date().toISOString().slice(0, 10)}
            onChange={(e) => setCheckOutDate(e.detail.value)}
          >
            <View className='picker-value'>{checkOutDate || '请选择离店日期'}</View>
          </Picker>
        </View>

        <View className='form-block'>
          <Text className='form-label'>房间数</Text>
          <View className='num-rooms-row'>
            <Button
              className='num-btn'
              size='mini'
              onClick={() => setNumRooms((n) => Math.max(1, n - 1))}
            >
              -
            </Button>
            <Text className='num-rooms-value'>{numRooms}</Text>
            <Button
              className='num-btn'
              size='mini'
              onClick={() => setNumRooms((n) => n + 1)}
            >
              +
            </Button>
          </View>
        </View>

        {selectedRoom && checkInDate && checkOutDate && (
          <View className='form-block total-row'>
            <Text className='form-label'>预估总价</Text>
            <Text className='total-price'>
              ¥
              {(
                parseFloat(selectedRoom.base_price) *
                numRooms *
                Math.ceil(
                  (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) /
                    (24 * 60 * 60 * 1000),
                )
              ).toFixed(2)}
            </Text>
          </View>
        )}

        <Button
          className='submit-btn'
          type='primary'
          loading={submitting}
          onClick={handleSubmit}
        >
          提交订单
        </Button>
      </View>
    </View>
  )
}

export default OrderCreatePage
