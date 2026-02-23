import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

import { fetchHotelList } from '../../services/hotel'
import type { Hotel } from '../../types/hotel'

import './index.css'

const HotelListPage: FC = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [keyword, setKeyword] = useState<string>('')

  useEffect(() => {
    const rawKeyword = (router.params.keyword as string) || ''
    const initialKeyword = rawKeyword ? decodeURIComponent(rawKeyword) : ''
    const starParam = router.params.star ? Number(router.params.star) : undefined
    const checkIn = (router.params.checkIn as string) || ''
    setKeyword(initialKeyword)

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchHotelList({
          page: 1,
          pageSize: 20,
          keyword: initialKeyword,
          star: starParam && starParam > 0 ? starParam : undefined,
          checkIn: checkIn || undefined,
        })

        // 直接使用后端返回的数据，不再做前端兜底过滤
        setHotels(res.data || [])
      } catch (error) {
        console.error('加载酒店列表失败', error)
        Taro.showToast({
          title: '暂时无法获取酒店数据',
          icon: 'none',
        })
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router.params.keyword, router.params.star, router.params.checkIn])

  const handleItemClick = (id: number) => {
    Taro.navigateTo({
      url: `/pages/hotel-detail/index?id=${id}`,
    })
  }

  return (
    <View className='page hotel-list-page'>
      {keyword && (
        <View className='list-header'>
          <Text className='list-subtitle'>
            搜索关键字：<Text className='highlight'>{keyword}</Text>
          </Text>
        </View>
      )}

      <ScrollView
        className='list-scroll'
        scrollY
        enableFlex
      >
        {loading && (
          <View className='empty'>
            <Text>正在加载酒店列表...</Text>
          </View>
        )}

        {!loading && hotels.length === 0 && (
          <View className='empty'>
            <Text>暂时没有找到符合条件的酒店</Text>
          </View>
        )}

        {!loading &&
          hotels.map((hotel) => (
            <View
              key={hotel.id}
              className='hotel-card'
              onClick={() => handleItemClick(hotel.id)}
            >
              <View className='hotel-card-header'>
                <Text className='hotel-name-zh'>{hotel.name_zh}</Text>
                {hotel.star_rating && (
                  <Text className='hotel-star'>{hotel.star_rating} 星</Text>
                )}
              </View>
              <Text className='hotel-name-en'>{hotel.name_en}</Text>
              <Text className='hotel-address'>{hotel.address}</Text>
            </View>
          ))}
      </ScrollView>
    </View>
  )
}

export default HotelListPage

