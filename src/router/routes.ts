import type { RouteRecordRaw } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import MainLayout from '@/layout/MainLayout.vue'
import InboxView from '@/views/InboxView.vue'

export const routes: RouteRecordRaw[] = [
  // 1. 登录页 (独立路由，没有侧边栏)
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: '登录 - Things Pro' },
  },

  // 2. 业务主页 (父路由使用 MainLayout)
  {
    path: '/',
    component: MainLayout,
    redirect: '/inbox', // 访问 / 自动去收件箱
    children: [
      // 这些子路由会渲染到 MainLayout 的 <router-view> 里
      {
        path: 'inbox', // 注意：子路由路径不需要加 /
        name: 'inbox',
        component: InboxView,
        meta: { title: '收件箱' },
      },
      { path: 'today', component: InboxView, meta: { title: '今天' } },
      { path: 'upcoming', component: InboxView, meta: { title: '计划' } },
      { path: 'anytime', component: InboxView, meta: { title: '随时' } },
      { path: 'someday', component: InboxView, meta: { title: '某天' } },
      { path: 'logbook', component: InboxView, meta: { title: '日志簿' } },
      { path: 'trash', component: InboxView, meta: { title: '废纸篓' } },
    ],
  },
]
