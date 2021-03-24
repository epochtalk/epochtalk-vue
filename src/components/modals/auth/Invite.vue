<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Invite User</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <!-- Email Input -->
        <div>
          <div class="input-section">
            <label for="email">
                Enter an email:
              <div v-if="!validating && email !== null && email === ''" class="invalid right">
                Email is required
              </div>
              <div v-if="!validating && email !== null && emailInvalid && email !== ''" class="invalid right">
                Email is invalid
              </div>
              <div v-if="!validating && email !== null && emailRegistered" class="invalid right">
                Email is already registered
              </div>
              <div v-if="!validating && email !== null && emailInvited" class="invalid right">
                Email has already been invited
              </div>
            </label>
            <input @input="validating = true" type="email" ref="focusInput" id="email" class="icon-padding" name="email" maxlength="255" v-model="email" placeholder="Email" :class="{ 'invalid': !validating && emailInvalid || emailRegistered || emailInvited || email === '' }" />
            <i v-if="!validating && (email !== null && email !== '' && !emailInvalid && !emailRegistered && !emailInvited)" class="fa fa-check input-icon valid"></i>
            <i v-if="!validating && (email !== null && (emailInvalid || email === '' || emailRegistered || emailInvited))" class="fa fa-times input-icon invalid"></i>
          </div>
          <!-- Save Button -->
          <div class="modal-actions">
            <button class="" @click.prevent="invite()" :disabled="validating || emailInvalid || emailRegistered || emailInvited">
              Send Email
            </button>
          </div>
          <div v-if="errorMessage" class="red centered padding-top">{{errorMessage}}</div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, watch } from 'vue'
// import { AuthStore } from '@/composables/stores/auth'
import { authApi } from '@/api'
import { debounce } from 'lodash'

export default {
  name: 'invite-modal',
  props: ['show'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const invite = () => {
      //$auth.login(v.user.username, v.user.password, v.user.rememberMe)
      console.log('Invite User', v.email)
      close()
    }

    const close = () => {
      v.email = null
      emit('close')
    }

    /* Internal Data */
    // const $auth = inject(AuthStore)

    /* Template Data */
    const v = reactive({
      email: null,
      emailInvited: false,
      emailRegistered: false,
      emailInvalid: false,
      validating: true,
      errorMessage: null,
      focusInput: null
    })

    watch(() => v.email, debounce(async (val) => {
      v.emailInvalid = !(val && val.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val))
      v.emailRegisted = false
      v.emailInvited = false
      if (!v.emailInvalid) {
        await authApi.emailAvailable(val)
        .then(d => v.emailRegistered = d.found)
        .then(() => authApi.inviteExists(val))
        .then(d => v.emailInvited = d.found)
        .catch(() => {
          v.emailInvalid = true
          v.emailRegisted = false
          v.emailInvited = false
        })
      }
      v.validating = false
    }, 500))

    return { ...toRefs(v), invite, close }
  }
}
</script>
