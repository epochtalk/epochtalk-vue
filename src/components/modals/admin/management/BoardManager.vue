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
          <div class="col input-spacing">
            <div>
              <label>
                Rank Name
                <input type="text" placeholder="Rank Name"  :disabled="requestSubmitted" ref="focusInput" required />
              </label>
            </div>
            <div>
              <label>
                Minimum Post Count
                <input type="number"  placeholder="Post count needed to attain rank" min="0" :disabled="requestSubmitted" required />
              </label>
            </div>
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
import { reactive, toRefs, inject, watch } from 'vue'
import { cloneDeep } from 'lodash'

export default {
  name: 'rank-modal',
  props: ['show', 'addBoard', 'editCat', 'deleteCat', 'editBoard', 'editBoardMods', 'deleteBoard', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.deleteCat || props.deleteBoard ? 'Confirm Delete' : 'Save'
    }

    const modify = () => { $alertStore.success('modify')
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
      data: { },
      saveRuleBtnLabel: props.deleteCat || props.deleteBoard ? 'Confirm Delete' : 'Save',
      requestSubmitted: false
    })

    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.deleteCat || props.deleteBoard ? 'Confirm Delete' : 'Save'
      v.data = props.deleteCat || props.deleteBoard || props.editCat || props.editBoard ? cloneDeep(props.selected) : {}
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
