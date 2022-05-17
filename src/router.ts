import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'

export default createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    // 在 / 页面里处理 ?code= 的情况
    { path: '/', component: () => import('./pages/Root') },
    { path: '/login', component: () => import('./pages/Login') },
    { path: '/index', component: () => import('./pages/Index') },
    { path: '/admin', component: () => import('./pages/Admin') },
    { path: '/oauth', component: () => import('./pages/OAuth') },
  ],
})
