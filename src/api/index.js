import axios from 'axios'
import { get } from 'lodash'
import localStorageCache from '@/composables/utils/localStorageCache'
import alertStore from '@/composables/stores/alert'
import config from '@/config.json'

export const $axios = axios.create({
  baseURL: config.BASE_URL,
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
      if (msg && msg !== 'Unauthorized') { alertStore.error(msg) }
      return Promise.reject(err)
    })
  }
  else { return reqPromise }
}

export const motdApi = {
  get: () => $http('/api/motd'),
  save: data => $http('/api/motd', { method: 'PUT', data })
}

export const imagesApi = {
  imagePolicy: data => $http('/api/images/policy', { method: 'POST', data })
}

export const boardsApi = {
  slugToBoardId: slug => $http(`/api/boards/${slug}/id`),
  getBoards: stripped => $http(`/api/boards${stripped ? '?stripped=true' : ''}`),
  movelist: () => $http('/api/boards/movelist')
}

export const threadsApi = {
  create: data => $http('/api/threads', { method: 'POST', data }),
  move: (threadId, newBoardId) => $http(`/api/threads/${threadId}/move`, { data: { new_board_id: newBoardId }, method: 'POST'}),
  title: (threadId, title) => $http(`/api/threads/${threadId}`, { data: { title: title }, method: 'POST'}),
  purge: threadId => $http(`/api/threads/${threadId}`, { method: 'DELETE' }),
  lock: threadId => $http(`/api/threads/${threadId}/lock`, { data: { status: true }, method: 'POST'}),
  unlock: threadId => $http(`/api/threads/${threadId}/lock`, { data: { status: false }, method: 'POST'}),
  sticky: threadId => $http(`/api/threads/${threadId}/sticky`, { data: { status: true}, method: 'POST'}),
  unsticky: threadId => $http(`/api/threads/${threadId}/sticky`, { data: { status: false }, method: 'POST'}),
  byBoard: params => $http('/api/threads', { params }),
  postedIn: params => $http('/api/threads/posted', { params }),
  slugToThreadId: slug => $http(`/api/threads/${slug}/id`),
  notifications: () => $http('api/threadnotifications'),
  removeSubscriptions: () => $http('/api/threadnotifications', { method: 'DELETE' }),
  disableNotifications: () => $http('/api/threadnotifications', { data: { enabled: false }, method: 'PUT' }),
  enableNotifications: () => $http('/api/threadnotifications', { data: { enabled: true }, method: 'PUT' }),
  viewed: threadId => $http(`/api/threads/${threadId}/viewed`, { method: 'POST' })
}

export const postsApi = {
  create: data => $http('/api/posts', { method: 'POST', data }),
  update: post => $http(`/api/posts/${post.id}`, { method: 'POST', data: { thread_id: post.thread_id, title: post.title, body: post.body }}),
  delete: (postId, lock) => $http(`/api/posts/${postId}`, { method: 'DELETE', params: { locked: lock }}),
  undelete: postId => $http(`/api/posts/${postId}/undelete`, { method: 'POST' }),
  purge: postId => $http(`/api/posts/${postId}/purge`, { method: 'DELETE' }),
  lock: postId => $http(`/api/posts/${postId}/lock`, { method: 'POST'}),
  unlock: postId => $http(`/api/posts/${postId}/unlock`, { method: 'POST'}),
  byThread: params => $http('/api/posts', { params }),
  byUser: params => $http(`/api/posts/user/${params.username}`, { params }),
  startedByUser: params => $http(`/api/posts/user/${params.username}/started`, { params }),
  slugToPostId: slug => $http(`/api/posts/${slug}/id`),
  postSearch: params => $http('/api/search/posts', { params }),
  byNewbie: params => $http('/api/posts/patrol', { params }),
  getPostDraft: () => $http('/api/posts/draft'),
  updatePostDraft: draft => $http('/api/posts/draft', { method: 'PUT', data: { draft } })
}
export const pollsApi = {
  create: (threadId, params) => $http(`/api/threads/${threadId}/polls`, { method: 'POST', data: params }),
  vote: (threadId, pollId, answerIds) => $http(`/api/threads/${threadId}/polls/${pollId}/vote`, { method: 'POST', data: { answer_ids: answerIds }}),
  removeVote: (threadId, pollId) => $http(`/api/threads/${threadId}/polls/${pollId}/vote`, { method: 'DELETE' }),
  editPoll: (threadId, pollId, options) => $http(`/api/threads/${threadId}/polls/${pollId}`, { method: 'PUT', data: options }),
  lock: (threadId, pollId) => $http(`/api/threads/${threadId}/polls/${pollId}/lock`, { method: 'POST', data: { locked: true }}),
  unlock: (threadId, pollId) => $http(`/api/threads/${threadId}/polls/${pollId}/lock`, { method: 'POST', data: { locked: false }})
}

