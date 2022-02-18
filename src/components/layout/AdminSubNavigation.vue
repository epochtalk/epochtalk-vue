<template>
  <div id="admin-sub-nav">
    <h2 class="title">{{routeName}}</h2>
    <dl class="tabs">
      <span v-for="link in nav" :key="link.routeName">
        <dd class="no-select" :class="{'active': link.active}" v-if="link.permission">
          <a href="">{{link.title}}</a>
        </dd>
      </span>
    </dl>

    <div class="actions">
      <!-- ng-click="child.save()" ng-disabled="child.invalidForm" -->
      <button>
        <i class="fa fa-save"></i>&nbsp;&nbsp;Save
      </button>
      <!-- ng-click="child.reset()" -->
      <button>
        <i class="fas fa-undo"></i>&nbsp;&nbsp;Reset
      </button>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'
import { reactive, toRefs, inject } from 'vue'
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
          active: checkActive('GeneralSettings')
        },
        {
          title: 'Advanced',
          routeName: 'AdvancedSettings',
          permission: permUtils.hasPermission('adminAccess.settings.advanced'),
          active: checkActive('AdvancedSettings')
        },
        {
          title: 'Legal',
          routeName: 'Legal',
          permission: permUtils.hasPermission('adminAccess.settings.legal'),
          active: checkActive('Legal')
        },
        {
          title: 'Theme',
          routeName: 'Theme',
          permission: permUtils.hasPermission('adminAccess.settings.theme'),
          active: checkActive('Theme')
        },
      ]
    }

    const v = reactive({
      routeName: $route.meta.title || $route.name.split(/(?=[A-Z])/).join(' '),
      nav: nav[$route.path.split('/')[2]]
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
