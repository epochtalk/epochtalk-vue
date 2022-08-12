<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="add">Add IP Blacklist Rule</span>
      <span v-if="edit">Edit IP Blacklist Rule</span>
      <span v-if="remove">Delete IP Blacklist Rule</span>
    </template>

    <template v-slot:body>
        <form class="css-form">
          <label>Enter Rule Name
            <input type="text" placeholder="Rule Name" v-model="rule.note" :disabled="requestSubmitted || remove" ref="focusInput" required />
          </label>

          <label for="ruleType">Select Rule Type:</label>
          <input type="radio" class="pointer" name="ruleType" @click="formValid = rule.note && ipRegex.test(rule.ip)" v-model="rule.type" :value="0" id="single" :disabled="requestSubmitted || remove" required />
          <label for="single">Single IP</label>

          <input type="radio" class="pointer" name="ruleType" @click="formValid = rule.note && ipRegex.test(rule.start) && ipRegex.test(rule.end)" v-model="rule.type" :value="1" id="range" :disabled="requestSubmitted || remove" required />
          <label for="range">IP Range</label>

          <input type="radio" class="pointer" name="ruleType" @click="formValid = rule.note && blockIpRegex.test(rule.blockOne) && blockIpWildcardRegex.test(rule.blockTwo) && blockIpWildcardRegex.test(rule.blockThree) && blockIpWildcardRegex.test(rule.blockFour)" v-model="rule.type" :value="2" id="wildcard" :disabled="requestSubmitted || remove" required />
          <label for="wildcard">Wildcard IP</label>

          <div v-if="rule.type === 0" class="single-ip">
            <label>Enter a single IPV4 or IPV6 address
              <input type="text" v-model="rule.ip" placeholder="Ex: 203.0.113.15 or 2001:0db8:0f61:a1ff:0000:0000:0000:0080" required />
            </label>
          </div>

          <div v-if="rule.type === 1">
            <label>Enter a range of IPV4 or IPV6 addresses</label>
            <div class="col">
              <div>
                <input type="text" v-model="rule.start" placeholder="Start Ex: 203.0.113.0 or 2001:0db8:0000:0000:0000:0000:0000:0000" :disabled="requestSubmitted || remove" required />
              </div>
              <div>
                <input type="text" v-model="rule.end" placeholder="End Ex: 203.0.113.255 or 2001:0db8:ffff:ffff:ffff:ffff:ffff:ffff" :disabled="requestSubmitted || remove" required />
              </div>
            </div>
          </div>

          <div v-if="rule.type === 2">
            <label>Enter an IPV4 wildcard</label>
            <div class="wildcard col">
              <input type="text" v-model="rule.blockOne" placeholder="203" maxlength="3" :disabled="requestSubmitted || remove" required />
              <input type="text" v-model="rule.blockTwo" :disabled="requestSubmitted || remove" placeholder="0" maxlength="3" required />
              <input type="text" v-model="rule.blockThree" :disabled="requestSubmitted || remove" placeholder="113" maxlength="3" required />
              <input type="text" v-model="rule.blockFour" placeholder="*" maxlength="3" :disabled="requestSubmitted || remove" required />
            </div>
          </div>

          <div class="col">
            <div>
              <button class="fill-row" @click.prevent="modifyRule()" :disabled="requestSubmitted || (!formValid && !remove)" v-html="saveRuleBtnLabel"></button>
            </div>
            <div>
              <button class="fill-row" v-if="add" @click.prevent="modifyRule(true)" :disabled="requestSubmitted || !formValid" v-html="saveContinueBtnLabel"></button>
              <button class="fill-row negative" v-if="edit || remove" @click.prevent="close()" :disabled="requestSubmitted">Cancel</button>
            </div>
          </div>
        <label v-if="errorMessage" class="red centered-text">{{errorMessage}}</label>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject, watch } from 'vue'
import { adminApi } from '@/api'
import { ipRegex, blockIpRegex, blockIpWildcardRegex } from '@/composables/utils/globalRegex'
import { debounce } from 'lodash'

