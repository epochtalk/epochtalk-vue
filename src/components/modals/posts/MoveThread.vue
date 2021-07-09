<template>
  <modal :name="$options.name" :show="show" @close="close()">
    <template v-slot:header>Move Thread</template>
    <template v-slot:body>
      <form name="$parent.form" class="css-form" novalidate>
        <label>Select a board to move this thread to:</label>
        <div class="control-full-width">
          <!-- TODO(boka): modal-focus="{{PostsParentCtrl.showMoveThreadModal}}" -->
          <select name="boards" id="moveThreadBoards" v-model="newBoard">
            <optgroup v-for="(boards, parentName) in boardsMovelist" :label="parentName" :key="parentName">
              <option v-for="board in boards" :value="board" :key="decode(board.name)">{{decode(board.name)}}</option>
            </optgroup>
          </select>
        </div>
        <!-- Save Button -->
        <div class="clear">
          <button class="fill-row" @click="moveThread()">
            Move Thread
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import decode from '@/composables/filters/decode'
import { useRouter } from 'vue-router'
import { reactive, toRefs } from 'vue'
import { threadsApi, boardsApi } from '@/api'
import { groupBy } from 'lodash'

export default {
  name: 'posts-move-thread-modal',
  props: ['show', 'threadId'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const close = () => {
      emit('close')
    }

    /* Internal Data */
    const $router = useRouter()

    /* Template Data */
    const moveThread = () => {
      threadsApi.move(props.threadId, v.newBoard.id)
        .then(() => {
          $router.push({ name: 'Threads', params: { boardId: v.newBoard.id, boardSlug: v.newBoard.slug }})
          close()
        })
    }

    const v = reactive({
      threadId: props.threadId,
      boardsMovelist: {},
      newBoard: null
    })

    boardsApi.movelist()
      // create options groups by parent name
      .then(ml => groupBy(ml, 'parent_name'))
      .then(movelist => {
        // apply grouped boards for select listing
        v.boardsMovelist = movelist
        // select default option (first option in first group)
        v.newBoard = movelist[Object.keys(movelist)[0]][0]
      })

    return {
      ...toRefs(v),
      moveThread,
      close,
      decode
    }
  }
}
</script>
