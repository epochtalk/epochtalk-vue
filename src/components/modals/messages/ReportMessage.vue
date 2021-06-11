<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Report Message</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <label for="reportReason">Short explanation for report <strong>( {{reportReason.length}} / 255 )</strong></label>
        <textarea id="reportReason" name="reportReason" v-model="reportReason" :disabled="reportSubmitted" placeholder="Give a brief reason for your report" ref="focusInput" rows="4" required maxlength="255"></textarea>
        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="reportMessage()">
            Report Message
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
  name: 'report-message-modal',
  props: ['show', 'messageId'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const reportMessage = () => {
      v.errorMessage = null
      messagesApi.delete(props.messageId)
      .then(() => {
        emit('success')
        $alertStore.success(`Successfully deleted reply!`)
      })
      .catch(() => v.errorMessage = `There was an error deleting reply, please contact an administrator.`)
      .finally(() => v.errorMessage ? null : close())
    }

    const close = () => {
      console.log('CLOSE!!!')
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      reportReason: null,
      reportSubmitted: false,
      errorMessage: ''
    })

    return { ...toRefs(v), reportMessage, close }
  }
}
</script>
