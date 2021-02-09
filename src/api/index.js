import useSWRV from 'swrv'
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
  getBoards: ({ config, processBoardsCallback }) => {
    if (config) {
      let result = http('/api/boards')
      // use processor if available
      if (processBoardsCallback) {
        result = result.then(processBoardsCallback)
      }
      return useSWRV(`/api/boards`, () => result, config)
    }
    else {
      return () => {
        return http('/api/boards')
        .then(processBoardsCallback)
      }
    }
  }
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
  emailAvailable: val => http(`/api/register/email/${val}`),
  usernameAvailable: val => http(`/api/register/username/${val}`)
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
