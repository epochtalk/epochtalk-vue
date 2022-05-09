<template>
  <modal :name="$options.name" :show="show" @close="close()" :size="reset ? null : 'large'" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="add">Add Role</span>
      <span v-if="edit">Edit Role</span>
      <span v-if="reset">Reset Role</span>
    </template>

    <template v-slot:body>
      <form class="css-form">
        <div v-if="add || edit" class="col permissions-grid input-spacing">
          <div class="sections">
            <div v-for="{key,label} in permissionSections" :key="key" @click="selectedTab = key" :class="{'active':selectedTab === key}" class="pointer" v-html="label"></div>
          </div>
          <div class="permissions">
            <!-- General Tab -->
            <div v-if="selectedTab === 'general'">
              <label>
                Role Name
                <input type="text" v-model="role.name" placeholder="Role Name" :disabled="requestSubmitted" required />
              </label>
            </div>

            <!-- Views Tab -->
            <div v-if="selectedTab === 'views'">
              <h4>Moderation View Permissions</h4>
              <label>
                <input id="modAccess-settings" type="checkbox" ng-init="modAccess = newRole.permissions.modAccess.users || newRole.permissions.modAccess.posts || newRole.permissions.modAccess.messages" ng-model="modAccess" ng-change="!modAccess ? newRole.permissions.modAccess.users = false : null; !modAccess ? newRole.permissions.modAccess.posts = false : null; !modAccess ? newRole.permissions.modAccess.messages = false : null;" />
                Allow user to access moderation views
              </label>
              <div class="indent" ng-if="modAccess">
                <label>
                  <input id="modAccess-users" type="checkbox" ng-init="newRole.permissions.modAccess.users = newRole.permissions.reports.pageUserReports.allow;" ng-model="newRole.permissions.modAccess.users" ng-change="newRole.permissions.modAccess.users ? newRole.permissions.reports.pageUserReports.allow = true : newRole.permissions.reports.pageUserReports = undefined" ng-false-value="undefined" />
                  Users Moderation Tab
                </label>
                <label>
                  <input id="modAccess-posts" type="checkbox" ng-init="newRole.permissions.modAccess.posts = newRole.permissions.reports.pagePostReports.allow;" ng-model="newRole.permissions.modAccess.posts" ng-change="newRole.permissions.modAccess.posts ? newRole.permissions.reports.pagePostReports.allow = true : newRole.permissions.reports.pagePostReports = undefined" ng-false-value="undefined" />
                  Posts Moderation Tab
                </label>
                <label>
                  <input id="modAccess-messages" type="checkbox" ng-init="newRole.permissions.modAccess.messages = newRole.permissions.reports.pageMessageReports.allow;" ng-model="newRole.permissions.modAccess.messages" ng-change="newRole.permissions.modAccess.messages ? newRole.permissions.reports.pageMessageReports.allow = true : newRole.permissions.reports.pageMessageReports = undefined" ng-false-value="undefined" />
                  Messages Moderation Tab
                </label>
                <label>
                  <input id="modAccess-boardBans" type="checkbox" ng-model="newRole.permissions.modAccess.boardBans" ng-change="newRole.permissions.modAccess.boardBans ? newRole.permissions.bans.byBannedBoards.allow = true : newRole.permissions.bans.byBannedBoards = undefined; newRole.permissions.modAccess.boardBans ? newRole.permissions.bans.getBannedBoards.allow = true : newRole.permissions.bans.getBannedBoards = undefined" ng-false-value="undefined" />
                  Board Bans Moderation Tab
                </label>
                <label>
                  <input id="modAccess-logs" type="checkbox" ng-init="newRole.permissions.modAccess.logs = newRole.permissions.moderationLogs.page.allow;" ng-model="newRole.permissions.modAccess.logs" ng-change="newRole.permissions.modAccess.logs ? newRole.permissions.moderationLogs.page.allow = true : newRole.permissions.moderationLogs.page = undefined" ng-false-value="undefined" />
                  Logs Moderation Tab
                </label>
              </div>
              <div class="clear"></div>
              <h4><br />Administration View Permissions</h4>
              <label>
                <input id="adminAccess-settings" type="checkbox" ng-init="settings = newRole.permissions.adminAccess.settings.general || newRole.permissions.adminAccess.settings.advanced || newRole.permissions.adminAccess.settings.legal || newRole.permissions.adminAccess.settings.theme" ng-model="settings" ng-change="!settings ? newRole.permissions.adminAccess.settings.general = false : null; !settings ? newRole.permissions.adminAccess.settings.advanced = false : null; !settings ? newRole.permissions.adminAccess.settings.legal = false : null; !settings ? newRole.permissions.adminAccess.settings.theme = false : null;" />
                Allow user to access admin settings view
              </label>
              <div class="indent" ng-if="settings">
                <label>
                  <input id="adminAccess-settings-general" type="checkbox" ng-model="newRole.permissions.adminAccess.settings.general" ng-false-value="undefined" />
                  General Settings Tab
                </label>
                <label>
                  <input id="adminAccess-settings-advanced" type="checkbox" ng-model="newRole.permissions.adminAccess.settings.advanced" ng-false-value="undefined" />
                  Advanced Settings Tab
                </label>
                <label>
                  <input id="adminAccess-settings-legal" type="checkbox" ng-model="newRole.permissions.adminAccess.settings.legal" ng-false-value="undefined" />
                  Legal Settings Tab
                </label>
                <label>
                  <input id="adminAccess-settings-theme" type="checkbox" ng-model="newRole.permissions.adminAccess.settings.theme" ng-false-value="undefined" />
                  Theme Settings Tab
                </label>
              </div>
            </div>

            <!-- Permissions Tabs -->
            <div v-for="(obj, key) in layouts" :key="key">
              <div v-if="key === selectedTab">{{obj}}</div>
            </div>
          </div>
        </div>

        <div v-if="reset" class="col input-spacing">
          <div>
            <p>
              Are you sure you want to reset the role named <strong>{{role.name}}</strong>? This will change all permissions for this role back to their Epochtalk defaults.
            </p>
          </div>
        </div>

        <div class="col">
          <div>
            <button class="fill-row" @click.prevent="modifyRole()" :disabled="requestSubmitted" v-html="saveRuleBtnLabel"></button>
          </div>
          <div>
            <button class="fill-row negative" @click.prevent="close()" :disabled="requestSubmitted">Cancel</button>
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject, watch } from 'vue'
// import { adminApi } from '@/api'
import { cloneDeep } from 'lodash'

