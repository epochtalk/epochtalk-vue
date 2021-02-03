import { provide, inject } from 'vue'
import { get } from 'lodash'

const HTTP_KEY = 'http'

export const Http = Symbol(HTTP_KEY)

export default {
  name: 'Http',
  setup() {
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
          if (msg) { $alertStore.error(msg) }
          return Promise.reject(err)
        })
      }
      else { return reqPromise }
    }

    /* internal data */
    const $axios = inject('$axios')
    const $alertStore = inject('$alertStore')

    /* Provide HTTP request util */
    return provide(Http, http)
  },
  render() { return this.$slots.default() } // renderless component
}
