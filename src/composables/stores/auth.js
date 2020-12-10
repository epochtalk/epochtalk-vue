import { provide, computed, inject, reactive, readonly } from 'vue'
import { cloneDeep } from 'lodash'
import { PreferencesStore } from '@/composables/stores/prefs'

const AUTH_KEY = 'auth'

export const AuthStore = Symbol(AUTH_KEY)

export default {
  setup() {
    const $api = inject('$api')
    const $appCache = inject('$appCache')
    const $axios = inject('$axios')
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
    const user = reactive(cachedUser ? cachedUser.data : cloneDeep(emtpyUser))

    const login = (username, password, rememberMe) => {
      const opts = {
        method: 'POST',
        data: {
          username: username,
          password: password,
          rememberMe: rememberMe
        }
      }

      $api('/api/login', opts)
      .then(dbUser => {
        $axios.defaults.headers.common['Authorization'] = `BEARER ${dbUser.token}`
        $appCache.set(AUTH_KEY, dbUser)
        Object.assign(user, dbUser)
        preferences.fetch()
      })
    }

    const logout = () => {
      $axios.defaults.headers.common['Authorization'] = undefined
      $appCache.delete(AUTH_KEY)
      user.token = '' // clear token to invalidate session immediately
      preferences.clear()
      // delay clearing reactive user to give css transitions time to complete
      setTimeout(() => { Object.assign(user, cloneDeep(emtpyUser)) }, 500)
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

      $api('/api/register', opts)
      .then(dbUser => {
        // Set user session if account is already confirmed (log the user in)
        if (!dbUser.confirm_token) {
          $appCache.set(AUTH_KEY, dbUser)
          Object.assign(user, dbUser)
          preferences.fetch()
        }
      })
    }

    return provide(AuthStore, {
      user: readonly(user),
      loggedIn: computed(() => !!user.token),
      login,
      logout,
      register
    })
  },
  render() { return this.$slots.default() }
}
