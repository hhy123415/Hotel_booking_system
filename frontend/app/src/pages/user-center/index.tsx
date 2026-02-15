import type { FC } from 'react'
import { useState, useEffect } from 'react'
import { View, Text, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUser, logout } from '../../services/auth'
import './index.css'

const UserCenterPage: FC = () => {
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null)

  useEffect(() => {
    setUser(getUser())
  }, [])

  const goProfileEdit = () => {
    Taro.navigateTo({ url: '/pages/profile-edit/index' })
  }

  const handleLogout = async () => {
    const ok = await new Promise<boolean>((resolve) => {
      Taro.showModal({
        title: '提示',
        content: '确定退出登录吗？',
        success: (res) => resolve(res.confirm),
      })
    })
    if (!ok) return
    await logout()
    Taro.showToast({ title: '已退出', icon: 'success' })
    setTimeout(() => Taro.reLaunch({ url: '/pages/index/index' }), 500)
  }

  if (!user) {
    return (
      <View className='page user-center-page'>
        <Text className='tip'>未登录</Text>
        <Button type='primary' onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>
          去登录
        </Button>
      </View>
    )
  }

  const displayName = user.nickname || user.user_name

  return (
    <View className='page user-center-page'>
      <View className='user-card'>
        {user.avatar_url ? (
          <Image
            className='user-avatar'
            src={user.avatar_url}
            mode='aspectFill'
            onClick={goProfileEdit}
          />
        ) : (
          <View className='user-avatar-placeholder' onClick={goProfileEdit}>
            <Text>设置头像</Text>
          </View>
        )}
        <Text className='user-label'>昵称</Text>
        <Text className='user-value'>{displayName}</Text>
        {user.isAdmin && (
          <Text className='user-badge'>管理员</Text>
        )}
        <Text className='user-edit-link' onClick={goProfileEdit}>
          编辑头像与昵称
        </Text>
      </View>
      <Button className='logout-btn' type='default' onClick={handleLogout}>
        退出登录
      </Button>
    </View>
  )
}

export default UserCenterPage
