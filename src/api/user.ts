import request from '@/utils/request'
import type { Result } from '@/api/types'


// 登录参数
export interface LoginParams {
  username: string
  password: string
}

// 用户信息
export interface UserInfoVO {
  id: string        // 雪花算法 ID，前端是字符串
  username: string
  nickName: string
  avatar: string
  sex: number       // 0:男 1:女
  email: string
  phone: string
}

// 登录响应数据
export interface LoginResult {
  token: string
}

// ---------------- 接口请求定义 ----------------

enum API {
  Login = '/user/login', // 对应后端的 /api/v1/auth/login (baseURL已配/api/v1)
  Info = '/user/info',   // 对应后端的 /api/v1/user/info
  Register = '/user/register'
}

// 登录接口
export const reqLogin = (data: LoginParams) => {
  return request.post<any, Result<LoginResult>>(API.Login, data)
}

// 获取用户信息接口
export const reqInfo = () => {
  return request.get<any, Result<UserInfoVO>>(API.Info)
}

// 注册接口
export const reqRegister = (data: any) => {
  return request.post<any, Result<any>>(API.Register, data)
}