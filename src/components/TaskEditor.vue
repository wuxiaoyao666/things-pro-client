<template>
  <div
    ref="editorRef"
    class="bg-white rounded-xl shadow-xl ring-1 ring-black/5 p-4 relative z-10 my-2 origin-top"
  >
    <div class="flex items-start">
      <div class="mt-1 mr-3 shrink-0">
        <div
          @click="toggleStatus"
          class="w-5 h-5 border-2 border-gray-300 rounded-[5px] flex items-center justify-center cursor-pointer transition-colors"
          :class="{ '!bg-[#2ea4db] !border-[#2ea4db]': localTask.status === 1 }"
        >
          <svg
            v-if="localTask.status === 1"
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

      <div class="flex-1 min-w-0 space-y-2">
        <input
          ref="titleInputRef"
          v-model="localTask.name"
          type="text"
          class="w-full text-[15px] font-medium text-[#333] placeholder-gray-400 outline-none bg-transparent border-none p-0"
          placeholder="新待办事项"
          @keydown.enter="saveAndClose"
        />

        <textarea
          v-model="localTask.description"
          rows="2"
          class="w-full text-[13px] text-gray-500 placeholder-gray-400 outline-none bg-transparent border-none p-0 resize-none leading-relaxed"
          placeholder="备注"
        ></textarea>

        <div class="flex flex-wrap gap-2 items-center min-h-[24px]">
          <span
            v-for="tag in localTask.tags"
            :key="tag.id"
            class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#e5e5e5]/50 text-[#666] flex items-center cursor-pointer hover:bg-[#e5e5e5]"
            @click="removeTag(tag.id)"
          >
            {{ tag.name }}
          </span>

          <div class="relative">
            <button
              @click.stop="toggleTagSelector"
              class="text-[11px] text-[#2ea4db] hover:bg-blue-50 px-2 py-0.5 rounded transition-colors font-medium"
            >
              + 标签
            </button>

            <div
              v-if="showTagSelector"
              ref="tagSelectorRef"
              class="absolute top-6 left-0 bg-white border border-gray-200 shadow-xl rounded-lg p-2 w-48 z-50 flex flex-col gap-1"
              @click.stop
            >
              <input
                ref="tagInputRef"
                v-model="tagNameInput"
                type="text"
                class="w-full px-2 py-1.5 mb-1 text-xs bg-gray-50 border border-gray-200 rounded outline-none focus:border-[#2ea4db] transition-colors"
                placeholder="输入标签名，回车创建"
                @keydown.enter.prevent.stop="handleCreateTag($event)"
              />

              <div class="max-h-40 overflow-y-auto custom-scrollbar flex flex-col gap-1">
                <div
                  v-for="t in filteredTagList"
                  :key="t.id"
                  @click="addTag(t)"
                  class="px-2 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded cursor-pointer flex justify-between items-center transition-colors"
                >
                  <div class="flex items-center space-x-2">
                    <div
                      class="w-2 h-2 rounded-full"
                      :style="{ backgroundColor: t.color || '#8E8E93' }"
                    ></div>
                    <span>{{ t.name }}</span>
                  </div>
                  <span v-if="hasTag(t.id)" class="text-[#2ea4db] font-bold">✓</span>
                </div>

                <div
                  v-if="filteredTagList.length === 0 && tagNameInput"
                  class="px-2 py-2 text-[10px] text-gray-400 text-center"
                >
                  按回车创建 "{{ tagNameInput }}"
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between pt-2 mt-2 border-t border-gray-100/50">
          <div class="flex items-center space-x-3">
            <div
              class="flex items-center space-x-1 text-[#f5cc00] font-medium text-xs bg-yellow-50 px-2 py-1 rounded cursor-pointer"
            >
              <Star class="w-3.5 h-3.5 fill-current" />
              <span>今天</span>
            </div>
          </div>

          <div class="flex items-center space-x-4 text-gray-400">
            <ListTodo class="w-4 h-4 hover:text-gray-600 cursor-pointer transition-colors" />

            <div class="relative group">
              <label
                class="cursor-pointer flex items-center hover:text-[#ff3b30] transition-colors"
              >
                <Flag
                  class="w-4 h-4"
                  :class="{ 'fill-[#ff3b30] text-[#ff3b30]': localTask.endTime }"
                />
              </label>
              <input
                type="date"
                v-model="dateInput"
                @change="onDateChange"
                class="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </div>
            <span v-if="localTask.endTime" class="text-xs text-[#ff3b30] font-medium">
              {{ localTask.endTime }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, computed } from 'vue'
import { onClickOutside, onKeyStroke } from '@vueuse/core'
import { Star, Flag, ListTodo } from 'lucide-vue-next'
import { useTagStore } from '@/stores/tagStore'
import { reqUpdateTask, type TaskVO } from '@/api/task'
import { reqCreateTag, type TagVO } from '@/api/tag'
import { toast } from 'vue-sonner'

