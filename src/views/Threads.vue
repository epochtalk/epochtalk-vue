<template>
  <div class="board-controls" v-if="threadData && threadData.data && threadData.data.board">
    <div class="board-title">
      <h1>{{threadData.data.board.name}}</h1>
      <div class="moderators" v-if="threadData.data.board.moderators && threadData.data.board.moderators.length > 0">
        <span class="label">Moderators: </span>
        <span v-for="(mod, i) in threadData.data.board.moderators" :key="mod.username">
          <a href="#">{{mod.username}}</a><span v-if="(i + 1) !== threadData.data.board.moderators.length">, </span>
        </span>
      </div>
    </div>
  </div>

  <div class="board-data" v-if="threadData && threadData.data && threadData.data.board">
    <!-- Child Boards -->
    <table class="child-boards" v-if="threadData.data.board.children.length > 0 && threadData.data.page === 1">
      <caption>Child Boards</caption>
      <tbody>
        <tr v-for="childBoard in threadData.data.board.children" :key="childBoard.id">
          <td class="board-name">
            <router-link class="board-name" :to="{ name: 'Threads', params: { boardSlug: childBoard.slug, boardId: childBoard.id } }">{{childBoard.name}}</router-link>
            <div class="description">{{childBoard.description}}</div>

            <div class="children" v-if="childBoard.children.length > 0">
              <span class="label">Child Boards: </span>
              <span v-for="(child, i) in childBoard.children" :key="child.id">
                <router-link class="board-name" :to="{ name: 'Threads', params: { boardSlug: child.slug, boardId: child.id } }">{{child.name}}</router-link><span v-if="(i + 1) !== childBoard.children.length">, </span>
              </span>
            </div>
          </td>
          <td class="views">
              <span class="views-number">{{childBoard.total_post_count}}</span>
              <span class="label"> posts,</span>
              <span class="views-number">{{childBoard.total_thread_count}}</span>
              <span class="label"> threads</span>
          </td>

          <td class="last-post">
            <div v-if="childBoard.last_thread_id">
              <span v-if="!childBoard.last_post_username">deleted</span>
              <img v-if="childBoard.last_post_username" class="avatar-small" :class="defaultAvatarShape" :src="childBoard.last_post_avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
              <a v-if="childBoard.last_post_username" href="#">{{childBoard.last_post_username}}</a>
              <span v-if="childBoard.last_thread_id">
                posted in
                <a href="#" :title="decode(childBoard.last_thread_title)">{{truncate(decode(childBoard.last_thread_title), 25)}}</a> on
              </span>
              <span v-if="childBoard.last_thread_id">
                {{humanDate(childBoard.last_post_created_at)}}
              </span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Thread Sorting Controls -->
    <div class="thread-sort">Sort <a href="" @click.prevent="setSortField()">{{ threadData.data.desc === true ? 'descending' : 'ascending' }}</a> by
      <select v-model="sortField" name="select-thread-sort" class="select-clean" @change="setSortField()">
        <option v-for="item in sortItems" :key="item.value" :value="item.value">{{item.label}}</option>
      </select>
    </div>

    <!-- Thread Listing -->
    <table class="threads-list" v-if="threadData && threadData.data">
      <caption>Threads</caption>
      <thead>
        <tr>
          <th class="subject">Threads</th>
          <th class="views-replies">
            <span class="pointer" @click.prevent="setSortField('post_count')">
              Replies
              <span :class="getSortClass('post_count')" class="do-sort"></span>
            </span>
            <span class="pointer" @click.prevent="setSortField('views')">
              Views
              <span :class="getSortClass('views')" class="do-sort"></span>
            </span>
          </th>
          <th class="last-post">
            <span class="pointer" @click.prevent="setSortField('updated_at')">
              Last Post
              <span :class="getSortClass('updated_at')" class="do-sort"></span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <!-- Stick Threads -->
        <tr class="threads-data sticky" v-for="thread in threadData.data.sticky" :key="thread.id">
          <td class="subject">
            <div class="title">
              <div class="thread-state">
                <svg v-if="thread.has_new_post" class="is-unread" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" data-balloon="Unread">
                  <title></title>
                  <g id="icons">
                    <circle cx="16" cy="16" r="16" />
                  </g>
                </svg>

                <svg v-if="thread.sticky" class="is-sticky" viewBox="0 0 40.68 40.68" xmlns="http://www.w3.org/2000/svg" data-balloon="Sticky">
                  <path d="m40 9.92-9.24-9.19a2.5 2.5 0 0 0 -3.54 3.54l9.2 9.19a2.5 2.5 0 0 0 3.58-3.54z" />
                  <path
                    d="m12 14.52a3 3 0 0 0 -4.24 4.24l5.66 5.66-11.3 11.31-2.12 4.95 5-2.12 11.26-11.31 5.66 5.66a3 3 0 0 0 4.24-4.25z" />
                  <path d="m17.46 9.23h16v12h-16z" transform="matrix(.70710678 -.70710678 .70710678 .70710678 -3.31 22.46)" />
                </svg>

              </div>
              <a :class="{ 'bold': thread.has_new_post }" class="thread-title" href="#">{{thread.title}}</a>
              <div class="thread-state-secondary">
                <span class="thread-state-locked" v-if="thread.locked" data-balloon="Locked">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <path d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z"/>
                  </svg>
                </span>
                <span class="thread-state-hasPoll" v-if="thread.poll" data-balloon="Includes a Poll">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path class="cls-1" d="M42,2H6A4,4,0,0,0,2,6V42a4,4,0,0,0,4,4H42a4,4,0,0,0,4-4V6A4,4,0,0,0,42,2ZM13.75,40h-6V32h6Zm9,0h-6V22h6Zm9,0h-6V27h6Zm9,0h-6V12h6Z"/>
                </svg>
                </span>
              </div>
            </div>

            <div class="started-by">
              Started by
              <span v-if="thread.user.deleted">deleted</span>
              <a v-if="!thread.user.deleted" href="#">{{thread.user.username}}</a>
              <span> on {{humanDate(thread.created_at)}}</span>
            </div>
          </td>

          <td class="views-replies">
            <span class="replies">{{ thread.post_count - 1 || 0 }}</span>
            <span class="views">{{ thread.view_count || 0 }}</span>
          </td>

          <td class="last-post">
            <span v-if="thread.last_deleted">deleted</span>
            <img v-if="!thread.last_deleted" class="avatar-small" :class="defaultAvatarShape" :src="thread.last_post_avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
            <a v-if="!thread.last_deleted" href="#">{{thread.last_post_username}}</a> posted on
            <a href="#">{{ humanDate(thread.last_post_created_at) }}.</a>
            <span v-if="thread.has_new_post">
              <a href="#">(Last unread post)</a>
            </span>
          </td>
        </tr>

        <tr class="threads-data" v-for="thread in threadData.data.normal" :key="thread.id">
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
              <a :class="{'bold': thread.has_new_post}" class="thread-title" href="#">{{thread.title}}</a>
                <div class="thread-state-secondary">
                <span class="thread-state-locked" v-if="thread.locked" data-balloon="Locked">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" data-balloon="Locked">
                    <title></title>
                    <path d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z"/>
                  </svg>
                </span>
                <span class="thread-state-hasPoll" v-if="thread.poll" data-balloon="Includes a Poll">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <path class="cls-1" d="M42,2H6A4,4,0,0,0,2,6V42a4,4,0,0,0,4,4H42a4,4,0,0,0,4-4V6A4,4,0,0,0,42,2ZM13.75,40h-6V32h6Zm9,0h-6V22h6Zm9,0h-6V27h6Zm9,0h-6V12h6Z"/>
                </svg>
                </span>
              </div>
            </div>

            <div class="started-by">
              Started by
              <span v-if="thread.user.deleted">deleted</span>
              <a v-if="!thread.user.deleted" href="">{{thread.user.username}}</a>
              <span> on {{ humanDate(thread.created_at)}}</span>
            </div>
          </td>

          <td class="views-replies">
            <span class="replies">{{ thread.post_count - 1 || 0 }}</span>
            <span class="views">{{ thread.view_count || 0 }}</span>
          </td>

          <td class="last-post">
            <span v-if="thread.last_deleted">deleted</span>
            <img v-if="!thread.last_deleted" class="avatar-small" :class="defaultAvatar" :src="thread.last_post_avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
            <a v-if="!thread.last_deleted" href="">{{thread.last_post_username}}</a> posted on
            <a href="">{{ humanDate(thread.last_post_created_at) }}.</a>
            <span v-if="thread.has_new_post">
              <a href="">(Last unread post)</a>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="board-sidebar">
    <div class="board-actions" v-if="loggedIn">
      <a v-if="canCreate" class="button secondary" href="#" @click="loadEditor()">
        <i class="icon-epoch-add"></i>Start a New Thread
      </a>
      <a class="button secondary" @click="watchBoard()"  v-if="threadData && threadData.data && threadData.data.board && !threadData.data.board.watched">
        <i class="icon-epoch-watch"></i>Watch This Board
      </a>
      <a class="button secondary" @click="showSetModerators = true"
        v-if="canSetModerator">
        <i class="icon-epoch-watch"></i>Set Moderators
      </a>
    </div>
    <pagination></pagination>
  </div>