export default {
  name: 'blacklist-modal',
  props: ['show', 'messageId', 'add', 'edit', 'remove', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const formatIPRule = rule => {
      let formattedRule = { id: rule.id, note: rule.note };

      if (rule.type === 0) { // single
        formattedRule.ip_data = rule.ip;
      }
      else if (rule.type === 1) { // range
        let ipv6Start = rule.start.indexOf(':') > -1
        let ipv6End = rule.end.indexOf(':') > -1
        let ipv4Start = rule.start.indexOf('.') > -1
        let ipv4End = rule.end.indexOf('.') > -1
        if ((ipv6Start && ipv4End) || (ipv4Start && ipv6End)) {
          $alertStore.error('Start and End address must both be either IPV4 or IPV6')
          rule.end = ''
          return
        }
        formattedRule.ip_data = rule.start + '-' + rule.end
      }
      else { // wildcard
        formattedRule.ip_data = rule.blockOne + '.' + rule.blockTwo + '.' +
          rule.blockThree + '.' + rule.blockFour
      }
      return formattedRule
    }

    const resetForm = saveError => {
      v.errorMessage = saveError ? v.errorMessage : null
      v.rule = saveError ? v.rule : { type: 0 }
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.remove ? 'Confirm Delete' : 'Save'
      v.saveContinueBtnLabel = 'Save and Continue'
    }

    const modifyRule = saveAndContinue => {
      v.errorMessage = null
      v.requestSubmitted = true
      if (saveAndContinue) v.saveContinueBtnLabel = 'Loading...'
      else v.saveRuleBtnLabel = 'Loading...'
      let requestRule = formatIPRule(v.rule)
      if (!requestRule) {
        resetForm()
        return
      }
       if (props.add) {
        adminApi.blacklist.add(requestRule)
        .then(() => {
          emit('success')
          $alertStore.success(`Successfully added blacklist rule!`)
        })
        .catch(() => v.errorMessage = `There was an error adding blacklist rule.`)
        .finally(() => {
          if (!v.errorMessage && saveAndContinue) resetForm()
          else if (!v.errorMessage) close()
          else resetForm(true)
        })
       }
       else if (props.edit) {
        adminApi.blacklist.update(requestRule)
        .then(() => {
          emit('success')
          $alertStore.success(`Successfully updated blacklist rule!`)
        })
        .catch(() => v.errorMessage = `There was an error updating blacklist rule.`)
        .finally(() => {
          if (!v.errorMessage && saveAndContinue) resetForm()
          else if (!v.errorMessage) close()
          else resetForm(true)
        })
       }
       else if (props.remove) {
        adminApi.blacklist.delete(props.selected.id)
        .then(() => {
          emit('success')
          $alertStore.success(`Successfully deleted blacklist rule!`)
        })
        .catch(() => v.errorMessage = `There was an error deleting blacklist rule.`)
        .finally(() => {
          if (!v.errorMessage && saveAndContinue) resetForm()
          else if (!v.errorMessage) close()
          else resetForm(true)
        })
       }
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      rule:  { type: 0 } ,
      saveRuleBtnLabel: props.remove ? 'Confirm Delete' : 'Save',
      saveContinueBtnLabel: 'Save and Continue',
      requestSubmitted: false,
      formValid: false,
      errorMessage: ''
    })

    /* Watch Data */
    watch(() => props.show, () => {
      v.saveRuleBtnLabel = 'Save'
      if (props.add) v.rule = { type: 0 }
      else if (props.edit) {
        v.rule = { ...props.selected, type: 1 }
        if (v.rule.ip_data.indexOf('*') > -1) { // wildcard type 2
          let blocks = v.rule.ip_data.split('.')
          v.rule.type = 2
          v.rule.blockOne = blocks[0]
          v.rule.blockTwo = blocks[1]
          v.rule.blockThree = blocks[2]
          v.rule.blockFour = blocks[3]
        }
        else if (v.rule.ip_data.indexOf('-') > -1) { // range type 1
          v.rule.type = 1
          let range = v.rule.ip_data.split('-')
          v.rule.start = range[0]
          v.rule.end = range[1]
        }
        else { // standard ip
          v.rule.type = 0
          v.rule.ip = v.rule.ip_data
        }
      }
      else if (props.remove) {
        v.rule = { ...props.selected, type: 2 }
        v.saveRuleBtnLabel = 'Confirm Delete'
      }
    })

    watch(() => v.rule.ip, debounce(async val => v.formValid = v.rule.note && v.rule.type === 0 && ipRegex.test(val)))
    watch(() => v.rule.start, debounce(async () => v.formValid = v.rule.note && v.rule.type === 1 && ipRegex.test(v.rule.start) && ipRegex.test(v.rule.end)))
    watch(() => v.rule.end, debounce(async () => v.formValid = v.rule.note && v.rule.type === 1 && ipRegex.test(v.rule.start) && ipRegex.test(v.rule.end)))
    watch(() => v.rule.blockOne, debounce(async () => v.formValid = v.rule.note && v.rule.type === 2 && blockIpRegex.test(v.rule.blockOne) && blockIpWildcardRegex.test(v.rule.blockTwo) && blockIpWildcardRegex.test(v.rule.blockThree) && blockIpWildcardRegex.test(v.rule.blockFour)))
    watch(() => v.rule.blockTwo, debounce(async () => v.formValid = v.rule.note && v.rule.type === 2 && blockIpRegex.test(v.rule.blockOne) && blockIpWildcardRegex.test(v.rule.blockTwo) && blockIpWildcardRegex.test(v.rule.blockThree) && blockIpWildcardRegex.test(v.rule.blockFour)))
    watch(() => v.rule.blockThree, debounce(async () => v.formValid = v.rule.note && v.rule.type === 2 && blockIpRegex.test(v.rule.blockOne) && blockIpWildcardRegex.test(v.rule.blockTwo) && blockIpWildcardRegex.test(v.rule.blockThree) && blockIpWildcardRegex.test(v.rule.blockFour)))
    watch(() => v.rule.blockFour, debounce(async () => v.formValid = v.rule.note && v.rule.type === 2 && blockIpRegex.test(v.rule.blockOne) && blockIpWildcardRegex.test(v.rule.blockTwo) && blockIpWildcardRegex.test(v.rule.blockThree) && blockIpWildcardRegex.test(v.rule.blockFour)))
    return { ...toRefs(v), modifyRule, close, ipRegex, blockIpRegex, blockIpWildcardRegex }
  }
}
</script>

<style lang="scss">
  .single-ip { margin-bottom: 1rem; }
  .col {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    column-gap: 0.5rem;
    div {
      flex: 1;
      button { width: 100%; }
    }
    &.wildcard input { flex: 1; text-align: center; }
  }
</style>
