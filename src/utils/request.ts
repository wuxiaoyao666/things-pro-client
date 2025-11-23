import axios, { type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios'
import { useUserStore } from '@/stores/userStore.ts'
import router from '@/router'

import { toast } from 'vue-sonner'

const showError = (msg: string) => {
  toast.error(msg)
}

const service = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || '',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const userStore = useUserStore()
    if (userStore.token && config.headers) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg, data } = response.data

    if (code === 200) {
      // 可选：如果是 POST/PUT/DELETE 请求成功，也可以弹一个成功的 Toast
      // if (response.config.method !== 'get') {
      //    toast.success(msg || '操作成功')
      // }
      return response.data
    }

    showError(msg || '业务处理失败')
    return Promise.reject(new Error(msg || 'Error'))
  },
  (error: AxiosError) => {
    let message = '请求失败'
    const status = error.response?.status

    switch (status) {
      case 401:
        message = '登录已过期，请重新登录'
        const userStore = useUserStore()
        userStore.logout()
        router.push('/login')
        break
      case 403:
        message = '没有权限访问'
        break
      case 404:
        message = '接口不存在'
        break
      case 500:
        message = '服务器内部错误'
        break
      default:
        if (error.message.includes('timeout')) message = '请求超时'
        else if (error.message.includes('Network Error')) message = '网络连接异常'
    }

    showError(message)
    return Promise.reject(error)
  }
)

export default service