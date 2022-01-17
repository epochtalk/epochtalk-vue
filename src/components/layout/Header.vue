<template>
  <header>
    <!-- Mobile Menu -->
    <div class="burger-close-overlay" :class="{ 'open': showMobileMenu }" @click="showMobileMenu = false" ></div>
    <div class="burger-menu show-mobile" :class="{ 'open' : showMobileMenu }">
      <a @click="showMobileMenu = false" class="profile" href="#">
        <img :src="currentUser.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" class="avatar" :class="defaultAvatarShape">
        <span class="username">{{currentUser.username}}</span>
      </a>
      <div class="close-menu" @click="showMobileMenu = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <title></title>
          <path d="M24,38.83,4.59,19.41a2,2,0,0,1,2.82-2.82L24,33.17,40.59,16.59a2,2,0,0,1,2.82,2.82Z"/>
        </svg>
      </div>
      <ul>
        <li @click="showMobileMenu = false" v-if="permissionUtils.hasPermission('adminAccess')">
          <a href="#"><i class="fa fa-cogs" aria-hidden="true"></i>Admin Panel</a>
        </li>
        <li @click="showMobileMenu = false" v-if="permissionUtils.hasPermission('modAccess') && !permissionUtils.hasPermission('adminAccess')">
          <a href="#"><i class="fa fa-cogs" aria-hidden="true"></i>Mod Panel</a>
        </li>
        <li @click="showMobileMenu = false" v-if="isPatroller()">
          <router-link :to="{ name: 'Patrol' }"><i class="fa fa-binoculars" aria-hidden="true"></i>Patrol</router-link>
        </li>
        <li @click="showMobileMenu = false" >
          <router-link :to="{ path: '/profile/' + currentUser.username.toLowerCase() }">
            <i class="fa fa-user" aria-hidden="true"></i>Profile
          </router-link>
        </li>
        <li @click="showMobileMenu = false" >
          <router-link :to="{ name: 'Settings' }">
            <i class="fa fa-wrench" aria-hidden="true"></i>Settings
          </router-link>
        </li>
        <li @click="showMobileMenu = false" >
          <router-link :to="{ name: 'MemberSearch' }">
            <i class="fa fa-users" aria-hidden="true"></i>Member Search
          </router-link>
        </li>
        <li @click="showMobileMenu = false" >
          <router-link :to="{ name: 'Mentions' }">
            <i class="fas fa-at" aria-hidden="true"></i>Mentions
          </router-link>
          <div class="count" v-if="notificationMentions" v-html="notificationMentions"></div>
        </li>
        <li @click="showMobileMenu = false" >
          <router-link :to="{ name: 'Messages' }" @click="dismissNotifications({ type: 'message' })">
            <i class="fa fa-envelope" aria-hidden="true"></i>Messages
          </router-link>
          <div class="count" v-if="notificationMessages">{{notificationMessages}}</div>
        </li>
        <li @click="showMobileMenu = false" >
          <router-link :to="{ name: 'Watchlist' }">
            <i class="fa fa-eye" aria-hidden="true"></i>Watchlist
          </router-link>
        </li>
        <li @click="showMobileMenu = false"> <!--v-if="canInvite()">-->
          <a @click="showInvite = true">
            <i class="fa fa-user-plus" aria-hidden="true"></i>Invite Users
          </a>
        </li>
        <li @click="showMobileMenu = false" >
          <a @click="logout()"><i class="fas fa-sign-out-alt" aria-hidden="true"></i>Logout</a>
        </li>
      </ul>
    </div>

    <div class="header-contents">
      <!-- Menu -->
      <div id="menu-wrap" :class="{ 'mobile-expanded' : focusSearch }">
        <nav id="menu">
          <!-- Logo Section -->
          <h1>
            <router-link to="/" v-if="logo"><img :src="logo" id="logo" /></router-link>
            <router-link id="logo-text" to="/"> <!-- ng-bind="{{decode(title)}}" -->
              Epochtalk Forums
            </router-link>
          </h1>

          <!-- Login Section -->
          <ul class="signed-out" v-if="!loggedIn">
            <li>
              <a href="" @click.prevent="showRegister = true">REGISTER</a>
            </li>
            <li>
              <a href="" id="login-link" @click.prevent="showLogin = true">LOGIN</a>
            </li>
          </ul>

          <!-- User Dropdown Mobile -->
          <ul v-if="loggedIn" class="burger-icon">
            <div class="burger-notification show-mobile" v-if="notificationMessages || notificationMentions"></div>
            <!-- <i @click="showMobileMenu = true" class="fa fa-bars fa-lg burger" aria-hidden="true"></i> -->
            <span class="burger-menu-icon" @click="showMobileMenu = true" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path d="M7,16H41a2,2,0,0,0,0-4H7a2,2,0,0,0,0,4Z"/>
                <path d="M41,22H7a2,2,0,0,0,0,4H41a2,2,0,0,0,0-4Z"/>
                <path d="M41,32H7a2,2,0,0,0,0,4H41a2,2,0,0,0,0-4Z"/>
              </svg>
            </span>
          </ul>

          <!-- User Dropdown -->
          <ul v-if="loggedIn">
            <li class="search" v-if="permissionUtils.hasPermission('posts.search.allow')">
              <form action="." class="search-btn" autocomplete="off" @submit.prevent="searchForum">
                <div class="balloon" data-balloon="Search" data-balloon-pos="down">
                  <label for="search" class="fa fa-search" :class="{ 'search-label-expanded' : searchExpanded || focusSearch }" @click="toggleFocusSearch()"></label>
                  <input class="search-input" v-model="searchTerms" :class="{ 'search-input-expanded' : focusSearch, 'search-input-minimized' : !focusSearch }" type="search" name="search" placeholder="Search" autocomplete="off" ref="search" />
                </div>
              </form>
            </li>
            <li id="notifications-tray" class="hide-mobile">
              <div data-balloon="Member Search" data-balloon-pos="down" v-if="permissionUtils.hasPermission('users.pagePublic.allow')">
                <router-link :to="{ name: 'MemberSearch' }" class="tray-icon">
                  <i class="fa fa-users"></i>
                </router-link>
              </div>
              <div id="mentions-icon" class="tray-icon" :class="{ 'open': mentionsOpen }" @click="mentionsOpen = true">
                <div class="hoverable" data-balloon="Mentions" data-balloon-pos="down"></div>
                <i class="fas fa-at"></i>
                <div class="count" v-if="notificationMentions" v-html="notificationMentions"></div>
                <ul id="mentions-dropdown">
                  <li>
                    Recent Mentions
                    <div v-if="mentionsList.length" @click="dismissNotifications({ type: 'mention'})" class="dismiss-all">
                      <i class="fa fa-book"></i> Mark all read
                    </div>
                    <div v-if="mentionsList.length" @click="deleteMention({ type: 'mention'})" class="delete-all">
                      <i class="fas fa-trash-alt"></i> Delete all
                    </div>
                  </li>
                  <li class="centered" v-if="!mentionsList.length">
                    You currently have no mentions.
                  </li>
                  <li v-for="mention in mentionsList" :key="mention.notification_id" :class="{ 'dismissed': mention.viewed }">
                    <router-link :to="{ name: 'Posts', params: { threadSlug: mention.thread_slug }, query: { start: mention.post_start }, hash: `#${mention.post_id}` }" @click.prevent="dismissNotifications({ type: 'mention', id: mention.notification_id, viewed: mention.viewed })">
                      <div class="mention-unread"></div>
                      <div class="mention-avatar" :class="defaultAvatarShape">
                        <img :src="mention.mentioner_avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" class="avatar" :class="defaultAvatarShape" />
                      </div>
                      <div class="mention-content">
                        <div class="msg"><strong>{{mention.mentioner}}</strong> mentioned you in <strong>{{mention.title}}</strong></div>
                        <div class="timestamp">{{humanDate(mention.created_at)}}</div>
                      </div>
                    </router-link>
                    <div class="mention-actions">
                      <div @click="deleteMention({ id: mention.id, type: 'mention', notification_id: mention.notification_id })" class="delete" data-balloon="Delete" data-balloon-pos="right">
                        <i class="far fa-times-circle"></i>
                      </div>
                      <div v-if="!mention.viewed" @click="dismissNotifications({ type: 'mention', id: mention.notification_id, viewed: mention.viewed })" class="unmarked" data-balloon="Mark Read" data-balloon-pos="right">
                        <i class="far fa-circle"></i>
                      </div>
                      <div v-if="mention.viewed" class="marked" data-balloon="Read" data-balloon-pos="right">
                        <i class="far fa-check-circle"></i>
                      </div>
                    </div>
                  </li>
                  <li><router-link :to="{ name: 'Mentions' }">View all mentions <span v-html="unseenMentionsText()"></span></router-link></li>
                </ul>
              </div>
              <div id="mentions-overlay" v-if="mentionsOpen" @click="mentionsOpen = false"></div>

              <router-link :to="{ name: 'Messages' }" @click="dismissNotifications({ type: 'message' })">
                <div class="tray-icon" data-balloon="Messages" data-balloon-pos="down">
                  <i class="fa fa-envelope"></i>
                  <div class="count" v-if="notificationMessages">{{notificationMessages}}</div>
                </div>
              </router-link>

              <!-- <div class="tray-icon">
                <i class="fa fa-globe"></i>
                <div class="count" v-if="notificationOther" ng-bind-html="notificationOther"></div>
              </div> -->
            </li>
            <li id="user-dropdown-wrap" class="hide-mobile">
              <div>
                <router-link :to="{ path: '/profile/' + currentUser.username.toLowerCase() }">
                  <div class="avatar-wrap">
                    <img :src="currentUser.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" class="avatar" :class="defaultAvatarShape" />
                  </div>
                  <span>{{currentUser.username}}</span>
                </router-link>
              </div>
              <ul id="user-dropdown">
                <li v-if="permissionUtils.hasPermission('adminAccess')">
                  <a href="#">Admin Panel</a>
                </li>
                <li v-if="permissionUtils.hasPermission('modAccess') && !permissionUtils.hasPermission('adminAccess')">
                  <a href="#">Mod Panel</a>
                </li>
                <li v-if="isPatroller()">
                  <router-link :to="{ name: 'Patrol' }">Patrol</router-link>
                </li>
                <li>
                  <router-link :to="{ path: '/profile/' + currentUser.username.toLowerCase() }">
                    Profile
                  </router-link>
                </li>
                <li>
                  <router-link :to="{ name: 'Settings' }">Settings</router-link>
                </li>
                <li>
                  <router-link :to="{ name: 'Messages' }" @click="dismissNotifications({ type: 'message' })">
                    Messages
                  </router-link>
                </li>
                <li>
                  <router-link :to="{ name: 'Watchlist' }">Watchlist</router-link>
                </li>
                <li> <!--v-if="canInvite()">-->
                  <a href="#" @click.prevent="showInvite = true">
                    Invite User
                  </a>
                </li>
                <li>
                  <router-link :to="{ name: 'About' }">About</router-link>
                </li>
                <li>
                  <a @click="logout()">Logout</a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Breadcrumbs -->
      <breadcrumbs></breadcrumbs>

      <!-- Alerts -->
      <alert></alert>

      <!-- Bans -->
      <div id="ban-notice" v-if="BanStore.updateBanNotice()" v-html="BanStore.updateBanNotice()"></div>

      <!-- Message of the Day -->
      <!-- style-fix="true" -->
      <div v-if="motdData && motdData.motd_html.length && !hideAnnnouncement" id="motd-wrap">
        <div id="motd" v-html="motdData?.motd_html"></div>
      </div>

      <!-- Auth Modals -->
      <login-modal :show="showLogin" @close="showLogin = false" />
      <invite-modal :show="showInvite" @close="showInvite = false" />
      <register-modal :show="showRegister" @close="showRegister = false" />
    </div>
  </header>
  <div v-if="motdData && motdData.motd_html.length && !hideAnnnouncement" id="motd-spacer-wrap">
      <div id="motd-spacer" v-html="motdData?.motd_html"></div>
  </div>
