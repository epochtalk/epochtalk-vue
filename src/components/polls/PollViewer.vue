<template>
  <div class="polls" id="poll-view" v-if="poll">
    <!-- Poll Header -->
    <div class="poll-title">
      <span class="poll-title-text">
        Poll
        <span class="is_locked" v-if="pollCopy.locked">(Locked)</span>
      </span>
      <div class="poll-controls">
        <!-- Poll Controls -->
        <div class="poll-control" v-if="canLock()">
          <input id="lockPoll" class="icon" type="checkbox" v-model="pollCopy.locked">
          <label for="lockPoll"  @click="updateLockPoll()" data-balloon="Lock Poll" data-balloon-pos="down" :class="{'is_locked' : pollCopy.locked}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <title></title>
              <path
                d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
            </svg>
          </label>
        </div>
        <div class="poll-control" v-if="canEdit()">
          <input id="editPoll" class="icon" type="checkbox" v-model="editPoll">
          <label for="editPoll" @click="scrollPollView()" data-balloon="Edit Poll" data-balloon-pos="down">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <title></title>
              <path d="M7.38,33.74h0L4,44l10.26-3.39h0L41.74,13.14,34.86,6.26Zm31-21.15.54.55L14.26,37.79l-.54-.54" />
              <path d="M45.48,6.89,41.11,2.52a1.78,1.78,0,0,0-2.5,0L36.11,5,43,11.89l2.5-2.5A1.76,1.76,0,0,0,45.48,6.89Z" />
            </svg>
          </label>
        </div>
      </div>
    </div>

    <!-- Poll Edit -->
    <div class="poll-edit" v-if="canEdit()" :class="{'showing': editPoll, 'hidden': !editPoll}">
      <div class="slide-wrapper">
        <div class="poll-edit-container">
          <h5 class="panelTitle">Edit Poll Options:</h5>
          <label for="pollVote">
            <input type="checkbox" id="pollVote" v-model="options.change_vote">
            Allow user to change vote
          </label>
          <div class="pollEdit__expiration">
            <label for="pollVoteExpiration">Poll expires on {{humanDate(options.expiration) || '(No Expiration)'}}</label>
            <input id="pollVoteExpiration" type="date" v-model="options.expiration_date" @change="calcExpiration()">
            <input type="time" v-model="options.expiration_time" @change="calcExpiration()">
          </div>
          <div class="pollEdit__answers">
            <label for="pollMaxVote">Maximum answers per vote:</label>
            <input type="number" id="pollMaxVote" min="1" :max="pollCopy.answers.length" v-model="options.max_answers">
            <div class="pollGroup__header"><label>Show poll results: </label>
              <label for="displayAlways">
                <input type="radio" name="displayMode" id="displayAlways" value="always" v-model="options.display_mode">
                Always shown
              </label>
              <label for="displayVoted">
                <input type="radio" name="displayMode" id="displayVoted" value="voted" v-model="options.display_mode">
                After voting
              </label>
              <label for="displayExpired">
                <input type="radio" name="displayMode" id="displayExpired" value="expired" v-model="options.display_mode" :disabled="!options.expiration">
                After expiration
              </label>
            </div>
          </div>
          <div class="actions__pollEdit">
            <button class="secondary cancel small" @click="editPoll = false">Cancel</button>
            <button class="small" :disabled="!pollValid()" @click="saveOptions()">Save Changes</button>
          </div>
        </div>
      </div>
    </div>

    <div class="poll-body">
      <div class="poll-header">
        <!-- Poll Details -->
        <div class="poll-header-main">
          <!-- Poll Question -->
          <h1 class="poll-question">{{pollCopy.question}}</h1>
          <div class="poll-details">
            <span class="poll-info" v-if="pollCopy.display_mode === 'always'">Results Always Shown. </span>
            <span class="poll-info" v-if="pollCopy.display_mode === 'voted'">Results After Voting. </span>
            <span class="poll-info" :class="{'highlight':!pollCopy.expired && !canVote() }" v-if="pollCopy.display_mode === 'expired'">Results After Expiration. </span>
            <span class="poll-info" :class="{'highlight':pollCopy.expired}">
            <!-- {{ pollCopy.expiration ? 'Exp: ' + (pollCopy.expiration | date : 'short') : 'No Expiration. '}}</span> -->
            {{ pollCopy.expiration ? `Exp: ${humanDate(pollCopy.expiration)} ` : 'No Expiration. '}}</span>
            <span class="poll-info" :class="{'highlight':pollAnswers.length===pollCopy.max_answers}">{{pollCopy.max_answers + ' choice' + (pollCopy.max_answers > 1 ? 's':'') + '. '}}</span>
            <span class="poll-info" v-if="!pollCopy.change_vote">Votes are Permanent. </span>
            <span class="poll-info" v-if="pollCopy.change_vote">Votes can be changed. </span>
          </div>
        </div>
      </div>

      <!-- Poll Results -->
      <div class="poll-answer" v-for="(answer) in pollCopy.answers" :key="answer.id">
        <div :class="{ 'poll-answer-row':showPollResults(), 'selected-answer':answer.selected }">
          <label class="poll-select" :class="{ 'active':pollAnswers.indexOf(answer.id) > -1, 'default-cursor voted':!canVote() }">
            <span v-if="answer.selected" class="selected-answer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                <path d="M24,2A22,22,0,1,0,46,24,22,22,0,0,0,24,2ZM21,34.22l-10-10,2.82-2.83L21,28.56l14-14,2.82,2.83Z" />
              </svg>
            </span>
            <input v-if="pollCopy.max_answers === 1 && canVote()" @click="pollAnswers.pop(); toggleAnswer(answer.id);" name="pollanswer" type="radio">
            <input type="checkbox" @click="toggleAnswer(answer.id)" :disabled="pollAnswers.length >= pollCopy.max_answers && pollAnswers.indexOf(answer.id) === -1" :checked="pollAnswers.indexOf(answer.id) > -1" v-if="pollCopy.max_answers > 1 && canVote()"/>
            <span>{{answer.answer}}</span>
          </label>
          <div v-if="showPollResults()" class="poll-results">
            <div class="poll-results-data">
              <span class="poll-results-value">{{answer.percentage + '% '}}</span>
              <span class="poll-results-label">{{'(' + answer.votes + (answer.votes > 1 || answer.votes === 0 ? ' votes)' : ' vote)')}}</span>
            </div>
            <div class="poll-bar">
              <section :style="answer.style"></section>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="actionsBar">
      <button @click="vote()" :disabled="pollAnswers.length === 0" v-if="canVote()">Vote</button>
      <button v-if="canRemoveVote()" @click="removeVote()" class="secondary">Remove Vote</button>
    </div>
  </div>
