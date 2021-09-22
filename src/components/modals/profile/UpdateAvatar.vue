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

          <image-uploader purpose="avatar" @upload-success="uploadSuccess" @upload-error="uploadError" />
        </div>
        <div class="profile-avatar-container" :class="defaultAvatarShape">
          <img :src="userCopy.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
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
import ImageUploader from '@/components/images/ImageUploader.vue'
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject } from 'vue'
import { usersApi } from '@/api'
import { cloneDeep } from 'lodash'

export default {
  name: 'update-avatar-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal, ImageUploader },
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

    const uploadSuccess = url => v.userCopy.avatar = url
    const uploadError = err => v.errorMessage = err
    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      userCopy: cloneDeep(props.user),
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      userReactive: props.user,
      focusInput: null,
      errorMessage: ''
    })

    return { ...toRefs(v), updateAvatar, uploadSuccess, uploadError, close }
  }
}
</script>

<style lang="scss">
  .profile-avatar-container {
    width: 100%; height: 100%;
    text-align: center;
    &.rect {
      img { height: 80px; width: 120px; object-fit: cover;}
    }
    &.circle {
      img { height: 120px; width: 120px; border-radius: 100%; object-fit: cover; }
    }
  }

</style>
