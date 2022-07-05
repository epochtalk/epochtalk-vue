<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <div class="row">
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="undefined" id="report-filter-0" v-model="query.filter" @click="setFilter()" />
            <label for="report-filter-0">All</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'pending'" id="report-filter-1" v-model="query.filter" @click="setFilter('pending')" />
            <label for="report-filter-1">Pending</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'reviewed'" id="report-filter-2" v-model="query.filter" @click="setFilter('reviewed')" />
            <label for="report-filter-2">Reviewed</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'ignored'" id="report-filter-3" v-model="query.filter" @click="setFilter('ignored')" />
            <label for="report-filter-3">Ignored</label>
          </div>
          <div class="moderation-messages radio-button column">
            <input type="radio" class="hide-radio" name="table-filter" :value="'badReport'" id="report-filter-4" v-model="query.filter" @click="setFilter('badReport')" />
            <label for="report-filter-4">Bad Report</label>
          </div>
        </div>
      </div>
      <div class="report-search column">
        <div class="nested-input-container" v-if="!query?.ip">
          <a v-if="query?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="searchReports()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchStr" type="text" id="search-reports" placeholder="Search reported messages" @keydown="$event.which === 13 && searchReports()" @keyup="$event.which === 27 && clearSearch()" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
// import { adminApi } from '@/api'

export default {
  name: 'MessageModeration',
  beforeRouteEnter(to, from, next) {
    next()
    // adminApi.configurations().then(data => next(vm => vm.config = data))
  },
  beforeRouteUpdate(to, from, next) {
    // adminApi.configurations().then(data => {
    //   this.config = data
    //   next()
    // })
    next()
  },
  setup() {
    const v = reactive({
      config: {},
      query: {},
      searchStr: null
    })
    const setFilter = () => console.log('setFilter')
    const clearSearch = () => console.log('clearSearch')
    const searchReports = () => console.log('searchReports')
    return { ...toRefs(v), setFilter, searchReports, clearSearch }
  }
}
</script>

<style lang="scss" scoped>
.admin-table-header {
  background-color: $sub-header-color;
  position: absolute;
  left: 0;
  right: 0;
  padding: 1rem;
  padding-top: 2rem;
  padding-bottom: 2rem;
  top: 0.4rem;
  .nested-input { margin-bottom: 0; }
  .radio-button label {
    text-align: center;
    height: 2.25rem;
    border-radius: 3px;
  }
  @include break-mobile-sm { padding: 1.25rem 1rem 0; margin: 0 -1rem 2rem; }
}
.row {
  display: flex;
  flex-flow: row;
  row-gap: 0;
}
.column { flex: 50%;}
</style>
