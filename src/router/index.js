import { createWebHistory, createRouter } from 'vue-router'
import { boardsApi, threadsApi, $axios } from '@/api'
import Boards from '@/views/Boards.vue'
import Threads from '@/views/Threads.vue'
import ThreadsPostedIn from '@/views/ThreadsPostedIn.vue'
import Posts from '@/views/Posts.vue'
import About from '@/views/About.vue'
import Settings from '@/views/Settings.vue'
import Patrol from '@/views/Patrol.vue'
import Trust from '@/views/Trust.vue'
import MemberSearch from '@/views/MemberSearch.vue'
import Watchlist from '@/views/Watchlist.vue'
import WatchlistEdit from '@/views/WatchlistEdit.vue'
import Mentions from '@/views/Mentions.vue'
import Messages from '@/views/Messages.vue'
import PostSearch from '@/views/PostSearch.vue'
import Profile from '@/views/Profile.vue'
import Forbidden from '@/views/layout/Forbidden.vue'
import NotFound from '@/views/layout/NotFound.vue'
import ServiceUnavailable from '@/views/layout/ServiceUnavailable.vue'
import UserPosts from '@/components/users/UserPosts.vue'
import Login from '@/views/layout/Login.vue'
import NProgress from 'nprogress'
import { nextTick } from 'vue'
import { localStorageAuth } from '@/composables/stores/auth'
import BanStore from '@/composables/stores/ban'

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
    path: '/threads/posted',
    name: 'ThreadsPostedIn',
    component: ThreadsPostedIn,
    meta: { requiresAuth: true, bodyClass: 'threads-posted-in' }
  },
  {
    path: '/profile/:username',
    name: 'Profile',
    component: Profile,
    props: true,
    meta: { requiresAuth: true, bodyClass: 'profile' },
    children: [{
      path: '',
      component: UserPosts,
      props: true
    }]
  },
  {
    path: '/profile/:username/posts',
    name: 'UserPosts',
    component: UserPosts,
    props: true,
    meta: { requiresAuth: true, bodyClass: 'user-posts' }
  },
  {
    path: '/profile/:username/trust',
    name: 'Trust',
    component: Trust,
    props: true,
    meta: { requiresAuth: true, bodyClass: 'trust' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true, bodyClass: 'settings' }
  },
  {
    path: '/patrol',
    name: 'Patrol',
    component: Patrol,
    meta: { requiresAuth: true, bodyClass: 'patrol' }
  },
  {
    path: '/messages',
    name: 'Messages',
    component: Messages,
    meta: { requiresAuth: true, bodyClass: 'messages' }
  },
  {
    path: '/mentions',
    name: 'Mentions',
    component: Mentions,
    meta: { requiresAuth: true, bodyClass: 'mentions' }
  },
  {
    path: '/watchlist',
    name: 'Watchlist',
    component: Watchlist,
    meta: { requiresAuth: true, bodyClass: 'watchlist' }
  },
  {
    path: '/watchlist/edit',
    name: 'WatchlistEdit',
    component: WatchlistEdit,
    meta: { requiresAuth: true, bodyClass: 'watchlist' }
  },
  {
    path: '/search/users',
    name: 'MemberSearch',
    component: MemberSearch,
    meta: { requiresAuth: true, bodyClass: 'member-search' }
  },
  {
    path: '/search/posts',
    name: 'PostSearch',
    component: PostSearch,
    meta: { requiresAuth: false, bodyClass: 'post-search' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { requiresAuth: false, bodyClass: 'about' }
  },
  {
    path: '/:catchAll(.*)',
    name: 'NotFoundCatchAll',
    component: NotFound,
    meta: { requiresAuth: false, bodyClass: 'not-found' }
  },
  {
    path: '/404',
    name: 'NotFound',
    component: NotFound,
    meta: { requiresAuth: false, bodyClass: 'not-found' }
  },
  {
    path: '/403',
    name: 'Forbidden',
    component: Forbidden,
    meta: { requiresAuth: false, bodyClass: 'forbidden' }
  },
  {
    path: '/503',
    name: 'ServiceUnavailable',
    component: ServiceUnavailable,
    meta: { requiresAuth: false, bodyClass: 'service-unavailable' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) {
      nextTick(() => {
        document.getElementById(to.hash.substring(1)).scrollIntoView({behavior: 'smooth'})
      })
    }
    else if (!to.params.saveScrollPos) document.getElementsByTagName('html')[0].scrollIntoView()
  }
})

router.beforeEach(to => {
  // Start progress bar
  NProgress.start()

  BanStore.initBanNotice(localStorageAuth().data)

  // Redirect to login page if route has meta.requiresAuth set
  if (to.meta.requiresAuth && !localStorageAuth().data.token) {
    router.push({
      name: 'Login',
      params: {
        redirectName: to.name || 'Boards',
        redirectParams: JSON.stringify(to.params), // Cannot pass object, gets converted to string
        redirectQuery: JSON.stringify(to.query),
      },
      query: { redirect: to.fullPath }
    })
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

$axios.interceptors.response.use(res => res, err => {
  if(err.response) { // Server still responding, just getting errors from api calls
    switch (err.response.status) {
      case 401:
        if (router.currentRoute._value.meta.requiresAuth) router.push({ name: 'Login'})
        break
      case 403:
        if (err.response.statusText === 'Forbidden' || err.response.data.error === 'Forbidden') {
          router.push({ name: 'Forbidden'})
        }
        break
      case 404:
        router.push({ name: 'NotFound'})
        break
      default:
        break
    }
  }
  else router.push({ name: 'ServiceUnavailable'}) // API is down, 503
  return Promise.reject(err)
})

export default router
