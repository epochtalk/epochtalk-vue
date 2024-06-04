import axios from 'axios'
import { get } from 'lodash'
import localStorageCache from '@/composables/utils/localStorageCache'
import alertStore from '@/composables/stores/alert'
import config from '@/config.json'

export const $axios = axios.create({
  baseURL: process.env.VUE_APP_OLD_BACKEND_URL || config.VUE_APP_OLD_BACKEND_URL,
  timeout: 3000,
  crossDomain: true
})
export const $axios2 = axios.create({
  baseURL: process.env.VUE_APP_BACKEND_URL || config.VUE_APP_BACKEND_URL,
  timeout: 3000,
  crossDomain: true
})

const $auth = localStorageCache(0, 'app').get('auth')
const initUser = $auth ? $auth.data : undefined
if (initUser) { $axios2.defaults.headers.common['Authorization'] = `BEARER ${initUser.token}` }
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
const $http2 = (path, opts, handleErrors) => {
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
        return $axios2[method](path, data, opts)
      default: return $axios2[method](path, opts)
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

export const legalApi = {
  get: () => $http('/api/legal'),
  reset: () => $http('/api/legal/reset'),
  save: data => $http('/api/legal', { method: 'PUT', data })
}

export const themeApi = {
  get: () => $http('/api/theme'),
  reset: () => $http('/api/theme', { method: 'POST' }),
  save: data => $http('/api/theme', { method: 'PUT', data }),
  preview: data => $http('/api/theme/preview', { method: 'PUT', data })
}

export const imagesApi = {
  imagePolicy: data => $http('/api/images/policy', { method: 'POST', data })
}

export const categoriesApi = {
  create: data => $http('/api/categories', { method: 'POST', data}),
  delete: data => $http('/api/categories/delete', { method: 'POST', data })
}

export const boardsApi = {
  slugToBoardId: slug => $http2(`/api/boards/${slug}/id`),
  getBoards: stripped => $http2(`/api/boards${stripped ? '?stripped=true' : ''}`),
  movelist: () => $http2('/api/boards/movelist'),
  unfiltered: () => $http('/api/boards/unfiltered'),
  uncategorized: () => $http('/api/boards/uncategorized'),
  find: id => $http(`/api/boards/${id}`),
  create: data => $http('/api/boards', { method: 'POST', data }),
  delete: data => $http('/api/boards/delete', { method: 'POST', data }),
  update: data => $http('/api/boards', { method: 'PUT', data }),
  updateAll: data => $http('/api/boards/all', { method: 'POST', data })
}

export const threadsApi = {
  create: data => $http2('/api/threads', { method: 'POST', data }, true),
  move: (threadId, newBoardId) => $http(`/api/threads/${threadId}/move`, { data: { new_board_id: newBoardId }, method: 'POST'}),
  title: (threadId, title) => $http(`/api/threads/${threadId}`, { data: { title: title }, method: 'POST'}),
  purge: threadId => $http(`/api/threads/${threadId}`, { method: 'DELETE' }),
  lock: threadId => $http2(`/api/threads/${threadId}/lock`, { data: { locked: true }, method: 'POST'}),
  unlock: threadId => $http2(`/api/threads/${threadId}/lock`, { data: { locked: false }, method: 'POST'}),
  sticky: threadId => $http(`/api/threads/${threadId}/sticky`, { data: { status: true}, method: 'POST'}),
  unsticky: threadId => $http(`/api/threads/${threadId}/sticky`, { data: { status: false }, method: 'POST'}),
  byBoard: params => $http2('/api/threads', { params }),
  postedIn: params => $http('/api/threads/posted', { params }),
  slugToThreadId: slug => $http2(`/api/threads/${slug}/id`),
  notifications: () => $http('api/threadnotifications'),
  removeSubscriptions: () => $http('/api/threadnotifications', { method: 'DELETE' }),
  disableNotifications: () => $http('/api/threadnotifications', { data: { enabled: false }, method: 'PUT' }),
  enableNotifications: () => $http('/api/threadnotifications', { data: { enabled: true }, method: 'PUT' }),
  viewed: threadId => $http2(`/api/threads/${threadId}/viewed`, { method: 'POST' })
}

export const postsApi = {
  create: data => $http2('/api/posts', { method: 'POST', data }, true),
  preview: body => $http2('/api/preview', { method: 'POST', data: { body: body} }, true),
  update: post => $http2(`/api/posts/${post.id}`, { method: 'POST', data: { thread_id: post.thread_id, title: post.title, body: post.body }}, true),
  delete: (postId, lock) => $http(`/api/posts/${postId}`, { method: 'DELETE', params: { locked: lock }}),
  undelete: postId => $http(`/api/posts/${postId}/undelete`, { method: 'POST' }),
  purge: postId => $http(`/api/posts/${postId}/purge`, { method: 'DELETE' }),
  lock: postId => $http(`/api/posts/${postId}/lock`, { method: 'POST'}),
  unlock: postId => $http(`/api/posts/${postId}/unlock`, { method: 'POST'}),
  byThread: params => $http2('/api/posts', { params }),
  find: id => $http(`/api/posts/${id}`),
  byUser: params => $http(`/api/posts/user/${params.username}`, { params }),
  startedByUser: params => $http(`/api/posts/user/${params.username}/started`, { params }),
  slugToPostId: slug => $http(`/api/posts/${slug}/id`),
  postSearch: params => $http('/api/search/posts', { params }),
  byNewbie: params => $http('/api/posts/patrol', { params }),
  getPostDraft: () => $http2('/api/posts/draft'),
  updatePostDraft: draft => $http2('/api/posts/draft', { method: 'PUT', data: { draft } })
}
export const pollsApi = {
  create: (threadId, params) => $http2(`/api/threads/${threadId}/polls`, { method: 'POST', data: params }),
  vote: (threadId, answerIds) => $http2(`/api/threads/${threadId}/polls/vote`, { method: 'POST', data: { answer_ids: answerIds }}),
  removeVote: (threadId) => $http2(`/api/threads/${threadId}/polls/vote`, { method: 'DELETE' }),
  editPoll: (threadId, options) => $http2(`/api/threads/${threadId}/polls`, { method: 'PUT', data: options }),
  lock: (threadId) => $http2(`/api/threads/${threadId}/polls/lock`, { method: 'POST', data: { locked: true }}),
  unlock: (threadId) => $http2(`/api/threads/${threadId}/polls/lock`, { method: 'POST', data: { locked: false }})
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
  login: data => $http2('/api/login', { method: 'POST', data }, true)
  .then(user => {
    $axios2.defaults.headers.common['Authorization'] = `BEARER ${user.token}`
    return user
  }),
  logout: () => $http2('/api/logout', { method: 'DELETE' }, true)
  .then(user => {
    delete $axios2.defaults.headers.common['Authorization']
    return user
  }),
  register: data => $http2('/api/register', { method: 'POST', data }, true)
  .then(user => {
    $axios2.defaults.headers.common['Authorization'] = `BEARER ${user.token}`
    return user
  }),
  authenticate: () => $http2('/api/authenticate', {}, false),
  confirmRegistration: data => $http2('/api/confirm', { method: 'POST', data }, true),
  inviteRegistration: data => $http('/api/join', { method: 'POST', data }, true),
  resetPassword: data => $http(`/api/reset`, { method: 'POST', data }, true),
  emailAvailable: email => $http2(`/api/register/email/${email}`),
  usernameAvailable: username => $http2(`/api/register/username/${username}`),
  inviteExists: email => $http(`/api/invites/exists?email=${email}`),
  invite: email => $http('/api/invites', { method: 'POST', data: { email }})
}

export const usersApi = {
  page: query => $http('/api/users', { params: query }),
  count: query => $http('/api/users/count', { params: query }),
  search: username => $http('/api/users/search', { params: { username } }),
  memberSearch: params => $http('/api/search/users', { params }),
  lookup: (username, params) => $http(`/api/users/lookup/${username}`, { params }),
  update: (userId, data) => $http(`/api/users/${userId}`, { method: 'PUT', data }),
  find: username => $http(`/api/users/${username}`),
  delete: userId => $http(`/api/users/${userId}`, { method: 'DELETE' }),
  deactivate: userId => $http(`/api/users/${userId}/deactivate`, { method: 'POST' }),
  reactivate: userId => $http(`/api/users/${userId}/reactivate`, { method: 'POST' }),
  preferences: () => $http2('/api/users/preferences'),
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
  page: params => $http2('/api/mentions', { params }),
  pageIgnored: params => $http('/api/mentions/ignored', { params }),
  ignore: data => $http(`/api/mentions/ignore`, { method: 'POST', data }),
  unignore: data => $http(`/api/mentions/unignore`, { method: 'POST', data }),
  settings: () => $http('/api/mentions/settings'),
  remove: params => $http('/api/mentions', { method: 'DELETE', params }),
  emailNotifications: enabled => $http('/api/mentions/settings', { method: 'PUT', data:{enabled}})
}

export const notificationsApi = {
  dismiss: data => $http2('/api/notifications/dismiss', { method: 'POST', data }),
  counts: params => $http2('/api/notifications/counts', { params })
}

export const breadcrumbsApi = {
  find: (id, type) => $http2('/api/breadcrumbs', { params: { id, type } })
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
  invitations: {
    all: query => $http('/api/invites', { params: query }),
    resend: data => $http('/api/invites/resend', { method: 'POST', data }),
    remove: data => $http('/api/invites/remove', { method: 'POST', data })
  },
  logs: {
    page: params => $http('/api/admin/modlog', { params })
  },
  roles: {
    all: () => $http('/api/admin/roles/all'),
    users: (id, query) => $http(`/api/admin/roles/${id}/users`, { params: query }),
    reprioritize: data => $http(`/api/admin/roles/reprioritize`, { method: 'PUT', data }),
    addUsers: data => $http(`/api/users/roles/add`, { method: 'PUT', data }),
    removeUser: data => $http(`/api/users/roles/remove`, { method: 'PUT', data }),
    add: data => $http(`/api/admin/roles/add`, { method: 'POST', data }),
    update: data => $http(`/api/admin/roles/update`, { method: 'PUT', data }),
    delete: id => $http(`/api/admin/roles/remove/${id}`, { method: 'DELETE' })
  },
  bans: {
    pageBannedAddresses: params => $http('/api/ban/addresses', { params }),
    addBannedAddresses: data => $http('/api/ban/addresses', { method: 'POST', data}),
    editBannedAddress: data => $http('/api/ban/addresses', { method: 'PUT', data}),
    deleteBannedAddress: query => $http('/api/ban/addresses', { method: 'DELETE', params: query }),
    pageByBannedBoards: params => $http('/api/users/banned', { params })
  },
  trust: {
    getDefaultTrustList: () => $http('/api/admin/trustlist'),
    editDefaultTrustList: data => $http('/api/admin/trustlist', { method: 'POST', data }),
    deleteTrustBoard: data => $http(`/api/admin/trustboards/${data.board_id}`, { method: 'DELETE' }),
    addTrustBoard: data => $http('/api/admin/trustboards', { method: 'POST', data })
  },
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
    upsert: data => $http('/api/rank', { method: 'PUT', data })
  },
  autoModeration: {
    getRules: () => $http('/api/automoderation/rules'),
    addRule: data => $http('/api/automoderation/rules', { method: 'POST', data }),
    updateRule: data => $http(`/api/automoderation/rules/${data.id}`, { method: 'PUT', data }),
    deleteRule: data => $http(`/api/automoderation/rules/${data.id}`, { method: 'DELETE' })
  },
  reports: {
    pageMessageReports: params => $http('/api/reports/messages', { params }),
    updateMessageReport: data => $http('/api/reports/messages', { method: 'PUT', data}),
    pageUserReports: params => $http('/api/reports/users', { params }),
    updateUserReport: data => $http('/api/reports/users', { method: 'PUT', data}),
    pagePostReports: params => $http('/api/reports/posts', { params }),
    updatePostReport: data => $http('/api/reports/posts', { method: 'PUT', data}),
    pageMessageNotes: (id, params) => $http(`/api/reports/messagenotes/${id}`, { params }),
    pageUserNotes: (id, params) => $http(`/api/reports/usernotes/${id}`, { params }),
    pagePostNotes: (id, params) => $http(`/api/reports/postnotes/${id}`, { params }),
    updateMessageNote: data => $http('/api/reports/messagenotes', { method: 'PUT', data}),
    updateUserNote: data => $http('/api/reports/usernotes', { method: 'PUT', data}),
    updatePostNote: data => $http('/api/reports/postnotes', { method: 'PUT', data}),
    createMessageNote: data => $http('/api/reports/messagenotes', { method: 'POST', data}),
    createUserNote: data => $http('/api/reports/usernotes', { method: 'POST', data}),
    createPostNote: data => $http('/api/reports/postnotes', { method: 'POST', data})
  }
}

