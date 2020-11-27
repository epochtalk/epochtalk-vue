import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import localStorageCache from './localStorageCache'
import Vuex from './store/vuex'

const app = createApp(App).use(router)
app.use(Vuex);

app.provide('$api', path => fetch(`http://localhost:8080${path}`).then(res => res.json()))
app.provide('$swrvCache', localStorageCache)
app.mount('#app')
