<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Update Signature</template>

    <template v-slot:body>
      <form v-if="userCopy" action="." class="css-form">
        <!-- Signature -->
        <div class="input-section textarea">
          <label for="signature">Signature
            ({{ userCopy?.raw_signature?.length || 0 }}/5000)
          </label>
          <textarea rows="10" id="signature" placeholder="Signature" v-model="userCopy.raw_signature" ref="focusInput" maxlength="5000"></textarea>
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="updateSignature()">
            Update Signature
          </button>
        </div>
        <label v-if="errorMessage" class="red centered-text">{{errorMessage}}</label>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject, watch } from 'vue'
import { usersApi } from '@/api'
import { cloneDeep } from 'lodash'

export default {
  name: 'update-signature-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const updateSignature = () => {
      v.errorMessage = null
      const params = {
        username: props.user.username,
        raw_signature: v.userCopy.raw_signature,
      }
      usersApi.update(props.user.id, params)
      .then(data => {
        v.userCopy.signature = data.signature
        $alertStore.success(`Successfully updated signature for user ${params.username}`)
        Object.assign(v.userReactive, v.userCopy)
      })
      .catch(() => v.errorMessage = 'There was an error updating signature.')
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
      userCopy: cloneDeep(props.user),
      userReactive: props.user,
      focusInput: null,
      errorMessage: ''
    })

    watch(() => props.show, show => {
      if (show) {
        v.userCopy = cloneDeep(props.user)
        v.userReactive = props.user
      }
    })

    return { ...toRefs(v), updateSignature, close }
  }
}
</script>