export const adsApi = {
  get: () => $http('/api/ads'),
  getAnalytics: round => $http(`/api/ads/analytics/${round}`),
  create: data => $http('/api/ads', { method: 'POST', data }),
  duplicate: data => $http(`/api/ads/${data.id}/duplicate`, { method: 'POST', data }),
  update: data => $http(`/api/ads/${data.id}`, { method: 'PUT', data }),
  delete: data => $http(`/api/ads/${data.id}`, { method: 'DELETE' }),
  saveText: data => $http('/api/ads/text', { method: 'POST', data }),
  factoids: {
   create: data => $http('/api/ads/factoids', { method: 'POST', data }),
   update: data => $http(`/api/ads/factoids/${data.id}`, { method: 'PUT', data }),
   delete: data => $http(`/api/ads/factoids/${data.id}`, { method: 'DELETE' }),
   enable: data => $http(`/api/ads/factoids/${data.id}/enable`, { method: 'PUT', data }),
   disable: data => $http(`/api/ads/factoids/${data.id}/disable`, { method: 'PUT', data })
  },
  rounds: {
    create: () => $http('/api/ads/rounds', { method: 'POST' }),
    get: () => $http('/api/ads/rounds/info'),
    getRound: data => $http(`/api/ads/rounds/${data.roundNumber}`, { params: { type: data.type } }),
    rotate: data => $http('/api/ads/rounds/rotate', { method: 'POST', data })
  }
}
