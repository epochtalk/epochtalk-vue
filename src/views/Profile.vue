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
            <!-- TODO(akinsey): <span class="profile-user-status" data-balloon="{{vmProfile.user.username}} is online" ng-if="vmProfile.isOnline"> -->
            <span class="profile-user-status" v-if="isOnline">
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
          <!--  TODO(akinsey): no style in vue <span class="user-role" style="background-color: {{vmProfile.user.role_highlight_color ? vmProfile.user.role_highlight_color : 'grey'}}" ng-bind-html="vmProfile.user.role_name"></span> -->
          <span class="user-role" v-html="user.role_name"></span>
         <!-- TODO(akinsey): <span class="user-rank">
              <rank-display ranks="vmProfile.user.metadata.ranks" maps="vmProfile.user.metadata.rank_metric_maps" user="vmProfile.user"></rank-display>
          </span> -->
        </div>

        <!-- TODO(akinsey): <div class="profile-user-activity">
          <div class="user-activity-stat" v-if="user.activity > -1">Activity: <span class="value">{{user.activity}}</span></div>
           <trust-profile ng-if="vmProfile.isLoggedIn()" username="vmProfile.user.username"></trust-profile>
        </div> -->

        <div class="user-profile-position">
          <span v-html="user.position"></span>
          <span v-html="user.status"></span>
        </div>

        <div class="signature-block">
          <div class="signature" v-html="user.signature || user.raw_signature">
          </div>
          <!-- TODO(akinsey): data-balloon="Edit your signature" -->
          <a href="#" @click.prevent="showEditSignature = true" v-if="canUpdate()" class="signature-edit">
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
            <span class="stat-text-sm">{{ humanDate(user.last_active) }}</span>
          </div>
          <div class="stats">
            <span class="label">Created </span>
            <span class="stat-text-sm">{{ humanDate(user.created_at) }}</span>
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

      <div class="actions-all-users actions-panel" v-if="canMessage()">
        <div class="profile-action">
          <a href="#" @click="showQuickMessage = true">Quick Message</a>
        </div>
  <!--       <ignore-user-profile ng-if="vmProfile.isLoggedIn()" user="vmProfile.user"></ignore-user-profile>
        <mentions-ignore-profile ng-if="vmProfile.isLoggedIn() && !vmProfile.pageOwner()" user="vmProfile.user"></mentions-ignore-profile>
        <messages-ignore-profile ng-if="vmProfile.isLoggedIn() && !vmProfile.pageOwner()" user="vmProfile.user"></messages-ignore-profile> -->
      </div>

      <div class="actions-edit actions-panel" v-if="canUpdate() || canUpdatePrivate() || pageOwner() || canPageUserNotes() || canBanUser()">
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
        <div class="profile-action" v-if="canBanUser()">
          <a href="#" @click.prevent="showManageBans({ id: user.id, username: user.username, email: user.email, created_at: user.created_at, ban_expiration: user.ban_expiration })">Manage Bans</a>
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

  <update-profile-modal v-if="user" :user="user" :show="showUpdateProfile" @close="showUpdateProfile = false" />
  <change-email-modal v-if="user" :user="user" :show="showChangeEmail" @close="showChangeEmail = false" />
  <change-password-modal v-if="user" :user="user" :show="showChangePassword" @close="showChangePassword = false" />
  <deactivate-reactivate-modal v-if="user" :user="user" :deactivate="showDeactivate" :show="showDeactivate || showReactivate" @close="showDeactivate = false; showReactivate = false" @success="refreshUser()" />
  <delete-account-modal v-if="user" :user="user" :show="showDelete" @close="showDelete = false" @success="redirectHome()" />
</template>

<script>
import { reactive, toRefs } from 'vue'
import humanDate from '@/composables/filters/humanDate'
import ChangePasswordModal from '@/components/modals/profile/ChangePassword.vue'
import ChangeEmailModal from '@/components/modals/profile/ChangeEmail.vue'
import DeactivateReactivateModal from '@/components/modals/profile/DeactivateReactivate.vue'
import DeleteAccountModal from '@/components/modals/profile/DeleteAccount.vue'
import UpdateProfileModal from '@/components/modals/profile/UpdateProfile.vue'
import { usersApi } from '@/api'
import { useRouter } from 'vue-router'

export default {
  name: 'Profile',
  props: [ 'username', 'saveScrollPos' ],
  components: { ChangePasswordModal, ChangeEmailModal, DeleteAccountModal, DeactivateReactivateModal, UpdateProfileModal },
  beforeRouteEnter(to, from, next) {
    next(vm => usersApi.find(vm.username).then(u => vm.user = u))
  },
  beforeRouteUpdate(to, from, next) {
    usersApi.find(this.username).then(u => this.user = u)
    next()
  },
  setup() {
    /* Template Methods */
    const refreshUser = () => usersApi.find(v.user.username).then(u => v.user = u)
    const redirectHome = () => $router.replace('/')

    const canUpdate = () => true
    const canMessage = () => true
    const userAge = dob => dob
    const canUpdatePrivate = () => true
    const pageOwner = () => true
    const canPageUserNotes = () => true
    const canBanUser = () => true
    const canDeactivate = () => !v.user.deleted
    const canReactivate = () => v.user.deleted
    const canDelete = () => true
    const showManageBans = user => console.log('Show Manage Ban', user)

    /* Internal Data */
    const $router = useRouter()

    /* Template Data */
    const v = reactive({
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
      showDelete: false
    })
    return { ...toRefs(v), refreshUser, redirectHome, canUpdate, canMessage, userAge, canUpdatePrivate, pageOwner, canPageUserNotes, canBanUser, showManageBans, canReactivate, canDeactivate, canDelete, humanDate }
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

  $avatar-width: 120px;
  .profile-avatar {
    flex: 0 0 $avatar-width;
    margin-right: 2rem;
    position: relative;

    .imageContainer {
      width: $avatar-width;
      height: $avatar-width;
      margin-bottom: 0.5rem;
    }

    .edit-avatar {
      font-size: $font-size-sm;
    }

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
      .imageContainer {
        height: calc(#{$avatar-width / 1.5});
      }

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

      .user-activity-stat,
      trust-profile {
        display: inline;
      }

      .user-activity-stat {
        margin-right: 1rem;
      }

      .value {
        font-weight: 600;
      }

      trust-profile {
        div {
          display: inline;
        }

        .trust-score {
          font-weight: 600;
          margin-right: 1rem;
        }

        a {
          color: $text-gray-med;
          text-decoration: underline;
        }
      }
    }

    .signature-block {
      display: flex;
      margin-bottom: 1rem;
    }

    .signature {
      @include truncate-ellipsis;
      // flex: 1 0 auto;
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
        &-sm {
          font-size: 21px;
          font-weight: 600;
        }
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
    .imageContainer {
      width: 60px;
      height: 60px;
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
      .imageContainer.loaded { background: none; }
      .imageContainer { background: url('/static/img/loading.gif') no-repeat center; display: inline;}
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
  // .profile-row.profile-action { text-align: center; }
  .mobile-post-time { color: $secondary-font-color; padding-bottom: 1rem; }
  .mobile-post { padding: 1rem; }
  .mobile-post:nth-child(even) { background: $sub-header-color; }
  .mobile-post:last-child { border-bottom: 0px; }
}

</style>
