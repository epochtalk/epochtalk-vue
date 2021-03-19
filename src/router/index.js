import { createWebHistory, createRouter } from 'vue-router'
import { boardsApi, threadsApi } from '@/api'
import Boards from '@/views/Boards.vue'
import Threads from '@/views/Threads.vue'
import Posts from '@/views/Posts.vue'
import About from '@/views/About.vue'
import Settings from '@/views/Settings.vue'
import NotFound from '@/views/layout/NotFound.vue'
import Login from '@/views/layout/Login.vue'
import NProgress from 'nprogress'
import { nextTick } from 'vue'
import { localStorageAuth } from '@/composables/stores/auth'

const routes = [
  {
    path: '/',
    name: 'Boards',
    component: Boards,
    meta: { requiresAuth: false, bodyClass: 'boards' }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    props: true,
    meta: { requiresAuth: false, bodyClass: 'login' }
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
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true, bodyClass: 'settings' }
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
       setTimeout(() => document.querySelector(to.hash).scrollIntoView({behavior: 'smooth'}))
      })
    }
    else if (!to.params.saveScrollPos) document.getElementsByTagName('html')[0].scrollIntoView()
  }
})

router.beforeEach((to) => {
  // Start progress bar
  NProgress.start()

  if (to.meta.requiresAuth && !localStorageAuth().data.token) {
    router.push({ name: 'Login', params: { redirectTo: to.name || 'Boards' } })
  }
})

router.afterEach(to => {
  // Stop progress bar
  NProgress.done()

  // Apply route.meta.bodyClass as body class if present
  const bodyClass = to.meta.bodyClass
  if (bodyClass) { document.body.className = bodyClass }
  else { document.body.className = '' }
})

export default router
