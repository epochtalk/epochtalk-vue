<template>
  <!-- Column One -->
  <div>
    <div>
      <!-- Black List -->
      <h5 class="thin-underline section-header-top-spacing">IP Blacklist Rules
        <span class="info-tooltip" data-balloon="Adding an IP address/range/wildcard to the blacklist will disallow users with that specific IP or in that IP Range from loading the forum or its data" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        <a @click="showBlacklistAddModal = true" class="right"><i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rule</a></h5>

      <table class="striped rulesTable" width="100%">
        <thead>
          <th>Rule Name</th>
          <th>Rule</th>
          <th>Actions</th>
        </thead>
        <tbody v-if="!blacklist.length">
          <tr>
            <td colspan="3">
              <h6>There are currently no IP blacklist rules. Click "+ Add Rule" above to create a new rule.</h6>
            </td>
          </tr>
        </tbody>
        <tbody v-if="blacklist.length">
          <tr v-for="rule in blacklist" :key="rule.id">
            <td class="name" v-html="rule.note"></td>
            <td v-html="replace(rule.ip_data, '-', ' - ')"></td>
            <td>
              <a @click="showBlacklistEditModal(rule)"><i class="fa fa-pencil"></i></a>
              &nbsp;&nbsp;&nbsp;
              <a @click="selectedBlacklistRule = rule; showBlacklistDeleteModal = true"><i class="fa fa-trash"></i></a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div>
      <h5 class="thin-underline section-header-top-spacing">Rank Management
        <span class="info-tooltip" data-balloon="Allows forum owners to create a rank, which is a title associated with a post count" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        <a @click="showRankAddModal = true" class="right"><i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rank</a></h5>

      <table class="striped rulesTable" width="100%">
        <thead>
          <th>Rank Name</th>
          <th>Minimum Post Count</th>
          <th>Actions</th>
        </thead>
        <tbody v-if="!ranks.length">
          <tr>
            <td colspan="3">
              <h6>There are currently no ranks. Click "+ Add Rank" above to create a new rank.</h6>
            </td>
          </tr>
        </tbody>
        <tbody v-if="ranks.length">
          <tr v-for="rank in ranks" :key="rank.post_count">
            <td class="name" v-html="rank.name"></td>
            <td v-html="rank.post_count"></td>
            <td>
              <a @click="selectedRank = rank; editedRank = { name: rank.name, post_count: rank.post_count }; showRankEditModal = true"><i class="fa fa-pencil"></i></a>
              &nbsp;&nbsp;&nbsp;
              <a @click="selectedRank = rank; showRankDeleteModal = true"><i class="fa fa-trash"></i></a>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <div v-if="canViewAutoModRules()">
      <h5 class="thin-underline section-header-top-spacing">
        Auto Moderation Rules
        <span class="info-tooltip" data-balloon="Allows forum owners to set up rules which will auto detect keywords or phrases and take a predesignated action without the intervention of a human moderator" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        <a @click="createAutoModRule()" class="right" v-if="canCreateAutoModRule()">
          <i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rule
        </a>
      </h5>

      <table class="striped rulesTable" width="100%">
        <thead>
          <th>Rule Name</th>
          <th>Rule Description</th>
          <th>Actions</th>
        </thead>
        <tbody v-if="!rules.length">
          <tr>
            <td colspan="3">
              <h6>There are currently no auto moderation rules. Click "+ Add Rule" above to create a new rule.</h6>
            </td>
          </tr>
        </tbody>
        <tbody v-if="rules.length">
          <tr v-for="rule in rules" :key="rule.id">
            <td class="name" ng-bind-html="rule.name"></td>
            <td v-html="rule.description"></td>
            <td>
              <a @click="viewAutoModRule(rule)" v-if="canEditAutoModRule()">
                <i class="fa fa-pencil"></i>
              </a>
              &nbsp;&nbsp;&nbsp;
              <a @click="deleteAutoModRule(rule)" v-if="canDeleteAutoModRule()">
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
          <input type="text" class="input-text" id="get-interval" ng-model="config.rate_limiting.get.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="get-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-max-in-interval" ng-model="config.rate_limiting.get.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="get-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-min-difference" ng-model="config.rate_limiting.get.min_difference" placeholder="In MS (Ex: 100)" />
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
          <input type="text" class="input-text" id="post-interval" ng-model="config.rate_limiting.post.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="post-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-max-in-interval" ng-model="config.rate_limiting.post.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="post-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-min-difference" ng-model="config.rate_limiting.post.min_difference" placeholder="In MS (Ex: 100)" />
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
          <input type="text" class="input-text" id="put-interval" ng-model="config.rate_limiting.put.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="put-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-max-in-interval" ng-model="config.rate_limiting.put.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="put-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-min-difference" ng-model="config.rate_limiting.put.min_difference" placeholder="In MS (Ex: 100)" />
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
          <input type="text" class="input-text" id="delete-interval" ng-model="config.rate_limiting.delete.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="delete-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-max-in-interval" ng-model="config.rate_limiting.delete.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="delete-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-min-difference" ng-model="config.rate_limiting.delete.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <trust-admin-settings></trust-admin-settings>
  </div>

  <div class="full-width">
    <trust-list admin="true"></trust-list>
  </div>
  <!-- Full Row -->
  <div class="full-width ad-settings">
    <ad-manager></ad-manager>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted } from 'vue'
import { adminApi } from '@/api'
import EventBus from '@/composables/services/event-bus'
import replace from '@/composables/filters/replace'
import TrustAdminSettings from '@/components/trust/TrustAdminSettings.vue'
import TrustList from '@/components/trust/TrustList.vue'
import AdManager from '@/components/admin/settings/AdManager.vue'

export default {
  name: 'AdvancedSettings',
  components: { TrustAdminSettings, TrustList, AdManager },
  beforeRouteEnter(to, from, next) {
    adminApi.configurations().then(data => next(vm => {
      vm.config = data
      adminApi.blacklist.get().then(bl => vm.blacklist = bl)
      adminApi.ranks.get().then(ranks => vm.ranks = ranks)
      adminApi.autoModeration.getRules().then(rules => vm.rules = rules)
    }))
  },
  beforeRouteUpdate(to, from, next) {
    adminApi.configurations().then(data => {
      this.config = data
      adminApi.blacklist.get().then(bl => this.blacklist = bl)
      adminApi.ranks.get().then(ranks => this.ranks = ranks)
      adminApi.autoModeration.getRules().then(rules => this.rules = rules)
      next()
    })
  },
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
    const showBlacklistEditModal = () => {}

    const createAutoModRule = () => {}
    const viewAutoModRule = () => {}
    const deleteAutoModRule = () => {}
    const canDeleteAutoModRule = () => true
    const canViewAutoModRules = () => true
    const canCreateAutoModRule = () => true
    const canEditAutoModRule = () => true

    const v = reactive({
      config: null,
      originalConfig: null,
      blacklist: [],
      ranks: [],
      rules: [],
      showBlacklistEditModal: false,
      showBlacklistDeleteModal: false,
      selectedBlacklistRule: null,
      showRankAddModal: false,
      showRankEditModal: false,
      showRankDeleteModal: false,
      selectedRank: null,
      editRank: null
    })
    return { ...toRefs(v), replace, showBlacklistEditModal, canViewAutoModRules, canCreateAutoModRule, createAutoModRule, viewAutoModRule, canEditAutoModRule, deleteAutoModRule, canDeleteAutoModRule }
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
