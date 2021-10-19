<template>
  <div class="polls poll-form">
    <div class="section-poll-questions">
      <span class="section-header">Create a Poll</span>
      <!-- Poll Question -->
      <label for="question" class="poll-question">Question:</label>
      <input type="text" id="question" v-model="poll.question" maxlength="255">

      <!-- Poll Answers -->
      <label for="answer-1" class="poll-answers">Answers:</label>
      <div class="answer-row" v-for="(answer, index) in poll.answers" :key="index">
        <div class="field-inline-action">
          <input type="text" :id="'answer-' + index" v-model="poll.answers[index]" maxlength="255">
          <button v-if="index > 1" tabindex="-1" @click="removePollAnswer(index)" class="inline-action secondary small"><i class="fa fa-minus-circle"></i></button>
        </div>
      </div>
      <!-- Add Answer Button -->
      <div class="actions">
        <button @click="addPollAnswer()" :disabled="poll.answers.length > 19" class="secondary small">Add an Answer</button>
      </div>
    </div>

    <div class="section-poll-options">
      <span class="section-header">Options:</span >

      <div class="checkbox-group">
        <input type="checkbox" id="pollVote" v-model="poll.change_vote">
        <label for="pollVote">Allow user to change vote</label>
      </div>

      <div class="poll-options-expiration">
        <label for="pollExpirationDate" class="fieldgroup-container">
          <span class="fieldgroup-label">Poll expires at -- {{humanDate(poll.expiration) || '(No Expiration)'}}</span>
          <div class="fieldgroup">
            <input type="date" id="pollExpirationDate" v-model="poll.expiration_date" @change="calcExpiration()">
            <input type="time" v-model="poll.expiration_time" @change="calcExpiration()">
          </div>
        </label>
      </div>

      <div class="poll-options-answers">
        <label for="pollMaxVote">Maximum answers per vote:</label>
        <input type="number" id="pollMaxVote" min="1" :max="poll.answers.length" v-model="poll.max_answers">

        <div class="">
          <label>Show poll results: </label>
          <label for="displayAlways">
            <input type="radio" id="displayAlways" v-model="poll.display_mode" value="always">
            Always shown
          </label>
          <label for="displayVoted">
            <input type="radio" id="displayVoted" v-model="poll.display_mode" value="voted">
            After voting
          </label>
          <label for="displayExpired">
            <input type="radio" id="displayExpired" v-model="poll.display_mode" value="expired" :disabled="!poll.expiration">
            After expiration
          </label>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { reactive, toRefs, watch } from 'vue'
import humanDate from '@/composables/filters/humanDate'
import { debounce } from 'lodash'
import dayjs from 'dayjs'

export default {
  emits: ['poll-valid'],
  setup(props, { emit }) {
    /* Internal Methods */
    const validatePoll = async () => {
      var valid = true
      if (v.poll.question.length === 0) { valid = false }
      if (v.poll.answers.length < 2) { valid = false }
      if (v.poll.answers.length > 21) { valid = false }
      v.poll.answers.map(function(a) { if (a.length === 0) { valid = false } })
      if (!v.poll.max_answers || v.poll.max_answers < 1) { valid = false }
      if (v.poll.max_answers > v.poll.answers.length) { valid = false }
      if (v.poll.expiration_date && !v.poll.expiration) { valid = false }
      if (v.poll.expiration_time && !v.poll.expiration_date) { valid = false }
      if (v.poll.expiration && v.poll.expiration < Date.now()) { valid = false }
      if (v.poll.display_mode !== 'always' && v.poll.display_mode !== 'voted' && v.poll.display_mode !== 'expired') { valid = false }
      v.valid = valid
      emit('poll-valid', { valid: v.valid, poll: v.poll })
    }

    /* View Methods */
    const calcExpiration = () => {
      if (v.poll.expiration_date) {
        // parse expiration date
        const expiration = dayjs(v.poll.expiration_date)

        // parse expiration time
        if (v.poll.expiration_time) {
          const time = dayjs.duration(v.poll.expiration_time)
          expiration.add(time)
        }

        // set expiration from time and date
        v.poll.expiration = expiration
        if (v.poll.expiration < Date.now()) { v.poll.expiration = undefined }
      }
      else { v.poll.expiration = undefined }

      if (!v.poll.expiration && v.poll.display_mode === 'expired') {
        v.poll.display_mode = 'always'
      }
    }

    /* View Data */
    const v = reactive({
      valid: false,
      poll: {
        question: '',
        answers: ['', ''],
        max_answers: 1,
        change_vote: false,
        display_mode: 'always'
      }
    })

    /* Watched Data */
    watch(() => v.poll, debounce(validatePoll, 500), { deep: true })

    return {
      ...toRefs(v),
      calcExpiration,
      humanDate
    }
  }
}
</script>