</template>
<script>
import humanDate from '@/composables/filters/humanDate'
import { AuthStore } from '@/composables/stores/auth'
import { reactive, toRefs, watch, inject } from 'vue'
import { pollsApi } from '@/api'
import { cloneDeep } from 'lodash'
import dayjs from 'dayjs'

export default {
  props: ['poll', 'thread', 'userPriority', 'reset', 'bannedFromBoard'],
  setup(props) {
    /* Internal Methods */
    const calculatePollPercentage = () => {
      v.pollCopy.totalVotes = 0
      v.pollCopy.answers.forEach(answer => { v.pollCopy.totalVotes += answer.votes })
      v.pollCopy.answers.map(answer => {
        let percentage = (answer.votes/v.pollCopy.totalVotes) * 100 || 0
        percentage = +percentage.toFixed(1)
        answer.style = { width: percentage + '%' }
        answer.percentage = percentage
      })
    }
    const votingEligible = () => {
      if (!v.loggedIn) { return false }
      else if (props.bannedFromBoard) { return false }
      else if (!v.permissionUtils.hasPermission('threads.vote.allow')) { return false }
      else if (v.pollCopy.locked) { return false }
      else if (v.pollCopy.expired) { return false }
      else { return true }
    }
    /* View Methods */
    const canLock = () => {
      if (!v.loggedIn) { return false }
      if (props.bannedFromBoard) { return false }
      if (!v.permissionUtils.hasPermission('threads.lockPoll.allow')) { return false }

      const adminBypass = v.permissionUtils.hasPermission('threads.lockPoll.bypass.owner.admin')
      const modBypass = v.permissionUtils.hasPermission('threads.lockPoll.bypass.owner.mod')
      const priorityBypass = v.permissionUtils.hasPermission('threads.lockPoll.bypass.owner.priority')
      if (props.thread.user.id === $auth.user.id) return true
      else if (adminBypass) return v.permissionUtils.getPriority() <= props.userPriority
      else if (modBypass) return v.permissionUtils.getPriority() < props.userPriority && v.permissionUtils.moderatesBoard(props.thread.board_id)
      else if (priorityBypass) return v.permissionUtils.getPriority() < v.userPriority
      else return false
    }
    const canEdit = () => {
      if (!v.loggedIn) { return false }
      if (props.bannedFromBoard) { return false }
      if (!v.permissionUtils.hasPermission('threads.editPoll.allow')) { return false }

      const adminBypass = v.permissionUtils.hasPermission('threads.editPoll.bypass.owner.admin')
      const modBypass = v.permissionUtils.hasPermission('threads.editPoll.bypass.owner.mod')
      const priorityBypass = v.permissionUtils.hasPermission('threads.editPoll.bypass.owner.priority')
      if (props.thread.user.id === $auth.user.id) return true
      else if (adminBypass) return v.permissionUtils.getPriority() <= props.userPriority
      else if (modBypass) return v.permissionUtils.getPriority() < props.userPriority && v.permissionUtils.moderatesBoard(props.thread.board_id)
      else if (priorityBypass) return v.permissionUtils.getPriority() < v.userPriority
      else return false
    }
    const canVote = () => {
      // if the user is not able to vote or if they have voted already
      if (!votingEligible() || v.pollCopy.has_voted) { return false }
      else { return true }
    }
    const toggleAnswer = answerId => {
      // if the answer is already selected, unselect it
      const answerPos = v.pollAnswers.indexOf(answerId)
      if (answerPos > -1) { v.pollAnswers.splice(answerPos, 1) }
      else {
        // otherwise, if total selected answers does not exceed max, select it
        if (v.pollAnswers.length < v.pollCopy.max_answers) { v.pollAnswers.push(answerId) }
      }
    }
    const canRemoveVote = () => {
      // if the user is not able to vote
      // or they have not voted yet
      // or vote changes are not allowed
      if (!votingEligible() || !v.pollCopy.has_voted || !v.pollCopy.change_vote) { return false }
      else { return true }
    }
    const pollValid = () => {
      if (!v.options.max_answers || v.options.max_answers < 1) { return false }
      else if (v.options.max_answers > v.pollCopy.answers.length) { return false }
      else if (v.options.expiration_date && !v.options.expiration) { return false }
      else if (v.options.expiration_time && !v.options.expiration_date) { return false }
      else if (v.options.expiration && v.options.expiration < Date.now()) { return false }
      else if (v.options.display_mode !== 'always' && v.options.display_mode !== 'voted' && v.options.display_mode !== 'expired') { return false }
      else { return true }
    }
    const saveOptions = () => {
      pollsApi.editPoll(props.thread.id, v.options)
        .then(poll => {
          Object.assign(v.pollCopy, poll)
          if (v.pollCopy.expiration) {
            v.pollCopy.expired = new Date(poll.expiration) < Date.now()
          }

          v.editPoll = false
          v.pollAnswers = []
          $alertStore.success('Poll changes saved')
        })
        .catch(() => { $alertStore.error('Could not update poll') })
    }
    const showPollResults = () => {
      const displayMode = v.pollCopy.display_mode
      const hasVoted = v.pollCopy.has_voted
      const expired = v.pollCopy.expired
      if (displayMode === 'always') { return true }
      else if (displayMode === 'voted' && hasVoted) { return true }
      else if (displayMode === 'expired' && expired) { return true }
      else { return false }
    }
    const vote = () => {
      const threadId = props.thread.id
      const answerIds = v.pollAnswers

      pollsApi.vote(threadId, answerIds)
        .then(poll => {
          v.pollCopy = poll
          v.pollAnswers = []
          calculatePollPercentage()
        })
    }
    const removeVote = () => {
      const threadId = props.thread.id

      pollsApi.removeVote(threadId)
        .then(poll => {
          v.pollCopy = poll
          calculatePollPercentage()
        })
    }
    const updateLockPoll = () => {
      if(v.pollCopy.locked) {
        pollsApi.unlock(props.thread.id)
      }
      else {
        pollsApi.lock(props.thread.id)
      }
    }
    const calcExpiration = () => {
      if (v.options.expiration_date) {
        // parse expiration date
        const expiration = dayjs(v.options.expiration_date)

        // parse expiration time
        if (v.options.expiration_time) {
          const time = dayjs.duration(v.options.expiration_time)
          expiration.add(time)
        }

        // set expiration from time and date
        v.options.expiration = expiration
        if (v.options.expiration < Date.now()) { v.options.expiration = undefined }
      }
      else { v.options.expiration = undefined }

      if (!v.options.expiration && v.options.display_mode === 'expired') {
        v.options.display_mode = 'always'
      }
    }
    const scrollPollView = () => {
      console.log('scrollPollView')
      // $('#poll-view').animate({  scrollTop: 0 }, 250)
    }
    /* Internal Data */
    const $auth = inject(AuthStore)
    const $alertStore = inject('$alertStore')

    /* View Data */
    const v = reactive({
      loggedIn: $auth.loggedIn,
      permissionUtils: $auth.permissionUtils,
      options: {
        expiration: props.poll.expiration || undefined,
        change_vote: props.poll.change_vote,
        max_answers: props.poll.max_answers,
        display_mode: props.poll.display_mode,
        // used in view to track date and time from input field
        expiration_date: props.poll.expiration ? dayjs(props.poll.expiration).format('YYYY-MM-DD') : undefined,
        expiration_time: props.poll.expiration ? dayjs(props.poll.expiration).format('HH:mm') : undefined
      },
      editPoll: false,
      pollAnswers: [],
      pollCopy: { ...cloneDeep(props.poll), expired: props.poll.expiration ? new Date(props.poll.expiration) < Date.now() : false }
    })
    /* Data Initialization */
    // poll percentages
    calculatePollPercentage()

    /* Watched Data */
    watch(() => props.poll, val => {
      v.pollCopy = cloneDeep(val)
      calculatePollPercentage()
    })

    return {
      ...toRefs(v),
      canLock,
      canEdit,
      canVote,
      toggleAnswer,
      canRemoveVote,
      pollValid,
      saveOptions,
      showPollResults,
      vote,
      removeVote,
      updateLockPoll,
      calcExpiration,
      scrollPollView,
      humanDate
    }
  }
}
</script>
<style scoped lang="scss">
.poll-edit {
  overflow: hidden;
  height: auto;
  transition: max-height 0.5s;
  &.showing {
    max-height: 35rem;
  }
  &.hidden {
    max-height: 0rem;
  }
}
</style>
