import type { FC } from 'react'
import { useState } from 'react'
import { View, Text, Input, Button } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { register } from '../../services/auth'
import './index.css'

const RegisterPage: FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    const u = username.trim()
    const p = password.trim()
    const e = email.trim()
    if (!u || !p || !e) {
      Taro.showToast({ title: '请填写用户名、密码和邮箱', icon: 'none' })
      return
    }
    if (p.length < 6) {
      Taro.showToast({ title: '密码至少 6 位', icon: 'none' })
      return
    }
    setLoading(true)
    try {
      const res = await register({ username: u, password: p, email: e })
      if (res.success) {
        Taro.showToast({ title: '注册成功，请登录', icon: 'success' })
        setTimeout(() => {
          Taro.redirectTo({ url: '/pages/login/index' })
        }, 500)
      } else {
        Taro.showToast({ title: res.message || '注册失败', icon: 'none' })
      }
    } catch (err) {
      console.error(err)
      Taro.showToast({ title: '网络错误，请重试', icon: 'none' })
    } finally {
      setLoading(false)
    }
  }

  const goLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' })
  }

  return (
    <View className='page register-page'>
      <View className='register-card'>
        <Text className='register-title'>用户注册</Text>
        <View className='form-item'>
          <Text className='form-label'>用户名</Text>
          <Input
            className='form-input'
            placeholder='请输入用户名'
            value={username}
            onInput={(ev) => setUsername(ev.detail.value)}
          />
        </View>
        <View className='form-item'>
          <Text className='form-label'>密码（至少6位）</Text>
          <Input
            className='form-input'
            password
            placeholder='请输入密码'
            value={password}
            onInput={(ev) => setPassword(ev.detail.value)}
          />
        </View>
        <View className='form-item'>
          <Text className='form-label'>邮箱</Text>
          <Input
            className='form-input'
            placeholder='请输入邮箱'
            value={email}
            onInput={(ev) => setEmail(ev.detail.value)}
          />
        </View>
        <Button
          className='submit-btn'
          type='primary'
          loading={loading}
          onClick={handleSubmit}
        >
          注册
        </Button>
        <View className='footer-link'>
          <Text className='link' onClick={goLogin}>
            已有账号？去登录
          </Text>
        </View>
      </View>
    </View>
  )
}

export default RegisterPage
