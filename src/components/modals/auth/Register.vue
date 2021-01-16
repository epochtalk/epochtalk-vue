<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Register a new account</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <div class='input-section'>
          <label for="email">
            Email

            <div v-if="form.email.val && form.email.val.length === 0 && !form.email.valid" class="invalid input-validation-message">
              Email is required
            </div>
            <div v-if="form.email.val && form.email.val.length > 0 && !form.email.valid" class="invalid input-validation-message">
              Email is invalid
            </div>
            <div v-if="form.email.val && form.email.val.length > 0 && form.email.valid && !form.email.unique" class="invalid input-validation-message">
              Email is taken
            </div>
          </label>

          <input type="email" class="icon-padding" id="email" name="email" maxlength="255" v-model="form.email.val" placeholder="your-email@email.com" @keydown="form.valid=false" ref="focusInput" required />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" v-if="form.email.val && form.email.val.length > -1 && (form.email.valid && form.email.unique)" class="input-icon valid">
            <title></title>
            <polygon class="cls-1" points="19.69 37.19 7.23 24.73 10.77 21.2 19.69 30.12 37.23 12.58 40.77 16.11 19.69 37.19"/>
          </svg>
          <svg enable-background="new 0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" v-if="form.email.val && form.email.val.length > -1 && (!form.email.valid || !form.email.unique)" class="input-icon invalid">
            <path clip-rule="evenodd" d="m12.7 5.2-1.2-1.2-3.1 3.2-3.2-3.2-1.2 1.2 3.2 3.2-3.2 3.1 1.2 1.2 3.2-3.2 3.1 3.2 1.2-1.2-3.2-3.1z" fill-rule="evenodd"/>
          </svg>

          <div class="input-info">
            Enter a valid email (we'll use it to confirm your account)
          </div>
        </div>

        <div class="input-section">
          <label for="username">
            Username
            <div v-if="form.username.val && form.username.val.length === 0 && !form.username.valid" class="invalid input-validation-message">
              Username is required
            </div>
            <div v-if="form.username.val && form.username.val.length > 0 && !form.username.valid" class="invalid input-validation-message">
              Usernames may only contain A-Z, 0-9, -, _ and .
            </div>
            <div v-if="form.username.val && form.username.val.length > 0 && form.username.valid && !form.username.unique" class="invalid input-validation-message">
              Username is taken
            </div>
          </label>

          <input type="text" class="input-text icon-padding" id="username" name="username" maxlength="50" v-model="form.username.val" placeholder="your-username" @keydown="form.valid=false" required />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" v-if="form.username.val && form.username.val.length > -1 && (form.username.valid && form.username.unique)" class="input-icon valid">
            <title></title>
            <polygon class="cls-1" points="19.69 37.19 7.23 24.73 10.77 21.2 19.69 30.12 37.23 12.58 40.77 16.11 19.69 37.19"/>
          </svg>
          <svg enable-background="new 0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" v-if="form.username.val && form.username.val.length > -1 && (!form.username.valid || !form.username.unique)" class="input-icon invalid">
            <path clip-rule="evenodd" d="m12.7 5.2-1.2-1.2-3.1 3.2-3.2-3.2-1.2 1.2 3.2 3.2-3.2 3.1 1.2 1.2 3.2-3.2 3.1 3.2 1.2-1.2-3.2-3.1z" fill-rule="evenodd"/>
          </svg>

          <div class="input-info">
            You can use <strong>a-z</strong>, <strong>A-Z</strong>, <strong>0-9</strong>, <strong>-</strong>, <strong>_</strong> and <strong>.</strong>
          </div>
        </div>

        <div class="input-section">
          <label for="password">
            Password
            <div v-if="form.password.val && form.password.val.length > 0 && form.password.val.length < 8 && !form.password.valid" class="invalid input-validation-message">
              Password must be at least 8 characters
            </div>
            <div v-if="form.password.val && form.password.val.length >= 8 && form.confirmation.val && form.confirmation.val.length >= 8 && (!form.password.valid || !form.confirmation.valid)" class="invalid input-validation-message">
              Password and confirmation do not match
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
            Confirm Password
            <div v-if="form.confirmation.val && form.confirmation.val.length > 0 && form.confirmation.val.length < 8 && !form.confirmation.valid" class="invalid input-validation-message">
              Confirmation must be at least 8 characters
            </div>
            <div v-if="form.password.val && form.password.val.length >= 8 && form.confirmation.val && form.confirmation.val.length >= 8 && (!form.password.valid || !form.confirmation.valid)" class="invalid input-validation-message">
              Password and confirmation do not match
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

        <div class="modal-actions">
          <button class="" @click.prevent="register()" :disabled="!form.valid">
            Register
          </button>

          <div v-if="hasGoogleCredentials" class="modal-actions-sso-google">
            <span class="separator-text">or</span>
            <button @click.prevent="signInWithGoogle()">
              <svg height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="m17.64 9.20454545c0-.63818181-.0572727-1.25181818-.1636364-1.84090909h-8.4763636v3.48136364h4.8436364c-.2086364 1.125-.8427273 2.0781818-1.7959091 2.7163636v2.2581819h2.9086363c1.7018182-1.5668182 2.6836364-3.874091 2.6836364-6.61500005z" fill="#4285f4"/><path d="m9 18c2.43 0 4.4672727-.8059091 5.9563636-2.1804545l-2.9086363-2.2581819c-.8059091.54-1.8368182.8590909-3.0477273.8590909-2.34409091 0-4.32818182-1.5831818-5.03590909-3.7104545h-3.00681818v2.3318182c1.48090909 2.9413636 4.52454545 4.9581818 8.04272727 4.9581818z" fill="#34a853"/><path d="m3.96409091 10.71c-.18-.54-.28227273-1.11681818-.28227273-1.71s.10227273-1.17.28227273-1.71v-2.33181818h-3.00681818c-.60954546 1.215-.95727273 2.58954545-.95727273 4.04181818 0 1.4522727.34772727 2.8268182.95727273 4.0418182z" fill="#fbbc05"/><path d="m9 3.57954545c1.3213636 0 2.5077273.45409091 3.4404545 1.3459091l2.5813637-2.58136364c-1.5586364-1.45227273-3.5959091-2.34409091-6.0218182-2.34409091-3.51818182 0-6.56181818 2.01681818-8.04272727 4.95818182l3.00681818 2.33181818c.70772727-2.12727273 2.69181818-3.71045455 5.03590909-3.71045455z" fill="#ea4335"/><path d="m0 0h18v18h-18z"/></g></svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { debounce, cloneDeep } from 'lodash'
import { reactive, toRefs, watch, inject } from 'vue'
import { Api } from '@/api'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'register-modal',
  props: ['show'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Internal Methods */
    const checkFormValid = () => {
      v.form.valid =  v.form.email.valid && v.form.email.unique && v.form.username.valid && v.form.username.unique && v.form.password.valid && v.form.confirmation.valid
    }

    /* Template Methods */
    const register = () => {
      auth.register(v.form.email.val, v.form.username.val, v.form.password.val)
      close()
    }

    const signInWithGoogle = () => {
      console.log('Sign in with Google!')
      close()
    }

    const close = () => {
      v.form = cloneDeep(initForm)
      emit('close')
    }

    /* Internal Data */
    const auth = inject(AuthStore)
    const $api = inject(Api)

    /* Template Data */
    const initForm = {
      valid: false,
      email: { val: undefined, valid: false, unique: undefined },
      username: { val: undefined, valid: false, unique: undefined },
      password: { val: undefined, valid: false },
      confirmation:{ val: undefined, valid: false }
    }

    const v = reactive({
      form: cloneDeep(initForm),
      focusInput: null,
      hasGoogleCredentials: true
    })

    /* Watch Data */
    watch(() => v.form.email.val, debounce(async (val) => {
      v.form.email.valid = val && val.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      // check email unique
      if (val) {
        $api.register.emailAvailable(val)
        .then(data => {
          v.form.email.unique = !data.found
          checkFormValid()
        })
      }
    }, 500))

    watch(() => v.form.username.val, debounce(async (val) => {
      v.form.username.valid = val && val.length >= 3 && val.length <= 20 && /^[a-zA-Z\d-_.]+$/.test(val)
      // check email unique
      if (val) {
        $api.register.usernameAvailable(val)
        .then(data => {
          v.form.username.unique = !data.found
          checkFormValid()
        })
      }
    }, 500))

    watch(() => v.form.password.val, (val) => {
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

    watch(() => v.form.confirmation.val, (val) => {
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

    return { ...toRefs(v), register, signInWithGoogle, close }
  }
}
</script>
