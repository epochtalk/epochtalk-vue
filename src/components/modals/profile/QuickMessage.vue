<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Quick Message</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <!-- Subject -->
        <div class="input-section">
          <label for="subject">Subject</label>
          <input type="text" id="subject" v-model="subject" ref="focusInput" minlength="1" maxlength="255" />
        </div>

        <!-- Message -->
        <div class="input-section textarea">
          <label for="message">Message
            ({{ body.length || 0 }}/5000)
          </label>
          <textarea rows="10" id="message" :placeholder="`Type your message to ${user.username} here...`" v-model="body" maxlength="5000"></textarea>
        </div>

        <!-- Save Button -->
        <div class="modal-actions split-column">
          <button @click.prevent="sendMessage()" :disabled="!subject || !body">
            Send Message
          </button>
          <button @click.prevent="reset()" class="outline">
            Reset
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
  name: 'quick-message-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const sendMessage = () => {
      const newMessage = {
        receiver_ids: [ props.user.id ],
        content: {
          subject: v.subject,
          body: v.body
        }
      }
      messagesApi.convos.create(newMessage)
      .then(() => $alertStore.success(`Message successfully sent to ${props.user.username}`))
      .then(() => reset())
      .then(() => close())
      .catch(() => {
        v.errorMessage = 'Error: There was an issue sending your message, please try again later'
      })
    }

    const reset = () => {
      v.subject = ''
      v.body = ''
      v.focusInput.focus()
    }

    const close = () => {
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      subject: '',
      body: '',
      userReactive: props.user,
      focusInput: null,
      errorMessage: ''
    })

    return { ...toRefs(v), sendMessage, reset, close }
  }
}
</script>
