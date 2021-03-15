<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Purge Thread</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <p>Are you sure you want to permanently delete this thread?</p>
        <div class="clear">
          <button id="purge-btn" class="fill-row" @click.prevent="purgeThread()" type="submit">
            Purge Thread
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { useRouter } from 'vue-router'
import { reactive, toRefs } from 'vue'
import { threadsApi } from '@/api'

export default {
  name: 'posts-purge-thread-modal',
  props: ['show', 'threadId', 'boardId', 'boardSlug'],
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
    const purgeThread = () => {
      threadsApi.purge(props.threadId)
        .then(() => {
          $router.push({ name: 'Threads', params: { boardId: props.boardId, boardSlug: props.boardSlug}})
          close()
        })
    }

    const v = reactive({
      threadId: props.threadId,
      focusInput: null
    })

    return { ...toRefs(v), purgeThread, close }
  }
}
</script>
