import { createWebHistory, createRouter } from 'vue-router'
import Boards from '@/views/Boards.vue'
import Threads from '@/views/Threads.vue'
import About from '@/views/About.vue'
import NotFound from '@/views/NotFound.vue'

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
    props: true,
    meta: { requiresAuth: false, bodyClass: 'threads' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { requiresAuth: false }
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
  scrollBehavior() {
    document.getElementsByTagName('html')[0].scrollIntoView();
  }
})

router.beforeEach(to => {
  const bodyClass = to.meta.bodyClass
  if (bodyClass) { document.body.className = bodyClass }
  else { document.body.className = '' }
})

export default router
