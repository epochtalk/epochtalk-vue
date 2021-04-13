<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Change Email</template>

    <template v-slot:body>
      <form v-if="form" action="." class="css-form">
        <!-- Email -->
        <div class="input-section">
          <label>Email
            <div v-if="form.email?.val?.length && !form.email.valid" class="invalid right">
              Email is not valid
            </div>
            <div v-if="form.email.valid && !form.email.unique" class="invalid right">
              Email already taken
            </div>
            <div v-if="!form.email?.val?.length && form.email.valid && form.email.unique" class="invalid right">
              Email is required
            </div>
          </label>
          <input type="email" class="icon-padding" id="email" name="email" maxlength="255" v-model="form.email.val" placeholder="your-email@email.com" @keydown="form.valid=false" ref="focusInput" required />
        </div>

        <!-- Password -->
        <div class="input-section">
          <label>Password
            <div v-if="!form.emailPassword?.val?.length && form.emailPassword.valid" class="input-error invalid right">
              Password is required
            </div>
          </label>
          <input v-if="form" type="password" name="pass" v-model="form.emailPassword.val" maxlength="255" required />
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="updateEmail()" :disabled="!form.valid">
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
import { reactive, toRefs, watch, inject } from 'vue'
import { usersApi, authApi } from '@/api'
import { debounce, cloneDeep } from 'lodash'

export default {
  name: 'update-email-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Internal Methods */
    const checkFormValid = () => v.form.valid = v.form.email.valid && v.form.email.unique && v.form.emailPassword.valid

    /* Template Methods */
    const updateEmail = () => {
      v.errorMessage = null
      const params = {
        username: props.user.username,
        email: v.form.email.val,
        email_password: v.form.emailPassword.val
      }
      usersApi.update(props.user.id, params)
      .then(() => $alertStore.success(`Successfully updated email for user ${params.username}`))
      .catch(() => v.errorMessage = 'There was an error changing email address, please enure the password is correctly entered.')
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
      email: { val: undefined, valid: false, unique: undefined },
      emailPassword: { val: undefined, valid: false }
    }

    const v = reactive({
      form: cloneDeep(initForm),
      focusInput: null,
      errorMessage: ''
    })

    /* Watch Data */
    watch(() => v.form.emailPassword.val, val => {
      v.form.emailPassword.valid = val && val.length >= 1 && val.length <= 72
      checkFormValid()
    })

    watch(() => v.form.email.val, debounce(async (val) => {
      v.form.email.valid = val && val.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      // check email unique
      if (val) {
        authApi.emailAvailable(val)
        .then(data => {
          v.form.email.unique = !data.found
          checkFormValid()
        })
      }
    }, 500))

    return { ...toRefs(v), updateEmail, close }
  }
}
</script>
