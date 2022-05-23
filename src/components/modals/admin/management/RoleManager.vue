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

            <!-- Rate Limits Tab -->
            <div v-if="selectedTab === 'rateLimiting'">
              <!-- Update User -->
              <section class="boxed-section" v-if="limits.userUpdate.use = role.permissions?.users?.update?.allow">
                <div class="header"><h6>User Update <span class="put right">PUT</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="userUpdate-interval">Interval</label>
                    <input type="text" class="input-text" id="userUpdate-interval" v-model="limits.userUpdate.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="userUpdate-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="userUpdate-max-in-interval" v-model="limits.userUpdate.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="userUpdate-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="userUpdate-min-difference" v-model="limits.userUpdate.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <!-- Conversation Create -->
              <section class="boxed-section" v-if="limits.conversationCreate.use = role.permissions?.conversations?.create?.allow">
                <div class="header"><h6>Conversations Create <span class="post right">POST</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="conversationCreate-interval">Interval</label>
                    <input type="text" class="input-text" id="conversationCreate-interval" v-model="limits.conversationCreate.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="conversationCreate-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="conversationCreate-max-in-interval" v-model="limits.conversationCreate.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="conversationCreate-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="conversationCreate-min-difference" v-model="limits.conversationCreate.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <!-- Message Create -->
              <section class="boxed-section" v-if="limits.messageCreate.use = role.permissions?.messages?.create?.allow">
                <div class="header"><h6>Messages Create <span class="post right">POST</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="messageCreate-interval">Interval</label>
                    <input type="text" class="input-text" id="messageCreate-interval" v-model="limits.messageCreate.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="messageCreate-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="messageCreate-max-in-interval" v-model="limits.messageCreate.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="messageCreate-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="messageCreate-min-difference" v-model="limits.messageCreate.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <!-- Post Create -->
              <section class="boxed-section" v-if="limits.postCreate.use = role.permissions?.posts?.create?.allow">
                <div class="header"><h6>Posts Create <span class="post right">POST</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="postCreate-interval">Interval</label>
                    <input type="text" class="input-text" id="postCreate-interval" v-model="limits.postCreate.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="postCreate-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="postCreate-max-in-interval" v-model="limits.postCreate.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="postCreate-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="postCreate-min-difference" v-model="limits.postCreate.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <!-- Post Update -->
              <section class="boxed-section" v-if="limits.postUpdate.use = role.permissions?.posts?.update?.allow">
                <div class="header"><h6>Posts Update <span class="post right">POST</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="postUpdate-interval">Interval</label>
                    <input type="text" class="input-text" id="postUpdate-interval" v-model="limits.postUpdate.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="postUpdate-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="postUpdate-max-in-interval" v-model="limits.postUpdate.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="postUpdate-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="postUpdate-min-difference" v-model="limits.postUpdate.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <!-- Thread Create -->
              <section class="boxed-section" v-if="limits.threadCreate.use = role.permissions?.threads?.create?.allow">
                <div class="header"><h6>Threads Create <span class="post right">POST</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="threadCreate-interval">Interval</label>
                    <input type="text" class="input-text" id="threadCreate-interval" v-model="limits.threadCreate.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="threadCreate-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="threadCreate-max-in-interval" v-model="limits.threadCreate.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="threadCreate-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="threadCreate-min-difference" v-model="limits.threadCreate.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <!-- Report User -->
              <section class="boxed-section" v-if="limits.reportUser.use = role.permissions?.reports?.createUserReport?.allow">
                <div class="header"><h6>Report Users <span class="post right">POST</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="reportUser-interval">Interval</label>
                    <input type="text" class="input-text" id="reportUser-interval" v-model="limits.reportUser.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="reportUser-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="reportUser-max-in-interval" v-model="limits.reportUser.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="reportUser-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="reportUser-min-difference" v-model="limits.reportUser.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <!-- Report Message -->
              <section class="boxed-section" v-if="limits.reportMessage.use = role.permissions?.reports?.createMessageReport?.allow">
                <div class="header"><h6>Report Messages <span class="post right">POST</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="reportMessage-interval">Interval</label>
                    <input type="text" class="input-text" id="reportMessage-interval" v-model="limits.reportMessage.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="reportMessage-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="reportMessage-max-in-interval" v-model="limits.reportMessage.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="reportMessage-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="reportMessage-min-difference" v-model="limits.reportMessage.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <!-- Report Post -->
              <section class="boxed-section" v-if="limits.reportPost.use = role.permissions?.reports?.createPostReport?.allow">
                <div class="header"><h6>Report Posts <span class="post right">POST</span></h6></div>
                <div class="content input-three-col">
                  <div>
                    <label class="desc-label" for="reportPost-interval">Interval</label>
                    <input type="text" class="input-text" id="reportPost-interval" v-model="limits.reportPost.interval" placeholder="In MS (Ex: 1000)" />
                  </div>
                  <div>
                    <label class="desc-label" for="reportPost-max-in-interval">Max In Interval</label>
                    <input type="text" class="input-text" id="reportPost-max-in-interval" v-model="limits.reportPost.maxInInterval" placeholder="Ex: 1" />
                  </div>
                  <div>
                    <label class="desc-label" for="reportPost-min-difference">Min Difference</label>
                    <input type="text" class="input-text" id="reportPost-min-difference" v-model="limits.reportPost.minDifference" placeholder="In MS (Ex: 100)" />
                  </div>
                </div>
              </section>

              <div v-if="!hasLimits()">
                <strong>
                  <div class="centered-text">You have no Permissions that require rate limiting.</div>
                </strong>
              </div>
            </div>

            <!-- Permissions Tabs -->
            <div v-for="(layout, model) in layouts" :key="model">
              <div v-if="model === selectedTab" class="permissions-tab">
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
                            :disabled="!role.permissions[model][prop]?.allow"
                            @click="role.permissions[model][prop].bypass = { [bypass.control]: true }" />
                          <span class="bypass-description" :class="{ disabled: !role.permissions[model][prop]?.allow }" v-html="bypass.description"></span>
                        </label>
                      </div>
                      <!-- Object Bypass View -->
                      <div v-if="bypass.type === 'object' || bypass.type === 'priority' || bypass.type === 'selfMod' || !bypass.type">
                        <div class="bypass-header">
                          <label>
                            <input type="checkbox" v-if="role.permissions[model][prop]?.bypass"
                              v-model="role.permissions[model][prop].bypass[bypass.control]"
                              :true-value="role.permissions[model][prop].bypass[bypass.control] ? role.permissions[model][prop].bypass[bypass.control] : { [ bypass.type === 'priority' ? 'priority' : (bypass.type === 'selfMod' ? 'selfMod' : 'mod') ]: true }" :false-value="undefined" />
                            <input v-if="!role.permissions[model][prop]?.bypass" type="checkbox"
                              :disabled="!role.permissions[model][prop]?.allow"
                              @click="role.permissions[model][prop].bypass = { [bypass.control]: { [ bypass.type === 'priority' ? 'priority' : 'mod']: true } }"
                               />
                            <span class="bypass-description" :class="{ disabled: !role.permissions[model][prop]?.allow }" v-html="bypass.description"></span>
                          </label>
                        </div>
                        <div class="bypass-control">
                          <label :class="{ disabled: !role.permissions[model][prop]?.bypass }">
                            <input type="radio"
                              @click="role.permissions[model][prop].bypass[bypass.control].admin = true; role.permissions[model][prop].bypass[bypass.control].mod = role.permissions[model][prop].bypass[bypass.control].priority = role.permissions[model][prop].bypass[bypass.control].selfMod = undefined"
                              :disabled="role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true"
                              :checked="role.permissions[model][prop]?.bypass ? role.permissions[model][prop]?.bypass[bypass.control]?.admin : false" />
                            <span class="bypass-description" :class="{ disabled: role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true }">All</span>
                          </label>
                          <label :class="{ disabled: !role.permissions[model][prop]?.bypass }">
                            <input type="radio"
                              @click="role.permissions[model][prop].bypass[bypass.control].admin = role.permissions[model][prop].bypass[bypass.control].priority = role.permissions[model][prop].bypass[bypass.control].selfMod = undefined; role.permissions[model][prop].bypass[bypass.control].mod = true"
                              :disabled="role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true"
                              :checked="role.permissions[model][prop]?.bypass ? role.permissions[model][prop]?.bypass[bypass.control]?.mod : false" />
                            <span class="bypass-description" :class="{ disabled: role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true }">Moderated</span>
                          </label>
                          <label v-if="bypass.type === 'priority' || bypass.type === 'selfMod'" :class="{ disabled: !role.permissions[model][prop]?.bypass }">
                            <input type="radio"
                              @click="role.permissions[model][prop].bypass[bypass.control].admin = role.permissions[model][prop].bypass[bypass.control].mod = role.permissions[model][prop].bypass[bypass.control].selfMod = undefined; role.permissions[model][prop].bypass[bypass.control].priority = true"
                              :disabled="role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true"
                              :checked="role.permissions[model][prop]?.bypass ? role.permissions[model][prop]?.bypass[bypass.control]?.priority : false" />
                            <span class="bypass-description" :class="{ disabled: role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true }">Priority</span>
                          </label>
                          <label v-if="bypass.type === 'selfMod'" :class="{ disabled: !role.permissions[model][prop]?.bypass }">
                            <input type="radio"
                              @click="role.permissions[model][prop].bypass[bypass.control].admin = role.permissions[model][prop].bypass[bypass.control].mod = role.permissions[model][prop].bypass[bypass.control].priority = undefined; role.permissions[model][prop].bypass[bypass.control].selfMod = true"
                              :disabled="role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true"
                              :checked="role.permissions[model][prop]?.bypass ? role.permissions[model][prop]?.bypass[bypass.control]?.selfMod : false" />
                            <span class="bypass-description" :class="{ disabled: role.permissions[model][prop]?.bypass ? !role.permissions[model][prop]?.bypass[bypass.control] : true }">Self Moderated</span>
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

                <!-- Restrict Messaging (messages tab specific) -->
                <div v-if="selectedTab ==='messages' && role.lookup !== 'private' && role.lookup !== 'anonymous'">
                  <div class="fill-row">
                    <label>Allow user to message the following roles:</label>
                    <ul class="roles">
                      <li v-for="restrictRole in roles.filter(r => r.lookup !== 'private' && r.lookup !== 'anonymous')" :key="restrictRole.id">
                        <label>
                          <input :checked="role.permissions.invertedRestrictions.indexOf(restrictRole.priority) > -1" @click="toggleRestriction(restrictRole.priority)" type="checkbox" />
                          {{restrictRole.name}}
                        </label>
                      </li>
                    </ul>
                  </div>
                </div>

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

        <div v-if="remove" class="col input-spacing">
          <div>
            <p>
              Are you sure you want to remove the role named <strong>{{role.name}}</strong>? This will change will permanently delete the role and all users who have this role will be affected.
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
import { adminApi } from '@/api'
import { cloneDeep, set, get, intersection } from 'lodash'

