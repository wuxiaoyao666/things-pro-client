<template>
  <div class="h-screen w-[260px] bg-[#f5f5f5] flex flex-col border-r border-[#e0e0e0] select-none font-sans text-[13px]">
    <div class="h-12 flex items-center px-4 space-x-2">
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
            <span v-if="isActive" class="text-xs text-[#888] font-bold">1</span>
            <span class="text-[10px] text-[#aaa] ml-1">2</span>
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
            <CheckSquare class="w-4 h-4 text-[#5dbb58]" />
            <span class="font-medium text-[#444]">日志簿</span>
          </div>
        </router-link>
        <router-link to="/trash" custom v-slot="{ isActive, navigate }">
          <div @click="navigate" :class="[commonClass, isActive ? activeClass : hoverClass]">
            <Trash2 class="w-4 h-4 text-[#999]" />
            <span class="font-medium text-[#444]">废纸篓</span>
          </div>
        </router-link>
      </nav>

      <div class="space-y-[1px]">
        <div
          v-for="project in projectStore.projects"
          :key="project.id"
          :class="[commonClass, hoverClass, 'group']"
        >
          <PieChart class="w-4 h-4 text-[#999] group-hover:text-[#666] transition-colors" />
          <span class="text-[#444] truncate">{{ project.name }}</span>
        </div>
      </div>

    </div>

    <div class="h-10 border-t border-[#e0e0e0] flex items-center px-3 justify-between text-[#666]">
      <button class="flex items-center space-x-1 hover:text-[#333] transition px-2 py-1 rounded hover:bg-[#e4e4e4]">
        <Plus class="w-4 h-4" />
        <span>新建列表</span>
      </button>
      <button class="hover:text-[#333] p-1 rounded hover:bg-[#e4e4e4] transition">
        <SlidersHorizontal class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  Inbox, Star, CalendarDays, Layers, Package,
  CheckSquare, Trash2, PieChart, Plus, SlidersHorizontal
} from 'lucide-vue-next'
import { useProjectStore } from '../stores/projectStore'

const projectStore = useProjectStore()

const commonClass = "flex items-center space-x-3 px-3 py-[6px] rounded-md cursor-pointer transition-colors duration-150"
const activeClass = "bg-[#dcdcdc]"      // 选中状态 (深灰)
const hoverClass = "hover:bg-[#e4e4e4]" // 悬停状态 (浅灰)

</script>

<style scoped>
/* 只保留纯 CSS 的滚动条样式，其他的样式全部移到 Template 里用 Utility Class 解决了 */
.custom-scrollbar::-webkit-scrollbar {
  width: 0;
  background: transparent;
}
</style>