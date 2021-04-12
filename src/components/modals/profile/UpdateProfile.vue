<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Change Email</template>

    <template v-slot:body>
      <form v-if="userCopy" action="." class="css-form">
        <!-- Profile Fields -->
        <div class="fieldgroup-double">
          <div class="fieldgroup-section">
            <div class="input-section">
              <label>Username
                <div v-if="userCopy.username.length === 0" class="right">
                  Username will not be changed
                </div>
                <div v-if="userCopy.username.length && !usernameUnique" class="invalid right">
                  Username already taken
                </div>
                <div v-if="userCopy.username.length && !usernameValid" class="invalid right">
                  Usernames may only contain A-Z, 0-9, -, _ and .
                </div>
              </label>
              <input type="text" name="username" v-model="userCopy.username" placeholder="Username ( a-z, 0-9, -, _ and . )" maxlength="255" :disabled="!canUpdateUsername()" ref="focusInput" />
            </div>

            <div class="input-section">
              <label for="display-name">Display Name
              </label>
              <input type="text" id="display-name" placeholder="Name" v-model="userCopy.name" maxlength="255">
            </div>

            <div class="input-section">
              <label for="website">Website
              </label>
              <input type="text" id="website" placeholder="Website" v-model="userCopy.website">
            </div>

            <div class="input-section">
              <label for="bitcoin-address">Bitcoin Address
              </label>
              <input type="text" id="bitcoin-address" placeholder="Bitcoin Address" v-model="userCopy.btc_address" maxlength="255">
            </div>
          </div>

          <div class="fieldgroup-section">
            <div class="input-section">
              <label for="gender">Gender
              </label>
              <input type="text" id="gender" placeholder="Gender" v-model="userCopy.gender" maxlength="255">
            </div>

            <div class="input-section">
              <label for="dob">Date of Birth
              </label>
              <input type="date" id="dob" placeholder="YYYY-MM-DD" v-model="userCopy.dob_formatted" >
            </div>

            <div class="input-section">
              <label for="location">Location
              </label>
              <input type="text" id="location" placeholder="Location" v-model="userCopy.location" maxlength="255">
            </div>

            <div class="input-section">
              <label for="language">Language
              </label>
              <input type="text" id="language" placeholder="Language" v-model="userCopy.language" maxlength="255">
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="updateProfile()" :disabled="!formValid">
            Update Profile
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
import moment from 'moment'

export default {
  name: 'update-profile-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Internal Methods */
    // const checkFormValid = () => v.form.valid = v.form.email.valid && v.form.email.unique && v.form.emailPassword.valid
    const decodeHtml = html => {
      let text = document.createElement('textarea')
      text.innerHTML = html
      return text.value
    }

    /* Template Methods */
    const updateProfile = () => {
      v.errorMessage = null
      let params = v.userCopy
      params.dob = moment(params.dob_formatted).toDate()
      usersApi.update(props.user.id, params)
      .then(() => {
        $alertStore.success(`Successfully updated email for user ${params.username}`)
        Object.assign(v.userReactive, v.userCopy)
      })
      .catch(() => v.errorMessage = 'There was an error changing email address, please enure the password is correctly entered.')
      .finally(() => v.errorMessage ? null : close())
    }

    const canUpdateUsername = () => true

    const close = () => {
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      userCopy: {
        username: props.user.username,
        name: decodeHtml(props.user.name),
        dob_formatted: moment(props.user.dob).format('YYYY-MM-DD'),
        btc_address: props.user.btc_address,
        gender: decodeHtml(props.user.gender),
        website: decodeHtml(props.user.website),
        location: decodeHtml(props.user.location),
        language: decodeHtml(props.user.language),
      }, // don't want reactiveness
      userReactive: props.user,
      formValid: true,
      usernameUnique: true,
      usernameValid: true,
      focusInput: null,
      usernameRegex: /^[a-zA-Z\d-_.]+$/,
      errorMessage: ''
    })

    /* Watch Data */
    // watch(() => v.form.emailPassword.val, val => {
    //   v.form.emailPassword.valid = val && val.length >= 1 && val.length <= 72
    //   checkFormValid()
    // })

    // watch(() => v.form.email.val, debounce(async (val) => {
    //   v.form.email.valid = val && val.length >= 3 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
    //   // check email unique
    //   if (val) {
    //     authApi.emailAvailable(val)
    //     .then(data => {
    //       v.form.email.unique = !data.found
    //       checkFormValid()
    //     })
    //   }
    // }, 500))

    return { ...toRefs(v), canUpdateUsername, updateProfile, close }
  }
}
</script>
