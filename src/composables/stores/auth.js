import { provide, computed, inject, reactive, readonly } from 'vue'
import { cloneDeep } from 'lodash'
import { authApi } from '@/api'
import { PreferencesStore } from '@/composables/stores/prefs'
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

export const AuthStore = Symbol(AUTH_KEY)

export const localStorageAuth = () => appCache.get(AUTH_KEY) || { data: emtpyUser }

export default {
  setup() {
    /* Internal Data */
    const $appCache = inject('$appCache')
    const $alertStore = inject('$alertStore')
    const $prefs = inject(PreferencesStore)
    const $route = useRoute()
    const $router = useRouter()
    const cachedUser = $appCache.get(AUTH_KEY)

    /* Provided Data */
    const user = reactive(cachedUser ? cachedUser.data : cloneDeep(emtpyUser))

    /* Provided Methods */
    const reauthenticate = () => authApi.authenticate()
      .then(dbUser => {
        $appCache.set(AUTH_KEY, dbUser)
        Object.assign(user, dbUser)
        BanStore.initBanNotice(user)
        $prefs.fetch()
      }).catch(() => {})

    const login = (username, password, rememberMe) => authApi.login({ username, password, rememberMe })
      .then(dbUser => {
        $appCache.set(AUTH_KEY, dbUser)
        Object.assign(user, dbUser)
        BanStore.initBanNotice(user)
        $prefs.fetch()
        $alertStore.success(`Welcome ${user.username}, you have successfully logged in!`)
      }).catch(() => {})

    const logout = () => authApi.logout()
      .then(() => {
        delete user.token // clear token to invalidate session immediately
        $appCache.delete(AUTH_KEY)
        $prefs.clear()
        BanStore.clearBanNotice()
        $alertStore.warn(`Goodbye ${user.username}, you have successfully logged out!`)
        // redirect to home on logout
        if ($route.meta.requiresAuth && $route.path !== '/') $router.push({ path: '/' })
        // delay clearing reactive user to give css transitions time to complete
        setTimeout(() => Object.assign(user, cloneDeep(emtpyUser)), 500)
      }).catch(() => {})

    const register = (email, username, password) => authApi.register({ email, username, password })
      .then(dbUser => {
        // Set user session if account is already confirmed (log the user in)
        if (!dbUser.confirm_token) {
          $appCache.set(AUTH_KEY, dbUser)
          Object.assign(user, dbUser)
          $prefs.fetch()
          $alertStore.success(`Welcome ${user.username}, you have successfully registered!`)
        }
        // TODO(akinsey): implement flow for when email confirmation is enabled
        // else {}
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
      register
    })
  },
  render() { return this.$slots.default() } // renderless component
}
