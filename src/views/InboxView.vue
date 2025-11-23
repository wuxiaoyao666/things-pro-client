<template>
  <div class="flex-1 h-full bg-white flex flex-col">
    <header class="pt-10 px-10 pb-4 flex items-center space-x-3">
      <div class="p-1 bg-[#2ea4db] rounded-md shadow-sm">
        <Inbox class="w-6 h-6 text-white" />
      </div>
      <h1 class="text-3xl font-bold text-[#333] tracking-tight">收件箱</h1>
    </header>

    <main class="flex-1 flex flex-col items-center justify-center pb-20">
      <div class="bg-[#f3f3f3] p-8 rounded-[2rem] mb-6">
        <Inbox class="w-24 h-24 text-white drop-shadow-lg" /> </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { Inbox } from 'lucide-vue-next'
</script>