<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Purge Post</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Purge Post</h3>
        <p>Are you sure you want to permanently delete this post?</p>
        <div class="clear">
          <button id="login-btn" class="fill-row" @click.prevent="purgePost(selectedPost)" type="submit">
            Purge Post
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { useRouter } from 'vue-router'
import { reactive, toRefs } from 'vue'
import { postsApi } from '@/api'

export default {
  name: 'posts-purge-modal',
  props: ['show', 'selectedPost'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const close = () => {
      emit('close')
    }

    /* Internal Data */
    const $router = useRouter()

    /* Template Data */
    const purgePost = post => {
      postsApi.purge(post.id)
        .then(() => {
          $router.push({ name: 'Posts' })
          close()
        })
    }

    const v = reactive({
      selectedPost: props.selectedPost,
      deletePostLocked: false,
      focusInput: null
    })

    return { ...toRefs(v), purgePost, close }
  }
}
</script>
