import { provide, inject } from 'vue'
import { get } from 'lodash'

const API_KEY = 'api'

export const Api = Symbol(API_KEY)

export default {
  name: 'Api',
  setup() {
    /* provided methods */
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
          if (msg) { $alertStore.error(msg) }
          return Promise.reject(err)
        })
      }
      else { return reqPromise }
    }

    /* internal data */
    const $axios = inject('$axios')
    const $alertStore = inject('$alertStore')

    /* Provide API request util */
    return provide(Api, api)
  },
  render() { return this.$slots.default() } // renderless component
}
