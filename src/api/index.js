import useSWRV from 'swrv'

export const boards = {
  slugToBoardIdApi: (http, slug) => {
    return http(`/api/boards/${slug}/id`)
  },
  getBoardsApi: (http, config, processBoardsCallback) => {
    let result = http('/api/boards')
    // use processor if available
    if (processBoardsCallback) {
      result = result.then(processBoardsCallback)
    }
    return useSWRV(`/api/boards`, () => result, config)
  }
}

export const threads = {
  byBoardApi: (http, opts) => {
    return http('/api/threads', opts)
  }
}

export const auth = {
  login: (http, opts, handleErrors) => { return http('/api/login', opts, handleErrors) },
  logout: (http, opts, handleErrors) => { return http('/api/logout', opts, handleErrors) },
  register: (http, opts, handleErrors) => { return http('/api/register', opts, handleErrors) },
  emailAvailable: (http, val) => { return http(`/api/register/email/${val}`) },
  usernameAvailable: (http, val) => { return http(`/api/register/username/${val}`) }
}

export const users = {
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

export const apiBreadcrumbs = {
  find: (http, id, type) => {
    return http(`/api/breadcrumbs?id=${id}&type=${type}`)
  }
}

export const admin = {
  moderators: {
    remove: (http, opts) => {
      return http('/api/admin/moderators/remove', opts)
    },
    add: (http, opts) => {
      return http('/api/admin/moderators', opts)
    }
  }
}
