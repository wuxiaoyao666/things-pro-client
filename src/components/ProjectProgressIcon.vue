<template>
  <div class="relative flex items-center justify-center" :style="{ width: size + 'px', height: size + 'px' }">
    <svg
      class="transform -rotate-90"
      :width:="size"
      :height="size"
      viewBox="0 0 24 24"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="#e5e5e5"
        stroke-width="3"
        fill="transparent"
      />
      <circle
        v-if="progress > 0"
        cx="12"
        cy="12"
        r="9"
        stroke="#888"
        stroke-width="3"
        fill="transparent"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        class="transition-all duration-500 ease-out"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps({
  progress: {
    type: Number,
    default: 0, // 0 - 100
  },
  size: {
    type: Number,
    default: 16 // 默认 16px，对应 w-4
  }
})

// 半径 r=9 (viewBox 24x24, center 12, stroke 3)
const radius = 9
const circumference = 2 * Math.PI * radius

// 计算偏移量
const dashOffset = computed(() => {
  // 限制 progress 在 0-100 之间
  const p = Math.min(Math.max(props.progress, 0), 100)
  return circumference - (p / 100) * circumference
})
</script>