<template>
  <p v-if="error"><strong>{{error}}</strong></p>
  <div v-if="data">
    <div class="category" v-for="cat in data.boards" :key="cat.id">
      <h3>&bull; {{cat.name}}</h3>
      <ul v-for="board in cat.boards" :key="board.id">
        <a href="#">{{board.name}}</a>
        <div class="description">{{board.description}}</div>
        <div class="moderators" v-if="board.moderators && board.moderators.length">
          <strong>Moderators: </strong>
          <a href="#" v-for="mod in board.moderators" :key="mod.username">{{mod.username}}</a>,
        </div>
        <div class="childboards" v-if="board.children.length">
          <strong>Child Boards:</strong>
          <span v-for="child in board.children" :key="child.id">
            <a href="#">{{child.name}}</a>,
          </span>
        </div>
      </ul>
    </div>
  </div>
</template>

<script>
import useSWRV from 'swrv'
import { inject } from 'vue'

export default {
  name: 'Boards',
  props: {},
  setup() {
    const $api = inject('$api')
    const $swrvCache = inject('$swrvCache')

    const { data: data, error: error } = useSWRV(`/api/boards`, path => $api(`${path}`), {
      cache: $swrvCache });


    return {
      data,
      error
    }
  }
}
</script>
