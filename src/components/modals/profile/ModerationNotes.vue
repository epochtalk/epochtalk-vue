<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Moderation Notes</template>

    <template v-slot:body>
      <form v-if="userCopy" action="." class="css-form">
        <!-- Note -->
        <div class="input-section textarea">
          <label for="note">Note</label>
          <textarea rows="10" id="note" :placeholder="`Leave your moderation note for ${user.username} here...`" v-model="note" ref="focusInput" maxlength="5000"></textarea>
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="leaveNote()">
            Leave Note
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
  name: 'moderation-notes-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const leaveNote = () => {
      v.errorMessage = null
      $alertStore.info('TODO: Leave Note')
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
      note: '',
      errorMessage: ''
    })

    return { ...toRefs(v), leaveNote, close }
  }
}
</script>
