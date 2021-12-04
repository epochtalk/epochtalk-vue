<template>
  <div class="messages-grid">
    <!-- Recent Conversations -->
    <div class="conversations">
      <div id="recentMessagesHeader">
        <div class="inbox" @click="reload()">
          <i class="fa fa-envelope"></i> Inbox
        </div>
        <div class="add" v-if="canCreateConversation()" @click="showEditor = false; showEditor = true; editorConvoMode = true;">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path d="M24,4A20,20,0,1,1,4,24,20,20,0,0,1,24,4m0-2A22,22,0,1,0,46,24,22,22,0,0,0,24,2Z"/><path d="M36,25.71H25.71V36H22.29V25.71H12V22.29H22.29V12h3.42V22.29H36Z"/>
          </svg> New Message
        </div>
      </div>

      <div class="pagination-slide" v-if="pageMax > 0">
        <div class="prev">
          <button @click="loadRecentMessages(-1)" :disabled="page === 1">&#10094;</button>
        </div>
        <div class="page" v-html="'Page ' + page + ' of ' + pageMax"></div>
        <div class="next">
          <button @click="loadRecentMessages(1)" :disabled="page === pageMax">&#10095;</button>
        </div>
      </div>

      <div v-if="!recentMessages.messages" class="empty-message-container">
        <div class="empty-message">No messages</div>
      </div>

      <div class="list" v-if="pageMax > 0">
        <div v-for="message in recentMessages?.messages" :key="message.id" class="cell" @click="loadConversation(message.conversation_id)" :class="{ 'active': selectedConversationId === message.conversation_id, 'unread': !message.viewed}">
          <span class="state-unread" data-balloon="Unread">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <title></title>
              <circle cx="24" cy="24" r="16"/>
            </svg>
          </span>
          <div class="message-body">
            <span class="recipient" v-html="listMessageReceivers(message)"></span>
            <span class="msg-preview" v-html="humanDate(message.created_at)"></span>
            <span class="msg-preview" v-html="message?.content?.subject"></span>
            <a v-if="canDeleteConversation()" class="action" @click.prevent="selectedDeletedConvoId = message.conversation_id; showDeleteConversationModal = true" data-balloon="Delete" data-balloon-pos="left">
              <i class="fa fa-trash"></i>
            </a>
          </div>
        </div>
      </div>
    </div>

    <!-- Current Conversation -->
    <div class="messages" :class="{ 'is__active' : selectedConversationId }">
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
      <div v-if="currentConversation">
        <div class="message-details-container">
          <h4 class="message-details-header">Conversation with
            <span v-for="(name, i) in receiverNames" :key="name">
              <router-link :to="{ path: '/profile/' + name.toLowerCase() }">{{name}}</router-link>{{ i !== receiverNames.length - 1 ? ', ' : '' }}
            </span>
          </h4>
          <a class="to__reply no-select" v-if="canCreateMessage()" @click="showEditor = false; showEditor = true; editorConvoMode = false;">
            <i class="fa fa-reply"></i> Reply
          </a>
        </div>
        <h4 class=message-details-subject>{{currentSubject}}</h4>
      </div>
      <h4 class="message-details-header centered-text" v-if="recentMessages?.messages?.length > 0 && currentConversation?.length < 1">
        <div class="empty-message-container">
          <div class="empty-message">Select a conversation to read your messages</div>
        </div>
      </h4>

      <!-- Conversation Messages -->
      <div class="msg-container">
        <div :id="message.id" v-for="message in currentConversation?.messages" :key="message.id" class="message" :class="{ 'sender': authedUser.id === message.sender_id, 'unread': !message.viewed }">
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
                <router-link :to="{ path: '/profile/' + message.sender_username.toLowerCase() }"><img :src="message.sender_avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" /></router-link>
              </div>
              <div class="title">
                <div class="title-username-role">
                  <router-link class="username" :to="{ path: '/profile/' + message.sender_username.toLowerCase() }" v-html="message.sender_username"></router-link>
                  <span class="badge alert user-role info-tooltip" v-if="message.sender_newbie_alert && (message.sender_id !== authedUser.id)" data-balloon="!!! WARNING: This user is a newbie. If you are expecting a message from a more veteran member, then this is an imposter !!!" data-balloon-pos="down" data-balloon-length="large" data-balloon-break>
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
                <a v-if="canDeleteMessage(message.sender_id)" href="#" class="action"  @click.prevent="selectedMessageId = message.id; showDeleteMessageModal = true" data-balloon="Delete">
                  <i class="fa fa-trash"></i>
                </a>
                <a v-if="controlAccess.reportMessages" href="" class="action" @click.prevent="selectedMessageId = message.id; showReportMessageModal = true" data-balloon="Report">
                  <i class="fas fa-exclamation-triangle"></i>
                </a>
              </div>
            </div>
            <div v-html="message.content.body_html || message.content.body"></div>
