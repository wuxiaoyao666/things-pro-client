import request from '@/utils/request'
import type { Result } from '@/api/types'
import type { TagVO } from '@/api/tag.ts'

// 检查项视图
export interface CheckListItem {
  title: string
  done: boolean
}

// 任务视图
export interface TaskVO {
  id: string
  name: string
  description: string
  status: number // 0:进行中, 1:已完成, 2:已取消, 3:废纸篓
  order: number

  // 归属信息
  projectId: string | null
  projectName: string
  titleId: string | null

  // 关联信息
  tags: TagVO[]

  // 时间信息 (后端返回 "YYYY-MM-DD" 字符串)
  startTime: string | null
  endTime: string | null

  // 检查项 & 进度
  checklist: CheckListItem[]
  checkTotal: number
  checkDone: number
}

// 通用查询参数
export interface GetTaskListParams {
  name?: string
  status?: number[] // 支持多选 [0, 1]
  type?: number[]   // 支持多选 [1, 2]
  tagIds?: string[]
  projectId?: string
  isToday?: boolean // 重点：今天视图开关
}

// 获取任务列表参数
export interface GetTaskListParams {
  name?: string
  status?: number[] // 支持多选 [0, 1]
  type?: number[]   // 支持多选 [1, 2] (1:Inbox, 2:Someday)
  tagIds?: string[]
  projectId?: string
  isToday?: boolean // 今天视图开关
}

// 创建任务参数
export interface CreateTaskParams {
  name: string
  description?: string
  project_id?: string
  type?: number
  // ... 其他可选字段
}

// 更新任务参数
export interface UpdateTaskParams {
  id: string
  name: string          // 必填：否则后端会变成空字符串
  description?: string  // 选填：传空字符串会清空备注

  status?: number       // 0-3
  order?: number
  type?: number         // 0:Project, 1:Inbox, 2:Someday

  projectId?: string | null // 允许传 null (移入收件箱)
  titleId?: string | null

  tagIds?: string[]     // 标签 ID 数组

  startTime?: string | null // "YYYY-MM-DD"
  endTime?: string | null   // "YYYY-MM-DD"

  checklist?: CheckListItem[] // 检查项列表
}

enum API {
  List = '/task/list', // 改为通用 List 接口
  Create = '/task',
  Update = '/task',
  Delete = '/task'
}

// 通用获取任务列表
export const reqGetTaskList = (params: GetTaskListParams) => {
  return request.get<any, Result<TaskVO[]>>(API.List, { params })
}

// 创建任务
export const reqCreateTask = (data: CreateTaskParams) => {
  return request.post<any, Result<{ id: string }>>(API.Create, data)
}

// 更新任务
export const reqUpdateTask = (data: UpdateTaskParams) => {
  return request.put<any, Result<any>>(API.Update, data)
}

// 删除任务
export const reqDeleteTask = (id: string) => {
  return request.delete<any, Result<any>>(`${API.Delete}/${id}`)
}