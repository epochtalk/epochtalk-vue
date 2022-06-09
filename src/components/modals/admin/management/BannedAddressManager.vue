<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="banAddress">Ban Address</span>
      <span v-if="editAddress">Edit Address</span>
      <span v-if="deleteAddress">Delete Address</span>
    </template>

    <template v-slot:body>
      <form class="css-form">
        <div v-if="banAddress">
        </div>
        <div v-if="editAddress">
        </div>
        <div v-if="deleteAddress">
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
import { reactive, toRefs, watch } from 'vue'
import { cloneDeep } from 'lodash'

export default {
  name: 'banned-address-manager-modal',
  props: ['show', 'banAddress', 'editAddress', 'deleteAddress', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.deleteAddress ? 'Confirm Delete' : 'Save'
    }

    const modify = () => {
      let type
      if (props.banAddress) type = 'banAddress'
      if (props.deleteAddress) type = 'deleteAddress'
      emit('success', { type: type, data: v.data })
      close()
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    /* Template Data */
    const v = reactive({
      focusInput: null,
      data: {},
      saveRuleBtnLabel: props.deleteAddress ? 'Confirm Delete' : 'Save',
      requestSubmitted: false,
    })

    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.deleteAddress ? 'Confirm Delete' : 'Save'
      v.data = cloneDeep(props.selected)
    })

    return { ...toRefs(v), modify, close }
  }
}
</script>
