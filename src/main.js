import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import localStorageCache from './composables/utils/localStorageCache'
import 'normalize.css/normalize.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App).use(router)

const AUTH_KEY = 'auth'
const appCache = localStorageCache(0, 'app')

app.provide('$api', (path, opts) => {
  opts = opts || {}
  let auth = appCache.get(AUTH_KEY)
  let user = auth && auth.data ? auth.data : undefined
  if (user && user.token) {
    opts.headers = {
      ...opts.headers,
      Authorization: `BEARER ${user.token}`
    }
  }
  console.log(path, opts.headers)
  return fetch(`http://localhost:8080${path}`, opts)
  .then(res => res.ok ? res.json() : res)
})
app.provide('$swrvCache', localStorageCache(0, 'swrv'))
app.provide('$appCache', appCache)
app.mount('#app')
