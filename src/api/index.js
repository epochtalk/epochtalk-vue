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
const user = $auth ? $auth.data : undefined
if (user) { $axios.defaults.headers.common['Authorization'] = `BEARER ${user.token}` }

/* provided methods */
const http = (path, opts, handleErrors) => {
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
  slugToBoardId: slug => http(`/api/boards/${slug}/id`),
  getBoards: () => http('/api/boards')
}

export const threadsApi = {
  byBoard: data => http('/api/threads', { data: data })
}

export const authApi = {
  login: (data, handleErrors) => {
    return http('/api/login', { method: 'POST', data: data }, handleErrors)
    .then(dbUser => {
      $axios.defaults.headers.common['Authorization'] = `BEARER ${dbUser.token}`
      return dbUser
    })
  },
  logout: handleErrors => {
    return http('/api/logout', { method: 'DELETE' }, handleErrors)
    .then(dbUser => {
      delete $axios.defaults.headers.common['Authorization']
      return dbUser
    })
  },
  register: (data, handleErrors) => {
    return http('/api/register', { method: 'POST', data: data }, handleErrors)
    .then(dbUser => {
      $axios.defaults.headers.common['Authorization'] = `BEARER ${dbUser.token}`
      return dbUser
    })
  },
  emailAvailable: email => http(`/api/register/email/${email}`),
  usernameAvailable: username => http(`/api/register/username/${username}`)
}

export const usersApi = {
  search: username => http(`/api/users/search?username=${username}`),
  update: (userId, data) => {
    return http(`/api/users/${userId}`, { method: 'PUT', data: data })
  },
  preferences: () => http('/api/users/preferences')
}

export const breadcrumbsApi = {
  find: (id, type) => {
    return http(`/api/breadcrumbs?id=${id}&type=${type}`)
  }
}

export const adminApi = {
  moderators: {
    remove: data => http('/api/admin/moderators/remove', { method: 'POST', data: data }),
    add: data => http('/api/admin/moderators', { method: 'POST', data: data })
  }
}
