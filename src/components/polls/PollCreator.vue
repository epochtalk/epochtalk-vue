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
          <span class="fieldgroup-label">Poll expires at -- {{(poll.expiration|humanDate) || 'No Expiration'}}</span>
          <div class="fieldgroup">
            <input type="date" id="pollExpirationDate" ng-model="poll.expiration_date" ng-change="calcExpiration()">
            <input type="time" v-model="poll.expiration_time" v-change="calcExpiration()">
          </div>
        </label>
      </div>

      <div class="poll-options-answers">
        <label for="pollMaxVote">Maximum answers per vote:</label>
        <input type="number" id="pollMaxVote" min="1" :max="poll.answers.length" value="1" v-model="poll.max_answers">

        <div class="">
          <label>Show poll results: </label>
          <label for="displayAlways">
            <input type="radio" id="displayAlways" v-model="poll.display_mode"value="always">
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