<template>
  <div class="trust-main">
    <h1 class="view-title">Trust Settings for {{authedUser.username}}</h1>

    <trust-list :success="trustListCallback()" :trust-list="trustData.trustList" :untrust-list="trustData.untrustList" :max="trustData.maxDepth"></trust-list>

    <div class="trust-section">
      <div class="trust-network-section">
        <span class="section-header">Trust Network ( {{hierarchy ? 'Hierarchical' : 'Depth'}} View )
        </span>

        <a class="remove-active right" href="#" @click="changeTrustView()"><i class="fa fa-retweet"></i> Change to {{!hierarchy ? 'Hierarchical' : 'Depth'}} View</a>
      </div>

        <span v-if="!hierarchy">
          <ul class="depth-tree" v-for="level in trustTree" :key="level">
            <li><h3 class="">Depth {{level.depth}}</h3></li>
            <ul>
              <li v-for="user in level.users" :key="user.username">
                {{user.username}} ({{user.level_trust}})
              </li>
            </ul>
          </ul>
        </span>

        <div v-if="hierarchy">
          <ul class="depth-tree">
            <trust-hierarchy-partial :trust-tree="trustTree" />
          </ul>
        </div>

    </div>
  </div>

  <div class="trust-secondary"></div>
</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import { usersApi } from '@/api'
// import TrustDisplay from '@/components/trust/TrustDisplay.vue'
import { AuthStore } from '@/composables/stores/auth'
// import TrustFeedbackModal from '@/components/modals/trust/Feedback.vue'
import TrustList from '@/components/trust/TrustList.vue'
import TrustHierarchyPartial from '@/components/trust/TrustHierarchyPartial.vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'TrustSettings',
  components: { TrustList, TrustHierarchyPartial },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.hierarchy = to.query.hierarchy
      usersApi.trust.getTrustList()
      .then(d => vm.trustData = d)
      .catch(() => {})
      usersApi.trust.getTrustTree({ hierarchy: to.query.hierarchy })
      .then(d => vm.trustTree = d)
      .catch(() => {})
    })
  },
  beforeRouteUpdate(to, from, next) {
    this.hierarchy = to.query.hierarchy
    usersApi.trust.getTrustList()
      .then(d => this.trustData = d)
      .catch(() => {})
    usersApi.trust.getTrustTree({ hierarchy: to.query.hierarchy })
      .then(d => this.trustTree = d)
      .catch(() => {})
    next()
  },
  setup() {
    const changeTrustView = () => {
      let query = { hierarchy: v.hierarchy }
      if (query.hierarchy) delete query.hierarchy
      else query.hierarchy = true
      $router.replace({ name: $route.name, params: { ...$route.params, saveScrollPos: true }, query })
    }

    const trustListCallback = () => console.log('trustListCallback')

    const $auth = inject(AuthStore)
    const $router = useRouter()
    const $route = useRoute()

    const v = reactive({
      authedUser: $auth.user,
      trustData: {},
      trustTree: [],
      hierarchy: false
    })

    return { ...toRefs(v), changeTrustView, trustListCallback }
  }
}
</script>
