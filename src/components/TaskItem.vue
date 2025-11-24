<template>
  <div
    class="group flex items-start py-2 px-3 -mx-3 rounded-lg hover:bg-[#f5f5f5] transition-colors duration-150 cursor-default"
  >
    <div class="mt-0.5 mr-3 shrink-0">
      <div
        @click.stop="toggleStatus"
        class="w-5 h-5 border-2 border-gray-300 rounded-[5px] flex items-center justify-center hover:border-gray-400 cursor-pointer transition-colors bg-white"
        :class="{ '!bg-[#2ea4db] !border-[#2ea4db]': task.status === 1 }"
      >
        <svg
          v-if="task.status === 1"
          class="w-3.5 h-3.5 text-white"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="3"
        >
          <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>

    <div class="flex-1 min-w-0">
      <div class="flex items-center flex-wrap gap-2">
        <span
          class="text-[15px] text-[#333] leading-snug"
          :class="{ 'line-through text-gray-400': task.status === 1 }"
        >
          {{ task.name }}
        </span>

        <div v-if="task.tags && task.tags.length > 0" class="flex items-center space-x-1.5">
          <span
            v-for="tag in task.tags"
            :key="tag.id"
            class="px-2 py-[1px] rounded-full text-[10px] border font-medium text-gray-500 bg-white"
            :style="{ borderColor: tag.color ? tag.color + '40' : '#e5e5e5', color: tag.color }"
          >
            {{ tag.name }}
          </span>
        </div>
      </div>

      <div class="flex items-center mt-0.5 space-x-2 text-[11px]">
        <span v-if="task.projectName" class="text-gray-400 font-medium">
          {{ task.projectName }}
        </span>

        <span v-if="task.endTime" class="text-gray-400 flex items-center">
          {{ task.endTime }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TaskVO } from '@/api/task'

// 定义 Props
const props = defineProps<{
  task: TaskVO
}>()

const emit = defineEmits(['toggle'])

const toggleStatus = () => {
  // 抛出事件给父组件处理状态变更
  emit('toggle', props.task)
}
</script>
