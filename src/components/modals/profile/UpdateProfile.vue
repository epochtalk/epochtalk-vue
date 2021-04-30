<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Update Profile</template>

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
                <div v-if="!usernameUnique" class="invalid right">
                  Username already taken
                </div>
                <div v-if="!usernameValid" class="invalid right">
                  Usernames may only contain A-Z, 0-9, -, _ and .
                </div>
              </label>
              <input type="text" name="username" v-model="userCopy.username" placeholder="Username ( a-z, 0-9, -, _ and . )" maxlength="255" @input="formValid = false" :disabled="!canUpdateUsername()" ref="focusInput" />
            </div>

            <div class="input-section">
              <label for="display-name">Display Name
              </label>
              <input type="text" id="display-name" placeholder="Name" v-model="userCopy.name" maxlength="255">
            </div>

            <div class="input-section">
              <label for="website">Website
                <div v-if="!websiteValid" class="invalid right">
                  Invalid URL
                </div>
              </label>
              <input type="text" id="website" placeholder="Website" @input="formValid = false" v-model="userCopy.website">
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
import { reactive, toRefs, inject, watch } from 'vue'
import { usersApi, authApi } from '@/api'
import moment from 'moment'
import { debounce } from 'lodash'
import { websiteUrlRegex, usernameRegex } from '@/composables/utils/globalRegex'

export default {
  name: 'update-profile-modal',
  props: ['show', 'user', 'canUpdateUsername'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Internal Methods */
    const checkFormValid = () => v.formValid = v.usernameUnique && v.usernameValid && v.websiteValid

    const decodeHtml = html => {
      let text = document.createElement('textarea')
      text.innerHTML = html || ''
      return text.value
    }

    /* Template Methods */
    const updateProfile = () => {
      v.errorMessage = null
      let params = v.userCopy
      params.dob = moment(params.dob_formatted).toDate()
      usersApi.update(props.user.id, params)
      .then(() => {
        $alertStore.success(`Successfully updated profile for user ${params.username}`)
        Object.assign(v.userReactive, v.userCopy)
      })
      .catch(() => v.errorMessage = 'There was a problem updating your profile information, please ensure that the form has no errors.')
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
      websiteValid: props.user.website ? websiteUrlRegex.test(props.user.website) : true,
      formValid: true,
      usernameUnique: true,
      usernameValid: true,
      focusInput: null,
      errorMessage: ''
    })

    /* Watch Data */
    watch(() => v.userCopy.username, debounce(async val => {
      v.usernameValid = val ? usernameRegex.test(val) : true
      // check username unique
      if (val && v.userReactive.username !== val) {
        authApi.usernameAvailable(val)
        .then(data => {
          v.usernameUnique = !data.found
          checkFormValid()
        })
      }
      else {
        v.usernameUnique = true
        checkFormValid()
      }
    }, 500))

    watch(() => v.userCopy.website, debounce(async val => {
      v.websiteValid = val ? websiteUrlRegex.test(val) : true
      checkFormValid()
    }, 500))

    return { ...toRefs(v), updateProfile, close }
  }
}
</script>
