import axios from 'axios'
import { get } from 'lodash'
import localStorageCache from '@/composables/utils/localStorageCache'
import alertStore from '@/composables/stores/alert'

export const $axios = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 3000,
  crossDomain: true
})

const $auth = localStorageCache(0, 'app').get('auth')
const initUser = $auth ? $auth.data : undefined
if (initUser) { $axios.defaults.headers.common['Authorization'] = `BEARER ${initUser.token}` }

/* provided methods */
const $http = (path, opts, handleErrors) => {
  opts = opts || {}
  const method = (opts.method || 'get').toLowerCase()
  delete opts.method
  const data = opts.data
  delete opts.data

  let req = (m => {
    switch(m) {
      case 'post':
      case 'put':
      case 'patch':
        return $axios[method](path, data, opts)
      default: return $axios[method](path, opts)
    }
  })(method)

  const reqPromise = req.then(res => res.status === 200 ? res.data : res)

  if (handleErrors) {
    return reqPromise.catch(err => {
      const msg = get(err, 'response.data.message')
      if (msg) { alertStore.error(msg) }
      return Promise.reject(err)
    })
  }
  else { return reqPromise }
}

export const boardsApi = {
  slugToBoardId: slug => $http(`/api/boards/${slug}/id`),
  getBoards: stripped => $http(`/api/boards${stripped ? '?stripped=true' : ''}`)
}

export const threadsApi = {
  lock: threadId => $http(`/api/threads/${threadId}/lock`, { data: { status: true }, method: 'POST'}),
  unlock: threadId => $http(`/api/threads/${threadId}/lock`, { data: { status: false }, method: 'POST'}),
  sticky: threadId => $http(`/api/threads/${threadId}/sticky`, { data: { status: true}, method: 'POST'}),
  unsticky: threadId => $http(`/api/threads/${threadId}/sticky`, { data: { status: false }, method: 'POST'}),
  byBoard: params => $http('/api/threads', { params }),
  slugToThreadId: slug => $http(`/api/threads/${slug}/id`),
  notifications: () => $http('api/threadnotifications'),
  removeSubscriptions: () => $http('/api/threadnotifications', { method: 'DELETE' }),
  disableNotifications: () => $http('/api/threadnotifications', { data: { enabled: false }, method: 'PUT' }),
  enableNotifications: () => $http('/api/threadnotifications', { data: { enabled: true }, method: 'PUT' })
}

export const postsApi = {
  lock: postId => $http(`/api/posts/${postId}/lock`, { method: 'POST'}),
  unlock: postId => $http(`/api/posts/${postId}/unlock`, { method: 'POST'}),
  byThread: params => $http('/api/posts', { params }),
  slugToPostId: slug => $http(`/api/posts/${slug}/id`)
}
export const pollsApi = {
  lock: (threadId, pollId) => $http(`/api/threads/${threadId}/polls/${pollId}/lock`, { method: 'POST', data: { locked: true }}),
  unlock: (threadId, pollId) => $http(`/api/threads/${threadId}/polls/${pollId}/lock`, { method: 'POST', data: { locked: false }})
}

export const watchlistApi = {
  watchBoard: boardId => $http(`/api/watchlist/boards/${boardId}`, { method: 'POST' }),
  unwatchBoard: boardId => $http(`/api/watchlist/boards/${boardId}`, { method: 'DELETE' })
}

export const authApi = {
  login: data => $http('/api/login', { method: 'POST', data }, true)
  .then(user => {
    $axios.defaults.headers.common['Authorization'] = `BEARER ${user.token}`
    return user
  }),
  logout: () => $http('/api/logout', { method: 'DELETE' }, true)
  .then(user => {
    delete $axios.defaults.headers.common['Authorization']
    return user
  }),
  register: data => $http('/api/register', { method: 'POST', data }, true)
  .then(user => {
    $axios.defaults.headers.common['Authorization'] = `BEARER ${user.token}`
    return user
  }),
  emailAvailable: email => $http(`/api/register/email/${email}`),
  usernameAvailable: username => $http(`/api/register/username/${username}`),
  inviteExists: email => $http(`/api/invites/exists?email=${email}`),
  invite: email => $http('/api/invites', { method: 'POST', data: { email }})
}

export const usersApi = {
  search: username => $http('/api/users/search', { params: { username } }),
  lookup: (username, params) => $http(`/api/users/lookup/${username}`, { params }),
  update: (userId, data) => $http(`/api/users/${userId}`, { method: 'PUT', data }),
  preferences: () => $http('/api/users/preferences'),
  pageIgnored: params => $http('/api/ignoreUsers/ignored', { params }),
  ignore: user => $http(`/api/ignoreUsers/ignore/${user.id}`, { method: 'POST' }),
  unignore: user => $http(`/api/ignoreUsers/unignore/${user.id}`, { method: 'POST' })
}

export const messagesApi = {
  pageIgnored: params => $http('/api/messages/ignored', { params }),
  ignore: data => $http('/api/messages/ignore', { method: 'POST', data }),
  unignore: data => $http('/api/messages/unignore', { method: 'POST', data }),
  settings: () => $http('/api/messages/settings'),
  emailNotifications: enabled => $http('/api/messages/settings', { method: 'PUT', data:{enabled}}),
  ignoreNewbies: enabled => $http('/api/messages/settings/newbie', { method: 'PUT', data:{enabled}})
}

export const mentionsApi = {
  pageIgnored: params => $http('/api/mentions/ignored', { params }),
  ignore: data => $http(`/api/mentions/ignore`, { method: 'POST', data }),
  unignore: data => $http(`/api/mentions/unignore`, { method: 'POST', data }),
  settings: () => $http('/api/mentions/settings'),
  emailNotifications: enabled => $http('/api/mentions/settings', { method: 'PUT', data:{enabled}})
}

export const breadcrumbsApi = {
  find: (id, type) => $http('/api/breadcrumbs', { params: { id, type } })
}

export const adminApi = {
  moderators: {
    remove: data => $http('/api/admin/moderators/remove', { method: 'POST', data }),
    add: data => $http('/api/admin/moderators', { method: 'POST', data })
  }
}
