import useSWRV from 'swrv'

export const boards = {
  slugToBoardId: (api, slug) => {
    return api(`/api/boards/${slug}/id`)
  },
  getBoards: (api, config, processBoardsCallback) => {
    let result = api('/api/boards')
    // use processor if available
    if (processBoardsCallback) {
      result = result.then(processBoardsCallback)
    }
    return useSWRV(`/api/boards`, () => result, config)
  }
}

export const threads = {
  byBoard: (api, opts) => {
    return api('/api/threads', opts)
  }
}

export const auth = {
  login: (api, opts, handleErrors) => { return api('/api/login', opts, handleErrors) },
  logout: (api, opts, handleErrors) => { return api('/api/logout', opts, handleErrors) },
  register: (api, opts, handleErrors) => { return api('/api/register', opts, handleErrors) },
  emailAvailable: (api, val) => { return api(`/api/register/email/${val}`) },
  usernameAvailable: (api, val) => { return api(`/api/register/username/${val}`) }
}

export const users = {
  update: (api, userId, opts) => {
    return api(`/api/users/${userId}`, opts)
  },
  preferences: (api) => {
    return api('/api/users/preferences')
  }
}

export const apiBreadcrumbs = {
  find: (api, id, type) => {
    return api(`/api/breadcrumbs?id=${id}&type=${type}`)
  }
}

// {
//   boards,
//   breadcrumbs,
//   threads,
//   auth,
//   users
// }
