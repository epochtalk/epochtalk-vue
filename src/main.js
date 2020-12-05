import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import localStorageCache from './localStorageCache'

const app = createApp(App).use(router)

app.provide('$api', (path, opts, ) => fetch(`http://localhost:8080${path}`, opts).then(res => res.ok ? res.json() : res))
app.provide('$swrvCache', localStorageCache(0, 'swrv'))
app.provide('$appCache', localStorageCache(0, 'app'))
app.mount('#app')
