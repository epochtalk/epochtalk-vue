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
              <label for="name">Role Name</label>
              <input v-model="role.name" ref="focusInput" id="name" type="text" placeholder="Enter new role name" required />
              <label for="desc">Role Description</label>
              <textarea id="desc" v-model="role.description" placeholder="Enter a short description of this role" required></textarea>

                <label for="highlight">Highlight Color <a href="#" class="right" v-if="role.highlight_color" @click.prevent="role.highlight_color = undefined">Remove Highlight</a></label>
                <input v-model="role.highlight_color" id="highlight" type="color" placeholder="Enter a hex value for role highlight color" />
              <label for="basedRole">
                Base Permissions (Optional)
                <div class="input-info right">Set base permissions to that of an existing role</div>
              </label>
              <select id="basedRole" class="fill-row" @change="setBasePermissions()" v-model="baseRoleId">
                <option :value="null">Custom</option>
                <option :selected="baseRoleId === role.id" v-for="role in roles" :key="role.id" :value="role.id" v-html="role.name"></option>
              </select>
            </div>

            <!-- Views Tab -->
            <div v-if="selectedTab === 'views'">
              <h4>Moderation View Permissions</h4>
              <label>
                <input id="modAccess-settings" type="checkbox" v-model="modAccess" @change="!modAccess ? role.permissions.modAccess.users = false : null; !modAccess ? role.permissions.modAccess.posts = false : null; !modAccess ? role.permissions.modAccess.messages = false : null" />
                Allow user to access moderation views
              </label>
              <div class="indent" v-if="modAccess">
                <label>
                  <input id="modAccess-users" type="checkbox" v-model="role.permissions.modAccess.users" @change="role.permissions.modAccess.users ? role.permissions.reports.pageUserReports.allow = true : role.permissions.reports.pageUserReports = undefined" :false-value="undefined" />
                  Users Moderation Tab
                </label>
                <label>
                  <input id="modAccess-posts" type="checkbox" v-model="role.permissions.modAccess.posts" @change="role.permissions.modAccess.posts ? role.permissions.reports.pagePostReports.allow = true : role.permissions.reports.pagePostReports = undefined" :false-value="undefined" />
                  Posts Moderation Tab
                </label>
                <label>
                  <input id="modAccess-messages" type="checkbox" v-model="role.permissions.modAccess.messages" @change="role.permissions.modAccess.messages ? role.permissions.reports.pageMessageReports.allow = true : role.permissions.reports.pageMessageReports = undefined" :false-value="undefined" />
                  Messages Moderation Tab
                </label>
                <label>
                  <input id="modAccess-boardBans" type="checkbox" v-model="role.permissions.modAccess.boardBans" @change="role.permissions.modAccess.boardBans ? role.permissions.bans.byBannedBoards.allow = true : role.permissions.bans.byBannedBoards = undefined; role.permissions.modAccess.boardBans ? role.permissions.bans.getBannedBoards.allow = true : role.permissions.bans.getBannedBoards = undefined" :false-value="undefined" />
                  Board Bans Moderation Tab
                </label>
                <label>
                  <input id="modAccess-logs" type="checkbox" v-model="role.permissions.modAccess.logs" @change="role.permissions.modAccess.logs ? role.permissions.moderationLogs.page.allow = true : role.permissions.moderationLogs.page = undefined" :false-value="undefined" />
                  Logs Moderation Tab
                </label>
              </div>
              <div class="clear"></div>
              <h4><br />Administration View Permissions</h4>
              <label>
                <input id="adminAccess-settings" type="checkbox" v-model="settingsAccess" @change="!settingsAccess ? role.permissions.adminAccess.settings.general = false : null; !settingsAccess ? role.permissions.adminAccess.settings.advanced = false : null; !settingsAccess ? role.permissions.adminAccess.settings.legal = false : null; !settingsAccess ? role.permissions.adminAccess.settings.theme = false : null" />
                Allow user to access admin settings view
              </label>
              <div class="indent" v-if="settingsAccess">
                <label>
                  <input id="adminAccess-settings-general" type="checkbox" v-model="role.permissions.adminAccess.settings.general" :false-value="undefined" />
                  General Settings Tab
                </label>
                <label>
                  <input id="adminAccess-settings-advanced" type="checkbox" v-model="role.permissions.adminAccess.settings.advanced" :false-value="undefined" />
                  Advanced Settings Tab
                </label>
                <label>
                  <input id="adminAccess-settings-legal" type="checkbox" v-model="role.permissions.adminAccess.settings.legal" :false-value="undefined" />
                  Legal Settings Tab
                </label>
                <label>
                  <input id="adminAccess-settings-theme" type="checkbox" v-model="role.permissions.adminAccess.settings.theme" :false-value="undefined" />
                  Theme Settings Tab
                </label>
              </div>
            </div>

            <!-- Permissions Tabs -->
            <div v-for="(obj, key) in layouts" :key="key">
              <div v-if="key === selectedTab">
                {{obj}}
                <br />
                <br />
                {{role.permissions[key]}}
              </div>
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
  props: ['show', 'add', 'edit', 'reset', 'roles', 'layouts', 'selected'],
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

    const setBasePermissions = () => {
      let permissions = {}
      console.log(v.baseRoleId)
      v.roles.forEach(r => r.id === v.baseRoleId ? permissions = cloneDeep(r.permissions) : null)
      console.log(permissions)
      v.role.permissions = permissions
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
      baseRoleId: null,
      settingsAccess: null,
      modAccess: null,
      role: {},
      roles: props.roles || [],
      selectedTab: 'general',
      saveRuleBtnLabel: props.reset ? 'Reset' : 'Save',
      requestSubmitted: false,
    })

    const initAdminPanelAccess = () => {
      v.role.permissions.modAccess.messages = v.role.permissions.reports.pageMessageReports.allow
      v.role.permissions.modAccess.posts = v.role.permissions.reports.pagePostReports.allow
      v.role.permissions.modAccess.users = v.role.permissions.reports.pageUserReports.allow
      v.role.permissions.modAccess.logs = v.role.permissions.moderationLogs.page.allow
      v.settingsAccess = v.role.permissions.adminAccess.settings.general || v.role.permissions.adminAccess.settings.advanced || v.role.permissions.adminAccess.settings.legal || v.role.permissions.adminAccess.settings.theme
      v.modAccess = v.role.permissions.modAccess.users || v.role.permissions.modAccess.posts || v.role.permissions.modAccess.messages
    }

    watch(() => props.show, () => {
      v.role = cloneDeep(props.selected)
      initAdminPanelAccess()
      v.saveRuleBtnLabel = props.reset ? 'Reset' : 'Save'
    })

    return { ...toRefs(v), permissionSections, modifyRole, setBasePermissions, close }
  }
}
</script>

<style lang="scss" scoped>
  .input-spacing { margin-bottom: .5rem; }
  .indent { margin-left: 1.25rem; }
  label { user-select: none; }
  label input[type=checkbox] { margin-bottom: .125rem; }
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
