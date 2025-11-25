<template>
  <div class="flex-1 h-full bg-white flex flex-col overflow-hidden">
    <header class="pt-10 px-10 pb-6 shrink-0">
      <div v-if="loading && !projectData" class="text-gray-400 text-sm">加载中...</div>

      <div v-else-if="projectData">
        <div class="flex items-start space-x-4 group">
          <div class="mt-1.5 shrink-0 cursor-pointer opacity-80 hover:opacity-100 transition">
            <ProjectProgressIcon :progress="calcProgress" :size="26" />
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center justify-between">
              <h1 class="text-3xl font-bold text-[#333] tracking-tight leading-tight">
                {{ projectData.name }}
              </h1>

              <button class="text-gray-300 hover:text-gray-600 p-1 rounded transition-colors opacity-0 group-hover:opacity-100">
                <MoreHorizontal class="w-6 h-6" />
              </button>
            </div>

            <div v-if="projectData.tags && projectData.tags.length > 0" class="flex flex-wrap gap-2 mt-2">
              <span
                v-for="tag in projectData.tags"
                :key="tag.id"
                class="px-2 py-0.5 rounded-full text-xs font-medium bg-[#e5e5e5]/70 text-[#666]"
                :style="{ backgroundColor: tag.color ? tag.color + '20' : undefined, color: tag.color }"
              >
                {{ tag.name }}
              </span>
            </div>

            <div class="mt-3">
              <div v-if="isEditingDesc">
                <textarea
                  ref="descInputRef"
                  v-model="editingDescContent"
                  rows="2"
                  class="w-full text-[15px] text-gray-600 leading-relaxed border border-blue-300 rounded-md p-2 outline-none bg-gray-50 focus:bg-white transition-colors resize-none"
                  placeholder="添加备注..."
                  @blur="saveDescription"
                  @keydown.enter.prevent="saveDescription"
                ></textarea>
              </div>

              <div
                v-else
                @click="startEditDesc"
                class="text-[15px] text-gray-600 leading-relaxed cursor-text hover:bg-gray-50 -mx-2 px-2 py-1 rounded transition-colors min-h-[24px]"
                :class="{ 'text-gray-400 italic': !projectData.description }"
              >
                {{ projectData.description || '点击添加备注' }}
              </div>
            </div>
          </div>
        </div>

        <div class="h-[1px] bg-gray-100 mt-6"></div>
      </div>
    </header>

    <main
      class="flex-1 overflow-y-auto px-10 pb-20 custom-scrollbar"
      @click="selectedTaskId = ''"
    >
      <div v-if="loading && !projectData" class="mt-10 text-center"></div>

      <div v-else-if="projectData">

        <div v-for="(group, index) in projectData.groups" :key="group.title?.id || 'loose'" class="mb-6">

          <div v-if="group.title" class="flex items-center justify-between group/title mb-2 mt-4">
            <h2 class="text-[15px] font-bold text-[#2ea4db] flex items-center">
              {{ group.title.title }}
            </h2>
            <button class="text-gray-300 hover:text-[#2ea4db] p-1 opacity-0 group-hover/title:opacity-100 transition">
              <MoreHorizontal class="w-4 h-4" />
            </button>
          </div>

          <div class="space-y-1">
            <template v-for="task in group.tasks" :key="task.id">

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

            <div v-if="group.tasks.length === 0 && group.title" class="text-xs text-gray-300 py-2 italic">
              无任务
            </div>
          </div>
        </div>

        <div class="mt-10 mb-4 text-xs text-gray-300 text-center">
          显示 {{ completedCount }} 个已完成项
        </div>

      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, computed, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { MoreHorizontal } from 'lucide-vue-next'
import { toast } from 'vue-sonner'

import ProjectProgressIcon from '@/components/ProjectProgressIcon.vue'
import TaskItem from '@/components/TaskItem.vue'
import TaskEditor from '@/components/TaskEditor.vue'

import { reqGetProjectDetail, reqUpdateProject, type ProjectDetailVO } from '@/api/project' // 引入 reqUpdateProject
import { reqUpdateTask, type TaskVO } from '@/api/task'

const route = useRoute()
const loading = ref(false)
const projectData = ref<ProjectDetailVO | null>(null)

// 交互状态
const editingTaskId = ref<string | null>(null)
const selectedTaskId = ref<string | null>(null)

// 项目描述编辑状态
const isEditingDesc = ref(false)
const editingDescContent = ref('')
const descInputRef = ref<HTMLTextAreaElement | null>(null)

// 1. 加载数据
const loadProjectData = async (id: string) => {
  loading.value = true
  editingTaskId.value = null
  selectedTaskId.value = null
  isEditingDesc.value = false // 切换项目时重置编辑状态

  try {
    const res = await reqGetProjectDetail(id)
    projectData.value = res.data
  } catch (error) {
    console.error(error)
    toast.error('获取项目详情失败')
  } finally {
    loading.value = false
  }
}

// 2. 初始化与监听路由
onMounted(() => {
  if (route.params.id) {
    loadProjectData(route.params.id as string)
  }
})

watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadProjectData(newId as string)
    }
  }
)

const refreshData = () => {
  if (projectData.value?.id) {
    loadProjectData(projectData.value.id)
  }
}

// 3. 描述编辑逻辑
const startEditDesc = async () => {
  if (!projectData.value) return
  editingDescContent.value = projectData.value.description || ''
  isEditingDesc.value = true
  await nextTick()
  descInputRef.value?.focus()
}

const saveDescription = async () => {
  if (!projectData.value) return

  const newDesc = editingDescContent.value.trim()
  const oldDesc = projectData.value.description || ''

  isEditingDesc.value = false

  // 如果内容没变，不需要调接口
  if (newDesc === oldDesc) return

  try {
    // 乐观更新 UI
    projectData.value.description = newDesc

    await reqUpdateProject({
      id: projectData.value.id,
      description: newDesc
    })
    toast.success('备注已更新')
  } catch (error) {
    // 失败回滚
    projectData.value.description = oldDesc
    toast.error('保存失败')
  }
}

// 4. 计算属性：进度
const calcProgress = computed(() => {
  if (!projectData.value) return 0
  let total = 0
  let done = 0

  projectData.value.groups.forEach(g => {
    g.tasks.forEach(t => {
      total++
      if (t.status === 1) done++
    })
  })

  if (total === 0) return 0
  return Math.round((done / total) * 100)
})

// 5. 计算属性：已完成数量
const completedCount = computed(() => {
  return 0
})

// 6. 任务操作
const handleToggleTask = async (task: TaskVO) => {
  const oldStatus = task.status
  const newStatus = task.status === 1 ? 0 : 1

  task.status = newStatus

  try {
    await reqUpdateTask({
      id: task.id,
      name: task.name,
      status: newStatus,
      projectId: projectData.value?.id,
      titleId: task.titleId
    })
    refreshData()
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