import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import localStorageCache from './composables/utils/localStorageCache'
import 'normalize.css/normalize.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import api from './api'

const app = createApp(App).use(router)

const appCache = localStorageCache(0, 'app')

app.provide('$api', api(appCache))
app.provide('$swrvCache', localStorageCache(0, 'swrv'))
app.provide('$appCache', appCache)
app.mount('#app')
