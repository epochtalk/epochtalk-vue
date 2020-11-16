import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import LocalStorageCache from './localStorageCache'
import Vue from 'vue'

Vue.prototype.$api = path => fetch(`http://localhost:8000${path}`).then(res => res.json())
Vue.prototype.$swrvCache = new LocalStorageCache()

createApp(App).use(router).mount('#app')
