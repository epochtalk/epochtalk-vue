import { provide, inject } from 'vue'

const API_KEY = 'api'

export const ApiStore = Symbol(API_KEY)

export default {
  name: 'Api',
  setup() {
    /* internal methods */
    const api = (path, opts) => {

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

    /* provided methods */
    const boards = path => { return api(path) }
    const login = opts => { return api('/api/login', opts) }
    const register = opts => { return api('/api/register', opts) }
    const usersPreferences = () => { return api('/api/users/preferences') }

    /* internal data */
    const $axios = inject('$axios')

    return provide(ApiStore, {
      boards,
      login,
      register,
      usersPreferences
    })
  },
  render() { return this.$slots.default() } // renderless component
}
