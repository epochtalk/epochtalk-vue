<template>
  <modal show="TrustCtrl.showFeedbackModal" on-close="TrustCtrl.closeFeedback()">

</modal>

  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Quick Message</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Leave trust feedback for {{user.username}}</h3>
        <label>
          Risked BTC
          <input ref="focusInput" type="number" v-model="feedback.risked_btc" step="any" value="0.0000" required />
        </label>
        <label>
          Reference Link
          <input type="text" placeholder="Reference link to back up your feedback" ng-pattern="TrustCtrl.urlRegex" v-model="feedback.reference" />
        </label>
        <label>
          Feedback Type
        </label>
        <label>
          <input type="radio" v-model="feedback.scammer" name="scammer" :value="0" required />
          Positive &mdash; You trust this person or had a successful trade
        </label>
        <label>
          <input type="radio" v-model="feedback.scammer" name="scammer" :value="-1" required />
          Neutral &mdash; Your rating will not affect this user's trust score
        </label>
        <label>
          <input type="radio" v-model="feedback.scammer" name="scammer" :value="1" required />
          Negative &mdash; You were scammed or you strongly believe that this user is a scammer
        </label>
        <label>
          Comments
          <textarea minlength="3" v-model="feedback.comments" width="35%" rows="10" required></textarea>
        </label>

        <!-- Save Button -->
        <div class="modal-actions split-column">
          <button class="fill-row" :disabled="feedback.scammer === undefined || feedback.comments === undefined || feedbackSubmitted || !urlValid()" @click.prevent="addTrustFeedback()" v-html="submitFeedbackBtnLabel"></button>
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
  name: 'trust-feedback-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const addTrustFeedback = () => {
      // const newMessage = {
      //   receiver_ids: [ props.user.id ],
      //   content: {
      //     subject: v.subject,
      //     body: v.body
      //   }
      // }
      // messagesApi.convos.create(newMessage)
      // .then(() => $alertStore.success(`Message successfully sent to ${props.user.username}`))
      // .then(() => reset())
      // .then(() => close())
      // .catch(() => {
      //   v.errorMessage = 'Error: There was an issue sending your message, please try again later'
      // })
    }

    const reset = () => {
      // v.subject = ''
      // v.body = ''
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
      feedback: {},
      userReactive: props.user,
      focusInput: null,
      errorMessage: ''
    })

    return { ...toRefs(v), sendMessage, reset, close }
  }
}
</script>