</template>

<script>
import useSWRV from 'swrv'
import { useRoute, useRouter } from 'vue-router'
import Pagination from '@/components/layout/Pagination.vue'
import humanDate from '@/composables/filters/humanDate'
import decode from '@/composables/filters/decode'
import truncate from '@/composables/filters/truncate'
import { inject, reactive, computed, watch, toRefs } from 'vue'
import { AuthStore } from '@/composables/stores/auth'
import { PreferencesStore } from '@/composables/stores/prefs'
import { countTotals, getLastPost, filterIgnoredBoards } from '@/composables/utils/boardUtils'

export default {
  name: 'Threads',
  props: ['boardSlug', 'boardId'],
  components: { Pagination },
  setup(props) {
    /* Internal Methods */
    const processThreads = () => {
      return Promise.resolve(props.boardId)
      .then(boardId => {
        const opts = {
          params: {
            board_id: boardId,
            limit: v.prefs.threads_per_page,
            page: $route.query.page || 1,
            field: $route.query.field,
            desc: $route.query.desc
          }
        }
        return $api('/api/threads', opts)
        .then(data => {
          // filter out ignored child boards
          data.board.children = filterIgnoredBoards(data.board.children, v.prefs.ignored_boards)

          // set total_thread_count and total_post_count for all child board
          data.board.children.map(childBoard => {
            let children = countTotals(childBoard.children)
            let lastPost = getLastPost([childBoard])
            childBoard.total_thread_count = children.thread_count + childBoard.thread_count
            childBoard.total_post_count = children.post_count + childBoard.post_count
            return Object.assign(childBoard, lastPost)
          })
          return data
        })
      })
    }

    /* View Methods */
    const loadEditor = () => console.log('loadEditor()')

    const watchBoard = () => console.log('watchBoard()')

    const setSortField = newField => {
      // Get/Set new sort field
      if (newField) v.sortField = newField
      else newField = v.sortField
      // Convert desc query param to boolean
      let desc = $route.query.desc === 'false' ? false : true
      // Sort Field hasn't changed just toggle desc
      const defaultField = newField === 'updated_at' && !$route.query.field
      if (defaultField || newField === $route.query.field) desc = !desc
      else desc = true // Sort field changed, default to desc true
      // Update router to have new query params, watch on query params will update data
      let query = { field: newField }
      if (!desc) query.desc = false  // only display desc in query string when false
      if (newField === 'updated_at') delete query.field // do not display default field in qs
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      $router.replace({ name: $route.name, params: params, query: query })
    }

    const getSortClass = field => {
      let sortClass = 'fa '
      const desc = v.threadData.data.desc
      const curField = v.threadData.data.field
      const defaultField = field === 'updated_at' && !curField
      if ((defaultField || curField === field) && desc) sortClass += 'fa-sort-down'
      else if ((defaultField || curField === field) && !desc) sortClass += 'fa-sort-up'
      else sortClass += 'fa-sort'
      return sortClass
    }

    /* Internal Data */
    const $api = inject('$api')
    const $swrvCache = inject('$swrvCache')
    const $route = useRoute()
    const $router = useRouter()
    const preferences = inject(PreferencesStore)
    const auth = inject(AuthStore)

    /* View Data */
    const v = reactive({
      threadData: useSWRV(() => {
        let params = new URLSearchParams($route.query)
        let queryStr = params.toString()
        let urlPath = queryStr ? `${props.boardSlug}?${queryStr}` : `${props.boardSlug}`
        return `/boards/${urlPath}`
      }, processThreads, { cache: $swrvCache, dedupingInterval: 100, ttl: 100000 }),
      prefs: preferences.data,
      loggedIn: auth.loggedIn,
      showSetModerators: true,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      sortField: $route.params.field ? $route.params.field : 'updated_at',
      sortItems: [
        {
          value: 'updated_at',
          label: 'Last Post'
        },
        {
          value: 'created_at',
          label: 'Created On'
        },
        {
          value: 'views',
          label: 'Views'
        },
        {
          value: 'post_count',
          label: 'Replies'
        }
      ]
    })

    /* Watched Data */
    watch(() => v.loggedIn, () => v.threadData.mutate(processThreads)) // Update threads on login
    watch(() => $route.query, () => v.threadData.mutate(processThreads)) // Update on query change

    /* Computed Data */
    const canCreate = computed(() => true)
    const canSetModerator = computed(() => true)

    return { ...toRefs(v), canCreate, canSetModerator, loadEditor, watchBoard, setSortField, getSortClass, humanDate, decode, truncate }
  }
}
</script>

