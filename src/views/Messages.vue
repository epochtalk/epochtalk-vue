<template>
  <div class="messages-grid">
    <!-- Recent Conversations -->
    <div class="conversations">
      <div id="recentMessagesHeader">
        <div class="inbox" @click="loadRecentMessages(); reloadConversation()">
          <i class="fa fa-envelope"></i> Inbox
        </div>
        <div class="add" v-if="canCreateConversation()" @click="showEditor = true; editorConvoMode = true;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path d="M24,4A20,20,0,1,1,4,24,20,20,0,0,1,24,4m0-2A22,22,0,1,0,46,24,22,22,0,0,0,24,2Z"/><path d="M36,25.71H25.71V36H22.29V25.71H12V22.29H22.29V12h3.42V22.29H36Z"/>
          </svg> New Message
        </div>
      </div>

      <div class="pagination-slide" v-if="pageMax > 0">
        <div class="prev">
          <button @click="loadRecentMessages(page - 1)" :disabled="page === 1">&#10094;</button>
        </div>
        <div class="page" v-html="'Page ' + page + ' of ' + pageMax"></div>
        <div class="next">
          <button @click="loadRecentMessages(page + 1)" :disabled="page === pageMax">&#10095;</button>
        </div>
      </div>

      <div v-if="recentMessages.length < 1" class="empty-message-container">
        <div class="empty-message">No messages</div>
      </div>

      <div class="list" v-if="pageMax > 0">
        <div v-for="message in recentMessages" :key="message.id" class="cell" @click="loadConversation(message.conversation_id)" :class="{ 'active': selectedConversationId === message.conversation_id, 'unread': !message.viewed}">
          <span class="state-unread" data-balloon="Unread">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <title></title>
              <circle cx="24" cy="24" r="16"/>
            </svg>
          </span>
          <div class="message-body">
            <span class="recipient" v-html="listMessageReceivers(message)"></span>
            <span class="msg-preview" v-html="humanDate(message.created_at)"></span>
            <span class="msg-preview" v-html="message.content.subject"></span>
            <a v-if="canDeleteConversation()" href="#" class="action" @click="openDeleteConvoModal(message.conversation_id)" data-balloon="Delete" data-balloon-pos="left">
              <i class="fa fa-trash"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Conversation -->
    <div class="messages" :class="{ 'is__active' : selectedConversationId && isActive }">
      <div class="action-bar">
        <a href="" class="to__messages" @click="selectedConversationId = null">
          <svg class="" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <title></title>
            <path d="M24,38.83,4.59,19.41a2,2,0,0,1,2.82-2.82L24,33.17,40.59,16.59a2,2,0,0,1,2.82,2.82Z"/>
          </svg>
          Back to Messages
        </a>
      </div>
      <!-- New Message -->
      <div v-if="currentConversation.messages.length > 0">
        <div class="message-details-container">
          <h4 class="message-details-header">Conversation with
            <span v-for="name in receiverNames" :key="name">
              <a href="">{{name}}</a>{{ $last ? '' : ', '}}
            </span>
          </h4>
          <a class="to__reply no-select" v-if="canCreateMessage()" @click="showEditor = true; editorConvoMode = false;">
            <i class="fa fa-reply"></i> Reply
          </a>
        </div>
        <h4 class=message-details-subject>{{currentSubject}}</h4>
      </div>
      <h4 class="message-details-header centered-text" v-if="recentMessages.length > 0 && currentConversation.messages.length < 1">
        <div class="empty-message-container">
          <div class="empty-message">Select a conversation to read your messages</div>
        </div>
      </h4>

      <!-- Conversation Messages -->
      <div class="msg-container">
        <div :id="message.id" v-for="message in currentConversation.messages" :key="message.id" class="message" :class="{ 'sender': currentUserId === message.sender_id, 'unread': !message.viewed }">
          <div class="content">
            <div class="message-body-header">
              <div class="message-status">
                <div class="status-unread" data-balloon="Unread">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <title></title>
                    <circle cx="24" cy="24" r="16"/>
                  </svg>
                </div>
                <div class="status-sender">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                    <polygon class="cls-1" points="24 1.18 30.43 17.56 48 18.61 34.4 29.79 38.83 46.83 24 37.34 9.17 46.83 13.6 29.79 0 18.61 17.57 17.56 24 1.18"/>
                  </svg>
                </div>
              </div>
              <div class="avatar" :class="defaultAvatarShape">
                <img v-src="message.sender_avatar || defaultAvatar" />
              </div>
              <div class="title">
                <div class="title-username-role">
                  <span class="username" v-html="message.sender_username"></span>
                  <span class="badge alert user-role info-tooltip" v-if="message.sender_newbie_alert && (message.sender_id !== currentUserId)" data-balloon="!!! WARNING: This user is a newbie. If you are expecting a message from a more veteran member, then this is an imposter !!!" data-balloon-pos="down" data-balloon-length="large" data-balloon-break>
                    <i class="fa fa-info-circle"></i>
                    Newbie Alert!
                  </span>
                </div>
                <span class="date" v-html="humanDate(message.created_at)"></span>
              </div>
              <div class="actions">
                <a href="" class="action" data-balloon="Quote" @click="addQuote(message); editorConvoMode = false;">
                  <i class="icon-epoch-quote"></i>
                </a>
                <a v-if="canDeleteMessage(message.sender_id)" href="#" class="action"  @click="openDeleteModal(message.id)" data-balloon="Delete">
                  <i class="fa fa-trash"></i>
                </a>
                <a v-if="controlAccess.reportMessages" href="#" class="action" @click="openReportModal(message)" data-balloon="Report">
                  <i class="icon-epoch-flag"></i>
                </a>
              </div>
            </div>
            <div>{{message.content.body_html}}</div>
