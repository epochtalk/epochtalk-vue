import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
// import LocalStorageCache from './localStorageCache'

// Vue.prototype.$api = path => fetch(`http://localhost:8000${path}`).then(res => res.json())
// Vue.prototype.$swrvCache = new LocalStorageCache()

const app = createApp(App).use(router)

app.provide('$api', path => fetch(`http://localhost:8080${path}`).then(res => res.json()));
// app.provide('$swrvCache', new LocalStorageCache());
app.mount('#app')
