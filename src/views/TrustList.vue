<template>
  <div class="trust-main">
    <h1 class="view-title">Trust Settings for {{authedUser.username}}</h1>

    <!-- <trust-list callback="TrustSettingsCtrl.trustListCallback"></trust-list> -->

    <div class="trust-section">
      <div class="trust-network-section">
        <span class="section-header">Trust Network ( {{hierarchy ? 'Hierarchical' : 'Depth'}} View )
        </span>

        <a class="remove-active right" href="#" @click="changeTrustView()"><i class="fa fa-retweet"></i> Change to {{!hierarchy ? 'Hierarchical' : 'Depth'}} View</a>
      </div>

        <ul v-if="!hierarchy" class="depth-tree" v-for="level in trustTree" :key="level">
          <li><h3 class="">Depth {{level.depth}}</h3></li>
          <ul>
            <li v-for="user in level.users" :key="user.username">
              {{user.username}} ({{user.level_trust}})
            </li>
          </ul>
        </ul>

        <div v-if="hierarchy">
<!--           <script type="text/ng-template" id="trustTree">
            <span ng-if="user.type === 0">{{ user.username_trusted }}</span>
            <span ng-if="user.type === 1"><s>{{ user.username_trusted }}</s></span>
            <ul ng-if="user.trusted">
              <li ng-repeat="user in user.trusted" ng-include="'trustTree'"></li>
            </ul>
          </script>
          <ul class="depth-tree">
            <li ng-repeat="user in TrustSettingsCtrl.trustTree" ng-include="'trustTree'">
            </li>
          </ul> -->
        </div>

    </div>
  </div>

  <div class="trust-secondary"></div>
</template>

<script>
import { reactive, toRefs, inject } from 'vue'
// import { usersApi } from '@/api'
// import TrustDisplay from '@/components/trust/TrustDisplay.vue'
// import { AuthStore } from '@/composables/stores/auth'
// import TrustFeedbackModal from '@/components/modals/trust/Feedback.vue'

export default {
  name: 'TrustList',
  // components: { TrustDisplay, TrustFeedbackModal },
  beforeRouteEnter(to, from, next) {
    next(vm => usersApi.find(to.params.username)
      .then(u => vm.user = u)
      .then(() => usersApi.trust.getTrustFeedback(to.params.username))
      .then(f => vm.userFeedback = f)
      .catch(() => {})
    )
  },
  beforeRouteUpdate(to, from, next) {
    usersApi.find(to.params.username)
      .then(u => this.user = u)
      .then(() => usersApi.trust.getTrustFeedback(to.params.username))
      .then(f => this.userFeedback = f)
      .catch(() => {})
    next()
  },
  setup(props) {
    const changeTrustView = () => console.log('changeTrustView')

    const $auth = inject(AuthStore)

    const v = reactive({
      authedUser: $auth.user,
      trustTree: [],
      hierarchy: false
    })

    return { ...toRefs(v), changeTrustView }
  }
}
</script>
