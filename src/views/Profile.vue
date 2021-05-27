<template>
  <div class="profile-wrap" v-if="user">
    <div class="message-banned" v-if="banExpiration">
      {{ user.username }}
      <span v-if="banExpiration !== 'Permanent'">
        is banned until {{ banExpiration }}
      </span>
      <span v-if="banExpiration === 'Permanent'">
         is permanently banned
       </span>
    </div>

    <div class="profile-header" v-if="user">
      <div class="profile-avatar">
        <div class="profile-avatar-container" :class="defaultAvatarShape">
          <a href="#" v-if="canUpdate()" @click.prevent="showEditAvatar = true" class="profile-avatar-image">
            <img :src="user.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
            <span class="profile-user-status" :data-balloon="user.username + ' is online'" v-if="isOnline">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <circle cx="24" cy="24" r="16"/>
              </svg>
            </span>
          </a>
          <img v-if="!canUpdate()" :src="user.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
          <a href="#" class="edit-avatar" v-if="canUpdate()" @click.prevent="showEditAvatar = true">
            <div>Change Avatar</div>
          </a>
        </div>
      </div>

      <div class="profile-user-details">
        <div class="profile-user-name-role">
          <h1>{{user.username}}</h1>
          <span class="username-screen" v-html="user.name"></span>
          <span class="user-role" :style="{ 'background-color': user.role_highlight_color ? user.role_highlight_color : 'grey' }" v-html="user.role_name"></span>
          <span class="user-rank">
            <rank-display :user="user" />
          </span>
        </div>

        <div class="profile-user-activity">
          <div class="user-activity-stat" v-if="user.activity > -1">Activity: <span class="value">{{user.activity}}</span>
          </div>
           <trust-profile-display v-if="loggedIn" :username="user.username" />
        </div>

        <div class="user-profile-position">
          <span v-html="user.position"></span>
          <span v-html="user.status"></span>
        </div>

        <div class="signature-block">
          <div class="signature" v-html="user.signature || user.raw_signature">
          </div>
          <a href="#" @click.prevent="showEditSignature = true" data-balloon="Edit your signature" v-if="canUpdate()" class="signature-edit">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <title></title>
              <path d="M7.38,33.74h0L4,44l10.26-3.39h0L41.74,13.14,34.86,6.26Zm31-21.15.54.55L14.26,37.79l-.54-.54"/>
              <path d="M45.48,6.89,41.11,2.52a1.78,1.78,0,0,0-2.5,0L36.11,5,43,11.89l2.5-2.5A1.76,1.76,0,0,0,45.48,6.89Z"/>
            </svg>
          </a>
        </div>

        <div class="profile-user-stats">
          <div class="stats">
            <span class="stat-text">{{ user.post_count || 0 }}</span>
            <span class="label">Posts</span>
          </div>
          <div class="stats">
            <span class="label">Last Seen </span>
            <span class="stat-text-sm">{{ humanDate(user.last_active, true) }}</span>
          </div>
          <div class="stats">
            <span class="label">Created </span>
            <span class="stat-text-sm">{{ humanDate(user.created_at, true) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="profile-threads-posts">
      <router-view v-if="user" :user="user"></router-view>
    </div>

    <div class="profile-sidebar">
      <div class="actions-user-profile actions-panel" v-if="user && user.email || user.gender || user.dob || user.location || user.language || userLocalTime">
        <a :href="`mailto:${user?.email}`" target="_blank">{{user?.email}}</a>
        <div><span>{{user.btc_address}}</span></div>
        <div>
          <a v-if="user?.website" :href="user.website.indexOf('://') > -1 ? user.website : '//' + user.website" target="_blank">{{user.website}}</a>
        </div>
        <div v-if="user.gender">
          Gender:&nbsp;&nbsp;<span v-html="user?.gender"></span>
        </div>
        <div v-if="user.dob">
          Age:&nbsp;&nbsp;<span>{{userAge(user?.dob)}}</span>
        </div>
        <div v-if="user.location">
          Location:&nbsp;&nbsp;<span v-html="user?.location"></span>
        </div>
        <div v-if="user.language">
          Language:&nbsp;&nbsp;<span v-html="user?.language"></span>
        </div>
      </div>

      <div class="actions-all-users actions-panel" v-if="loggedIn && !pageOwner()">
        <div class="profile-action">
          <a href="#" v-if="canMessage()" @click="showQuickMessage = true">Quick Message</a>
          <a href="#" @click.prevent="toggleIgnorePosts()">{{ user.ignored ? 'Uni' : 'I'}}gnore All Posts by User</a>
          <a href="#" @click.prevent="toggleIgnoreMentions()">{{ user.ignoreMentions ? 'Uni' : 'I'}}gnore All Mentions by User</a>
          <a href="#" @click.prevent="toggleIgnoreMessages()">{{ user.ignore_messages ? 'Uni' : 'I'}}gnore All Messages from User</a>
        </div>
      </div>

      <div class="actions-edit actions-panel" v-if="canUpdate() || canUpdatePrivate() || pageOwner() || canPageUserNotes() || canBanUser() || canBoardBanUser()">
        <div class="profile-action" v-if="canUpdate()">
          <a href="#" @click.prevent="showUpdateProfile = true">Edit Profile</a>
        </div>
        <div class="profile-action" v-if="canUpdatePrivate()">
          <a href="#" @click.prevent="showChangePassword = true">Edit Password</a>
        </div>
        <div class="profile-action" v-if="canUpdatePrivate()">
          <a href="#" @click.prevent="showChangeEmail = true">Edit Email</a>
        </div>
        <div class="profile-action" v-if="pageOwner()">
          <router-link :to="{ name: 'Settings' }">Edit Forum Settings</router-link>
        </div>
        <!-- TODO(akinsey): <trust-link v-if="pageOwner()"></trust-link> -->
        <div class="profile-action" v-if="canPageUserNotes()">
          <a href="#" @click.prevent="showModNotes = true">
            Moderation Notes
            <i class="fa fa-comment" v-if="user?.hasNotes"></i>
            <i class="fa fa-comment-o" v-if="!user?.hasNotes"></i>
          </a>
        </div>
        <div class="profile-action" v-if="canBanUser() || canBoardBanUser()">
          <a href="#" @click.prevent="showManageBans = true">Manage Bans</a>
        </div>
      </div>

      <div class="actions-destructive actions-panel" v-if="canDeactivate() || canReactivate() || canDelete()">
        <!--  TODO(akinsey): <reset-password user="user"></reset-password> -->
        <div class="profile-action" v-if="canDeactivate()">
          <a href="#" @click.prevent="showDeactivate = true">Deactivate Account</a>
        </div>
        <div class="profile-action" v-if="canReactivate()">
          <a href="#" @click.prevent="showReactivate = true">Reactivate Account</a>
        </div>
        <div class="profile-action" v-if="canDelete()">
          <a href="#" @click.prevent="showDelete = true">Delete Account</a>
        </div>
      </div>
    </div>
  </div>

  <update-profile-modal v-if="user" :user="user" :show="showUpdateProfile" :can-update-username="canUpdateUsername" @close="showUpdateProfile = false" />
  <update-avatar-modal v-if="user" :user="user" :show="showEditAvatar" @close="showEditAvatar = false" />
  <quick-message-modal v-if="user" :user="user" :show="showQuickMessage" @close="showQuickMessage = false" />
  <manage-bans-modal v-if="user" :user="user" :show="showManageBans" @close="showManageBans = false" />
  <moderation-notes-modal v-if="user && canPageUserNotes()" :user="user" :show="showModNotes" @close="showModNotes = false" />
  <update-email-modal v-if="user" :user="user" :show="showChangeEmail" @close="showChangeEmail = false" />
  <update-signature-modal v-if="user" :user="user" :show="showEditSignature" @close="showEditSignature = false" />
  <update-password-modal v-if="user" :user="user" :show="showChangePassword" @close="showChangePassword = false" />
  <deactivate-reactivate-modal v-if="user" :user="user" :deactivate="showDeactivate" :show="showDeactivate || showReactivate" @close="showDeactivate = false; showReactivate = false" @success="refreshUser()" />
  <delete-account-modal v-if="user" :user="user" :show="showDelete" @close="showDelete = false" @success="redirectHome()" />
</template>

<script>
import { reactive, toRefs, inject } from 'vue'
import dayjs from 'dayjs'
import humanDate from '@/composables/filters/humanDate'
import TrustProfileDisplay from '@/components/trust/TrustProfileDisplay.vue'
import RankDisplay from '@/components/users/RankDisplay.vue'
import UpdatePasswordModal from '@/components/modals/profile/UpdatePassword.vue'
import UpdateEmailModal from '@/components/modals/profile/UpdateEmail.vue'
import UpdateAvatarModal from '@/components/modals/profile/UpdateAvatar.vue'
import DeactivateReactivateModal from '@/components/modals/profile/DeactivateReactivate.vue'
import DeleteAccountModal from '@/components/modals/profile/DeleteAccount.vue'
import QuickMessageModal from '@/components/modals/profile/QuickMessage.vue'
import ManageBansModal from '@/components/modals/profile/ManageBans.vue'
import ModerationNotesModal from '@/components/modals/profile/ModerationNotes.vue'
import UpdateProfileModal from '@/components/modals/profile/UpdateProfile.vue'
import UpdateSignatureModal from '@/components/modals/profile/UpdateSignature.vue'
import { usersApi, mentionsApi, messagesApi } from '@/api'
import { useRouter } from 'vue-router'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'Profile',
  props: [ 'username', 'saveScrollPos' ],
  components: { TrustProfileDisplay, RankDisplay, UpdateSignatureModal, UpdatePasswordModal, UpdateAvatarModal, UpdateEmailModal, DeleteAccountModal, DeactivateReactivateModal, UpdateProfileModal, QuickMessageModal,ManageBansModal, ModerationNotesModal },
  beforeRouteEnter(to, from, next) {
    next(vm => usersApi.find(to.params.username).then(u => vm.user = u))
  },
  beforeRouteUpdate(to, from, next) {
    usersApi.find(to.params.username).then(u => this.user = u)
    next()
  },
  setup(props) {
    /* Template Methods */
    const refreshUser = () => usersApi.find(v.user.username).then(u => v.user = u)
    const redirectHome = () => $router.replace('/')

    const userAge = dob => {
      if (!dob) return
      const today = dayjs.utc()
      const birthDate = dayjs.utc(dob)
      return today.diff(birthDate, 'year')
    }

    const canUpdate = () => {
      if (!v.loggedIn) return false
      if (!v.permUtils.hasPermission('users.update.allow')) return false
      const same = v.permUtils.hasPermission('users.update.bypass.priority.admin')
      const lower = v.permUtils.hasPermission('users.update.bypass.priority.mod')
      if (pageOwner()) return true
      else if (same) return v.permUtils.getPriority() <= v.user.priority
      else if (lower) return v.permUtils.getPriority() < v.user.priority
      return false
    }
    const canUpdateUsername = () => {
      if (!v.loggedIn) return false
      if (!v.permUtils.hasPermission('users.changeUsername.allow')) return false
      return canUpdate()
    }
    const canMessage = () => {
      if (!v.loggedIn) return false
      if (!v.permUtils.hasPermission('conversations.create.allow')) return false
      if (!pageOwner()) return true
      return false
    }
    const canUpdatePrivate = () => canUpdate() && pageOwner()
    const pageOwner = () => props.username === $auth.user?.username
    const canPageUserNotes = () => v.loggedIn && v.permUtils.hasPermission('userNotes.page.allow')
    const canBanUser = () => {
      if (!v.loggedIn) return false
      if (!v.permUtils.hasPermission('bans.ban.allow')) return false
      const same = v.permUtils.hasPermission('bans.ban.bypass.priority.same')
      const lower = v.permUtils.hasPermission('bans.ban.bypass.priority.less')
      if (pageOwner()) return true
      else if (same) return v.permUtils.getPriority() <= v.user.priority
      else if (lower) return v.permUtils.getPriority() < v.user.priority
      return false
    }
    const canBoardBanUser = () => {
      if (!v.loggedIn) return false
      if (!v.permUtils.hasPermission('bans.banFromBoards')) return false
      const same = v.permUtils.hasPermission('bans.banFromBoards.bypass.priority.same')
      const lower = v.permUtils.hasPermission('bans.banFromBoards.bypass.priority.less')
      if (pageOwner()) return true
      else if (same) return v.permUtils.getPriority() <= v.user.priority
      else if (lower) return v.permUtils.getPriority() < v.user.priority
      return false
    }
    const canDeactivate = () => {
      if (!v.loggedIn) return false
      if (!v.permUtils.hasPermission('users.deactivate.allow')) return false
      if (v.user.deleted) return false
      if (pageOwner()) return true
      return false
    }
    const canReactivate = () => {
      if (!v.loggedIn) return false
      if (!v.permUtils.hasPermission('users.reactivate.allow')) return false
      if (!v.user.deleted) return false
      if (pageOwner()) return true
      return false
    }
    const canDelete = () => {
      if (!v.loggedIn) return false
      if (!v.permUtils.hasPermission('users.delete.allow')) return false
      const same = v.permUtils.hasPermission('users.delete.bypass.priority.admin');
      const lower = v.permUtils.hasPermission('users.delete.bypass.priority.mod');
      if (pageOwner()) return true
      else if (same) return v.permUtils.getPriority() <= v.user.priority
      else if (lower) return v.permUtils.getPriority() < v.user.priority
      return false
    }

    const toggleIgnorePosts = () => {
      const promise = v.user.ignored ? usersApi.unignore : usersApi.ignore
      promise(v.user).then(() => refreshUser())
      .then(() => $alertStore.success(`${v.user.ignored ? 'Ignoring' : 'Unignoring' } posts by ${v.user.username}`))
    }
    const toggleIgnoreMentions = () => {
      const promise = v.user.ignoreMentions ? mentionsApi.unignore : mentionsApi.ignore
      promise(v.user).then(() => refreshUser())
      .then(() => $alertStore.success(`${v.user.ignoreMentions ? 'Ignoring' : 'Unignoring' } mentions from ${v.user.username}`))
    }
    const toggleIgnoreMessages = () => {
      const promise = v.user.ignore_messages ? messagesApi.unignore : messagesApi.ignore
      promise(v.user).then(() => refreshUser())
      .then(() => $alertStore.success(`${v.user.ignore_messages ? 'Ignoring' : 'Unignoring' } messages from ${v.user.username}`))
    }

    /* Internal Data */
    const $router = useRouter()
    const $auth = inject(AuthStore)
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      loggedIn: $auth.loggedIn,
      permUtils: $auth.permissionUtils,
      banExpiration: null,
      isOnline: true,
      userLocalTime: null,
      user: null,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      showUpdateProfile: false,
      showEditAvatar: false,
      showEditSignature: false,
      showQuickMessage: false,
      showChangePassword: false,
      showChangeEmail: false,
      showModNotes: false,
      showDeactivate: false,
      showReactivate: false,
      showDelete: false,
      showManageBans: false
    })
    return { ...toRefs(v), refreshUser, toggleIgnorePosts, toggleIgnoreMessages, toggleIgnoreMentions, redirectHome, canUpdate, canUpdateUsername, canMessage, userAge, canUpdatePrivate, pageOwner, canPageUserNotes, canBanUser, canBoardBanUser, canReactivate, canDeactivate, canDelete, humanDate }
  }
}
</script>

