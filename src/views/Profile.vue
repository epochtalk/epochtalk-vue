<template>
<div class="user-profile-posts">
  <div class="table-actions">
    <button @click="toggleThreads(true)" :class="{'active': threadsMode}">
      <strong>Threads&nbsp;</strong> <span class="username">by {{user.username}}</span>
    </button>

    <button @click="toggleThreads(false)" :class="{'active': !threadsMode}">
      <strong>Posts&nbsp;</strong> <span class="username">by {{user.username}}</span>
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

    <div class="no-table-contents" v-if="!postData?.posts.length">
      <h4>This user has no threads to display</h4>
    </div>
    <div v-if="postData?.posts.length">
      <table class="profile-posts-table" width="100%">
        <thead>
          <th class="thread">Thread</th>
          <th class="timestamp pointer" @click="setDesc()"><span :class="getSortClass()"></span>&nbsp;Post Date</th>
        </thead>

        <tbody>
          <tr v-for="post in postData?.data" :key="post.id">
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
import { reactive, toRefs } from 'vue'

export default {
  name: 'Profile',
  setup() {
    const toggleThreads = () => console.log('toggle threads')
    const setDesc = () => console.log('set desc')
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

    const v = reactive({
      test: false,
      threadsMode: false,
      postData: {},
      user: {}
    })
    return { ...toRefs(v), toggleThreads, setDesc, getSortClass, humanDate }
  }
}
</script>

<style lang="scss">

</style>