<!--            TODO(akinsey): <div class="msg-content post-body" post-processing="message.content.body_html" style-fix="true" is-newbie="message.sender_newbie_alert"></div> -->
          </div>
        </div>
      </div>

      <!-- load more message -->
      <div class="clear">
        <button class="full-width no-animate" v-if="currentConversation.has_next" @click="loadMoreMessages()">
          Load More Messages
        </button>
      </div>

      <!-- Empty view -->
      <div v-if="!recentMessages.messages" class="empty-message-container">
        <div class="empty-message"><strong>Your inbox is currently empty.</strong> Message someone to get started!</div>

        <div>
          <button v-if='canCreateConversation()' @click="showEditor = false; showEditor = true; editorConvoMode = true;">Start a Conversation</button>
        </div>
      </div>
    </div>
  </div>

  <delete-conversation-modal :show="showDeleteConversationModal" :conversation-id="selectedDeletedConvoId" @close="showDeleteConversationModal = false" @success="reload()" />
  <delete-message-modal :show="showDeleteMessageModal" :message-id="selectedMessageId" @close="showDeleteMessageModal = false" @success="deleteMessageSuccess()" />
  <report-message-modal :show="showReportMessageModal" :message-id="selectedMessageId" @close="showReportMessageModal = false" @success="showReportMessageModal = false" />
  <editor :showEditor="showEditor" @close="showEditor = false" :editorConvoMode="editorConvoMode" :current-message="{ conversation_id: newMessage?.conversation_id, receiver_ids: newMessage?.receiver_ids, content: { body: newMessage?.content?.body } }" :create-action="createConversation" :update-action="createMessage" :can-create="canCreateConversation" :can-update="canCreateMessage" />
</template>

<script>
import { reactive, toRefs, inject, computed } from 'vue'
import { messagesApi } from '@/api'
import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'
import { AuthStore } from '@/composables/stores/auth'
import { localStoragePrefs } from '@/composables/stores/prefs'
import DeleteConversationModal from '@/components/modals/messages/DeleteConversation.vue'
import DeleteMessageModal from '@/components/modals/messages/DeleteMessage.vue'
import ReportMessageModal from '@/components/modals/messages/ReportMessage.vue'
import Editor from '@/components/layout/Editor.vue'
// import { avatarHighlight, usernameHighlight, userRoleHighlight } from '@/composables/utils/userUtils'

