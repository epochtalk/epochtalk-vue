import { provide, inject, reactive, readonly } from 'vue'
import { cloneDeep } from 'lodash'

const PREFS_KEY = 'preferences'

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

    const update = (prop, val) => {
      prefs[prop] = val
      $appCache.set(PREFS_KEY, {
        posts_per_page: prefs.posts_per_page,
        threads_per_page: prefs.threads_per_page,
        timezone_offset: prefs.timezone_offset,
        patroller_view: prefs.patroller_view,
        collapsed_categories: prefs.collapsed_categories,
        ignored_boards: prefs.ignored_boards
      })
    }

    provide(PreferencesStore, {
      ...readonly(prefs),
      fetch,
      clear,
      update
    })
  },
  render() { return this.$slots.default() }
}
