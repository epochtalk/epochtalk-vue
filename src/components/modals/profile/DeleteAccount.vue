<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Delete Account</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <p>
          Are you sure you want to delete this account? This will delete the user's account and all their posts and threads. Any threads this user has started will be deleted and any posts from other users within that thread will be deleted as well.
        </p>
        <!-- Save Button -->
        <div class="modal-actions">
          <button ref="focusInput" @click.prevent="deleteAccount()">
            Delete Account
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
  name: 'delete-account-modal',
  props: ['show', 'user'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const deleteAccount = () => {
      v.errorMessage = null
      usersApi.delete(props.user.id)
      .then(() => {
        emit('success')
        $alertStore.success(`Successfully deleted account for user ${props.user.username}!`)
      })
      .catch(() => v.errorMessage = `There was an error deleting account for ${props.user.username}, please contact an administrator.`)
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

    return { ...toRefs(v), deleteAccount, close }
  }
}
</script>
