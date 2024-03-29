<template>
  <!-- Column One -->
  <div>
    <div>
      <!-- Black List -->
      <h5 class="thin-underline section-header-top-spacing">IP Blacklist Rules
        <span class="info-tooltip" data-balloon="Adding an IP address/range/wildcard to the blacklist will disallow users with that specific IP or in that IP Range from loading the forum or its data" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        <a href="#" @click.prevent="showBlacklistAddModal = true" class="right"><i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rule</a></h5>

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
              <a @click="showBlacklistEditModal = true; selectedBlacklistRule = rule"><i class="fas fa-edit"></i></a>
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
        <a href="#" @click.prevent="showRankAddModal = true" class="right"><i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rank</a></h5>

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
              <a href="#" @click.prevent="selectedRank = rank; editedRank = { name: rank.name, post_count: rank.post_count }; showRankEditModal = true"><i class="fas fa-edit"></i></a>
              &nbsp;&nbsp;&nbsp;
              <a href="#" @click.prevent="selectedRank = rank; showRankDeleteModal = true"><i class="fa fa-trash"></i></a>
            </td>
          </tr>
        </tbody>
      </table>

    </div>

    <div v-if="canViewAutoModRules()">
      <h5 class="thin-underline section-header-top-spacing">
        Auto Moderation Rules
        <span class="info-tooltip" data-balloon="Allows forum owners to set up rules which will auto detect keywords or phrases and take a predesignated action without the intervention of a human moderator" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        <a href="#" @click.prevent="showAutoModAddModal = true" class="right" v-if="canCreateAutoModRule()">
          <i class="fa fa-plus"></i>&nbsp;&nbsp;Add Rule
        </a>
        <span v-if="!canCreateAutoModRule()" class="right"><i class="disabled fa fa-plus"></i>&nbsp;&nbsp;Add Rule</span>
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
            <td class="name" v-html="rule.name"></td>
            <td v-html="rule.description"></td>
            <td>
              <a href="#" @click.prevent="showAutoModEditModal = true; selectedAutoModRule = rule" v-if="canEditAutoModRule()">
                <i class="fas fa-edit"></i>
              </a>
              <span v-if="!canEditAutoModRule()"><i class="disabled fas fa-edit"></i></span>
              &nbsp;&nbsp;&nbsp;
              <a href="#" @click.prevent="showAutoModDeleteModal = true; selectedAutoModRule = rule" v-if="canDeleteAutoModRule()">
                <i class="fa fa-trash"></i>
              </a>
              <span v-if="!canDeleteAutoModRule()"><i class="disabled fa fa-trash"></i></span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- Column Two -->
  <div v-if="config">
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
          <input type="text" class="input-text" id="get-interval" v-model="config.rate_limiting.get.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="get-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-max-in-interval" v-model="config.rate_limiting.get.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="get-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-min-difference" v-model="config.rate_limiting.get.min_difference" placeholder="In MS (Ex: 100)" />
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
          <input type="text" class="input-text" id="post-interval" v-model="config.rate_limiting.post.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="post-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-max-in-interval" v-model="config.rate_limiting.post.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="post-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-min-difference" v-model="config.rate_limiting.post.min_difference" placeholder="In MS (Ex: 100)" />
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
          <input type="text" class="input-text" id="put-interval" v-model="config.rate_limiting.put.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="put-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-max-in-interval" v-model="config.rate_limiting.put.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="put-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-min-difference" v-model="config.rate_limiting.put.min_difference" placeholder="In MS (Ex: 100)" />
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
          <input type="text" class="input-text" id="delete-interval" v-model="config.rate_limiting.delete.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="delete-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-max-in-interval" v-model="config.rate_limiting.delete.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="delete-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-min-difference" v-model="config.rate_limiting.delete.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <trust-admin-settings></trust-admin-settings>
  </div>

  <div class="full-width">
    <trust-list :admin="true" :trust-list="defaultTrustData.trustList" :untrust-list="defaultTrustData.untrustList" :max="defaultTrustData.maxDepth"></trust-list>
  </div>
  <!-- Full Row -->
  <div class="full-width ad-settings">
    <ad-manager></ad-manager>
  </div>

   <blacklist-modal :show="showBlacklistAddModal || showBlacklistEditModal || showBlacklistDeleteModal" @close="showBlacklistAddModal = false; showBlacklistEditModal = false; showBlacklistDeleteModal = false" @success="reloadBlacklist" :selected="selectedBlacklistRule" :add="showBlacklistAddModal" :edit="showBlacklistEditModal" :remove="showBlacklistDeleteModal" />
   <rank-modal :show="showRankAddModal || showRankEditModal || showRankDeleteModal" @close="showRankAddModal = false; showRankEditModal = false; showRankDeleteModal = false" @success="reloadRanks" :selected="selectedRank" :add="showRankAddModal" :edit="showRankEditModal" :remove="showRankDeleteModal" :ranks="ranks" />
   <auto-moderation-modal :show="showAutoModAddModal || showAutoModEditModal || showAutoModDeleteModal" @close="showAutoModAddModal = false; showAutoModEditModal = false; showAutoModDeleteModal = false" @success="reloadAutoModeration" :selected="selectedAutoModRule" :add="showAutoModAddModal" :edit="showAutoModEditModal" :remove="showAutoModDeleteModal" />
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, inject } from 'vue'
import { adminApi } from '@/api'
import EventBus from '@/composables/services/event-bus'
import replace from '@/composables/filters/replace'
import TrustAdminSettings from '@/components/trust/TrustAdminSettings.vue'
import TrustList from '@/components/trust/TrustList.vue'
import AdManager from '@/components/admin/settings/AdManager.vue'
import { cloneDeep } from 'lodash'
import BlacklistModal from '@/components/modals/admin/settings/Blacklist.vue'
import RankModal from '@/components/modals/admin/settings/Rank.vue'
import AutoModerationModal from '@/components/modals/admin/settings/AutoModeration.vue'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'AdvancedSettings',
  components: { TrustAdminSettings, TrustList, AdManager, BlacklistModal, RankModal, AutoModerationModal },
  beforeRouteEnter(to, from, next) {
    adminApi.configurations().then(data => next(vm => {
      vm.config = data
      vm.originalConfig = cloneDeep(data)
      adminApi.blacklist.get().then(bl => vm.blacklist = bl)
      adminApi.ranks.get().then(ranks => vm.ranks = ranks)
      adminApi.autoModeration.getRules().then(rules => vm.rules = rules)
      adminApi.trust.getDefaultTrustList().then(td => vm.defaultTrustData = td)
    }))
  },
  beforeRouteUpdate(to, from, next) {
    adminApi.configurations().then(data => {
      this.config = data
      this.originalConfig = cloneDeep(data)
      adminApi.blacklist.get().then(bl => this.blacklist = bl)
      adminApi.ranks.get().then(ranks => this.ranks = ranks)
      adminApi.autoModeration.getRules().then(rules => this.rules = rules)
      adminApi.trust.getDefaultTrustList().then(td => this.defaultTrustData = td)
      next()
    })
  },
  setup() {
    /* Internal Methods */
    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })
    const saveListener = () => {
      adminApi.updateConfigurations(v.config)
      .then(() => $alertStore.success('Successfully updated rate limit settings!'))
      .catch(() => $alertStore.error('Error saving rate limit settings'))
    }
    const resetListener = () => v.config = cloneDeep(v.originalConfig)

    /* Template Methods */
    const reloadBlacklist = () => adminApi.blacklist.get().then(bl => v.blacklist = bl)
    const reloadRanks = () => adminApi.ranks.get().then(r => v.ranks = r)
    const reloadAutoModeration = () => adminApi.autoModeration.getRules().then(r => v.rules = r)

    const canDeleteAutoModRule = () => v.permUtils.hasPermission('autoModeration.removeRule.allow')
    const canViewAutoModRules = () => v.permUtils.hasPermission('autoModeration.rules.allow')
    const canCreateAutoModRule = () => v.permUtils.hasPermission('autoModeration.addRule.allow')
    const canEditAutoModRule = () => v.permUtils.hasPermission('autoModeration.editRule.allow')

    /* Internal Data */
    const $alertStore = inject('$alertStore')
    const $auth = inject(AuthStore)

    /* Template Data */
    const v = reactive({
      authedUser: $auth.user,
      config: null,
      permUtils: $auth.permissionUtils,
      originalConfig: null,
      defaultTrustData: {},
      blacklist: [],
      ranks: [],
      rules: [],
      showBlacklistAddModal: false,
      showBlacklistEditModal: false,
      showBlacklistDeleteModal: false,
      selectedBlacklistRule: null,
      showRankAddModal: false,
      showRankEditModal: false,
      showRankDeleteModal: false,
      selectedRank: null,
      showAutoModAddModal: false,
      showAutoModEditModal: false,
      showAutoModDeleteModal: false,
      selectedAutoModRule: null,
      editRank: null
    })
    return { ...toRefs(v), reloadBlacklist, reloadRanks, reloadAutoModeration, replace, canViewAutoModRules, canCreateAutoModRule, canEditAutoModRule, canDeleteAutoModRule }
  }
}
</script>

<style lang="scss">
  i.disabled { color: $secondary-font-color-light; }
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
