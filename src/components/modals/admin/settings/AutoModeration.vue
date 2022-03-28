<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="add">Add Auto Moderation Rule</span>
      <span v-if="edit">Edit Auto Moderation Rule</span>
      <span v-if="remove">Delete Auto Moderation Rule</span>
    </template>

    <template v-slot:body>
      <form class="css-form" novalidate>
        <div v-if="add || edit">
          <h5 class="thin-underline">Rule Information</h5>

          <!-- Name -->
          <label class="desc-label">Name</label>
          <input type="text" class="input-text" v-model="rule.name" modal-focus="{{vm.viewable}}" required />

          <!-- Description -->
          <label class="desc-label">Description</label>
          <textarea class="input-text" v-model="rule.description"></textarea>

          <br />

          <!-- Conditions -->
          <div class="col">
            <div>
              <h5 :class="{'rule-red':rule?.conditions?.length<1}">
                Conditions
                <span class="info-tooltip" data-balloon="Conditions allow you to match text within a post, thread, or even by a particular user. Conditions can be stacked allowing you to auto moderate things such as a specific user posting in a specific thread" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
              </h5>
            </div>
            <!-- Add Condition -->
            <div>
              <a href="#" class="right" @click.prevent="addCondition()">
                <i class="fa fa-plus"></i>&nbsp;&nbsp;Add More Conditions
              </a>
            </div>
          </div>
          <div class="thin-underline"></div>

          <section class="boxed-section" v-for="(cond, index) in rule.conditions" :key="index">
            <div class="header">
              Condition {{index+1}}
              <div class="right" v-if="rule.conditions.length > 1">
                <a href="#" @click.prevent="removeCondition(index)">
                  <i class="fa fa-trash"></i>
                </a>
              </div>
            </div>

            <div class="content">
              <div class="fill-row">
                <label class="desc-label">
                  Parameter
                </label>
                <select class="input-text" v-model="cond.param" required>
                  <option value="body">Post Body - Detect keyword/phrase in post body</option>
                  <option value="thread_id">Thread ID - Detect keyword/phrase in a particular thread</option>
                  <option value="user_id">User ID - Detect keyword/phrase when post is made by a particular user</option>
                  <option value="title">Post Title - Detect keyword/phrase in the post title</option>
                </select>
              </div>

              <label class="desc-label">Regex - <a href="https://www.regular-expressions.info/quickstart.html">Need regex help?</a></label>
              <div class="col">
                <div class="rule-regex-slash">/</div>
                <div class="rule-regex-input">
                  <input type="text" class="input-text" v-model="cond.regex.pattern" placeholder="Regex Pattern" required />
                </div>
                <div class="rule-regex-slash">/</div>
                <div class="rule-regex-flags">
                  <input type="text" class="input-text" v-model="cond.regex.flags" placeholder="Regex Flags" />
                </div>
              </div>
            </div>
          </section>

          <section class="rule-no-selections" v-if="rule.conditions.length === 0">
            Please add at least one condition
          </section>

          <br /><br />

          <!-- Actions -->
          <h5 class="thin-underline" :class="{'rule-red': rule?.actions?.length < 1}">
            Actions
            <span class="info-tooltip" data-balloon="Actions are the moderation action that will take place when a match on the condition in the previous step is made. Actions can be stacked, with a minimum of one action being required" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </h5>
          <div class="col">
            <div class="rule-action" :class="{checked: rule?.actions?.indexOf('reject') > -1}" @click.prevent="toggleActionSelection('reject')">
                <label class="desc-label">Reject Post</label>
            </div>
            <div class="rule-action" :class="{checked: rule?.actions?.indexOf('edit') > -1}" @click.prevent="toggleActionSelection('edit')">
                <label class="desc-label">Edit Post Body</label>
            </div>
          </div>
          <div class="col">
            <div class="rule-action" :class="{checked: rule?.actions?.indexOf('ban') > -1}" @click.prevent="toggleActionSelection('ban')">
                <label class="desc-label">Ban User</label>
            </div>
            <div class="rule-action" :class="{checked: rule?.actions?.indexOf('delete') > -1}" @click.prevent="toggleActionSelection('delete')">
                <label class="desc-label">Allow Post but display as deleted</label>
            </div>
          </div>

          <br /><br />

          <!-- Options -->
          <h5 class="thin-underline" :class="{'rule-red': rule?.actions?.length === 0 }">Options</h5>

          <section class="rule-no-selections" v-if="rule?.actions?.length === 0 || (rule?.actions?.length === 1 && rule?.actions[0] === 'delete')">
            No Options to display
          </section>

          <!-- Reject -->
          <section class="boxed-section" v-if="rule?.actions?.indexOf('reject') > -1">
            <div class="header">Reject Post Options</div>
            <div class="content">
              <label class="desc-label">Error Message
                <span class="info-tooltip" data-balloon="The error message the user should receive when their post is rejected for this auto moderation rule" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
              </label>
              <input type="text" class="input-text" v-model="rule.message" :disabled="rule?.actions?.indexOf('reject') < 0" />
            </div>
          </section>

          <!-- Ban -->
          <section class="boxed-section" v-if="rule?.actions?.indexOf('ban') > -1">
            <div class="header">Ban User Options</div>
            <div class="content">
              <label class="desc-label">Days Banned
                <span class="info-tooltip" data-balloon="The number of days to ban the user for, left blank for a permanent ban" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
              </label>
              <input type="number" v-model="rule.options.ban_interval" min="0" :disabled="rule?.actions?.indexOf('ban') < 0" />
            </div>
          </section>

          <!-- Edit -->
          <section class="boxed-section" v-if="rule?.actions?.indexOf('edit') > -1">
            <div class="header">Edit Post Body Options</div>
            <div class="content">
              <!-- Edit Template -->
              <label class="desc-label">Template
                <span class="info-tooltip" data-balloon="Allows the user's post to be edited. The {body} tag in this text area will be replaced with the user's actual post, so a message can be appeneded, prepended or replaced all together by removing the {body} tag" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
              </label>
              <textarea class="input-text" v-model="rule.options.edit.template" :class="{'rule-red-border': rule?.options?.edit?.template?.length && rule?.options?.edit?.template.indexOf('{body}') < 0}" :disabled="rule?.actions?.indexOf('edit') < 0" placeholder="*Pre-append message* {body} *Post-apprend message*" ></textarea>

              <br /><hr /><br />

              <!-- Edit Replace -->
              <div class="fill-row">
                <label class="desc-label">Replacement Text
                  <span class="info-tooltip" data-balloon="The text which will replace the keyword or phrase matched by the regex below" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
                </label>
                <input v-if="rule.options?.edit?.replace" type="text" class="input-text" v-model="rule.options.edit.replace.text" :disabled="rule?.actions?.indexOf('edit') < 0" />
              </div>

              <label class="desc-label">Regex - <a href="https://www.regular-expressions.info/quickstart.html">Need regex help?</a></label>
              <div class="col">
                <div class="rule-regex-slash">/</div>
                <div class="rule-regex-input">
                  <input v-if="rule.options?.edit?.replace?.regex" type="text" class="input-text" v-model="rule.options.edit.replace.regex.pattern" :disabled="rule?.actions?.indexOf('edit') < 0" />
                </div>
                <div class="rule-regex-slash">/</div>
                <div class="rule-regex-flags">
                  <input v-if="rule.options?.edit?.replace?.regex" type="text" class="input-text" v-model="rule.options.edit.replace.regex.flags" :disabled="rule?.actions?.indexOf('edit') < 0" />
                </div>
              </div>
            </div>
          </section>
        </div>
        <div v-if="remove">
          <p>Are you sure you want to delete this rule?</p>

          <section class="boxed-section">
            <div class="header">
              <span class="large" v-html="rule.name"></span>
            </div>
            <div class="content">
              <div class="desc-label" v-html="rule.description"></div>
            </div>
          </section>
        </div>

        <!-- Save Button -->
        <div class="col">
          <button class="fill-row" @click.prevent="modifyRule()" :disabled="submitDisabled()">
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
import { adminApi } from '@/api'
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
      v.rule = cloneDeep(initRule)
    }

    const modifyRule = () => {
      v.requestSubmitted = true

      // format rule for request
      if (!v.rule.actions.indexOf('reject') < 0) delete v.rule.message
      if (!v.rule.actions.indexOf('ban') < 0) delete v.rule.options.ban_interval
      if (!v.rule.actions.indexOf('edit') < 0) delete v.rule.options.edit
      if (!v.rule.message) delete v.rule.message
      if (v.rule.options.edit.replace) {
        if (!v.rule.options.edit.replace.text) delete v.rule.options.edit.replace.text
        if (!v.rule.options.edit.replace.regex.pattern) delete v.rule.options.edit.replace.regex
        if (!v.rule.options.edit.replace.text || !v.rule.options.edit.replace.regex) delete v.rule.options.edit.replace
      }

      let requestPromise
      if (props.add) requestPromise = adminApi.autoModeration.addRule
      else if (props.edit) requestPromise = adminApi.autoModeration.updateRule
      else if (props.remove) requestPromise = adminApi.autoModeration.deleteRule

      requestPromise(v.rule).then(() => {
        let action = 'added'
        if (props.edit) action = 'edited'
        else if (props.remove) action = 'deleted'
        emit('success')
        $alertStore.success(`Successfully ${action} auto moderation rule ${v.rule.name}!`)
      })
      .catch(() => $alertStore.error('There was an error modifying auto modation rules'))
      .finally(close)
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    const addCondition = () => v.rule.conditions.push({ param: '', regex: { pattern: '', flags: 'gi' } })

    const toggleActionSelection = action => {
      let idx = v.rule.actions.indexOf(action)
      // is currently selected
      if (idx > -1) v.rule.actions.splice(idx, 1)
      // is newly selected
      else v.rule.actions.push(action)
    }

    const removeCondition = index => v.rule.conditions.splice(index, 1)

    const submitDisabled = () => {
      let disabled = false
      if (v.rule.name.length < 1) disabled = true
      if (v.rule.conditions.length < 1) disabled = true
      v.rule.conditions.map(condition => {
        if (!condition.param) disabled = true
        if (!condition.regex.pattern) disabled = true
      })
      if (v.rule.actions.length < 1) disabled = true
      if (v.rule.options.edit.template) {
        let template = v.rule.options.edit.template
        if (template.indexOf('{body}') < 0) disabled = true
      }
      if (v.rule.options.edit.replace) {
        let pattern = v.rule.options.edit.replace.regex.pattern
        let text = v.rule.options.edit.replace.text
        if ((pattern && !text) || (!pattern && text)) disabled = true
      }
      return disabled
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    const initRule = {
      name:'',
      conditions: [ { param: '', regex: { pattern: '', flags: 'gi' } } ],
      actions: [],
      options: {
        edit: { replace: { regex: { pattern: '', flags: 'gi' } } }
      }
    }

    /* Template Data */
    const v = reactive({
      focusInput: null,
      rule: cloneDeep(initRule),
      saveRuleBtnLabel: props.remove ? 'Confirm Delete' : 'Save',
      requestSubmitted: false,
    })

    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.remove ? 'Confirm Delete' : 'Save'
      v.rule = props.edit || props.remove ? cloneDeep(props.selected) : v.rule
      // Handle empty edit options when editing existing rule
      if (v.rule.actions.indexOf('edit') > -1 && Object.keys(v.rule.options.edit).length < 1) v.rule.options.edit = cloneDeep(initRule.options.edit)
    })

    return { ...toRefs(v), modifyRule, addCondition, removeCondition, submitDisabled, toggleActionSelection, close }
  }
}
</script>

