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

/* Provide Alert Store */
app.provide('$alertStore', alertStore)

/* Setup and Provide Axios */
const $axios = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 3000,
  crossDomain: true
})
const $auth = appCache.get('auth')
const user = $auth ? $auth.data : undefined
if (user) { $axios.defaults.headers.common['Authorization'] = `BEARER ${user.token}` }
app.provide('$axios', $axios)

/* Mount App */
app.mount('#app')
