<template>
<!-- Page Header -->
<div class="watchlist-section">
  <h1 class="">Watchlist</h1>
  <dl class="tabs">
    <dd class="no-select" >
      <router-link :to="{ name: 'Watchlist' }">Unread</router-link>
    </dd>
    <dd class="no-select active">
      <router-link :to="{ name: 'WatchlistEdit' }">Edit</router-link>
    </dd>
  </dl>
</div>

<div class="watchlist-data">
  <!-- Watched Boards -->
  <div class="watchlist-watched-boards watchlist-panel">
    <div class="watchlist-panel-header">
      <h2>Watched Boards</h2>
      <div class="pagination-slide">
        <div class="pagination-controls">
          <button @click="pageResults(-1)" :disabled="currentPage <= 1">&#10094; Prev</button>
          <div class="page" v-html="currentPage"></div>
          <button @click="pageResults(1)" :disabled="!has_more_boards">Next &#10095;</button>
        </div>
      </div>
    </div>

    <!-- Watched Boards Table -->
    <div class="watchlist-table watchlist-data-edit">
      <table>
        <thead>
          <tr>
            <td class="subject">Boards</td>
            <td class="threads">Threads</td>
            <td class="views">Views</td>
            <td class="actions">Actions</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="board in boards" :key="board.id">
            <td class="title">
              <router-link :to="{ name: 'Threads', params: { boardSlug: board.slug } }">
                <span v-html="board.name"></span>
              </router-link>
            </td>
            <td class="threads-views-mobile">
              <span class="value" v-html="board.thread_count || 0"></span>&nbsp;threads, &nbsp;
              <span class="value" v-html="board.post_count || 0"></span>
              &nbsp;views
            </td>
            <td class="replies" v-html="board.thread_count || 0"></td>
            <td class="views" v-html="board.post_count || 0"></td>
            <td class="actions pointer">
              <a @click="unwatchBoard(board.id, board.name); board.unwatched = true" v-if="!board.unwatched">
                Unwatch
              </a>
              <a @click="watchBoard(board.id, board.name); board.unwatched = false" v-if="board.unwatched">
                Watch
              </a>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <!-- No Boards Listed -->
    <div v-if="boards.length < 1" class="centered-text">
      <h5>No Boards Being watched</h5>
    </div>

  </div>



  <!-- Watched Threads -->
  <div class="watchlist-watched-threads watchlist-panel" v-if="threads.length">
    <div class="watchlist-panel-header">
      <h2>Watched Threads</h2>
      <div class="pagination-slide">
        <div class="pagination-controls">
          <button @click="pageResults(-1, true)" :disabled="currentTPage <= 1">&#10094; Prev</button>
          <div class="page" v-html="currentTPage"></div>
          <button @click="pageResults(1, true)" :disabled="!has_more_threads">Next &#10095;</button>
        </div>
      </div>
    </div>

    <div class="watchlist-table watchlist-data-edit" >
      <table>
        <thead>
          <tr>
            <td class="subject">Threads</td>
            <td class="replies">Replies</td>
            <td class="views">Views</td>
            <td class="actions">Actions</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="thread in threads" :key="thread.id">
            <td class="title">
              <router-link :to="{ name: 'Posts', params: { threadSlug: thread.slug } }">
                <span v-html="thread.title"></span>
              </router-link>
              <span class="parent-board">In Board: <strong><span v-html="thread.board_name"></span></strong></span>
            </td>
            <td class="threads-views-mobile">
              <span class="value" v-html="thread.post_count - 1 || 0"></span>&nbsp;replies,&nbsp;
              <span class="value" v-html="thread.view_count || 0"></span>&nbsp;views
            </td>
            <td class="replies" v-html="thread.post_count - 1 || 0"></td>
            <td class="views" v-html="thread.view_count || 0"></td>
            <td class="actions pointer">
              <a @click="unwatchThread(thread.id, thread.title); thread.unwatched = true" v-if="!thread.unwatched">
                Unwatch
              </a>
              <a @click="watchThread(thread.id, thread.title); thread.unwatched = false" v-if="thread.unwatched">
                Watch
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- No Threads Listed -->
    <div v-if="threads.length < 1" class="centered-text">
      <h5>No Threads Being watched</h5>
    </div>

  </div>

