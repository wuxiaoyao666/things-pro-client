import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Project {
  id: string
  name: string
  type: 'area' | 'project'
}

export const useProjectStore = defineStore('project', () => {
  // 模拟截图中的数据
  const projects = ref<Project[]>([
    { id: '1', name: '那又怎样', type: 'area' },
    { id: '2', name: '摄影课程', type: 'project' },
    { id: '3', name: '小五狼思维训练', type: 'project' },
    { id: '4', name: '情绪觉知一百讲', type: 'project' },
    { id: '5', name: '成长', type: 'project' },
    { id: '6', name: '武志红的心理学课', type: 'project' },
    { id: '7', name: '编程学习', type: 'project' },
    { id: '8', name: '通往财富自由之路', type: 'project' },
    { id: '9', name: '工作', type: 'project' },
    { id: '10', name: '运动', type: 'project' },
    { id: '11', name: '薛兆丰的经济学课', type: 'project' },
    { id: '12', name: '刘润商学院', type: 'project' },
  ])

  return { projects }
})