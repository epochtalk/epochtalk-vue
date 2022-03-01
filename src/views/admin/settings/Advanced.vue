<template>
  <!-- Column One -->
  <div>
    <div>
      <!-- Black List -->
      <h5 class="thin-underline section-header-top-spacing">IP Blacklist Rules
        <span class="info-tooltip" data-balloon="Adding an IP address/range/wildcard to the blacklist will disallow users with that specific IP or in that IP Range from loading the forum or its data" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        <a ng-click="vmBlacklist.showAddModal = true" class="right"><i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rule</a></h5>

      <table class="striped rulesTable" width="100%">
        <thead>
          <th>Rule Name</th>
          <th>Rule</th>
          <th>Actions</th>
        </thead>
        <tbody ng-if="!vmBlacklist.blacklist.length">
          <tr>
            <td colspan="3">
              <h6>There are currently no IP blacklist rules. Click "+ Add Rule" above to create a new rule.</h6>
            </td>
          </tr>
        </tbody>
        <tbody ng-if="vmBlacklist.blacklist.length" ng-repeat="rule in vmBlacklist.blacklist track by rule.id">
          <tr>
            <td class="name" ng-bind="rule.note"></td>
            <td ng-bind-html="rule.ip_data | replace: '-' : ' - ' "></td>
            <td>
              <a ng-click="vmBlacklist.openEditModal(rule)"><i class="fa fa-pencil"></i></a>
              &nbsp;&nbsp;&nbsp;
              <a ng-click="vmBlacklist.selectedRule = rule; vmBlacklist.showDeleteModal = true"><i class="fa fa-trash"></i></a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
      <h5 class="thin-underline section-header-top-spacing">Rank Management
        <span class="info-tooltip" data-balloon="Allows forum owners to create a rank, which is a title associated with a post count" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        <a ng-click="vm.showAddModal = true" class="right"><i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rank</a></h5>

      <table class="striped rulesTable" width="100%">
        <thead>
          <th>Rank Name</th>
          <th>Minimum Post Count</th>
          <th>Actions</th>
        </thead>
        <tbody ng-if="!vm.ranks.length">
          <tr>
            <td colspan="3">
              <h6>There are currently no ranks. Click "+ Add Rank" above to create a new rank.</h6>
            </td>
          </tr>
        </tbody>
        <tbody ng-if="vm.ranks.length" ng-repeat="rank in vm.ranks track by rank.post_count">
          <tr>
            <td class="name" ng-bind-html="rank.name"></td>
            <td ng-bind-html="rank.post_count"></td>
            <td>
              <a ng-click="vm.selectedRank = rank; vm.editedRank = { name: rank.name, post_count: rank.post_count }; vm.showEditModal = true"><i class="fa fa-pencil"></i></a>
              &nbsp;&nbsp;&nbsp;
              <a ng-click="vm.selectedRank = rank; vm.showDeleteModal = true"><i class="fa fa-trash"></i></a>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <div ng-if="vm.canViewRules()">
      <h5 class="thin-underline section-header-top-spacing">
        Auto Moderation Rules
        <span class="info-tooltip" data-balloon="Allows forum owners to set up rules which will auto detect keywords or phrases and take a predesignated action without the intervention of a human moderator" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        <a ng-click="vm.createRule()" class="right" ng-if="vm.canCreateRule()">
          <i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rule
        </a>
      </h5>

      <table class="striped rulesTable" width="100%">
        <thead>
          <th>Rule Name</th>
          <th>Rule Description</th>
          <th>Actions</th>
        </thead>
        <tbody ng-if="!vm.rules.length">
          <tr>
            <td colspan="3">
              <h6>There are currently no auto moderation rules. Click "+ Add Rule" above to create a new rule.</h6>
            </td>
          </tr>
        </tbody>
        <tbody ng-if="vm.rules.length" ng-repeat="rule in vm.rules track by rule.id">
          <tr>
            <td class="name" ng-bind-html="rule.name"></td>
            <td ng-bind-html="rule.description"></td>
            <td>
              <a ng-click="vm.viewRule(rule)" ng-if="vm.canEditRule()">
                <i class="fa fa-pencil"></i>
              </a>
              &nbsp;&nbsp;&nbsp;
              <a ng-click="vm.deleteRule(rule)" ng-if="vm.canRemoveRule()">
                <i class="fa fa-trash"></i>
              </a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Column Two -->
  <div>
    <!-- Rate Limiting -->
    <h5 class="thin-underline section-header-top-spacing">API Rate Limiting (Global Defaults)
      <span class="info-tooltip" data-balloon="Allows the forum owners to apply rate limits to different types of data requests" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>

    <section class="boxed-section">
      <div class="header"><span class="get large">GET Requests</span></div>
      <div class="content input-three-col">
        <div>
          <label class="desc-label" for="get-interval">Interval
            <span class="info-tooltip" data-balloon="The amount of time to which you are limiting the number of request to (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.get.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="get-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-max-in-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.get.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="get-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-min-difference" ng-model="AdminSettingsCtrl.settings.rate_limiting.get.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <section class="boxed-section">
      <div class="header"><span class="post large">POST Requests</span></div>
      <div class="content input-three-col">
        <div>
          <label class="desc-label" for="post-interval">Interval
            <span class="info-tooltip" data-balloon="The amount of time to which you are limiting the number of request to (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.post.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="post-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-max-in-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.post.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="post-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-min-difference" ng-model="AdminSettingsCtrl.settings.rate_limiting.post.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <section class="boxed-section">
      <div class="header"><span class="put large">PUT Requests</span></div>
      <div class="content input-three-col">
        <div>
          <label class="desc-label" for="put-interval">Interval
            <span class="info-tooltip" data-balloon="The amount of time to which you are limiting the number of request to (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.put.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="put-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-max-in-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.put.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="put-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-min-difference" ng-model="AdminSettingsCtrl.settings.rate_limiting.put.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <section class="boxed-section">
      <div class="header"><span class="delete large">DELETE Requests</span></div>
        <div class="content input-three-col">
        <div>
          <label class="desc-label" for="delete-interval">Interval
            <span class="info-tooltip" data-balloon="The amount of time to which you are limiting the number of request to (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.delete.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="delete-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-max-in-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.delete.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="delete-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-min-difference" ng-model="AdminSettingsCtrl.settings.rate_limiting.delete.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <trust-admin-settings></trust-admin-settings>
  </div>

  <div class="full-width">
    <trust-list default-trust="true"></trust-list>
  </div>
  <!-- Full Row -->
  <div class="full-width ad-settings">
    <ad-manager></ad-manager>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted } from 'vue'
