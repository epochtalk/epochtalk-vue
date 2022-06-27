<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        <select name="boards" v-model="boardFilter" @change="filterBoards()" class="boards-select">
          <optgroup v-for="(boards, parentName) in boardsMovelist" :label="parentName" :key="parentName">
            <option v-for="board in boards" :value="board" :key="decode(board.name)">{{decode(board.name)}}</option>
          </optgroup>
        </select>
      </div>
      <div class="column">
        Hey
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { boardsApi } from '@/api'
import { groupBy } from 'lodash'
import decode from '@/composables/filters/decode'

export default {
  name: 'BoardBanModeration',
  beforeRouteEnter(to, from, next) {
    boardsApi.movelist()
    // create options groups by parent name
    .then(ml => groupBy(ml, 'parent_name'))
    .then(movelist => next(vm => {
      // apply grouped boards for select listing
      vm.boardsMovelist = movelist
    }))
  },
  beforeRouteUpdate(to, from, next) {
    boardsApi.movelist()
    // create options groups by parent name
    .then(ml => groupBy(ml, 'parent_name'))
    .then(movelist => {
      // apply grouped boards for select listing
      this.boardsMovelist = movelist
      next()
    })
  },
  setup() {
    const filterBoards = () => {
      console.log(v.boardFilter)
    }

    const v = reactive({ boardsMovelist: {}, boardFilter: null })
    return { ...toRefs(v), decode, filterBoards }
  }
}
</script>

<style lang="scss">
.admin-table-header {
  background-color: $sub-header-color;
  position: absolute;
  left: 0;
  right: 0;
  padding: 1rem;
  padding-top: 2rem;
  top: 0.4rem;
  @include break-mobile-sm { padding: 1.25rem 1rem 0; margin: 0 -1rem 2rem; }
}
.row {
  display: flex;
  flex-flow: row;
  row-gap: 0;
}
.column { flex: 50%; }
</style>
