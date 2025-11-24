<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { PieChart } from 'lucide-vue-next'
// 假设你稍后会把 API 定义好，这里先留空
// import { reqGetProjectDetail } from '@/api/project'

const route = useRoute()
const loading = ref(false)
const projectId = ref('')
const projectName = ref('加载中...')

// 获取数据的函数
const loadProjectData = async (id: string) => {
  loading.value = true
  projectId.value = id

  try {
    console.log('正在请求项目详情，ID:', id)
    // TODO: 这里调用后端接口 GET /api/v1/project/:id
    // const res = await reqGetProjectDetail(id)
    // projectName.value = res.data.name

    // 模拟数据
    setTimeout(() => {
      projectName.value = `项目 ${id}` // 临时显示
    }, 300)
  } finally {
    loading.value = false
  }
}

// 1. 初始化加载
onMounted(() => {
  if (route.params.id) {
    loadProjectData(route.params.id as string)
  }
})

// 2. 关键：监听路由 ID 变化
// 当用户从 "项目A" 点击 "项目B" 时，组件不会销毁重建，
// 而是复用，所以必须 watch 路由参数来刷新数据
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      loadProjectData(newId as string)
    }
  }
)
</script>

<template>
  <div class="flex-1 h-full bg-white flex flex-col overflow-hidden">
    <header class="pt-10 px-10 pb-4 flex items-center space-x-3 shrink-0">
      <div class="p-1 bg-gray-100 rounded-md shadow-sm text-gray-500">
        <PieChart class="w-6 h-6" />
      </div>
      <h1 class="text-3xl font-bold text-[#333] tracking-tight truncate">
        {{ projectName }}
      </h1>
    </header>

    <main class="flex-1 overflow-y-auto px-10 pb-20">
      <div v-if="loading" class="text-gray-400 text-sm mt-4">加载中...</div>
      <div v-else>
        <p class="text-gray-500 mt-4">这里是项目 {{ projectId }} 的任务列表区域</p>
      </div>
    </main>
  </div>
</template>