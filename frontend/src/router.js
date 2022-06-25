import Index from '@/views/index.vue'
import manage from '@/views/manage.vue'
import Login from '@/views/login.vue'
import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  { path: '/',name:'index', component: Index },
  { path: '/manage',name:'manage', component: manage },
  { path: '/login',name:'login', component: Login },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

export default router
