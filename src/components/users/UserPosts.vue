<template>
  <div class="user-profile-posts">
    <div class="table-actions">
      <button @click="threadsMode = true" :class="{'active': threadsMode}">
        <strong>Threads&nbsp;</strong> <span class="username">by {{username}}</span>
      </button>

      <button @click="threadsMode = false" :class="{'active': !threadsMode}">
        <strong>Posts&nbsp;</strong> <span class="username">by {{username}}</span>
      </button>
    </div>

    <!-- User's Paged Posts -->
    <div v-if="!threadsMode">
  <!--     <div>
        <div class="pagination-wrap" v-if="posts.pageCount > 0">
          <pagination page-count="ProfilePostsCtrl.pageCount" page="ProfilePostsCtrl.page" query-params="ProfilePostsCtrl.queryParams"></pagination>
        </div>
      </div> -->

      <div class="no-table-contents" v-if="!postData?.posts?.length">
        <h4>This user has no posts to display</h4>
      </div>

      <div v-if="postData?.posts?.length">
        <table class="profile-posts-table" width="100%">
          <thead>
            <th class="thread">Thread</th>
            <th class="timestamp pointer" @click="setDesc()"><span :class="getSortClass()"></span>&nbsp;Post Date</th>
          </thead>

          <tbody>
            <tr v-for="post in postData?.posts" :key="post.id">
              <!-- TODO(akinsey): <td data-balloon="{{post.thread_title}}" data-balloon-pos="top"> -->
              <td>
                <div class="truncate-title">
                  <span v-if="post.hidden && !post._deleted"><i class="fa fa-eye-slash"></i></span>
                  <!-- <a ui-sref="posts.data({ slug: post.thread_slug, start: post.position, '#': post.id })" ng-bind-html="post.thread_title" ng-if="!post._deleted" class="thread-title"></a> -->
                  <a href="" v-if="!post._deleted" class="thread-title">{{post.thread_title}}</a>
                  <span v-if="post._deleted">Deleted</span>
                </div>
                <div class="post" @click="post.open = !post.open">
                  <div class="post-body" :class="{ closed: !post.open }">{{post.body_html}}</div>
                </div>
              </td>
              <td class="timestamp">{{humanDate(post.created_at)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="threadsMode">
      <!-- User's Paged Threads -->

  <!--       <div class="pagination-wrap" ng-if="ProfilePostsCtrl.usersPosts.length > 0">
          <div class="pagination-simple">
            <a ng-show="ProfilePostsCtrl.prev" ui-sref=".({ threads: ProfilePostsCtrl.threads, page: ProfilePostsCtrl.prev, limit: ProfilePostsCtrl.limit, desc: ProfilePostsCtrl.desc })">
              &#10094; Previous
            </a>
            <span ng-hide="ProfilePostsCtrl.prev">&#10094; Previous</span>
            &nbsp;&nbsp;&nbsp;
            <a ng-show="ProfilePostsCtrl.next" ui-sref=".({ threads: ProfilePostsCtrl.threads, page: ProfilePostsCtrl.next, limit: ProfilePostsCtrl.limit, desc: ProfilePostsCtrl.desc })">
               Next &#10095;
            </a>
            <span ng-hide="ProfilePostsCtrl.next">Next &#10095;</span>
          </div>
        </div> -->

      <div class="no-table-contents" v-if="!threadData?.posts.length">
        <h4>This user has no threads to display</h4>
      </div>
      <div v-if="threadData?.posts.length">
        <table class="profile-posts-table" width="100%">
          <thead>
            <th class="thread">Thread</th>
            <th class="timestamp pointer" @click="setDesc()"><span :class="getSortClass()"></span>&nbsp;Post Date</th>
          </thead>

          <tbody>
            <tr v-for="post in threadData?.posts" :key="post.id">
              <!-- TODO(akinsey): <td data-balloon="{{post.thread_title}}" data-balloon-pos="top"> -->
              <td>
                <div class="truncate-title">
                  <span v-if="post.hidden && !post._deleted"><i class="fa fa-eye-slash"></i></span>
                  <!-- <a ui-sref="posts.data({ slug: post.thread_slug, start: post.position, '#': post.id })" ng-bind-html="post.thread_title" ng-if="!post._deleted" class="thread-title"></a> -->
                  <a href="" v-if="!post._deleted" class="thread-title">{{post.thread_title}}</a>
                  <span v-if="post._deleted">Deleted</span>
                </div>
                <div class="post" @click="post.open = !post.open">
                  <div class="post-body" :class="{ closed: !post.open }">{{post.body_html}}</div>
                </div>
              </td>
              <td class="timestamp">{{humanDate(post.created_at)}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import humanDate from '@/composables/filters/humanDate'
import { reactive, toRefs, onBeforeMount, inject } from 'vue'
import { postsApi } from '@/api'
import { PreferencesStore, localStoragePrefs } from '@/composables/stores/prefs'
import { useRoute } from 'vue-router'

export default {
  name: 'UserPosts',
  props: [ 'username' ],
  beforeRouteEnter(to, from, next) {
    next(vm => {
      const params = {
        username: vm.username,
        limit: localStoragePrefs().data.posts_per_page,
        page: to.query.page || 1,
        field: to.query.field,
        desc: to.query.desc
      }
      postsApi.byUser(params).then(d => vm.postData = d)
      postsApi.startedByUser({ ...params, page: 1 }).then(d => vm.threadData = d)
    })
  },
  beforeRouteUpdate(to, from, next) {
    const params = {
      username: this.username,
      limit: localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc
    }
    postsApi.byUser(params).then(d => this.postData = d)
    postsApi.startedByUser({ ...params, page: 1 }).then(d => this.threadData = d)
    next()
  },
  setup() {
    onBeforeMount(() => {
      if (!v.postData) {
        const params = {
          username: $route.params.username,
          limit: v.prefs.posts_per_page,
          page: $route.query.page || 1,
          field: $route.query.field,
          desc: $route.query.desc
        }
        postsApi.byUser(params).then(d => v.postData = d)
        postsApi.startedByUser({ ...params, page: 1 }).then(d => v.threadData = d)
      }
    })

    const setDesc = () => console.log('set desc')
    const getSortClass = field => {
      let sortClass = 'fa '
      const desc = v.postData.desc
      const curField = v.postData.field
      const defaultField = field === 'updated_at' && !curField
      if ((defaultField || curField === field) && desc) sortClass += 'fa-sort-down'
      else if ((defaultField || curField === field) && !desc) sortClass += 'fa-sort-up'
      else sortClass += 'fa-sort'
      return sortClass
    }

    const $route = useRoute()
    const $prefs = inject(PreferencesStore)

    const v = reactive({
      prefs: $prefs.data,
      threadsMode: false,
      postData: null,
      threadData: null
    })
    return { ...toRefs(v), setDesc, getSortClass, humanDate }
  }
}
</script>

<style lang="scss">
.profile-posts-table {
  table-layout: fixed;
  thead th {
    text-align: left;
    border-bottom: 1px solid $border-color;
  }
  tr {
    td {
      font-size: $base-font-size;
      line-height: 1.3;
      padding: 0.5rem 0;
      vertical-align: top;
    }
  }

  .timestamp {
    color: $text-gray-med;
    min-width: 150px;
    padding-left: 1rem;
    width: 25%;
  }

  .truncate-title {
    width: 100%; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  .thread-title { font-weight: 600; }

  .post {
    cursor: pointer;
    padding: 0 0.25rem;
    transition: all ease-in-out 200ms;
    &:hover { background-color: darken($base-background-color, 5%); }
  }

  .post-body {
    white-space: pre-wrap;
    &.open { background-color: darken($base-background-color, 5%); }
    ul { white-space: normal }
    &.closed {
      width: 100%;
      max-height: 18px;
      white-space: pre-wrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .no-table-contents {
    color: $text-gray-med;
    font-size: $font-size-med;
    font-weight: 400;
  }

  @include break-mobile-med {
    display: grid;
    grid-template-columns: 1fr;

    thead, th, tbody, tr { display: contents; }
    thead { display: none; }
    tr {
      display: flex;
      flex-direction: column;
      padding: 0.5rem 0;
      width: calc(100vw - 2rem);
      td { padding: 0; }
    }

    .timestamp {
      font-size: $font-size-sm;
      padding: 0;
      order: -1;
      width: 100%;
    }
  }
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-start;

  button {
    background: transparent;
    border-bottom: 1px solid rgba(0,0,0,0);
    border-radius: 0;
    color: $text-gray-dark;
    margin-right: 2rem;
    padding: 0.5rem 0;

    &:hover, &:hover:focus, &:focus {
      background: inherit;
      border-bottom: 1px solid rgba($color-primary, .8);
      color: rgba($color-primary, .8);
      box-shadow: none;
      transform: initial;
      margin-right: 2rem;
      padding: 0.5rem 0;
    }

    &.active {
      color: $color-primary;
      border-bottom: 1px solid rgba($color-primary, .8);
      margin-right: 2rem;
      padding: 0.5rem 0;
    }
  }

  @include break-mobile-med {
    margin-bottom: 1rem;
    margin-top: 2rem;
    button { font-size: $font-size-sm; }
    .username { display: none; }
  }
}
</style>
