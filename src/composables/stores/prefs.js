import { provide, inject, reactive, toRefs, readonly } from 'vue'
import { cloneDeep } from 'lodash'
import { usersApi } from '@/api'
import localStorageCache from '@/composables/utils/localStorageCache'

const PREFS_KEY = 'preferences'
const AUTH_KEY = 'auth'

const appCache = localStorageCache(0, 'app')
const emtpyPrefs = {
  posts_per_page: 25,
  threads_per_page: 25,
  timezone_offset: {
    sign: '',
    hours: '',
    minutes: ''
  },
  patroller_view: false,
  collapsed_categories: [],
  ignored_boards: []
}

export const PreferencesStore = Symbol(PREFS_KEY)

export const localStoragePrefs = () => appCache.get(PREFS_KEY) || { data: emtpyPrefs }

export default {
  setup() {
    /* Internal Data */
    const $appCache = inject('$appCache')

    const cachedPrefs = $appCache.get(PREFS_KEY)

    /* Internal Methods */
    const getTimezoneOffset = prefs => {
      return {
        sign: prefs.timezone_offset[0] || '',
        hours: prefs.timezone_offset.slice(1, 3),
        minutes: prefs.timezone_offset.slice(3, 5)
      }
    }

    /* Provided Data */
    const prefs = reactive(cachedPrefs ? cachedPrefs.data : cloneDeep(emtpyPrefs))

    /* Provided Methods */
    const fetch = () => {
      usersApi.preferences()
      .then(dbPrefs => {
        dbPrefs.timezone_offset = getTimezoneOffset(dbPrefs)
        $appCache.set(PREFS_KEY, dbPrefs)
        Object.assign(prefs, dbPrefs)
      })
    }

    const clear = () => {
      $appCache.delete(PREFS_KEY)
      Object.assign(prefs, cloneDeep(emtpyPrefs))
    }

    const update = () => {
      const $auth = $appCache.get(AUTH_KEY)
      const user = $auth ? $auth.data : undefined
      const updatedPrefs = { // spread prefs to get rid of proxy object before storing in cache
        posts_per_page: prefs.posts_per_page,
        threads_per_page: prefs.threads_per_page,
        timezone_offset: prefs.timezone_offset.sign + prefs.timezone_offset.hours + prefs.timezone_offset.minutes,
        patroller_view: prefs.patroller_view,
        collapsed_categories: [...prefs.collapsed_categories],
        ignored_boards: [...prefs.ignored_boards]
      }
      if (user && user.token) { // user is logged in update cache and server
        const data = {
          username: user.username,
          ...updatedPrefs
        }
        console.log(data)
        usersApi.update(user.id, data)
        .then(() => {
          updatedPrefs.timezone_offset = getTimezoneOffset(updatedPrefs)
          $appCache.set(PREFS_KEY, updatedPrefs)
        })
      }
      else { // user not logged in, only update cache
        updatedPrefs.timezone_offset = getTimezoneOffset(updatedPrefs)
        $appCache.set(PREFS_KEY, updatedPrefs)
      }
    }

    /* Provide Store Data */
    return provide(PreferencesStore, {
      data: toRefs(prefs),
      readonly: readonly(prefs),
      fetch,
      clear,
      update
    })
  },
  render() { return this.$slots.default() } // renderless component
}