const props = defineProps<{
  task: TaskVO
}>()

const emit = defineEmits(['close', 'update'])
const tagStore = useTagStore()

// 本地数据副本
const localTask = reactive<TaskVO>(JSON.parse(JSON.stringify(props.task)))
const dateInput = ref('')
const titleInputRef = ref<HTMLInputElement | null>(null)
const editorRef = ref(null)

// 标签相关状态
const showTagSelector = ref(false)
const tagNameInput = ref('')
const tagInputRef = ref<HTMLInputElement | null>(null)
const tagSelectorRef = ref(null) // 用于检测标签选择器外部点击

// 🔒 保存锁
const isSaving = ref(false)
const isCreatingTag = ref(false)

onMounted(async () => {
  tagStore.getAllTags()
  if (localTask.endTime) {
    dateInput.value = localTask.endTime
  }
  // 自动聚焦标题
  await nextTick()
  titleInputRef.value?.focus()
})

// =============================================================================
// 1. 交互逻辑：点击外部与Esc键
// =============================================================================

// A. 点击标签选择器外部 -> 仅关闭选择器
onClickOutside(tagSelectorRef, () => {
  if (showTagSelector.value) {
    showTagSelector.value = false
  }
})

// B. 点击整个编辑器外部 -> 保存并关闭
onClickOutside(editorRef, () => {
  // 只有当标签选择器关闭时，点击外部才视为保存
  // 否则点击标签选择器外部其实就是点击了编辑器内部
  if (!showTagSelector.value && !isSaving.value) {
    saveAndClose()
  }
})

// C. Esc 键监听 (层级关闭)
onKeyStroke('Escape', (e) => {
  e.preventDefault()

  // 优先级1: 关标签选择器
  if (showTagSelector.value) {
    showTagSelector.value = false
    return
  }

  // 优先级2: 关编辑器
  if (!isSaving.value) {
    saveAndClose()
  }
})

// =============================================================================
// 2. 保存逻辑
// =============================================================================
const saveAndClose = async () => {
  if (isSaving.value) return
  isSaving.value = true

  try {
    const tagIds = localTask.tags.map((t) => t.id)

    await reqUpdateTask({
      id: localTask.id,
      name: localTask.name,
      description: localTask.description,
      status: localTask.status,
      endTime: localTask.endTime ? localTask.endTime : null,
      startTime: localTask.startTime,
      tagIds: tagIds,
      projectId: localTask.projectId,
      titleId: localTask.titleId,
      checklist: localTask.checklist,
      order: localTask.order,
      type: 0, // 今天视图默认类型
    })

    emit('update')
    emit('close')
  } catch (e) {
    toast.error('保存失败')
    isSaving.value = false
  }
}

// =============================================================================
// 3. 标签逻辑
// =============================================================================

const toggleTagSelector = async () => {
  showTagSelector.value = !showTagSelector.value
  if (showTagSelector.value) {
    tagNameInput.value = ''
    await nextTick()
    tagInputRef.value?.focus()
  }
}

const filteredTagList = computed(() => {
  if (!tagNameInput.value) return tagStore.allTags
  return tagStore.allTags.filter((t) =>
    t.name.toLowerCase().includes(tagNameInput.value.toLowerCase()),
  )
})

const hasTag = (id: string) => localTask.tags.some((t) => t.id === id)

const addTag = (tag: TagVO) => {
  if (hasTag(tag.id)) {
    removeTag(tag.id)
  } else {
    localTask.tags.push(tag)
  }
  // 保持选择器打开方便多选
  tagNameInput.value = ''
  tagInputRef.value?.focus()
}

const removeTag = (id: string) => {
  localTask.tags = localTask.tags.filter((t) => t.id !== id)
}

const handleCreateTag = async (e: KeyboardEvent) => {
  if (e.isComposing || isCreatingTag.value) return

  const name = tagNameInput.value.trim()
  if (!name) return

  // 查重
  const existingTag = tagStore.allTags.find((t) => t.name.toLowerCase() === name.toLowerCase())
  if (existingTag) {
    if (!hasTag(existingTag.id)) {
      localTask.tags.push(existingTag)
    }
    tagNameInput.value = ''
    return
  }

  isCreatingTag.value = true
  try {
    const res = await reqCreateTag(name)
    const newId = res.data

    const newTag: TagVO = {
      id: newId,
      name: name,
      color: '#8E8E93',
    }

    localTask.tags.push(newTag)
    tagStore.allTags.push(newTag)

    tagNameInput.value = ''
    toast.success(`标签 "${name}" 创建成功`)
  } catch (e) {
    console.error(e)
  } finally {
    isCreatingTag.value = false
  }
}

// =============================================================================
// 4. 其他逻辑
// =============================================================================
const toggleStatus = () => {
  localTask.status = localTask.status === 1 ? 0 : 1
}
const onDateChange = () => {
  localTask.endTime = dateInput.value
}
</script>