export const watchlistApi = {
  unread: params => $http('/api/watchlist', { params }),
  edit: params => $http('/api/watchlist/edit', { params }),
  pageThreads: params => $http('/api/watchlist/threads', { params }),
  pageBoards: params => $http('/api/watchlist/boards', { params }),
  watchBoard: boardId => $http(`/api/watchlist/boards/${boardId}`, { method: 'POST' }),
  unwatchBoard: boardId => $http(`/api/watchlist/boards/${boardId}`, { method: 'DELETE' }),
  watchThread: threadId => $http(`/api/watchlist/threads/${threadId}`, { method: 'POST' }),
  unwatchThread: threadId => $http(`/api/watchlist/threads/${threadId}`, { method: 'DELETE' })
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
  authenticate: () => $http('/api/authenticate'),
  confirmRegistration: data => $http('/api/confirm', { method: 'POST', data }, true),
  inviteRegistration: data => $http('/api/join', { method: 'POST', data }, true),
  resetPassword: data => $http(`/api/reset`, { method: 'POST', data }, true),
  emailAvailable: email => $http(`/api/register/email/${email}`),
  usernameAvailable: username => $http(`/api/register/username/${username}`),
  inviteExists: email => $http(`/api/invites/exists?email=${email}`),
  invite: email => $http('/api/invites', { method: 'POST', data: { email }})
}

export const usersApi = {
  search: username => $http('/api/users/search', { params: { username } }),
  memberSearch: params => $http('/api/search/users', { params }),
  lookup: (username, params) => $http(`/api/users/lookup/${username}`, { params }),
  update: (userId, data) => $http(`/api/users/${userId}`, { method: 'PUT', data }),
  find: username => $http(`/api/users/${username}`),
  delete: userId => $http(`/api/users/${userId}`, { method: 'DELETE' }),
  deactivate: userId => $http(`/api/users/${userId}/deactivate`, { method: 'POST' }),
  reactivate: userId => $http(`/api/users/${userId}/reactivate`, { method: 'POST' }),
  preferences: () => $http('/api/users/preferences'),
  pageIgnored: params => $http('/api/ignoreUsers/ignored', { params }),
  notes: params => $http('/api/user/notes', { params }),
  createNote: data => $http('/api/user/notes', { method: 'POST', data }),
  deleteNote: params => $http('/api/user/notes', { method: 'DELETE', params }),
  updateNote: data => $http('/api/user/notes', { method: 'PUT', data }),
  ignore: user => $http(`/api/ignoreUsers/ignore/${user.id}`, { method: 'POST' }),
  unignore: user => $http(`/api/ignoreUsers/unignore/${user.id}`, { method: 'POST' }),
  adminRecover: data => $http(`/api/user/recover`, { method: 'POST', data }),
  checkResetToken: (username, token) => $http(`/api/reset/${username}/${token}/validate`),
  trust: {
    getTrustBoards: () => $http('/api/trustboards'),
    getTrustList: () => $http('/api/trustlist'),
    getTrustTree: params => $http('/api/trusttree', { params }),
    getTrustStats: username => $http(`/api/trust/${username}`),
    getTrustFeedback: username => $http(`/api/trustfeedback/${username}`),
    addTrustFeedback: data => $http('/api/trust', { method: 'POST', data }),
    editDefaultTrustList: data => $http('/api/admin/trustlist', { method: 'POST', data }),
    editTrustList: data => $http('/api/trustlist', { method: 'POST', data })
  }
}

export const messagesApi = {
  create: data => $http('/api/messages', { method: 'POST', data }, true),
  page: params => $http('/api/messages', { params }),
  pageIgnored: params => $http('/api/messages/ignored', { params }),
  ignore: data => $http('/api/messages/ignore', { method: 'POST', data }),
  unignore: data => $http('/api/messages/unignore', { method: 'POST', data }),
  settings: () => $http('/api/messages/settings'),
  emailNotifications: enabled => $http('/api/messages/settings', { method: 'PUT', data:{enabled}}),
  ignoreNewbies: enabled => $http('/api/messages/settings/newbie', { method: 'PUT', data:{enabled}}),
  delete: id => $http(`/api/messages/${id}`, { method: 'DELETE' }),
  getMessageDraft: () => $http('/api/messages/draft'),
  updateMessageDraft: draft => $http('/api/messages/draft', { method: 'PUT', data: { draft } }),
  convos: {
    page: (id, params) => $http(`/api/conversations/${id}`, { params }),
    create: data => $http('/api/conversations', { method: 'POST', data }, true),
    delete: id => $http(`/api/conversations/${id}`, { method: 'DELETE' })
  }
}

