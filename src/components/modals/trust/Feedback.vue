<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Quick Message</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Leave trust feedback for {{user.username}}</h3>
        <label>
          Risked BTC
          <input ref="focusInput" type="number" v-model="feedback.risked_btc" step="0.0001" required />
        </label>
        <label>
          Reference Link
          <input type="text" placeholder="Reference link to back up your feedback" v-model="feedback.reference" />
        </label>
        <label>
          Feedback Type
        </label>
        <label>
          <input type="radio" v-model="feedback.scammer" name="scammer" value="0" required />
          Positive &mdash; You trust this person or had a successful trade
        </label>
        <label>
          <input type="radio" v-model="feedback.scammer" name="scammer" value="-1" required />
          Neutral &mdash; Your rating will not affect this user's trust score
        </label>
        <label>
          <input type="radio" v-model="feedback.scammer" name="scammer" value="1" required />
          Negative &mdash; You were scammed or you strongly believe that this user is a scammer
        </label>
        <label>
          Comments
          <textarea minlength="3" v-model="feedback.comments" width="35%" rows="10" required></textarea>
        </label>

        <!-- Save Button -->
        <div class="modal-actions split-column">
          <button class="fill-row" :disabled="feedback.scammer === undefined || feedback.comments.length < 3 || feedbackSubmitted || !urlValid()" @click.prevent="addTrustFeedback()" v-html="submitFeedbackBtnLabel"></button>
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
import { usersApi } from '@/api'
import { websiteUrlRegex } from '@/composables/utils/globalRegex'

export default {
  name: 'trust-feedback-modal',
  props: ['show', 'user'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const addTrustFeedback = () => {
      v.feedbackSubmitted = true
      v.submitFeedbackBtnLabel = 'Loading...'
      usersApi.trust.addTrustFeedback({
        ...v.feedback,
        scammer: Number(v.feedback.scammer) === -1 ? null : Number(v.feedback.scammer) !== 0,
        risked_btc: Number(v.feedback.risked_btc),
        user_id: props.user.id
      })
      .then(() => {
        emit('success')
        $alertStore.success('Successfully left trust feedback for ' + props.user.username)
        close()
      })
      .catch(() => v.errorMessage = 'There was an error leaving feedback for ' + props.user.username)
      .finally(() => {
        v.submitFeedbackBtnLabel = 'Leave Feedback'
        v.feedbackSubmitted = false
      })
    }

    const urlValid = () => websiteUrlRegex.test(v.feedback.reference) || !v.feedback.reference

    const reset = () => {
      v.feedback = { risked_btc: '0.000' }
      v.errorMessage = null
      v.focusInput.focus()
    }

    const close = () => {
      v.feedback = { risked_btc: '0.000' }
      v.errorMessage = null
      v.feedbackSubmitted = false
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      feedback: { risked_btc: '0.0000' },
      submitFeedbackBtnLabel: 'Leave Feedback',
      feedbackSubmitted: false,
      focusInput: null,
      errorMessage: ''
    })

    return { ...toRefs(v), addTrustFeedback, urlValid, reset, close }
  }
}
</script>
