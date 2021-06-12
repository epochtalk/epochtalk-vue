<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Delete Account</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <p>Are you sure you want to permanently delete this conversation and all of its reply?</p>
        <!-- Save Button -->
        <div class="modal-actions">
          <button ref="focusInput" @click.prevent="deleteConversation()">
            Delete Conversation
          </button>
        </div>
        <label v-if="errorMessage" class="red centered-text">{{errorMessage}}</label>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject } from 'vue'
import { messagesApi } from '@/api'

export default {
  name: 'delete-conversation-modal',
  props: ['show', 'conversationId'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const deleteConversation = () => {
      v.errorMessage = null
      messagesApi.convos.delete(props.conversationId)
      .then(() => {
        emit('success')
        $alertStore.success(`Successfully deleted conversation and its replies!`)
      })
      .catch(() => v.errorMessage = `There was an error deleting conversation, please contact an administrator.`)
      .finally(() => v.errorMessage ? null : close())
    }

    const close = () => {
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      errorMessage: ''
    })

    return { ...toRefs(v), deleteConversation, close }
  }
}
</script>
