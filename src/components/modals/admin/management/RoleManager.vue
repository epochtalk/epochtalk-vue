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
            <div v-for="{key,label} in permissionSections" :key="key" @click="selectPermissionsTab(key)" :class="{'active':selectedTab === key}" class="pointer" v-html="label"></div>
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
                <input id="modAccess-settings" type="checkbox" v-model="role.permissions.modAccess" :true-value="role.permissions.modAccess || {}" :false-value="undefined"  />
                Allow user to access moderation views
              </label>
              <div class="indent" v-if="role?.permissions?.modAccess">
                <label>
                  <input id="modAccess-users" type="checkbox" v-model="role.permissions.modAccess.users" @change="role.permissions.modAccess.users ? set(role, 'permissions.reports.pageUserReports.allow', true) : set(role, 'permissions.reports.pageUserReports', undefined)"  :false-value="undefined" />
                  Users Moderation Tab
                </label>
                <label>
                  <input id="modAccess-posts" type="checkbox" v-model="role.permissions.modAccess.posts" @change="role.permissions.modAccess.posts ? set(role, 'permissions.reports.pagePostReports.allow', true) : set(role, 'permissions.reports.pagePostReports', undefined)" :false-value="undefined" />
                  Posts Moderation Tab
                </label>
                <label>
                  <input id="modAccess-messages" type="checkbox" v-model="role.permissions.modAccess.messages" @change="role.permissions.modAccess.messages ? set(role, 'permissions.reports.pageMessageReports.allow', true) : set(role, 'permissions.reports.pageMessageReports', undefined)" :false-value="undefined" />
                  Messages Moderation Tab
                </label>
                <label>
                  <input id="modAccess-boardBans" type="checkbox" v-model="role.permissions.modAccess.boardBans" @change="role.permissions.modAccess.boardBans ? set(role, 'permissions.bans.byBannedBoards.allow', true) : set(role, 'permissions.bans.byBannedBoards', undefined); role.permissions.modAccess.boardBans ? set(role, 'permissions.bans.getBannedBoards.allow', true) : set(role, 'permissions.bans.getBannedBoards', undefined)" :false-value="undefined" />
                  Board Bans Moderation Tab
                </label>
                <label>
                  <input id="modAccess-logs" type="checkbox" v-model="role.permissions.modAccess.logs" @change="role.permissions.modAccess.logs ? set(role, 'permissions.moderationLogs.page.allow', true) : set(role,
                  'permissions.moderationLogs.page', undefined)" :false-value="undefined" />
                  Logs Moderation Tab
                </label>
              </div>
              <h4><br />Administration View Permissions</h4>
              <label>
                <input id="adminAccess-settings" type="checkbox" v-model="role.permissions.adminAccess.settings" :true-value="role.permissions.adminAccess.settings || {}" :false-value="undefined" />
                Allow user to access admin settings view
              </label>
              <div class="indent" v-if="role?.permissions?.adminAccess?.settings">
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
              <label>
                <input id="adminAccess-management" type="checkbox" v-model="role.permissions.adminAccess.management" :true-value="role.permissions.adminAccess.management || {}" :false-value="undefined" />
                Allow user to access admin management view
              </label>
              <div class="indent" v-if="role?.permissions?.adminAccess?.management">
                <label>
                  <input id="adminAccess-management-boards" type="checkbox" v-model="role.permissions.adminAccess.management.boards" :false-value="undefined" />
                  Boards Management Tab (Requres the 'Allow user view all roles' option in 'Roles')
                </label>
                <label>
                  <input id="adminAccess-management-users" type="checkbox" v-model="role.permissions.adminAccess.management.users" :false-value="undefined" />
                  Users Management Tab
                </label>
                <label>
                  <input id="adminAccess-management-roles" type="checkbox" v-model="role.permissions.adminAccess.management.roles" :false-value="undefined" />
                  Roles Management Tab
                </label>
                <label>
                  <input id="adminAccess-management-bannedAddresses" type="checkbox" v-model="role.permissions.adminAccess.management.bannedAddresses" :false-value="undefined" />
                  Banned Addresses Management Tab
                </label>
                <label>
                  <input id="adminAccess-management-invitations" type="checkbox" v-model="role.permissions.adminAccess.management.invitations" :false-value="undefined" />
                  Invitations Management Tab
                </label>
              </div>
            </div>

            <!-- Permissions Tabs -->
            <div v-for="(layout, model) in layouts" :key="model">
              <div v-if="model === selectedTab" class="permissions-tab">
                <!-- {{layout}}<br><br> -->
                {{role.permissions[model]}}
                <section class="permission" v-for="(details, prop) in layout" :key="prop">
                  <!-- Title Display -->
                  <div v-if="details.type === 'title'">
                    <h4 v-html="details.title"></h4>
                    <h3 class="thin-underline"></h3>
                  </div>
                  <!-- Subtitle Display -->
                  <div v-if="details.type === 'subtitle'">
                    <h6 v-html="details.title"></h6>
                  </div>
                  <!-- Separator Display -->
                  <div v-if="details.type === 'separator'">
                    <div class="clear"></div><br />
                  </div>

                  <!-- Main Permission -->
                  <div v-if="!details.type">
                    <label>
                      <input type="checkbox" @change="createBypassStructure(model, prop, details)" v-model="role.permissions[model][prop]" :true-value="role.permissions[model][prop] ? role.permissions[model][prop]: { allow: true }" :false-value="undefined" />
                      <span class="permission-title" v-html="details.title"></span>
                    </label>

                    <!-- Bypasses -->
                    <div class="bypass" v-for="bypass in details.bypasses" :key="bypass">
                      <!-- Boolean Bypass View -->
                      <div class="bypass-header" v-if="bypass.type === 'boolean'">
                        <label>
                          <input v-if="role.permissions[model][prop]?.bypass" type="checkbox"
                            v-model="role.permissions[model][prop].bypass[bypass.control]"
                            :false-value="undefined" />
                          <input v-if="!role.permissions[model][prop]?.bypass" type="checkbox"
                            :disabled="true"
                            :value="false" />
                          <span class="bypass-description" :class="{ disabled: !role.permissions[model][prop]?.allow }" v-html="bypass.description"></span>
                        </label>
                      </div>
                      <!-- Object Bypass View -->
                      <div v-if="bypass.type === 'object' || bypass.type === 'priority' || !bypass.type">
                        <div class="bypass-header">
                          <label>
                            <input v-if="role.permissions[model][prop]?.bypass" type="checkbox"
                              v-model="role.permissions[model][prop].bypass[bypass.control]"
                              :true-value="role.permissions[model][prop].bypass[bypass.control] ? role.permissions[model][prop].bypass[bypass.control] : { [ bypass.type === 'priority' ? 'priority' : 'mod']: true }" :false-value="undefined" />
                            <input v-if="!role.permissions[model][prop]?.bypass" type="checkbox"
                              :disabled="true"
                              :value="false" />
                            <span class="bypass-description" :class="{ disabled: !role.permissions[model][prop]?.allow }" v-html="bypass.description"></span>
                          </label>
                        </div>
                        <div class="bypass-control">
                          <label :class="{ disabled: !role.permissions[model][prop]?.bypass }">
                            <input type="radio"
                              @click="role.permissions[model][prop].bypass[bypass.control].admin = true; role.permissions[model][prop].bypass[bypass.control].mod = role.permissions[model][prop].bypass[bypass.control].priority = undefined"
                              :disabled="role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true"
                              :checked="role.permissions[model][prop]?.bypass ? role.permissions[model][prop]?.bypass[bypass.control]?.admin : false" />
                            <span class="bypass-description" :class="{ disabled: !role.permissions[model][prop]?.bypass[bypass.control] }">All</span>
                          </label>
                          <label :class="{ disabled: !role.permissions[model][prop]?.bypass }">
                            <input type="radio"
                              @click="role.permissions[model][prop].bypass[bypass.control].admin = role.permissions[model][prop].bypass[bypass.control].priority = undefined; role.permissions[model][prop].bypass[bypass.control].mod = true"
                              :disabled="role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true"
                              :checked="role.permissions[model][prop]?.bypass ? role.permissions[model][prop]?.bypass[bypass.control]?.mod : false" />
                            <span class="bypass-description" :class="{ disabled: !role.permissions[model][prop]?.bypass[bypass.control] }">Moderated</span>
                          </label>
                          <label v-if="bypass.type === 'priority'" :class="{ disabled: !role.permissions[model][prop]?.bypass }">
                            <input type="radio"
                              @click="role.permissions[model][prop].bypass[bypass.control].admin = role.permissions[model][prop].bypass[bypass.control].mod = undefined; role.permissions[model][prop].bypass[bypass.control].priority = true"
                              :disabled="role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true"
                              :checked="role.permissions[model][prop]?.bypass ? role.permissions[model][prop]?.bypass[bypass.control]?.priority : false" />
                            <span class="bypass-description" :class="{ disabled: !role.permissions[model][prop]?.bypass[bypass.control] }">Priority</span>
                          </label>
                        </div>
                      </div>

                      <!-- Radio Bypass View -->
                      <div v-if="bypass.type === 'radio'">
                        <div class="bypass-header" v-if="role.permissions[model][prop]?.bypass">
                          <span v-for="(desc, index) in bypass.descriptions" :key="desc">
                            <label>
                              <input :name="`${prop}-${bypass.control}`" type="radio" v-model="role.permissions[model][prop].bypass[bypass.control]" :value="{ [bypass.values[index]]: true }" />
                              <span class="bypass-description" :class="{ disabled: !role.permissions[model][prop]?.bypass[bypass.control] }" v-html="desc"></span>
                            </label>
                          </span>
                        </div>
                      </div>

                    </div>
                  </div>

                </section>
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
import { cloneDeep, set, get } from 'lodash'

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

    const setBasePermissions = () => v.roles.forEach(r =>
      r.id === v.baseRoleId ? v.role.permissions = cloneDeep(r.permissions) : null)

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

    const selectPermissionsTab = model => {
      // NOTE: Work around since vue will not create nested props for v-model
      // clear permission model if no permissions were set in previous tab
      let currentModel = v.role.permissions[v.selectedTab]
      if (currentModel) {
        // clear empty props with 'undefined' as value
        Object.keys(currentModel).forEach(k => !currentModel[k] && delete currentModel[k])
        // if there are no props set after filtering delete model from role
        if (!Object.keys(currentModel).length) delete v.role.permissions[v.selectedTab]
      }
      // init root obj for this permission tab
      if (model !== 'views' && model !== 'general') v.role.permissions[model] = v.role.permissions[model] || {}
      // select tab
      v.selectedTab = model
    }

    const createBypassStructure = (model, prop, details) => {
      // NOTE: Work around since vue will not create nested props for v-model
      // create bypass structure for dynamic permissions
      if (v.role.permissions[model][prop]?.allow && details.bypasses) {
        details.bypasses.forEach(b => {
          switch (b.type) {
            case 'radio':
              v.role.permissions[model][prop].bypass = { ...v.role.permissions[model][prop].bypass, [b.control]: { [b.defaultValue]: true }}
              break;
            default: v.role.permissions[model][prop].bypass = {}
          }
        })
      }
    }

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
      set(v.role, 'permissions.modAccess.messages',
        get(v.role, 'permissions.reports.pageMessageReports.allow'))
      set(v.role, 'permissions.modAccess.posts',
        get(v.role, 'permissions.reports.pagePostReports.allow'))
      set(v.role, 'permissions.modAccess.users',
        get(v.role, 'permissions.reports.pageUserReports.allow'))
      set(v.role, 'permissions.modAccess.logs',
        get(v.role, 'permissions.moderationLogs.page.allow'))
      set(v.role, 'permissions.adminAccess.settings', get(v.role, 'permissions.adminAccess.settings'))
      set(v.role, 'permissions.adminAccess.management', get(v.role, 'permissions.adminAccess.management'))
    }

    watch(() => props.show, () => {
      v.role = cloneDeep(props.selected)
      v.roles = cloneDeep(props.roles)
      initAdminPanelAccess()
      v.saveRuleBtnLabel = props.reset ? 'Reset' : 'Save'
    })

    return { ...toRefs(v), permissionSections, modifyRole, setBasePermissions, close, set, selectPermissionsTab, createBypassStructure }
  }
}
</script>

<style lang="scss" scoped>
  .input-spacing { margin-bottom: .5rem; }
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
    .permissions {
      max-height: 60vh;
      overflow-y: scroll;
      .disabled { color: $secondary-font-color; }
      .indent, .bypass-header { margin-left: 1.25rem; display: inline-block; }
      .bypass-description, .permission-title { margin-left: .25rem; }
      .bypass-control {
        width: 45%;
        float: right;
        display: inline-block;
        label {
          display: inline-block;
          width: auto;
          margin-right: 1rem;
          input {
            cursor: pointer;
          }
        }
      }
    }
  }
</style>
