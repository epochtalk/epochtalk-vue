<template>

  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Report User/Post</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Purge Post</h3>
        <p v-if="canReportPosts && canReportUsers && !selectedPost.reported">Which would you like to report?</p>
        <div class="clear">
          <button id="login-btn" class="fill-row" @click.prevent="reportPost(selectedPost)" type="submit">
            Submit Report
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs } from 'vue'
//import { postsApi } from '@/api'

export default {
  name: 'posts-report-modal',
  props: ['show', 'selectedPost', 'canReportPosts', 'canReportUsers'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const close = () => {
      emit('close')
    }

    /* Template Data */
    const reportPost = post => {
      console.log(post)
      close()
    }

    const v = reactive({
      selectedPost: props.selectedPost,
      focusInput: null
    })

    return { ...toRefs(v), reportPost, close }
  }
}
</script>
