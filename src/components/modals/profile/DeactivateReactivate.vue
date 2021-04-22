<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>{{ deactivate ? 'D' : 'R' }}eactivate Account</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <!-- Deactivate -->
        <p v-if="deactivate">
          Are you sure you want to deactivate your account? Your information and posts will be hidden from other users. You will not be able to create, edit, or delete your posts and threads.
        </p>
        <!-- Reactivate -->
        <p v-if="!deactivate">
          Reactivate your account? All your threads and posts will be viewable to the public again. You will also be able to create, edit, and delete your posts and threads like normal.
        </p>
        <!-- Save Button -->
        <div class="modal-actions">
          <button ref="focusInput" @click.prevent="confirm(deactivate)">
            {{ deactivate ? 'D' : 'R' }}eactivate Account
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
import { usersApi } from '@/api'

export default {
  name: 'deactivate-reactivate-modal',
  props: ['show', 'user', 'deactivate'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const confirm = deactivate => {
      v.errorMessage = null
      const confirmAction = deactivate ? usersApi.deactivate : usersApi.reactivate
      confirmAction(props.user.id)
      .then(() => {
        emit('success')
        $alertStore.success(`Successfully ${deactivate ? 'd' : 'r'}eactivated account`)
      })
      .catch(() => v.errorMessage = `There was an error ${deactivate ? 'd' : 'r'}eactivating your account, please contact an administrator.`)
      .finally(() => v.errorMessage ? null : close())
    }

    const close = () => {
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      errorMessage: ''
    })

    return { ...toRefs(v), confirm, close }
  }
}
</script>
