import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import localStorageCache from '@/composables/utils/localStorageCache'
import alertStore from '@/composables/stores/alert'

// extend dayjs with utc plugin
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const app = createApp(App).use(router)

/* Provide App Cache for caching Auth data */
const appCache = localStorageCache(0, 'app')
app.provide('$appCache', appCache)

/* Provide SWR Cache for caching API data */
app.provide('$swrvCache', localStorageCache(0, 'swrv'))

/* Provide Alert Store */
app.provide('$alertStore', alertStore)

/* Setup and Provide Axios */

/* Mount App */
app.mount('#app')
