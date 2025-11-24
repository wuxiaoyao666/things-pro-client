<template>
  <div
    class="h-screen bg-[#f5f5f5] flex flex-col border-r border-[#e0e0e0] select-none font-sans text-[13px] overflow-hidden transition-all duration-300 ease-in-out"
    :class="[ uiStore.isSidebarOpen ? 'w-[260px] opacity-100' : 'w-0 opacity-0 border-none' ]"
  >
    <div class="min-w-[260px] h-full flex flex-col">

      <div class="h-12 flex items-center px-4 space-x-2 shrink-0">
        <div class="w-3 h-3 rounded-full bg-[#ff5f57] border border-[#e0443e]"></div>
        <div class="w-3 h-3 rounded-full bg-[#febc2e] border border-[#d89e24]"></div>
        <div class="w-3 h-3 rounded-full bg-[#28c840] border border-[#1aab29]"></div>
      </div>

      <div class="flex-1 overflow-y-auto py-2 px-2 custom-scrollbar">

        <nav class="space-y-[1px] mb-6">
          <router-link to="/inbox" custom v-slot="{ isActive, navigate }">
            <div @click="navigate" :class="[commonClass, isActive ? activeClass : hoverClass]">
              <Inbox class="w-4 h-4 text-[#2ea4db]" /> <span class="font-medium text-[#444]">收件箱</span>
            </div>
          </router-link>

          <router-link to="/today" custom v-slot="{ isActive, navigate }">
            <div @click="navigate" :class="[commonClass, isActive ? activeClass : hoverClass]">
              <Star class="w-4 h-4 text-[#f5cc00] fill-current" /> <span class="font-medium text-[#444] flex-1">今天</span>
              <span v-if="isActive || true" class="text-xs font-bold text-[#444] px-1.5">2</span>
            </div>
          </router-link>

          <router-link to="/upcoming" custom v-slot="{ isActive, navigate }">
            <div @click="navigate" :class="[commonClass, isActive ? activeClass : hoverClass]">
              <CalendarDays class="w-4 h-4 text-[#ff3b30]" /> <span class="font-medium text-[#444]">计划</span>
            </div>
          </router-link>

          <router-link to="/anytime" custom v-slot="{ isActive, navigate }">
            <div @click="navigate" :class="[commonClass, isActive ? activeClass : hoverClass]">
              <Layers class="w-4 h-4 text-[#4d968d]" /> <span class="font-medium text-[#444]">随时</span>
            </div>
          </router-link>

          <router-link to="/someday" custom v-slot="{ isActive, navigate }">
            <div @click="navigate" :class="[commonClass, isActive ? activeClass : hoverClass]">
              <Package class="w-4 h-4 text-[#cfa046]" /> <span class="font-medium text-[#444]">某天</span>
            </div>
          </router-link>
        </nav>

        <nav class="space-y-[1px] mb-6">
          <router-link to="/logbook" custom v-slot="{ isActive, navigate }">
            <div @click="navigate" :class="[commonClass, isActive ? activeClass : hoverClass]">
              <CheckSquare class="w-4 h-4 text-[#5dbb58]" /> <span class="font-medium text-[#444]">日志簿</span>
            </div>
          </router-link>
          <router-link to="/trash" custom v-slot="{ isActive, navigate }">
            <div @click="navigate" :class="[commonClass, isActive ? activeClass : hoverClass]">
              <Trash2 class="w-4 h-4 text-[#999]" /> <span class="font-medium text-[#444]">废纸篓</span>
            </div>
          </router-link>
        </nav>

        <div class="px-3 pb-1 text-[11px] font-bold text-[#999] mt-4 mb-1 flex justify-between group cursor-default">
          <span>我的项目</span>
        </div>

        <VueDraggable
          v-model="projectStore.projectSidebar"
          :animation="150"
          ghostClass="ghost"
          handle=".drag-handle"
          @end="onDragEnd"
          class="space-y-[1px]"
          :disabled="isEditing"
        >
          <template v-for="(item, index) in projectStore.projectSidebar" :key="item.id || 'temp-new'">

            <div
              v-if="(item as any).isEditing"
              class="flex items-center space-x-3 px-3 py-[6px] rounded-md bg-[#dcdcdc]"
            >
              <ProjectProgressIcon :progress="item.progress" :size="16" class="shrink-0" />
              <input
                ref="projectInputRef"
                v-model="editingName"
                type="text"
                class="bg-transparent border-none outline-none text-[#444] w-full text-[13px] placeholder-gray-500 font-medium"
                placeholder="项目名称"
                @keydown.enter="confirmEdit(item, index)"
                @keydown.esc="cancelEdit(item, index)"
                @blur="confirmEdit(item, index)"
              />
            </div>

            <router-link
              v-else
              :to="`/project/${item.id}`"
              custom
              v-slot="{ isActive, navigate }"
            >
              <div
                @click="navigate"
                @contextmenu.prevent="openContextMenu($event, item)"
                :class="[commonClass, isActive ? activeClass : hoverClass, 'group relative drag-handle']"
              >
                <ProjectProgressIcon
                  :progress="item.progress"
                  :size="16"
                  class="shrink-0"
                />
                <span class="text-[#444] truncate">{{ item.name }}</span>
              </div>
            </router-link>

          </template>
        </VueDraggable>

      </div>

      <div class="h-10 border-t border-[#e0e0e0] flex items-center px-3 justify-between text-[#666] shrink-0 bg-[#f5f5f5]">
        <button
          @click="startCreate"
          class="flex items-center space-x-1 hover:text-[#333] transition px-2 py-1 rounded hover:bg-[#e4e4e4]"
        >
          <Plus class="w-4 h-4" />
          <span>新建项目</span>
        </button>

        <div class="flex items-center space-x-1">
          <button
            @click="handleSettings"
            class="hover:text-[#333] p-1 rounded hover:bg-[#e4e4e4] transition"
            title="设置与账户"
          >
            <Settings class="w-4 h-4" />
          </button>

          <button
            @click="uiStore.toggleSidebar"
            class="hover:text-[#333] p-1 rounded hover:bg-[#e4e4e4] transition"
            title="收起侧边栏"
          >
            <PanelLeftClose class="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>

    <ContextMenu
      :visible="contextMenu.visible"
      :x="contextMenu.x"
      :y="contextMenu.y"
      @close="contextMenu.visible = false"
      @rename="startRename"
      @delete="handleDelete"
    />

  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Inbox, Star, CalendarDays, Layers, Package,
  CheckSquare, Trash2, Plus, PanelLeftClose, Settings
} from 'lucide-vue-next'
import { VueDraggable } from 'vue-draggable-plus'
import { toast } from 'vue-sonner'

