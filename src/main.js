import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'
import localStorageCache from './composables/utils/localStorageCache'
import 'normalize.css/normalize.css'
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App).use(router)

const appCache = localStorageCache(0, 'app')

const auth = appCache.get('auth')
const user = auth ? auth.data : undefined

const $axios = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 3000,
  crossDomain: true
})

if (user) { $axios.defaults.headers.common['Authorization'] = `BEARER ${user.token}` }

app.provide('$axios', $axios)

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
app.provide('$swrvCache', localStorageCache(0, 'swrv'))
app.provide('$appCache', appCache)
app.mount('#app')