<style lang="scss">
.threads,
.threads-posted-in {
  main {
    #public-content {
      grid-template-areas:
        "header header"
        "main sidebar"
        "main sidebar";

      @include break-max-large {
        grid-template-areas:
          "header header"
          "sidebar sidebar"
          "main main";
      }
    }
  }
}


.board-controls {
  background-color: $base-background-color;
  border-bottom: $border;
  margin: 0 0 1.5rem;
  padding: 0 0 1.5rem;
  grid-column: 1 / span 2;
  display: grid;
  grid-area: header;

  h1 {
    margin: 0;
    padding: 0;
    color: $base-font-color;
    // grid-area: main;
    font-size: $font-size-lg;
    font-weight: 600;
    text-transform: none;
  }

  pagination {
    justify-self: end;
  }

  @include break-mobile-sm {
    grid-template-columns: 1fr;
    margin-left: -1rem;
    margin-right: -1rem;
    padding-left: 1rem;
    padding-right: 1rem;
    width: 100vw;

    pagination {
      justify-self: center;
    }
  }
}

.board-data {
  padding-left: 1rem;
  grid-area: main;

  @include break-min-large {
    // grid-column: auto;
  }
}

.board-sidebar {
  grid-area: sidebar;

  button, .button { margin: 0 0 1.25rem; }

  .board-actions {
    display: flex;
    flex-direction: column;
  }

  @include break-mobile-sm {
    margin-bottom: 1rem;
  }

  @media screen and (min-width: 1280px) {
    grid-column: 2 / span 1;
    position: sticky;
    height: 100vh;
    top: $header-offset;
  }

  @media screen and (min-width: 767px) and (max-width: 1279px) {
    .board-actions {
      flex-direction: row;
      justify-content: flex-start;

      a {
        margin-right: 1rem;
      }
    }
  }
}

