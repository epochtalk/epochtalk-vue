import alertStore from '@/composables/stores/alert'
import { AuthStore } from '@/composables/stores/auth'
import { provide, inject, reactive } from 'vue'

const socketcluster = require('socketcluster-client')
const debug = true

// Public channel idenitfier and general options
let options = { waitForAuth: true }
let userChannel
let session = reactive({ user: {} })

// Initiate the connection to the websocket server
export const socket = socketcluster.connect({
  hostname: 'localhost',
  port: 23958,
  autoReconnect: true
})

const WEBSOCKET_KEY = 'websocket'

export const publicChannelKey = JSON.stringify({ type: 'public' })
export const WebsocketService = Symbol(WEBSOCKET_KEY)

export default {
  setup() {
    const $auth = inject(AuthStore)

    // Socket Error logging
    socket.on('error', err => debug ? console.log('Websocket error:', err) : null)

    // Channel Subscribe
    socket.on('subscribe', channelName => {
     if (JSON.parse(channelName).type === 'role') {
       socket.watch(channelName, d => {
         if (debug) console.log('Received role channel message.', d)
         $auth.authenticate()
       })
     }
     else if (JSON.parse(channelName).type === 'user') {
       socket.watch(channelName, d => {
         if (debug) console.log('Received user channel message', d)
         if (d.action === 'reauthenticate') $auth.authenticate()
         else if (d.action === 'logout' && d.sessionId === socket.getAuthToken().sessionId) {
           $auth.logout()
           alertStore.warn('You have been logged out from another window.')
         }
         // else if (d.action === 'newMessage') { NotificationSvc.refresh() }
         // else if (d.action === 'refreshMentions') {
         //   NotificationSvc.refresh()
         //   NotificationSvc.refreshMentionsList()
         // }
       })
     }
     else if (JSON.parse(channelName).type === 'public') {
       socket.watch(channelName, d => d.action === 'announcement' ? alertStore.warn(d.message) : null)
     }
     else debug ? console.log('Not watching', channelName) : null

     if (debug) console.log('Websocket subscribed to', channelName, 'with watchers', socket.watchers(channelName))
    })

    // Channel Unsubscribe
    socket.on('unsubscribe', channelName => {
     if (debug) console.log('Websocket unsubscribed from', channelName, socket.watchers(channelName))

     // disconnect all watchers from the channel
     socket.unwatch(channelName)
    })

    // Socket Authentication
    socket.on('authenticate', () => {
     if (debug) console.log('Authenticated WebSocket Connection')

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

    /* Provide Store Data */
    return provide(WebsocketService, {
      login,
      socketLogout,
      updateUser,
      watchUserChannel,
      unwatchUserChannel,
      isOnline,
      publicChannel,
      publicChannelKey
    })
  },
  render() { return this.$slots.default() } // renderless component
}

// Handle LogoutEvent
// $rootScope.$on('logoffEvent', () => {
//   socket.subscriptions().forEach(channel => {
//     if (channel !== publicChannelKey) socket.unsubscribe(channel)
//   })
//   socket.deauthenticate()
//   socket.emit('loggedOut')
// })

export const login = user => {
  console.log('HERERERERERERERERE');
  Object.assign(session.user, user)
  console.log('Socket Login', user)
  socket.authenticate(user.token)
  // NotificationSvc.refresh()
  // NotificationSvc.refreshMentionsList()
}

export const socketLogout = user => {
  socket.subscriptions().forEach(channel => {
    if (channel !== publicChannelKey) socket.unsubscribe(channel)
  })
  updateUser(user)
  socket.deauthenticate()
  socket.emit('loggedOut')
}

export const updateUser = user => Object.assign(session.user, user)

// API Functions
export const watchUserChannel = handler => {
  if (userChannel) userChannel.watch(handler)
  else setTimeout(() => watchUserChannel(handler), 1000)
}

export const unwatchUserChannel = handler => userChannel ? userChannel.unwatch(handler) : null

export const isOnline = (user, callback) => {
  if (socket.state === 'open') socket.emit('isOnline', user, callback)
  else setTimeout(() => isOnline(user, callback), 1000)
}


// always subscribe to the public channel
export const publicChannel = socket.subscribe(publicChannelKey, options)
