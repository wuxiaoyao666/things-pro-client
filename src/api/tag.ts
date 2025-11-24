import request from '@/utils/request'
import { Result } from 'postcss'

export interface TagVO {
  id: string
  name: string
  color: string
}

enum API {
  List = '/tag/list',
  Create = '/tag',
}

// 获取标签列表
export const reqGetTags = (name?: string) => {
  return request.get<any, Result<TagVO[]>>(API.List, { params: { name } })
}

// 创建标签
export const reqCreateTag = (name: string, color?: string) => {
  return request.post<any, Result<string>>(API.Create, { name, color })
}