export default {
  name: 'Messages',
  components: { DeleteConversationModal, DeleteMessageModal, ReportMessageModal, Editor },
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1
    }
    next(vm => {
      messagesApi.page(query)
      .then(d => vm.recentMessages = d)
      .then(() => vm.preloadConversation(to.query.id || vm.recentMessages.messages[0].conversation_id))
      .catch(() => {})
    })
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: to.query.limit || localStoragePrefs().data.posts_per_page,
      page: to.query.page || 1
    }
    messagesApi.page(query)
    .then(d => this.recentMessages = d)
    .then(() => this.preloadConversation(to.query.id || this.recentMessages.messages[0].conversation_id))
    .catch(() => {})
    next()
  },
  setup() {
    const loadRecentMessages = inc => {
      const newPage = v.recentMessages.page + inc
      let query = { ...$route.query, page: newPage }
      delete query.id
      if (query.page === 1 || !query.page) delete query.page
      if ($route.query.page !== v.page)
        $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const reload = () => {
      if ($route.query.id) {
        const query = { ...$route.query }
        delete query.id
        $router.replace({ name: $route.name, params: $route.params, query })
      }
      else {
        const query = {
          limit: $route.query.limit || localStoragePrefs().data.posts_per_page,
          page: $route.query.page || 1
        }
        messagesApi.page(query)
        .then(d => v.recentMessages = d)
        .then(() => loadConversation($route.query.id || v.recentMessages.messages[0].conversation_id))
        .catch(() => {})
      }
    }

    const loadConversation = conversationId =>
      $router.replace({ name: $route.name, params: $route.params, query: { ...$route.query, id: conversationId } })

    const preloadConversation = (conversationId, options) => {
      options = options || {}
      v.selectedConversationId = conversationId
      v.recentMessages.messages.forEach(message => {
        if (message.conversation_id === conversationId) { message.viewed = true }
      })
      messagesApi.convos.page(conversationId)
      // build out conversation information
      .then(data => {
        v.currentSubject = data.messages[0].content.subject
        v.currentConversation = data
        v.currentConversation.id = conversationId
        if (options.saveInput) {
          v.newMessage.subject = v.newMessage.subject || v.currentConversation.subject
          v.newMessage.content.body = v.newMessage.content.body || ''
          v.newMessage.content.body_html = v.newMessage.content.body_html || ''
        }
        else {
          v.newMessage = { subject: v.currentConversation.subject, content: { body_html: '', body: '' } }
        }
        v.newMessage.conversation_id = data.id
        v.newMessage.sender_id = v.authedUser.id
        v.newMessage.sender_username = v.authedUser.username
        let lastMessage = data.messages[data.messages.length - 1]
        let lastReceiverIds = lastMessage.receiver_ids
        let lastReceiverUsernames = lastMessage.receivers.map(receiver => receiver.username)
        let lastSenderId = lastMessage.sender_id
        let lastSenderUsername = lastMessage.sender_username
        if (v.authedUser.id !== lastSenderId) {
          // Remove current users id from list of receivers and add senders id
          let idIndex = lastReceiverIds.indexOf(v.authedUser.id)
          if (idIndex > -1) { lastReceiverIds.splice(idIndex, 1) }
          lastReceiverIds.push(lastSenderId)

          // Remove current users username from list of receivers and add senders id
          let usernameIndex = lastReceiverUsernames.indexOf(v.authedUser.username)
          if (usernameIndex > -1) { lastReceiverUsernames.splice(usernameIndex, 1) }
          lastReceiverUsernames.push(lastSenderUsername)
        }
        v.newMessage.receiver_ids = lastReceiverIds
        v.newMessage.receiver_usernames = lastReceiverUsernames

        v.receiverNames = lastReceiverUsernames.filter((it, i, ar) => ar.indexOf(it) === i).sort()
      })
    }

    const loadMoreMessages = () => {
      const options = {
        timestamp: v.currentConversation.last_message_timestamp,
        message_id: v.currentConversation.last_message_id
      }
      messagesApi.convos.page(v.currentConversation.id, options)
      // build out conversation information
      .then(data => {
        v.currentConversation.messages = v.currentConversation.messages.concat(data.messages)
        v.currentConversation.last_message_id = data.last_message_id
        v.currentConversation.last_message_timestamp = data.last_message_timestamp
        v.currentConversation.has_next = data.has_next
      })
    }
    const deleteMessageSuccess = () => {
      const filteredMessages = v.currentConversation.messages.filter(message => message.id !== v.selectedMessageId)
      v.currentConversation.messages = filteredMessages
      if (filteredMessages.length === 0) {
        if (v.recentMessages.messages.length > 1) {
          let index = v.selectedConversationId === v.recentMessages.messages[0].conversation_id ? 1 : 0
          $router.replace({ name: $route.name, params: $route.params, query: { ...$route.query, id: v.recentMessages.messages[index].conversation_id } })
        }
        else v.recentMessages = []
      }
    }
    const addQuote = message => console.log(message)
    const canDeleteConversation = () => v.loggedIn && v.controlAccess.deleteConversations
    const canDeleteMessage = () => true
    const canCreateConversation = () => true
    const canCreateMessage = () => true
    const createConversation = convo => messagesApi.convos.create(convo).then(reload)
    const createMessage = msg => messagesApi.create(msg).then(reload)

    const listMessageReceivers = message => {
      let receiverNames = []
      message.receivers.forEach(function(receiver) {
        receiverNames.push(receiver.username)
      })
      let authedIndex = receiverNames.indexOf(v.authedUser.username)
      if (authedIndex > -1) {
        receiverNames.splice(authedIndex, 1)
        receiverNames.push(message.sender_username)
      }
      receiverNames = receiverNames.filter((it, i, ar) => ar.indexOf(it) === i).sort()
      return receiverNames.join(', ')
    }

    const $auth = inject(AuthStore)
    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      loggedIn: $auth.loggedIn,
      authedUser: $auth.user,
      receiverNames: [],
      page: computed(() => Number($route.query.page) || 1),
      currentConversation: { messages: [] },
      selectedConversationId: null,
      selectedDeletedConvoId: null,
      newMessage: null,
      recentMessages: {},
      currentSubject: null,
      pageMax: computed(() => Math.ceil(v.recentMessages.total_convo_count / v.recentMessages.limit)),
      showDeleteMessageModal: false,
      showReportMessageModal: false,
      showDeleteConversationModal: false,
      selectedMessageId: null,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      showEditor: false,
      editorConvoMode: false,
      controlAccess: {
        deleteConversations: $auth.permissionUtils.hasPermission('conversations.delete.allow'),
        reportMessages: $auth.permissionUtils.hasPermission('reports.createMessageReport')
      }
    })

    return { ...toRefs(v), reload, createMessage, createConversation, loadRecentMessages, preloadConversation, loadConversation, loadMoreMessages, canDeleteConversation, canDeleteMessage, addQuote, canCreateConversation, canCreateMessage, deleteMessageSuccess, listMessageReceivers, humanDate }
  }
}
</script>

