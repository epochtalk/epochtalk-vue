<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <select name="boards" v-model="boardFilter" @change="applyFilter()" class="boards-select">
          <option :value="null">Filter by {{ boardBanData?.modded ? 'My Moderated' : 'All'}} Boards</option>
          <optgroup v-for="(boards, parentName) in filterBoards" :label="parentName" :key="parentName">
            <option v-for="board in boards" :value="board.id" :key="decode(board.name)">{{decode(board.name)}}</option>
          </optgroup>
        </select>
        <div class="row">
          <div class="column">
            <label v-if="!hasGlobalModPerms()" class="inline-block">
              <input @change="applyFilter()" v-model="moddedFilter" class="pointer" type="checkbox" />
              Show only my moderated boards
            </label>
          </div>
          <div class="column">
            <label v-if="boardBanData?.board || boardBanData?.modded" class="clear-filters">
              <a @click="moddedFilter=boardFilter=null;applyFilter()"><i class="fa fa-times"></i> Clear Filters</a>
            </label>
          </div>
        </div>
      </div>
      <div class="column">
        <div class="nested-input-container">
          <a v-if="boardBanData?.search" @click="clearSearch()" class="nested-clear-btn fa fa-times"></a>
          <a @click="applyFilter()" class="nested-btn">Search</a>
          <input class="input-text nested-input" v-model="searchFilter" type="text" id="search-users" placeholder="Search Banned Users" @keydown="$event.which === 13 && applyFilter()" @keyup="$event.which === 27 && clearSearch()" />
        </div>
      </div>
    </div>
    <div class="board-ban-content">
      <table class="underlined" width="100%">
        <thead>
          <th class="left-icon-col"></th>
          <th>User</th>
          <th>Email</th>
          <th>Banned Boards</th>
          <th>Action</th>
        </thead>
        <tbody v-if="boardBanData?.data?.length">
          <tr v-for="boardBan in boardBanData?.data" :key="boardBan">
            <td class="left-icon-col">
              <i v-if="bannedFromModeratedBoard(boardBan.board_ids)" class="far fa-star"></i>
            </td>
            <td>
              <router-link :to="{ path: '/profile/' + boardBan.username.toLowerCase() }" v-html="boardBan.username" />
            </td>
            <td><a :href="`mailto:${boardBan.email}`" target="_blank" v-html="boardBan.email"></a></td>
            <td>
              <span v-for="(boardName, i) in boardBan.board_names" :key="i">
                <router-link :to="{ path: '/boards/' + boardBan.board_slugs[i] }" v-html="boardName + (i < boardBan.board_names.length - 1 ? ', ' : '') "></router-link>
              </span>
            </td>
            <td>
              <a class="pointer" @click="showManageBans(boardBan)"><i class="fas fa-ban"></i></a>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="row">
      <div class="column">
        <div class="indicator"><i class="far fa-star"></i> Indicates a user that has been banned from a board you moderate</div>
      </div>
      <div class="column">
        <div class="pagination-wrap" v-if="boardBanData?.page > 1 || boardBanData.next">
          <div class="pagination-simple">
            <button @click="pageResults(boardBanData.prev)" :disabled="!boardBanData.prev">&#10094; Prev</button>
            <button @click="pageResults(boardBanData.next)" :disabled="!boardBanData.next">Next &#10095;</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminApi, boardsApi } from '@/api'
import { groupBy } from 'lodash'
import decode from '@/composables/filters/decode'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'BoardBanModeration',
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      page: to.query.page || undefined,
      limit: to.query.limit || undefined,
      modded: to.query.modded,
      board: to.query.board,
      search: to.query.search
    }
    adminApi.bans.pageByBannedBoards(queryParams)
    .then(data => {
      boardsApi.movelist()
      .then(movelist => next(vm => {
        vm.boardBanData = data
        vm.initFilterBoards(movelist, queryParams)
      }))
    })
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      page: to.query.page || undefined,
      limit: to.query.limit || undefined,
      modded: to.query.modded,
      board: to.query.board,
      search: to.query.search
    }
    adminApi.bans.pageByBannedBoards(queryParams)
    .then(data => {
      boardsApi.movelist()
      .then(movelist => {
        this.boardBanData = data
        this.initFilterBoards(movelist, queryParams)
        next()
      })
    })
  },
  setup() {
    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page <= 1 || !query.page) delete query.page
      $router.replace({ name: $route.name, params: $route.params, query: query })
    }
    const applyFilter = () => {
      let query = {
        ...$route.query,
        board: v.boardFilter,
        modded: v.moddedFilter,
        search: v.searchFilter
      }
      Object.keys(query).forEach(k => { if (!query[k]) delete query[k] })
      $router.replace({ name: $route.name, params: $route.params, query: query })
    }
    const searchBannedUsers = () => console.log(v.searchFilter)
    const clearSearch = () =>  {
      v.searchFilter = null
      applyFilter()
    }
    const showManageBans = data => console.log(data)
    const bannedFromModeratedBoard = boardIds => {
      if (hasGlobalModPerms()) return true
      return boardIds.filter(id => {
        if (v.moderating.indexOf(id) > -1) { return id; }
      }).length
    }
    const hasGlobalModPerms = () => v.permissionUtils.hasPermission('bans.banFromBoards.bypass.type.admin')
    const $auth = inject(AuthStore)
    const $route = useRoute()
    const $router = useRouter()

    const v = reactive({
      authedUser: $auth.user,
      permissionUtils: $auth.permissionUtils,
      filterBoards: {},
      moderating: [],
      boardFilter: null,
      moddedFilter: null,
      searchFilter: null,
      boardBanData: {}
    })

    const initFilterBoards = (boards, query) => {
      v.filterBoards = boards
      v.moderating = v.authedUser.moderating
      let moderatedBoards = v.filterBoards.filter(board => {
        if (v.moderating.indexOf(board.id) > -1) return board
      })
      if (v.boardBanData.modded) v.filterBoards = moderatedBoards
      // create options groups by parent name (for select grouping)
      v.filterBoards = groupBy(v.filterBoards, 'parent_name')
      v.boardFilter = query.board || null
      v.searchFilter = query.search
      v.moddedFilter = query.modded
    }

    return { ...toRefs(v), decode, applyFilter, searchBannedUsers, clearSearch, showManageBans, bannedFromModeratedBoard, initFilterBoards, hasGlobalModPerms, pageResults }
  }
}
</script>

<style lang="scss">
.board-ban-content { margin-top: 6rem; }
.admin-table-header {
  background-color: $sub-header-color;
  position: absolute;
  left: 0;
  right: 0;
  padding: 1rem;
  padding-top: 2rem;
  padding-bottom: 0.25rem;
  top: 0.4rem;
  @include break-mobile-sm { padding: 1.25rem 1rem 0; margin: 0 -1rem 2rem; }
  select { margin-bottom: 0; }
  .clear-filters {
    align-self: flex-end;
    width: auto;
    padding-right: 0;
  }
  label {
    font-size: 0.75rem;
    color: $secondary-font-color;
    input { margin-bottom: 0.2rem; }
  }
}

.row {
  display: flex;
  flex-flow: row;
  row-gap: 0;
}
.column { flex: 50%; }
.nested-btn { margin-bottom: 1rem; }

th.left-icon-col { width: 1.5rem; }
td.left-icon-col {
  pading: 0 0 0 0.5rem;
  color: $secondary-font-color;
  padding-top: 0.5rem;
}

.indicator {
  font-size: 0.75rem;
  margin-left: 0.5rem;
  color: $secondary-font-color;
  i { padding: 0 0.5rem 0 0; }
}
</style>
