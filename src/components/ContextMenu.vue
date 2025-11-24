<!--右键菜单组件-->
<template>
  <div
    v-if="visible"
    class="fixed z-50 bg-white/95 backdrop-blur-md border border-gray-200 rounded-lg shadow-xl py-1 min-w-[140px] text-sm font-medium text-gray-700 select-none origin-top-left animate-in fade-in zoom-in-95 duration-100"
    :style="{ top: y + 'px', left: x + 'px' }"
    @click.stop
  >
    <div
      @click="onRename"
      class="px-3 py-1.5 hover:bg-[#2ea4db] hover:text-white cursor-pointer flex items-center space-x-2 mx-1 rounded transition-colors"
    >
      <Pencil class="w-3.5 h-3.5" />
      <span>重命名</span>
    </div>

    <div class="h-[1px] bg-gray-100 my-1 mx-1"></div>

    <div
      @click="onDelete"
      class="px-3 py-1.5 hover:bg-[#ff3b30] hover:text-white cursor-pointer flex items-center space-x-2 mx-1 rounded transition-colors text-[#ff3b30]"
    >
      <Trash2 class="w-3.5 h-3.5" />
      <span>删除项目</span>
    </div>
  </div>

  <div
    v-if="visible"
    class="fixed inset-0 z-40 bg-transparent"
    @click="$emit('close')"
    @contextmenu.prevent="$emit('close')"
  ></div>
</template>

<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next'

defineProps<{
  visible: boolean
  x: number
  y: number
}>()

const emit = defineEmits(['close', 'rename', 'delete'])

const onRename = () => {
  emit('rename')
  emit('close')
}

const onDelete = () => {
  emit('delete')
  emit('close')
}
</script>
