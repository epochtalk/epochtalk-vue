<template>
  <div class="full-width">
    <div class="admin-table-header log-filter">
      <span>Show me</span>
      <span data-balloon="Mod Username, IP or ID">
        <input v-model="filter.mod" @keydown="$event.which === 13 && filterResults()" type="text" placeholder="Any Moderator"/>
      </span>

      <span>who</span>

      <span data-balloon="Mod Action Performed">
        <select @keydown="$event.which === 13 && filterResults()" v-model="filter.action" ng-options="action.value as action.desc group by action.group for action in ModerationCtrl.actionTypes">
          <option value="">Did Anything</option>
        </select>
      </span>

      <span>with</span>

      <span data-balloon="Mod Action Keyword">
        <input @keydown="$event.which === 13 && filterResults()" type="text" v-model="filter.keyword" placeholder="Keyword" />
      </span>
      <span data-balloon="Optional Date Range">
        <select v-model="selectedDateFilterType" ng-options="k as v for (k, v) in ModerationCtrl.dateFilterTypes" @change="filter.bdate = undefined;filter.adate = undefined;filter.sdate = undefined;filter.edate = undefined">
          <option value="">At Anytime</option>
        </select>
      </span>

      <span v-show="selectedDateFilterType === 'after'" data-balloon="After Date">
        <input @keydown="$event.which === 13 && filterResults()" v-model="filter.adate" type="date" />
      </span>

      <span v-show="selectedDateFilterType === 'before'" data-balloon="Before Date">
        <input @keydown="$event.which === 13 && filterResults()" v-model="filter.bdate" type="date" />
      </span>

      <div class="inline-block" v-show="selectedDateFilterType === 'between'" >
        <span data-balloon="Start Date">
          <input v-model="filter.sdate" type="date" />
        </span>
        <span>and</span>
        <span data-balloon="End Date">
          <input @keydown="$event.which === 13 && filterResults()" v-model="filter.edate" type="date" />
        </span>
      </div>

      <button :disabled="disableFilter()" @click="filterResults()">Filter</button>
      <button :disabled="disableClear()" @click="clearFilter()">Clear</button>
    </div>
    <div class="logs-content fill-row centered-text" v-if="!logData">
      <h4>No logs to display</h4>
    </div>
    <div class="logs-content fill-row" v-if="logData">
      <pre>{{JSON.stringify(config, null, 2)}}</pre>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { adminApi } from '@/api'

export default {
  name: 'LogModeration',
  beforeRouteEnter(to, from, next) {
    adminApi.configurations().then(data => next(vm => vm.config = data))
  },
  beforeRouteUpdate(to, from, next) {
    adminApi.configurations().then(data => {
      this.config = data
      next()
    })
  },
  setup() {
    const filterResults = () => console.log('filterResults')
    const clearFilter = () => console.log('clearFilter')
    const disableFilter = () => false
    const disableClear = () => false

    const v = reactive({
      config: {},
      logData: {},
      filter: {},
      selectedDateFilterType: null
    })
    return { ...toRefs(v), filterResults, clearFilter, disableClear, disableFilter }
  }
}
</script>

<style lang="scss">
.admin-table-header {
  background-color: $sub-header-color;
  position: absolute;
  left: 0;
  right: 0;
  padding: 2rem;
  padding-top: 2rem;
  top: 0.4rem;
  @include break-mobile-sm { padding: 1.25rem 1rem 0; margin: 0 -1rem 2rem; }
}
.log-filter {
  span { display: inline-block; margin-bottom: 0.5rem; }
  input, select { margin:0; height: 2rem; line-height: 1rem; padding: 0 0.25rem; width: auto; display: inline-block; }
  select { padding-right: 1.5rem; }
  button {
    display: inline-block;
    margin-right: 0.2rem;
    padding: 0 1.8rem;
    line-height: 2rem;
    height: 2rem;
  }
  span { margin-right: 0.2rem; }
}
.logs-content {
  margin-top: 6rem;
}
</style>
