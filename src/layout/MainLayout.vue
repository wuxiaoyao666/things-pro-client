<script setup lang="ts">
import Sidebar from '@/components/Sidebar.vue'
import { Cloud, Copy } from 'lucide-vue-next'
</script>

<template>
  <div class="flex w-full h-screen bg-white overflow-hidden font-sans antialiased text-gray-900">
    <Sidebar />

    <div class="flex-1 h-full overflow-hidden relative">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>

      <div class="absolute top-4 right-4 flex space-x-3 text-[#ccc]">
        <Cloud class="w-5 h-5 hover:text-[#999] cursor-pointer transition" />
        <Copy class="w-5 h-5 hover:text-[#999] cursor-pointer transition" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>