<template>
  <div id="admin-sub-nav">
    <h2 class="title">{{routeName}}</h2>
    <dl class="tabs">
      <span v-for="link in nav" :key="link.routeName">
        <dd class="no-select" :class="{'active': link.active}" v-if="link.permission">
          <router-link :to="{ name: link.routeName }" v-html="link.title" />
        </dd>
      </span>
    </dl>

    <div class="actions" v-if="checkSaveEnabled()">
      <button v-if="nav[3]?.routeName === 'ThemeSettings' && nav[3]?.active" @click="EventBus.emit('admin-preview')" :disabled="!formValid">
        <i class="fa fa-eye"></i>&nbsp;&nbsp;Preview
      </button>
      <button @click="EventBus.emit('admin-save')" :disabled="!formValid">
        <i class="fa fa-save"></i>&nbsp;&nbsp;Save
      </button>
      <button class="negative" @click="EventBus.emit('admin-reset')">
        <i class="fas fa-undo"></i>&nbsp;&nbsp;Reset
      </button>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { reactive, toRefs, inject, computed, watch, onMounted, onUnmounted } from 'vue'
import { AuthStore } from '@/composables/stores/auth'
import EventBus from '@/composables/services/event-bus'

export default {
  name: 'AdminSubNavigation',
  setup() {
    const checkFormValid = valid => v.formValid = valid
    onMounted(() => EventBus.on('admin-save-valid', checkFormValid))
    onUnmounted(() => EventBus.off('admin-save-valid', checkFormValid))

    const $route = useRoute()
    const $auth = inject(AuthStore)

    const checkSaveEnabled = () => {
      let routeName = $route.name
      let noSaveRoutes = ['UserManagement']
      return noSaveRoutes.indexOf(routeName) < 0
    }

    const checkActive = n => n === $route.name
    const permUtils = $auth.permissionUtils

    const nav = {
      settings: [
        {
          title: 'General',
          routeName: 'GeneralSettings',
          permission: permUtils.hasPermission('adminAccess.settings.general'),
          active: computed(() => checkActive('GeneralSettings'))
        },
        {
          title: 'Advanced',
          routeName: 'AdvancedSettings',
          permission: permUtils.hasPermission('adminAccess.settings.advanced'),
          active: computed(() => checkActive('AdvancedSettings'))
        },
        {
          title: 'Legal',
          routeName: 'LegalSettings',
          permission: permUtils.hasPermission('adminAccess.settings.legal'),
          active: computed(() => checkActive('LegalSettings'))
        },
        {
          title: 'Theme',
          routeName: 'ThemeSettings',
          permission: permUtils.hasPermission('adminAccess.settings.theme'),
          active: computed(() => checkActive('ThemeSettings'))
        }
      ],
      management: [
        {
          title: 'Boards',
          routeName: 'BoardManagement',
          permission: permUtils.hasPermission('adminAccess.management.boards'),
          active: computed(() => checkActive('BoardManagement'))
        },
        {
          title: 'Users',
          routeName: 'UserManagement',
          permission: permUtils.hasPermission('adminAccess.management.users'),
          active: computed(() => checkActive('UserManagement'))
        },
        {
          title: 'Roles',
          routeName: 'RoleManagement',
          permission: permUtils.hasPermission('adminAccess.management.roles'),
          active: computed(() => checkActive('RoleManagement'))
        },
        {
          title: 'Banned Addresses',
          routeName: 'BannedAddressManagement',
          permission: permUtils.hasPermission('adminAccess.management.bannedAddresses'),
          active: computed(() => checkActive('BannedAddressManagement'))
        },
        {
          title: 'Invitations',
          routeName: 'InvitationManagement',
          permission: permUtils.hasPermission('adminAccess.management.invitations'),
          active: computed(() => checkActive('InvitationManagement'))
        }
      ],
      moderation: [
        {
          title: 'Users',
          routeName: 'UserModeration',
          permission: permUtils.hasPermission('modAccess.users'),
          active: computed(() => checkActive('UserModeration'))
        },
        {
          title: 'Posts',
          routeName: 'PostModeration',
          permission: permUtils.hasPermission('modAccess.posts'),
          active: computed(() => checkActive('PostModeration'))
        },
        {
          title: 'Messages',
          routeName: 'MessageModeration',
          permission: permUtils.hasPermission('modAccess.messages'),
          active: computed(() => checkActive('MessageModeration'))
        },
        {
          title: 'Board Bans',
          routeName: 'BoardBanModeration',
          permission: permUtils.hasPermission('modAccess.boardBans'),
          active: computed(() => checkActive('BoardBanModeration'))
        },
        {
          title: 'Logs',
          routeName: 'LogModeration',
          permission: permUtils.hasPermission('modAccess.logs'),
          active: computed(() => checkActive('LogModeration'))
        }
      ]
    }

    const v = reactive({
      routeName: $route.meta.title || $route.name.split(/(?=[A-Z])/).join(' '),
      nav: nav[$route.path.split('/')[2] || 'settings'],
      formValid: true
    })

    watch(() => $route.path, p => v.nav = nav[p.split('/')[2] || 'settings'])
    watch(() => $route.meta, m => v.routeName = m.title)

    return { ...toRefs(v), EventBus, checkSaveEnabled }
  }
}
</script>

<style lang="scss">
  #admin-sub-nav {
    height: 4.25rem;
    padding: 1rem 2rem;
    display: flex;
    background: $base-background-color;
    border-bottom: 1px solid $breadcrumbs-border-color;
    .tabs {
      flex: 1 0 50%;
    }
    .title { line-height: 2.5rem; }
    .actions {
      flex-basis: auto;
      display: flex;

      button {
        margin-right: 0.5rem;
        &:last-child {
          margin-right: 0;
        }
      }
    }

    @include break-max-large {
      .tabs {
        a {
          font-size: .75rem;
          padding: 0.75rem;
          height: 2.75rem;
          line-height: 1.25rem;
        }
      }
      .title { font-size: 1.8rem; }
    }
    @include break-mobile-med {
      .tabs { padding-left: 0; }
      .title { display: none; }
    }
    @include break-mobile-sm {
      height: 7.25rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 1rem;

      .actions { width: 100%; }
      .tabs { margin-top: .5rem; }
      button {
        width: 100%;
        margin-top: .5rem;
      }
    }
    @include break-mobile-xs {
      .tabs a {
        font-size: .5rem;
        padding: 0.5rem;
        height: 2rem;
        line-height: 1rem;
      }
    }

  }
</style>
