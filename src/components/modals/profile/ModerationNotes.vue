<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Moderation Notes</template>

    <template v-slot:body>
      <div class="comments">
        <div class="comment-container">
          <div class="comment" v-for="comment in userNotes" :key="comment.id">
            <div class="avatar circle">
<!--               <img ng-style="usernotesvm.avatarHighlight(comment.author_highlight_color)" ng-src="{{comment.author_avatar || $webConfigs.default_avatar }}" /> -->
            </div>
            <div class="content">
              <div class="title">
                <div class="bold inline-block">{{ comment.author_name}}</div>
                <span class="date">{{ humanDate(comment.created_at) }}</span>
                <span v-if="comment.created_at !== comment.updated_at" class="date hide-mobile">&mdash;&nbsp;Edited {{ humanDate(comment.updated_at) }}</span>
                <div class="right" v-if="comment.author_id === authedUser.id">
                  <!-- TODO(akinsey): data-balloon="Delete" -->
                  <a v-if="accessControl.delete && !comment.showConfirmDelete" class="action" @click="comment.showConfirmDelete = true">
                    <i class="fa fa-trash"></i>
                  </a>
                  <a v-if="comment.showConfirmDelete" @click="deleteUserNote(comment)">&nbsp;Confirm&nbsp;</a>
                  <a v-if="comment.showConfirmDelete" href="#" @click="comment.showConfirmDelete = false">&nbsp;Cancel&nbsp;</a>
                  &nbsp;&nbsp;
                  <!-- TODO(akinsey): data-balloon="Edit" -->
                  <a v-if="accessControl.update" href="#" class="action" @click="comment.showEdit = !comment.showEdit; comment.noteEdit = ''">
                    <i class="fa fa-pencil"></i>
                  </a>
                </div>
                <span v-if="comment.created_at !== comment.updated_at" class="date inline-block show-mobile">Edited {{ humanDate(comment.updated_at) }}</span>

              </div>
              <div v-if="!comment.showEdit">{{ comment.note }}</div>
              <div v-if="comment.showEdit">
                <textarea v-model="comment.noteEdit"></textarea>
                <div class="right">
                  <span v-if="comment.noteEdit.length < 3 || comment.noteEdit === comment.note">&nbsp;Save&nbsp;</span>
                  <a v-if="comment.noteEdit.length > 2 && comment.noteEdit !== comment.note" @click="editUserNote(comment)">&nbsp;Save&nbsp;</a>
                  <a @click="comment.showEdit = false;">&nbsp;Cancel&nbsp;</a>
                </div>
              </div>
            </div>
          </div>
          <div v-if="!userNotes">
            <h5 class="no-comments">No Moderation Notes to Display</h5>
          </div>
        </div>
      </div>

      <form v-if="userCopy" action="." class="css-form">
        <!-- Note -->
        <div class="input-section textarea">
          <label for="note">Note</label>
          <textarea rows="10" id="note" :placeholder="`Leave your moderation note for ${user.username} here...`" v-model="note" ref="focusInput" maxlength="5000"></textarea>
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="leaveNote()">
            Leave Note
          </button>
        </div>
        <label v-if="errorMessage" class="red centered-text">{{errorMessage}}</label>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject } from 'vue'
import { cloneDeep } from 'lodash'
import humanDate from '@/composables/filters/humanDate'

export default {
  name: 'moderation-notes-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const leaveNote = () => {
      v.errorMessage = null
      $alertStore.info('TODO: Leave Note')
    }

    const editUserNote = (comment) => {
      console.log(comment)
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
      note: '',
      errorMessage: ''
    })

    return { ...toRefs(v), leaveNote, editUserNote, humanDate, close }
  }
}
</script>

<style lang="scss">
.comments {
  margin-top: -0.625rem;
  .comment-container {
    .comment {
      @include clearfix;
      padding: 1rem;
      border-bottom: 1px solid $border-color;
      &:nth-of-type(odd) { background-color: $sub-header-color; }
      &:last-child { margin-bottom: 1rem; }
      .avatar {
        &.circle {
          img {
            @include border-radius(100px);
            height: 2.5rem;
            width: 2.5rem;
          }
        }
        &.rectangle {
          img {
            height: 2.5rem;
            width: 2.5rem;
          }
        }
      }
      .content {
        .title {
          margin-bottom: 0.5rem;
          .date { @include pad(0 0 0 0.25rem); font-size: 0.8rem; color: $secondary-font-color; }
          .action { color: $secondary-font-color; }
          &:hover .action { color: $secondary-font-color-dark; }
          &:hover .action:hover { color: $color-primary;; }
        }
        textarea { min-height: 3.25rem; }
      }
    }

    @include break-mobile-sm {
      .comment {
        .avatar { display: none; }
        .content {  }
      }
    }
  }
}
h5.no-comments { text-align: center; margin: 0.625rem 0; }
.textarea textarea { min-height: 4.5rem; }
</style>