import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/ui'
import ProjectProgressIcon from '@/components/ProjectProgressIcon.vue'
import ContextMenu from '@/components/ContextMenu.vue'

import { reqUpdateProject, reqCreateProject } from '@/api/project'
import type { ProjectSidebarVO } from '@/api/project'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const uiStore = useUIStore()

onMounted(() => {
  projectStore.getProjectSidebar()
})

const handleSettings = () => {
  toast.info('设置面板功能开发中...')
}

// =============================================================================
// 1. 统一编辑逻辑 (新建 & 重命名)
// =============================================================================
const isEditing = ref(false) // 全局锁，防止同时编辑多个或拖拽
const editingName = ref('')
const projectInputRef = ref<HTMLInputElement | null>(null)

// -------------------
// A. 开始创建
// -------------------
const startCreate = async () => {
  if (isEditing.value) return

  isEditing.value = true
  editingName.value = ''

  // 1. 确定插入位置
  let insertIndex = projectStore.projectSidebar.length
  if (route.name === 'project' && route.params.id) {
    const currentId = route.params.id as string
    const currentIndex = projectStore.projectSidebar.findIndex(p => p.id === currentId)
    if (currentIndex !== -1) {
      insertIndex = currentIndex + 1
    }
  }

  // 2. 插入占位符
  const tempItem = {
    id: '', name: '', order: 0, progress: 0,
    isEditing: true // 标记为编辑状态
  } as any
  projectStore.projectSidebar.splice(insertIndex, 0, tempItem)

  // 3. 聚焦
  await nextTick()
  focusInput()
}

// -------------------
// B. 开始重命名 (由右键菜单触发)
// -------------------
const startRename = async () => {
  const project = contextMenu.project
  if (!project) return

  // 找到 Store 中对应的对象
  const item = projectStore.projectSidebar.find(p => p.id === project.id)
  if (item) {
    isEditing.value = true
    editingName.value = item.name
    // 标记该项为编辑态
    ;(item as any).isEditing = true

    await nextTick()
    focusInput()
  }
}

