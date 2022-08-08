<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="resendInvite">Resend Invitation</span>
      <span v-if="deleteInvite">Delete Invitation</span>
    </template>

    <template v-slot:body>
      <form class="css-form">
        <div v-if="resendInvite">
          <p>
            Are you sure you want to resend an invitation to <strong v-html="selectedEmail"></strong>?
          </p>
        </div>
        <div v-if="deleteInvite">
          <p>
            Are you sure you want to delete the invitation for <strong v-html="selectedEmail"></strong>?
          </p>
        </div>

        <div class="col">
          <div>
            <button ref="focusInput" class="fill-row" @click.prevent="modify()" :disabled="requestSubmitted" v-html="saveRuleBtnLabel"></button>
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
import { reactive, toRefs, watch, inject } from 'vue'
import { cloneDeep } from 'lodash'
import { adminApi } from '@/api'

export default {
  name: 'invitation-manager-modal',
  props: ['show', 'resendInvite', 'deleteInvite', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.deleteInvite ? 'Confirm Delete' : 'Confirm Resend'
    }

    const modify = () => {
      v.requestSubmitted = true
      let promise, successMsg, errorMsg
      if (props.resendInvite) {
        promise = adminApi.invitations.resend({ email: v.selectedEmail })
        successMsg = `Successfully resent invite to ${v.selectedEmail}!`
        errorMsg = 'There was an error banning addresses'
      }
      else if (props.deleteInvite) {
        promise = adminApi.invitations.remove({ email: v.selectedEmail })
        successMsg = `Successfully deleted invitation for ${v.selectedEmail}!`
        errorMsg = `There was an error deleting invitation for ${v.selectedEmail}`
      }

      promise.then(() => {
        $alertStore.success(successMsg)
        emit('success')
        close()
      })
      .catch(() => $alertStore.error(errorMsg))
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      selectedEmail: {},
      saveRuleBtnLabel: props.deleteInvite ? 'Confirm Delete' : 'Confirm Resend',
      requestSubmitted: false,
    })

    watch(() => props.show, () => {
      v.saveRuleBtnLabel = props.deleteInvite ? 'Confirm Delete' : 'Confirm Resend'
      v.selectedEmail = cloneDeep(props.selected)
    })

    return { ...toRefs(v), modify, close }
  }
}
</script>

<style lang="scss" scoped>
  p { margin-bottom: 1rem; }
</style>
