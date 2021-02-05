import { provide } from 'vue'
// import { get } from 'lodash'

const HTTP_KEY = 'http'

export const Http = Symbol(HTTP_KEY)

export default {
  name: 'Http',
  setup() {
    /* provided methods */


    /* internal data */
    // const $axios = inject('$axios')
    // const $alertStore = inject('$alertStore')

    /* Provide HTTP request util */
    return provide(Http, {})
  },
  render() { return this.$slots.default() } // renderless component
}
