import { provide, computed, inject, reactive, readonly } from 'vue'
import { cloneDeep } from 'lodash'

const AUTH_CONTEXT = Symbol('state')
const USER_KEY = 'user'

export const provideAuth = () => {
  const $api = inject('$api')
  const $appCache = inject('$appCache')

  const cachedUser = $appCache.get(USER_KEY)
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
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: username,
        password: password,
        rememberMe: rememberMe
      })
    }

    $api('/api/login', opts)
    .then(dbUser => {
      Object.assign(user, dbUser)
      $appCache.set(USER_KEY, user)
    })
  }

  const logout = () => {
    $appCache.delete(USER_KEY)
    user.token = '' // clear token to invalidate session immediately
    // delay clearing reactive user to give css transitions time to complete
    setTimeout(() => { Object.assign(user, cloneDeep(emtpyUser)) }, 500)
  }

  const register = (email, username, password) => {
    const opts = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: email,
        username: username,
        password: password
      })
    }

    $api('/api/register', opts)
    .then(dbUser => {
      // Set user session if account is already confirmed (log the user in)
      if (!dbUser.confirm_token) {
        Object.assign(user, dbUser)
        $appCache.set(USER_KEY, user)
      }
    })
  }


  provide(AUTH_CONTEXT, {
    user: readonly(user),
    loggedIn: computed(() => !!user.token),
    login,
    logout,
    register
  })
}

export const useAuth = () => {
  const context = inject(AUTH_CONTEXT)
  if (context) return context
  else throw new Error('useAuth must be used with provideAuth')
}
