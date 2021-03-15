import axios from 'axios'
import { get } from 'lodash'
import localStorageCache from '@/composables/utils/localStorageCache'
import alertStore from '@/composables/stores/alert'

const $axios = axios.create({
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
  purge: (threadId) => $http(`/api/threads/${threadId}`, { method: 'DELETE' }),
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
  delete: (postId, lock) => $http(`/api/posts/${postId}`, { method: 'DELETE', params: { locked: lock }}),
  undelete: (postId) => $http(`/api/posts/${postId}/undelete`, { method: 'POST' }),
  purge: (postId) => $http(`/api/posts/${postId}/purge`, { method: 'DELETE' }),
  lock: postId => $http(`/api/posts/${postId}/lock`, { method: 'POST'}),
  unlock: postId => $http(`/api/posts/${postId}/unlock`, { method: 'POST'}),
  byThread: params => $http('/api/posts', { params }),
  slugToPostId: slug => $http(`/api/posts/${slug}/id`)
}

export const reportsApi = {
  reportUser: (userId, reason) => $http('/api/reports/users', { method: 'POST', data: { offender_user_id: userId, reporter_reason: reason }}),
  reportPost: (postId, reason) => $http('/api/reports/posts', { method: 'POST', data: { offender_post_id: postId, reporter_reason: reason }})
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
  usernameAvailable: username => $http(`/api/register/username/${username}`)
}

export const usersApi = {
  search: username => $http('/api/users/search', { params: { username } }),
  lookup: (username, params) => $http(`/api/users/lookup/${username}`, { params }),
  update: (userId, data) => $http(`/api/users/${userId}`, { method: 'PUT', data }),
  preferences: () => $http('/api/users/preferences'),
  pageIgnoredUsers: params => $http('/api/ignoreUsers/ignored', { params }),
  ignoreUser: id => $http(`/api/ignoreUsers/ignore/${id}`, { method: 'POST' }),
  unignoreUser: id => $http(`/api/ignoreUsers/unignore/${id}`, { method: 'POST' })
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