export const reportsApi = {
  reportMessage: data => $http('/api/reports/messages', { method: 'POST', data }),
  reportUser: (userId, reason) => $http('/api/reports/users', { method: 'POST', data: { offender_user_id: userId, reporter_reason: reason }}),
  reportPost: (postId, reason) => $http('/api/reports/posts', { method: 'POST', data: { offender_post_id: postId, reporter_reason: reason }})
}

export const mentionsApi = {
  page: params => $http('/api/mentions', { params }),
  pageIgnored: params => $http('/api/mentions/ignored', { params }),
  ignore: data => $http(`/api/mentions/ignore`, { method: 'POST', data }),
  unignore: data => $http(`/api/mentions/unignore`, { method: 'POST', data }),
  settings: () => $http('/api/mentions/settings'),
  remove: params => $http('/api/mentions', { method: 'DELETE', params }),
  emailNotifications: enabled => $http('/api/mentions/settings', { method: 'PUT', data:{enabled}})
}

export const notificationsApi = {
  dismiss: data => $http('/api/notifications/dismiss', { method: 'POST', data }),
  counts: params => $http('/api/notifications/counts', { params })
}

export const breadcrumbsApi = {
  find: (id, type) => $http('/api/breadcrumbs', { params: { id, type } })
}

export const banApi = {
  getBannedBoards: username => $http(`/api/users/${username}/bannedboards`),
  ban: data => $http('/api/users/ban', { method: 'PUT', data }),
  unban: data => $http('/api/users/unban', { method: 'PUT', data }),
  banFromBoards: data => $http('/api/users/ban/boards', { method: 'PUT', data }),
  unbanFromBoards: data => $http('/api/users/unban/boards', { method: 'PUT', data })
}

export const adminApi = {
  configurations: () => $http('/api/configurations'),
  updateConfigurations: data => $http('/api/configurations', { method: 'POST', data }),
  moderators: {
    remove: data => $http('/api/admin/moderators/remove', { method: 'POST', data }),
    add: data => $http('/api/admin/moderators', { method: 'POST', data })
  },
  blacklist: {
    get: () => $http('/api/admin/blacklist'),
    add: data => $http('/api/admin/blacklist', { method: 'POST', data }),
    update: data => $http('/api/admin/blacklist', { method: 'PUT', data }),
    delete: id => $http(`/api/admin/blacklist/${id}`, { method: 'DELETE' })
  },
  ranks: {
    get: () => $http('/api/rank'),
    update: data => $http('/api/rank', { method: 'PUT', data })
  },
  autoModeration: {
    getRules: () => $http('/api/automoderation/rules'),
    addRule: data => $http('/api/automoderation/rules', { method: 'POST', data }),
    updateRule: data => $http(`/api/automoderation/rules/${data.id}`, { method: 'PUT', data }),
    deleteRule: id => $http(`/api/automoderation/rules/${id}`, { method: 'DELETE' })
  }
}

export const adsApi = {
  get: () => $http('/api/ads'),
  getAnalytics: round => $http(`/api/ads/analytics/${round}`),
  create: data => $http('/api/ads', { method: 'POST', data }),
  duplicate: data => $http(`/api/ads/${data.id}/duplicate`, { method: 'POST', data }),
  update: data => $http(`/api/ads/${data.id}`, { method: 'PUT', data }),
  delete: id => $http(`/api/ads/${id}`, { method: 'DELETE' }),
  saveText: data => $http('/api/ads/text', { method: 'POST', data }),
  factoids: {
   create: data => $http('/api/ads/factoids', { method: 'POST', data }),
   update: data => $http(`/api/ads/factoids/${data.id}`, { method: 'PUT', data }),
   delete: id => $http(`/api/ads/factoids/${id}`, { method: 'DELETE' }),
   enable: data => $http(`/api/ads/factoids/${data.id}/enable`, { method: 'PUT', data }),
   disable: data => $http(`/api/ads/factoids/${data.id}/disable`, { method: 'PUT', data })
  },
  rounds: {
    create: data => $http('/api/ads/rounds', { method: 'POST', data }),
    get: () => $http('/api/ads/rounds/info'),
    getRound: id => $http(`/api/ads/rounds/${id}`),
    rotate: data => $http('/api/ads/rounds/rotate', { method: 'POST', data })
  }
}
