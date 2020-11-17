import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import localStorageCache from './localStorageCache'

const app = createApp(App).use(router)

app.provide('$api', path => fetch(`http://localhost:8080${path}`).then(res => res.json()))
app.provide('$swrvCache', localStorageCache)
app.mount('#app')
