<template>
  <div class="main">
    <h4>Patrol</h4>
    <br>
    <div v-if="!patrolData?.posts.length">
      <br />
      <h3 class="centered">No newbie posts to patrol yet!</h3>
      <br />
    </div>
    <div :id="post.id" v-for="post in patrolData?.posts" :key="post.id" class="post-block" :class="{ 'highlighted': post.highlighted, 'hidden': post.hidden, 'deleted': post._deleted, 'editing': post.id === posting.post.id }">
      <!-- Delete Post View -->
      <div class="deleted" v-if="post._deleted">Post Deleted</div>

      <!-- Visible Post View -->
      <div v-if="!post._deleted" class="post-block-grid">
        <!-- Post Profile Section -->
        <div class="post-user">
          <router-link :to="{ path: '/profile/' + post.user.username.toLowerCase() }">
            <div class="user-avatar {{$webConfigs.default_avatar_shape}}">
              <span v-if="post.user.online" :data-balloon="`${post.user.username} is online`" class="online green">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                  <title></title>
                  <circle cx="24" cy="24" r="16" />
                </svg>
              </span>
              <router-link :to="{ path: '/profile/' + post.user.username.toLowerCase() }" :class="defaultAvatarShape" class="user-avatar">
                <img :style="avatarHighlight(post.user.highlight_color)" :src="post.user.avatar || defaultAvatar">
              </router-link>
            </div>
          </router-link>
        </div>

        <!-- Post Body Section -->
        <div class="post-content">
          <!-- Post Title -->
          <div class="post-title">
            <div class="post-title-user">
              <router-link :to="{ path: '/profile/' + post.user.username.toLowerCase() }" class="username" :data-balloon="post.user.role_name || 'User'" :style="usernameHighlight(post.user.highlight_color)" v-html="post.user.username"></router-link>
              <div :title="post.user.name" v-if="post.user.name" class="display-name">
                <span v-html="truncate(post.user.name, 33)"></span>
                <span class="hide-mobile">&nbsp;&mdash;&nbsp;</span>
              </div>
              <div :title="post.user.role_name || 'User'" class="user-role" v-html="post.user.role_name || 'User'" :style="userRoleHighlight(post.user.highlight_color)"></div>
              <div class="timestamp">
                <span v-html="humanDate(post.created_at)"></span>
                <span v-if="showEditDate(post) && post?.metadata?.edited_by_username" v-html="'&nbsp;&mdash;&nbsp;Edited ' + humanDate(post.updated_at) + ' by '"></span><router-link :to="{ path: '/profile/' + post?.metadata?.edited_by_username.toLowerCase() }" v-if="showEditDate(post) && post?.metadata?.edited_by_username" v-html="post?.metadata?.edited_by_username"></router-link>
                <span v-if="showEditDate(post) && !post?.metadata?.edited_by_username" v-html="'&nbsp;&mdash;&nbsp;Edited ' + humanDate(post.updated_at )"></span>
              </div>
            </div>

            <ul class="post-action">
              <li v-if="canPurge(post) && post.position !== 1">
                <a href="" class="post-action-icon" data-balloon="Purge" @click.prevent="() => {}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <path
                      d="M7.73,14.82,12.08,45H35.92l4.35-30.18H7.73Zm9.69,25.26A1.23,1.23,0,0,1,16.08,39L14.52,21.08a1.23,1.23,0,0,1,1.12-1.34A1.22,1.22,0,0,1,17,20.86l1.57,17.89A1.22,1.22,0,0,1,17.42,40.08ZM31,20.86a1.22,1.22,0,0,1,1.33-1.12,1.23,1.23,0,0,1,1.12,1.34L31.92,39a1.23,1.23,0,0,1-2.46-.21Zm-5.8.08v18a1.23,1.23,0,1,1-2.46,0V20.94a1.23,1.23,0,1,1,2.46,0Z" />
                    <path
                      d="M39.32,7.64H32.14C32.14,3,28.39,3,28.39,3H19.61s-3.75,0-3.75,4.64H8.68a1.93,1.93,0,0,0-2.09,2v3.23H41.41V9.61A1.93,1.93,0,0,0,39.32,7.64Zm-10-.1H18.72V7A1.59,1.59,0,0,1,20.3,5.43h7.4A1.59,1.59,0,0,1,29.28,7Z" />
                  </svg>
                </a>
              </li>
              <li v-if="canDelete(post) && !post.deleted && post.position !== 1">
                <a href="" class="post-action-icon" data-balloon="Delete" @click.prevent="() => {}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <path d="M39.22,15.68l-3.64,5.2A12.36,12.36,0,0,1,36,24,12,12,0,0,1,25,36l-1.6,2.28.57,0C36.7,38.25,48,24,48,24A51.61,51.61,0,0,0,39.22,15.68Z"/><path d="M34.18,4.65l-4.25,6.08a19.49,19.49,0,0,0-5.93-1C11.3,9.75,0,24,0,24A49.75,49.75,0,0,0,12.93,35l-4.7,6.71,4.91,3.45,26-37.08ZM12,24A12,12,0,0,1,24,12a11.86,11.86,0,0,1,4.43.87l-1.78,2.54a8.62,8.62,0,0,0-5.71.16,3.93,3.93,0,1,1-5.37,5.37,8.8,8.8,0,0,0,1.26,8.49L15.05,32A12,12,0,0,1,12,24Z"/><path d="M33,24.6l-5.34,7.63A9,9,0,0,0,33,24.6Z"/>
                  </svg>
                </a>
              </li>
              <li v-if="canDelete(post) && post.deleted">
                <a href="" class="post-action-icon selected" data-balloon="Undelete" @click.prevent="() => {}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <path d="M24,9.75C11.3,9.75,0,24,0,24S11.3,38.25,24,38.25,48,24,48,24,36.7,9.75,24,9.75ZM24,36A12,12,0,1,1,36,24,12,12,0,0,1,24,36Z"/><path d="M24,15a8.89,8.89,0,0,0-3.06.57,3.93,3.93,0,1,1-5.37,5.37A8.89,8.89,0,0,0,15,24a9,9,0,1,0,9-9Z"/>
                  </svg>
                </a>
              </li>
              <li v-if="canPostLock(post) && !post.locked">
                <a href="" class="post-action-icon" data-balloon="Lock Post" @click.prevent="lockPost(post)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <path
                      d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
                  </svg>
                </a>
              </li>
              <li v-if="canPostLock(post) && post.locked">
                <a href="" class="post-action-icon selected" data-balloon="Unlock Post" @click.prevent="unlockPost(post)">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <path
                      d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
                  </svg>
                </a>
              </li>
              <li v-if="loggedIn && post.user.id !== authedUser.id && (reportControlAccess.reportPosts || reportControlAccess.reportUsers)">
                <a href="" data-balloon="Report" @click.prevent="selectedPost = post; showPostsReportModal = true">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <path
                      d="M46.7,41.82l-21.4-37a1.5,1.5,0,0,0-2.6,0l-21.4,37A1.45,1.45,0,0,0,2.6,44H45.4A1.45,1.45,0,0,0,46.7,41.82ZM26.08,18,25.5,32h-3l-.57-14ZM24,39.21a2.5,2.5,0,1,1,2.43-2.5A2.35,2.35,0,0,1,24,39.21Z" />
                  </svg>
                </a>
              </li>
              <li v-if="canUpdate(post)">
                <a href="" data-balloon="Edit" @click.prevent="() => {}">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <path d="M7.38,33.74h0L4,44l10.26-3.39h0L41.74,13.14,34.86,6.26Zm31-21.15.54.55L14.26,37.79l-.54-.54" />
                    <path d="M45.48,6.89,41.11,2.52a1.78,1.78,0,0,0-2.5,0L36.11,5,43,11.89l2.5-2.5A1.76,1.76,0,0,0,45.48,6.89Z" />
                  </svg>
                </a>
              </li>
            </ul>
            <div class="clear"></div>
          </div>
          <!-- Thread title -->
          <div class="thread-title">
            <span v-for="(breadcrumb, index) in post.breadcrumbs" :key="index" :class="{ active: index === (post.breadcrumbs.length - 1) }">
              <span v-if="breadcrumb.label">
                <!-- TODO(akinsey): ui-sref="{{breadcrumb.state}}({{breadcrumb.opts}})" ui-sref-opts="{ reload: true }" ng-bind-html="breadcrumb.label | truncate:30" -->
                <router-link :to="{ name: `${breadcrumbShim[breadcrumb.state]}`, params: breadcrumb.opts.boardSlug ? {...breadcrumb.opts} : undefined, hash: breadcrumb.opts['#'] ? `#${breadcrumb.opts['#']}` : undefined  }" v-if="index !== (post.breadcrumbs.length - 1) && breadcrumb.state" :title="breadcrumb.label" v-html="breadcrumb.label"></router-link>
                <strong v-if="index !== (post.breadcrumbs.length - 1)">&nbsp;/&nbsp;</strong>
                <strong v-if="index === (post.breadcrumbs.length - 1)">
                  <!-- TODO(akinsey): ui-sref="posts.data({ slug: post.slug, start: post.position, '#': post.id })" -->
                  <router-link :to="{ name: 'Posts', params: { threadSlug: post.slug, threadId: post.thread_id }, query: { start: post.position}, hash: `#${post.id}` }" v-html="post.thread_title"></router-link></strong>
              </span>
            </span>
          </div>
          <!-- Post Body -->
          <!-- TODO(akinsey): <div class="post-body" post-processing="post.body_html" style-fix="true"></div> -->
          <div class="post-body" v-html="post.body_html"></div>
          <div v-if="post.user.signature">
            <div class="post-sig-border"></div>
            <!-- TODO(akinsey): post-processing="post.user.signature" style-fix="true" -->
            <div class="post-signature" v-html="post.user.signature"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="sidebar">
    <div class="sidebar-block" v-if="patrolData?.posts.length > 0">
      <div class="pagination-simple">
        <button @click="pageResults(-1)" :disabled="patrolData?.page < 2">&#10094; Prev</button>
        <button @click="pageResults(1)" :disabled="!patrolData?.hasMorePosts">Next &#10095;</button>
      </div>
    </div>
  </div>

  <posts-report-modal :selectedPost="selectedPost" :canReportPosts="true" :canReportUsers="true" :show="showPostsReportModal" @close="showPostsReportModal = false; selectedPost = null"/>

