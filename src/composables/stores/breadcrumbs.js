import { toRefs, reactive, readonly } from 'vue'
import { without, intersection, isEmpty } from 'lodash'
const s = reactive({ breadcrumbs: [] })

const pathLookup = {
  home: {
    state: '^.home',
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
};

const update = (msg, type) => {
  let breadcrumbs = [ pathLookup.home ];
  let path = $location.path();
  let routeParams = $stateParams;

  // Handle 403 breadcrumb
  if ($state.current.name === '403' || $state.current.name ===  '503') {
    breadcrumbsStore = breadcrumbs;
    return;
  }

  // Strip query str params since stateParams includes query and route params together
  delete routeParams.limit;
  delete routeParams.page;
  delete routeParams.start;
  delete routeParams.purged;
  delete routeParams.field;
  delete routeParams.desc;

  // Maps routeParams key to breadcrumb type
  var keyToType = {
    boardSlug:  'board',
    slug: 'thread',
  };
  // remove anchor hash from params
  var routeParamKeys = without(Object.keys(routeParams), '#');
  var keys = Object.keys(keyToType);
  var matches = intersection(routeParamKeys, keys);
  // matches, route is dynamic
  if (!isEmpty(matches)) {
    var idKey = routeParamKeys.reverse()[0]
    Breadcrumbs.getBreadcrumbs({ id: routeParams[idKey], type: keyToType[idKey] },
    function(partialCrumbs) {
      breadcrumbs = breadcrumbs.concat(partialCrumbs)
      breadcrumbsStore = breadcrumbs
    })
  }
  // routeParams is empty, route is static
  else {
    var pathArr = path.split('/')
    // Shifting array by one to eliminate empty index
    pathArr.shift()
    for (var i = 0, len = pathArr.length; i < len; i++) {
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
    breadcrumbsStore = breadcrumbs
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

export default readonly({ ...toRefs(s), update });
