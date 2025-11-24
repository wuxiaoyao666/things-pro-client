import request from '@/utils/request'
import type { Result } from '@/api/types'

// 对应后端的 ProjectSidebarVO
export interface ProjectSidebarVO {
  id: string
  name: string
  order: number
  progress: number // 0 - 100
}

enum API {
  Sidebar = '/project/sidebar', // ✅ 专用接口
  Create = '/project',
  // Detail = '/project/:id' // 后续详情页用
}

// 获取侧边栏项目列表
export const reqGetSidebar = () => {
  return request.get<any, Result<ProjectSidebarVO[]>>(API.Sidebar)
}

// 创建项目 (顺便把创建也定义了，Sidebar 底部的按钮要用)
export const reqCreateProject = (name: string) => {
  return request.post<any, Result<{ id: string }>>(API.Create, { name })
}