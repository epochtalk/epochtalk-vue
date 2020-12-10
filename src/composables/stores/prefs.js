import { provide, inject, reactive, readonly } from 'vue'
import { cloneDeep } from 'lodash'

const PREFS_KEY = 'preferences'
const AUTH_KEY = 'auth'

export const PreferencesStore = Symbol(PREFS_KEY)

export default {
  setup() {
    const $api = inject('$api')
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
    const prefs = reactive(cachedPrefs ? cachedPrefs.data : cloneDeep(emtpyPrefs))

    const fetch = () => {
      $api('/api/users/preferences')
      .then(dbPrefs => {
        $appCache.set(PREFS_KEY, dbPrefs)
        Object.assign(prefs, dbPrefs)
      })
   }

    const clear = () => {
      $appCache.delete(PREFS_KEY)
      Object.assign(prefs, cloneDeep(emtpyPrefs))
    }


    const update = (prop, val) => {
      const auth = $appCache.get(AUTH_KEY)
      const user = auth ? auth.data : undefined
      console.log(user)
      if (user) {
        let updatedPrefs = {
          posts_per_page: prefs.posts_per_page,
          threads_per_page: prefs.threads_per_page,
          timezone_offset: prefs.timezone_offset,
          patroller_view: prefs.patroller_view,
          collapsed_categories: prefs.collapsed_categories,
          ignored_boards: prefs.ignored_boards,
          [prop]: val
        }
        const opts = {
          method: 'PUT',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: JSON.stringify({
            username: user.username,
            ...updatedPrefs
          })
        }
        $api(`/api/user/${user.id}`, opts)
        .then(() => {
          prefs[prop] = val
          $appCache.set(PREFS_KEY, updatedPrefs)
        })
      }
    }

    return provide(PreferencesStore, {
      ...readonly(prefs),
      fetch,
      clear,
      update
    })
  },
  render() { return this.$slots.default() }
}
