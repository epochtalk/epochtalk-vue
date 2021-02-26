<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Hide Post</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Hide Post</h3>
        <p>Are you sure you want to hide this post?</p>
        <label v-if="canPostLockQuick(selectedPost) && deletePostLocked === false" class="checkbox-container">
          <input type="checkbox" id="lock-post" v-model="deleteAndLock" ref="focusInput" />
          Lock Post (poster cannot hide/edit this post)?
        </label>
        <div class="clear">
          <button id="login-btn" class="fill-row" @click.prevent="deletePost(selectedPost)" type="submit">
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
  props: ['show', 'selectedPost'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const close = () => {
      v.deleteAndLock = false
      emit('close')
    }

    /* Template Data */
    const canPostLockQuick = post => {
      console.log('canPostLockQuick', post)
      return true
    }
    const deletePost = post => {
      postsApi.delete(post.id, v.deleteAndLock)
        .then(() => {
          post.deleted = true
          if (v.deleteAndLock) post.locked = true
        })
    }

    const v = reactive({
      selectedPost: props.selectedPost,
      deleteAndLock: false,
      deletePostLocked: false,
      focusInput: null
    })

    return { ...toRefs(v), canPostLockQuick, deletePost, close }
  }
}
</script>