</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import { postsApi } from '@/api'
import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'
import truncate from '@/composables/filters/truncate'
import { AuthStore } from '@/composables/stores/auth'
import { localStoragePrefs } from '@/composables/stores/prefs'
import { avatarHighlight, usernameHighlight, userRoleHighlight } from '@/composables/utils/userUtils'
import PostsReportModal from '@/components/modals/posts/Report.vue'

export default {
  name: 'Patrol',
  components: { PostsReportModal },
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
    /* TODO(akinsey): update api to not return ui-sref states, remove shim */
    const breadcrumbShim = {
      '^.boards': 'Boards',
      'posts.data': 'Posts',
      'threads.data': 'Threads'
    }

    const showEditDate = () => true
    const canPurge = () => true
    const canDelete = () => true
    const canPostLock = () => true
    const canUpdate = () => true
    const pageResults = inc => {
      const newPage = v.patrolData.page + inc
      let query = { ...$route.query, page: newPage }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const lockPost = post => postsApi.lock(post.id)
    .then(() => {
      $alertStore.success('Successfully locked post!')
      post.locked = true
    })
    const unlockPost = post => postsApi.unlock(post.id)
    .then(() => {
      $alertStore.success('Successfully unlocked post!')
      post.locked = false
    })

    const $auth = inject(AuthStore)
    const $alertStore = inject('$alertStore')
    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      loggedIn: $auth.loggedIn,
      authedUser: $auth.user,
      currentPage: Number($route.query.page) || 1,
      patrolData: null,
      showPostsReportModal: false,
      selectedPost: null,
      posting: { post: { body_html: '', body: '' } },
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      reportControlAccess: {
        reportPosts: $auth.permissionUtils.hasPermission('reports.createPostReport'),
        reportUsers: $auth.permissionUtils.hasPermission('reports.createUserReport')
      }
    })

    return { ...toRefs(v), breadcrumbShim, showEditDate, canPurge, canDelete, canPostLock, canUpdate, pageResults, humanDate, userRoleHighlight, usernameHighlight, avatarHighlight, truncate, lockPost, unlockPost }
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

.username { margin-right: .5rem; }
</style>
