<template>
<!--   <input :id="board.id"  @click="$emit('toggle-ignored-board', board.id)" :disabled="toggleSubmitted[board.id]" type="checkbox" />
 -->
  <input :id="board.id"   :disabled="toggleSubmitted[board.id]" type="checkbox" />
  <label :for="board.id">{{board.name}}</label>
  <ul>
    <li v-for="board in board.children" :key="board.id">
      <ignored-boards-partial :board="board" :all-boards="allBoards" :toggle-submitted="toggleSubmitted" />
    </li>
  </ul>
</template>

<script>

export default {
  name: 'ignored-boards-partial',
  props: ['allBoards', 'board', 'toggleSubmitted'],
  // emits: ['toggleIgnoredBoard'],
  setup() { return {} }
}
</script>
