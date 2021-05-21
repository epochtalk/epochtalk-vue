<template>
  <div class="main">
    <recent-threads v-if="boardData && boardData.data" :threads="boardData.data.threads"></recent-threads>

    <div v-if="!loggedIn" class="dashboard-actions">
      <a href="" class="button" @click.prevent="showRegister = true">Create an Account</a>
      <a href="" class="button" @click.prevent="showLogin = true">Log In</a>
    </div>
    <div v-if="loggedIn" class="dashboard-actions">
      <a class="button" href="#">Watchlist</a>
      <router-link :to="{ name: 'ThreadsPostedIn' }" class="button">Threads Posted In</router-link>
    </div>

    <div v-if="boardData.data">
      <div class="category" v-for="cat in boardData.data.boards" :key="cat.id">
        <!-- Category Title -->
        <div v-if="cat.boards.length" :id="generateCatId(cat.name, cat.view_order)" class="title">
          <div @click="toggleCategory(cat)" class="collapse-section">
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
            <div class="board" v-if="collapsedCats.indexOf(cat.id) < 0 && ignoredBoards.indexOf(board.id) < 0">
              <div class="info">
                <h2><router-link :to="{ name: 'Threads', params: { boardSlug: board.slug, boardId: board.id } }">{{board.name}}</router-link></h2>
                <div class="description">{{board.description}}</div>
                <div class="moderators" v-if="board.moderators && board.moderators.length">
                  <span>Moderators: </span>
                  <span v-for="(mod, i) in board.moderators" :key="mod.username">
                    <router-link :to="{ path: '/profile/' + mod.username.toLowerCase() }">{{mod.username}}</router-link><span v-if="(i + 1) !== board.moderators.length">, </span>
                  </span>
                </div>
                <div class="childboards" v-if="board.children.length">
                  <span>Child Boards: </span>
                  <span v-for="(child, i) in board.children" :key="child.id">
                    <router-link class="board-name" :to="{ name: 'Threads', params: { boardSlug: child.slug, boardId: child.id } }">{{child.name}}</router-link><span v-if="(i + 1) !== board.children.length">, </span>
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
                    <img v-if="!board.user_deleted && !board.post_deleted" class="avatar-small" :class="defaultAvatarShape" :src="board.last_post_avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
                    <router-link v-if="!board.user_deleted && !board.post_deleted" :to="{ path: '/profile/' + board.last_post_username.toLowerCase() }">{{board.last_post_username}}</router-link> posted in
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
  </div>
  <login-modal :show="showLogin" @close="showLogin = false"></login-modal>
  <register-modal :show="showRegister" @close="showRegister = false"></register-modal>
</template>

<script>
import useSWRV from 'swrv'
import { mutate } from 'swrv'
import humanDate from '@/composables/filters/humanDate'
import RecentThreads from '@/components/threads/RecentThreads.vue'
import LoginModal from '@/components/modals/auth/Login.vue'
import RegisterModal from '@/components/modals/auth/Register.vue'
import { inject, reactive, toRefs, watch } from 'vue'
import { boardsApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'
import { PreferencesStore } from '@/composables/stores/prefs'
import { processBoards } from '@/composables/utils/boardUtils'

export default {
  name: 'Boards',
  components: {
    RecentThreads,
    LoginModal,
    RegisterModal
  },
  beforeRouteEnter(to, from, next) {
    next(() => mutate('/boards', boardsApi.getBoards().then(processBoards)))
  },
  beforeRouteUpdate(to, from, next) {
    mutate('/boards', boardsApi.getBoards().then(processBoards))
    next()
  },
  setup() {
    /* Internal View Methods */
    const getBoards = () => boardsApi.getBoards().then(processBoards)

    /* View Methods */
    const generateCatId = (n, i) => `${n}-${i}`.replace(/\s+/g, '-').toLowerCase()

    const toggleCategory = cat => {
      if (v.collapsedCats.indexOf(cat.id) > -1) {
        let found = v.collapsedCats.indexOf(cat.id)
        while (found !== -1) {
          v.collapsedCats.splice(found, 1)
          found = v.collapsedCats.indexOf(cat.id)
        }
      }
      else if (v.collapsedCats.indexOf(cat.id) < 0) { v.collapsedCats.push(cat.id) }
      $prefs.update()
    }

    /* Internal Data */
    const $swrvCache = inject('$swrvCache')
    const $alertStore = inject('$alertStore')
    const $auth = inject(AuthStore)
    const $prefs = inject(PreferencesStore)

    /* View Data */
    const v = reactive({
      collapsedCats: $prefs.data.collapsed_categories,
      ignoredBoards: $prefs.data.ignored_boards,
      loggedIn: $auth.loggedIn,
      showLogin: false,
      showRegister: false,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      boardData: useSWRV(() => `/boards`, getBoards, { cache: $swrvCache, dedupingInterval: 750 })
    })

    /* Watch Data */
    watch(() => v.loggedIn, () => v.boardData.mutate(getBoards)) // Update boards on login
    watch(() => v.boardData.error, err => err ? $alertStore.error(err) : null) // Handle errors

    return { ...toRefs(v), generateCatId, toggleCategory, humanDate }
  }
}
</script>

<style lang="scss">
main #public-content { grid-template-areas: 'header header' 'main main' 'main main'; }

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
  margin-bottom: 0.875rem;
  padding-top: 0.375rem;
  .title {
    h1 {
      display: inline-block;
      font-size: $font-size-sm;
      line-height: 1.5;
      padding-left: 0;
    }
    a {
      display: inline-block;
      color: $secondary-font-color;
      width: 1rem;
      position: relative;
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

  .button, .button:focus {
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
    padding-left: 1rem;
    padding-top: 0;
  }
}
</style>
