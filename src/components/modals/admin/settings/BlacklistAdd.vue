<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Add IP Blacklist Rule</template>

    <template v-slot:body>
        <form class="css-form">
          <label>Enter Rule Name
            <input type="text" placeholder="Rule Name" v-model="rule.note" :disabled="addSubmitted" ref="focusInput" required />
          </label>

          <label for="ruleType">Select Rule Type:</label>
          <input type="radio" class="pointer" name="ruleType" v-model="rule.type" :value="0" id="single" :disabled="addSubmitted" required />
          <label for="single">Single IP</label>

          <input type="radio" class="pointer" name="ruleType" v-model="rule.type" :value="1" id="range" :disabled="addSubmitted" required />
          <label for="range">IP Range</label>

          <input type="radio" class="pointer" name="ruleType" v-model="rule.type" :value="2" id="wildcard" :disabled="addSubmitted" required />
          <label for="wildcard">Wildcard IP</label>

          <div v-if="rule.type === 0">
            <label>Enter a single IPV4 or IPV6 address
              <input type="text" v-model="rule.ip" placeholder="Ex: 203.0.113.15 or 2001:0db8:0f61:a1ff:0000:0000:0000:0080" ng-pattern="ipRegex" required />
            </label>
          </div>

          <div v-if="rule.type === 1">
            <label>Enter a range of IPV4 or IPV6 addresses</label>
            <div>
              <div class="half-column">
                <input type="text" v-model="rule.start" placeholder="Start Ex: 203.0.113.0 or 2001:0db8:0000:0000:0000:0000:0000:0000" ng-pattern="ipRegex" :disabled="addSubmitted" required />
              </div>
              <div class="half-column">
                <input type="text" v-model="rule.end" placeholder="End Ex: 203.0.113.255 or 2001:0db8:ffff:ffff:ffff:ffff:ffff:ffff" ng-pattern="ipRegex" :disabled="addSubmitted" required />
              </div>
            </div>
          </div>

          <div v-if="rule.type === 2">
            <label>Enter an IPV4 wildcard</label>
            <div class="wildcard">
              <input type="text" v-model="rule.blockOne" ng-pattern="blockRegex" placeholder="203" maxlength="3" :disabled="addSubmitted" required />
              <input type="text" v-model="rule.blockTwo" :disabled="addSubmitted" ng-pattern="blockWildcardRegex" placeholder="0" maxlength="3" required />
              <input type="text" v-model="rule.blockThree" :disabled="addSubmitted" ng-pattern="blockWildcardRegex" placeholder="113" maxlength="3" required />
              <input type="text" v-model="rule.blockFour" ng-pattern="blockWildcardRegex" placeholder="*" maxlength="3" :disabled="addSubmitted" required />
            </div>
          </div>

          <div class="clear">
            <div class="half-column">
              <button class="fill-row" @click="addRule()"
              :disabled="addSubmitted" v-html="saveRuleBtnLabel"></button>
            </div>
            <div class="half-column">
              <button class="fill-row" @click="addRule(true)"
              :disabled="addSubmitted" v-html="saveContinueBtnLabel"></button>
            </div>
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
  name: 'delete-message-modal',
  props: ['show', 'messageId'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const addRule = () => {
      v.errorMessage = null
      messagesApi.delete(props.messageId)
      .then(() => {
        emit('success')
        $alertStore.success(`Successfully deleted message!`)
      })
      .catch(() => v.errorMessage = `There was an error deleting message, please contact an administrator.`)
      .finally(() => v.errorMessage ? null : close())
    }

    const close = () => {
      v.errorMessage = null
      v.rule = { type: 0 }
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      rule: { type: 0 },
      saveRuleBtnLabel: 'Save',
      saveContinueBtnLabel: 'Save and Continue',
      addSubmitted: false,
      errorMessage: ''
    })

    return { ...toRefs(v), addRule, close }
  }
}
</script>
