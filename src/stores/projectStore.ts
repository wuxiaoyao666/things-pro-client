import { defineStore } from 'pinia'
import { ref } from 'vue'
import { reqGetSidebar, type ProjectSidebarVO } from '@/api/project'

export const useProjectStore = defineStore('project', () => {
  // 使用正确的类型
  const projectSidebar = ref<ProjectSidebarVO[]>([])

  // 获取列表
  const getProjectSidebar = async () => {
    try {
      const res = await reqGetSidebar()
      projectSidebar.value = res.data
    } catch (error) {
      console.error('获取项目列表失败', error)
    }
  }

  return {
    projectSidebar,
    getProjectSidebar
  }
})