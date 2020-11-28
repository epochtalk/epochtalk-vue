<template>
  <header>
    <!-- Mobile Menu -->
    <div class="burger-close-overlay" :class="{ 'open': showMobileMenu }" v-on:click="showMobileMenu = false" ></div>
    <div class="burger-menu show-mobile" :class="{ 'open' : showMobileMenu }">
      <a v-on:click="showMobileMenu = false" class="profile" href="#">
        <img src="{{ currentUser.avatar }}" class="avatar round">
        <span class="username">{{currentUser.username}}</span>
      </a>
      <div class="close-menu" v-on:click="showMobileMenu = false">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
          <title></title>
          <path d="M24,38.83,4.59,19.41a2,2,0,0,1,2.82-2.82L24,33.17,40.59,16.59a2,2,0,0,1,2.82,2.82Z"/>
        </svg>
      </div>
      <ul>
        <li v-on:click="showMobileMenu = false">
        <!--v-if="hasPermission('adminAccess')"> -->
          <a href="#"><i class="fa fa-cogs" aria-hidden="true"></i>Admin Panel</a>
        </li>
        <li v-on:click="showMobileMenu = false"> <!--v-if="hasPermission('modAccess') && !hasPermission('adminAccess')"> -->
          <a href="#"><i class="fa fa-cogs" aria-hidden="true"></i>Mod Panel</a>
        </li>
        <li v-on:click="showMobileMenu = false"> <!-- v-if="isPatroller()">-->
          <a href="#"><i class="fa fa-binoculars" aria-hidden="true"></i>Patrol</a>
        </li>
        <li v-on:click="showMobileMenu = false" >
          <a href="#"><i class="fa fa-user" aria-hidden="true"></i>Profile</a>
        </li>
        <li v-on:click="showMobileMenu = false" >
          <a href="#"><i class="fa fa-wrench" aria-hidden="true"></i>Settings</a>
        </li>
        <li v-on:click="showMobileMenu = false" >
          <a href="#"><i class="fa fa-users" aria-hidden="true"></i>Member Search</a>
        </li>
        <!--<mentions-menu></mentions-menu>-->
        <li v-on:click="showMobileMenu = false" >
          <a href="#" v-on:click="dismissNotifications({ type: 'message' })"><i class="fa fa-envelope" aria-hidden="true"></i>Messages</a>
          <div class="count" v-if="notificationMessages()">{{notificationMessages()}}</div>
        </li>
        <li v-on:click="showMobileMenu = false" >
          <a href="#"><i class="fa fa-eye" aria-hidden="true"></i>Watchlist</a>
        </li>
        <li v-on:click="showMobileMenu = false"> <!--v-if="canInvite()">-->
          <a v-on:click="showInvite = true">
            <i class="fa fa-user-plus" aria-hidden="true"></i>Invite Users
          </a>
        </li>
        <li v-on:click="showMobileMenu = false" >
          <a href="#" v-on:click="logout()"><i class="fa fa-sign-out" aria-hidden="true"></i>Logout</a>
        </li>
      </ul>
    </div>

    <div class="header-contents">
      <!-- Menu -->
      <div id="menu-wrap" :class="{ 'mobile-expanded' : focusSearch }">
        <nav id="menu">
          <!-- Logo Section -->
          <h1>
            <a href="#" v-if="logo"><img src="{{logo}}" id="logo" /></a>
            <a href="#" id="logo-text" ng-bind="{{decode(title)}}">
              Epochtalk
            </a>
          </h1>

          <!-- Login Section -->
          <ul class="signed-out" v-if="!loggedIn()">
            <li>
              <a href="" @click.prevent="showRegister = true">REGISTER</a>
            </li>
            <li>
              <a href="" id="login-link" @click.prevent="showLogin = true">LOGIN</a>
            </li>
          </ul>

          <!-- User Dropdown Mobile -->
          <ul v-if="loggedIn()" class="burger-icon">
            <div class="burger-notification show-mobile" v-if="notificationMessages() || notificationMentions()"></div>
            <!-- <i v-on:click="showMobileMenu = true" class="fa fa-bars fa-lg burger" aria-hidden="true"></i> -->
            <span class="burger-menu-icon" v-on:click="showMobileMenu = true" aria-hidden="true">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path d="M7,16H41a2,2,0,0,0,0-4H7a2,2,0,0,0,0,4Z"/>
                <path d="M41,22H7a2,2,0,0,0,0,4H41a2,2,0,0,0,0-4Z"/>
                <path d="M41,32H7a2,2,0,0,0,0,4H41a2,2,0,0,0,0-4Z"/>
              </svg>
            </span>
          </ul>

          <!-- User Dropdown -->
          <ul v-if="loggedIn()">
            <li class="search"> <!--v-if="hasPermission('posts.search.allow')"-->
              <form action="." class="search-btn" autocomplete="off" v-on:submit.prevent="searchForum">
                <div class="balloon" data-balloon="Search" data-balloon-pos="down">
                  <label for="search" class="fa fa-search" :class="{ 'search-label-expanded' : searchExpanded || focusSearch }" v-on:click="toggleFocusSearch()"></label>
                  <input class="search-input" v-model="searchTerms" :class="{ 'search-input-expanded' : focusSearch, 'search-input-minimized' : !focusSearch }" type="search" name="search" placeholder="Search" autocomplete="off" ref="search" />
                </div>
              </form>
            </li>
            <li id="notifications-tray" class="hide-mobile">
              <div class="tray-icon" href="user-search" data-balloon="Member Search" data-balloon-pos="down"> <!--v-if="hasPermission('users.pagePublic.allow')"-->
                <i class="fa fa-users"></i>
              </div>

              <!-- <mentions-tray></mentions-tray> -->

              <div class="tray-icon" href="#" v-on:click="dismissNotifications({ type: 'message' })" data-balloon="Messages" data-balloon-pos="down">
                <i class="fa fa-envelope"></i>
                <div class="count" v-if="notificationMessages()">{{notificationMessages()}}</div>
              </div>

              <!-- <div class="tray-icon">
                <i class="fa fa-globe"></i>
                <div class="count" v-if="notificationOther" ng-bind-html="notificationOther"></div>
              </div> -->
            </li>
            <li id="user-dropdown-wrap" class="hide-mobile">
              <div>
                <a href="#">
                  <img src="{{ currentUser.avatar }}" class="avatar round">
                  <span>{{currentUser.username}}</span>
                </a>
              </div>
              <ul id="user-dropdown">
                <li> <!--v-if="hasPermission('adminAccess')">-->
                  <a href="#">Admin Panel</a>
                </li>
                <li><!-- v-if="hasPermission('modAccess') && !hasPermission('adminAccess')">-->
                  <a href="#">Mod Panel</a>
                </li>
                <li> <!--v-if="isPatroller()">-->
                  <a href="#">Patrol</a>
                </li>
                <li>
                  <a href="#">Profile</a>
                </li>
                <li>
                  <a href="#">Settings</a>
                </li>
                <li>
                  <a href="#">Messages</a>
                </li>
                <li>
                  <a href="#">Watchlist</a>
                </li>
                <li> <!--v-if="canInvite()">-->
                  <a v-on:click="showInvite = true">
                    Invite User
                  </a>
                </li>
                <li>
                  <a href="#">About</a>
                </li>
                <li>
                  <a href="#" v-on:click="logout()">Logout</a>
                </li>
              </ul>
            </li>
          </ul>
        </nav>
      </div>

      <!-- Breadcrumbs -->
      <div id="breadcrumbs-wrap">
        <div id="breadcrumbs">
          <ul>
            <li v-for="(breadcrumb, i) in breadcrumbs" :key="i" :class="{ active: (i + 1) === breadcrumbs.length }">
              <a v-if="(i + 1) !== breadcrumbs.length && breadcrumb.state && breadcrumb.label" title="{{breadcrumb.label}}" href="{{breadcrumb.state}}">{{truncate(breadcrumb.label, 30)}}</a>
              <span v-if="((i + 1) === breadcrumbs.length || !breadcrumb.state) && breadcrumb.label" title="{{breadcrumb.label}}">{{truncate(breadcrumb.label, 30)}}</span>
              <span v-if="((i + 1) === breadcrumbs.length || !breadcrumb.state) && breadcrumb.opts.locked" title="Locked" class="breadcrumbs-locked"><strong>(locked)</strong></span>
            </li>
          </ul>
        </div>
      </div>

      <!--
      <motd></motd>
      <alert></alert>
      -->
      <login-modal :show="showLogin" @close="showLogin = false"></login-modal>
      <register-modal :show="showRegister" @close="showRegister = false"></register-modal>
    </div>
  </header>
