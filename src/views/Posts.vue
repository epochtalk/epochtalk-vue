<template>
  Posts view
</template>

<script>
//import useSWRV from 'swrv'
//import { useRoute, useRouter } from 'vue-router'
//import Pagination from '@/components/layout/Pagination.vue'
//import humanDate from '@/composables/filters/humanDate'
//import decode from '@/composables/filters/decode'
//import truncate from '@/composables/filters/truncate'
//import { inject, reactive, watch, toRefs } from 'vue'
//import { threadsApi } from '@/api'
//import { AuthStore } from '@/composables/stores/auth'
//import { PreferencesStore } from '@/composables/stores/prefs'
//import { countTotals, getLastPost, filterIgnoredBoards } from '@/composables/utils/boardUtils'

export default {
  name: 'Posts',
  props: ['threadSlug', 'threadId'],
  // components: { Pagination },
  setup(props) {
    console.log(props)
    return {}
  }
}
</script>

<style lang="scss">
</style>
