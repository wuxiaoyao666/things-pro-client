import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UserInfoVO } from '@/api/user.ts'

export const useUserStore = defineStore(
  'user',
  () => {
    const loginUser = ref<UserInfoVO>({} as UserInfoVO)
    const token = ref<string>('')

    const logout = () => {
      token.value = ''
      loginUser.value = {} as UserInfoVO
    }

    return { loginUser, token, logout }
  },
  {
    persist: true,
  },
)
