<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
// 1. 引入 PanelLeftOpen 图标 (展开图标)
import { Cloud, Copy, PanelLeftOpen } from 'lucide-vue-next'
import { useUIStore } from '@/stores/ui'

const uiStore = useUIStore()
</script>

<template>
  <div class="flex w-full h-screen bg-white overflow-hidden font-sans antialiased text-gray-900">
    <Sidebar />

    <div class="flex-1 h-full overflow-hidden relative flex flex-col">

      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <div class="absolute top-4 right-4 flex space-x-3 text-[#ccc]">
        <Cloud class="w-5 h-5 hover:text-[#999] cursor-pointer transition" />
        <Copy class="w-5 h-5 hover:text-[#999] cursor-pointer transition" />
      </div>

      <transition name="fade">
        <button
          v-if="!uiStore.isSidebarOpen"
          @click="uiStore.toggleSidebar"
          class="absolute bottom-3 left-3 p-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-all duration-300 z-50 shadow-sm border border-gray-200/50"
          title="展开侧边栏"
        >
          <PanelLeftOpen class="w-5 h-5" />
        </button>
      </transition>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>