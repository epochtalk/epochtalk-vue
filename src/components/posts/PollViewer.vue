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
        <!-- TODO(boka): data-balloon="Lock Poll" data-balloon-pos="down" -->
        <div class="poll-control" v-if="canLock()" :class="{'is_locked' : pollCopy.locked}">
          <input id="lockPoll" class="icon" type="checkbox" v-model="pollCopy.locked">
          <label for="lockPoll"  @click="updateLockPoll()">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <title></title>
              <path
                d="M40,21H37.5V16.48a13.5,13.5,0,0,0-27,0V21H8a2,2,0,0,0-2,2V43a2,2,0,0,0,2,2H40a2,2,0,0,0,2-2V23A2,2,0,0,0,40,21ZM15.5,16.48a8.5,8.5,0,0,1,17,0V21h-17Z" />
            </svg>
          </label>
        </div>
        <!-- TODO(boka):  data-balloon="Edit Poll" data-balloon-pos="down" -->
        <div class="poll-control" v-if="canEdit()">
          <input id="editPoll" class="icon" type="checkbox" v-model="editPoll">
          <label for="editPoll" @click="scrollPollView()">
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
    <!-- TODO(boka): slide-toggle="editPoll" initial-state="closed" -->
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
            <!-- TODO(boka): value="1" -->
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
            {{ pollCopy.expiration ? 'Exp: ' + humanDate(pollCopy.expiration) : 'No Expiration. '}}</span>
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

