import useSWRV from 'swrv'

export const boardsApi = {
  slugToBoardId: (http, slug) => {
    return http(`/api/boards/${slug}/id`)
  },
  getBoards: (http, { config, processBoardsCallback }) => {
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
  byBoard: (http, opts) => {
    return http('/api/threads', opts)
  }
}

export const authApi = {
  login: (http, opts, handleErrors) => { return http('/api/login', opts, handleErrors) },
  logout: (http, opts, handleErrors) => { return http('/api/logout', opts, handleErrors) },
  register: (http, opts, handleErrors) => { return http('/api/register', opts, handleErrors) },
  emailAvailable: (http, val) => { return http(`/api/register/email/${val}`) },
  usernameAvailable: (http, val) => { return http(`/api/register/username/${val}`) }
}

export const usersApi = {
  search: (http, username) => {
    return http(`/api/users/search?username=${username}`)
  },
  update: (http, userId, opts) => {
    return http(`/api/users/${userId}`, opts)
  },
  preferences: (http) => {
    return http('/api/users/preferences')
  }
}

export const breadcrumbsApi = {
  find: (http, id, type) => {
    return http(`/api/breadcrumbs?id=${id}&type=${type}`)
  }
}

export const adminApi = {
  moderators: {
    remove: (http, opts) => {
      return http('/api/admin/moderators/remove', opts)
    },
    add: (http, opts) => {
      return http('/api/admin/moderators', opts)
    }
  }
}