</div>
</template>

<script>
import { reactive, inject, toRefs } from 'vue'
import { watchlistApi } from '@/api'
import { localStoragePrefs } from '@/composables/stores/prefs'
import humanDate from '@/composables/filters/humanDate'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'WatchlistEdit',
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: to.query.limit || to.query.tlimit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || to.query.tpage || 1,
    }
    next(vm =>
      watchlistApi.edit(query)
      .then(d => {
        vm.boards = d.boards
        vm.threads = d.threads
        vm.limit = d.limit
        vm.tlimit = to.query.tlimit || d.limit
        vm.has_more_boards = d.has_more_boards
        vm.has_more_threads = d.has_more_threads
      })
      .then(() => {
        if (Number(to.query.page) > 1) {
          query.page = to.query.page
          query.limit = to.query.limit
          return watchlistApi.pageBoards(query)
          .then(d => {
            vm.currentPage = d.page
            vm.boards = d.boards
            vm.limit = d.limit
            vm.has_more_boards = d.has_more_boards
          })
        }
        else vm.currentPage = 1
      })
      .then(() => {
        if (Number(to.query.tpage) > 1 || to.query.tlimit) {
          query.page = to.query.tpage
          query.limit = to.query.tlimit
          return watchlistApi.pageThreads(query)
          .then(d => {
            vm.currentTPage = d.page
            vm.threads = d.threads
            vm.tlimit = d.limit
            vm.has_more_threads = d.has_more_threads
          })
        }
        else vm.currentTPage = 1
      })
      .catch(() => {})
    )
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: to.query.limit || to.query.tlimit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || to.query.tpage || 1,
    }
    watchlistApi.edit(query)
    .then(d => {
      this.boards = d.boards
      this.threads = d.threads
      this.limit = d.limit
      this.tlimit = to.query.tlimit || d.limit
      this.has_more_boards = d.has_more_boards
      this.has_more_threads = d.has_more_threads
    })
    .then(() => {
      if (Number(to.query.page) > 1) {
        query.page = to.query.page
        query.limit = to.query.limit
        return watchlistApi.pageBoards(query)
        .then(d => {
          this.currentPage = d.page
          this.boards = d.boards
          this.limit = d.limit
          this.has_more_boards = d.has_more_boards
        })
      }
      else this.currentPage = 1
    })
    .then(() => {
      if (Number(to.query.tpage) > 1 || to.query.tlimit) {
        query.page = to.query.tpage
        query.limit = to.query.tlimit
        return watchlistApi.pageThreads(query)
        .then(d => {
          this.currentTPage = d.page
          this.threads = d.threads
          this.tlimit = d.limit
          this.has_more_threads = d.has_more_threads
        })
      }
      else this.currentTPage = 1
    })
    .catch(() => {})
    next()
  },
  setup() {
    const pageResults = (inc, threads) => {
      let query = { ...$route.query }
      if (threads) query.tpage = v.currentTPage + inc
      else query.page = v.currentPage + inc
      if (query.tpage === 1 || !query.tpage) delete query.tpage
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage || $route.query.tpage !== v.currentTPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const watchBoard = (threadId, title) => watchlistApi.watchBoard(threadId)
      .then(() => $alertStore.success('Successfully watching board ' + title))
      .catch(() => $alertStore.error('There was an error watching board ' + title))
    const unwatchBoard = (threadId, title) => watchlistApi.unwatchBoard(threadId)
      .then(() => $alertStore.success('Successfully unwatched board ' + title))
      .catch(() => $alertStore.error('There was an error unwatching board ' + title))

    const watchThread = (threadId, title) => watchlistApi.watchThread(threadId)
      .then(() => $alertStore.success('Successfully watching thread ' + title))
      .catch(() => $alertStore.error('There was an error watching thread ' + title))
    const unwatchThread = (threadId, title) => watchlistApi.unwatchThread(threadId)
      .then(() => $alertStore.success('Successfully unwatched thread ' + title))
      .catch(() => $alertStore.error('There was an error unwatching thread ' + title))

    const $route = useRoute()
    const $router = useRouter()
    const $alertStore = inject('$alertStore')

    const v = reactive({
      currentPage: Number($route.query.page) || 1,
      currentTPage: Number($route.query.tpage) || 1,
      has_more_boards: false,
      has_more_threads: false,
      threads: [],
      boards: [],
      limit: $route.query.limit,
      tlimit: $route.query.tlimit,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
    })

    return { ...toRefs(v), humanDate, pageResults, watchThread, unwatchThread, watchBoard, unwatchBoard }
  }
}
</script>

