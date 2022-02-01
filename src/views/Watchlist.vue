<template>
<!-- Page Header -->
<div class="watchlist-section">
  <h1 class="">Watchlist</h1>
  <dl class="tabs">
    <dd class="no-select active" >
      <router-link :to="{ name: 'Watchlist' }">Unread</router-link>
    </dd>
    <dd class="no-select">
      <router-link :to="{ name: 'WatchlistEdit' }">Edit</router-link>
    </dd>
  </dl>
</div>

<!-- All Threads -->
<div class="watchlist-data">

  <!-- All Threads Header -->
  <table class="watchlist-threads threads-list">
    <thead>
      <tr>
        <th class="subject">Subject</th>
        <th class="views-replies">
          <span>Replies</span>
          <span>Views</span>
        </th>
        <th class="last-post">Last Post</th>
      </tr>
    </thead>
    <tbody>

      <tr class="threads-data" v-for="thread in watchlistData?.threads" :key="thread.id">
        <td class="subject">
          <div class="title">
            <div class="thread-state">
              <svg class="is-unread" v-if="thread.has_new_post" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" data-balloon="Unread">
                <title></title>
                <g id="icons">
                  <circle cx="16" cy="16" r="16" />
                </g>
              </svg>
            </div>
            <router-link :class="{ 'bold': thread.has_new_post }" class="thread-title" :title="decode(thread.title)" :to="{ name: 'Posts', params: { threadSlug: thread.slug, threadId: thread.id } }">{{decode(thread.title)}}</router-link>
              <div class="thread-state-secondary">
              <span class="thread-state-locked" v-if="thread.locked" data-balloon="Locked">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <path d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z"/>
                </svg>
              </span>
              <span class="thread-state-hasPoll" v-if="thread.poll" data-ballon="Includes a Poll">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <path class="cls-1" d="M42,2H6A4,4,0,0,0,2,6V42a4,4,0,0,0,4,4H42a4,4,0,0,0,4-4V6A4,4,0,0,0,42,2ZM13.75,40h-6V32h6Zm9,0h-6V22h6Zm9,0h-6V27h6Zm9,0h-6V12h6Z"/>
              </svg>
              </span>
            </div>
          </div>

          <div class="started-by">
            Started by
            <span v-if="thread.user.deleted">deleted</span>
            <a v-if="!thread.user.deleted" ui-sref="profile.posts({ username: thread.user.username })"
              v-html="thread.user.username"></a>
            <span v-html="' on ' + humanDate(thread.created_at)"></span>
          </div>
        </td>

        <td class="views-replies">
          <span class="replies" v-html="(thread.post_count - 1 | 0) || 0"></span>
          <span class="views" v-html="(thread.view_count | 0) || 0"></span>
        </td>

        <td class="last-post">
          <span v-if="thread.last_deleted">deleted</span>
          <router-link v-if="!thread.last_deleted" :to="{ path: '/profile/' + thread.last_post_username.toLowerCase() }"><img class="avatar-small" :class="defaultAvatar" :src="thread.last_post_avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" /></router-link>
          <router-link v-if="!thread.last_deleted" :to="{ path: '/profile/' + thread.last_post_username.toLowerCase() }" v-html="thread.last_post_username"></router-link> posted on <router-link :to="{ name: 'Posts', params: { threadSlug: thread.slug, threadId: thread.id }, query: { start: thread.last_post_position }, hash: '#' + thread.last_post_id }"><span>{{humanDate(thread.last_post_created_at)}}</span>.</router-link>
          <router-link v-if="thread.latest_unread_post_id" :to="{ name: 'Posts', params: { threadSlug: thread.slug, threadId: thread.id }, query: { start: thread.latest_unread_position }, hash: '#' + thread.latest_unread_post_id }">(Last unread post)</router-link>
        </td>
      </tr>
    </tbody>
  </table>

  <!-- No Threads Listed -->
  <div v-if="watchlistData?.threads.length < 1" class="threads-data centered-text">
    <h5>No unread watched threads</h5>
  </div>

</div>

<div class="actions-bottom" v-if="watchlistData?.has_more_threads || watchlistData?.page > 1">
  <div class="pagination-slide">
    <div class="pagination-controls">
      <button @click="pageResults(-1)" :disabled="watchlistData?.page === 1">&#10094; Prev</button>
      <div class="page">{{currentPage}}</div>
      <button @click="pageResults(1)" :disabled="!watchlistData?.has_more_threads">Next &#10095;</button>
    </div>
  </div>
</div>

</template>

<script>
import { reactive, toRefs, computed } from 'vue'
import { watchlistApi } from '@/api'
import { localStoragePrefs } from '@/composables/stores/prefs'
import humanDate from '@/composables/filters/humanDate'
import { useRoute, useRouter } from 'vue-router'
import decode from '@/composables/filters/decode'

export default {
  name: 'Watchlist',
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1,
    }
    next(vm => watchlistApi.unread(query).then(d => vm.watchlistData = d).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1,
    }
    watchlistApi.unread(query).then(d => this.watchlistData = d).catch(() => {})
    next()
  },
  setup() {
    const pageResults = inc => {
      const newPage = v.watchlistData.page + inc
      let query = { ...$route.query, page: newPage }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    // const refreshMentions = () => watchlistApi.unread({
    //   limit: $route.query.limit || localStoragePrefs().data.posts_per_page,
    //   page: $route.query.page || 1
    // }).then(d => v.watchlistData = d).catch(() => {})

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      currentPage: computed(() => Number($route.query.page) || 1),
      watchlistData: null,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
    })

    return { ...toRefs(v), humanDate, decode, pageResults }
  }
}
</script>

<style lang="scss">
.watchlist main #public-content {
  grid-template-areas:
      "header header"
      "main sidebar"
      "main sidebar";
  @include break-mobile-sm {
    grid-template-areas:
      "header"
      "sidebar"
      "main"
      "footer";
  }
}
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
    .watchlist-panel-header {
      flex-direction: column;
      width: 100%;
    }

    .pagination-slide {
      width: 100%;
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

// @include media($mobile) {
//   .watchlist-section {
//     .leftcol {
//       @include span-columns(8);
//     }
//     .rightcol {
//       @include span-columns(8);
//       @include omega;
//       .pagination-slide { @include fill-parent; }
//     }
//   }
//   .watchlist-data-edit {
//     .threads-header {
//       .mobile-header { @include span-columns(8); @include omega; display: block; }
//       .subject, .replies, .views, .actions { display: none; }
//     }
//     .threads-data {
//       .subject { @include span-columns(8); @include omega; }
//       .subject .mobile-stats { display: block; }
//       .replies, .views, .actions { display: none; }
//     }
//   }
// }
</style>
