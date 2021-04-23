<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Manage Bans</template>

    <template v-slot:body>
      <form v-if="userCopy" action="." class="css-form">
        <!-- Manage Bans -->
        <div class="input-section textarea">
          <label for="">User</label>
          <pre style="padding-left: .75rem; font-size: .45rem">({{ '\n\n' + JSON.stringify(userCopy, null, 1) }}</pre>
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="updateBan()">
            Confirm
          </button>
        </div>
        <label v-if="errorMessage" class="red centered-text">{{errorMessage}}</label>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject } from 'vue'
import { cloneDeep } from 'lodash'

export default {
  name: 'manage-bans-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const updateBan = () => {
      v.errorMessage = null
      $alertStore.info('TODO: Update Ban')
      close()
    }

    const close = () => {
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      userCopy: cloneDeep(props.user),
      userReactive: props.user,
      focusInput: null,
      errorMessage: ''
    })

    return { ...toRefs(v), updateBan, close }
  }
}
</script>
