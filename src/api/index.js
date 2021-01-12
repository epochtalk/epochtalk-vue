import { provide, inject } from 'vue'
import useSWRV from 'swrv'

const API_KEY = 'api'

export const Api = Symbol(API_KEY)

export default {
  name: 'Api',
  setup() {
    /* internal methods */
    const api = (path, opts, handleErrors) => {

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

      return req.then(res => res.status === 200 ? res.data : res)
    }

    /* provided methods */
    const boards = {
      getBoards: (config, processBoardsCallback) => {
        let result = api('/api/boards')
        // use processor if available
        if (processBoardsCallback) {
          result = result.then(processBoardsCallback)
        }
        return useSWRV(`/api/boards`, () => result, config)
      }
    }

    const login = opts => { return api('/api/login', opts) }
    const register = opts => { return api('/api/register', opts) }
    const usersPreferences = () => { return api('/api/users/preferences') }

    /* internal data */
    const $axios = inject('$axios')

    /* Provide API request util */
    return provide(Api, {
      boards,
      login,
      register,
      usersPreferences
    })
  },
  render() { return this.$slots.default() } // renderless component
}