export default {
  props: ['poll', 'thread', 'userPriority', 'reset'],
  setup(props) {
    /* Internal Methods */
    const calculatePollPercentage = () => {
      v.pollCopy.totalVotes = 0
      v.pollCopy.answers.forEach(answer => { v.pollCopy.totalVotes += answer.votes })
      v.pollCopy.answers.map(answer => {
        var percentage = (answer.votes/v.pollCopy.totalVotes) * 100 || 0
        percentage = +percentage.toFixed(1)
        answer.style = { width: percentage + '%' }
        answer.percentage = percentage
      })
    }
    const votingEligible = () => {
      if (!$auth.loggedIn) { return false }
      // TODO(boka): check for banned */
      // if ($scope.banned) { return false }
      else if (!v.permissionUtils.hasPermission('threads.vote.allow')) { return false }
      else if (v.pollCopy.locked) { return false }
      else if (v.pollCopy.expired) { return false }
      else { return true }
    }
    /* View Methods */
    const canLock = () => {
      if (!$auth.loggedIn) { return false }
      // TODO(boka): check for banned */
      // if ($scope.banned) { return false }
      if (!v.permissionUtils.hasPermission('threads.lockPoll.allow')) { return false }

      if (props.thread.user.id === $auth.user.id) { return true }
      else if (v.permissionUtils.hasPermission('threads.lockPoll.bypass.owner.admin')) { return true }
      else if (v.permissionUtils.hasPermission('threads.lockPoll.bypass.owner.priority') && v.permissionUtils.getPriority() < props.userPriority) { return true }
      else if (v.permissionUtils.hasPermission('threads.lockPoll.bypass.owner.mod') && v.permissionUtils.moderatesBoard(props.thread.board_id)) { return true }
      else { return false }
    }
    const canEdit = () => {
      if (!$auth.loggedIn) { return false }
      // TODO(boka): check for banned */
      // if ($scope.banned) { return false }
      if (!v.permissionUtils.hasPermission('threads.editPoll.allow')) { return false }

      if (props.thread.user.id === $auth.user.id) { return true }
      else if (v.permissionUtils.hasPermission('threads.editPoll.bypass.owner.admin')) { return true }
      else if (v.permissionUtils.hasPermission('threads.editPoll.bypass.owner.priority') && v.permissionUtils.getPriority() < props.userPriority) { return true }
      else if (v.permissionUtils.hasPermission('threads.editPoll.bypass.owner.mod') && v.permissionUtils.moderatesBoard(props.thread.board_id)) { return true }
      else { return false }
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
      pollsApi.editPoll(props.thread.id, props.poll.id, v.options)
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
      const pollId = props.thread.poll.id
      const answerIds = v.pollAnswers

      pollsApi.vote(threadId, pollId, answerIds)
        .then(poll => {
          v.pollCopy = poll
          calculatePollPercentage()
        })
    }
    const removeVote = () => {
      const threadId = props.thread.id
      const pollId = props.thread.poll.id

      pollsApi.removeVote(threadId, pollId)
        .then(poll => {
          v.pollCopy = poll
          calculatePollPercentage()
        })
    }
    const updateLockPoll = () => {
      if(v.pollCopy.locked) {
        pollsApi.unlock(props.thread.id, props.poll.id)
      }
      else {
        pollsApi.lock(props.thread.id, props.poll.id)
      }
    }
    const calcExpiration = () => {
      var month, day, year, hour, minutes, valid = false
      if (v.options.expiration_date) {
        var date = new Date(v.options.expiration_date)
        valid = true
        month = date.getMonth()
        day = date.getDate()
        year = date.getFullYear()
      }

      if (valid && v.options.expiration_time) {
        var time = new Date(v.options.expiration_time)
        hour = time.getHours()
        minutes = time.getMinutes()
      }

      if (valid) {
        v.options.expiration = new Date(year, month, day, hour || 0, minutes || 0)
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
      permissionUtils: $auth.permissionUtils,
      options: {
        expiration: props.poll.expiration || undefined,
        change_vote: props.poll.change_vote,
        max_answers: props.poll.max_answers,
        display_mode: props.poll.display_mode
      },
      editPoll: false,
      pollAnswers: [],
      pollCopy: cloneDeep(props.poll)
    })
    /* Data Initialization */
    // poll expiration
    if (v.pollCopy.expiration) {
      // set poll expired
      var expiry = new Date(v.pollCopy.expiration)
      v.pollCopy.expired = expiry < Date.now()

      // set options expiration
      var datetime = new Date(v.pollCopy.expiration)
      v.options.expiration_date = datetime
      v.options.expiration_time = datetime
    }
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
<style lang="scss">
poll-creator {
  display: flex;
  flex-direction: column;
}

.polls {
  @include border-radius(4px);
  flex: 2 0 40vh;
  border: 1px solid $border-color;
  box-shadow: 0 2px 24px rgba(0, 0, 0, .1);
  color: $sub-header-font-color;
  margin: 1.5rem 0;
  max-height: calc(100vh - 16rem);
  min-height: 200px;
  overflow-x: hidden;
  overflow-y: scroll;
  .ng-enter { @include transition(0.3s ease-in all); opacity: 0; }
  .ng-enter-active { opacity: 1; }
  .ng-leave { display: none; }
  button { margin: 0.5rem 0 0; width: 100%; }

  .editor-container & {
    border-radius: 0;
    border: none;
    box-shadow: none;
  }

  // poll creation
  &.poll-form {
    max-height: 100%;
    padding: 1rem 1rem 2rem;

    .editor-container & {
      border-bottom: $border;;
      border-top: $border;
      margin: 0;
    }

    .section-poll-questions {
      border-bottom: $border;
      margin-bottom: 1rem;
    }

    h1 {
      color: $secondary-font-color;
      font-size: $font-size-lg;
      font-weight: 400;
      text-transform: initial;
    }

    .checkbox-group {
      align-items: center;
      display: flex;
      margin-bottom: 0.5rem;
    }

    input[type="checkbox"] {
      margin: 0;
      margin-right: 0.5rem;
      padding: 0;
    }

    label {
      margin: 0;
    }

    .actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 1rem 0;
    }

    button {
      margin: 0;
      width: max-content;
    }

    .answer-row {
      margin-bottom: 0.625rem;
      &:last-of-type { margin-bottom: 1rem; }

      input {
        margin-bottom: 0;
      }


      .field-inline-action {
        position: relative;

        input {
          display: inline-block;  margin-bottom: 0;
        }

        button {
          border: none;
          display: inline-block;
          margin: 0;
          right: 0.25rem;
          top: 0.25rem;
          padding: 0;
          height: 1.825rem;
          width: 1.825rem;
          position: absolute;

          i {
            margin: 0;
          }
        }
      }
    }

    .poll-options-expiration {
      margin-bottom: 1rem;

      .fieldgroup {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));

        input {
          margin-bottom: 0;
        }
      }
    }
  }

  .poll-title {
    background-color: $base-background-color;
    border-bottom: $border;
    color: $secondary-font-color;
    display: flex;
    align-items: center;
    font-size: $font-size-xs;
    padding: 0.5rem 1rem;
    position: sticky;
    top: 0;
    z-index: 1000;
    text-transform: uppercase;

    .poll-title-text {
      flex: 1 0 auto;
    }

    .poll-controls {
      display: flex;
      justify-self: flex-end;

      @include break-mobile-sm {
        text-align: right;
      }
    }
    .poll-control {
      margin-left: 0.5rem;

      label {
        display: flex;
        align-items: center;
      }

      .icon {
        display: none;
        & + label:before { font-size: 1.4rem; color: $secondary-font-color-light; }
        &:checked + label:before { color: $color-primary; }
      }

      svg {
        width: 0.875rem;
      }

      &.is_locked {
        svg {
          fill: $color-primary;
        }
      }
    }
  }

  .poll-body {
    padding: 1rem;
  }

  // header section
  .poll-header {
    display: flex;
    flex-direction: column;
    // flex-wrap: wrap;
    margin-bottom: 0.5rem;

    .poll-question {
      color: $base-font-color;
      font-size: $font-size-base;
      margin-bottom: 0.5rem;
      line-height: 1.2;
      text-transform: none;
    }

    .poll-header-main {
      // flex: 4 1 auto;
      margin-bottom: 0.5rem;
    }

    .poll-details {
      line-height: 1;

      .poll-info {
        color: $secondary-font-color-dark;
        font-size: $font-size-xs;
        // font-weight: bold;
        @include transition(color 0.25s ease-in);
        &.highlight { color: red; }
      }
      &.small { width: 8rem; }
    }
  }
  // poll edit section
  .poll-edit-container {
    padding: 0.5rem 1rem 1rem;
    background-color: $sub-header-color;

    .panelTitle {
      color: $secondary-font-color;
      font-size: $font-size-sm;
      margin-bottom: 0.5rem;
    }
  }

  .pollEdit__expiration {
    margin-bottom: 1rem;
    input {
      margin-bottom: 0.25rem;
    }
  }

  .pollGroup__header {
    font-size: $font-size-sm;
  }

  // poll answers section
  $poll__questionOffset: 1.5rem;

  .poll-answer {
    margin: 0.5rem 0;
    padding-bottom: 0.5rem;
    &:first { margin-top: 0;}
    .fill-row:not(:last-child) { margin-bottom: 0.5rem; }
    .one-third-column { padding-top: 0.2rem; }

    .poll-select {
      border-radius: 3px;
      padding: 0.5rem 0 0.5rem $poll__questionOffset;
      color: $sub-header-secondary-font-color;
      font-size: $font-size-base;
      font-weight: normal;
      line-height: 1.2;
      position: relative;

      input {
        margin-bottom: 0;
        margin-left: -1.25rem;
      }

      &.voted {
        // margin-left: $poll__questionOffset;
      }

      &.active { border-color: $color-primary-transparent; background-color: $color-primary-transparent; }
    }
    // votes bar
    .poll-results {
      display: flex;
      flex-direction: column;
      margin-left: $poll__questionOffset;
      margin-top: 0.125rem;
      margin-bottom: 0.25rem;
    }
    .poll-results-data {
      color: $secondary-font-color-dark;
      // flex: 1 0 220px;
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
      // padding: 0 1rem;
      // order: 2;
    }

    .poll-results-value {
      font-weight: 600;
    }

    .poll-bar {
      @include transition(250ms linear all);
      position: relative;
      height: 0.25rem;
      background-color: $border-color;
      margin-right: 1rem;
      // flex: 4 0 auto;
      span {
        position: absolute;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        line-height: 1.4625rem;
      }
      .poll-answer-fill { max-width: 20%; right: 0.625rem; }
      section {
        background-color: $color-primary;
        border-right: 1px solid $base-background-color;
        height: 100%;
      }
    }

    .selected-answer {
      .selected-answer-icon {
        position: absolute;
        top: 10px;
        left: 0;
        svg {
          fill: $color-primary;
        }
      }

      section {
        background-color: $color-primary;
      }
    }
  }

  button,
  .button {
    // float: none;
    // margin-left: $poll__questionOffset;
    // margin-top: 2rem;
    max-width: 320px;
  }

  .actionsBar {
    background-color: $base-background-color;
    padding: 1rem;
    position: sticky;
    bottom: 0;
  }

  @include break-mobile-sm {
    .poll-info .fourth-columns { margin-bottom: 0.5rem; }
    .poll-answer .poll-bar .poll-answer-fill { max-width: 30%; }
    .poll-answer .poll-select.active { background-color: transparent; }
    .poll-answer .one-third-column { padding-top: 0; }
    // .poll-header .poll-controls { width: 100%; text-align: center; }
    .poll-header .poll-control { margin: 0.5rem; }
    // .poll-header .poll-details .poll-info { display: block; }
    .poll-header .poll-details, .poll-header .poll-details.small { width: 100%; padding-left: 0; }
  }

  @include break-mobile-sm {
    poll-header {
      flex-direction: column;

      .poll-header-main {
        flex: none;
      }
    }

    .poll-answer {
      .poll-results-data {
        flex: none;
      }
    }

    button, .button {
      margin-left: 0;
      margin-top: 1rem;
    }
  }
}

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
