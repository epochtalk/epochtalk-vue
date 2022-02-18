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

    <div class="actions">
      <button>
        <i class="fa fa-save"></i>&nbsp;&nbsp;Save
      </button>
      <button>
        <i class="fas fa-undo"></i>&nbsp;&nbsp;Reset
      </button>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { reactive, toRefs, inject, computed } from 'vue'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'AdminSubNavigation',
  setup() {
    const $route = useRoute()
    const $auth = inject(AuthStore)

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
        },
      ]
    }

    const topLevelNav = $route.path.split('/')[2]

    const v = reactive({
      routeName: $route.meta.title || $route.name.split(/(?=[A-Z])/).join(' '),
      nav: nav[topLevelNav || 'settings']
    })

    return { ...toRefs(v) }
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
