<template>
  <input :id="currentBoard.id" :checked="checked" @change="toggleIgnoredBoard(currentBoard.id)" :disabled="inputDisabled" type="checkbox" />
  <label :for="currentBoard.id">{{currentBoard.name}}</label>
  <ul>
    <li v-for="childboard in currentBoard.children" :key="childboard.id">
      <ignored-boards-partial @toggle-ignored-board="toggleIgnoredBoard" :current-board="childboard" :checked-inputs="checkedInputs" :disabled-inputs="disabledInputs" />
    </li>
  </ul>
</template>

<script>
import { reactive, toRefs, computed } from 'vue'

export default {
  name: 'ignored-boards-partial',
  props: ['checkedInputs', 'currentBoard', 'disabledInputs', 'onToggle-ignored-board'],
  setup(props, { emit }) {
    /* View Methods */
    const toggleIgnoredBoard = boardId => emit('toggle-ignored-board', boardId)

    const v = reactive({
      checked: computed(() => props.checkedInputs[props.currentBoard.id]),
      inputDisabled: computed(() => props.disabledInputs[props.currentBoard.id])
    })

    return { ...toRefs(v), toggleIgnoredBoard }
  }
}
</script>
