import { createWebHistory, createRouter } from 'vue-router'
import { usersApi, boardsApi, threadsApi, $axios, $axios2 } from '@/api'
import Boards from '@/views/Boards.vue'
import Threads from '@/views/Threads.vue'
import ThreadsPostedIn from '@/views/ThreadsPostedIn.vue'
import Posts from '@/views/Posts.vue'
import About from '@/views/About.vue'
import Settings from '@/views/Settings.vue'
import Patrol from '@/views/Patrol.vue'
import Trust from '@/views/Trust.vue'
import TrustSettings from '@/views/TrustSettings.vue'
import MemberSearch from '@/views/MemberSearch.vue'
import Watchlist from '@/views/Watchlist.vue'
import WatchlistEdit from '@/views/WatchlistEdit.vue'
import Mentions from '@/views/Mentions.vue'
import Messages from '@/views/Messages.vue'
import PostSearch from '@/views/PostSearch.vue'
import Join from '@/views/Join.vue'
import GeneralSettings from '@/views/admin/settings/General.vue'
import AdvancedSettings from '@/views/admin/settings/Advanced.vue'
import LegalSettings from '@/views/admin/settings/Legal.vue'
import ThemeSettings from '@/views/admin/settings/Theme.vue'
import BoardManagement from '@/views/admin/management/Boards.vue'
import UserManagement from '@/views/admin/management/Users.vue'
import RoleManagement from '@/views/admin/management/Roles.vue'
import BannedAddressManagement from '@/views/admin/management/BannedAddresses.vue'
import InvitationManagement from '@/views/admin/management/Invitations.vue'
import LogModeration from '@/views/admin/moderation/Logs.vue'
import UserModeration from '@/views/admin/moderation/Users.vue'
import PostModeration from '@/views/admin/moderation/Posts.vue'
import MessageModeration from '@/views/admin/moderation/Messages.vue'
import BoardBanModeration from '@/views/admin/moderation/BoardBans.vue'
import ConfirmAccount from '@/views/ConfirmAccount.vue'
import ResetPassword from '@/views/ResetPassword.vue'
import Profile from '@/views/Profile.vue'
import Forbidden from '@/views/layout/Forbidden.vue'
import NotFound from '@/views/layout/NotFound.vue'
import ServiceUnavailable from '@/views/layout/ServiceUnavailable.vue'
import UserPosts from '@/components/users/UserPosts.vue'
import Login from '@/views/layout/Login.vue'
import NProgress from 'nprogress'
import { nextTick } from 'vue'
import localStorageCache from '@/composables/utils/localStorageCache'
import { localStorageAuth } from '@/composables/stores/auth'
import BanStore from '@/composables/stores/ban'
import PermissionUtils from '@/composables/utils/permissions'

