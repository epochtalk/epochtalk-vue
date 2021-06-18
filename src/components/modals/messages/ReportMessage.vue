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
import { reportsApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'report-message-modal',
  props: ['show', 'messageId'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const reportMessage = () => {
      v.errorMessage = null
      const data = {
        offender_message_id: props.messageId,
        reporter_reason: v.reportReason,
        reporter_user_id: v.authedUser.id
      }
      reportsApi.reportMessage(data)
      .then(() => {
        emit('success')
        $alertStore.success(`Successfully reported message!`)
      })
      .catch(() => v.errorMessage = `There was an error reporting message, please contact an administrator.`)
      .finally(() => v.errorMessage ? null : close())
    }

    const close = () => {
      v.reportReason = ''
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')
    const $auth = inject(AuthStore)

    /* Template Data */
    const v = reactive({
      authedUser: $auth.user,
      focusInput: null,
      reportReason: '',
      reportSubmitted: false,
      errorMessage: ''
    })

    return { ...toRefs(v), reportMessage, close }
  }
}
</script>
