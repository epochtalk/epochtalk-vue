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
app.provide('$swrvCache', localStorageCache(0, 'swrv'))
app.provide('$appCache', appCache)
app.mount('#app')