</template>

<script>
import decode from '@/filters/decode'
import truncate from '@/filters/truncate'
import LoginModal from "@/components/modals/auth/Login.vue";
import RegisterModal from "@/components/modals/auth/Register.vue";

export default {
  components: { LoginModal, RegisterModal },
  data() {

    return {
      showMobileMenu: false,
      focusSearch: false,
      searchExpanded: false,
      searchTerms: '',
      showInvite: false,
      showRegister: false,
      showLogin: false,
      logo: '',
      currentUser: {},
      breadcrumbs: [{label:'Home', state: '#', opts: {}}],
      scrollDownPos: 95,
      lastScrollTop: 0
    }
  },
  methods: {
    loggedIn() {
      return this.$store.getters.loggedIn
    },
    logout() {
      console.log('logout')
    },
    notificationMessages() {
      let count = null
      return count
    },
    searchForum() {
      // DO Something
      console.log('SEARCH!')
    },
    toggleFocusSearch() {
      this.focusSearch = !this.focusSearch
      this.searchExpanded = this.focusSearch
      if (this.searchExpanded) {
        this.$refs.search.focus()
      }
    },
    dismissNotifications(params) {
      console.log(params)
    },
    debounce(func, wait = 10, immediate = true) {
      let timeout;
      return function () {
        let context = this, args = arguments;
        let later = function () {
          timeout = null;
          if (!immediate) func.apply(context, args);
        };
        let callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
      };
    },
    checkPosition() {
      let header = document.querySelector('header');
      let windowY = window.scrollY;
      if (windowY >= this.scrollDownPos) {
        // Scrolling DOWN
        header.classList.add('is-hidden');
        header.classList.remove('is-visible');
      }
      if (windowY === 0 || windowY < this.lastScrollTop) {
        // Scrolling UP
        header.classList.add('is-visible');
        header.classList.remove('is-hidden');
      }
      this.lastScrollTop = windowY;
    },
    decode: decode,
    truncate: truncate
  },
  mounted() {
    window.addEventListener('scroll', this.debounce(this.checkPosition))
  },
  unmounted() {
    window.removeEventListener('scroll', this.debounce(this.checkPosition))
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
    // transform: translateY(-100%);
  }

  &.is-visible {
    .header-contents {
      transform: translateY(0);
    }
    // transform: translateY(0);
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
      .avatar, .avatar.loaded {
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
        @media screen and (max-width: 767px) {
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

  .imageContainer { background: url('/static/img/loading.gif') no-repeat center; display: inline;}
  .imageContainer.loaded { background: none; }
  .avatar.loaded { opacity: 1; }
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

    @media screen and (max-width: 767px) {
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
      // span { padding-left: 0.8rem; }
      .burger-icon {
        display: none;
        @media screen and (max-width: 767px) {
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
            &:hover {
              background-color:  $header-dropdown-bg-color;
            }
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
          #mentions-overlay {
            position: absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            cursor: pointer;
            z-index: 9998;
          }
          .tray-icon {
            @include pad(0 1rem);
            cursor: pointer;
            display: inline-block;
            color: $header-logo-font-color;
            position: relative;
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

      // h3 #logo-text { padding-right: 0.8rem; }
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

  #breadcrumbs-wrap {
    @include clearfix();
    @include pad(0 $base-grid-padding);

    @media screen and (max-width: 767px) {
      padding: 0 1rem;
    }

    background-color: $sub-header-color;
    border-bottom: 1px solid $breadcrumbs-border-color;
    text-align: center;
    height: $breadcrumbs-height;
    #breadcrumbs {
      @include base-layout-width;
      min-width: 0;
      padding: 0;
      background: none;
      text-transform: uppercase;
      ul {
        float: left;
        display: inline-block;
        margin: 0;
        line-height: $breadcrumbs-height;
        padding: 0;
        list-style-type: none;
        white-space: nowrap;
        li { color: $breadcrumbs-dead-link-color; display: inline-block; }
        li::before { content: "/"; padding: 0 0.4rem; }
        li:first-child::before { content: none; }
        li a { color: $breadcrumbs-dead-link-color; font-size: $breadcrumbs-font-size; cursor: pointer; }
        li span { color: $breadcrumbs-link-color; font-size: $breadcrumbs-font-size; }
        li a, li span { &.ng-enter, &.ng-leave { @include transition(none !important); } }
      }
    }

    // Mobile Breadcrumbs Layout
    @include break-mobile-sm {
      #breadcrumbs::-webkit-scrollbar { height: 0; width: 0; }
      #breadcrumbs { overflow: hidden; overflow-x: scroll; }
    }
  }

  #motd-wrap {
    @include clearfix();
    @include pad(0 $base-grid-padding);
    background-color: $breadcrumbs-bg-color;
    border-bottom: 1px solid $breadcrumbs-border-color;
    margin-bottom: $breadcrumbs-bottom-margin;
    max-height: 3.2rem;
    overflow-y: scroll;
    width: 100%;

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

</style>