.board-footer {
  grid-column: 1 / span 2;
  justify-self: end;
}

.threads,
.threads-posted-in {
  .actions-bottom {
    .pagination-bottom {
      justify-self: end;
    }

    @media screen and (max-width: 1280px) {
      padding: 0.75rem 1.5rem;

      .pagination-bottom {
        bottom: 0;
      }

      .actions-bottom-grid {
        grid-template-columns: 1fr;
      }
    }

    @include break-mobile-sm {
      padding: 0.5rem 1rem;
    }
  }
}


/*-------------- New Thread Layout -------------- */
@include break-mobile-sm { input[type="text"].thread-title { margin-bottom: 0; } }

//  New Board Layout
.content-sidebar {
  .board-data {
    h1 {
      font-size: $font-size-sm;
      color: $secondary-font-color;
      text-transform: uppercase;
    }

    .threads-data {
      color: $secondary-font-color;
      display: flex;
      flex-direction: row;
    }

    .subject {
      display: flex;
      flex: 3;
      margin-right: 0.5rem;
    }

    .title {
      flex: 2;
      margin-right: 0.5rem;
    }

    .last-reply {
      flex: 1;
      font-size: $font-size-sm;
    }

    @include break-min-large {
      font-size: $font-size-sm;
      flex-direction: column;

      .threads-data {
        flex-direction: column;
        margin-bottom: 1rem;
      }
    }

    @include break-max-mobile-tablet {
      .threads-data {
        flex-direction: column;
      }

      .last-reply {
        font-size: $font-size-sm;
      }
    }
  }
}