</template>

<script>

import Alert from '@/components/layout/Alert.vue'
import LoginModal from '@/components/modals/auth/Login.vue'
import InviteModal from '@/components/modals/auth/Invite.vue'
import RegisterModal from '@/components/modals/auth/Register.vue'
import Breadcrumbs from '@/components/layout/Breadcrumbs.vue'
import decode from '@/composables/filters/decode'
import { AuthStore } from '@/composables/stores/auth'
import { PreferencesStore } from '@/composables/stores/prefs'
import { reactive, toRefs, watch, onMounted, onUnmounted, onBeforeMount, inject } from 'vue'
import { debounce } from 'lodash'
import { useRouter, useRoute } from 'vue-router'
import BanStore from '@/composables/stores/ban'
import NotificationsStore from '@/composables/stores/notifications'
import humanDate from '@/composables/filters/humanDate'
import { motdApi } from '@/api'

export default {
  components: { Breadcrumbs, LoginModal, InviteModal, RegisterModal, Alert },
  setup() {
    onBeforeMount(() => {
      motdApi.get().then(d => v.motdData = d).catch(() => {})
    })
    /* Internal Methods */
    const scrollHeader = () => {
      let header = document.querySelector('header')
      let windowY = window.scrollY
      if (windowY >= v.scrollDownPos) {
        // Scrolling DOWN
        header.classList.add('is-hidden')
        header.classList.remove('is-visible')
      }
      if (windowY === 0 || windowY < v.lastScrollTop) {
        // Scrolling UP
        header.classList.add('is-visible')
        header.classList.remove('is-hidden')
      }
      v.lastScrollTop = windowY
    }

    /* Template Methods */
    const logout = () => $auth.logout()

    const searchForum = () => {
      $router.push({ name: 'PostSearch', query: { search: v.searchTerms } })
      toggleFocusSearch()
    }

    const dismissNotifications = params => NotificationsStore.dismiss(params)

    const deleteMention = params => NotificationsStore.deleteMention(params)

    const isPatroller = () => v.prefs.patroller_view || $auth.permissionUtils.isPatroller()

    const toggleFocusSearch = () => {
      v.focusSearch = !v.focusSearch
      v.searchExpanded = v.focusSearch
      if (v.searchExpanded) { v.search.focus() }
    }

    const unseenMentionsText = () => {
      let unseenInList = 0;
      v.mentionsList.forEach(mention => { if (!mention.viewed) { unseenInList++ } })
      let unseenHiddenCount = v.notificationMentions - unseenInList;
      return unseenHiddenCount > 0 ? '(' + unseenHiddenCount + ' unread)' : '';
    }

    /* Internal Data */
    const $auth = inject(AuthStore)
    const $prefs = inject(PreferencesStore)
    const $router = useRouter()
    const $route = useRoute()

    /* Template Data */
    const v = reactive({
      showMobileMenu: false,
      focusSearch: false,
      searchExpanded: false,
      searchTerms: '',
      mentionsOpen: false,
      showInvite: false,
      showRegister: false,
      showLogin: false,
      hideAnnnouncement: false,
      motdData: null,
      loggedIn: $auth.loggedIn,
      logo: '',
      scrollDownPos: 95,
      lastScrollTop: 0,
      currentUser: $auth.user,
      permissionUtils: $auth.permissionUtils,
      prefs: $prefs.data,
      search: null,
      mentionsList: NotificationsStore.mentionsList,
      notificationMessages: NotificationsStore.messages,
      notificationMentions: NotificationsStore.mentions,
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      breadcrumbs: [{label:'Home', state: '#', opts: {}}]
    })

    watch(() => $auth.user, u => v.currentUser = u, { deep: true })
    watch(() => $route.path, p => v.hideAnnnouncement = v.motdData?.main_view_only && p !== '' && p !== '/')
    watch(() => NotificationsStore.messages, c => v.notificationMessages = c)
    watch(() => NotificationsStore.mentions, c => v.notificationMentions = c)
    watch(() => NotificationsStore.mentionsList, l => v.mentionsList = l)

    /* Lifecycle Events */
    onMounted(() => {
      window.addEventListener('scroll', debounce(scrollHeader, 10))
    })

    onUnmounted(() => {
      window.removeEventListener('scroll', debounce(scrollHeader, 10))
    })

    return { ...toRefs(v), BanStore, logout, isPatroller, searchForum, dismissNotifications, deleteMention, unseenMentionsText, toggleFocusSearch, decode, humanDate }
  }
}
</script>

