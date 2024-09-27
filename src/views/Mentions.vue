<template>
  <div class="recent-mentions-header">
    <h1>
      Recent Mentions
    </h1>
  </div>
  <div class="recent-mentions">
    <div class="mention" v-for="mention in mentionData?.data" :key="mention.notification_id" :class="{ 'dismissed': mention.viewed }">
      <div class="mention-content">
        <div class="mention-status" v-if="mention.viewed"></div>
        <div class="mention-status" v-if="!mention.viewed" data-balloon="Unread">
          <svg class="unread" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <title></title>
            <circle cx="24" cy="24" r="16"/>
          </svg>
        </div>

        <router-link :to="{ name: 'Posts', params: { threadSlug: mention.thread_slug }, query: { start: mention.post_start }, hash: `#${mention.post_id}` }" @click.prevent="dismissNotifications({ type: 'mention', id: mention.notification_id, viewed: mention.viewed })">
          <div class="mention-title">
            <div class="avatar" :class="defaultAvatarShape">
              <img :src="mention.mentioner_avatar || defaultAvatar" />
            </div>

            <div class="mention-body">
              <span class="timestamp">{{humanDate(mention.created_at)}}</span>
              <span class="user">{{mention.mentioner}}</span>
              mentioned you in
              <span class="hidden-mobile">
                <span v-html="mention.board_name" class="boardName"></span>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="caret-right">
                  <title></title>
                  <path d="M24,38.83,4.59,19.41a2,2,0,0,1,2.82-2.82L24,33.17,40.59,16.59a2,2,0,0,1,2.82,2.82Z"/>
                </svg>
              </span>
              <span class="title">{{mention.title}}</span>
            </div>
          </div>

          <!--post-processing="mention.body_html" style-fix="true"-->
          <div v-html="mention.body_html" class="mention-reference"></div>
        </router-link>

        <div class="actions">
          <div @click="deleteMention({ id: mention.id, type: 'mention', notification_id: mention.notification_id })" class="action-button delete" data-balloon="Delete" data-balloon-pos="left">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <title></title>
              <polygon points="37.08 14.45 33.55 10.92 24 20.46 14.45 10.92 10.92 14.45 20.46 24 10.92 33.55 14.45 37.08 24 27.54 33.55 37.08 37.08 33.55 27.54 24 37.08 14.45"/>
            </svg>
          </div>
          <div v-if="!mention.viewed" @click="dismissNotifications({ type: 'mention', id: mention.notification_id, viewed: mention.viewed })" class="action-button unread" data-balloon="Mark Read" data-balloon-pos="left">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path d="M24,12A12,12,0,1,1,12,24,12,12,0,0,1,24,12m0-4A16,16,0,1,0,40,24,16,16,0,0,0,24,8Z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="recent-mentions" v-if="mentionData?.data.length <= 0">
    <h4>You currently have no mentions</h4>
  </div>

  <div class="sidebar">
    <div v-if="mentionData?.data.length" class="mention-actions">
      <a @click="deleteMention({ type: 'mention' })" class="button secondary" data-balloon="Delete All">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <title></title>
          <path d="M7.73,14.82,12.08,45H35.92l4.35-30.18H7.73Zm9.69,25.26A1.23,1.23,0,0,1,16.08,39L14.52,21.08a1.23,1.23,0,0,1,1.12-1.34A1.22,1.22,0,0,1,17,20.86l1.57,17.89A1.22,1.22,0,0,1,17.42,40.08ZM31,20.86a1.22,1.22,0,0,1,1.33-1.12,1.23,1.23,0,0,1,1.12,1.34L31.92,39a1.23,1.23,0,0,1-2.46-.21Zm-5.8.08v18a1.23,1.23,0,1,1-2.46,0V20.94a1.23,1.23,0,1,1,2.46,0Z"/><path d="M39.32,7.64H32.14C32.14,3,28.39,3,28.39,3H19.61s-3.75,0-3.75,4.64H8.68a1.93,1.93,0,0,0-2.09,2v3.23H41.41V9.61A1.93,1.93,0,0,0,39.32,7.64Zm-10-.1H18.72V7A1.59,1.59,0,0,1,20.3,5.43h7.4A1.59,1.59,0,0,1,29.28,7Z"/>
        </svg>
        Delete all
      </a>
      <a @click="dismissNotifications({ type: 'mention' })" class="button secondary" data-balloon="Mark All As Read">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <title></title>
          <circle cx="24" cy="24" r="16"/>
        </svg>
        Mark all read
      </a>
      <div class="pagination-slide" v-if="mentionData?.prev || mentionData?.next">
        <div class="pagination-controls">
          <button @click="pageResults(-1)" :disabled="!mentionData?.prev">&#10094; Prev</button>
          <div class="page">{{currentPage}}</div>
          <button @click="pageResults(1)" :disabled="!mentionData?.next">Next &#10095;</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, computed } from 'vue'
import { mentionsApi } from '@/api'
import { localStoragePrefs } from '@/composables/stores/prefs'
import humanDate from '@/composables/filters/humanDate'
import { useRoute, useRouter } from 'vue-router'
import NotificationsStore from '@/composables/stores/notifications'
import { addMentionListener, removeMentionListener } from '@/composables/services/websocket'

