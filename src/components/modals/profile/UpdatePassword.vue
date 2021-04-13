<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Change Password</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <div>
          <!-- Old Password -->
          <div class="input-section">
            <label for="old-password">
              New Password
              <div v-if="form.oldPassword.val && form.oldPassword.val.length > 0 && form.oldPassword.val.length < 8 && !form.oldPassword.valid" class="invalid input-validation-message">
                Password must be at least 8 characters
              </div>
              <div v-if="form.oldPassword.val && form.oldPassword.val.length > 72 && !form.oldPassword.valid" class="invalid input-validation-message">
                Password must be at less than 72 characters
              </div>
            </label>

            <input type="password" :class="{'invalid-mismatch': form.oldPassword.val && !form.oldPassword.valid }" class="icon-padding" id="old-password" name="old-password" v-model="form.oldPassword.val" ref="focusInput" placeholder="Enter current password" required />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" v-if="form.oldPassword.val && form.oldPassword.valid" class="input-icon valid">
              <title></title>
              <polygon class="cls-1" points="19.69 37.19 7.23 24.73 10.77 21.2 19.69 30.12 37.23 12.58 40.77 16.11 19.69 37.19"/>
            </svg>
            <svg enable-background="new 0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" v-if="form.oldPassword.val && !form.oldPassword.valid" class="input-icon invalid">
              <path clip-rule="evenodd" d="m12.7 5.2-1.2-1.2-3.1 3.2-3.2-3.2-1.2 1.2 3.2 3.2-3.2 3.1 1.2 1.2 3.2-3.2 3.1 3.2 1.2-1.2-3.2-3.1z" fill-rule="evenodd"/>
            </svg>
          </div>

          <!-- New Password -->
          <div class="input-section">
            <label for="password">
              New Password
              <div v-if="form.password.val && form.password.val.length > 0 && form.password.val.length < 8 && !form.password.valid" class="invalid input-validation-message">
                New Password must be at least 8 characters
              </div>
              <div v-if="form.password.val && form.password.val.length >= 8 && form.confirmation.val && form.confirmation.val.length >= 8 && (!form.password.valid || !form.confirmation.valid)" class="invalid input-validation-message">
                New Password and confirmation do not match
              </div>
            </label>

            <input type="password" :class="{'invalid-mismatch': form.password.val && (form.password.val !== form.confirmation.val || !form.password.valid) }" class="icon-padding" id="password" name="password" v-model="form.password.val" placeholder="Enter a password" required />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" v-if="(form.password.val && form.password.val.length > -1 && !(form.confirmation.val && form.confirmation.val.length > -1) && form.password.valid) || (form.password.val && form.password.val.length > -1 && form.confirmation.val && form.confirmation.val.length > -1 && form.password.val === form.confirmation.val && form.password.valid)" class="input-icon valid">
              <title></title>
              <polygon class="cls-1" points="19.69 37.19 7.23 24.73 10.77 21.2 19.69 30.12 37.23 12.58 40.77 16.11 19.69 37.19"/>
            </svg>
            <svg enable-background="new 0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" v-if="(form.password.val && form.password.val.length > -1 && !form.password.valid) || (form.password.val && form.password.val.length > -1 && form.confirmation.val && form.confirmation.val.length > -1 && form.password.val !== form.confirmation.val)" class="input-icon invalid">
              <path clip-rule="evenodd" d="m12.7 5.2-1.2-1.2-3.1 3.2-3.2-3.2-1.2 1.2 3.2 3.2-3.2 3.1 1.2 1.2 3.2-3.2 3.1 3.2 1.2-1.2-3.2-3.1z" fill-rule="evenodd"/>
            </svg>
          </div>

          <div class="input-section">
            <label for="confirmation">
              Confirm New Password
              <div v-if="form.confirmation.val && form.confirmation.val.length > 0 && form.confirmation.val.length < 8 && !form.confirmation.valid" class="invalid input-validation-message">
                Confirmation must be at least 8 characters
              </div>
              <div v-if="form.password.val && form.password.val.length >= 8 && form.confirmation.val && form.confirmation.val.length >= 8 && (!form.password.valid || !form.confirmation.valid)" class="invalid input-validation-message">
                New Password and confirmation do not match
              </div>
            </label>

            <input type="password" :class="{'invalid-mismatch': form.confirmation.val && (form.password.val !== form.confirmation.val || !form.confirmation.valid) }" class="icon-padding" name="confirmation" id="confirmation" v-model="form.confirmation.val" placeholder="Enter your password again" required />
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" v-if="(form.confirmation.val && form.confirmation.val.length > -1 && !(form.password.val && form.password.val.length > -1) && form.confirmation.valid) || (form.password.val && form.password.val.length > -1 && form.confirmation.val && form.confirmation.val.length > -1 && form.password.val === form.confirmation.val && form.confirmation.valid)" class="input-icon valid">
              <title></title>
              <polygon class="cls-1" points="19.69 37.19 7.23 24.73 10.77 21.2 19.69 30.12 37.23 12.58 40.77 16.11 19.69 37.19"/>
            </svg>
            <svg enable-background="new 0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" v-if="(form.confirmation.val && form.confirmation.val.length > -1 && !form.confirmation.valid) || (form.password.val && form.password.val.length > -1 && form.confirmation.val && form.confirmation.val.length > -1 && form.password.val !== form.confirmation.val)" class="input-icon invalid">
              <path clip-rule="evenodd" d="m12.7 5.2-1.2-1.2-3.1 3.2-3.2-3.2-1.2 1.2 3.2 3.2-3.2 3.1 1.2 1.2 3.2-3.2 3.1 3.2 1.2-1.2-3.2-3.1z" fill-rule="evenodd"/>
            </svg>
          </div>
          <!-- Save Button -->
          <div class="modal-actions">
            <button @click.prevent="updatePassword()" :disabled="!form.valid">
              Confirm
            </button>
          </div>
          <label v-if="errorMessage" class="red centered-text">{{errorMessage}}</label>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, watch, inject } from 'vue'