<style lang="scss">
/*-- Header Layout --*/
header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  transition: transform ease-in-out 250ms;
  z-index: 2000;

  &.is-hidden {
    pointer-events: none;

    .header-contents {
      transform: translateY(-100%);
    }
  }

  &.is-visible {
    .header-contents {
      transform: translateY(0);
    }
  }

  .header-contents {
    transition: transform ease-in-out 250ms;
  }

  #ban-notice {
    @include pad(0.2rem 0);
    text-align: center;
    margin-bottom: $breadcrumbs-bottom-margin;
    font-weight: bold;
    font-size: 0.85rem;
    color: #ffffff;
    background-color: #f04124;
  }

  // Mobile Menu
  .burger-close-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100vh;
    z-index: 1004;
    opacity: 0;
    transform: translateX(100%);
    transition: opacity ease-in-out 150ms;

    &.open {
      opacity: 1;
      transform: translateX(0%);
    }
  }

  .burger-notification {
    width: 12px;
    height: 12px;
    background: #ff0000;
    position: relative;
    display: inline-block;
    top: -26px;
    left: 28px;
    z-index: 10;
    border-radius: 100px;
    border: 2px solid $header-bg-color;
  }

  .burger-menu {
    background-color: $header-dropdown-bg-color;
    position: fixed;
    top: 0;
    bottom: 0;
    right: 0;
    left: 100%;
    width: 40vw;
    z-index: 4000;
    text-align: left;
    font-size: 1.5rem;
    transition: left 0.2s linear;
    height: 100vh;
    @media screen and (max-width: ($tablet - 1)) and (orientation: portrait) {
      width: 75vw;
    }

    &.open {
      left: 60%;
      @media screen and (max-width: ($tablet - 1)) and (orientation: portrait) {
        left: 25%;
      }
      transition: left 0.2s linear;
      box-shadow: 0 0 20px rgba(0,0,0,1);
    }

    .close-menu {
      position: absolute;
      top: 1rem;
      right: 1rem;

      svg {
        fill: $header-logo-font-color;
        transform: rotate(-90deg)
      }
    }

    .profile {
      display: inline-block;
      padding-top: 1.5rem;
      padding-left: 1.5rem;
      width: 80%;
      .username {
        width: 70%;
        display: inline-block;
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
      }
      .avatar, .avatar {
        position: relative;
        top: -0.15rem;
      }
    }

    ul {
      margin-top: 1.25rem;
      display: block;
      float: left;
      font-size: 1.25rem;
      color: $header-login-font-color;
      height: 100%;
      list-style: none;
      width: 100%;
      padding-left: 1.5rem;
      padding-right: 1.5rem;

      li {
        float: none;
        @include break-mobile-sm {
          height: 2rem;
        }
        @media screen and (max-width: ($tablet - 1)) and (orientation: portrait) {
          height: 2.75rem;
        }

        .count {
          display: inline-block;
          background-color: #ff0000;
          padding: 0 0.4rem;
          font-size: 0.85rem;
          border-radius: 100px;
          height: 1.25rem;
          line-height: 1.25rem;
          margin-left: 0.5rem;
        }
        a {
          padding-left: 0;
          font-size: 1.25rem;
          i { margin-right: 0.75rem; width: 1.5rem; }
        }
      }
    }
  }

  .avatar-wrap { display: inline; }
  .avatar {
    &.circle { @include border-radius(100px); }
    &.rect, &.circle {
      margin-right: 0.25rem;
      opacity: 1;
      height: 2.1875rem;
      width: 2.1875rem;
      object-fit: cover;
    }

    &.rect {
      height: calc(2.1875rem / 1.5);
    }
  }

  #menu-wrap {
    @include clearfix();
    @include pad(0 $base-grid-padding);
    background-color: $header-bg-color;
    text-align: center;
    min-height: $header-height;

    @media screen and (max-width: ($tablet - 1)) and (orientation: portrait) {
      &.mobile-expanded { min-height: 2 * $header-height; }
    }

    @include break-mobile-sm {
      padding: 0 1rem;
    }

    #menu {
      @include base-layout-width;
      h1 {
        float: left;
        font-family: $base-font-sans;
        line-height: $header-height;
        font-size: $header-logo-font-size;
        text-transform: none;
        margin: 0;
        #logo {
          padding-right: 10px;
          width: 2.1875rem;
          height: auto;
          max-height: 2.1875rem;
          margin-bottom: 0.25rem;
        }
        #logo-text {
          color: $header-logo-font-color;
          &:hover {
            text-decoration: none;
          }
        }
      }

      a { padding-left: 0; }
      .burger-icon {
        display: none;
        @include break-mobile-sm {
          display: inline-block;
        }

        .burger-menu-icon {
          svg {
            fill: $header-logo-font-color;
            width: 1.25rem;
          }
        }
      }


      ul {
        display: inline-block;
        float: right;
        margin: 0;
        height: $header-height;
        padding: 0;
        list-style-type: none;
        .burger {
          color: $header-logo-font-color;
          line-height: $header-height;
          cursor: pointer;
        }
        &.signed-out li { padding-left: 1.25rem; }
        &.signed-out li a {
          display: table-cell;
          height: inherit;
          vertical-align: middle;
        }
        li a {
          color: $header-login-font-color;
          font-size: $header-login-font-size;
        }
        li {
          float: left;
          height: inherit;
          div a { text-decoration: none; }
        }
        form, form div { height: inherit; }
        .search {
          position: relative;
          height: inherit;
          ::-webkit-input-placeholder { color: $placeholder-text-color; }
          :-moz-placeholder { color: $placeholder-text-color; }
          ::-moz-placeholder { color: $placeholder-text-color; }
          :-ms-input-placeholder { color: $placeholder-text-color; }
          .search-input {
            position: relative;
            top: -1px;
            height: inherit;
            display: inline-block;
            background-color: inherit;
            color: $header-logo-font-color;
            border: none;
            box-shadow: none;
            margin: 0;
            padding: 0;
            width: 0;
            -webkit-transition: width 0.5s ease-in-out;
            -moz-transition: width 0.5s ease-in-out;
            -o-transition: width 0.5s ease-in-out;
            transition: width 0.5s ease-in-out;
            &::-webkit-search-cancel-button{
              -webkit-appearance: none;
            }
          }
          .search-input-minimized {
            width: 0;
            cursor: default;
            -webkit-transition: width 0.5s ease-in-out;
            -moz-transition: width 0.5s ease-in-out;
            -o-transition: width 0.5s ease-in-out;
            transition: width 0.5s ease-in-out;
          }
          .search-input-expanded {
            width: 15.625rem;
            cursor: auto;
            -webkit-transition: width 0.5s ease-in-out;
            -moz-transition: width 0.5s ease-in-out;
            -o-transition: width 0.5s ease-in-out;
            transition: width 0.5s ease-in-out;
          }
          label {
            @include pad(0 1rem);
            color: $header-logo-font-color;
            line-height: $header-height;
            height: inherit;
            display: inline-block;
            width: auto;
            &:hover { background-color:  $header-dropdown-bg-color; }
            &.search-label-expanded {
              background-color: transparent;
              &:hover { background-color: transparent; }
            }
          }
          @media screen and (max-width: ($tablet - 1)) and (orientation: portrait) {
            position: inherit;
            label &:hover { background-color: transparent; }
            .search-input-expanded {
              position: absolute;
              left: 0;
              top: $header-height;
              width: 100vw;
              padding: 0 $base-grid-padding;
              height: 2.59375rem;
            }
            .search-input-minimized {
              height: 0;
              width: 0;
              display: none;
            }
            .search-label-expanded, .search-input, .search-input-minimized {
              -webkit-transition: width 0 ease-in-out;
              -moz-transition: width 0 ease-in-out;
              -o-transition: width 0 ease-in-out;
              transition: width 0 ease-in-out;
            }
            .balloon {
              position: inherit;
            }
          }
        }
        #notifications-tray {
          line-height: $header-height;
          height: inherit;
          div { display: inline-block; }
          #mentions-overlay {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            cursor: pointer;
            z-index: 9998;
            height: 100vh;
          }
          .tray-icon {
            @include pad(0 1rem);
            cursor: pointer;
            display: inline-block;
            color: $header-logo-font-color;
            position: relative;
            top: -1px;
            &:hover {
              background-color:  $header-dropdown-bg-color;
            }
            .count {
              @include pad(0 0.125rem);
              @include border-radius(0.2rem);
              border: 1px solid $header-bg-color;
              position: absolute;
              background-color: #ff0000;
              height: 1rem;
              line-height: 0.85rem;
              min-width: 1rem;
              font-size: 0.5rem;
              font-weight: bolder;
              top: 0.5rem;
              right: 0.45rem;
            }

            &#mentions-icon {
              position: relative;
              & .hoverable {
                @include pad(0);
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                z-index: 9997;
              }
              &.open {
                box-shadow: 0 2px 4px $header-dropdown-shadow-color;
                background-color: $header-dropdown-bg-color;
                #mentions-dropdown {
                  display: block;
                }
              }
              #mentions-dropdown {
                @include pad(0);
                display: none;
                box-shadow: 0px 2px 4px 2px rgba(0,0,0,0.2);
                width: 22rem;
                height: auto;
                text-align: left;
                margin-left: -20.1rem;
                background-color: $header-dropdown-bg-color;
                position: absolute;
                z-index: 9999;
                li {
                  @include clearfix;
                  float: none;
                  position: relative;
                  color: $secondary-font-color;
                  border-bottom: 1px solid rgba($border-color, 25%);
                  a {
                    display: flex;
                    @include pad(0.35rem 1rem);
                    color: inherit;
                    font-size: inherit;
                    width: 90%;
                    height: 3.5rem;
                    span { @include pad(0); }
                  }
                  &:hover {
                    background-color: darken($header-dropdown-bg-color, 2%);
                    .mention-actions div {
                      i {
                        opacity: 0.5;
                        &:hover { opacity: 0.8; }
                      }
                      &.marked { cursor: default; }
                      &.marked i:hover { opacity: 0.5; }
                    }
                  }
                  .mention-unread {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    height: 0.3125rem;
                    width: 0.3125rem;
                    border-radius: 100%;
                    background-color: $color-primary;
                    left: 0.625rem;
                  }
                  .mention-avatar {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    &.circle {
                      img {
                        margin-left: 0.625rem;
                        height: 2rem;
                        width: 2rem;
                        border-radius: 100%;
                        border: 2px solid $border-color;
                        object-fit: cover;
                      }
                    }
                    &.rect {
                      img {
                        margin-left: 0.625rem;
                        height: 2rem;
                        width: 2rem;
                        border: 2px solid $border-color;
                        object-fit: cover;
                      }
                    }
                  }
                  .mention-actions {
                    position: absolute;
                    width: 10%;
                    height: 55px;
                    top: 0;
                    right: 0;
                    cursor: default;
                    div {
                      position: absolute;
                      left: 50%;
                      cursor: pointer;
                      transform: translateX(-50%);
                      height: 1rem;
                      width: 1rem;
                      i { position: absolute; opacity: 0; }
                      &.delete { top: 15%; }
                      &.marked { bottom: 15%; }
                      &.unmarked { bottom: 15%; }
                    }
                  }
                  .mention-content {
                    position: absolute;
                    top: 50%;
                    transform: translate(3.5rem,-50%);
                    width: 70%;
                    .msg {
                      font-size: 0.85rem;
                      line-height: 0.9rem;
                      max-height: 1.8rem;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      display: -webkit-box;
                      -webkit-line-clamp: 2;
                      -webkit-box-orient: vertical;
                    }
                    .timestamp {
                      font-size: 0.7rem;
                      height: 0.7rem;
                      margin-top: 0.4rem;
                      line-height: 0.7rem;
                      font-weight: bold;
                      display: block;
                    }
                  }
                  &.dismissed, .dismissed div {
                    background-color: lighten($header-dropdown-bg-color, 0.2);
                    .mention-unread { display: none; }
                  }
                  &:first-child {
                    @include pad(0.5rem 1rem);
                    height: 2rem;
                    line-height: 1rem;
                    font-size: 0.8rem;
                    background-color: $header-bg-color;
                    cursor: default;
                    .delete-all, .dismiss-all {
                      cursor: pointer;
                      float: right;
                      color: $color-primary;
                      font-size: 0.8rem;
                    }
                    .dismiss-all { margin-left: 1rem; }
                  }
                  &:last-child {
                    @include pad(0);
                    background-color: $header-bg-color;
                    height: 2rem;
                    line-height: 1rem;
                    font-size: 0.8rem;
                    text-align: center;
                    border-bottom: none;
                    a {
                      display: block;
                      @include pad(0.5rem 1rem);
                      color: $color-primary;
                      width: 100%;
                    }
                  }
                }
              }
            }
          }
        }
        #user-dropdown-wrap {
          min-width: 125px;
          position: relative;
          > div {
            text-align: left;
            padding: 0 10px;
            height: inherit;
            display: table-cell;
            vertical-align: middle;
          }
          #user-dropdown {
            @include pad(0 1rem);
            display: none;
            width: 100%;
            height: auto;
            text-align: left;
            margin-top: -1px;
            background-color: $header-dropdown-bg-color;
            position: absolute;
            z-index: 9999;
            li, li a { float: none; display: block; height: 2.2rem; line-height: 2.2rem; }
            li a { @include pad(0); &:hover { color: $color-primary; } }
          }
        }
        #user-dropdown-wrap:hover {
          box-shadow: 0 2px 4px $header-dropdown-shadow-color;
          background-color: $header-dropdown-bg-color;
          #user-dropdown { display: block; box-shadow: 0 2px 4px $header-dropdown-shadow-color; }
        }
      }
    }
    #menu.admin-menu {
      display: flex;

      .brand {
        display: flex;
        align-items: center;
        font-size: 1.3rem;
        margin-right: 1rem;

        .brandLogo {
          width: 2rem;
          margin-right: 0.5rem;
          max-height: 2rem;
        }
      }

      #menu-left {
        float: left;
        .menu-btn, .menu-btn-selected {
          padding: 0 0.8rem;
          display: table-cell;
          height: inherit;
          vertical-align: middle;
        }
        .menu-btn-selected { background-color: $header-dropdown-bg-color; border-bottom: 2px solid $color-primary; }
      }
      #menu-right {
        display: flex;
        flex: 1 0 auto;
        justify-content: flex-end;

        li:first-child, li:nth-child(2n) {
          padding-right: 0.8rem;
          a {
            display: table-cell;
            height: inherit;
            vertical-align: middle;
          }
        }
      }
    }
  }

  #motd-wrap {
    @include clearfix();
    @include pad(0 $base-grid-padding);
    background-color: $breadcrumbs-bg-color;
    border-bottom: 1px solid $breadcrumbs-border-color;
    margin-bottom: $breadcrumbs-bottom-margin;
    max-height: 3.2rem;
    overflow-y: auto;
    width: 100%;
    position: relative;
    top: -1px;

    @include break-mobile-sm {
      font-size: $font-size-sm;
      line-height: 1.2;
      max-height: 3.7rem;
      padding: 0 1rem;
    }

    #motd {
      @include base-layout-width;
      clear: both;
      padding: 0.5rem 0;
      color: #666;
    }
  }
}

#motd-spacer-wrap {
  @include clearfix();
  @include pad(0 $base-grid-padding);
  margin-bottom: $breadcrumbs-bottom-margin;
  max-height: 3.2rem;
  overflow-y: auto;
  width: 100%;
  position: relative;
  margin-top: -1rem;
  opacity: 0;

  @include break-mobile-sm {
    font-size: $font-size-sm;
    line-height: 1.2;
    max-height: 3.7rem;
    padding: 0 1rem;
    margin-top: 0;
  }

  #motd-spacer {
    @include base-layout-width;
    clear: both;
    padding: 0.5rem 0;
    color: #666;
  }
}
</style>
