<template>
  <p v-if="boardData.error"><strong>{{boardData.error}}</strong></p>
  <recent-threads :threads="boardData.data.threads"></recent-threads>

  <div v-if="!loggedIn" class="dashboard-actions">
    <a href="" class="button" @click.prevent="showRegister = true">Create an Account</a>
    <a href="" class="button" @click.prevent="showLogin = true">Log In</a>
  </div>
  <div v-if="loggedIn" class="dashboard-actions">
    <a class="button" href="#">Watchlist</a>
    <a class="button" href="#">Threads Posted In</a>
  </div>

  <div v-if="boardData.data">
    <div class="category" v-for="cat in boardData.data.boards" :key="cat.id">
      <!-- Category Title -->
      <div :id="generateCatId(cat.name, cat.view_order)" class="title">
        <div v-on:click="toggleCategory(cat)" class="collapse-section">
          <a :class="{ 'is-open': collapsedCats.indexOf(cat.id) < 0, 'is-closed': collapsedCats.indexOf(cat.id) > -1 }">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 39.84 22.63" class="icon__caretDown">
              <title></title>
              <g id="Layer_2" data-name="Layer 2">
                <polyline class="icon" points="37.92 1.92 19.92 19.92 1.92 1.92" />
              </g>
            </svg>
          </a>
          <h1>{{cat.name}}</h1>
        </div>
      </div>
      <div v-for="board in cat.boards" :key="board.id">
        <transition>
          <div class="board" v-if="collapsedCats.indexOf(cat.id) < 0">
            <div class="info">
              <h2><a href="#">{{board.name}}</a></h2>
              <div class="description">{{board.description}}</div>
              <div class="moderators" v-if="board.moderators && board.moderators.length">
                <span>Moderators: </span>
                <span v-for="(mod, i) in board.moderators" :key="mod.username">
                  <a href="#">{{mod.username}}</a><span v-if="(i + 1) !== board.moderators.length">, </span>
                </span>
              </div>
              <div class="childboards" v-if="board.children.length">
                <span>Child Boards: </span>
                <span v-for="(child, i) in board.children" :key="child.id">
                  <a class="board-name" href="#">{{child.name}}</a><span v-if="(i + 1) !== board.children.length">, </span>
                </span>
              </div>
            </div>

            <div class="board-secondary">
              <!-- Board Posts and Threads -->
              <div class="view-count">
                <p class="view-count-posts">
                  <span class="view-count-number">{{board.total_post_count}}</span>
                   <span class="label"> posts,</span>
                </p>
                <p class="view-count-threads">
                  <span class="view-count-number">{{board.total_thread_count}}</span>
                   <span class="label"> threads</span>
                </p>
              </div>

              <!-- Board Last Post By -->
              <div class="last-post">
                <div v-if="board.last_post_username">
                  <span v-if="board.user_deleted || board.post_deleted">deleted</span>
                  <img v-if="!board.user_deleted && !board.post_deleted" class="avatar-small round" :src="board.last_post_avatar || require('@/assets/images/avatar.png')" @error="$event.target.src=require('@/assets/images/avatar.png')" />
                  <a v-if="!board.user_deleted && !board.post_deleted" href="#">{{board.last_post_username}}</a> posted in
                  <span v-if="board.last_thread_title">
                    <a href="#">{{board.last_thread_title }}</a> on
                  </span>
                  <span vi-if="board.last_post_created_at">
                    <span>{{humanDate(board.last_post_created_at)}}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </transition>

      </div>
    </div>
  </div>
  <login-modal :show="showLogin" @close="showLogin = false"></login-modal>
  <register-modal :show="showRegister" @close="showRegister = false"></register-modal>
</template>

<script>
import useSWRV from 'swrv'
import humanDate from '@/composables/filters/humanDate'
import RecentThreads from '@/components/threads/RecentThreads.vue'
import LoginModal from '@/components/modals/auth/Login.vue'
import RegisterModal from '@/components/modals/auth/Register.vue'
import { inject, reactive, toRefs, watch } from 'vue'
import { AuthStore } from '@/composables/stores/auth'
import { PreferencesStore } from '@/composables/stores/prefs'

