<template>
  <div id="admin-sub-nav">
    <h2 class="title">{{route.meta.title || route.name.split(/(?=[A-Z])/).join(' ')}}</h2>
    <dl class="tabs">
      <!-- ng-if="AdminSettingsCtrl.hasPermission('adminAccess.settings.general')"  -->
      <dd class="no-select" :class="{'active': true}">
        <a href="">General</a>
      </dd>
       <!-- ng-if="AdminSettingsCtrl.hasPermission('adminAccess.settings.advanced')"  -->
      <dd class="no-select" :class="{'active': false}">
        <a href="">Advanced</a>
      </dd>
      <!-- ng-if="AdminSettingsCtrl.hasPermission('adminAccess.settings.legal')" -->
      <dd  class="no-select" :class="{'active': false}">
        <a href="">Legal</a>
      </dd>
      <!-- ng-if="AdminSettingsCtrl.hasPermission('adminAccess.settings.theme')" -->
      <dd class="no-select" :class="{'active': false}">
        <a href="">Theme</a>
<!--         <a ng-hide="AdminSettingsCtrl.previewActive" ui-sref=".theme" ng-click="AdminSettingsCtrl.tab = 'theme'">Theme</a>
        <a ng-show="AdminSettingsCtrl.previewActive" ui-sref=".theme({ preview: true })" ng-click="AdminSettingsCtrl.tab = 'theme'">Theme</a> -->
      </dd>
    </dl>

    <div class="actions">
      <!-- ng-click="child.save()" ng-disabled="child.invalidForm" -->
      <button>
        <i class="fa fa-save"></i>&nbsp;&nbsp;Save
      </button>
      <!-- ng-click="child.reset()" -->
      <button>
        <i class="fa fas-refresh"></i>&nbsp;&nbsp;Reset
      </button>
    </div>
  </div>
</template>

<script>
import { useRoute } from 'vue-router'

export default {
  name: 'AdminSubNavigation',
  setup() {
    const route = useRoute()
    return { route }
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
    @include break-max-large {
      .title { font-size: 1.8rem; }
    }
    @include break-mobile-med {
      .tabs { padding-left: 0; }
      .title { display: none; }
    }
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

    @include break-mobile-sm {
      height: 7.25rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .tabs { margin-top: .5rem; }
      button {
        width: 45vw;
        margin-top: .5rem;
      }
    }
  }
</style>
