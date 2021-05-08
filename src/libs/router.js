import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  // 函数传入的 base 值务必与 vite.config.js 中的 base 值相同
  history: createWebHistory('/nav'),
  routes: [
    {
      path: '/',
      redirect: '/index',
    },
    {
      path: '/index',
      component: () => import('@/views/home/index.vue'),
    },
    {
      path: '/loading',
      component: () => import('@/views/home/loading.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/views/RouterView.vue'),
      children: [
        {
          path: 'tags',
          component: () => import('@/views/admin/tags.vue'),
        },
        {
          path: 'bookmarks',
          component: () => import('@/views/admin/bookmarks.vue'),
        },
      ],
    },
  ],
})
