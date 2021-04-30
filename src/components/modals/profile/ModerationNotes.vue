<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Moderation Notes</template>

    <template v-slot:body>
      <div class="comments">
        <div class="comment-container">
          <div class="comment" v-for="comment in userNotes.data" :key="comment.id">
            <div class="avatar" :class="defaultAvatarShape">
              <img :src="comment.author_avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" :style="avatarHighlight(comment.author_highlight_color)">
            </div>
            <div class="title">
              <div class="bold inline-block" :style="usernameHighlight(comment.author_highlight_color)">{{ comment.author_name}}</div>
              <span class="date">{{ humanDate(comment.created_at) }}</span>
              <span v-if="comment.created_at !== comment.updated_at" class="date">&mdash;&nbsp;Edited {{ humanDate(comment.updated_at) }}</span>
              <div class="right" v-if="comment.author_id === authedUser.id">
                <!-- TODO(akinsey): data-balloon="Delete" -->
                <a v-if="accessControl.delete && !comment.showConfirmDelete" class="action pointer" @click="comment.showConfirmDelete = true">
                  <i class="fa fa-trash"></i>
                </a>
                <a class="small-text pointer" v-if="comment.showConfirmDelete" @click="deleteUserNote(comment)">&nbsp;Confirm&nbsp;</a>
                <a class="small-text pointer" v-if="comment.showConfirmDelete" @click="comment.showConfirmDelete = false">&nbsp;Cancel&nbsp;</a>
                &nbsp;&nbsp;
                <!-- TODO(akinsey): data-balloon="Edit" -->
                <a v-if="accessControl.update" class="action pointer" @click="comment.showEdit = !comment.showEdit; comment.noteEdit = comment.note">
                  <i class="fa fa-edit"></i>
                </a>
              </div>
            </div>
            <div class="note" v-if="!comment.showEdit">{{ comment.note }}</div>
            <div class="note" v-if="comment.showEdit">
              <textarea v-model="comment.noteEdit"></textarea>
              <div class="right">
                <span v-if="comment?.noteEdit?.length < 3 || comment.noteEdit === comment.note">&nbsp;Save&nbsp;</span>
                <a class="pointer" v-if="comment?.noteEdit?.length > 2 && comment.noteEdit !== comment.note" @click="editUserNote(comment)">&nbsp;Save&nbsp;</a>
                <a class="pointer" @click="comment.showEdit = false;">&nbsp;Cancel&nbsp;</a>
              </div>
            </div>
          </div>
          <div v-if="userNotes?.data?.length" class="mod-notes pagination-simple">
            <button @click="pullPage(-1)" :disabled="!userNotes?.prev">&#10094; Prev</button>
            <label>Page {{userNotes.page}}</label>
            <button @click="pullPage(1)" :disabled="!userNotes?.next">Next &#10095;</button>
          </div>
          <div v-if="!userNotes?.data?.length">
            <h5 class="no-comments">No Moderation Notes to Display</h5>
          </div>
        </div>
      </div>
      <form v-if="userCopy" action="." class="css-form">
        <!-- Note -->
        <div class="input-section textarea">
          <label for="note">Note</label>
          <textarea rows="5" id="note" :placeholder="`Leave your moderation note for ${user.username} here...`" v-model="note" ref="focusInput" maxlength="5000"></textarea>
        </div>

        <!-- Save Button -->
        <div class="modal-actions">
          <button @click.prevent="leaveNote()" :disabled="note?.length < 3">
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
import { reactive, toRefs, inject, onBeforeMount, onBeforeUpdate } from 'vue'
import { cloneDeep } from 'lodash'
import humanDate from '@/composables/filters/humanDate'
import { avatarHighlight, usernameHighlight } from '@/composables/utils/userUtils'
import { usersApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'moderation-notes-modal',
  props: ['show', 'user'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    onBeforeMount(() => fetchNotes())

    /* This handles user clicking link switching from one user's profile to another's */
    onBeforeUpdate(() => props.user.id !== v.userNotes.user_id ? fetchNotes() : null)

    const fetchNotes = () => usersApi.notes({
      user_id: props.user.id,
      page: 1,
      limit: 5
    }).then(d => v.userNotes = d).catch(() => {})

    /* Template Methods */
    const pullPage = inc => usersApi.notes({
      user_id: props.user.id,
      page: v.userNotes.page && (v.userNotes.page + inc) >= 1 ? v.userNotes.page + inc : 1,
      limit: 5
    }).then(d => v.userNotes = d).catch(() => {})

    const leaveNote = () => usersApi.createNote({ author_id: v.authedUser.id, note: v.note, user_id: props.user.id })
      .then(() => v.note = '')
      .then(() => v.userNotes?.data?.length  === 1 ? pullPage(-1) : pullPage(0))
      .catch(() => {
        v.errorMessage = 'Error: There was an issue editing this moderation note, please try again later'
      })

    const editUserNote = comment => usersApi.updateNote({ id: comment.id, note: comment.noteEdit })
      .then(() => v.userNotes?.data?.length  === 1 ? pullPage(-1) : pullPage(0))
      .catch(() => {
        v.errorMessage = 'Error: There was an issue editing this moderation note, please try again later'
      })

    const deleteUserNote = comment => usersApi.deleteNote({ id: comment.id })
      .then(() => v.userNotes?.data?.length  === 1 ? pullPage(-1) : pullPage(0))
      .catch(() => {
        v.errorMessage = 'Error: There was an issue deleting this moderation note, please try again later'
      })

    const close = () => {
      v.errorMessage = null
      emit('close')
    }

    /* Internal Data */
    const $auth = inject(AuthStore)

    /* Template Data */
    const v = reactive({
      authedUser: $auth.user,
      userCopy: cloneDeep(props.user),
      userReactive: props.user,
      focusInput: null,
      userNotes: {},
      note: '',
      errorMessage: '',
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      accessControl: $auth.permissionUtils.hasPermission('userNotes')
    })

    return { ...toRefs(v), leaveNote, editUserNote, deleteUserNote, pullPage, avatarHighlight, usernameHighlight, humanDate, close }
  }
}
</script>

<style scoped lang="scss">
.comments {
  margin-top: -0.625rem;
  .comment-container {
    .comment {
    display: grid;
    grid-template-columns: 2.5rem  1fr;
    grid-column-gap: 1rem;
    grid-template-areas: "avatar  title" "avatar  note";
      @include clearfix;
      padding: 1rem;
      border-bottom: 1px solid $border-color;
      &:nth-of-type(odd) { background-color: $sub-header-color; }
      &:last-child { margin-bottom: 1rem; }
      .avatar {
        grid-area: avatar;
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
      .title {
        grid-area: title;
        margin-bottom: 0.5rem;
        .date { @include pad(0 0 0 0.25rem); font-size: 0.8rem; color: $secondary-font-color; }
        .action { color: $secondary-font-color; }
        &:hover .action { color: $secondary-font-color-dark; }
        &:hover .action:hover { color: $color-primary;; }
      }
      .note { grid-area: note; }
      textarea { grid-area: note; min-height: 4.5rem; resize: vertical; }

    }
    .mod-notes.pagination-simple {
      margin: 1rem 0;
      grid-template-columns: auto auto auto;
      label { text-align: center }
      button:last-child { text-align: right; }
    }

    @include break-mobile-sm {
      .comment {
        .avatar { display: none; }
      }
    }
  }
}
h5.no-comments { text-align: center; margin: 0.625rem 0; }
.modal-container .modal-actions { margin-top: 0; }
.input-section.textarea textarea { height: 4.5rem; resize: vertical; }
</style>