// Thread Sorting
.thread-sort {
  color: $secondary-font-color;
  font-size: $font-size-sm;
  margin-bottom: 0.5rem;
  text-align: right;

  .select-clean {
    background-color: transparent;
    background-image: none;
    border: none;
    box-shadow: none;
    color: $color-primary;
    display: inline;
    height: inherit;
    margin: 0;
    padding: 0;
    -webkit-appearance: auto;
    width: initial;
  };
}


// General Thread Table styles
.child-boards,
.threads-list {
  display: grid;
  column-gap: 1.5rem;
  margin-bottom: 3rem;

  caption {
    color: $secondary-font-color;
    font-size: $font-size-xs;
    font-weight: 400;
    grid-column: 1 / span 3;
    margin-bottom: .25rem;
    text-align: left;
    text-transform: uppercase;
  }

  thead, tbody, tr {
    display: contents;
  }

   thead, tbody {
    tr {
      td, th {
        font-size: $base-font-size;
        line-height: 20px;
      }
    }
  }

  td, th {
    padding: 0;
    padding-bottom: 1rem;
  }

  .description {
    font-size: $font-size-sm;
  }

  .last-post {
    color: $secondary-font-color;
    font-size: $font-size-sm;
  }
}


// Child Boards view
.child-boards {
  grid-template-columns: minmax(calc(400px + 4rem), 800px) 2fr minmax(200px, 400px);
  border-bottom: $border;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  margin-left: -1rem;

  .children {
    color: $secondary-font-color;
    font-size: $font-size-sm;
  }

  .views {
    color: $secondary-font-color;
    font-size: $font-size-sm;
    font-weight: 600;
    display: grid;
    grid-template-columns: 2fr 1fr;
    grid-template-rows: min-content;
    column-gap: 0.2rem;

    .views-number {
      justify-self: end;
    }

    .label {
      font-weight: 400;
    }
  }

  @include break-mobile-sm {
    grid-template-columns: 1fr;
    row-gap: 0;
    margin-bottom: 2rem;

    td {
      padding-bottom: 0;
    }

    td:last-child {
      margin-bottom: 2rem;
    }

    caption {
      grid-column: inherit;
    }

    .views {
      grid-template-columns: repeat(4, min-content);
    }
  }
}


