<template>
  <h1>{{boardSlug}} {{boardId}} Threads</h1>
  <pre>{{JSON.stringify(threads, null, 1)}}</pre>
</template>

<script>
import useSWRV from 'swrv'
import { useRoute } from 'vue-router'
// import humanDate from '@/composables/filters/humanDate'
import { inject, reactive, toRefs } from 'vue'
// import { AuthStore } from '@/composables/stores/auth'
import { PreferencesStore } from '@/composables/stores/prefs'

export default {
  name: 'Threads',
  props: ['boardSlug', 'boardId'],
  setup(props) {
    const fetchThreads = path => {
      return new Promise(resolve => {
        if (props.boardId) { resolve(props.boardId) }
        else { resolve($api(`/api/boards/${props.boardSlug}/id`).then(data => data.id)) }
      })
      .then(boardId => {
        const opts = {
          params: {
            board_id: boardId,
            limit: v.prefs.threads_per_page,
            page: $route.params.page || 1,
            field: $route.params.field,
            desc: $route.params.desc
          }
        }
        return $api(path, opts)
      })
    }

    // /* Internal Data */
    const $api = inject('$api')
    const $swrvCache = inject('$swrvCache')
    const $route = useRoute()
    const preferences = inject(PreferencesStore)
    // const auth = inject(AuthStore)

    // /* View Data */
    const v = reactive({
      threads: useSWRV(`/api/threads`, fetchThreads, { cache: $swrvCache }).data,
      prefs: preferences.data
    })

    return { ...toRefs(v) }

  }
}
</script>

<style lang="scss">
</style>