import { usersApi } from '@/api'
import { cloneDeep } from 'lodash'

export default {
  name: 'update-password-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Internal Methods */
    const checkFormValid = () => v.form.valid = v.form.oldPassword.valid && v.form.password.valid && v.form.confirmation.valid

    /* Template Methods */
    const updatePassword = () => {
      v.errorMessage = null
      const params = {
        username: props.user.username,
        old_password: v.form.oldPassword.val,
        password: v.form.password.val,
        confirmation: v.form.confirmation.val
      }
      usersApi.update(props.user.id, params)
      .then(() => $alertStore.success(`Successfully updated password for user ${params.username}`))
      .catch(() => v.errorMessage = 'There was an error changing passwords, please enure the current password is correctly entered.')
      .finally(() => v.errorMessage ? null : close())
    }

    const close = () => {
      v.form = cloneDeep(initForm)
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const initForm = {
      valid: false,
      oldPassword: { val: undefined, valid: false },
      password: { val: undefined, valid: false },
      confirmation:{ val: undefined, valid: false }
    }

    const v = reactive({
      form: cloneDeep(initForm),
      focusInput: null,
      errorMessage: ''
    })

    watch(() => v.form.oldPassword.val, val => {
      v.form.oldPassword.valid = val && val.length >= 8 && val.length <= 72
      checkFormValid()
    })

    watch(() => v.form.password.val, val => {
      v.form.password.valid = val && val.length >= 8 && val.length <= 72
      if (v.form.password.valid && v.form.password.val && v.form.confirmation.val && v.form.password.val !== v.form.confirmation.val) {
        v.form.password.valid = false
        v.form.confirmation.valid = false
      }
      else if (v.form.password.valid  && v.form.password.val && v.form.confirmation.val && v.form.password.val === v.form.confirmation.val) {
        v.form.password.valid = true
        v.form.confirmation.valid = true
      }
      checkFormValid()
    })

    watch(() => v.form.confirmation.val, val => {
      v.form.confirmation.valid = val && val.length >= 8 && val.length <= 72
      if (v.form.confirmation.valid && v.form.password.val && v.form.confirmation.val && v.form.password.val !== v.form.confirmation.val) {
        v.form.password.valid = false
        v.form.confirmation.valid = false
      }
      else if (v.form.confirmation.valid  && v.form.password.val && v.form.confirmation.val && v.form.password.val === v.form.confirmation.val) {
        v.form.password.valid = true
        v.form.confirmation.valid = true
      }
      checkFormValid()
    })

    return { ...toRefs(v), updatePassword, close }
  }
}
</script>
