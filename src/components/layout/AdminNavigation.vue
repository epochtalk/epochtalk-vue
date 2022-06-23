<template>
  <ul class="menu-left">
    <li v-if="permUtils.hasPermission('adminAccess.settings')">
      <router-link :to="{ path: '/admin/settings' }" class="menu-btn" :class="{ 'menu-btn-selected': checkActive('/admin/settings') || checkActivePath('/admin') }">
        <i class="fa fa-cogs"></i><span class="hide-mobile">&nbsp;&nbsp;&nbsp;Settings</span>
      </router-link>
    </li>
    <li v-if="permUtils.hasPermission('adminAccess.management')">
      <router-link :to="{ path: '/admin/management' }" class="menu-btn" :class="{ 'menu-btn-selected': checkActive('/admin/management') }">
        <i class="fa fa-briefcase"></i>
        <span class="hide-mobile">&nbsp;&nbsp;&nbsp;Management</span>
      </router-link>
    </li>
    <li  v-if="permUtils.hasPermission('modAccess')">
      <router-link :to="{ path: '/admin/moderation' }" class="menu-btn" :class="{ 'menu-btn-selected': checkActive('/admin/moderation') }">
        <i class="fa fa-users"></i>
        <span class="hide-mobile">&nbsp;&nbsp;&nbsp;Moderation</span>
      </router-link>
    </li>
  </ul>
</template>

<script>
import { useRoute } from 'vue-router'
import { inject } from 'vue'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'AdminNavigation',
  setup() {
    const $route = useRoute()
    const $auth = inject(AuthStore)

    const checkActive = basePath => $route.path.indexOf(basePath) === 0
    const checkActivePath = basePath => $route.path === basePath

    const permUtils = $auth.permissionUtils

    return { checkActive, checkActivePath, permUtils }
  }
}
</script>