<style lang="scss">
.messages-grid {
  grid-column: 1 / span 2;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 2fr;
  grid-template-areas:
    "list details"
    "list details";
  column-gap: 2rem;

  @include break-mobile-sm {
    grid-template-columns: 1fr;
    grid-template-areas:
      "list"
      "details";
    grid-column: 1;
  }
}

/*-------------- Messages Layout -------------- */
.conversations {
  grid-area: list;
  // min-height: calc(100vh - 95px);

  .pagination-slide {
    font-size: $font-size-sm;
    grid-template-columns: 40px 1fr 40px;
    align-items: center;
    justify-items: center;
    text-align: center;
    .page {
      display: inline-block;
      line-height: 2.5rem;
    }
    .next, .prev {
      display: inline-block;
    }
    .next { float: right; }
    .prev { float: left; }
    button {
      background-color: transparent;
      color: $text-gray-dark;
      padding: 0.5rem;
      margin: 0;

      &:hover, &:focus:hover {
        -webkit-transition: color 0.15s ease,background-color 0.15s ease;
        -moz-transition: color 0.15s ease,background-color 0.15s ease;
        transition: color 0.15s ease,background-color 0.15s ease;
        border-color: $secondary-font-color;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
        color: #fff;
        text-decoration: none;
        transform: translateY(-1px);
        color: $text-gray-dark;
        background-color: transparent;
      }
      &:disabled {
        color: $secondary-font-color;
        &:hover, &:focus:hover {
          box-shadow: none;
        }
      }
    }
  }

  .list {
    margin-bottom: 1rem;

    .cell {
      display: flex;
      font-size: 0.8rem;
      line-height: 0.95rem;
      cursor: pointer;
      padding: 0.5rem 0;
      padding-left: 12px;
      position: relative;

      .msg-preview {
        color: $secondary-font-color;
      }

      .message-body {
        display: flex;
        flex-direction: column;
        width: 100%;

        span {
          padding-bottom: 0.25rem
        }

        .recipient,
        .msg-preview {
          font-weight: 600;
        }

        .msg-preview {
          @include truncate-ellipsis;
        }
      }

      .action {
        position: absolute;
        top: 0.5rem;
        right: 0.2rem;
        color: $secondary-font-color;
        opacity: .25;
        transition: all ease-in-out 200ms;
      }

      .state-unread {
        margin-left: -12px;
        padding-top: 2px;
        width: 14px;

        svg {
          display: none;
          fill: $color-primary;
          width: 10px;
        }
      }

      &.active { background-color: $sub-header-color; }

      &.unread {
        .state-unread {
          svg {
            display: block;
          }
        }
      }

      &:hover {
        .action {
          opacity: 1;

          &:hover {
            color: $color-primary;
          }
        }
      }
    }
  }

  #recentMessagesHeader {
    display: flex;
    align-content: center;
    cursor: pointer;
    color: $secondary-font-color;
    margin-bottom: 1rem;

    .inbox {
      @include transition(color 0.15s ease);
      &:hover { @include transition(color 0.15s ease); color: $secondary-font-color-dark; }
      flex: 1 0 auto;
    }

    .add {
      color: $color-primary;
      display: flex;
      font-size: $font-size-sm;
      align-content: center;
      @include transition(color 0.15s ease);
      &:hover { @include transition(color 0.15s ease); color: $color-primary-alt; }

      svg {
        margin-right: 0.25rem;
        fill: $color-primary;

        &:hover {
          fill: $color-primary-alt;
        }
      }
    }
  }

  @include break-mobile-sm {
    // min-height: unset;
    // height: 35vh;
    // overflow-y: scroll;
    margin-bottom: 2rem;
    // border-bottom: $border;
  }
}

