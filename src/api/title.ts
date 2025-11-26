import type { TaskVO } from '@/api/task.ts'
import { Result } from 'postcss'
import request from '@/utils/request.ts'

export interface TitleVO {
  id: string
  title: string
  order: number
}

export interface TitleGroup {
  title: TitleVO | null
  tasks: TaskVO[]
}

export interface UpdateTitleParams {
  id: string
  title?: string
  order?: number
}

enum API {
  Title = '/title'
}

export const reqUpdateTitle = (data: UpdateTitleParams) => {
  return request.put<any, Result<any>>(API.Title, data)
}