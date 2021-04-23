<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Update Avatar</template>

    <template v-slot:body>
      <form v-if="userCopy" action="." class="css-form">
        <!-- Avatar -->
        <div class="input-section">
          <label for="avatar">
            Avatar URL
          </label>
          <input type="text" id="avatar" name="avatar" v-model="userCopy.avatar" ref="focusInput" />
          <div class="input-info">Hotlinked images will receive a new url</div>

          <single-image-uploader />
          <!-- <image-uploader model="vmProfile.editAvatarUser.avatar" purpose="avatar"></image-uploader> -->
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="updateAvatar()">
            Update Avatar
          </button>
        </div>
        <label v-if="errorMessage" class="red centered-text">{{errorMessage}}</label>
      </form>
    </template>
  </modal>
</template>

<script>
import SingleImageUploader from '@/components/images/SingleImageUploader.vue'
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject } from 'vue'
import { usersApi } from '@/api'
import { cloneDeep } from 'lodash'

export default {
  name: 'update-avatar-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal, SingleImageUploader },
  setup(props, { emit }) {
    /* Template Methods */
    const updateAvatar = () => {
      v.errorMessage = null
      const params = {
        username: props.user.username,
        avatar: v.userCopy.avatar,
      }
      usersApi.update(props.user.id, params)
      .then(data => {
        v.userCopy.avatar = data.avatar
        $alertStore.success(`Successfully updated avatar for user ${params.username}`)
        Object.assign(v.userReactive, v.userCopy)
      })
      .catch(() => v.errorMessage = 'There was an error updating avatar.')
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

    return { ...toRefs(v), updateAvatar, close }
  }
}
</script>
