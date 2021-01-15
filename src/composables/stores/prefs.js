import { provide, inject, reactive, toRefs } from 'vue'
import { cloneDeep } from 'lodash'
import { Api } from '@/api'

const PREFS_KEY = 'preferences'
const AUTH_KEY = 'auth'

export const PreferencesStore = Symbol(PREFS_KEY)

export default {
  setup() {
    /* Internal Data */
    const $api = inject(Api)
    const $appCache = inject('$appCache')

    const cachedPrefs = $appCache.get(PREFS_KEY)
    const emtpyPrefs = {
      posts_per_page: 25,
      threads_per_page: 25,
      timezone_offset: '',
      patroller_view: false,
      collapsed_categories: [],
      ignored_boards: []
    }

    /* Provided Data */
    const prefs = reactive(cachedPrefs ? cachedPrefs.data : cloneDeep(emtpyPrefs))

    /* Provided Methods */
    const fetch = () => {
      $api.users.preferences()
      .then(dbPrefs => {
        $appCache.set(PREFS_KEY, dbPrefs)
        Object.assign(prefs, dbPrefs)
      })
    }

    const clear = () => {
      $appCache.delete(PREFS_KEY)
      Object.assign(prefs, cloneDeep(emtpyPrefs))
    }

    const update = () => {
      const auth = $appCache.get(AUTH_KEY)
      const user = auth ? auth.data : undefined
      const updatedPrefs = { // spread prefs to get rid of proxy object before storing in cache
        posts_per_page: prefs.posts_per_page,
        threads_per_page: prefs.threads_per_page,
        timezone_offset: prefs.timezone_offset,
        patroller_view: prefs.patroller_view,
        collapsed_categories: [...prefs.collapsed_categories],
        ignored_boards: [...prefs.ignored_boards]
      }
      if (user && user.token) { // user is logged in update cache and server
        const opts = {
          method: 'PUT',
          data: {
            username: user.username,
            ...updatedPrefs
          }
        }
        $api.users.update(user.id, opts)
        .then(() => $appCache.set(PREFS_KEY, updatedPrefs))
      }
      else { $appCache.set(PREFS_KEY, updatedPrefs) } // user not logged in, only update cache
    }

    /* Provide Store Data */
    return provide(PreferencesStore, {
      data: toRefs(prefs),
      fetch,
      clear,
      update
    })
  },
  render() { return this.$slots.default() } // renderless component
}
