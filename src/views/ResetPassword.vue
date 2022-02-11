<template>
  <div class="reset-section">
   <!-- Reset Password -->
   <h4 class="fill-row thin-underline">Reset Password</h4>

   <div class="fill-row">
     <form name="resetPassword" class="css-form">
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

          <input type="password" :disabled="tokenExpired" ref="focusInput" :class="{'invalid-mismatch': form.password.val && (form.password.val !== form.confirmation.val || !form.password.valid) }" class="icon-padding" id="password" name="password" v-model="form.password.val" placeholder="Enter a password" required />
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

          <input type="password" :disabled="tokenExpired" :class="{'invalid-mismatch': form.confirmation.val && (form.password.val !== form.confirmation.val || !form.confirmation.valid) }" class="icon-padding" name="confirmation" id="confirmation" v-model="form.confirmation.val" placeholder="Enter your password again" required />
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" v-if="(form.confirmation.val && form.confirmation.val.length > -1 && !(form.password.val && form.password.val.length > -1) && form.confirmation.valid) || (form.password.val && form.password.val.length > -1 && form.confirmation.val && form.confirmation.val.length > -1 && form.password.val === form.confirmation.val && form.confirmation.valid)" class="input-icon valid">
            <title></title>
            <polygon class="cls-1" points="19.69 37.19 7.23 24.73 10.77 21.2 19.69 30.12 37.23 12.58 40.77 16.11 19.69 37.19"/>
          </svg>
          <svg enable-background="new 0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" v-if="(form.confirmation.val && form.confirmation.val.length > -1 && !form.confirmation.valid) || (form.password.val && form.password.val.length > -1 && form.confirmation.val && form.confirmation.val.length > -1 && form.password.val !== form.confirmation.val)" class="input-icon invalid">
            <path clip-rule="evenodd" d="m12.7 5.2-1.2-1.2-3.1 3.2-3.2-3.2-1.2 1.2 3.2 3.2-3.2 3.1 1.2 1.2 3.2-3.2 3.1 3.2 1.2-1.2-3.2-3.1z" fill-rule="evenodd"/>
          </svg>
        </div>
        <button @click.prevent="resetPassword()" :disabled="!form.valid">
          Reset Password
        </button>
     </form>
   </div>

  </div>
</template>

<script>
import { reactive, toRefs, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { cloneDeep } from 'lodash'
import { AuthStore } from '@/composables/stores/auth'
import { usersApi } from '@/api'

export default {
  name: 'ResetPassword',
  setup() {
    /* Internal Methods */
    const checkFormValid = () => v.form.valid = v.form.password.valid && v.form.confirmation.valid

    /* Template Methods */
    const resetPassword = () => $auth.resetPassword($route.params.username, $route.params.token, v.form.password.val)
      .then(() => $router.push('/'))

    /* Internal Data */
    const $auth = inject(AuthStore)
    const $route = useRoute()
    const $router = useRouter()
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const initForm = {
      valid: false,
      password: { val: undefined, valid: false },
      confirmation:{ val: undefined, valid: false }
    }

    const v = reactive({
      form: cloneDeep(initForm),
      loggedIn: $auth.loggedIn,
      focusInput: null,
      tokenExpired: false
    })

    if (v.loggedIn) $auth.logout() // If user is currently logged in for some reason, log them out

    // Check token, redirect if invalid or expired
    usersApi.checkResetToken($route.params.username, $route.params.token)
    .then(data => {
      v.tokenExpired = data.token_expired
      if (!data.token_valid) $router.push('/')
      if (v.tokenExpired) {
        $alertStore.warn('Your reset password token has expired, you will be redirected shortly.')
        setTimeout(() => $router.push('/'), 4000)
      }
    })

    /* Watch Data */
    watch(() => v.focusInput, f => f ? v.focusInput.focus() : null)

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

    return { ...toRefs(v), resetPassword }
  }
}
</script>

<style lang="scss">
.reset {
  main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }
  .reset-section {
    grid-area: main;
    .view-title {
      color: $secondary-font-color;
      font-size: $font-size-xl;
      font-weight: 600;
      text-transform: none;
    }
    .form { margin: rem 0 1rem; }
  }
}
</style>
