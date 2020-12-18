import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import axios from 'axios'
import localStorageCache from '@/composables/utils/localStorageCache'
import alertStore from '@/composables/stores/alert'

const app = createApp(App).use(router)

/* Provide App Cache for caching Auth data */
const appCache = localStorageCache(0, 'app')
app.provide('$appCache', appCache)

/* Provide SWR Cache for caching API data */
app.provide('$swrvCache', localStorageCache(0, 'swrv'))

/* Setup and Provide Axios */
const $axios = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 3000,
  crossDomain: true
})
const auth = appCache.get('auth')
const user = auth ? auth.data : undefined
if (user) { $axios.defaults.headers.common['Authorization'] = `BEARER ${user.token}` }
app.provide('$axios', $axios)

/* Provide Alert Store */
app.provide('$alertStore', alertStore)

/* Provide API request util */
app.provide('$api', (path, opts) => {
  opts = opts || {}
  const method = (opts.method || 'get').toLowerCase()
  delete opts.method
  const data = opts.data
  delete opts.data

  let req = (m => {
    switch(m) {
      case 'post':
      case 'put':
      case 'patch':
        return $axios[method](path, data, opts)
      default: return $axios[method](path, opts)
    }
  })(method)

  return req.then(res => res.status === 200 ? res.data : res)
})

/* Mount App */
app.mount('#app')
