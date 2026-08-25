import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'repertoire',
      component: () => import('@/views/RepertoireView.vue'),
      meta: { title: 'Repertorio' },
    },
    {
      path: '/offline',
      redirect: '/',
    },
    {
      path: '/score/:id',
      redirect: '/',
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

router.afterEach((to) => {
  const base = 'Brutal Repertorio'
  const page = typeof to.meta.title === 'string' ? to.meta.title : ''
  document.title = page ? `${page} · ${base}` : base
})

export default router
