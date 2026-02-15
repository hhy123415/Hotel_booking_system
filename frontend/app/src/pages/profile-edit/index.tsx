import type { FC } from 'react'
import { useState } from 'react'
import { View, Text, Input, Button, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { getUser, uploadAvatar, updateProfile } from '../../services/auth'
import './index.css'

const ProfileEditPage: FC = () => {
  const user = getUser()
  const [avatarUrl, setAvatarUrl] = useState<string>(user?.avatar_url || '')
  const [nickname, setNickname] = useState<string>(user?.nickname || '')
  const [tempAvatarPath, setTempAvatarPath] = useState('')
  const [loading, setLoading] = useState(false)

  const onChooseAvatar = (e: { detail: { avatarUrl: string } }) => {
    const path = e.detail.avatarUrl
    setTempAvatarPath(path)
    setAvatarUrl(path)
  }

  const handleSubmit = async () => {
    const name = nickname.trim()
    if (!name) {
      Taro.showToast({ title: '请填写昵称', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      let finalAvatarUrl = user?.avatar_url || ''
      if (tempAvatarPath) {
        finalAvatarUrl = await uploadAvatar(tempAvatarPath)
      }
      await updateProfile({ nickname: name, avatar_url: finalAvatarUrl })
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.reLaunch({ url: '/pages/index/index' }), 500)
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '保存失败，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  if (!user) {
    return (
      <View className='page profile-edit-page'>
        <Text>请先登录</Text>
        <Button type='primary' onClick={() => Taro.navigateTo({ url: '/pages/login/index' })}>
          去登录
        </Button>
      </View>
    )
  }

  return (
    <View className='page profile-edit-page'>
      <View className='profile-card'>
        <Text className='profile-title'>完善资料（使用微信头像与昵称）</Text>

        <View className='avatar-row'>
          <Text className='form-label'>头像</Text>
          <Button className='avatar-btn' openType='chooseAvatar' onChooseAvatar={onChooseAvatar}>
            {avatarUrl ? (
              <Image className='avatar-img' src={avatarUrl} mode='aspectFill' />
            ) : (
              <Text className='avatar-placeholder'>点击选择头像</Text>
            )}
          </Button>
        </View>

        <View className='form-item'>
          <Text className='form-label'>昵称</Text>
          <Input
            className='form-input'
            type='nickname'
            placeholder='请输入昵称（可使用微信昵称）'
            value={nickname}
            onInput={(e) => setNickname(e.detail.value)}
          />
        </View>

        <Button
          className='submit-btn'
          type='primary'
          loading={loading}
          onClick={handleSubmit}
        >
          保存
        </Button>
      </View>
    </View>
  )
}

export default ProfileEditPage
