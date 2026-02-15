import Taro from '@tarojs/taro'

// 小程序模拟器里 localhost 可能指模拟器自身，用 127.0.0.1 指向本机后端
const BASE_URL = 'http://127.0.0.1:3001/api'
const TOKEN_KEY = 'token'
const USER_KEY = 'userInfo'

export interface UserInfo {
  user_id: string | number
  user_name: string
  isAdmin: boolean
  nickname?: string | null
  avatar_url?: string | null
}

export interface LoginRes {
  success: boolean
  message?: string
  token?: string
  user_id?: string | number
  user_name?: string
  isAdmin?: boolean
  nickname?: string | null
  avatar_url?: string | null
}

export interface RegisterRes {
  success: boolean
  message?: string
}

export function getToken(): string {
  return Taro.getStorageSync(TOKEN_KEY) || ''
}

export function setToken(token: string) {
  Taro.setStorageSync(TOKEN_KEY, token)
}

export function getUser(): UserInfo | null {
  try {
    const raw = Taro.getStorageSync(USER_KEY)
    if (!raw) return null
    return typeof raw === 'string' ? (JSON.parse(raw) as UserInfo) : (raw as UserInfo)
  } catch {
    return null
  }
}

export function setUser(user: UserInfo) {
  Taro.setStorageSync(USER_KEY, JSON.stringify(user))
}

export function clearAuth() {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(USER_KEY)
}

export async function login(username: string, password: string): Promise<LoginRes> {
  const res = await Taro.request<LoginRes>({
    url: `${BASE_URL}/login`,
    method: 'POST',
    data: { username, password },
  })
  const data = res.data
  if (data.success && data.token) {
    setToken(data.token)
    if (data.user_id !== undefined && data.user_name !== undefined) {
      setUser({
        user_id: data.user_id,
        user_name: data.user_name,
        isAdmin: data.isAdmin ?? false,
        nickname: data.nickname ?? null,
        avatar_url: data.avatar_url ?? null,
      })
    }
  }
  return data
}

/** 微信一键登录（code 换 openid） */
export async function wxLogin(code: string): Promise<LoginRes> {
  const res = await Taro.request<LoginRes>({
    url: `${BASE_URL}/wx-login`,
    method: 'POST',
    data: { code },
  })
  const data = res.data
  if (data.success && data.token) {
    setToken(data.token)
    if (data.user_id !== undefined && data.user_name !== undefined) {
      setUser({
        user_id: data.user_id,
        user_name: data.user_name,
        isAdmin: data.isAdmin ?? false,
        nickname: data.nickname ?? null,
        avatar_url: data.avatar_url ?? null,
      })
    }
  }
  return data
}

/** 上传头像，返回可访问的 URL */
export async function uploadAvatar(filePath: string): Promise<string> {
  const token = getToken()
  const res = await new Promise<{ url: string }>((resolve, reject) => {
    Taro.uploadFile({
      url: BASE_URL.replace('/api', '') + '/api/upload-avatar',
      filePath,
      name: 'file',
      header: { Authorization: `Bearer ${token}` },
      success: (r) => {
        try {
          const data = JSON.parse(r.data) as { success?: boolean; url?: string }
          if (data.success && data.url) resolve({ url: data.url })
          else reject(new Error('上传失败'))
        } catch {
          reject(new Error('解析失败'))
        }
      },
      fail: reject,
    })
  })
  return res.url
}

/** 更新当前用户昵称/头像 */
export async function updateProfile(params: {
  nickname?: string
  avatar_url?: string
}): Promise<void> {
  const token = getToken()
  await Taro.request({
    url: `${BASE_URL}/me/profile`,
    method: 'PATCH',
    header: { Authorization: `Bearer ${token}` },
    data: params,
  })
  const u = getUser()
  if (u) {
    if (params.nickname !== undefined) u.nickname = params.nickname
    if (params.avatar_url !== undefined) u.avatar_url = params.avatar_url
    setUser(u)
  }
}

export async function register(params: {
  username: string
  password: string
  email: string
  role?: string
  adminCode?: string
}): Promise<RegisterRes> {
  const res = await Taro.request<RegisterRes>({
    url: `${BASE_URL}/register`,
    method: 'POST',
    data: params,
  })
  return res.data
}

export async function logout(): Promise<void> {
  const token = getToken()
  if (token) {
    try {
      await Taro.request({
        url: `${BASE_URL}/logout`,
        method: 'POST',
        header: { Authorization: `Bearer ${token}` },
      })
    } catch {
      // ignore
    }
  }
  clearAuth()
}
