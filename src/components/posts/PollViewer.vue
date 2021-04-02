<template>
  <div class="polls" id="poll-view" v-if="poll">
    <!-- Poll Header -->
    <div class="poll-title">
      <span class="poll-title-text">
        Poll
        <span class="is__locked" v-if="pollLocked">(Locked)</span>
      </span>
      <div class="poll-controls">
        <!-- Poll Controls -->
        <!-- TODO(boka): data-balloon="Lock Poll" data-balloon-pos="down" -->
        <div class="poll-control" v-if="canLock()" :class="{'is__locked' : pollLocked}">
          <input id="lockPoll" class="icon" type="checkbox" v-model="pollLocked">
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
    <div class="poll-edit" :hidden="!editPoll" v-if="canEdit()">
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
            <input type="number" id="pollMaxVote" min="1" max="{{poll.answers.length}}" v-model="options.max_answers">
            <div class="pollGroup__header"><label>Show poll results: </label>
              <label for="displayAlways">
                <!-- TODO(boka): value="always" -->
                <input type="radio" id="displayAlways" v-model="options.display_mode">
                Always shown
              </label>
              <label for="displayVoted">
                <!-- TODO(boka): value="voted" -->
                <input type="radio" id="displayVoted" v-model="options.display_mode">
                After voting
              </label>
              <label for="displayExpired">
                <!-- TODO(boka): value="expired" -->
                <input type="radio" id="displayExpired" v-model="options.display_mode" :disabled="!options.expiration">
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
          <h1 class="poll-question">{{poll.question}}</h1>
          <div class="poll-details">
            <span class="poll-info" v-if="poll.display_mode === 'always'">Results Always Shown. </span>
            <span class="poll-info" v-if="poll.display_mode === 'voted'">Results After Voting. </span>
            <span class="poll-info" :class="{'highlight':!poll.expired && !canVote() }" v-if="poll.display_mode === 'expired'">Results After Expiration. </span>
            <span class="poll-info" :class="{'highlight':poll.expired}">
            <!-- {{ poll.expiration ? 'Exp: ' + (poll.expiration | date : 'short') : 'No Expiration. '}}</span> -->
            {{ poll.expiration ? 'Exp: ' + humanDate(poll.expiration) : 'No Expiration. '}}</span>
            <span class="poll-info" :class="{'highlight':pollAnswers.length===poll.max_answers}">{{poll.max_answers + ' choice. ' + (poll.max_answers > 1 ? 's':'')}}</span>
            <span class="poll-info" v-if="!poll.change_vote">Votes are Permanent. </span>
            <span class="poll-info" v-if="poll.change_vote">Votes can be changed. </span>
          </div>
        </div>
      </div>

      <!-- Poll Results -->
      <div class="poll-answer" v-for="(answer) in poll.answers" :key="answer.id">
        <div :class="{ 'poll-answer-row':showPollResults(), 'selected-answer':answer.selected }">
          <label class="poll-select" :class="{ 'active':pollAnswers.indexOf(answer.id) > -1, 'default-cursor voted':!canVote() }">
            <span v-if="answer.selected" class="selected-answer-icon">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <title></title>
                <path d="M24,2A22,22,0,1,0,46,24,22,22,0,0,0,24,2ZM21,34.22l-10-10,2.82-2.83L21,28.56l14-14,2.82,2.83Z" />
              </svg>
            </span>
            <input v-if="poll.max_answers === 1 && canVote()" @click="pollAnswers.pop(); toggleAnswer(answer.id);" name="pollanswer" type="radio">
            <input type="checkbox" @click="toggleAnswer(answer.id)" :disabled="pollAnswers.length >= poll.max_answers && pollAnswers.indexOf(answer.id) === -1" :checked="pollAnswers.indexOf(answer.id) > -1" v-if="poll.max_answers > 1 && canVote()"/>
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
import { reactive, toRefs, watch } from 'vue'

export default {
  props: ['poll', 'thread', 'userPriority', 'reset'],
  setup(props) {
    const calculatePollPercentage = () => {
      v.poll.totalVotes = 0
      v.poll.answers.forEach(answer => { v.poll.totalVotes += answer.votes })
      v.pollAnswers.map(answer => {
        var percentage = (answer.votes/v.poll.totalVotes) * 100 || 0
        percentage = +percentage.toFixed(1)
        answer.style = { width: percentage + '%' }
        answer.percentage = percentage
      });
    }
    const canLock = () => {
      console.log('PollViewer canLock')
      return true
    }
    const canEdit = () => {
      console.log('PollViewer canEdit')
      return true
    }
    const canVote = () => {
      console.log('PollViewer canVote')
      return true
    }
    const canRemoveVote = () => {
      console.log('PollViewer canRemoveVote')
      return true
    }
    const pollValid = () => {
      console.log('PollViewer pollValid')
      return true
    }
    const showPollResults = () => {
      console.log('PollViewer showPollResults')
      return true
    }
    const vote = () => {
      console.log('PollViewer vote')
    }
    const removeVote = () => {
      console.log('PollViewer removeVote')
    }
    const calcExpiration = () => {
      var month, day, year, hour, minutes, valid = false;
      if (v.options.expiration_date) {
        var date = new Date(v.options.expiration_date);
        valid = true;
        month = date.getMonth();
        day = date.getDate();
        year = date.getFullYear();
      }

      if (valid && v.options.expiration_time) {
        var time = new Date(v.options.expiration_time);
        hour = time.getHours();
        minutes = time.getMinutes();
      }

      if (valid) {
        v.options.expiration = new Date(year, month, day, hour || 0, minutes || 0);
        if (v.options.expiration < Date.now()) { v.options.expiration = undefined; }
      }
      else { v.options.expiration = undefined; }

      if (!v.options.expiration && v.options.display_mode === 'expired') {
        v.options.display_mode = 'always';
      }
    }
    const v = reactive({
      options: {
        expiration: props.poll.expiration || undefined,
        change_vote: props.poll.change_vote,
        max_answers: props.poll.max_answers,
        display_mode: props.poll.display_mode
      },
      editPoll: false,
      pollAnswers: props.poll.answers,
      pollLocked: props.poll.locked,
      poll: props.poll
    })
    /* Data Initialization */
    // poll expiration
    if (v.poll.expiration) {
      // set poll expired
      var expiry = new Date(v.poll.expiration)
      v.poll.expired = expiry < Date.now()

      // set options expiration
      var datetime = new Date(v.poll.expiration)
      v.options.expiration_date = datetime
      v.options.expiration_time = datetime
    }
    // poll percentages
    calculatePollPercentage()

    /* Watched Data */
    watch(() => v.pollAnswers, () => calculatePollPercentage())

    return {
      ...toRefs(v),
      canLock,
      canEdit,
      canVote,
      canRemoveVote,
      pollValid,
      showPollResults,
      vote,
      removeVote,
      calcExpiration,
      humanDate
    }
  }
}
</script>
