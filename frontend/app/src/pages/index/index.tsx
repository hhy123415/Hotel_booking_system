import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { View, Text, Input, Button, Picker, Image } from '@tarojs/components'
import Taro, { useDidShow } from '@tarojs/taro'
import { getUser } from '../../services/auth'
import './index.css'

const FEATURED_HOTEL_ID = 5

const starOptions = [0, 3, 4, 5] as const
const priceOptions = ['不限', '￥0-300', '￥300-600', '￥600+'] as const
const tagOptions = ['亲子', '豪华', '免费停车', '含早餐'] as const

const Index: FC = () => {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)
  const [keyword, setKeyword] = useState('')
  const [locationText, setLocationText] = useState('点击获取当前位置')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [starFilter, setStarFilter] = useState<number | 0>(0)
  const [priceFilter, setPriceFilter] = useState<string>('不限')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [nightCount, setNightCount] = useState<number | null>(null)

  const refreshUser = () => setUser(getUser())

  useEffect(() => { refreshUser() }, [])
  useDidShow(refreshUser)

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end > start) {
        const diff = Math.round(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
        )
        setNightCount(diff)
      } else {
        setNightCount(null)
      }
    } else {
      setNightCount(null)
    }
  }, [checkInDate, checkOutDate])

  const handleLocate = () => {
    Taro.getLocation({
      type: 'wgs84',
      success: (res) => {
        const text = `已定位：${res.latitude.toFixed(3)}, ${res.longitude.toFixed(3)}`
        setLocationText(text)
      },
      fail: () => {
        Taro.showToast({
          title: '定位失败，请检查权限',
          icon: 'none',
        })
      },
    })
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag],
    )
  }

  const handleSearch = () => {
    const query = keyword.trim()
    const params: Record<string, string> = {}

    let minPrice: number | undefined
    let maxPrice: number | undefined

    if (query) params.keyword = query
    if (locationText && locationText !== '点击获取当前位置')
      params.location = locationText
    if (checkInDate) params.checkIn = checkInDate
    if (checkOutDate) params.checkOut = checkOutDate
    if (starFilter) params.star = String(starFilter)
    if (priceFilter && priceFilter !== '不限') {
      params.price = priceFilter
      if (priceFilter === '￥0-300') {
        minPrice = 0
        maxPrice = 300
      } else if (priceFilter === '￥300-600') {
        minPrice = 300
        maxPrice = 600
      } else if (priceFilter === '￥600+') {
        minPrice = 600
      }
    }
    if (typeof minPrice === 'number') params.minPrice = String(minPrice)
    if (typeof maxPrice === 'number') params.maxPrice = String(maxPrice)
    if (selectedTags.length > 0) params.tags = selectedTags.join(',')

    // 这里不手动 encode，交给 Taro/微信处理，避免在列表页看到一串 %E5%... 的编码
    const queryString = Object.keys(params)
      .map((key) => `${key}=${params[key]}`)
      .join('&')

    const url = queryString
      ? `/pages/hotel-list/index?${queryString}`
      : '/pages/hotel-list/index'

    Taro.navigateTo({ url })
  }

  const handleBannerClick = () => {
    Taro.navigateTo({
      url: `/pages/hotel-detail/index?id=${FEATURED_HOTEL_ID}`,
    })
  }

  return (
    <View className='page index-page'>
      {/* 登录/我的 入口 */}
      <View className='index-user-bar'>
        <Text
          className='index-user-link'
          onClick={() =>
            Taro.navigateTo({
              url: user ? '/pages/user-center/index' : '/pages/login/index',
            })
          }
        >
          {user ? `我的 (${user.nickname || user.user_name})` : '登录'}
        </Text>
      </View>

      {/* 顶部推广 Banner，展示推荐酒店图片 */}
      <View className='banner' onClick={handleBannerClick}>
        <View className='banner-photo'>
          <Image
            className='banner-img'
            src='http://127.0.0.1:3001/uploads/77da80824644aecd1b327a3aefbd245b.jpg'
            mode='aspectFill'
          />
        </View>
        <View className='banner-content'>
          <Text className='banner-tag'>推荐酒店</Text>
          <Text className='banner-title'>小酒店 · 精选度假推荐</Text>
          <Text className='banner-subtitle'>限时优惠，点击查看酒店详情</Text>
        </View>
      </View>

      {/* 核心查询区域，整体布局参考常见酒店平台首页 */}
      <View className='search-card'>
        {/* 上方类型切换标签（国内 / 海外 / 钟点房 / 民宿） */}
        <View className='tab-row'>
          <Text className='tab-item tab-item-active'>国内</Text>
          <Text className='tab-item'>海外</Text>
          <Text className='tab-item'>钟点房</Text>
          <Text className='tab-item'>民宿</Text>
        </View>

        {/* 目的地 + 搜索关键字 */}
        <View className='destination-row'>
          <View className='destination-left'>
            <Text className='destination-city'>
              {locationText === '点击获取当前位置' ? '国内热门' : '已定位'}
            </Text>
            <Text className='destination-arrow'>⌵</Text>
          </View>
          <Input
            className='destination-input'
            placeholder='位置 / 品牌 / 酒店'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
          />
          <View className='destination-locate' onClick={handleLocate}>
            <Text className='destination-locate-icon'>定位</Text>
          </View>
        </View>

        {/* 入住 / 离店日期 + 晚数 */}
        <View className='date-banner'>
          <Picker
            mode='date'
            value={checkInDate}
            onChange={(e) => setCheckInDate(e.detail.value)}
          >
            <View className='date-banner-part'>
              <Text className='date-banner-label'>入住</Text>
              <Text className='date-banner-value'>
                {checkInDate || '请选择入住日期'}
              </Text>
            </View>
          </Picker>
          <Text className='date-banner-sep'>—</Text>
          <Picker
            mode='date'
            value={checkOutDate}
            onChange={(e) => setCheckOutDate(e.detail.value)}
          >
            <View className='date-banner-part'>
              <Text className='date-banner-label'>离店</Text>
              <Text className='date-banner-value'>
                {checkOutDate || '请选择离店日期'}
              </Text>
            </View>
          </Picker>
          <View className='date-banner-right'>
            <Text className='date-banner-night'>
              共 {nightCount || 1} 晚
            </Text>
            <Text className='date-banner-tip'>默认 1 间 2 人</Text>
          </View>
        </View>

        {/* 筛选条件：星级 / 价格 */}
        <View className='filter-row'>
          <View className='filter-group'>
            <Text className='field-label'>酒店星级</Text>
            <View className='chip-row'>
              {starOptions.map((star) => (
                <View
                  key={star}
                  className={
                    starFilter === star ? 'chip chip-active' : 'chip'
                  }
                  onClick={() => setStarFilter(star)}
                >
                  <Text>
                    {star === 0 ? '不限' : `${star} 星及以上`}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className='filter-group'>
            <Text className='field-label'>价格范围</Text>
            <View className='chip-row'>
              {priceOptions.map((price) => (
                <View
                  key={price}
                  className={
                    priceFilter === price ? 'chip chip-active' : 'chip'
                  }
                  onClick={() => setPriceFilter(price)}
                >
                  <Text>{price}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* 快捷标签 */}
        <View className='field-group'>
          <Text className='field-label'>快捷标签</Text>
          <View className='chip-row'>
            {tagOptions.map((tag) => (
              <View
                key={tag}
                className={
                  selectedTags.includes(tag) ? 'chip chip-active' : 'chip'
                }
                onClick={() => toggleTag(tag)}
              >
                <Text>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 查询按钮 */}
        <Button className='search-button' type='primary' onClick={handleSearch}>
          搜索酒店
        </Button>
      </View>
    </View>
  )
}

export default Index