export default {
  name: 'Boards',
  components: {
    RecentThreads,
    LoginModal,
    RegisterModal
  },
  setup() {
    /* Internal View Methods */
    const remove = (array, item) => {
      var found = array.indexOf(item);
      while (found !== -1) {
        array.splice(found, 1);
        found = array.indexOf(item);
      }
    }

    const countTotals = countBoards => {
      let thread_count = 0
      let post_count = 0
      if (countBoards.length > 0) {
        countBoards.forEach(board => {
          let children = countTotals(board.children)
          thread_count += children.thread_count + board.thread_count
          post_count += children.post_count + board.post_count
          board.total_thread_count = thread_count
          board.total_post_count = post_count
        })
      }
      return { thread_count: thread_count, post_count: post_count }
    }

    const buildLastPostData = data => {
      return {
        last_post_created_at: data.last_post_created_at,
        last_post_position: data.last_post_position,
        last_post_username: data.last_post_username,
        last_post_avatar: data.last_post_avatar,
        last_thread_id: data.last_thread_id,
        last_thread_slug: data.last_thread_slug,
        last_thread_title: data.last_thread_title
      }
    }

    const greater = (a, b) => {
      let minDate = new Date('0001-01-01T00:00:00Z')
      let aCreatedAt = a.last_post_created_at || minDate
      let bCreatedAt = b.last_post_created_at || minDate
      if (new Date(aCreatedAt) > new Date(bCreatedAt)) { return a }
      else { return b }
    }

    const getLastPost = boards => {
      let latestPost = {}
      if (boards.length > 0) {
        boards.forEach((board) => {
          let curLatest = getLastPost(board.children)
          // Compare curLatest to board
          curLatest = buildLastPostData(greater(curLatest, board))
          // Compare curLatest to actual latest
          latestPost = buildLastPostData(greater(curLatest, latestPost))
        })
      }
      return latestPost
    }

    const processBoards = path => $api(`${path}`)
      .then(data => {
        // let ignoredBoards = []
        data.boards.map(category => {
          // set total_thread_count and total_post_count for all boards
          // category.boards = filterIgnoredBoards(category.boards)

          category.boards.map(board => {
            let children = countTotals([board])
            let lastPost = getLastPost([board])
            board.total_thread_count = children.thread_count
            board.total_post_count = children.post_count
            return Object.assign(board, lastPost)
          })
        })
        return data
      })

    /* View Methods */
    const generateCatId = (name, viewOrder) => {
      let anchorId = (name + '-' + viewOrder).replace(/\s+/g, '-').toLowerCase()
      return anchorId
    }

    const toggleCategory = cat => {
      if (v.collapsedCats.indexOf(cat.id) > -1) { remove(v.collapsedCats, cat.id) }
      else if (v.collapsedCats.indexOf(cat.id) < 0) { v.collapsedCats.push(cat.id); }
      preferences.update()
    }

    /* Internal Data */
    const $api = inject('$api')
    const $swrvCache = inject('$swrvCache')
    const auth = inject(AuthStore)
    const preferences = inject(PreferencesStore)

    /* View Data */
    const v = reactive({
      collapsedCats: preferences.data.collapsed_categories,
      loggedIn: auth.loggedIn,
      showLogin: false,
      showRegister: false,
      boardData: useSWRV(`/api/boards`, processBoards, { cache: $swrvCache })
    })

    /* Watch Data */
    watch(() => v.loggedIn, () => v.boardData.mutate(processBoards)) // Update boards on login

    return { ...toRefs(v), generateCatId, toggleCategory, humanDate }
  }
}
</script>