const routes = [
  {
    path: '/admin/settings',
    alias: '/admin',
    name: 'GeneralSettings',
    component: GeneralSettings,
    meta: { requiresAuth: true, bodyClass: 'general-settings', title: 'Settings' },
    beforeEnter: (to, from, next) => {
      let permUtil = new PermissionUtils(localStorageAuth().data)
      if (permUtil.hasPermission('adminAccess.settings')) {
        if (permUtil.hasPermission('adminAccess.settings.general')) next()
        else if (permUtil.hasPermission('adminAccess.settings.advanced')) next({ name: 'AdvancedSettings'})
        else if (permUtil.hasPermission('adminAccess.settings.theme')) next({ name: 'ThemeSettings'})
        else if (permUtil.hasPermission('adminAccess.settings.legal')) next({ name: 'LegalSettings'})
        else next({ name: 'Boards' })
      }
      else if (permUtil.hasPermission('adminAccess.management')) {
        if (permUtil.hasPermission('adminAccess.management.boards')) next({ name: 'BoardManagement'})
        else if (permUtil.hasPermission('adminAccess.management.users')) next({ name: 'UserManagement'})
        else if (permUtil.hasPermission('adminAccess.management.roles')) next({ name: 'RoleManagement'})
        else if (permUtil.hasPermission('adminAccess.management.bannedAddresses')) next({ name: 'BannedAddressManagement'})
        else if (permUtil.hasPermission('adminAccess.management.invitations')) next({ name: 'InvitationManagement'})
        else next({ name: 'Boards' })
      }
      else if (permUtil.hasPermission('modAccess')) {
        if (permUtil.hasPermission('modAccess.users')) next({ name: 'UserModeration' })
        else if (permUtil.hasPermission('modAccess.posts')) next({ name: 'PostModeration' })
        else if (permUtil.hasPermission('modAccess.messages')) next({ name: 'MessageModeration' })
        else next({ name: 'Boards' })
      }
      else next({ name: 'Boards' })
    }
  },
  {
    path: '/admin/settings/advanced',
    name: 'AdvancedSettings',
    component: AdvancedSettings,
    meta: { requiresAuth: true, bodyClass: 'advanced-settings', title: 'Settings' }
  },
  {
    path: '/admin/settings/legal',
    name: 'LegalSettings',
    component: LegalSettings,
    meta: { requiresAuth: true, bodyClass: 'legal-settings', title: 'Settings' }
  },
  {
    path: '/admin/settings/theme',
    name: 'ThemeSettings',
    component: ThemeSettings,
    meta: { requiresAuth: true, bodyClass: 'theme-settings', title: 'Settings' }
  },
  {
    path: '/admin/management/boards',
    alias: '/admin/management',
    name: 'BoardManagement',
    component: BoardManagement,
    meta: { requiresAuth: true, bodyClass: 'board-management', title: 'Management' },
  },
  {
    path: '/admin/management/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, bodyClass: 'user-management', title: 'Management' }
  },
  {
    path: '/admin/management/roles',
    name: 'RoleManagement',
    component: RoleManagement,
    meta: { requiresAuth: true, bodyClass: 'role-management', title: 'Management' }
  },
  {
    path: '/admin/management/bannedaddresses',
    name: 'BannedAddressManagement',
    component: BannedAddressManagement,
    meta: { requiresAuth: true, bodyClass: 'banned-address-management', title: 'Management' }
  },
  {
    path: '/admin/management/invitations',
    name: 'InvitationManagement',
    component: InvitationManagement,
    meta: { requiresAuth: true, bodyClass: 'invitation-management', title: 'Management' }
  },
  {
    path: '/admin/moderation/users',
    alias: '/admin/moderation',
    name: 'UserModeration',
    component: UserModeration,
    meta: { requiresAuth: true, bodyClass: 'user-moderation', title: 'Moderation' },
    children: [{
      path: ':username',
      name: 'UserModeration.ProfilePreview',
      component: Profile,
      props: true,
      children: [{
        path: '',
        name: 'UserModeration.ProfilePreview.UserPosts',
        component: UserPosts,
        props: true
      }]
    }]
  },
  {
    path: '/admin/moderation/posts',
    name: 'PostModeration',
    component: PostModeration,
    meta: { requiresAuth: true, bodyClass: 'post-moderation', title: 'Moderation' }
  },
  {
    path: '/admin/moderation/messages',
    name: 'MessageModeration',
    component: MessageModeration,
    meta: { requiresAuth: true, bodyClass: 'message-moderation', title: 'Moderation' }
  },
  {
    path: '/admin/moderation/boardbans',
    name: 'BoardBanModeration',
    component: BoardBanModeration,
    meta: { requiresAuth: true, bodyClass: 'board-ban-moderation', title: 'Moderation' }
  },
  {
    path: '/admin/moderation/logs',
    name: 'LogModeration',
    component: LogModeration,
    meta: { requiresAuth: true, bodyClass: 'log-moderation', title: 'Moderation' }
  },
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
    path: '/confirm/:username/:token',
    name: 'Confirm',
    component: ConfirmAccount,
    props: true,
    meta: { requiresAuth: false, bodyClass: 'confirm' }
  },
  {
    path: '/reset/:username/:token',
    name: 'ResetPassword',
    component: ResetPassword,
    props: true,
    meta: { requiresAuth: false, bodyClass: 'reset' }
  },
  {
    path: '/join',
    name: 'Join',
    component: Join,
    props: true,
    meta: { requiresAuth: false, bodyClass: 'join' }
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
      name: 'Profile.UserPosts',
      component: UserPosts,
      props: true
    }]
  },
  {
    path: '/profile/:username/posts',
    name: 'UserPosts',
    component: UserPosts,
    props: route => ({
      user: usersApi.find(route.params.username).then(u => u),
      username: route.params.username
    }),
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
    path: '/settings/trust',
    name: 'TrustSettings',
    component: TrustSettings,
    meta: { requiresAuth: true, bodyClass: 'trust' }
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
    meta: { requiresAuth: true, ignoreAxiosInterceptor: true, bodyClass: 'messages' }
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
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { requiresAuth: false, bodyClass: 'not-found' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'Forbidden',
    component: Forbidden,
    meta: { requiresAuth: false, bodyClass: 'forbidden' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'ServiceUnavailable',
    component: ServiceUnavailable,
    meta: { requiresAuth: false, bodyClass: 'service-unavailable' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash && !to.params.saveScrollPos) {
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
        fullPath: to.fullPath || '/',
        redirectParams: JSON.stringify(to.params), // Cannot pass object, gets converted to string
        redirectQuery: JSON.stringify(to.query),
      },
      query: { redirect: to.fullPath }
    })
  }
  else {
    to.meta.authedUser = localStorageAuth().data
    to.meta.permUtils = new PermissionUtils(to.meta.authedUser)
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

$axios2.interceptors.request.use(config => {
  let storedViewToken = localStorageCache(0, 'app').get('epochViewerToken')
  storedViewToken = storedViewToken ? storedViewToken.data : null
  if (storedViewToken) config.headers['epoch-viewer'] = storedViewToken
  return config
})


$axios2.interceptors.response.use(res => {
  let viewToken = res.headers['epoch-viewer']
  if (viewToken) localStorageCache(0, 'app').set('epochViewerToken', viewToken)
  return res
},
err => {
  if (err.response) { // Server still responding, just getting errors from api calls
    switch (err.response.status) {
      case 401:
        delete $axios2.defaults.headers.common['Authorization'] // clear token from axios
        delete $axios.defaults.headers.common['Authorization'] // clear token from axios
        if (router.currentRoute._value.meta.requiresAuth) router.push({ name: 'Login'})
        else window.location.reload()
        break
      case 403:
        if (router.currentRoute._value.meta.ignoreAxiosInterceptor) break
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

$axios.interceptors.response.use(res => res, err => {
  if (err.response) { // Server still responding, just getting errors from api calls
    switch (err.response.status) {
      case 401:
        delete $axios2.defaults.headers.common['Authorization'] // clear token from axios
        delete $axios.defaults.headers.common['Authorization'] // clear token from axios
        if (router.currentRoute._value.meta.requiresAuth) router.push({ name: 'Login'})
        else window.location.reload()
        break
      case 403:
        if (router.currentRoute._value.meta.ignoreAxiosInterceptor) break
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