export default {
  name: 'role-manager-modal',
  props: ['show', 'add', 'edit', 'reset', 'remove', 'roles', 'layouts', 'selected', 'allPriorities'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.baseRoleId = null;
      v.role = {}
      v.saveRuleBtnLabel = props.reset ? 'Reset' : props.remove ? 'Remove' : 'Save'
    }

    const modifyRole = () => {
      v.requestSubmitted = true
      let requestPromise, successMsg, errorMsg
      let cleanRole = () => {
        if(!v.role.highlight_color || !v.role.highlightColor) {
          delete v.role.highlight_color
          delete v.role.highlightColor
        }
        if (v.role.modAccess && !Object.keys(v.role.modAccess).length) delete v.role.modAccess
        if (v.role.adminAccess && !Object.keys(v.role.adminAccess).length) delete v.role.adminAccess
      }
      if (props.add || props.edit) {
        // Set permission rate limits
        v.role.permissions.limits = limiter.filter(l => l.interval && l.maxInInterval)
        // Remove highlight color if not set
        cleanRole()
        successMsg = `${v.role.name} successfully ${props.edit?'updated':'created'}!`
        errorMsg = `There was an error ${props.edit?'updating':'creating'} the role ${v.role.name}`
        requestPromise = adminApi.roles[props.edit ? 'update' : 'add'](v.role)
      }
      else if (props.reset) {
        v.role.permissions = {}
        cleanRole()
        successMsg = `${v.role.name} successfully reset to defaults!`
        errorMsg = `There was an error resetting the role ${v.role.name}`
        requestPromise = adminApi.roles.update(v.role)
      }
      else {
        successMsg = `${v.role.name} successfully reset to defaults!`
        errorMsg = `There was an error resetting the role ${v.role.name}`
        requestPromise = adminApi.roles.delete(v.role.id)
      }
      requestPromise
      .then(() => {
        $alertStore.success(successMsg)
        emit('success')
      })
      .catch(() => $alertStore.error(errorMsg))
      .finally(close)
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    const hasLimits = () => limiter.filter(limit => limit.use).length > 0

    const resetLimits = roleLimits => {
      // clear our previous values
      limiter.map(limit => {
        limit.interval = undefined
        limit.maxInInterval = undefined
        limit.minDifference = undefined
      })
      if (!roleLimits || roleLimits.length === 0) return
      // set values from this role
      roleLimits.map(limit => {
        // find match limit in this.limiter
        let memLimit = limiter.filter(l => l.path === limit.path && l.method === limit.method)
        if (memLimit.length > 0) {
          memLimit[0].interval = limit.interval
          memLimit[0].maxInInterval = limit.maxInInterval
          memLimit[0].minDifference = limit.minDifference
        }
      })
    }

    const toggleRestriction = priority => {
      let index = v.role.permissions.invertedRestrictions.indexOf(priority)
      if (index > -1) v.role.permissions.invertedRestrictions.splice(index, 1)
      else v.role.permissions.invertedRestrictions.push(priority)

      let intersect = intersection(v.role.permissions.invertedRestrictions, props.allPriorities)
      if (intersect && intersect.length === props.allPriorities.length) v.role.permissions.priorityRestrictions = undefined
      else v.role.permissions.priorityRestrictions = intersect
    }

    const setBasePermissions = () => {
      v.roles.forEach(r => r.id === v.baseRoleId ? v.role.permissions = cloneDeep(r.permissions) : null)
      initAdminPanelAccess()
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
      if (model !== 'views' && model !== 'general' && model !== 'rateLimiting')
        v.role.permissions[model] = v.role.permissions[model] || {}
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
      limits: {
        conversationCreate: { path: '/api/conversations', method: 'POST' },
        messageCreate: { path: '/api/messages', method: 'POST' },
        postCreate: { path: '/api/posts', method: 'POST' },
        postUpdate: { path: '/api/posts/{id}', method: 'POST' },
        threadCreate: { path: '/api/threads', method: 'POST' },
        reportUser: { path: '/api/reports/users', method: 'POST' },
        reportMessage: { path: '/api/reports/messages', method: 'POST' },
        reportPost: { path: '/api/reports/posts', method: 'POST' },
        userUpdate: { path: '/api/users/{id}', method: 'PUT'}
      },
      focusInput: null,
      baseRoleId: null,
      settingsAccess: null,
      modAccess: null,
      role: {},
      roles: props.roles || [],
      selectedTab: 'general',
      saveRuleBtnLabel: props.reset ? 'Reset' : props.remove ? 'Remove' : 'Save',
      requestSubmitted: false,
    })

    // rate limiting
    const limiter = [
      v.limits.conversationCreate,
      v.limits.messageCreate,
      v.limits.postCreate,
      v.limits.postUpdate,
      v.limits.threadCreate,
      v.limits.reportUser,
      v.limits.reportMessage,
      v.limits.reportPost,
      v.limits.userUpdate
    ]

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
      v.saveRuleBtnLabel = props.reset ? 'Reset' : props.remove ? 'Remove' : 'Save'
      if (props.edit) resetLimits(cloneDeep(props.selected.permissions.limits))
    })

    return { ...toRefs(v), permissionSections, modifyRole, setBasePermissions, close, set, selectPermissionsTab, createBypassStructure, toggleRestriction, hasLimits }
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
      label { height: auto; }
      ul {
        columns: 3;
        list-style-type: none;
        li { display: block; }
        &.roles {
          padding: 1rem;
          padding-top: .5rem;
          background-color: $sub-header-color;
          border: 1px solid $border-color;
        }
      }
      .disabled { color: $secondary-font-color; }
      .indent, .bypass-header { margin-left: 1.25rem; display: inline-block; }
      .permission-title { font-weight: bold; }
      .bypass-description, .permission-title { margin-left: .25rem; }
      .bypass-control {
        width: 50%;
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