<style lang="scss">
img.avatar-small {
  border-radius: 100px;
  border: 1px solid #444;
  opacity: 1;
  margin: 0 0.1rem;
  height: 1rem;
  width: 1rem;
  object-fit: cover;
}
.category {
  // @include row;
  // border-top: $border;
  margin-bottom: 0.875rem;
  padding-top: 0.375rem;
  .title {
    h1 {
      display: inline-block;
      font-size: $font-size-sm;
      line-height: 1.5;
      // margin-top: 0.5rem;
      padding-left: 0;
    }
    a {
      display: inline-block;
      color: $secondary-font-color;
      width: 1rem;
      // font-size: 0.65rem;
      position: relative;
      // top: -0.2rem;
      &:hover,
      &:focus {
        text-decoration: none;
      }
    }

    .collapse-section {
       @include no-select;
       display: flex;
       align-items: center;
       margin-left: -1rem;
       cursor: pointer;

      .is-open {
        .icon__caretDown {
          transform: rotateZ(0deg);
          transition: all ease-in-out 150ms;
        }
      }

      .is-closed {
        .icon__caretDown {
          transform: rotateZ(-90deg);
          transition: all ease-in-out 150ms;
        }
      }

       .icon__caretDown {
         margin-bottom: 4px;
         width: 8px;

         polyline {
           fill: none;
           stroke: $secondary-font-color;
           stroke-linecap: round;
           stroke-miterlimit: 10;
           stroke-width: 7px;
         }
       }
      }
  }
  .board {
    display: flex;
    flex-direction: row;
    padding: 0 0 1rem 0;

    .info {
      flex: 2 0 0;
      margin-right: 1rem;
      word-break: break-word;

      .description,
      .childboards,
      .moderators {
        color: $secondary-font-color;
        font-size: $font-size-sm;
        line-height: 1;
        margin-bottom: 0.5rem;
      }

      .childboards {
        .board-name {
          font-weight: 600;
        }
      }

      .description {
        color: $base-font-color;
      }
    }

    h2 {
      font-size: $font-size-med;
      font-weight: 600;
      text-transform: none;

      a {
        color: $base-font-color;

        &:hover {
          color: $color-primary;
        }
      }
    }

    .board-secondary {
      display: flex;
      flex: 1;
      flex-direction: column;
    }

    .view-count {
      @include info-text;
      flex: 0 0 50%;

      &-posts,
      &-threads {
        display: flex;
        margin: 0;
        padding: 0;
        .label {
          flex: 0 0 50px;
          text-align: left;
        }
      }

      &-number {
        flex: 1 0 auto;
        font-weight: 600;
        margin-right: .25rem;;
        text-align: right;
      }
    }

    .last-post {
      @include info-text;
      flex: 2;
    }

    @include break-max-desktop {
      .view-count {
        flex: 0 0 auto;
      }
      .view-count-posts,
      .view-count-threads {
        display: inline;
      }
      .view-count-number {
        margin-right: 0;
        text-align: left;
      }
    }

    @include break-min-desktop {
      .info {
        flex: 2;
      }
      .board-secondary {
        flex-direction: row;
          .view-count {
            padding-right: 2rem;
          }
        }
      }
  }

  @include break-mobile-sm {
    margin: 0 1rem 0 1.75rem;
  }
}
.dashboard-actions {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;

  .button {
    margin: 0 1rem;
    min-width: 160px;
  }

  @include break-mobile-sm {
    .button {
      font-size: $font-size-sm;
    }
  }
}

.sidebar {
  grid-area: sidebar;
  padding-top: 1rem;

  h1 {
    font-size: $font-size-sm;
    line-height: inherit;
    margin-bottom: 0.5rem;
  }

  .threads-recent {
    color: $secondary-font-color;
    font-size: $font-size-sm;
    margin-bottom: 1rem;

    .title {
      font-size: $font-size-base;;
    }

    .user {
      font-size: $font-size-sm;
    }

    .thread-status {
      font-size: $font-size-sm;

      svg {
        height: 0.875rem;
      }
    }
  }

  @include break-min-large {
    border-top: none;
    // border-left: $border;
    padding-left: 1rem;
    padding-top: 0;
  }
}
</style>
