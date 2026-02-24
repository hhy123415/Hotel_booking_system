import type { FC } from 'react'
import { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { login, wxLogin } from '../../services/auth'
import './index.css'

const LoginPage: FC = () => {
  const [useWx, setUseWx] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWxLogin = async () => {
    setLoading(true)
    try {
      const { code } = await Taro.login()
      if (!code) {
        Taro.showToast({ title: '获取微信登录态失败', icon: 'none' })
        return
      }
      const res = await wxLogin(code)
      if (res.success) {
        Taro.showToast({ title: '登录成功', icon: 'success' })
        const needProfile = !res.nickname && !res.avatar_url
        setTimeout(() => {
          if (needProfile) {
            Taro.redirectTo({ url: '/pages/profile-edit/index' })
          } else {
            Taro.reLaunch({ url: '/pages/index/index' })
          }
        }, 500)
      } else {
        Taro.showToast({ title: res.message || '登录失败', icon: 'none' })
      }
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    const u = username.trim()
    const p = password.trim()
    if (!u || !p) {
      Taro.showToast({ title: '请输入用户名和密码', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await login(u, p)
      if (res.success) {
        Taro.showToast({ title: '登录成功', icon: 'success' })
        setTimeout(() => Taro.reLaunch({ url: '/pages/index/index' }), 500)
      } else {
        Taro.showToast({ title: res.message || '登录失败', icon: 'none' })
      }
    } catch (e) {
      console.error(e)
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const goRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' })
  }

  return (
    <View className='page login-page'>
      <View className='login-hero'>
        <Text className='login-hero-title'>欢迎登录酒店预订平台</Text>
        <Text className='login-hero-subtitle'>
          使用微信一键登录，快速同步您的订单与个人信息
        </Text>
      </View>

      <View className='login-card'>
        <Text className='login-title'>用户登录</Text>

        {/* 微信一键登录（主入口） */}
        <Button
          className='wx-login-btn'
          loading={loading && useWx}
          onClick={handleWxLogin}
        >
          微信一键登录
        </Button>

        <View className='divider'>
          <Text className='divider-text'>或</Text>
        </View>

        {/* 账号密码登录（折叠） */}
        {!useWx && (
          <>
            <View className='form-item'>
              <Text className='form-label'>用户名</Text>
              <Input
                className='form-input'
                placeholder='请输入用户名'
                value={username}
                onInput={(e) => setUsername(e.detail.value)}
              />
            </View>
            <View className='form-item'>
              <Text className='form-label'>密码</Text>
              <Input
                className='form-input'
                password
                placeholder='请输入密码'
                value={password}
                onInput={(e) => setPassword(e.detail.value)}
              />
            </View>
            <Button
              className='submit-btn'
              type='primary'
              loading={loading}
              onClick={handlePasswordLogin}
            >
              登录
            </Button>
          </>
        )}
        <View className='footer-link'>
          <Text
            className='link'
            onClick={() => setUseWx(!useWx)}
          >
            {useWx ? '使用账号密码登录' : '使用微信一键登录'}
          </Text>
          {!useWx && (
            <>
              <Text className='link-split'> | </Text>
              <Text className='link' onClick={goRegister}>
                没有账号？去注册
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  )
}

export default LoginPage
