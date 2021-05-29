<template>
  <div class="main">
    <h4>Patrol</h4>
    <br>
    {{JSON.stringify(patrolData, null, 2)}}
  </div>
  <div class="sidebar">
    <div class="sidebar-block" v-if="patrolData?.posts.length > 0">
      <div class="pagination-simple">
        <button @click="pageResults(-1)" :disabled="patrolData?.page < 2">&#10094; Prev</button>
        <button @click="pageResults(1)" :disabled="!patrolData?.hasMorePosts">Next &#10095;</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { postsApi } from '@/api'
import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'
import { usernameHighlight } from '@/composables/utils/userUtils'
import { localStoragePrefs } from '@/composables/stores/prefs'

export default {
  name: 'Patrol',
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1
    }
    next(vm => postsApi.byNewbie(query).then(d => vm.patrolData = d).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1
    }
    postsApi.byNewbie(query).then(d => this.patrolData = d).catch(() => {})
    next()
  },
  setup() {
    const pageResults = inc => {
      const newPage = v.patrolData.page + inc
      let query = { ...$route.query, page: newPage }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      currentPage: Number($route.query.page) || 1,
      patrolData: null,
    })

    return { ...toRefs(v), pageResults, humanDate, usernameHighlight }
  }
}
</script>

<style lang="scss">
.patrol main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }
.main { grid-area: main; }
.sidebar {
  grid-area: sidebar;
  .sidebar-block {
    display: block;
    position: sticky;
    top: $header-offset;
    padding-top: .5rem;
  }
}
</style>
