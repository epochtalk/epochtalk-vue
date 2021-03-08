<template>
  <input :id="board.id" :checked="checked" @change="toggleIgnoredBoard(board.id)" :disabled="toggleSubmitted[board.id]" ref="input" type="checkbox" />
  <label :for="board.id">{{board.name}}</label>
  <ul>
    <li v-for="childboard in board.children" :key="childboard.id">
      <ignored-boards-partial @toggle-ignored-board="toggleIgnoredBoard" :board="childboard" :all-boards="allBoards" :toggle-submitted="toggleSubmitted" />
    </li>
  </ul>
</template>

<script>
import { toRefs, reactive, nextTick } from 'vue'

export default {
  name: 'ignored-boards-partial',
  props: ['allBoards', 'board', 'toggleSubmitted', 'onToggle-ignored-board'],
  setup(props, { emit }) {
    /* View Methods */
    const toggleIgnoredBoard = boardId => emit('toggle-ignored-board', boardId, v.errorHandler)

    const v = reactive({
      errorHandler: () => nextTick(() => {
        console.log(v.checked, document.getElementById(props.board.id), props.allBoards[props.board.id])
        document.getElementById(props.board.id).checked = !v.checked
      }),
      checked: props.allBoards[props.board.id]
    })

    return { toggleIgnoredBoard, ...toRefs(v) }
  }
}
</script>
