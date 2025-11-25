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

    <main
      class="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar"
      @click="selectedTaskId = ''"
    >

      <div v-if="loading" class="text-gray-400 text-sm mt-4">加载中...</div>

      <div v-else>
        <div v-if="localTasks.length === 0" class="mt-10 text-center text-gray-400 text-sm">
          没有任务
        </div>

        <VueDraggable
          v-model="localTasks"
          :animation="150"
          :disabled="!!activeTagId"
          class="space-y-1"
          @end="onDragEnd"
        >
          <template v-for="task in localTasks" :key="task.id">

            <Transition name="task-switch" mode="out-in">

              <div v-if="editingTaskId === task.id" @click.stop>
                <TaskEditor
                  :task="task"
                  @close="editingTaskId = null"
                  @update="refreshData"
                />
              </div>

              <div v-else>
                <TaskItem
                  :task="task"
                  :class="{ '!bg-[#2ea4db]/10': selectedTaskId === task.id }"
                  @toggle="handleToggleTask"
                  @click.stop="selectedTaskId = task.id"
                  @dblclick="editingTaskId = task.id"
                />
              </div>

            </Transition>

          </template>
        </VueDraggable>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Star } from 'lucide-vue-next'
import { toast } from 'vue-sonner'
import { VueDraggable } from 'vue-draggable-plus'
import TaskItem from '@/components/TaskItem.vue'
import TaskEditor from '@/components/TaskEditor.vue'
import { useTaskStore } from '@/stores/taskStore'
import { reqUpdateTask } from '@/api/task'
import type { TaskVO } from '@/api/task'

const taskStore = useTaskStore()
const loading = ref(false)
const activeTagId = ref('')
const editingTaskId = ref<string | null>(null)
const selectedTaskId = ref<string | null>(null)

const localTasks = ref<TaskVO[]>([])

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

// 监听 Store 变化，同步到本地
watch(
  () => filteredTasks.value,
  (newVal) => {
    localTasks.value = [...newVal]
  },
  { immediate: true, deep: true }
)

const toggleTagFilter = (id: string) => {
  activeTagId.value = activeTagId.value === id ? '' : id
}

// ✅ 核心修复：拖拽结束处理
const onDragEnd = async () => {
  // 1. 如果正在筛选，禁止操作（UI上已经禁止，这里双重保险）
  if (activeTagId.value) return

  // 2. 【关键步骤】立即更新 Store，防止 Watcher 将数据回滚
  // 这一步保证了本地 Store 和 UI 顺序一致
  taskStore.todayTasks = [...localTasks.value]

  // 3. 计算变更并发送请求
  const updates = localTasks.value.map((item, index) => {
    if (item.order !== index) {
      item.order = index
      // 后端是全量更新，必须带上所有字段
      return reqUpdateTask({
        id: item.id,
        name: item.name,
        description: item.description,
        status: item.status,
        order: index, // 更新顺序
        startTime: item.startTime,
        endTime: item.endTime,
        projectId: item.projectId,
        titleId: item.titleId,
        tagIds: item.tags ? item.tags.map(t => t.id) : [],
        checklist: item.checklist
      })
    }
    return null
  }).filter(Boolean)

  if (updates.length > 0) {
    try {
      await Promise.all(updates)
      // 成功不需要做任何事，因为 Store 已经是新的了
    } catch (error) {
      toast.error('排序保存失败')
      refreshData() // 失败回滚
    }
  }
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

.task-switch-enter-active {
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.task-switch-leave-active {
  transition: all 0.15s ease-in;
}

.task-switch-enter-from,
.task-switch-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>