<!--            TODO(akinsey): <div class="msg-content post-body" post-processing="message.content.body_html" style-fix="true" is-newbie="message.sender_newbie_alert"></div> -->
          </div>
        </div>
      </div>

      <!-- load more message -->
      <div class="clear">
        <button class="fill-row no-animate" v-if="hasMoreMessages()" @click="loadMoreMessages()">
          Load More Messages
        </button>
      </div>

      <!-- Empty view -->
      <div v-if="recentMessages.length < 1" class="empty-message-container">
        <div class="empty-message"><strong>Your inbox is currently empty.</strong> Message someone to get started!</div>

        <div>
          <button v-if='canCreateConversation() ' @click="showEditor = true; editorConvoMode = true;">Start a Conversation</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import { messagesApi } from '@/api'
import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'
import { AuthStore } from '@/composables/stores/auth'
import { localStoragePrefs } from '@/composables/stores/prefs'
// import { avatarHighlight, usernameHighlight, userRoleHighlight } from '@/composables/utils/userUtils'

export default {
  name: 'Messages',
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1
    }
    next(vm => {
      messagesApi.page(query).then(d => vm.recentMessages = d).catch(() => {})
    })
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1
    }
    messagesApi.page(query).then(d => this.recentMessages = d).catch(() => {})
    next()
  },
  setup() {
    const pageResults = inc => {
      const newPage = v.patrolData.page + inc
      let query = { ...$route.query, page: newPage }
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.currentPage)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const loadRecentMessages = () => console.log('loadRecentMessages')
    const reloadConversation = () => console.log('reloadConversation')
    const hasMoreMessages = () => true
    const loadMoreMessages = () => true
    const openReportModal = message => console.log(message)
    const openDeleteModal = message => console.log(message)
    const canDeleteMessage = message => console.log(message)
    const addQuote = message => console.log(message)
    const canCreateConversation = () => true
    const listMessageReceivers = message => console.log(message)

    const $auth = inject(AuthStore)
    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      loggedIn: $auth.loggedIn,
      authedUser: $auth.user,
      currentPage: Number($route.query.page) || 1,
      currentConversation: { messages: [] },
      currentUserId: null,
      recentMessages: {},
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      showEditor: false,
      editorConvoMode: false
    })

    return { ...toRefs(v), loadRecentMessages, reloadConversation, hasMoreMessages, loadMoreMessages, openReportModal, openDeleteModal, canDeleteMessage, addQuote, canCreateConversation, listMessageReceivers, pageResults, humanDate }
  }
}
</script>

<style lang="scss">

</style>
