<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Quick Message</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <!-- Message -->
        <div class="input-section textarea">
          <label for="message">Message
            ({{ message.length || 0 }}/5000)
          </label>
          <textarea rows="10" id="message" :placeholder="`Type your message to ${user.username} here...`" v-model="message" ref="focusInput" maxlength="5000"></textarea>
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="sendMessage()">
            Send Message
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

export default {
  name: 'quick-message-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const sendMessage = () => {
      $alertStore.info(`TODO: Send \r'${v.message}'\r to ${props.user.username}`)
      close()
    }

    const close = () => {
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      message: '',
      userReactive: props.user,
      focusInput: null,
      errorMessage: ''
    })

    return { ...toRefs(v), sendMessage, close }
  }
}
</script>