.messages {
  grid-area: details;

  .action-bar {
    display: none;
    font-size: $font-size-sm;
    margin-bottom: 0.25rem;
    width: 100%;

    .to__messages {
      display: flex;
      align-items: center;
      text-decoration: none;

      svg {
        height: 10px;
        fill: $color-primary;
        transform: rotateZ(90deg);
      }
    }

    @include break-mobile-sm {
      display: block;
    }
  }

  .message-details-container {
    display: flex;
    align-items: center;
    margin-bottom: 0.5rem;

    .to__reply {
      flex: 0 0 auto;
      font-size: $font-size-sm;
    }
  }

  .message-details-header {
    flex: 1 0 auto;
    font-size: $font-size-base;
    text-transform: none;
  }

  .message-details-subject {
    font-size: $font-size-xl;
    text-transform: none;

    span {
      font-weight: 600;
    }
  }

  .thin-underline {
    @include no-select;
    margin-bottom: 0;
    h4 { margin-bottom: 0; display: inline-block;}
  }
  .reply {
    margin-top: 1rem;
    .preview {
      background-color: #fff;
      height: 7rem;
      margin-bottom: 1rem;
      cursor: default;
      white-space: pre-wrap;
      overflow-y: auto;
      padding: 0.5rem;
      border: 1px solid $border-color;
    }
    button { margin-bottom: 0; }
  }

  .msg-container {
    .message-body-header {
      display: flex;
      margin-bottom: 1rem;

      .title {
        display: flex;
        flex-direction: column;
        flex: 1 0 auto;

        .title-username-role {
          display: flex;
          flex-direction: row;
          align-items: center;
        }

        .username {
          font-size: 1rem;
          font-weight: 600;
          margin-right: 0.5rem;
        }

        .date {
          color: $secondary-font-color;
          font-size: 1rem;
        }
      }

      .actions {
        align-self: center;
      }

      .action {
        color: $secondary-font-color;
        flex: 1 0 auto;
        opacity: 0.25;
        padding-left: 1rem;
        transition: opacity ease-in-out 200ms, color  ease-in-out 200ms;
      }
    }

    .message {
      @include clearfix;
      border-bottom: 1px solid $border-color;
      padding: 1rem 1rem 1rem 1.5rem;

      &:last-child { margin-bottom: 2rem; }
      &:first-child { border-top: 1px solid $border-color; margin-top: 1rem;}

      &.unread {
        .message-status {
          .status-unread {
            display: block;
          }
        }
      }

      &.sender {
        .message-status {
          .status-sender {
            display: block;
          }
        }
      }


      .message-status {
        margin-left: -1.5rem;
        padding-top: 2px;
        width: 1.5rem;

        .status-unread,
        .status-sender {
          display: none;
        }

        svg {
          fill: $color-primary;
          width: 10px;
        }

        .status-sender {
          svg {
            fill: $secondary-font-color;
          }
        }
      }

      .avatar {
        margin-right: 0.5rem;
        &.circle {
          img {
            @include border-radius(100px);
            height: 2.5rem;
            width: 2.5rem;
          }
        }
        &.rect {
          img {
            height: 2.5rem;
            width: 2.5rem;
          }
        }
      }
      .content {
        word-wrap: break-word;
      }

      &:hover {
        .action {
          color: $secondary-font-color-dark;
          opacity: 1;

          &:hover {
            color: $color-primary;
            opacity: 1;
          }
        }
      }
    }
  }

  @include break-mobile-sm {
    background: $base-background-color;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    margin-top: 1rem;
    padding: 0.5rem;
    transform: translateX(100%);
    transition: all ease-in-out 150ms;

    &.is__active {
      transform: translateX(0%);
    }
  }
}

@include break-mobile-sm {
  .conversations {
     width: calc(100vw - 32px);
    }

  .messages {
    // @include span-columns(8); @include omega;
  }
}
</style>
