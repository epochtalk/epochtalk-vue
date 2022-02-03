import { provide, computed, inject, reactive, readonly } from 'vue'
import { cloneDeep } from 'lodash'
import { authApi } from '@/api'
import { PreferencesStore } from '@/composables/stores/prefs'
import { socketLogout, socketLogin } from '@/composables/services/websocket'
import PermissionUtils from '@/composables/utils/permissions'
import BanStore from '@/composables/stores/ban'
import localStorageCache from '@/composables/utils/localStorageCache'
import { useRoute, useRouter } from 'vue-router'

const AUTH_KEY = 'auth'
const appCache = localStorageCache(0, 'app')
const emtpyUser = {
  avatar: '',
  id: null,
  moderating: [],
  permissions: {},
  roles: [],
  token: null,
  username: ''
}

const cachedUser = appCache.get(AUTH_KEY)
const user = reactive(cachedUser ? cachedUser.data : cloneDeep(emtpyUser))

export const AuthStore = Symbol(AUTH_KEY)

export const localStorageAuth = () => appCache.get(AUTH_KEY) || { data: emtpyUser }

export const clearUser = () => Object.assign(user, cloneDeep(emtpyUser))

export default {
  setup() {
    /* Internal Data */
    const $appCache = inject('$appCache')
    const $alertStore = inject('$alertStore')
    const $prefs = inject(PreferencesStore)
    const $route = useRoute()
    const $router = useRouter()

    /* Provided Methods */
    const reauthenticate = () => authApi.authenticate()
      .then(dbUser => {
        $appCache.set(AUTH_KEY, dbUser)
        Object.assign(user, dbUser)
        BanStore.initBanNotice(user)
        $prefs.fetch()
        socketLogin(user)
      }).catch(() => userCleanup(`Goodbye ${user.username}, your session has expired`))

    const login = (username, password, rememberMe) => authApi.login({ username, password, rememberMe })
      .then(dbUser => {
        $appCache.set(AUTH_KEY, dbUser)
        Object.assign(user, dbUser)
        BanStore.initBanNotice(user)
        $prefs.fetch()
        $alertStore.success(`Welcome ${user.username}, you have successfully logged in!`)
        socketLogin(user)
      }).catch(() => {})

    const logout = () => authApi.logout()
      .then(() => userCleanup(`Goodbye ${user.username}, you have successfully logged out!`))

    const userCleanup = msg => {
      delete user.token // clear token to invalidate session immediately
      $appCache.delete(AUTH_KEY)
      $prefs.clear()
      BanStore.clearBanNotice()
      $alertStore.warn(msg)
      // redirect to home on logout
      if ($route.meta.requiresAuth && $route.path !== '/') $router.push({ path: '/' })
      // delay clearing reactive user to give css transitions time to complete
      setTimeout(() => Object.assign(user, cloneDeep(emtpyUser)), 500)
      socketLogout(emtpyUser)
    }

    const register = (email, username, password) => authApi.register({ email, username, password })
      .then(dbUser => {
        // Set user session if account is already confirmed (log the user in)
        if (!dbUser.confirm_token) {
          $appCache.set(AUTH_KEY, dbUser)
          Object.assign(user, dbUser)
          $prefs.fetch()
          $alertStore.success(`Welcome ${user.username}, you have successfully registered!`)
          socketLogin(user)
        }
        else return true // when email confirmation is enabled, tell modal to show confirmation msg
      }).catch(() => {})

    const confirmRegistration = (username, token) => authApi.confirmRegistration({ username, token })
      .then(dbUser => {
        $appCache.set(AUTH_KEY, dbUser)
        Object.assign(user, dbUser)
        $prefs.fetch()
        $alertStore.success(`Welcome ${user.username}, you have successfully registered!`)
        socketLogin(user)
      }).catch(() => {})

    const inviteRegistration = (username, token, email, password) => authApi.inviteRegistration({ email, username, password, confirmation: password, hash: token })
      .then(dbUser => {
        $appCache.set(AUTH_KEY, dbUser)
        Object.assign(user, dbUser)
        $prefs.fetch()
        $alertStore.success(`Welcome ${user.username}, you have successfully registered!`)
        socketLogin(user)
      }).catch(() => {})

    // Reauthenticate on app init if token is present
    if (localStorageAuth().data.token) reauthenticate()

    /* Provide Store Data */
    return provide(AuthStore, {
      user: readonly(user),
      permissionUtils: new PermissionUtils(user),
      loggedIn: computed(() => !!user.token),
      reauthenticate,
      login,
      logout,
      register,
      confirmRegistration,
      inviteRegistration
    })
  },
  render() { return this.$slots.default() } // renderless component
}
