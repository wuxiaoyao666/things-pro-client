import type { RouteRecordRaw } from 'vue-router'
import LoginView from '@/views/LoginView.vue'
import MainLayout from '@/layout/MainLayout.vue'
import InboxView from '@/views/InboxView.vue'
// 引入新组件 (稍后创建)
import ProjectView from '@/views/ProjectView.vue'
import TodayView from '@/views/TodayView.vue'

export const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { title: '登录 - Things Pro' },
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/inbox',
    children: [
      {
        path: 'inbox',
        name: 'inbox',
        component: InboxView,
        meta: { title: '收件箱' },
      },
      // ... 其他路由保持不变 ...
      { path: 'today', component: TodayView, meta: { title: '今天' } },
      { path: 'upcoming', component: InboxView, meta: { title: '计划' } },
      { path: 'anytime', component: InboxView, meta: { title: '随时' } },
      { path: 'someday', component: InboxView, meta: { title: '某天' } },
      { path: 'logbook', component: InboxView, meta: { title: '日志簿' } },
      { path: 'trash', component: InboxView, meta: { title: '废纸篓' } },

      // :id 是动态参数，匹配 /project/199...
      {
        path: 'project/:id',
        name: 'project',
        component: ProjectView,
        meta: { title: '项目详情' }
      }
    ],
  },
]