import type { FC } from 'react'
import { useState } from 'react'
import { View, Text, Input, Button, Picker } from '@tarojs/components'
import Taro from '@tarojs/taro'
import './index.css'

const FEATURED_HOTEL_ID = 1

const starOptions = [0, 3, 4, 5] as const
const priceOptions = ['不限', '￥0-300', '￥300-600', '￥600+'] as const
const tagOptions = ['亲子', '豪华', '免费停车', '含早餐'] as const

const Index: FC = () => {
  const [keyword, setKeyword] = useState('')
  const [locationText, setLocationText] = useState('点击获取当前位置')
  const [checkInDate, setCheckInDate] = useState('')
  const [checkOutDate, setCheckOutDate] = useState('')
  const [starFilter, setStarFilter] = useState<number | 0>(0)
  const [priceFilter, setPriceFilter] = useState<string>('不限')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

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

    if (query) params.keyword = query
    if (locationText && locationText !== '点击获取当前位置')
      params.location = locationText
    if (checkInDate) params.checkIn = checkInDate
    if (checkOutDate) params.checkOut = checkOutDate
    if (starFilter) params.star = String(starFilter)
    if (priceFilter && priceFilter !== '不限') params.price = priceFilter
    if (selectedTags.length > 0) params.tags = selectedTags.join(',')

    const queryString = Object.keys(params)
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
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
      {/* 顶部 Banner */}
      <View className='banner' onClick={handleBannerClick}>
        <View className='banner-content'>
          <Text className='banner-tag'>限时优惠</Text>
          <Text className='banner-title'>精选豪华酒店，最低 8 折起</Text>
          <Text className='banner-subtitle'>点击查看示例酒店详情</Text>
        </View>
      </View>

      {/* 标题区域 */}
      <View className='hero'>
        <Text className='hero-title'>酒店预订平台</Text>
        <Text className='hero-subtitle'>查找心仪酒店，开始你的旅程</Text>
      </View>

      {/* 核心查询区域 */}
      <View className='search-card'>
        {/* 定位 + 关键字 */}
        <View className='field-group'>
          <Text className='field-label'>当前位置</Text>
          <View className='location-row' onClick={handleLocate}>
            <Text className='location-text'>{locationText}</Text>
            <Text className='location-action'>一键定位</Text>
          </View>
        </View>

        <View className='field-group'>
          <Text className='field-label'>目的地 / 酒店名</Text>
          <Input
            className='search-input'
            placeholder='请输入城市或酒店名称'
            value={keyword}
            onInput={(e) => setKeyword(e.detail.value)}
          />
        </View>

        {/* 入住 / 离店日期 */}
        <View className='date-row'>
          <View className='date-field'>
            <Text className='field-label'>入住日期</Text>
            <Picker
              mode='date'
              value={checkInDate}
              onChange={(e) => setCheckInDate(e.detail.value)}
            >
              <View className='picker-field'>
                <Text className='picker-value'>
                  {checkInDate || '请选择入住日期'}
                </Text>
              </View>
            </Picker>
          </View>
          <View className='date-field'>
            <Text className='field-label'>离店日期</Text>
            <Picker
              mode='date'
              value={checkOutDate}
              onChange={(e) => setCheckOutDate(e.detail.value)}
            >
              <View className='picker-field'>
                <Text className='picker-value'>
                  {checkOutDate || '请选择离店日期'}
                </Text>
              </View>
            </Picker>
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
