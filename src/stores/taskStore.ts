import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { reqGetTaskList, type TaskVO } from '@/api/task'

export const useTaskStore = defineStore('task', () => {
  // 存储"今天视图"的任务数据
  const todayTasks = ref<TaskVO[]>([])

  // 获取今天的任务
  const getTodayTasks = async () => {
    try {
      const res = await reqGetTaskList({
        isToday: true,
        status: [0] // 只查未完成
      })
      todayTasks.value = res.data
    } catch (error) {
      console.error('获取今日任务失败', error)
    }
  }

  // -----------------------------------------
  // Getters (计算属性)
  // -----------------------------------------

  // 1. 今天列表的总数
  const todayCount = computed(() => todayTasks.value.length)

  // 2. 过期任务数 (endTime < 今天)
  const overdueCount = computed(() => {
    // 获取今天的 YYYY-MM-DD
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const todayStr = `${year}-${month}-${day}`

    return todayTasks.value.filter(t => {
      // 必须有截止日期，且截止日期 < 今天
      return t.endTime && t.endTime < todayStr
    }).length
  })

  return {
    todayTasks,
    todayCount,
    overdueCount,
    getTodayTasks
  }
})