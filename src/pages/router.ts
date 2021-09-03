import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory('/bmm/'),
  routes: [
    // 在 / 页面里处理 ?code= 的情况
    { path: '/', component: () => import('./Root') },
    { path: '/login', component: () => import('./Login') },
    { path: '/index', component: () => import('./Index') },
    { path: '/admin', component: () => import('./Admin') },
  ],
})
