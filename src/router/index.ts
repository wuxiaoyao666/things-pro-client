import { createRouter, createWebHistory } from 'vue-router'
import InboxView from '../views/InboxView.vue'
import { useUserStore } from '@/stores/userStore.ts'
import { routes } from './routes.ts'
import { reqInfo } from '@/api/user.ts'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes,
})

// 免登录白名单
const whiteList = ['/login', '/register']

router.beforeEach(async (to, from, next) => {
  // NProgress.start()
  const userStore = useUserStore()
  const token = userStore.token

  // 1. 设置标题
  document.title = (to.meta.title as string) || 'Things Pro'

  if (token) {
    // 2. 已登录状态
    if (to.path === '/login') {
      // 如果已登录还要去登录页，强制跳回首页
      next('/')
    } else {
      // 判断用户信息是否已加载
      if (userStore.loginUser?.id) {
        next()
      } else {
        try {
          // 3. 没有用户信息，用 Token 换用户信息
          const res = await reqInfo()
          userStore.loginUser = res.data // 假设 res.data 是用户信息
          next()
        } catch (error) {
          // 4. Token 过期或无效：必须清除 Token！
          userStore.logout()
          next('/login')
        }
      }
    }
  } else {
    if (whiteList.includes(to.path)) {
      next()
    } else {
      next('/login')
    }
  }
})

export default router
