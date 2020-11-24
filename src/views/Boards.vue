<template>
  <p v-if="error"><strong>{{error}}</strong></p>
  <recent-threads :threads="data.threads"></recent-threads>
  <div v-if="data">
    <div class="category" v-for="cat in data.boards" :key="cat.id">
      <!-- Category Title -->
      <div :id="generateCatId(cat.name, cat.view_order)" class="title">
        <div v-on:click="toggleCategory(cat)" class="collapse-section">
          <a :class="{ 'is-open' : cat.show || cat.show === undefined, 'is-closed': !cat.show }" class="test">
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
          <div class="board" v-if="cat.show || cat.show === undefined">
            <div class="info">
              <a href="#">{{board.name}}</a>
              <div class="description">{{board.description}}</div>
              <div class="moderators" v-if="board.moderators && board.moderators.length">
                <strong>Moderators: </strong>
                <span v-for="(mod, i) in board.moderators" :key="mod.username">
                  <a href="#">{{mod.username}}</a><span v-if="(i + 1) !== board.moderators.length">, </span>
                </span>
              </div>
              <div class="childboards" v-if="board.children.length">
                <strong>Child Boards:</strong>
                <span v-for="(child, i) in board.children" :key="child.id">
                  <a href="#">{{child.name}}</a><span v-if="(i + 1) !== board.children.length">, </span>
                </span>
              </div>
            </div>

            <div class="board-secondary">
              <!-- Board Posts and Threads -->
              <div class="view-count">
                <p class="view-count-posts">
                  <span class="view-count-number">{{board.post_count}}</span>
                   <span class="label"> posts,</span>
                </p>
                <p class="view-count-threads">
                  <span class="view-count-number">{{board.thread_count}}</span>
                   <span class="label"> threads</span>
                </p>
              </div>

              <!-- Board Last Post By -->
              <div class="last-post">
                <div v-if="board.last_post_username">
                  <span v-if="board.user_deleted || board.post_deleted">deleted</span>
                  <img v-if="!board.user_deleted && !board.post_deleted" class="avatar-small round" v-bind:src="board.last_post_avatar" />
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
</template>

<script>
import useSWRV from 'swrv'
import { inject } from 'vue'
import RecentThreads from "@/components/threads/RecentThreads.vue";
import humanDate from '@/filters/humanDate'

export default {
  name: 'Boards',
  components: {
    RecentThreads
  },
  setup() {
    const $api = inject('$api')
    const $swrvCache = inject('$swrvCache')

    const { data: data, error: error } = useSWRV(`/api/boards`, path => $api(`${path}`), {
      cache: $swrvCache })

    let collapsedCats = [];
    // let ignoredBoards = [];

    data.value.boards.map(function(category) {
      // set category visibility
      if (collapsedCats.indexOf(category.id) > -1) {
        category.show = false;
      }
      else {
        category.show = true;
      }

      // set total_thread_count and total_post_count for all boards
      //category.boards = filterIgnoredBoards(category.boards)

      // category.boards.map(function(board) {
      //   var children = countTotals([board]);
      //   var lastPost = getLastPost([board]);
      //   board.total_thread_count = children.thread_count;
      //   board.total_post_count = children.post_count;
      //   return Object.assign(board, lastPost);
      // });
    })


    return {
      data,
      error
    }
  },
  methods: {
    humanDate: humanDate,
    generateCatId(name, viewOrder) {
      var anchorId = (name + '-' + viewOrder).replace(/\s+/g, '-').toLowerCase();
      return anchorId;
    },
    toggleCategory(cat) {
      if (cat.show === undefined) { cat.show = false; }
      else { cat.show = !cat.show; }
      // if (!Session.isAuthenticated()) { return; }

      // // if showing, remove from collapsed_categories in place
      // if (cat.show) { remove(collapsedCats, cat.id); }
      // // else add to collapsed_categories
      // else if (collapsedCats.indexOf(cat.id) < 0) { collapsedCats.push(cat.id); }

      // // save changes to local preferences
      // var newPrefs = PreferencesSvc.preferences;
      // newPrefs.collapsed_categories = collapsedCats;
      // PreferencesSvc.setPreferences(newPrefs);

      // // save changes to server preferences
      // newPrefs.username = Session.user.username;
      // User.update({ id: Session.user.id }, newPrefs);
    }
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

    @media screen and (max-width: 960px) {
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

    @media screen and  (min-width: 960px) {
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
</style>
