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
          <span>项目</span>
          <span class="hidden group-hover:inline text-[#2ea4db] cursor-pointer">隐藏</span>
        </div>

        <div class="space-y-[1px]">
          <router-link
            v-for="project in projectStore.projectSidebar"
            :key="project.id"
            :to="`/project/${project.id}`"
            custom
            v-slot="{ isActive, navigate }"
          >
            <div
              @click="navigate"
              :class="[commonClass, isActive ? activeClass : hoverClass, 'group']"
            >
              <ProjectProgressIcon
                :progress="project.progress"
                :size="16"
                class="shrink-0"
              />
              <span class="text-[#444] truncate">{{ project.name }}</span>
            </div>
          </router-link>
        </div>

      </div>

      <div class="h-10 border-t border-[#e0e0e0] flex items-center px-3 justify-between text-[#666] shrink-0 bg-[#f5f5f5]">
        <button class="flex items-center space-x-1 hover:text-[#333] transition px-2 py-1 rounded hover:bg-[#e4e4e4]">
          <Plus class="w-4 h-4" />
          <span>新建列表</span>
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
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  Inbox, Star, CalendarDays, Layers, Package,
  CheckSquare, Trash2, Plus, PanelLeftClose, Settings // 引入 Settings 图标
} from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projectStore'
import { useUIStore } from '@/stores/ui'
import ProjectProgressIcon from '@/components/ProjectProgressIcon.vue'
import { toast } from 'vue-sonner'

const projectStore = useProjectStore()
const uiStore = useUIStore()

// 组件挂载时获取项目列表
onMounted(() => {
  projectStore.getProjectSidebar()
})

const handleSettings = () => {
  // 这里后续可以做一个弹出菜单 (Dropdown Menu)
  // 显示当前登录用户，以及退出登录选项
  toast.info('设置面板功能开发中...')
}

// 提取样式常量 (Tailwind v4 兼容)
const commonClass = "flex items-center space-x-3 px-3 py-[6px] rounded-md cursor-pointer transition-colors duration-150"
const activeClass = "bg-[#dcdcdc] font-medium" // 选中状态 (深灰)
const hoverClass = "hover:bg-[#e4e4e4]" // 悬停状态 (浅灰)
</script>

<style scoped>
/* 隐藏滚动条 */
.custom-scrollbar::-webkit-scrollbar {
  width: 0;
  background: transparent;
}
</style>