export default {
  name: 'role-manager-modal',
  props: ['show', 'add', 'edit', 'reset', 'layouts', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.reset ? 'Reset' : 'Save'
    }

    const modifyRole = () => {
      v.requestSubmitted = true
      $alertStore.success('Modify Role')
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    const permissionSections = [
      { key: 'general', label: 'General' },
      { key: 'views', label: 'Views' },
      { key: 'users', label: 'Users' },
      { key: 'userNotes', label: 'User Notes' },
      { key: 'bans', label: 'Bans' },
      { key: 'invitations', label: 'Invitations' },
      { key: 'configurations', label: 'Configurations' },
      { key: 'themes', label: 'Themes' },
      { key: 'blacklist', label: 'Blacklist' },
      { key: 'portal', label: 'Portal' },
      { key: 'reports', label: 'Reports' },
      { key: 'roles', label: 'Roles' },
      { key: 'rank', label: 'Ranks' },
      { key: 'categories', label: 'Categories' },
      { key: 'boards', label: 'Boards' },
      { key: 'threads', label: 'Threads' },
      { key: 'posts', label: 'Posts' },
      { key: 'conversations', label: 'Conversations' },
      { key: 'messages', label: 'Messages' },
      { key: 'watchlist', label: 'Watchlist' },
      { key: 'moderators', label: 'Moderators' },
      { key: 'autoModeration', label: 'Auto Moderation' },
      { key: 'rateLimiting', label: 'Rate Limits' },
      { key: 'userTrust', label: 'Trust' },
      { key: 'legal', label: 'Legal' },
      { key: 'ads', label: 'Ads' },
      { key: 'mentions', label: 'Mentions' },
      { key: 'motd', label: 'Announcements' }
    ]

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      role: {},
      selectedTab: 'general',
      saveRuleBtnLabel: props.reset ? 'Reset' : 'Save',
      requestSubmitted: false,
    })

    watch(() => props.show, () => {
      v.role = cloneDeep(props.selected)
      v.saveRuleBtnLabel = props.reset ? 'Reset' : 'Save'
    })

    return { ...toRefs(v), permissionSections, modifyRole, close }
  }
}
</script>

<style lang="scss" scoped>
  .input-spacing { margin-bottom: .5rem; }
  .permissions-grid {
    display: grid;
    grid-column-gap: .5rem;
    grid-template-columns: 10rem 1fr;
    align-items: start;
    min-height: 60vh;
    .sections {
      border-right: 1px solid $border-color-alt;
      max-height: 60vh;
      overflow-y: scroll;
      div {
        font-size: $font-size-xs;
        line-height: $font-size-xs;
        padding: .5rem;
        &.active {
          color: $base-background-color;
          background-color: $color-primary;
        }
      }

    }
    .permissions {  }
  }
</style>
