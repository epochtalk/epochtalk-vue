<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="add">Add Rank</span>
      <span v-if="edit">Edit Rank</span>
      <span v-if="remove">Delete Rank</span>
    </template>

    <template v-slot:body>
        <form class="css-form">
          <div class="col input-spacing">
            <div>
              <label>
                Rank Name
                <input type="text" placeholder="Rank Name" v-model="newRank.name" :disabled="requestSubmitted || remove" ref="focusInput" required />
              </label>
            </div>
            <div>
              <label>
                Minimum Post Count
                <input type="number" v-model="newRank.post_count" placeholder="Post count needed to attain rank" min="0" :disabled="requestSubmitted || remove" required />
              </label>
            </div>
          </div>

          <div class="col">
            <div>
              <button class="fill-row" @click.prevent="modifyRank()" :disabled="requestSubmitted || !countValid || !newRank.name" v-html="saveRuleBtnLabel"></button>
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
import { adminApi } from '@/api'
import { positiveNumberRegex } from '@/composables/utils/globalRegex'
import { debounce, cloneDeep } from 'lodash'

export default {
  name: 'rank-modal',
  props: ['show', 'add', 'edit', 'remove', 'selected', 'ranks'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.remove ? 'Confirm Delete' : 'Save'
    }

    const modifyRank = () => {
      v.requestSubmitted = true
      let updatedRanks = cloneDeep(props.ranks)
      if (props.add) {
        v.newRank.post_count = Number(v.newRank.post_count)
        updatedRanks.push(v.newRank)
      }
      else if (props.edit) {
        v.newRank.post_count = Number(v.newRank.post_count)
        updatedRanks = updatedRanks.filter(o => o.post_count !== props.selected.post_count)
        updatedRanks.push(v.newRank)
      }
      else if (props.remove) {
        updatedRanks = updatedRanks.filter(o => o.post_count !== props.selected.post_count)
      }
      adminApi.ranks.upsert(updatedRanks)
      .then(() => {
        $alertStore.success(`Sucessfully ${props.add ? 'added' : '' }${props.edit ? 'edited' : '' }${props.remove ? 'removed' : '' } rank!`)
        emit('success')
      })
      .catch(() => $alertStore.error('There was an issue modifying ranks.'))
      .finally(() => close())
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
      newRank: { },
      saveRuleBtnLabel: props.remove ? 'Confirm Delete' : 'Save',
      requestSubmitted: false,
    })

    /* Watch Data */
    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.remove ? 'Confirm Delete' : 'Save'
      v.newRank = props.edit || props.remove ? cloneDeep(props.selected) : {}
      v.countValid = props.remove ? true : false
    })

    watch(() => v.newRank.post_count, debounce(async val => v.countValid = positiveNumberRegex.test(val)))

    return { ...toRefs(v), modifyRank, close }
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
