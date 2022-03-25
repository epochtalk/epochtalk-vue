import { createApp } from 'vue'
import App from '@/App.vue'
import router from '@/router'
import localStorageCache from '@/composables/utils/localStorageCache'
import alertStore from '@/composables/stores/alert'
import * as jqueryExports from 'jquery'
window.jQuery = window.$ = jqueryExports.default
// eslint-disable-next-line no-unused-vars
// extend dayjs with utc plugin
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import duration from 'dayjs/plugin/duration'
dayjs.extend(utc)
dayjs.extend(duration)

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
