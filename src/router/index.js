import { createWebHistory, createRouter } from 'vue-router'
import { inject } from 'vue'
import { Api } from '@/api'
import { boards } from '@/api/others'
import Boards from '@/views/Boards.vue'
import Threads from '@/views/Threads.vue'
import About from '@/views/About.vue'
import NotFound from '@/views/NotFound.vue'
import NProgress from 'nprogress'

const routes = [
  {
    path: '/',
    name: 'Boards',
    component: Boards,
    meta: { requiresAuth: false, bodyClass: 'boards' }
  },
  {
    path: '/boards/:boardSlug',
    name: 'Threads',
    component: Threads,
    props: route => ({
      boardSlug: route.params.boardSlug,
      boardId: boards.slugToBoardId(inject(Api), route.params.boardSlug).then(b => b.id)
    }),
    meta: { requiresAuth: false, bodyClass: 'threads' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { requiresAuth: false, bodyClass: 'about' }
  },
  {
    path: '/:catchAll(.*)',
    component: NotFound,
    meta: { requiresAuth: false }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) document.querySelector(to.hash).scrollIntoView()
    else if (!to.params.saveScrollPos) document.getElementsByTagName('html')[0].scrollIntoView()
  }
})

router.beforeEach(to => {
  // Start progress bar
  if (!to.hash) { NProgress.start() }

  // Apply route.meta.bodyClass as body class if present
  const bodyClass = to.meta.bodyClass
  if (bodyClass) { document.body.className = bodyClass }
  else { document.body.className = '' }
})

router.afterEach(to => {
  // Stop progress bar
  if (!to.hash) { NProgress.done() }
})

export default router
