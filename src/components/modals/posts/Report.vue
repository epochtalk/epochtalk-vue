<template>

  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Report User/Post</template>

    <template v-slot:body>
      <form action="." class="css-form" @submit.prevent="submitReport()">
        <h3 class="thin-underline">Purge Post</h3>
        <p v-if="canReportPosts && canReportUsers && !selectedPost.reported">Which would you like to report?</p>
        <!-- TODO(boka): default radio button choice -->
        <input v-if="canReportUsers" type="radio" name="reportPost" v-model="offendingId" :value="selectedPost.user.id" id="reportUser" required><label v-if="canReportUsers" for="reportUser">{{selectedPost.user.username}}</label>
        <input v-if="canReportPosts" type="radio" name="reportPost" v-model="offendingId" :value="selectedPost.id" id="reportPost" required><label v-if="canReportPosts" for="reportPost">{{selectedPost.user.username}}'s Post</label>
        <label>Reason for Report</label>
        <!-- TODO(boka): handle focus -->
        <textarea name="reportReason" v-model="reportReason" placeholder="Give a brief reason for your report" rows="4" required maxlength="255"></textarea>
        <div class="clear">
          <button id="report-btn" class="fill-row" type="submit">
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
import { reportsApi } from '@/api'

export default {
  name: 'posts-report-modal',
  props: ['show', 'selectedPost', 'canReportPosts', 'canReportUsers'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const close = () => {
      v.reportReason = ''
      v.offendingId = null
      emit('close')
    }

    /* Template Data */
    const submitReport = () => {
      if (v.offendingId === props.selectedPost.id) {
        reportsApi.reportPost(props.selectedPost.id, v.reportReason)
          .then(() => {
            close()
          })
      }
      else if(v.offendingId === props.selectedPost.user.id) {
        reportsApi.reportUser(props.selectedPost.user.id, v.reportReason)
          .then(() => {
            close()
          })
      }
      else {
        console.log('DEBUG: No user or post id selected.  offendingId:', v.offendingId, v.reportReason)
        close()
      }
    }

    const v = reactive({
      reportReason: '',
      offendingId: null,
      selectedPost: props.selectedPost,
      focusInput: null
    })

    return { ...toRefs(v), submitReport, close }
  }
}
</script>
