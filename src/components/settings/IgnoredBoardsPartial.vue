<template>
  <input :id="board.id"  @click="$emit('toggle-ignored-board', board.id)" :disabled="toggleSubmitted[board.id]" type="checkbox" />
  <label :for="board.id">{{board.name}}</label>
  <ul>
    <li v-for="board in board.children" :key="board.id">
      <ignored-boards :all-boards="allBoards" :toggle-submitted="toggleSubmitted" @toggle-ignored-board="toggleIgnoredBoard" />
    </li>
  </ul>
</template>

<script>

export default {
  name: 'ignored-boards',
  props: ['allBoards', 'board', 'toggleSubmitted'],
  emits: ['toggleIgnoredBoard'],
  setup() { return {} }
}
</script>