<style lang="scss">
/*-------------- Watchlist Layout --------------- */
.watchlist-section {
  display: flex;
  align-items: flex-end;
  grid-area: header;
  margin-bottom: 1rem;

  h1 {
    color: $secondary-font-color;
    font-size: $font-size-xl;
    font-weight: 600;
    text-transform: none;
  }

  @include break-mobile-sm {
    width: 100%;

    .tabs {
      text-align: right;
    }
  }
}

.watchlist-panel {
  margin-bottom: 4rem;

  .watchlist-panel-header {
    display: flex;
    margin-bottom: 1rem;;

    h2 {
      color: $secondary-font-color;
      flex: 1 0 auto;
      font-size: $font-size-lg;;
      font-weight: 600;
      text-transform: none;
    }

    .pagination-slide {
      grid-template-columns: 1fr;
      height: min-content;
      font-size: $font-size-sm;;

      button {
        font-size: $font-size-sm;
      }
    }
  }

  @include break-mobile-sm {
    margin-bottom: 1rem;
    .watchlist-panel-header {
      flex-direction: row;
      width: 100%;
    }

    .pagination-slide {
      width: 100%;
     .pagination-controls {
        justify-self: right;
      }
    }

    .pagination-components {
      justify-self: end;
    }
  }
}

.watchlist-table {
  table {
    width: 100%;
  }

  thead {
    td {
      color: $text-gray-med;
      font-weight: 400;
      font-size: $font-size-xs;
      text-transform: uppercase;
    }
  }

  td {
    font-size: 1rem;
    padding: 0 0 1rem;
  }

  .threads-views-mobile {
    display: none;
  }

  .title {
    font-weight: 600;

    .parent-board {
      display: block;
      font-size: $font-size-sm;
      font-weight: 400;
    }
  }

  .threads,
  .replies,
  .views,
  .actions {
    text-align: right;
  }

  @include break-mobile-sm {
    table {
      display: flex;
      flex-direction: column;
    }

    thead {
      display: none;
    }

    tbody,
    tr {
      display: contents;
    }

    td {
      padding-bottom: 2px;

      &:last-child {
        padding-bottom: 1.5rem;
      }
    }

    .threads-views-mobile {
      display: flex;

      .value {
        font-weight: 600;
      }
    }

    .threads-views-mobile,
    .actions {
      font-size: $font-size-sm;
    }

    .replies,
    .views {
      display: none;
    }

    .actions {
      text-align: left;
    }
  }
}



.watchlist-data {
  grid-area: main;
  width: 100%;
}

.watchlist-threads {
  font-size: 1rem;
  display: grid;
  column-gap: 1.5rem;
  row-gap: 1rem;

  tr {
    td {
      font-size: 1rem;
      padding: 0;
    }
  }

  .views-replies {
    grid-template-columns: repeat(2, minmax(30px, auto));
  }

  @include break-mobile-sm {
    padding-left: 0.5rem;
    row-gap: 0;

    .thread-state {
      margin-right: 0;
    }

    .views-replies {
      grid-template-columns: repeat(2, max-content);
    }
  }
}

.watchlist-data-edit {
  .threads-header, .threads-data {
    .mobile-header { display: none; }
    // .subject { @include span-columns(9); }
    // .replies, .views { @include span-columns(1); text-align: center; }
    // .actions { @include span-columns(1); @include omega; }
  }
}

.watchlist-data-spacer { margin-bottom: 2.5rem; }

</style>
