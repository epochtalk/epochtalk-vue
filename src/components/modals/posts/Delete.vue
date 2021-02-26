<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Hide Post</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Hide Post</h3>
        <p>Are you sure you want to hide this post?</p>
        <label v-if="canPostLockQuick(deletePostIndex) && deletePostLocked === false" class="checkbox-container">
          <input type="checkbox" id="lock-post" v-model="deleteAndLock" ref="focusInput" />
          Lock Post (poster cannot hide/edit this post)?
        </label>
        <div class="clear">
          <button id="login-btn" class="fill-row" @click.prevent="deletePost(postId)" type="submit">
            Hide Post
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs } from 'vue'
import { postsApi } from '@/api'

export default {
  name: 'posts-delete-modal',
  props: ['show', 'postId'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const close = () => {
      v.deleteAndLock = false
      emit('close')
    }

    /* Template Data */
    const canPostLockQuick = deletePostIndex => {
      console.log('canPostLockQuick', deletePostIndex)
      return true
    }
    const deletePost = (postId) => {
      postsApi.delete(postId, v.deleteAndLock)
      console.log('deletePost', postId)
    }

    const v = reactive({
      deleteAndLock: false,
      deletePostLocked: false,
      focusInput: null
    })

    return { ...toRefs(v), deletePost, close }
  }
}
</script>
