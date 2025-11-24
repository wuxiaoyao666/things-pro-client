<template>
  <div class="flex-1 h-full bg-white flex flex-col overflow-hidden">
    <header class="pt-10 px-10 pb-2 shrink-0">
      <div class="flex items-center space-x-2 mb-4">
        <Star class="w-7 h-7 text-[#f5cc00] fill-current" />
        <h1 class="text-3xl font-bold text-[#333] tracking-tight">今天</h1>
        <span class="text-gray-300 text-lg font-medium ml-2">{{ formattedDate }}</span>
      </div>

      <div v-if="allTags.length > 0" class="flex items-center flex-wrap gap-2 mb-4">
        <button
          @click="activeTagId = ''"
          class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200"
          :class="activeTagId === '' ? 'bg-[#a0a0a0] text-white' : 'bg-[#e5e5e5] text-gray-500 hover:bg-[#d0d0d0]'"
        >
          全部
        </button>

        <button
          v-for="tag in allTags"
          :key="tag.id"
          @click="toggleTagFilter(tag.id)"
          class="px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 border"
          :class="activeTagId === tag.id ? 'text-white' : 'text-gray-500 bg-white hover:bg-gray-50'"
          :style="activeTagId === tag.id ? { backgroundColor: tag.color || '#8E8E93', borderColor: tag.color || '#8E8E93' } : { borderColor: '#e5e5e5' }"
        >
          {{ tag.name }}
        </button>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar">

      <div v-if="loading" class="text-gray-400 text-sm mt-4">加载中...</div>

      <div v-else>
        <div v-if="filteredTasks.length === 0" class="mt-10 text-center text-gray-400 text-sm">
          没有任务
        </div>

        <div class="space-y-1">
          <template v-for="task in filteredTasks" :key="task.id">

            <Transition name="task-switch" mode="out-in">

              <div v-if="editingTaskId === task.id">
                <TaskEditor
                  :task="task"
                  @close="editingTaskId = null"
                  @update="refreshData"
                />
              </div>

              <div v-else>
                <TaskItem
                  :task="task"
                  @toggle="handleToggleTask"
                  @dblclick="editingTaskId = task.id"
                />
              </div>

            </Transition>

          </template>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Star } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import TaskItem from '@/components/TaskItem.vue'
import TaskEditor from '@/components/TaskEditor.vue'
import { useTaskStore } from '@/stores/taskStore'
import { reqUpdateTask } from '@/api/task'
import type { TaskVO } from '@/api/task'

const taskStore = useTaskStore()
const loading = ref(false)
const activeTagId = ref('')
const editingTaskId = ref<string | null>(null)

const formattedDate = computed(() => {
  return new Date().toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', weekday: 'long' })
})

onMounted(async () => {
  loadData()
})

const loadData = async () => {
  loading.value = true
  await taskStore.getTodayTasks()
  loading.value = false
}

const refreshData = () => {
  taskStore.getTodayTasks()
}

const allTags = computed(() => {
  const tagsMap = new Map()
  taskStore.todayTasks.forEach(task => {
    task.tags?.forEach(tag => {
      if (!tagsMap.has(tag.id)) tagsMap.set(tag.id, tag)
    })
  })
  return Array.from(tagsMap.values())
})

const filteredTasks = computed(() => {
  const list = taskStore.todayTasks
  if (!activeTagId.value) return list
  return list.filter(task => task.tags?.some(t => t.id === activeTagId.value))
})

const toggleTagFilter = (id: string) => {
  activeTagId.value = activeTagId.value === id ? '' : id
}

const handleToggleTask = async (task: TaskVO) => {
  const oldStatus = task.status
  const newStatus = task.status === 1 ? 0 : 1
  task.status = newStatus

  try {
    await reqUpdateTask({
      id: task.id,
      name: task.name,
      description: task.description,
      status: newStatus,
      startTime: task.startTime,
      endTime: task.endTime,
      projectId: task.projectId,
      titleId: task.titleId,
      tagIds: task.tags ? task.tags.map(t => t.id) : [],
      checklist: task.checklist
    })
    taskStore.getTodayTasks()
  } catch (error) {
    task.status = oldStatus
    toast.error('操作失败')
  }
}
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 0;
  background: transparent;
}

/* ✅ Things 3 风格的切换动画 */
/* enter: 稍微缩小一点(0.98)再弹出来，模拟卡片“浮起”的感觉
   leave: 快速淡出，不抢视觉
*/
.task-switch-enter-active {
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1); /* 类似 Apple 的弹性曲线 */
}

.task-switch-leave-active {
  transition: all 0.1s ease-in;
}

.task-switch-enter-from,
.task-switch-leave-to {
  opacity: 0;
  transform: scale(0.98) translateY(2px);
}
</style>