export default {
  name: 'Mentions',
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1,
      extended: true
    }
    next(vm => mentionsApi.page(query).then(d => vm.mentionData = d).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1,
      extended: true
    }
    mentionsApi.page(query).then(d => this.mentionData = d).catch(() => {})
    next()
  },
  beforeRouteLeave(to, from, next) {
    removeMentionListener()
    next()
  },
  setup() {
    const pageResults = inc => {
      const newPage = v.mentionData.page + inc
      let query = { ...$route.query, page: newPage }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const refreshMentions = () => mentionsApi.page({
      limit: $route.query.limit || localStoragePrefs().data.posts_per_page,
      page: $route.query.page || 1,
      extended: true
    }).then(d => v.mentionData = d).catch(() => {})

    const dismissNotifications = params => NotificationsStore.dismiss(params)
    const deleteMention = params => NotificationsStore.deleteMention(params)

    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      currentPage: computed(() => Number($route.query.page) || 1),
      mentionData: null,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
    })

    // Websocket Handling
    addMentionListener(refreshMentions)

    return { ...toRefs(v), humanDate, pageResults, dismissNotifications, deleteMention }
  }
}
</script>

<style lang="scss">
.mentions .pagination-slide .pagination-controls { margin: auto; }
#public-content {
  .mentions & {
    grid-template-columns: minmax(0, 3fr) minmax(240px, 1fr);
    grid-template-areas:
        "header header"
        "main sidebar"
        "main sidebar";
    grid-gap: 2rem;
    row-gap: 1rem;
    margin-bottom: 2rem;
  }
}
.sidebar {
  .mention-actions {
    .button {
      margin: 0 0 1.25rem;
      &:last-child { margin-bottom: 0; }

    }
  }
}
.recent-mentions-header {
  display: flex;
  align-items: center;
  grid-area: header;

  h1 {
    color: $base-font-color;
    font-size: $font-size-xl;
    font-weight: 600;
    flex: 1 0 auto;
    text-transform: none;
  }
}

.recent-mentions {
  display: flex;
  flex-direction: column;
  grid-area: main;
  margin-bottom: 1.5rem;

  .mention {
    padding: 1rem 0 2rem;
    border-bottom: $border;
    transition: all ease-in-out 200ms;

    .actions {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      width: 2rem;

      .action-button {
        width: 1rem;
        cursor: pointer;
        z-index: 999;
        display: none;
      }
    }

    &:hover {
      background-color: darken($sub-header-color, 1%);
      .actions div {
        display: block;;
      }
    }

    &.dismissed,
    &.dismissed:hover {
      background-color: transparent;
      .mention-status {
        svg {
          display: none;
        }
      }
    }

    &.dismissed:hover {
      .actions {
        svg {
          display: block;
        }
      }
    }
  }

  .mention-content {
    color: $base-font-color;
    display: grid;
    column-gap: 1rem;
    row-gap: 0.25rem;
    grid-template-areas:
      "status title actions"
      "status message actions";
    grid-template-columns: min-content 1fr min-content;

    &:hover {
      text-decoration: none;
    }

    .mention-status {
      grid-area: status;
      min-width: 20px;
      padding-top: 1rem;
      padding-left: 0.5rem;

      svg {
        fill: $color-primary;
        width: 12px;
      }
    }

    .mention-title {
      grid-area: title;
      display: flex;
      width: 100%;
    }

    .avatar {
      flex: 0 0 50px;
      margin-right: 0.5rem;
        &.circle {
          img {
            height: 3.125rem;
            width: 3.125rem;
            border-radius: 100%;
            border: 2px solid $border-color;
            object-fit: cover;
          }
        }
        &.rect {
          img {
            height: 3.125rem;
            width: 3.125rem;
            border: 2px solid $border-color;
            object-fit: contain;
          }
        }
      }

    .mention-body {
      color: $secondary-font-color;

      .user,
      .boardName,
      .title {
        font-weight: 600;
      }

      .title {
        max-height: calc(#{$base-line-height} * 2);
        overflow: hidden;
      }

      .timestamp {
        color: $secondary-font-color;
        display: block;
        font-size: $font-size-sm;
      }

      svg {
        fill: $secondary-font-color;
      }

      a:hover {
        color: $color-primary;
      }
    }

    .mention-reference {
      color: $base-font-color;
      grid-area: message;
      margin-left: 56px;
      max-height: calc(#{$base-line-height} * 4);
      overflow: hidden;
    }
  }
}

.caret-right {
  height: 12px;
  position: relative;
  transform: rotate(-90deg);
  top: 1px;
}

// Small screen layout
$avatar-small: 2rem;
$columnGap-small: 0.5rem;

@media screen and (max-width: 767px) {
  .mentions #public-content {
    grid-template-areas:
      "header header"
      "sidebar sidebar"
      "main main";
  }

  .recent-mentions {
    .mention {
      .mention-content {
        column-gap: $columnGap-small;
        grid-template-areas:
          "status actions actions"
          "status title title"
          "status message message";

        .mention-status {
          padding-left: 0;
          padding-top: 2rem;
        }

        .avatar {
          flex: 0 0 $avatar-small;
          width: 100%;
          height: auto;

          img {
            height: 2rem;
            width: 2rem;
          }
        }

        .actions {
          display: flex;
          justify-content: flex-end;
          flex-direction: row;
          justify-self: flex-end;

          .action-button {
            display: block;
            line-height: 1;
            margin-left: 1rem;
          }
        }

        .mention-reference {
          margin-left: calc(#{$avatar-small} + #{$columnGap-small});
          margin-top: 0.5rem;
        }
      }
    }
  }
}
</style>