// Thread List view
.threads-list {
  display: grid;
  grid-template-columns: minmax(400px, 800px) minmax(100px, auto) minmax(200px, 400px);
  // column-gap: 1.5rem;
  // row-gap: 1.5rem;
  column-gap: 0;
  row-gap: 0;

  caption {
    display: none;
    grid-column: 1 / span 4;
  }

  thead, tbody, tr {
    display: contents;
  }

  thead, tbody {
    tr {
      td, th {
        border-bottom: $border-trans;
        font-size: $base-font-size;
        margin-bottom: 1rem;
        padding: 0;
        padding-bottom: 0.5rem;
        padding-right: 1rem;
        line-height: 20px;

        &:last-child {
          padding-right: 0;
        }
      }
    }
  }

  thead {
    tr {
      th {
        &.subject,
        &.replies,
        &.views,
        &.views-replies,
        &.last-post {
          color: $secondary-font-color;
          font-size: $font-size-xs;
          font-weight: 400;
          text-transform: uppercase;
        }

        &.last-post {
          text-align: right;
        }
      }
    }
  }

  tbody {
    tr {
      td {
        margin-bottom: 1rem;
        padding-bottom: 1rem;
      }

      &:last-child {
        td {
          border-color: transparent;
        }
      }
    }
  }

  .started-by,
  .replies,
  .views,
  .last-post {
    color: $secondary-font-color;
  }

  .replies,
  .views,
  .last-post {
    font-size: $font-size-sm;
  }

  .started-by {
    font-size: $font-size-sm;
  }

  .replies,
  .views {
    text-align: right;
  }

  .views-replies {
    display: grid;
    grid-template-columns: repeat(2, minmax(60px, auto));
    text-align: right;
  }

  .replies {
    margin-left: 0.5rem;
  }

  .subject {
    display: flex;
    flex-direction: column;
  }

  .title {
    display: flex;
    flex: 0 auto;
    position: relative;
  }

  .thread-state {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    position: absolute;
    top: 0;
    left: -1.625rem;
    height: 1.25rem;
    width: 1.5rem;

    svg {
      height: 9px;
      margin-right: 0.25rem;
      width: auto;

      path {
        fill: $secondary-font-color;
      }
    }

    .is-unread {
      height: 5px;
      fill: $color-primary;
    }

    @include break-mobile-sm {
      flex-direction: column;
      height: auto;
      margin-top: 0.25rem;

      svg {
        margin-bottom: 0.5rem;
      }
    }
  }

  .thread-title {
    flex: 1 0 calc(100% - 36px);
    margin-bottom: 0;
    max-width: 100%;
  }

  .thread-state-secondary {
    display: flex;

    .thread-state-locked,
    .thread-state-hasPoll {
      line-height: 1;
      margin-left: 0.25rem;
    }

    svg {
      height: 14px;
      width: auto;

      &:hover {
        fill: $secondary-font-color;
      }
    }
  }



  // Mobile Thread Table
  @include break-mobile-sm {
    grid-template-columns: 1fr;
    row-gap: 0;

    caption {
      display: block;
      color: $secondary-font-color;
      grid-column: inherit;
      text-align: left;
      text-transform: uppercase;
    }

    tbody, thead {
      tr {
        td, th {
          border-bottom: 0;
          line-height: 20px;
          margin-bottom: 0;
          padding-bottom: 0;;
        }
      }
    }

    thead {
      display: none;
    }

    td {
      &:first-child {
        margin-top: 0.5rem;
      }
      &:last-child {
        border-bottom: $border-trans;
        margin-bottom: 1rem;
        padding-bottom: 1.25rem;
      }
    }

    .started-by {
      font-size: $font-size-sm;
    }

    .views-replies {
      grid-template-columns: repeat(3, max-content);
    }

    .replies,
    .views {
      font-weight: 600;
      text-align: left;

      &:after {
        font-weight: 400;
        white-space: nowrap;
      }
    }

    .replies {
      margin-left: 0;
      &:after {
        content: ' replies, ';
        margin-right: 0.25rem;
      }
    }

    .views {
      &:after {
        content: ' views';
      }
    }
  }

  .pointer {
    .fa {
      color: rgba($border-color, .5);
      transition: color 150ms ease-in-out;
    }

    &:hover {
      .fa {
        color: rgba($border-color, 1);
      }

      .fa-sort-asc,
      .fa-sort-desc {
        color: $secondary-font-color;
      }
    }

    .fa-sort-asc,
    .fa-sort-desc {
      color: $secondary-font-color;
    }
  }

  .do-sort {
    padding-left: 0.125rem;
  }
}

</style>
