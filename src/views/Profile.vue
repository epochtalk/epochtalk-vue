<template>
  <div class="message-banned" v-if="banExpiration">
    {{ user.username }}
    <span v-if="banExpiration !== 'Permanent'">
      is banned until {{ banExpiration }}
    </span>
    <span v-if="banExpiration === 'Permanent'">
       is permanently banned
     </span>
  </div>

  <div class="profile-header">
    <div class="profile-avatar">
      <div class="profile-avatar-container" :class="defaultAvatarShape">
        <a href="#" v-if="canUpdate()" @click.prevent="showEditAvatar = true" class="profile-avatar-image">
          <img :src="user?.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
          <!-- TODO(akinsey): <span class="profile-user-status" data-balloon="{{vmProfile.user.username}} is online" ng-if="vmProfile.isOnline"> -->
          <span class="profile-user-status" v-if="isOnline">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r="16"/>
            </svg>
          </span>
        </a>
        <img v-if="!canUpdate()" :src="user?.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
        <a href="#" class="edit-avatar" v-if="canUpdate()" @click.prevent="showEditAvatar = true">
          <div>Change Avatar</div>
        </a>
      </div>
    </div>

    <div class="profile-user-details">
      <div class="profile-user-name-role">
        <h1>{{user?.username}}</h1>
        <span class="username-screen">{{user?.name}}</span>
        <!--  TODO(akinsey): no style in vue <span class="user-role" style="background-color: {{vmProfile.user.role_highlight_color ? vmProfile.user.role_highlight_color : 'grey'}}" ng-bind-html="vmProfile.user.role_name"></span> -->
        <span class="user-role">{{user?.role_name}}</span>
       <!-- TODO(akinsey): <span class="user-rank">
            <rank-display ranks="vmProfile.user.metadata.ranks" maps="vmProfile.user.metadata.rank_metric_maps" user="vmProfile.user"></rank-display>
        </span> -->
      </div>

      <!-- TODO(akinsey): <div class="profile-user-activity">
        <div class="user-activity-stat" v-if="user.activity > -1">Activity: <span class="value">{{user.activity}}</span></div>
         <trust-profile ng-if="vmProfile.isLoggedIn()" username="vmProfile.user.username"></trust-profile>
      </div> -->

      <div class="user-profile-position">
        <span>{{user?.position}}</span>
        <span>{{user?.status}}</span>
      </div>

      <div class="signature-block">
        <div class="signature">{{user?.signature || user?.raw_signature}}
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
          <span class="stat-text">{{ user?.post_count || 0 }}</span>
          <span class="label">Posts</span>
        </div>
        <div class="stats">
          <span class="label">Last Seen </span>
          <span class="stat-text-sm">{{ humanDate(user?.last_active) }}</span>
        </div>
        <div class="stats">
          <span class="label">Created </span>
          <span class="stat-text-sm">{{ humanDate(user?.created_at) }}</span>
        </div>
      </div>
    </div>
  </div>

  <div class="profile-threads-posts">
    <user-posts />
  </div>

  <div class="profile-sidebar">
    <div class="actions-user-profile actions-panel" v-if="user?.email || user?.gender || user?.dob || user?.location || user?.language || userLocalTime">
      <a href="{{`mailto:${user?.email}`}}" target="_blank">{{user?.email}}</a>
      <div><span>{{user.btc_address}}</span></div>
      <div>
        <a href="{{ user.website.indexOf('://') > -1 ? user.website : '//' + user.website }}" target="_blank">{{user?.website}}</a>
      </div>
      <div v-if="user?.gender">
        Gender:&nbsp;&nbsp;<span>{{user?.gender}}</span>
      </div>
      <div v-if="user?.dob">
        Age:&nbsp;&nbsp;<span>{{userAge(user?.dob)}}</span>
      </div>
      <div v-if="user?.location">
        Location:&nbsp;&nbsp;<span>{{user?.location}}</span>
      </div>
      <div v-if="user?.language">
        Language:&nbsp;&nbsp;<span>{{user?.language}}</span>
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
        <a href="#" @click.prevent="openEditProfile()">Edit Profile</a>
      </div>
      <div class="profile-action" v-if="canUpdatePrivate()">
        <a href="#" @click.prevent="showEditPassword = true">Edit Password</a>
      </div>
      <div class="profile-action" v-if="canUpdatePrivate()">
        <a href="#" @click.prevent="showEditEmail = true">Edit Email</a>
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
</template>

<script>
import { reactive, toRefs } from 'vue'
import UserPosts from '@/components/users/UserPosts.vue'
import humanDate from '@/composables/filters/humanDate'

export default {
  name: 'Profile',
  components: { UserPosts },
  props: [ 'user' ],
  setup(props) {
    const canUpdate = () => true
    const canMessage = () => true
    const userAge = dob => dob
    const canUpdatePrivate = () => true
    const pageOwner = () => true
    const canPageUserNotes = () => true
    const canBanUser = () => true
    const canDeactivate = () => true
    const canReactivate = () => true
    const canDelete = () => true
    const showManageBans = user => console.log('Show Manage Ban', user)

    const v = reactive({
      banExpiration: null,
      isOnline: true,
      userLocalTime: null,
      user: props.user || {},
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      showEditAvatar: false,
      showEditSignature: false,
      showQuickMessage: false,
      showEditPassword: false,
      showEditEmail: false,
      showModNotes: false,
      showDeactivate: false,
      showReactivate: false,
      showDelete: false
    })
    return { ...toRefs(v), canUpdate, canMessage, userAge, canUpdatePrivate, pageOwner, canPageUserNotes, canBanUser, showManageBans, canReactivate, canDeactivate, canDelete, humanDate }
  }
}
</script>

<style lang="scss">

</style>
