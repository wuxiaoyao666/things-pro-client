<template>
  <div
    class="min-h-screen w-full flex items-center justify-center bg-[#f8f9fa] relative overflow-hidden"
  >
    <div
      class="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-100/50 rounded-full blur-[100px]"
    ></div>
    <div
      class="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-yellow-50/50 rounded-full blur-[100px]"
    ></div>

    <div
      class="w-full max-w-[400px] bg-white rounded-[24px] shadow-xl shadow-black/5 p-10 relative z-10"
    >
      <div class="flex flex-col items-center mb-10">
        <div
          class="w-16 h-16 bg-gradient-to-b from-[#2ea4db] to-[#2589b9] rounded-[18px] shadow-lg flex items-center justify-center mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-9 w-9 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800 tracking-tight">Things Pro</h1>
        <p class="text-sm text-gray-400 mt-2">登录以同步你的任务</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-5">
        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-gray-600 ml-1">用户名</label>
          <div class="relative">
            <input
              v-model="loginForm.username"
              type="text"
              :class="inputClass"
              placeholder="请输入用户名"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="text-[13px] font-medium text-gray-600 ml-1">密码</label>
          <div class="relative">
            <input
              v-model="loginForm.password"
              type="password"
              :class="inputClass"
              placeholder="请输入密码"
            />
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-[#2ea4db] hover:bg-[#2589b9] text-white font-semibold py-3.5 rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:shadow-blue-200/50 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center mt-2"
        >
          <span v-if="loading" class="loader mr-2"></span>
          {{ loading ? '登录中...' : '登 录' }}
        </button>
      </form>

      <div class="mt-8 text-center">
        <p class="text-[13px] text-gray-400">
          还没有账号？
          <a
            href="#"
            @click.prevent="toRegister"
            class="text-[#2ea4db] hover:underline font-medium transition-colors"
            >立即注册</a
          >
        </p>
      </div>
    </div>

    <div class="absolute bottom-6 text-xs text-gray-300">
      © 2025 Things Pro. Designed for Efficiency.
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/userStore' // 注意路径，如果是userStore.ts这里要对
import { reqLogin } from '@/api/user'
import { toast } from 'vue-sonner'

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)

// 这里是之前提取出来的 input 样式
const inputClass =
  'w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 text-sm transition-all duration-200 outline-none focus:bg-white focus:border-[#2ea4db] focus:ring-4 focus:ring-[#2ea4db]/10 placeholder:text-gray-400'

const loginForm = reactive({
  username: 'xiaoyao',
  password: 'senge520',
})

const handleLogin = async () => {
  if (!loginForm.username || !loginForm.password) {
    toast.warning('请输入用户名和密码')
    return
  }

  loading.value = true
  try {
    const res = await reqLogin(loginForm)
    // 假设后端返回 res.data.token
    userStore.token = res.data.token
    toast.success('欢迎回来')
    router.push('/')
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const toRegister = () => {
  toast.info('注册功能开发中...')
}
</script>

<style scoped>
.loader {
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
