import { inject } from 'vue'
const AUTH_KEY = 'auth'

export default {
  login: opts => { return api('/api/login', opts) },
  register: opts => { return api('/api/register', opts)}
}

const api = (path, opts) => {
  const $appCache = inject('$appCache')

  opts = opts || {}
  let auth = $appCache.get(AUTH_KEY)
  let user = auth && auth.data ? auth.data : undefined
  if (user && user.token) {
    opts.headers = {
      ...opts.headers,
      Authorization: `BEARER ${user.token}`
    }
  }
  console.log(path, opts.headers)
  return fetch(`http://localhost:8080${path}`, opts)
  .then(res => res.ok ? res.json() : res)
}
