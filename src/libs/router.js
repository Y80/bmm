import { createRouter, createWebHistory } from 'vue-router'

export default createRouter({
  history: createWebHistory(),
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
      path: '/tags',
      component: () => import('@/views/tags/index.vue'),
    },
    {
      path: '/bookmarks',
      component: () => import('@/views/bookmarks/index.vue'),
    },
    {
      path: '/loading',
      component: () => import('@/views/home/loading.vue'),
    },
  ],
})
