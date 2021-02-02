import { provide, computed, inject, reactive, readonly } from 'vue'
import { cloneDeep } from 'lodash'
import { authApi } from '@/api/index'
import { Http } from '@/composables/utils/http'
import { PreferencesStore } from '@/composables/stores/prefs'

const AUTH_KEY = 'auth'

export const AuthStore = Symbol(AUTH_KEY)

export default {
  setup() {
    /* Internal Data */
    const $http = inject(Http)
    const $appCache = inject('$appCache')
    const $axios = inject('$axios')
    const $alertStore = inject('$alertStore')
    const preferences = inject(PreferencesStore)

    const cachedUser = $appCache.get(AUTH_KEY)
    const emtpyUser = {
      avatar: '',
      id: null,
      moderating: [],
      permissions: {},
      roles: [],
      token: null,
      username: ''
    }

    /* Provided Data */
    const user = reactive(cachedUser ? cachedUser.data : cloneDeep(emtpyUser))

    /* Provided Methods */
    const login = (username, password, rememberMe) => {
      const opts = {
        method: 'POST',
        data: {
          username: username,
          password: password,
          rememberMe: rememberMe
        }
      }
      const handleErrors = true
      authApi.login($http, opts, handleErrors)
      .then(dbUser => {
        $axios.defaults.headers.common['Authorization'] = `BEARER ${dbUser.token}`
        $appCache.set(AUTH_KEY, dbUser)
        Object.assign(user, dbUser)
        preferences.fetch()
        $alertStore.success(`Welcome ${user.username}, you have successfully logged in!`)
      }).catch(() => {})
    }

    const logout = () => {
      const opts = {
        method: 'DELETE'
      }
      const handleErrors = true
      authApi.logout($http, opts, handleErrors)
      .then(() => {
        delete $axios.defaults.headers.common['Authorization']
        delete user.token // clear token to invalidate session immediately
        $appCache.delete(AUTH_KEY)
        preferences.clear()
        $alertStore.warn(`Goodbye ${user.username}, you have successfully logged out!`)
        // delay clearing reactive user to give css transitions time to complete
        setTimeout(() => { Object.assign(user, cloneDeep(emtpyUser)) }, 500)
      }).catch(() => {})

    }

    const register = (email, username, password) => {
      const opts = {
        method: 'POST',
        data: {
          email: email,
          username: username,
          password: password
        }
      }
      const handleErrors = true
      authApi.register($http, opts, handleErrors)
      .then(dbUser => {
        // Set user session if account is already confirmed (log the user in)
        if (!dbUser.confirm_token) {
          $axios.defaults.headers.common['Authorization'] = `BEARER ${dbUser.token}`
          $appCache.set(AUTH_KEY, dbUser)
          Object.assign(user, dbUser)
          preferences.fetch()
          $alertStore.success(`Welcome ${user.username}, you have successfully registered!`)
        }
        // TODO(akinsey): implement flow for when email confirmation is enabled
        // else {}
      }).catch(() => {})
    }

    /* Provide Store Data */
    return provide(AuthStore, {
      user: readonly(user),
      loggedIn: computed(() => !!user.token),
      login,
      logout,
      register
    })
  },
  render() { return this.$slots.default() } // renderless component
}
