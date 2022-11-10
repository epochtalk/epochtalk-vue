import alertStore from '@/composables/stores/alert'
import NotificationStore from '@/composables/stores/notifications'
import { clearUser, AuthStore } from '@/composables/stores/auth'
import { provide, inject, reactive } from 'vue'
import { Socket as PhoenixSocket } from 'phoenix'
import { $axios2 } from '@/api'

const socketUrl = process.env.VUE_APP_BACKEND_URL.replace('http://', 'ws://') + '/socket'

const socketInstance = new PhoenixSocket(socketUrl, {
  logger: (kind, msg, data) => {
   if (window.websocket_logs) console.log(`${kind}: ${msg}`, data)
  }
})

const socketcluster = require('socketcluster-client')

// Public channel idenitfier and general options
let options = { waitForAuth: true }
let userChannel, userChannelNew, roleChannel
let publicChannel
let session = reactive({ user: {} })

// Initiate the connection to the websocket server
const socket = socketcluster.connect({
  hostname: 'localhost',
  port: 23958,
  autoReconnect: true
})

const WEBSOCKET_KEY = 'websocket'

export const WebsocketService = Symbol(WEBSOCKET_KEY)

// API Functions
export const socketLogin = socketUser => {
  socketInstance.params.token = socketUser.token
  socketInstance.disconnect() // disconnect
  socketInstance.connect() // reconnect to retrigger onOpen event

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
    socketInstance.disconnect() // disconnect
    socketInstance.connect() // reconnect to retrigger onOpen event
  }
}

export const setMotdMessageHandler = handler => {
  if (window.websocket_logs) console.log('Watching \'public\' channel for \'announcement\' message.')
  if (publicChannel) publicChannel.on('announcement', handler)
  else setTimeout(() => setMotdMessageHandler(handler), 1000)
}

export const watchUserChannel = handler => {
  if (window.websocket_logs) console.log('Watching user channel.')
  if (userChannel) userChannel.watch(handler)
  else setTimeout(() => watchUserChannel(handler), 1000)
}

export const unwatchUserChannel = handler => {
  if (window.websocket_logs) console.log('Unwatching user channel.')
  if (userChannel) userChannel.unwatch(handler)
}

export const isOnline = (socketUser, callback) => {
  if (socket.state === 'open') socket.emit('isOnline', socketUser, callback)
  else setTimeout(() => isOnline(socketUser, callback), 1000)
}

export default {
  setup() {
    const $auth = inject(AuthStore)

    // Socket Error logging
    socket.on('error', err => window.websocket_logs ? console.log('Websocket error:', err) : null)

    // Channel Subscribe
    socket.on('subscribe', channelName => {
      if (JSON.parse(channelName).type === 'role') {
        socket.watch(channelName, d => {
          if (window.websocket_logs) console.log('Received role channel message.', d)
          $auth.reauthenticate()
        })
      }
      else if (JSON.parse(channelName).type === 'user') {
        socket.watch(channelName, d => {
          if (window.websocket_logs) console.log('Received user channel message', d)
          if (d.action === 'reauthenticate') $auth.reauthenticate()
          else if (d.action === 'logout' && d.sessionId === socket.getAuthToken().sessionId) {
            $auth.logout()
            clearUser() // Handles clearing authed user from a out of focus tab
            alertStore.warn('You have been logged out from another window.')
          }
          else if (d.action === 'newMessage') { NotificationStore.refresh() }
          else if (d.action === 'refreshMentions') {
            NotificationStore.refresh()
            NotificationStore.refreshMentionsList()
          }
        })
      }
      else if (JSON.parse(channelName).type === 'public') {
      // Placeholder for future public notifications if necessary
      }
      else window.websocket_logs ? console.log('Not watching', channelName) : null

      if (window.websocket_logs) console.log('Websocket subscribed to', channelName, 'with watchers', socket.watchers(channelName))
    })

    // Channel Unsubscribe
    socket.on('unsubscribe', channelName => {
     if (window.websocket_logs) console.log('Websocket unsubscribed from', channelName, socket.watchers(channelName))

     // disconnect all watchers from the channel
      socket.unwatch(channelName)
    })

    // Socket Authentication
    socket.on('authenticate', () => {
      if (window.websocket_logs) console.log('Authenticated WebSocket Connection')

      // Emit LoggedIn event to socket server
      socket.emit('loggedIn')

      // subscribe to user channel
      let userChannelKey = JSON.stringify({ type: 'user', id: session.user.id })
      userChannel = socket.subscribe(userChannelKey, options)

      // subscribe to roles channels
      if (session.user.roles) {
        session.user.roles.forEach(role => {
          let channel = JSON.stringify({ type: 'role', id: role })
          socket.subscribe(channel, options)
        })
      }
    })

    socketInstance.connect()

    // socket.on('connect', status => status.isAuthenticated ? socket.emit('loggedIn') : null)
    socketInstance.onOpen(() => {
      publicChannel = publicChannel ? publicChannel : socketInstance.channel('user:public', {})

      publicChannel.join()
        .receive("ok", resp => { console.log("Joined 'user:public' channel successfully", resp) })
        .receive("error", resp => { console.log("Unable to join 'user:public' channel", resp) })
        .receive("timeout", () => console.log("Networking issue..."))

      if (!roleChannel && session.user.token) {
        roleChannel = socketInstance.channel('user:role', {})

        // Reauthenticate if user has role to fetch updated permissions
        roleChannel.on('update', payload => {
          let roles = session.user ? session.user.roles : []
          if (roles.includes(payload.lookup)) $auth.reauthenticate()
        })

        roleChannel.join()
          .receive("ok", resp => { console.log("Joined 'user:role' channel successfully", resp) })
          .receive("error", resp => { console.log("Unable to join 'user:role' channel", resp) })
          .receive("timeout", () => console.log("Networking issue..."))
      }
      if (!userChannelNew && session.user.token) {
        userChannelNew = socketInstance.channel('user:' + session.user.id, {})

        userChannelNew.on('reauthenticate', $auth.reauthenticate)

        userChannelNew.on('newMessage', NotificationStore.refresh)

        userChannelNew.on('refreshMentions', () => {
          NotificationStore.refresh()
          NotificationStore.refreshMentionsList()
        })

        userChannelNew.on('logout', payload => {
          // Logout all sessions sharing the same token (usually an entire device)
          if (payload.token === session.user.token) $auth.websocketLogout()
        })

        userChannelNew.join()
          .receive("ok", resp => { console.log("Joined 'user:" + session.user.id + "' channel successfully", resp) })
          .receive("error", resp => { console.log("Unable to join 'user:" + session.user.id + "' channel", resp) })
          .receive("timeout", () => console.log("Networking issue...") )
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