// import { adminApi, motdApi, boardsApi } from '@/api'
import EventBus from '@/composables/services/event-bus'
import TrustAdminSettings from '@/components/admin/settings/TrustAdminSettings.vue'
import TrustList from '@/components/admin/settings/TrustList.vue'
import AdManager from '@/components/admin/settings/AdManager.vue'

export default {
  name: 'AdvancedSettings',
  components: { TrustAdminSettings, TrustList, AdManager },
  // beforeRouteEnter(to, from, next) {
  //   adminApi.configurations().then(data => next(vm => {
  //     vm.config = data
  //     vm.originalConfig = cloneDeep(data)
  //     vm.localImageServer = data.images.storage === 'local'
  //     motdApi.get().then(mData => vm.motdData = mData)
  //     boardsApi.movelist()
  //     .then(ml => groupBy(ml, 'parent_name'))
  //     .then(movelist => vm.boardsMovelist = movelist)
  //   }))
  // },
  // beforeRouteUpdate(to, from, next) {
  //   adminApi.configurations().then(data => {
  //     this.config = data
  //     this.originalConfig = cloneDeep(data)
  //     this.localImageServer = data.images.storage === 'local'
  //     motdApi.get().then(mData => this.motdData = mData)
  //     boardsApi.movelist()
  //     .then(ml => groupBy(ml, 'parent_name'))
  //     .then(movelist => this.boardsMovelist = movelist)
  //     next()
  //   })
  // },
  setup() {
    const saveListener = () => console.log('save')
    const resetListener = () => console.log('reset')

    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })

    const v = reactive({

    })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">
  .advanced-settings .full-width { grid-column: 1/3; }
  .input-three-col {
    display: grid;
    grid-template-columns: auto auto auto;
    grid-column-gap: .5rem;
    @include break-mobile-med {
      grid-template-columns: unset;
    }
  }
</style>
