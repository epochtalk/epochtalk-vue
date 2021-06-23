<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Purge Post</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Purge Post</h3>
        <p>Are you sure you want to permanently delete this post?</p>
        <div class="clear">
          <button id="purge-btn" class="fill-row" @click.prevent="purgePost()" type="submit">
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
  name: 'posts-purge-post-modal',
  props: ['show', 'selectedPost', 'selectedPostIndex', 'posts', 'page', 'limit'],
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
    const purgePost = () => {
      postsApi.purge(props.selectedPost.id)
        .then(() => {
          // if current post is the only one on the page
          if (props.posts.length === 1) {
            // redirect to previous page
            $router.push({ name: 'Posts', query: { page: props.page - 1, limit: props.limit }, hash: '#last' })
          }
          // else if current post is the first post on the page
          else if (props.selectedPostIndex === 0) {
            // set next post and delete post
            const nextPost = props.posts[props.selectedPostIndex + 1]
            const posts = props.posts
            posts.splice(props.selectedPostIndex, 1)

            // redirect to next post
            $router.push({ name: 'Posts', query: { page: props.page, limit: props.limit }, hash: `#${nextPost.id}` })
          }
          // otherwise
          else {
            // set previous post and delete post
            const previousPost = props.posts[props.selectedPostIndex - 1]
            const posts = props.posts
            posts.splice(props.selectedPostIndex, 1)

            // redirect to previous post
            $router.push({ name: 'Posts', query: { page: props.page, limit: props.limit }, hash: `#${previousPost.id}` })
          }
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
