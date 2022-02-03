<template>
  <div class="join-section">
    <h1 class="view-title">Register and Join</h1>
    <div class="form">
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

          <input type="email" class="icon-padding" id="email" name="email" maxlength="255" v-model="form.email.val" placeholder="your-email@email.com" @keydown="form.valid=false" ref="focusInput" disabled="true" required />
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
        <button @click.prevent="register()" :disabled="!form.valid">
          Register
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, watch, inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { debounce, cloneDeep } from 'lodash'
import { authApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'
import { usernameRegex, emailRegex } from '@/composables/utils/globalRegex'

export default {
  name: 'Join',
  setup() {
    /* Internal Methods */
    const checkFormValid = () => {
      v.form.valid =  v.form.email.valid && v.form.email.unique && v.form.username.valid && v.form.username.unique && v.form.password.valid && v.form.confirmation.valid
    }

    /* Template Methods */
    const register = () => $auth.inviteRegistration(v.form.username.val, $route.query.token, v.form.email.val, v.form.password.val).then(() => $router.push('/'))

    /* Internal Data */
    const $auth = inject(AuthStore)
    const $route = useRoute()
    const $router = useRouter()

    if ($auth.loggedIn) $auth.logout() // If user is currently logged in for some reason, log them out

    /* Template Data */
    const initForm = {
      valid: false,
      email: {
        val: $route.query.email,
        valid: $route.query.email && $route.query.email.length >= 3 && emailRegex.test($route.query.email),
        unique: authApi.emailAvailable($route.query.email).then(data => !data.found)
      },
      username: { val: undefined, valid: false, unique: undefined },
      password: { val: undefined, valid: false },
      confirmation:{ val: undefined, valid: false }
    }

    const v = reactive({
      form: cloneDeep(initForm),
      focusInput: null,
      showRegisterHideConfirm: true
    })

    /* Watch Data */
    watch(() => v.form.email.val, debounce(async (val) => {
      v.form.email.valid = val && val.length >= 3 && emailRegex.test(val)
      // check email unique
      if (val) {
        authApi.emailAvailable(val)
        .then(data => {
          v.form.email.unique = !data.found
          checkFormValid()
        })
      }
    }, 500))

    watch(() => v.form.username.val, debounce(async (val) => {
      v.form.username.valid = val && val.length >= 3 && val.length <= 20 && usernameRegex.test(val)
      // check email unique
      if (val) {
        authApi.usernameAvailable(val)
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

    return { ...toRefs(v), register }
  }
}
</script>

<style lang="scss">
.join {
  main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }
  .join-section {
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
