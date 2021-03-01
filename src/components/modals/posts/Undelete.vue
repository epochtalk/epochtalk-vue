<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Unhide Post</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Unhide Post</h3>
        <p>Are you sure you want to unhide this post?</p>
        <div class="clear">
          <button id="login-btn" class="fill-row" @click.prevent="undeletePost(selectedPost)" type="submit">
            Unhide Post
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
  name: 'posts-undelete-modal',
  props: ['show', 'selectedPost'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const close = () => {
      emit('close')
    }

    /* Template Data */
    const canPostLockQuick = post => {
      console.log('canPostLockQuick', post)
      return true
    }
    const undeletePost = post => {
      postsApi.undelete(post.id)
        .then(() => {
          post.deleted = false
          post.hidden = false
          close()
        })
    }

    const v = reactive({
      selectedPost: props.selectedPost,
      deletePostLocked: false,
      focusInput: null
    })

    return { ...toRefs(v), canPostLockQuick, undeletePost, close }
  }
}
</script>
