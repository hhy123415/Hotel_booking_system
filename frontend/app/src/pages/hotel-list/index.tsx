import type { FC } from 'react'
import { useEffect, useState } from 'react'
import { View, Text, ScrollView, Image } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'

import { fetchHotelList } from '../../services/hotel'
import type { Hotel } from '../../types/hotel'

import './index.css'

const HotelListPage: FC = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [hotels, setHotels] = useState<Hotel[]>([]) // 原始列表
  const [displayHotels, setDisplayHotels] = useState<Hotel[]>([]) // 应用排序 / 筛选后的列表
  const [keyword, setKeyword] = useState<string>('')
  const [checkInText, setCheckInText] = useState<string>('')
  const [checkOutText, setCheckOutText] = useState<string>('')
  const [nightCount, setNightCount] = useState<number | null>(null)
  const [activeSort, setActiveSort] = useState<'recommend' | 'distance' | 'star'>('recommend')
  const [minStarFilter, setMinStarFilter] = useState<number>(0)
  const [filterPanelVisible, setFilterPanelVisible] = useState(false)
  const [minPriceFilter, setMinPriceFilter] = useState<number | undefined>(undefined)
  const [maxPriceFilter, setMaxPriceFilter] = useState<number | undefined>(undefined)

  const applySortAndFilter = (
    source: Hotel[],
    sort: 'recommend' | 'distance' | 'star',
    minStar: number,
    minPrice?: number,
    maxPrice?: number,
  ) => {
    let list = [...source]

    // 星级筛选
    if (minStar > 0) {
      list = list.filter((hotel) => (hotel.star_rating || 0) >= minStar)
    }

    // 排序逻辑
    if (sort === 'star') {
      list.sort(
        (a, b) => (b.star_rating || 0) - (a.star_rating || 0),
      )
    } else if (sort === 'distance') {
      // 目前没有实际距离数据，这里简单按 id 排序，主要体现交互
      list.sort((a, b) => a.id - b.id)
    }

    setDisplayHotels(list)
  }

  useEffect(() => {
    const rawKeyword = (router.params.keyword as string) || ''
    const initialKeyword = rawKeyword ? decodeURIComponent(rawKeyword) : ''
    const starParam = router.params.star ? Number(router.params.star) : undefined
    const checkIn = (router.params.checkIn as string) || ''
    const checkOut = (router.params.checkOut as string) || ''
    const minPriceParam = router.params.minPrice ? Number(router.params.minPrice) : undefined
    const maxPriceParam = router.params.maxPrice ? Number(router.params.maxPrice) : undefined
    setKeyword(initialKeyword)
    setCheckInText(checkIn)
    setCheckOutText(checkOut)
    setMinPriceFilter(
      typeof minPriceParam === 'number' && !Number.isNaN(minPriceParam)
        ? minPriceParam
        : undefined,
    )
    setMaxPriceFilter(
      typeof maxPriceParam === 'number' && !Number.isNaN(maxPriceParam)
        ? maxPriceParam
        : undefined,
    )

    // 计算入住晚数
    if (checkIn && checkOut) {
      const start = new Date(checkIn)
      const end = new Date(checkOut)
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

    const load = async () => {
      try {
        setLoading(true)
        const res = await fetchHotelList({
          page: 1,
          pageSize: 20,
          keyword: initialKeyword,
          star: starParam && starParam > 0 ? starParam : undefined,
          checkIn: checkIn || undefined,
          minPrice: minPriceParam,
          maxPrice: maxPriceParam,
        })

        const list = res.data || []
        setHotels(list)
        applySortAndFilter(list, activeSort, minStarFilter)
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
  // 当路由参数变化时重新拉取数据
  }, [
    router.params.keyword,
    router.params.star,
    router.params.checkIn,
    router.params.checkOut,
    router.params.minPrice,
    router.params.maxPrice,
  ])

  // 当排序 / 本地筛选条件变化时，重新基于原始列表计算展示列表
  useEffect(() => {
    applySortAndFilter(hotels, activeSort, minStarFilter, minPriceFilter, maxPriceFilter)
  }, [hotels, activeSort, minStarFilter, minPriceFilter, maxPriceFilter])

  const handleItemClick = (id: number) => {
    const params: string[] = [`id=${id}`]
    if (checkInText) params.push(`checkIn=${checkInText}`)
    if (checkOutText) params.push(`checkOut=${checkOutText}`)
    const url = `/pages/hotel-detail/index?${params.join('&')}`
    Taro.navigateTo({ url })
  }

  return (
    <View className='page hotel-list-page'>
      {/* 顶部条件区域：城市 / 日期 / 入住晚数 */}
      <View className='list-top-bar'>
        <View className='top-main-row'>
          <Text className='top-city'>{keyword || '全部目的地'}</Text>
          <Text className='top-nights'>
            {checkInText && checkOutText && nightCount
              ? `${checkInText} - ${checkOutText} · 共 ${nightCount} 晚`
              : checkInText
                ? `${checkInText} 入住 · 1 晚`
                : '请选择入住日期'}
          </Text>
        </View>
        <View className='top-sub-row'>
          <Text className='top-sub-text'>
            共 {hotels.length} 家酒店
          </Text>
        </View>
      </View>

      <View className='filter-tabs'>
        <View
          className={
            activeSort === 'recommend'
              ? 'filter-tab filter-tab-active'
              : 'filter-tab'
          }
          onClick={() => setActiveSort('recommend')}
        >
          <Text>推荐排序</Text>
        </View>
        <View
          className={
            activeSort === 'distance'
              ? 'filter-tab filter-tab-active'
              : 'filter-tab'
          }
          onClick={() => {
            setActiveSort('distance')
            Taro.showToast({
              title: '暂未接入真实距离，仅示例排序',
              icon: 'none',
              duration: 1500,
            })
          }}
        >
          <Text>位置距离</Text>
        </View>
        <View
          className={
            activeSort === 'star' ? 'filter-tab filter-tab-active' : 'filter-tab'
          }
          onClick={() => setActiveSort('star')}
        >
          <Text>价格/星级</Text>
        </View>
        <View
          className='filter-tab'
          onClick={() => setFilterPanelVisible(true)}
        >
          <Text>筛选</Text>
        </View>
      </View>

      {/* 星级 + 价格筛选面板 */}
      {filterPanelVisible && (
        <View className='filter-mask' onClick={() => setFilterPanelVisible(false)}>
          <View
            className='filter-panel'
            onClick={(e) => {
              // 阻止冒泡，避免点击面板关闭
              e.stopPropagation()
            }}
          >
            <Text className='filter-panel-title'>条件筛选</Text>
            <View className='filter-panel-options'>
              <Text className='filter-panel-subtitle'>星级</Text>
              {[0, 3, 4, 5].map((star) => (
                <View
                  key={star}
                  className={
                    minStarFilter === star
                      ? 'filter-chip filter-chip-active'
                      : 'filter-chip'
                  }
                  onClick={() => setMinStarFilter(star)}
                >
                  <Text>
                    {star === 0 ? '不限' : `${star} 星及以上`}
                  </Text>
                </View>
              ))}
            </View>
            <View className='filter-panel-options'>
              <Text className='filter-panel-subtitle'>价格区间</Text>
              {[
                { label: '不限', min: undefined, max: undefined },
                { label: '￥0-300', min: 0, max: 300 },
                { label: '￥300-600', min: 300, max: 600 },
                { label: '￥600+', min: 600, max: undefined },
              ].map((range) => {
                const active =
                  range.min === minPriceFilter && range.max === maxPriceFilter
              || (!range.min && !range.max && minPriceFilter === undefined && maxPriceFilter === undefined)
                return (
                  <View
                    key={range.label}
                    className={
                      active
                        ? 'filter-chip filter-chip-active'
                        : 'filter-chip'
                    }
                    onClick={() => {
                      setMinPriceFilter(range.min)
                      setMaxPriceFilter(range.max)
                    }}
                  >
                    <Text>{range.label}</Text>
                  </View>
                )
              })}
            </View>
            <View className='filter-panel-footer'>
              <View
                className='filter-btn reset'
                onClick={() => {
                  setMinStarFilter(0)
                  setMinPriceFilter(undefined)
                  setMaxPriceFilter(undefined)
                }}
              >
                <Text>重置</Text>
              </View>
              <View
                className='filter-btn confirm'
                onClick={() => {
                  const params: Record<string, string> = {}
                  if (keyword) params.keyword = keyword
                  if (checkInText) params.checkIn = checkInText
                  if (checkOutText) params.checkOut = checkOutText
                  if (minStarFilter > 0) params.star = String(minStarFilter)
                  if (typeof minPriceFilter === 'number') {
                    params.minPrice = String(minPriceFilter)
                  }
                  if (typeof maxPriceFilter === 'number') {
                    params.maxPrice = String(maxPriceFilter)
                  }
                  const query = Object.keys(params)
                    .map((k) => `${k}=${params[k]}`)
                    .join('&')
                  const url = query
                    ? `/pages/hotel-list/index?${query}`
                    : '/pages/hotel-list/index'

                  setFilterPanelVisible(false)
                  Taro.redirectTo({ url })
                }}
              >
                <Text>完成</Text>
              </View>
            </View>
          </View>
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

        {!loading && displayHotels.length === 0 && (
          <View className='empty'>
            <Text>暂时没有找到符合条件的酒店</Text>
          </View>
        )}

        {!loading &&
          displayHotels.map((hotel) => (
            <View
              key={hotel.id}
              className='hotel-card'
              onClick={() => handleItemClick(hotel.id)}
            >
              <View className='hotel-card-inner'>
                <View className='hotel-thumb'>
                  {hotel.image_url && (
                    <Image
                      className='hotel-thumb-img'
                      src={`http://127.0.0.1:3001${hotel.image_url}`}
                      mode='aspectFill'
                    />
                  )}
                </View>
                <View className='hotel-info'>
                  <View className='hotel-card-header'>
                    <Text className='hotel-name-zh'>{hotel.name_zh}</Text>
                    {hotel.star_rating && (
                      <Text className='hotel-star'>{hotel.star_rating} 星</Text>
                    )}
                  </View>
                  <Text className='hotel-name-en'>{hotel.name_en}</Text>
                  <Text className='hotel-address'>{hotel.address}</Text>
                </View>
              </View>
            </View>
          ))}
      </ScrollView>
    </View>
  )
}

export default HotelListPage

