<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      Manage Moderators of <span v-html="board.name"></span>
    </template>

    <template v-slot:body>
      <form class="css-form">
        <div v-if="usersWithBadPermissions && !usersWithBadPermissions.length">
          <label>Current Moderators</label>
          <div class="clear">
            <ul class="mod-list" v-if="mods.length" >
              <li v-for="mod in mods" :key="mod.username">
                <div><span v-html="mod.username"></span>&nbsp;<a href="" @click.prevent="markModForRemoval(mod.username)"><i class="fa fa-times-circle"></i></a></div>
              </li>
            </ul>
          </div>
          <p v-if="!mods.length">This board has no moderators.</p>
          <br />
          <div class="clear">
            <label>Add Moderators
              <span class="info-tooltip" data-balloon="Type the names of users you want to add as moderators to this board. This will add the user as a moderator, but you have to ensure the user has permissions to moderate via the roles management view" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
            </label>
            <Multiselect v-model="modsToAdd.value" v-bind="modsToAdd" />
          </div>
          <label>Note: Moderator changes will take affect upon clicking save changes.</label>
          <div class="col">
            <div>
              <button class="fill-row" @click.prevent="saveModChanges()" :disabled="!modsToAdd.value.length && !modsToRemove.length" v-html="saveRuleBtnLabel"></button>
            </div>
            <div>
              <button class="fill-row negative" @click.prevent="close()">Cancel</button>
            </div>
          </div>
        </div>

        <div v-if="usersWithBadPermissions && usersWithBadPermissions.length">
          <p>
            User(s) were successfully added to the list of moderators for <strong><span v-html="board.name"></span></strong> but the following user(s) do not have a role with moderation permissions assigned:
          </p>
          <ul class="indent">
            <li v-for="username in usersWithBadPermissions" :key="username">
              <a href="#" v-html="username"></a>
            </li>
          </ul>
          <p>
             Visit the <a href="#">Roles Management</a> page to add a moderation type role. The user(s) will appear in the list of board moderators, but until an appropriate role is assigned they will not be able to perform any moderation tasks.
          </p>
          <div class="col">
            <div>
              <button class="fill-row" @click.prevent="usersWithBadPermissions = []; close()">Okay</button>
            </div>
          </div>
        </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, watch, inject } from 'vue'
import { cloneDeep, get, some, remove, filter } from 'lodash'
import { adminApi, usersApi } from '@/api'
import Multiselect from '@vueform/multiselect'

export default {
  name: 'set-moderators-modal',
  props: ['show', 'board'],
  emits: ['close', 'success'],
  components: { Modal, Multiselect },
  setup(props, { emit }) {
    /* Template Methods */
    const markModForRemoval = username => {
      v.modsToRemove.push(username)
      remove(v.mods, m => m.username === username)
    }

    const checkPermissions = mods => {
      // check that the user has at least one of these permissions set
      const modPermissions = [
        'boards.update.allow',
        'posts.update.bypass',
        'posts.delete.bypass',
        'posts.purge.bypass',
        'posts.find.bypass',
        'posts.create.bypass',
        'threads.title.bypass',
        'threads.createPoll.bypass.owner.admin',
        'threads.editPoll.bypass.owner.admin',
        'threads.lockPoll.bypass.owner.admin',
        'threads.lock.bypass.owner.admin',
        'threads.move.bypass.owner.admin',
        'threads.purge.bypass.owner.admin',
        'threads.sticky.bypass.owner.admin',
        'threads.title.bypass.owner.admin'
      ]
      return filter(mods.map(m => {
        let hasSomeModePrivileges = some(m.roles.map(r => {
          let hasModPermission = false
          modPermissions.forEach(perm => {
            if (get(r.custom_permissions, perm)) hasModPermission = true
          })
          return hasModPermission
        }))
        return hasSomeModePrivileges ? undefined : m.username
      }), undefined)
    }

    const saveModChanges = () => {
      let removeParams = { usernames: v.modsToRemove, board_id: props.board.id }
      let addParams = { usernames: v.modsToAdd.value, board_id: props.board.id }
      return new Promise(resolve => { // remove moderators if needed
        if (!removeParams.usernames.length) return resolve()
        let promise = adminApi.moderators.remove(removeParams)
        .then(users => users.forEach(u => remove(v.modsCopy, m => m.username === u.username)))
        return resolve(promise)
      })
      .then(() => { // add moderators if needed
        if (!addParams.usernames.length) return
        return adminApi.moderators.add(addParams)
        .then(users => {
          users.forEach(u => v.modsCopy.push({ username: u.username, id: u.id }))
          return users
        })
        .then(checkPermissions)
        .then(bpUsers => v.usersWithBadPermissions = bpUsers)
      })
      .then(() => {
        v.mods = cloneDeep(v.modsCopy)
        emit('success', v.mods)
      })
      .then(() => $alertStore.success(`Successfully updated ${props.board.name} moderators`))
      .catch(() => $alertStore.error(`There was an error updating ${props.board.name} moderators`))
      .finally(() => { if (!v.usersWithBadPermissions.length) close() })
    }

    const close = () => emit('close')
    const $alertStore = inject('$alertStore')
    /* Template Data */
    const v = reactive({
      focusInput: null,
      mods: null,
      modsCopy: null,
      saveRuleBtnLabel: 'Save',
      modsToRemove: [],
      usersWithBadPermissions: [],
      modsToAdd: {
        mode: 'tags',
        value: [],
        placeholder: 'Type username of user(s) to add as moderator',
        noOptionsText: 'Enter a username to start lookup...',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        maxHeight: 100,
        options: async q => {
          return await usersApi.search(q)
          // convert array into array of objects
          .then(d => d.map(u => ({ label: u, value: u })))
          .catch(() => [])
        }
      }
    })

    watch(() => props.show, () => {
      v.modsToRemove = []
      v.modsToAdd.value = []
      v.mods = cloneDeep(props.board.moderators)
      v.modsCopy = cloneDeep(props.board.moderators)
    })

    return { ...toRefs(v), saveModChanges, markModForRemoval, close }
  }
}
</script>

<style lang="scss" scoped>
  .input-spacing { margin-bottom: 1rem; }
  .clear { clear: both; }
  .col {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    column-gap: 0.5rem;
    div {
      flex: 1;
      button { width: 100%; }
    }
  }
  ul {
    &.mod-list {
      margin: 0;
      padding: 0;
      list-style-type: none;
      list-style-image: none;
      li { float: left; margin: 0.25rem 0; }
      li div {
        @include border-radius(2px);
        margin: 0 0.25rem;
        color: #fff;
        padding: 0.4rem 1rem;
        background: #2299DD;
        font-size: 1rem;
        font-weight: bold;
        a, a:hover, a:active, a:visited { color: #fff; }
      }
    }
    &.indent { margin-left: 2rem; margin-bottom: 1rem; }
  }
</style>
