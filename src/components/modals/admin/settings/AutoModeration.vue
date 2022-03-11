<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="add">Add Auto Moderation Rule</span>
      <span v-if="edit">Edit Auto Moderation Rule</span>
      <span v-if="remove">Delete Auto Moderation Rule</span>
    </template>

    <template v-slot:body>
      <form class="css-form" novalidate>
        <h5 class="thin-underline">Rule Information</h5>

        <!-- Name -->
        <label class="desc-label">Name</label>
        <input type="text" class="input-text" ng-model="vm.viewedRule.name" modal-focus="{{vm.viewable}}" required />

        <!-- Description -->
        <label class="desc-label">Description</label>
        <textarea class="input-text" ng-model="vm.viewedRule.description"></textarea>

        <br />

        <!-- Conditions -->
        <div class="column-container">
          <div class="half-column">
            <h5 ng-class="{'rule-red':vm.viewedRule.conditions.length<1}">
              Conditions
              <span class="info-tooltip" data-balloon="Conditions allow you to match text within a post, thread, or even by a particular user. Conditions can be stacked allowing you to auto moderate things such as a specific user posting in a specific thread" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            </h5>
          </div>
          <!-- Add Condition -->
          <div class="half-column">
            <a href="#" class="right" ng-click="vm.addCondition()">
              <i class="fa fa-plus"></i>&nbsp;&nbsp;Add More Conditions
            </a>
          </div>
        </div>
        <div class="thin-underline"></div>

        <section class="boxed-section" ng-repeat="cond in vm.viewedRule.conditions">
          <div class="header">
            Condition {{$index+1}}
            <div class="right" ng-show="vm.viewedRule.conditions.length > 1">
              <a ng-click="vm.removeCondition($index)">
                <i class="fa fa-trash"></i>
              </a>
            </div>
          </div>

          <div class="content">
            <div class="fill-row">
              <label class="desc-label">
                Parameter
              </label>
              <select type="text" class="input-text" ng-model="cond.param" required >
                <option value="body">Post Body - Detect keyword/phrase in post body</option>
                <option value="thread_id">Thread ID - Detect keyword/phrase in a particular thread</option>
                <option value="user_id">User ID - Detect keyword/phrase when post is made by a particular user</option>
                <option value="title">Post Title - Detect keyword/phrase in the post title</option>
              </select>
            </div>

            <label class="desc-label">Regex - <a href="https://www.regular-expressions.info/quickstart.html">Need regex help?</a></label>
            <div class="column-container">
              <div class="rule-regex-slash">/</div>
              <div class="rule-regex-input">
                <input type="text" class="input-text" ng-model="cond.regex.pattern" placeholder="Regex Pattern" required />
              </div>
              <div class="rule-regex-slash">/</div>
              <div class="rule-regex-flags">
                <input type="text" class="input-text" ng-model="cond.regex.flags" placeholder="Regex Flags" />
              </div>
            </div>
          </div>
        </section>

        <section class="rule-no-selections" ng-if="vm.viewedRule.conditions.length === 0" ng-init="vm.addCondition()">
          Please add at least one condition
        </section>

        <br /><br />

        <!-- Actions -->
        <h5 class="thin-underline" ng-class="{'rule-red': vm.viewedRule.actions.length < 1}">
          Actions
          <span class="info-tooltip" data-balloon="Actions are the moderation action that will take place when a match on the condition in the previous step is made. Actions can be stacked, with a minimum of one action being required" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        </h5>
        <div class="column-container">
          <div class="half-column rule-action" ng-class="{checked: vm.viewedRule.actions.indexOf('reject') > -1}" ng-click="vm.toggleActionSelection('reject')">
              <label class="desc-label">Reject Post</label>
          </div>
          <div class="half-column rule-action" ng-class="{checked: vm.viewedRule.actions.indexOf('edit') > -1}" ng-click="vm.toggleActionSelection('edit')">
              <label class="desc-label">Edit Post Body</label>
          </div>
          <div class="half-column rule-action" ng-class="{checked: vm.viewedRule.actions.indexOf('ban') > -1}" ng-click="vm.toggleActionSelection('ban')">
              <label class="desc-label">Ban User</label>
          </div>
          <div class="half-column rule-action" ng-class="{checked: vm.viewedRule.actions.indexOf('delete') > -1}" ng-click="vm.toggleActionSelection('delete')">
              <label class="desc-label">Allow Post but display as deleted</label>
          </div>
        </div>

        <br /><br />

        <!-- Options -->
        <h5 class="thin-underline">Options</h5>

        <section class="rule-no-selections" ng-if="vm.viewedRule.actions.length === 0 || (vm.viewedRule.actions.length === 1 && vm.viewedRule.actions[0] === 'delete')">
          No Options to display
        </section>

        <!-- Reject -->
        <section class="boxed-section" ng-if="vm.viewedRule.actions.indexOf('reject') > -1">
          <div class="header">Reject Post Options</div>
          <div class="content">
            <label class="desc-label">Error Message
              <span class="info-tooltip" data-balloon="The error message the user should receive when their post is rejected for this auto moderation rule" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            </label>
            <input type="text" class="input-text" ng-model="vm.viewedRule.message" ng-disabled="vm.viewedRule.actions.indexOf('reject') < 0" />
          </div>
        </section>

        <!-- Ban -->
        <section class="boxed-section" ng-if="vm.viewedRule.actions.indexOf('ban') > -1">
          <div class="header">Ban User Options</div>
          <div class="content">
            <label class="desc-label">Days Banned
              <span class="info-tooltip" data-balloon="The number of days to ban the user for, left blank for a permanent ban" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            </label>
            <input type="number" ng-model="vm.viewedRule.options.ban_interval" min="0" ng-disabled="vm.viewedRule.actions.indexOf('ban') < 0" />
          </div>
        </section>

        <!-- Edit -->
        <section class="boxed-section" ng-if="vm.viewedRule.actions.indexOf('edit') > -1">
          <div class="header">Edit Post Body Options</div>
          <div class="content">
            <!-- Edit Template -->
            <label class="desc-label">Template
              <span class="info-tooltip" data-balloon="Allows the user's post to be edited. The {body} tag in this text area will be replaced with the user's actual post, so a message can be appeneded, prepended or replaced all together by removing the {body} tag" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            </label>
            <textarea class="input-text" ng-model="vm.viewedRule.options.edit.template" ng-class="{'rule-red-border': vm.viewedRule.options.edit.template.length && vm.viewedRule.options.edit.template.indexOf('{body}') < 0}" ng-disabled="vm.viewedRule.actions.indexOf('edit') < 0" placeholder="*Pre-append message* {body} *Post-apprend message*" ></textarea>

            <br /><hr /><br />

            <!-- Edit Replace -->
            <div class="fill-row">
              <label class="desc-label">Replacement Text
                <span class="info-tooltip" data-balloon="The text which will replace the keyword or phrase matched by the regex below" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
              </label>
              <input type="text" class="input-text" ng-model="vm.viewedRule.options.edit.replace.text" ng-disabled="vm.viewedRule.actions.indexOf('edit') < 0" />
            </div>

            <label class="desc-label">Regex - <a href="https://www.regular-expressions.info/quickstart.html">Need regex help?</a></label>
            <div class="column-container">
              <div class="rule-regex-slash">/</div>
              <div class="rule-regex-input">
                <input type="text" class="input-text" ng-model="vm.viewedRule.options.edit.replace.regex.pattern" ng-disabled="vm.viewedRule.actions.indexOf('edit') < 0" />
              </div>
              <div class="rule-regex-slash">/</div>
              <div class="rule-regex-flags">
                <input type="text" class="input-text" ng-init="vm.viewedRule.options.edit.replace.regex.flags = 'gi'" ng-model="vm.viewedRule.options.edit.replace.regex.flags" ng-disabled="vm.viewedRule.actions.indexOf('edit') < 0" />
              </div>
            </div>
          </div>
        </section>

        <br />

        <!-- Save Button -->
        <div class="column-container">
          <button class="fill-row" ng-click="vm.saveRule(vm.viewedRule)" ng-disabled="vm.submitDisabled()">
            Save
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject, watch } from 'vue'
// import { adminApi } from '@/api'
import { cloneDeep } from 'lodash'

export default {
  name: 'auto-moderation-modal',
  props: ['show', 'add', 'edit', 'remove', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.remove ? 'Confirm Delete' : 'Save'
    }

    const modifyRule = () => {
      v.requestSubmitted = true
      $alertStore.success('Success!')
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
      countValid: false,
      rule: {},
      saveRuleBtnLabel: props.remove ? 'Confirm Delete' : 'Save',
      requestSubmitted: false,
    })

    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.remove ? 'Confirm Delete' : 'Save'
      v.rule = props.edit || props.remove ? cloneDeep(props.selected) : {}
    })

    return { ...toRefs(v), modifyRule, close }
  }
}
</script>

<style lang="scss">
  .input-spacing { margin-bottom: 1rem; }
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
