import { createWebHistory, createRouter } from 'vue-router'
import { boardsApi, threadsApi } from '@/api'
import Boards from '@/views/Boards.vue'
import Threads from '@/views/Threads.vue'
import Posts from '@/views/Posts.vue'
import About from '@/views/About.vue'
import NotFound from '@/views/NotFound.vue'
import NProgress from 'nprogress'
import { nextTick } from 'vue'

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
      boardId: boardsApi.slugToBoardId(route.params.boardSlug).then(b => b.id)
    }),
    meta: { requiresAuth: false, bodyClass: 'threads' }
  },
  {
    path: '/threads/:threadSlug',
    name: 'Posts',
    component: Posts,
    props: route => ({
      threadSlug: route.params.threadSlug,
      threadId: threadsApi.slugToThreadId(route.params.threadSlug).then(t => t.id)
    }),
    meta: { requiresAuth: false, bodyClass: 'posts' }
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
    if (to.hash) {
      nextTick(() => {
        document.querySelector(to.hash).scrollIntoView()
      })
    }
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
