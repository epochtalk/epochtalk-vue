<template>
  <h5 class="thin-underline section-header-top-spacing">Trust Score Board Visibility
    <span class="info-tooltip" data-balloon="Choose which boards you want a user's trust score to be visible within. Trust scores will be shown to the left of the user's post, below their avatar" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
  </h5>

  <div class="board-bans-list">
    <label>
      <strong>Board Visibility</strong>
    </label>
    <div class="clear boards-check-list">
      <div v-for="cat in boards" :key="cat.id">
        <label v-if="cat.boards.length" class="bold">{{cat.name}}</label>
        <ul>
          <li v-for="board in cat.boards" :key="board.id">
            <ignored-boards-partial @toggle-ignored-board="toggleTrustBoard" :current-board="board" :checked-inputs="trustBoards" :disabled-inputs="{}"/>
          </li>
        </ul>
      </div>
    </div>
  </div>

</template>

<script>
import { reactive, toRefs, onBeforeMount } from 'vue'
import IgnoredBoardsPartial from '@/components/settings/IgnoredBoardsPartial.vue'
import { boardsApi, usersApi, adminApi } from '@/api'

export default {
  name: 'trust-admin-settings',
  components: { IgnoredBoardsPartial },
  setup() {
    onBeforeMount(() => {
      boardsApi.getBoards(true).then(d => v.boards = d.boards).catch(() => {})
      usersApi.trust.getTrustBoards().then(d => {
        v.trustBoards = d.reduce((acc, id) => {
          acc[id] = true
          return acc
        }, {})
      }).catch(() => {})
    })

    const toggleTrustBoard = boardId => v.trustBoards[boardId] ? adminApi.trust.deleteTrustBoard({ board_id: boardId }).then(() => delete v.trustBoards[boardId]) : adminApi.trust.addTrustBoard({ board_id: boardId }).then(() => v.trustBoards[boardId] = true)

    const v = reactive({ boards: [], trustBoards: [] })
    return { ...toRefs(v), toggleTrustBoard }
  }
}
</script>
