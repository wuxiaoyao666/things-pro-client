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

        <VueDraggable
          v-model="projectData.groups"
          :animation="150"
          handle=".group-handle"
          class="space-y-2 min-h-[50px]"
          @end="onGroupSort"
        >
          <div
            v-for="(group, gIndex) in projectData.groups"
            :key="group.title?.id || 'loose-' + gIndex"
            class="relative group/container pb-2"
          >
            <div v-if="group.title" class="flex items-center justify-between group/title mb-2 mt-6 group-handle cursor-grab active:cursor-grabbing">
              <h2 class="text-[15px] font-bold text-[#2ea4db] flex items-center select-none">
                {{ group.title.title }}
              </h2>
              <button class="text-gray-300 hover:text-[#2ea4db] p-1 opacity-0 group-hover/title:opacity-100 transition">
                <MoreHorizontal class="w-4 h-4" />
              </button>
            </div>

            <VueDraggable
              v-model="group.tasks"
              :animation="150"
              group="project-tasks"
              class="space-y-1 min-h-[10px] rounded-md"
              :class="{ 'py-4': !group.title && group.tasks.length === 0 }"
              @end="(evt) => onTaskDragEnd(evt, group)"
            >
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
            </VueDraggable>

            <div v-if="!group.title && group.tasks.length === 0" class="absolute top-0 left-0 w-full h-full pointer-events-none flex items-center ml-2">
            </div>
          </div>
        </VueDraggable>

        <div class="mt-10 mb-4 text-xs text-gray-300 text-center select-none">
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
import { VueDraggable } from 'vue-draggable-plus'

import ProjectProgressIcon from '@/components/ProjectProgressIcon.vue'
import TaskItem from '@/components/TaskItem.vue'
import TaskEditor from '@/components/TaskEditor.vue'

import { reqGetProjectDetail, reqUpdateProject, type ProjectDetailVO, type TitleGroup } from '@/api/project'
import { reqUpdateTask, type TaskVO } from '@/api/task'

const route = useRoute()
const loading = ref(false)
const projectData = ref<ProjectDetailVO | null>(null)

// 交互状态
const editingTaskId = ref<string | null>(null)
const selectedTaskId = ref<string | null>(null)
const isEditingDesc = ref(false)
const editingDescContent = ref('')
const descInputRef = ref<HTMLTextAreaElement | null>(null)

// 1. 加载数据
const loadProjectData = async (id: string) => {
  loading.value = true
  editingTaskId.value = null
  selectedTaskId.value = null
  isEditingDesc.value = false

  try {
    const res = await reqGetProjectDetail(id)
    projectData.value = res.data

    // 兜底
    if (!projectData.value.groups) {
      projectData.value.groups = []
    }

    // ✅ 关键修复：确保始终有一个松散任务组在最顶部
    // 这样你就可以把任务从 Title 中拖到顶部，使其变成无标题任务
    const hasTopLooseGroup = projectData.value.groups.length > 0 && projectData.value.groups[0].title === null
    if (!hasTopLooseGroup) {
      projectData.value.groups.unshift({
        title: null,
        tasks: []
      })
    }

  } catch (error) {
    console.error(error)
    toast.error('获取项目详情失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  if (route.params.id) loadProjectData(route.params.id as string)
})

watch(() => route.params.id, (newId) => {
  if (newId) loadProjectData(newId as string)
})

const refreshData = () => {
  if (projectData.value?.id) loadProjectData(projectData.value.id)
}

// 2. 描述编辑
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
  if (newDesc === oldDesc) return

  try {
    projectData.value.description = newDesc
    await reqUpdateProject({ id: projectData.value.id, description: newDesc })
    toast.success('备注已更新')
  } catch (error) {
    projectData.value.description = oldDesc
    toast.error('保存失败')
  }
}

// 3. 计算属性
const calcProgress = computed(() => {
  if (!projectData.value || !projectData.value.groups) return 0
  let total = 0
  let done = 0
  projectData.value.groups.forEach(g => {
    if (g.tasks) {
      g.tasks.forEach(t => {
        total++
        if (t.status === 1) done++
      })
    }
  })
  if (total === 0) return 0
  return Math.round((done / total) * 100)
})

const completedCount = computed(() => 0)

// 4. 拖拽逻辑：分组排序
const onGroupSort = async () => {
  if (!projectData.value) return
  // 这里只处理 Title 的排序，如果拖动了松散组，其实只是视觉变化
  // 真实的松散任务排序依赖于 Task 的 Order
  const updates = projectData.value.groups.map((group, index) => {
    if (group.title) {
      // TODO: 调用更新 Title Order 接口 (reqUpdateTitle)
      console.log(`Update Title ${group.title.title} to order ${index}`)
    }
    return null
  })

  // 注意：如果用户把松散组插到了两个 Title 之间，
  // 后端逻辑是混合排序，所以理论上也需要更新 LooseTask 的 Order。
  // 简单起见，我们在 Group 排序后，也触发一次全量 Task 重排
  onTaskDragEnd(null, null)
}

// 5. 拖拽逻辑：任务拖拽 (核心)
const onTaskDragEnd = async (evt: any, fromGroup: TitleGroup | null) => {
  if (!projectData.value) return

  // 全局重排：给视图中所有任务重新分配 Order
  let globalOrderCounter = 0
  const requests: Promise<any>[] = []

  projectData.value.groups.forEach((group) => {
    // Title 本身占据一个 Order 位置
    if (group.title) {
      globalOrderCounter++
    }

    if (group.tasks) {
      group.tasks.forEach((task) => {
        const newOrder = globalOrderCounter++
        // 如果在松散组(title=null)，titleId 设为 null；否则设为 title.id
        const newTitleId = group.title ? group.title.id : null

        // 检测变化：Order 变了，或者 TitleID 变了 (从一个组拖到另一个组)
        if (task.order !== newOrder || task.titleId !== newTitleId) {
          task.order = newOrder
          task.titleId = newTitleId

          requests.push(reqUpdateTask({
            id: task.id,
            name: task.name,
            order: newOrder,
            titleId: newTitleId, // 允许设为 null
            projectId: projectData.value!.id,
            // 必填补全
            description: task.description,
            status: task.status
          }))
        }
      })
    }
  })

  if (requests.length > 0) {
    try {
      await Promise.all(requests)
    } catch (e) {
      console.error(e)
      toast.error('排序保存失败')
      refreshData()
    }
  }
}

// 6. 任务完成切换
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