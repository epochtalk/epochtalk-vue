import { toRefs, reactive, readonly } from 'vue'
import { without, intersection, isEmpty } from 'lodash'
import { useRoute, useRouter } from 'vue-router'

const s = reactive({ breadcrumbs: [] })

const $route = useRoute()
const $router = useRouter()
const $api = inject('$api')

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

const update = (msg, type) => {
  let breadcrumbs = [ pathLookup.home ]
  let path = $route.path
  let routeParams = $route.params

  // Handle 403 breadcrumb
  if ($route.name === '403' || $route.name ===  '503') {
    s.breadcrumbs = breadcrumbs
    Object.assign(s.breadcrumbs, breadcrumbs)
    return
  }

  // Strip query str params since stateParams includes query and route params together
  delete routeParams.limit
  delete routeParams.page
  delete routeParams.start
  delete routeParams.purged
  delete routeParams.field
  delete routeParams.desc

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
    const opts = {
      method: 'PUT',
      data: {
        username: user.username,
        ...updatedPrefs
      }
    }
    $api(`/api/breadcrumbs?id=${routeParams[idKey]}&type=${keyToType[idKey]}`)
    .then(partialCrumbs => {
      breadcrumbs = s.breadcrumbs.concat(partialCrumbs)
      Object.assign(s.breadcrumbs, breadcrumbs)
    })
  }
  // routeParams is empty, route is static
  else {
    var pathArr = path.split('/')
    // Shifting array by one to eliminate empty index
    pathArr.shift()
    for (var i = 0, len = pathArr.length; i < len; i++)  {
      var id = pathArr[i]
      var crumb = pathLookup[id] || { label: id }
      breadcrumbs.push(crumb)
      // ignore following crumbs if ignoreFollowing is true
      if (crumb.ignoreFollowing) { break }
    }
    // Special case for extended profile pages. Allows link back to user
    // profile from breadcrumbs
    if (breadcrumbs[1].label === pathLookup.profiles.label && breadcrumbs.length > 3) {
      breadcrumbs[2].state = '^.profile.posts'
      breadcrumbs[2].opts = { username: breadcrumbs[2].label }
    }
    Object.assign(s.breadcrumbs, breadcrumbs)
  }
}

const updateLabelInPlace = newLabel => s.breadcrumbs[s.breadcrumbs.length - 1].label = newLabel

const crumbs = () => {
  if (breadcrumbsStore) {
    for (var i = 0; i < breadcrumbsStore.length; i++) {
      breadcrumbsStore[i].label = decodeURIComponent(breadcrumbsStore[i].label.replace(/%/g, '%25'))
    }
  }
  return breadcrumbsStore
}

export default readonly({ ...toRefs(s), update, updateLabelInPlace, crumbs });
