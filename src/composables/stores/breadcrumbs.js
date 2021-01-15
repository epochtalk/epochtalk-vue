import { provide, inject, reactive, toRefs, readonly } from 'vue'
import { without, intersection, isEmpty, cloneDeep } from 'lodash'
import { useRoute, useRouter } from 'vue-router'

const BREADCRUMBS_KEY = 'breadcrumbs'

export const BreadcrumbStore = Symbol(BREADCRUMBS_KEY)

export default {
  setup() {
    const store = reactive({ breadcrumbs: [] })

    const $route = useRoute()
    const $router = useRouter()
    const $api = inject('$api')

    $router.afterEach(async () => { Object.assign(store.breadcrumbs, await update()) })

    const pathLookup = {
      home: {
        state: '^.home',
        routeName: 'Boards',
        label: 'Home'
      },
      profiles: {
        label: 'Profiles'
      },
      reset: {
        label: 'Reset Password',
        ignoreFollowing: true
      },
      confirm: {
        label: 'Account Confirmation',
        ignoreFollowing: true
      }
    }

    const update = async () => {
      let newCrumbs = cloneDeep([])
      newCrumbs.push(pathLookup.home)
      let path = $route.path
      let routeParams = $route.params

      // Handle 403 breadcrumb
      if ($route.name === '403' || $route.name ===  '503') return


      // Strip query str params since stateParams includes query and route params together
      delete routeParams.limit
      delete routeParams.page
      delete routeParams.start
      delete routeParams.purged
      delete routeParams.field
      delete routeParams.desc
      delete routeParams.boardId

      // Maps routeParams key to breadcrumb type
      var keyToType = {
        boardSlug:  'board',
        slug: 'thread',
      }
      // remove anchor hash from params
      var routeParamKeys = without(Object.keys(routeParams), '#')
      var keys = Object.keys(keyToType)
      var matches = intersection(routeParamKeys, keys)

      // matches, route is dynamic
      if (!isEmpty(matches)) {
        var idKey = routeParamKeys.reverse()[0]
        newCrumbs = await $api(`/api/breadcrumbs?id=${routeParams[idKey]}&type=${keyToType[idKey]}`)
        .then(partialCrumbs => newCrumbs.concat(partialCrumbs))
      }
      // routeParams is empty, route is static
      else if (path !== '/') {
        var pathArr = path.split('/')
        console.log('a', pathArr)

        // Shifting array by one to eliminate empty index
        pathArr.shift()
        console.log('b', pathArr)
        for (let i = 0, len = pathArr.length; i < len; i++)  {
          var id = pathArr[i]
          var crumb = pathLookup[id] || { label: id }
          newCrumbs.push(crumb)
          // ignore following crumbs if ignoreFollowing is true
          if (crumb.ignoreFollowing) { break }
        }

        // Special case for extended profile pages. Allows link back to user
        // profile from breadcrumbs
        if (newCrumbs[1].label === pathLookup.profiles.label && newCrumbs.length > 3) {
          newCrumbs[2].state = '^.profile.posts'
          newCrumbs[2].opts = { username: newCrumbs[2].label }
        }
      }
      if (newCrumbs) {
        for (let x = 0; x < newCrumbs.length; x++) {
          newCrumbs[x].label = decodeURIComponent(newCrumbs[x].label.replace(/%/g, '%25'))
        }
      }
      return newCrumbs
    }

    const updateLabelInPlace = newLabel => store.breadcrumbs[store.breadcrumbs.length - 1].label = newLabel

    return provide(BreadcrumbStore,  readonly({ ...toRefs(store), update, updateLabelInPlace }))
  },
  render() { return this.$slots.default() } // renderless component
}
