<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="addBoard">Add Board</span>
      <span v-if="editCat">Edit Category</span>
      <span v-if="deleteCat">Delete Category</span>
      <span v-if="editBoard">Edit Boards</span>
      <span v-if="editBoardMods">Edit Board Moderators</span>
      <span v-if="deleteBoard">Delete Board</span>
    </template>

    <template v-slot:body>
      <form class="css-form">
        <div v-if="addBoard || editBoard">
          <label>Board Name
            <input ref="focusInput" type="text" class="input-text" id="newBoardName" placeholder="Board Name" maxlength="255" v-model="data.name" ng-change="slugify()"/>
          </label>
          <label>Board URL Slug
            <input type="text" class="input-text" id="newBoardSlug" v-model="data.slug" placeholder="Board URL Slug" maxlength="80"/>
          </label>
          <label>Board Description
            <textarea rows="5" id="newBoardDesc" v-model="data.description" placeholder="Board Description" maxlength="255"></textarea>
          </label>
          <label>Board Read Access:
            <span class="info-tooltip" data-balloon="Minimum role a user must have to read the posts in this board" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            <select v-model="data.viewable_by" id="newBoardViewable">
              <option :value="null" disabled selected>Minimum role level</option>
              <option :value="role.priority" v-html="role.name" v-for="role in roles" :key="role.priority"></option>
            </select>
          </label>
          <label>Board Write Access:
            <span class="info-tooltip" data-balloon="Minimum role a user must have to create posts within this board" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            <select v-model="data.postable_by" id="newBoardPostable">
              <option :value="null" disabled selected>Minimum role level</option>
              <option :value="role.priority" v-html="role.name" v-for="role in roles" :key="role.priority"></option>
            </select>
          </label>
          <label>Disable Post Editing After (in Minutes)
            <input type="number" v-model="data.disable_post_edit" class="input-text" id="newBoardPostEdit" name="newBoardPostEdit" placeholder="0 to disable editing, blank to allow editing indefinitely" maxlength="10"/>
          </label>
          <div class="form-switch">
            <label for="newBoardRTL">Text Direction
              <span class="info-tooltip" data-balloon="Sets the read direction of the text for this board" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            </label>
            <div class="switch-field">
              <input type="radio" v-model="data.right_to_left" id="ltr" name="newBoardRTL" :value="false" checked/>
              <label for="ltr">Left to Right</label>
              <input type="radio" v-model="data.right_to_left" id="rtl" name="newBoardRTL" :value="true" />
              <label for="rtl">Right to Left</label>
            </div>
          </div>
          <div class="form-switch">
            <label for="newBoardSignatures">Disable Signature
              <span class="info-tooltip" data-balloon="Disable signature display for this board" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            </label>
            <div class="switch-field">
              <input type="radio" v-model="data.disable_signature" id="disable-signature" name="newBoardSignatures" :value="true" />
              <label for="disable-signature">Yes</label>
              <input type="radio" v-model="data.disable_signature" id="enable-signature" name="newBoardSignatures" :value="false" checked/>
              <label for="enable-signature">No</label>
            </div>
          </div>
          <div class="form-switch">
            <label for="newBoardSelfMod">Disable Self Moderated Threads
              <span class="info-tooltip" data-balloon="Disable self moderated threads for this board" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            </label>
            <div class="switch-field">
              <input type="radio" v-model="data.disable_selfmod" id="disable-selfmod" name="newBoardSelfMod" :value="true" />
              <label for="disable-selfmod">Yes</label>
              <input type="radio" v-model="data.disable_selfmod" id="enable-selfmod" name="newBoardSelfMod" :value="false" checked/>
              <label for="enable-selfmod">No</label>
            </div>
          </div>
        </div>
        <div v-if="deleteBoard">
          <p>Are you sure you would like to mark this board <strong>({{selected?.name}})</strong> for deletion? Delete will not take effect until the changes are saved.</p>
          <br />
          <p><strong>WARNING: This will permanently delete all threads and posts in this board.</strong></p>
          <br />
        </div>
        <div v-if="deleteCat">
          <p>Are you sure you would like to mark this category <strong>({{selected?.name}})</strong> for deletion? Delete will not take effect until the changes are saved.</p>
          <br />
          <p><strong>NOTE: All boards under this category will be moved to the 'Uncategorized Boards' section.</strong></p>
          <br />
        </div>
        <div v-if="editCat">
          <label>Category Name
            <input ref="focusInput" type="text" class="input-text" placeholder="Board Name" maxlength="255" v-model="data.name" />
          </label>
          <label>Category Read Access:
            <span class="info-tooltip" data-balloon="Minimum role a user must have to read the boards in this category" data-balloon-pos="right" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            <select v-model="data.viewable_by">
              <option :value="null" selected>Minimum role level</option>
              <option :value="role.priority" v-html="role.name" v-for="role in roles" :key="role.priority"></option>
            </select>
          </label>
        </div>

        <div class="col">
          <div>
            <button class="fill-row" @click.prevent="modify()" :disabled="requestSubmitted" v-html="saveRuleBtnLabel"></button>
          </div>
          <div>
            <button class="fill-row negative" @click.prevent="close()" :disabled="requestSubmitted">Cancel</button>
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, watch, onBeforeMount } from 'vue'
import { cloneDeep, sortBy } from 'lodash'
import { adminApi } from '@/api'

export default {
  name: 'board-manager-modal',
  props: ['show', 'addBoard', 'editCat', 'deleteCat', 'editBoard', 'editBoardMods', 'deleteBoard', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    onBeforeMount(() => adminApi.roles.all().then(r => v.roles = sortBy(r.roles, 'priority')))
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.deleteCat || props.deleteBoard ? 'Confirm Delete' : 'Save'
    }

    const modify = () => {
      let type
      if (props.addBoard) type = 'addBoard'
      if (props.editCat) type = 'editCat'
      if (props.deleteCat) type = 'deleteCat'
      if (props.editBoard) type = 'editBoard'
      if (props.editBoardMods) type = 'editBoardMods'
      if (props.deleteBoard) type = 'deleteBoard'
      emit('success', { type: type, data: v.data })
      close()
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    /* Internal Data */

    /* Template Data */
    const v = reactive({
      focusInput: null,
      roles: null,
      data: {},
      saveRuleBtnLabel: props.deleteCat || props.deleteBoard ? 'Confirm Delete' : 'Save',
      requestSubmitted: false,
    })

    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.deleteCat || props.deleteBoard ? 'Confirm Delete' : 'Save'
      v.data = props.addBoard || props.deleteCat || props.deleteBoard || props.editCat || props.editBoard ? cloneDeep(props.selected) : {}
      if (props.addBoard || props.editBoard) {
        v.data.modified = true
        v.data.old_slug = cloneDeep(v.data.slug) // Needed to identify board in newBoards and editedBoards
      }
      if (props.addBoard) {
        v.data.modified = true
        v.data.id = -1
        v.data.right_to_left = false
        v.data.disable_post_edit = null
        v.data.disable_signature = false
        v.data.disable_selfmod = false
      }
    })

    return { ...toRefs(v), modify, close }
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