<style lang="scss">
/*-------------- Profile Layout -------------- */
.message-banned {
  background-color: $color-primary;
  color: $light-text-default;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  width: 100%;
}

.profile-wrap {
  grid-column: span 2;
  display: grid;
  @include grid-columns-base
  grid-template-areas:
    "header sidebar"
    "main sidebar";
  column-gap: 2rem;

  @include break-mobile-med {
    grid-template-columns: 1fr;
    grid-template-areas:
      "header"
      "sidebar"
      "main";
    width: 100%;
  }
}

.profile-header {
  display: flex;
  grid-area: header;
  padding: 1rem 0;

  .profile-avatar {
    flex: 0 0 $avatar-width;
    margin-right: 2rem;
    position: relative;
    text-align: center;
    .profile-avatar-container {
      width: $avatar-width;
      height: $avatar-width;
      img { margin-bottom: 0.5rem; }
      &.circle img {
        @include border-radius(100%);
        object-fit: cover;
        height: 100%;
        width: 100%;
      }
      &.rect img {
        object-fit: cover;
        height: calc(#{$avatar-width / 1.5});
      }
    }

    .edit-avatar { font-size: $font-size-sm; }

    .profile-user-status {
      position: absolute;
      top: 4px;
      right: 4px;

      svg {
        stroke: $base-background-color;
        stroke-width: 6;
        fill: green;
        width: 1.5rem;
      }
    }

    .rect {
      .profile-user-status {
        top: -8px;
        right: -8px;
      }
    }
  }

  .profile-user-details {
    display: flex;
    flex-direction: column;

    .profile-user-name-role {
      display: flex;
      align-items: center;
      font-size: 1.5rem;
      line-height: 1.1;
      margin-bottom: 0.5rem;

      h1 {
        color: $base-font-color;
        font-size: inherit;
        font-weight: 600;
        line-height: inherit;
        padding-right: 0.5rem;
        text-transform: none;
      }

      .username-screen {
        color: $text-gray-med;
        font-weight: 400;
        margin-right: 0.5rem;
      }

      .user-role {
        background: $color-primary;
        border-radius: 2px;
        color: #fff;
        font-size: $font-size-xs;
        line-height: 1.4;
        max-width: 140px;
        overflow: hidden;
        padding: 1px 6px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        margin-right: 0.5rem;
      }
      .user-rank {
        background: transparent;
        border-radius: 2px;
        color:  $base-font-color;
        font-size: $font-size-xs;
        line-height: 1.4;
        max-width: 140px;
        overflow: hidden;
        padding: 1px 6px;
        text-align: center;
        text-overflow: ellipsis;
        white-space: nowrap;
        border: 1px solid $border-color;
      }
    }

    .profile-user-activity {
      color: $text-gray-med;
      font-size: $font-size-sm;
      margin-bottom: 1rem;
      text-transform: uppercase;

      .user-activity-stat, .trust-profile {  display: inline; }

      .user-activity-stat { margin-right: 1rem; }

      .value { font-weight: 600; }

      .trust-profile {
        div { display: inline; }
        .trust-score { font-weight: 600; margin-right: 1rem; }
        a { color: $text-gray-med; text-decoration: underline; }
      }
    }

    .signature-block { display: flex; margin-bottom: 1rem; }

    .signature {
      @include truncate-ellipsis;
      font-size: $font-size-xs;
      color: $text-gray-med;
      line-height: 1.2;
      max-height: 50px;
      word-break: break-word;
      white-space: pre-wrap;
      width: 100%;
    }

    .signature-edit { flex: 0 0 20px; }
  }

  .profile-user-stats {
    display: flex;
    margin-bottom: 2rem;

    .stats {
      border: $border;
      border-radius: 6px;
      color: $text-gray-dark;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      padding: 0.5rem;
      text-align: center;
      width: 100px;
      max-width: 120px;

      .label { font-size: $font-size-xs; }
      .stat-text {
        font-size: 2rem;
        font-weight: 600;
        margin-bottom: 0.25rem;
        &-sm { font-size: 21px; font-weight: 600; }
      }
    }
  }

  @include break-mobile-med {
    align-items: center;
    flex-direction: column;
    .profile-avatar {
      margin-bottom: 1rem;
      margin-right: 0;
    }
    .profile-user-details {
      .profile-user-name-role {
        flex-direction: column;
        margin-bottom: 1.5rem;

        h1,
        .username-screen,
        .user-role {
          margin-bottom: 0.25rem;
        }
      }
    }
    .profile-user-activity { text-align: center; }
    .trust-profile { .trust-link { white-space: nowrap; } }
  }
}

.profile-threads-posts { grid-area: main; }

.profile-sidebar {
  color: $text-gray-dark;
  grid-area: sidebar;
  .actions-panel {
    border-bottom: $border;
    line-height: 1.5;
    margin-bottom: 1rem;
    padding-bottom: 1rem;
    .profile-action a { display: block; }
  }
}

.profile-save-container { padding-top: 20px; }
.profile-posts, .profile-content, .profile-row {
  // @include clearfix;
  // @include row;
  margin-bottom: 1rem;
}
.profile-content {
  display: grid;
  column-gap: 2rem;
  grid-template-columns: 1fr 3fr;
  display: none;

  .profile-left {
    word-wrap: break-word;
    .profile-avatar-container {
      width: 100%;
      height: 100%;
      .profile-avatar-image {
        display: block;
        position: relative;
      }
      .profile-user-status {
        position: absolute;
        right: -1rem;
        top: -1rem;

        svg {
          stroke: #fff;
          stroke-width: 6;
          fill: green;
          height: 2rem;
          width: auto;
        }
      }

      img {
        @include transition(opacity 0.5s ease-in);
        opacity: 0;
        object-fit: cover;
      }
      img.loaded { opacity: 1; }
      &:hover .after { transition-delay:0s; visibility: visible; opacity: 1;}
      .after {
        @include transition(visibility 0s linear 0.1s, opacity 0.1s linear);
        visibility: hidden;
        opacity: 0;
        position: absolute;
        bottom: 0;
        left: 0;
        text-align: center;
        line-height: 1.5rem;
        width: 100%;
        height: 45px;
        color: #FFF;
        padding: 0.625rem;
        background: rgba(0, 0, 0, .6);
      }
    }
  }
  .profile-right { word-wrap: break-word; }
}
.profile-posts {
  .profile-row {
    .title { font-weight: 600; }
    .pagination-wrap {
      float: right;
      ul.pagination { float: right; margin-bottom: 0px; }
    }
  }
}

.more-posts { margin-bottom: 2rem; }
.profile-posts { button { margin-bottom: 0; } }
.pagination-simple { margin-bottom: 0; }

// image-uploader {
//   display: block;
//   margin-top: 1rem;
// }

@include break-mobile-med {
  .pagination-wrap {
    pagination {
      text-align: right;
    }
  }
}


@include break-mobile-sm {
  .profile-content {
    .profile-right {
      border-top: 1px solid #ddd;
      padding-top: 1rem;
      .stats .stat-text { font-size: 1rem; }
    }
    // .profile-left, .profile-right { @include span-columns(8); @include omega; }
  }
  .profile-posts, & {
    // .profile-row .title, .profile-row .pagination-wrap, .pagination-wrap {
    //   @include span-columns(8);
    //   @include omega;
    // }
    .profile-row .pagination-wrap, .profile-row .pagination-wrap ul.pagination {
      float: none;
      text-align: center;
    }
  }
  .mobile-post-time { color: $secondary-font-color; padding-bottom: 1rem; }
  .mobile-post { padding: 1rem; }
  .mobile-post:nth-child(even) { background: $sub-header-color; }
  .mobile-post:last-child { border-bottom: 0px; }
}

</style>
