<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <button @click="showBanAddress=true"><i class="fa fa-plus-circle"></i>&nbsp;Manually Ban Addresses</button>
      </div>
      <div class="user-search column">
        <div class="nested-input-container">
          <a v-if="banData?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchAddresses()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-users" placeholder="Search by IP Address" @keydown="$event.which === 13 && searchAddresses()" @keyup="$event.which === 27 && clearSearch()" />
        </div>
      </div>
    </div>
    <div class="banned-address-content fill-row centered-text" v-if="!query?.search && banData?.data?.length < 1">
      <h4>No Banned Addresses to display</h4>
    </div>
    <div class="banned-address-content fill-row" v-if="banData?.data?.length > 0 || query?.search">
      <table class="underlined" width="100%">
        <thead>
          <th>Address</th>
          <th class="pointer" @click="setSortField('weight')"><span :class="getSortClass('weight')"></span>&nbsp;Weight</th>
          <th class="pointer" @click="setSortField('created_at')"><span :class="getSortClass('created_at')"></span>&nbsp;Date Banned</th>
          <th class="pointer" @click="setSortField('decay')"><span :class="getSortClass('decay')"></span>&nbsp;Decays</th>
          <th class="pointer" @click="setSortField('updates')"><span :class="getSortClass('updates')"></span>Last Updated</th>
          <th class="pointer" @click="setSortField('update_count')"><span :class="getSortClass('update_count')"></span>&nbsp;Update Count</th>
          <th class="pointer" @click="setSortField('imported_at')"><span :class="getSortClass('imported_at')"></span>&nbsp;Date Imported</th>
          <th class="user-actions">Actions</th>
        </thead>
        <tbody>
          <tr v-for="address in banData?.data" :key="address">
            <td v-html="address.hostname || address.ip"></td>
            <td v-html="address.weight"></td>
            <td v-html="humanDate(address.created_at)"></td>
            <td v-html="address.decay ? 'YES' : 'NO'"></td>
            <td v-html="humanDate(address.updated_at) || 'N/A'"></td>
            <td v-html="address.update_count || 0"></td>
            <td v-html="humanDate(address.imported_at) || 'N/A'"></td>
            <td class=user-actions>
              <button class="icon" data-balloon="Edit Address" @click="editAddress(address)">
                <i class="fas fa-edit"></i>
              </button>

              <button class="icon" data-balloon="Delete Address" @click="deleteAddress(address)">
                <i class="fa fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-wrap" v-if="banData.prev || banData.next">
        <div class="pagination-simple">
          <button @click="pageResults(banData.prev)" :disabled="!banData.prev">&#10094; Prev</button>
          <button @click="pageResults(banData.next)" :disabled="!banData.next">Next &#10095;</button>
        </div>
      </div>
    </div>
  </div>
  <BannedAddressManagerModal :show="showBanAddress || showDeleteAddress || showEditAddress" :selected="selectedAddress" :ban-address="showBanAddress" :edit-address="showEditAddress" :delete-address="showDeleteAddress" @close="showBanAddress=showDeleteAddress=showEditAddress=false" @success="reloadData()"/>
</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { adminApi } from '@/api'
import humanDate from '@/composables/filters/humanDate'
import { AuthStore } from '@/composables/stores/auth'
import BannedAddressManagerModal from '@/components/modals/admin/management/BannedAddressManager.vue'

export default {
  name: 'BannedAddresses',
  components: { BannedAddressManagerModal },
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      field: to.query.field,
      desc: to.query.desc ? false : true,
      limit: Number(to.query.limit) || 15,
      page: Number(to.query.page) || 1,
      search: to.query.search
    }
    adminApi.bans.pageBannedAddresses(queryParams)
    .then(banData => next(vm => vm.banData = banData))
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      field: to.query.field,
      desc: to.query.desc ? false : true,
      limit: Number(to.query.limit) || 15,
      page: Number(to.query.page) || 1,
      search: to.query.search
    }
    adminApi.bans.pageBannedAddresses(queryParams)
    .then(banData => {
      this.banData = banData
      next()
    })
  },
  setup() {
    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page <= 1 || !query.page) delete query.page
      $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const reloadData = () => {
      let queryParams = {
        field: $route.query.field,
        desc: $route.query.desc ? false : true,
        limit: Number($route.query.limit) || 15,
        page: Number($route.query.page) || 1,
        search: $route.query.search
      }
      adminApi.bans.pageBannedAddresses(queryParams)
      .then(banData => v.banData = banData)
    }

    const editAddress = address => {
      v.selectedAddress = address
      v.showEditAddress = true
    }

    const deleteAddress = address => {
      v.selectedAddress = address
      v.showDeleteAddress = true
    }

    const setSortField = newField => {
      // Convert desc query param to boolean
      let desc = $route.query.desc === 'false' ? false : true
      // Sort Field hasn't changed just toggle desc
      const defaultField = newField === 'created_at' && !$route.query.field
      if (defaultField || newField === $route.query.field) desc = !desc
      else desc = true // Sort field changed, default to desc true
      // Update router to have new query params, watch on query params will update data
      let query = { limit: $route.query.limit, field: newField, page: $route.query.page, search: v.searchStr }
      if (!query.page) delete query.page // don't include page if undefined
      if (newField === 'created_at') delete query.field // do not display default field in qs
      if (!desc) query.desc = false // only display desc if false
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      if(!query.search) delete query.search
      $router.replace({ name: $route.name, params: params, query: query })
    }

    const getSortClass = field => {
      let sortClass = 'fa '
      const desc = v.banData?.desc
      const curField = v.banData?.field
      const defaultField = field === 'created_at' && !curField
      if ((defaultField || curField === field) && desc) sortClass += 'fa-sort-down'
      else if ((defaultField || curField === field) && desc === false) sortClass += 'fa-sort-up'
      else sortClass += 'fa-sort'
      return sortClass
    }

    const setFilter = filter => {
      let query = { filter: filter }
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      $router.replace({ name: $route.name, params, query: query })
    }

    const clearSearch = () => {
      let query = { ...$route.query }
      delete query.page
      delete query.search
      v.searchStr = ''
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      $router.replace({ name: $route.name, params, query: query })
    }

    const searchAddresses = () => {
      if (!v.searchStr) return
      let query = { ...$route.query, search: v.searchStr }
      delete query.page
      const params = { ...$route.params, saveScrollPos: true } // save scroll pos when sorting table
      $router.replace({ name: $route.name, params, query: query })
    }

    const $router = useRouter()
    const $route = useRoute()
    const $auth = inject(AuthStore)

    const v = reactive({
      controlAccess: $auth.permissionUtils.getModPanelControlAccess(),
      banData: {},
      currentPage: Number($route.query.page) || 1,
      nextPage: null,
      prevPage: null,
      addresses: [],
      count: 0,
      query: {},
      user: {},
      selectedAddress: null,
      showEditAddress: false,
      showDeleteAddress: false,
      showBanAddress: false,
      searchStr: $route.query.search
    })

    return { ...toRefs(v), pageResults, setFilter, getSortClass, setSortField, clearSearch, searchAddresses, humanDate, deleteAddress, reloadData, editAddress }
  }
}
</script>

<style lang="scss" scoped>
.banned-address-content { margin-top: 6rem; }
</style>
