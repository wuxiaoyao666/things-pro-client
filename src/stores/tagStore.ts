import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'
import type { Result } from '@/api/types'
import type { TagVO } from '@/api/tag'

export const useTagStore = defineStore('tag', () => {
  const allTags = ref<TagVO[]>([])

  const getAllTags = async () => {
    try {
      const res = await request.get<any, Result<TagVO[]>>('/tag/list')
      allTags.value = res.data
    } catch (error) {
      console.error(error)
    }
  }

  return { allTags, getAllTags }
})