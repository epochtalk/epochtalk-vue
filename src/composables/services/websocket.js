import NotificationStore from '@/composables/stores/notifications'
import { AuthStore } from '@/composables/stores/auth'
import { provide, inject, reactive } from 'vue'
import { Socket as PhoenixSocket } from 'phoenix'
import { $axios2 } from '@/api'

// Variable initializations
let userChannel, roleChannel, publicChannel
let session = reactive({ user: {} })

// Initiate the connection to the websocket server
const socketUrl = process.env.VUE_APP_BACKEND_URL.replace('http://', 'ws://') + '/socket'
const socketInstance = new PhoenixSocket(socketUrl, {
  logger: (kind, msg, data) => {
   if (window.websocket_logs) console.log(`${kind}: ${msg}`, data)
  }
})

// Connect to websocket server
socketInstance.connect()

// Vue Provide Symbol
const WEBSOCKET_KEY = 'websocket'
export const WebsocketService = Symbol(WEBSOCKET_KEY)

// API Functions
export const socketLogin = socketUser => {
  let reconnectWithToken = () => {
    if (socketInstance.connectionState() === 'open') {
      socketInstance.disconnect(() => {
        socketInstance.params.token = socketUser.token
        socketInstance.connect()
      }, 1000, 'Disconnected to attempt authorized socket connection.') // disconnect
    }
    else setTimeout(() => reconnectWithToken(), 1000)
  }
  reconnectWithToken()
  Object.assign(session.user, socketUser)
  NotificationStore.refresh()
  NotificationStore.refreshMentionsList()
}

export const socketLogout = socketUser => {
  if (socketInstance.connectionState() === 'open') {
    // Remove token from axios
    delete $axios2.defaults.headers.common['Authorization']
    Object.assign(session.user, socketUser)
    delete socketInstance.params.token
    if (socketInstance.isConnected()) socketInstance.disconnect() // disconnect
    socketInstance.connect() // reconnect to retrigger onOpen event
  }
}

export const setMotdMessageHandler = handler => {
  if (window.websocket_logs) console.log('Watching \'public\' channel for \'announcement\' message.')
  if (publicChannel) publicChannel.on('announcement', handler)
  else setTimeout(() => setMotdMessageHandler(handler), 1000)
}

export const watchUserChannel = () => {
  if (window.websocket_logs) console.log('Watching user channel.')
  // if (userChannel) userChannel.watch(handler)
  // else setTimeout(() => watchUserChannel(handler), 1000)
}

export const unwatchUserChannel = () => {
  if (window.websocket_logs) console.log('Unwatching user channel.')
  // if (userChannel) userChannel.unwatch(handler)
}

export const isOnline = () => { // (socketUser, callback) => {
  // if (socket.state === 'open') socket.emit('isOnline', socketUser, callback)
  // else setTimeout(() => isOnline(socketUser, callback), 1000)
}

export default {
  setup() {
    const $auth = inject(AuthStore)

    socketInstance.onOpen(() => {
      // Join Public Channel
      if (publicChannel) publicChannel.leave() // leave if already connected
      publicChannel = socketInstance.channel('user:public')
      publicChannel.join()

      // Authenticated Channels
      if (socketInstance.params.token) {
        // Join Role Channel
        if (roleChannel) roleChannel.leave() // leave if already connected
        roleChannel = socketInstance.channel('user:role')
        roleChannel.join()

        roleChannel.on('update', payload => {
          let roles = session.user ? session.user.roles : []
          // Reauthenticate if user has role, so updated permissions are fetched
          if (roles.includes(payload.lookup)) $auth.reauthenticate()
        })

        // Join User Channel
        if (userChannel) userChannel.leave() // leave if already connected
        userChannel = socketInstance.channel('user:' + session.user.id)
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
      watchUserChannel,
      unwatchUserChannel,
      setMotdMessageHandler,
      isOnline
    })
  },
  render() { return this.$slots.default() } // renderless component
}
