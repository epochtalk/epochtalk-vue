<template>
  <input :id="board.id" :checked="checked" @change="toggleIgnoredBoard(board.id)" :disabled="disabledChecks[board.id]" type="checkbox" />
  <label :for="board.id">{{board.name}}</label>
  <ul>
    <li v-for="childboard in board.children" :key="childboard.id">
      <ignored-boards-partial @toggle-ignored-board="toggleIgnoredBoard" :board="childboard" :all-boards="allBoards" :disabled-inputs="disabledChecks" />
    </li>
  </ul>
</template>

<script>
import { reactive, toRefs, computed } from 'vue'

export default {
  name: 'ignored-boards-partial',
  props: ['allBoards', 'board', 'disabledInputs', 'onToggle-ignored-board'],
  setup(props, { emit }) {
    /* View Methods */
    const toggleIgnoredBoard = boardId => emit('toggle-ignored-board', boardId)

    const v = reactive({
      checked: computed(() => props.allBoards[props.board.id]),
      disabledChecks: props.disabledInputs || {}
    })

    return { ...toRefs(v), toggleIgnoredBoard }
  }
}
</script>
