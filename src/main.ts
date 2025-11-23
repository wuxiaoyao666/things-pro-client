import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 如果不加这行，Tailwind 的 class (比如 bg-gray-100) 就不会生效
import './assets/main.css'

const app = createApp(App)

// pinia
const pinia = createPinia()
// 持久化插件
import persistedstate from 'pinia-plugin-persistedstate'

pinia.use(persistedstate)

app.use(pinia)
app.use(router)

app.mount('#app')