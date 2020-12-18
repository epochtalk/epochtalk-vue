import { inject } from 'vue'

export default {
  login: opts => { return api('/api/login', opts) },
  register: opts => { return api('/api/register', opts) },
  users: {
    preferences: () => { return api('/api/users/preferences') }
  }
}

const api = (path, opts) => {
  const $axios = inject('$axios')

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

  return req.then(res => res.status === 200 ? res.data : res)
}
