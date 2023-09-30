import NotificationStore from '@/composables/stores/notifications'
import { AuthStore } from '@/composables/stores/auth'
import { provide, inject, reactive } from 'vue'
import { Socket as PhoenixSocket } from 'phoenix'
import { $axios2 } from '@/api'

// Variable initializations
let userChannel, roleChannel, publicChannel, token = null
let session = reactive({ user: {} })

// Initiate the connection to the websocket server
const socketUrl = process.env.VUE_APP_BACKEND_URL.replace('http://', 'ws://') + '/socket'
const socket = new PhoenixSocket(socketUrl, {
  params: () => token ? {token: token} : {},
  logger: (kind, msg, data) => {
   if (window.websocket_logs) console.log(`${kind}: ${msg}`, data)
  }
})

// Connect to websocket server
socket.connect()

// Vue Provide Symbol
const WEBSOCKET_KEY = 'websocket'
export const WebsocketService = Symbol(WEBSOCKET_KEY)

// API Functions
export const socketLogin = socketUser => {
  let reconnectWithToken = () => {
    if (socket.connectionState() === 'open') {
      socket.disconnect(() => {
        token = socketUser.token
        socket.connect()
      }, 1000, 'Disconnected to attempt authorized socket connection.') // disconnect
    }
    else {
      token = socketUser.token
      socket.connect()
    }
  }
  reconnectWithToken()
  Object.assign(session.user, socketUser)
  NotificationStore.refresh()
  NotificationStore.refreshMentionsList()
}

export const socketLogout = socketUser => {
  if (socket.connectionState() === 'open') {
    // Remove token from axios
    delete $axios2.defaults.headers.common['Authorization']
    Object.assign(session.user, socketUser)
    token = null
    if (socket.isConnected()) socket.disconnect() // disconnect
    socket.connect() // reconnect to retrigger onOpen event
  }
}

export const addAnnouncementListener = handler => {
  if (window.websocket_logs) console.log('Listening on \'public\' channel for \'announcement\' message.')
  if (publicChannel) publicChannel.on('announcement', handler)
  else setTimeout(() => addAnnouncementListener(handler), 1000)
}

export const addMentionListener = handler => {
  if (window.websocket_logs) console.log('Listening on \'user:' + session.user.id + '\' channel for \'refreshMentions\' message.')
  if (userChannel) userChannel.on('refreshMentions', handler)
  else setTimeout(() => addMentionListener(handler), 1000)
}

// NOTE: channel.on(msg, handler) is supposed to return a ref that
// can be used to turn off a specific handler, but it doesn't.
// This is a work around: turn off all handlers, reset default handler
export const removeMentionListener = () => {
  if (window.websocket_logs) console.log('No longer listening on \'user:' + session.user.id + '\' channel for \'refreshMentions\' message.')
  if (userChannel) {
    // turn off all channel handlers for this message
    userChannel.off('refreshMentions')
    // re-add default message handler for this channel
    userChannel.on('refreshMentions', () => {
      NotificationStore.refresh()
      NotificationStore.refreshMentionsList()
    })
  }
}

export const addMessageListener = handler => {
  if (window.websocket_logs) console.log('Listening on \'user:' + session.user.id + '\' channel for \'newMessage\' message.')
  if (userChannel) userChannel.on('newMessage', handler)
  else setTimeout(() => addMessageListener(handler), 1000)
}

export const removeMessageListener = () => {
  if (window.websocket_logs) console.log('No longer listening on \'user:' + session.user.id + '\' channel for \'newMessage\' message.')
  if (userChannel) {
    // turn off all channel handlers for this message
    userChannel.off('newMessage')
    // re-add default message handler for this channel
    userChannel.on('newMessage', NotificationStore.refresh)
  }
}

export const isOnline = (userId, callback) => {
  if (socket.connectionState() === 'open') {
    publicChannel.push("is_online", { user_id: userId })
      .receive("ok", payload => callback(undefined, payload))
      .receive("error", err => callback(err))
      .receive("timeout", () => callback("Websocket request to check if user(" + userId + ") is online, timed out"))
  }
  else setTimeout(() => isOnline(userId, callback), 1000)
}

export default {
  setup() {
    const $auth = inject(AuthStore)

    socket.onOpen(() => {
      // Join Public Channel
      if (publicChannel) publicChannel.leave() // leave if already connected
      publicChannel = socket.channel('user:public')
      publicChannel.join()

      // Authenticated Channels
      if (socket.params().token) {
        // Join Role Channel
        if (roleChannel) roleChannel.leave() // leave if already connected
        roleChannel = socket.channel('user:role')
        roleChannel.join()

        roleChannel.on('permissionsChanged', payload => {
          let roles = session.user ? session.user.roles : []
          // Reauthenticate if user has role, so updated permissions are fetched
          if (roles.includes(payload.lookup)) $auth.reauthenticate()
        })

        // Join User Channel
        if (userChannel) userChannel.leave() // leave if already connected
        userChannel = socket.channel('user:' + session.user.id)
        userChannel.join()

        userChannel.on('reauthenticate', $auth.reauthenticate)
        userChannel.on('newMessage', NotificationStore.refresh)
        userChannel.on('refreshMentions', () => {
          NotificationStore.refresh()
          NotificationStore.refreshMentionsList()
        })
        userChannel.on('logout', payload => {
          // Logout all sessions sharing the same token (usually an entire device)
          if (payload.token === session.user.token) $auth.websocketLogout()
        })
      }
    })

    /* Provide Store Data */
    return provide(WebsocketService, {
      socketLogin,
      socketLogout,
      addAnnouncementListener,
      addMentionListener,
      addMessageListener,
      removeMentionListener,
      removeMessageListener,
      isOnline
    })
  },
  render() { return this.$slots.default() } // renderless component
}