<style lang="scss">
  .col {
    display: flex;
    flex-direction: row;
    align-items: center;
    width: 100%;
    column-gap: 0.5rem;
    div, button { flex: 1; }
    .rule-regex-slash {
      flex: 0;
      text-align: center;
    }
    .rule-regex-input, .rule-regex-flags {
      flex: auto;
      text-align: center;
    }
  }
  .rule-condition {
    margin-top: 0.5rem;
    border-bottom: 1px solid $border-color;
  }
  .rule-condition:first-child { margin-top: 0; }
  .rule-condition:last-child { border-bottom: 0; }
  .rule-action {
    border: 1px solid $border-color;
    padding: 0.5rem;
    cursor: pointer;
    margin-bottom: 0.5rem;
    input { margin-bottom: 0; }
  }
  .rule-action.checked { background-color: $color-primary; }
  .rule-action.checked label { color: $button-text-color; }
  .rule-remove-cond { margin-top: 1.1rem; }
  .rule-red { color: red; }
  .input-text.rule-red-border { border-color: red; }
  .rule-description { word-wrap: break-word; white-space: pre-wrap; }
  .rule-regex-slash {
    color: $border-color;
    font-size: 1.5rem;
  }
  .rule-no-selections {
    text-align: center;
    font-size: 1.2rem;
  }
</style>
