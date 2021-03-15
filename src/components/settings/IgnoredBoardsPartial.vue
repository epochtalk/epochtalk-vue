<template>
  <input :id="board.id" :checked="checked" @change="toggleIgnoredBoard(board.id)" :disabled="toggleSubmitted[board.id]" type="checkbox" />
  <label :for="board.id">{{board.name}}</label>
  <ul>
    <li v-for="childboard in board.children" :key="childboard.id">
      <ignored-boards-partial @toggle-ignored-board="toggleIgnoredBoard" :board="childboard" :all-boards="allBoards" :toggle-submitted="toggleSubmitted" />
    </li>
  </ul>
</template>

<script>
import { ref  } from 'vue'

export default {
  name: 'ignored-boards-partial',
  props: ['allBoards', 'board', 'toggleSubmitted', 'onToggle-ignored-board'],
  setup(props, { emit }) {
    /* View Methods */
    const toggleIgnoredBoard = boardId => emit('toggle-ignored-board', boardId)

    const checked = ref(props.allBoards[props.board.id])

    return { toggleIgnoredBoard, checked }
  }
}
</script>
