import alertStore from '@/composables/stores/alert'
import NotificationStore from '@/composables/stores/notifications'
import { clearUser, AuthStore } from '@/composables/stores/auth'
import { provide, inject, reactive } from 'vue'

const socketcluster = require('socketcluster-client')

// Public channel idenitfier and general options
let options = { waitForAuth: true }
let userChannel
let publicChannel
let session = reactive({ user: {} })

// Initiate the connection to the websocket server
const socket = socketcluster.connect({
  hostname: 'localhost',
  port: 23958,
  autoReconnect: true
})

const WEBSOCKET_KEY = 'websocket'
const publicChannelKey = JSON.stringify({ type: 'public' })

export const WebsocketService = Symbol(WEBSOCKET_KEY)

// API Functions
export const socketLogin = socketUser => {
  Object.assign(session.user, socketUser)
  socket.authenticate(socketUser.token)
  NotificationStore.refresh()
  NotificationStore.refreshMentionsList()
}

export const socketLogout = socketUser => {
  socket.subscriptions().forEach(channel => {
    if (channel !== publicChannelKey) socket.unsubscribe(channel)
  })
  Object.assign(session.user, socketUser)
  socket.deauthenticate()
  socket.emit('loggedOut')
}

export const watchPublicChannel = handler => {
  if (window.websocket_logs) console.log('Watching public channel.')
  if (publicChannel) publicChannel.watch(handler)
  else setTimeout(() => watchPublicChannel(handler), 1000)
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

    socket.on('connect', status => status.isAuthenticated ? socket.emit('loggedIn') : null)

    // always subscribe to the public channel
    publicChannel = socket.subscribe(publicChannelKey, { waitForAuth: false })

    /* Provide Store Data */
    return provide(WebsocketService, {
      socketLogin,
      socketLogout,
      watchUserChannel,
      unwatchUserChannel,
      watchPublicChannel,
      isOnline,
    })
  },
  render() { return this.$slots.default() } // renderless component
}
