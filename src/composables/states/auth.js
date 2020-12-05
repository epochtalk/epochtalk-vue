import { provide, inject, reactive } from 'vue'

const AUTH_CONTEXT = Symbol()
const USER_KEY = 'user'

export const stateAuthProvider = () => {
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
  const user = reactive(cachedUser ? cachedUser.data : emtpyUser)

  const login = (username, password, rememberMe) => {
    const authOpts = {
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

    $api('/api/login', authOpts)
    .then(dbUser => {
      Object.assign(user, dbUser)
      $appCache.set(USER_KEY, user)
    })
  }

  const logout = () => {
    $appCache.delete(USER_KEY)
    Object.assign(user, emtpyUser)
    console.log($appCache.get(USER_KEY))
  }

  provide(AUTH_CONTEXT, { user, login, logout })
}

export const stateAuthContext = () => {
  const context = inject(AUTH_CONTEXT)
  if (context) return context
  else throw new Error('stateAuthContext must be used with stateAuthProvider')
}