// 辅助：聚焦输入框
const focusInput = () => {
  if (projectInputRef.value) {
    const inputs = Array.isArray(projectInputRef.value)
      ? projectInputRef.value
      : [projectInputRef.value]
    // 聚焦最后一个（或者是唯一可见的那个）
    // 这里稍微偷懒取了最后一个，实际应该找 visible 的，但逻辑上同一时间只有一个 editing
    inputs[inputs.length - 1]?.focus()
    inputs[inputs.length - 1]?.select() // 选中文字方便修改
  }
}

// -------------------
// C. 确认提交 (回车/失焦)
// -------------------
const confirmEdit = async (item: any, index: number) => {
  // 防止重复触发 (Blur 和 Enter 可能连发)
  // 如果 item.isEditing 已经是 false，说明已经处理过了
  if (!item.isEditing) return

  const name = editingName.value.trim()

  // 如果是新建且名字为空 -> 取消
  if (!item.id && !name) {
    cancelEdit(item, index)
    return
  }
  // 如果是重命名且名字为空 -> 还原旧名字，或者保持原样
  if (item.id && !name) {
    cancelEdit(item, index) // 相当于放弃修改
    return
  }

  // 提交前先关闭编辑状态 UI
  item.isEditing = false
  isEditing.value = false

  try {
    if (item.id) {
      // --- 场景1: 重命名 ---
      if (name !== item.name) {
        item.name = name
        await reqUpdateProject({ id: item.id, name: name })
        toast.success('重命名成功')
      }
    } else {
      // --- 场景2: 新建 ---
      const res = await reqCreateProject(name)
      const newId = res.data

      // 填入真实数据
      item.id = newId
      item.name = name
      item.order = index

      // 触发排序校准
      onDragEnd()

      router.push(`/project/${newId}`)
      toast.success('项目创建成功')
    }
  } catch (error) {
    toast.error('操作失败')
    // 失败回滚逻辑略（新建的话可以移除 item，重命名可以 revert name）
    if (!item.id) {
      projectStore.projectSidebar.splice(index, 1)
    }
  }
}

// -------------------
// D. 取消编辑 (Esc)
// -------------------
const cancelEdit = (item: any, index: number) => {
  item.isEditing = false
  isEditing.value = false

  // 如果是新建的占位符，取消时需要移除
  if (!item.id) {
    projectStore.projectSidebar.splice(index, 1)
  }
}

// =============================================================================
// 2. 拖拽排序逻辑
// =============================================================================
const onDragEnd = async () => {
  const updates = projectStore.projectSidebar.map((item, index) => {
    if (item.order !== index) {
      item.order = index
      return reqUpdateProject({ id: item.id, order: index })
    }
    return null
  }).filter(Boolean)

  if (updates.length > 0) {
    try {
      await Promise.all(updates)
    } catch (error) {
      projectStore.getProjectSidebar()
    }
  }
}

// =============================================================================
// 3. 右键菜单逻辑
// =============================================================================
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0,
  project: null as ProjectSidebarVO | null
})

const openContextMenu = (e: MouseEvent, project: ProjectSidebarVO) => {
  contextMenu.x = e.clientX
  contextMenu.y = e.clientY
  contextMenu.project = project
  contextMenu.visible = true
}

// =============================================================================
// 4. 删除逻辑
// =============================================================================
const handleDelete = async () => {
  const project = contextMenu.project
  if (!project) return

  try {
    await reqUpdateProject({ id: project.id, status: 3 })
    const index = projectStore.projectSidebar.findIndex(p => p.id === project.id)
    if (index !== -1) {
      projectStore.projectSidebar.splice(index, 1)
    }
    if (route.params.id === project.id) {
      router.push('/inbox')
    }
    toast.success('项目已移至废纸篓')
  } catch (error) {
    toast.error('删除失败')
  }
}

// 样式常量
const commonClass = "flex items-center space-x-3 px-3 py-[6px] rounded-md cursor-pointer transition-colors duration-150"
const activeClass = "bg-[#dcdcdc] font-medium"
const hoverClass = "hover:bg-[#e4e4e4]"
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 0; background: transparent; }
.ghost { opacity: 0.4; background-color: #e0e0e0; border-radius: 6px; }
</style>