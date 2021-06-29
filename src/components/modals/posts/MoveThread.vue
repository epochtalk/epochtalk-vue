<template>
  <modal :name="$options.name" :show="show" @close="close()">
    <form name="$parent.form" class="css-form" novalidate>
      <h3 class="thin-underline">Move Thread</h3>
      <label>Select a board to move this thread to:</label>
      <div class="control-full-width">
        <select modal-focus="{{PostsParentCtrl.showMoveThreadModal}}" name="boards" id="moveThreadBoards" ng-model="PostsParentCtrl.moveBoard" ng-options="board.name group by board.parent_name for board in PostsParentCtrl.boards | orderBy:board.view_order"></select>
      </div>
      <!-- Save Button -->
      <div class="clear">
        <button class="fill-row" ng-click="PostsParentCtrl.moveThread()">
          Move Thread
        </button>
      </div>
    </form>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { useRouter } from 'vue-router'
import { reactive, toRefs } from 'vue'
import { threadsApi } from '@/api'

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
      threadsApi.move(props.threadId, v.newBoardId)
        .then(() => {
          $router.push({ name: 'Threads', params: { boardId: props.boardId, boardSlug: props.boardSlug}})
          close()
        })
    }

    const v = reactive({
      threadId: props.threadId,
      newBoardId: null
    })

    return { ...toRefs(v), moveThread, close }
  }
}
</script>
