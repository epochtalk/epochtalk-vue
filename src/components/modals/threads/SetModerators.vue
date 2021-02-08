<template>
  <modal :name="$options.name" :show="show" @close="close()">
    <template v-slot:header>Manage Moderators of {{boardName}}</template>

    <template v-slot:body>
      <form v-if="!modsWithBadPermissions.length" action="." class="css-form">
        <label>Current Moderators of {{boardName}} </label>
        <div v-if="!moderators?.length" class="no-mods">There are currently no moderators assigned to this board</div>
        <div v-for="mod in moderators" :key="mod.id" class="multiselect-tag mod-tags">
          {{mod.username}} <i @click.prevent="removeModerator(mod.username)"></i>
        </div>
        <label>Moderators to Add</label>
        <Multiselect v-model="modTagsInput.value" v-bind="modTagsInput" />
        <br>
        <label>
          <strong>Note:</strong> Moderator changes will take affect upon clicking save changes.
        </label>
        <button class="fill" @click.prevent="setModerators()" type="submit" :disabled="!modsToRemove.length && !modTagsInput.value.length">
          Save Changes
        </button>
      </form>
      <div v-if="modsWithBadPermissions.length">
        <label>Successfully updated list of moderators for <strong>{{boardName}}</strong> but the following user{{ modsWithBadPermissions.length > 1 ? 's do not ' : ' does not ' }}have a role with moderation permissions assigned:
        </label>
        <ul class="mod-list-bp">
          <li v-for="mod in modsWithBadPermissions" :key="mod">{{mod}}</li>
        </ul>
        <label>Visit the Roles Management page to add a moderation type role. The user{{ modsWithBadPermissions.length > 1 ? 's ' : ' ' }}will appear in the list of board moderators, but until an appropriate role is assigned they will not be able to perform any moderation tasks.</label><br>
        <button class="fill" @click.prevent="close()">Okay</button>
      </div>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { cloneDeep, intersection, remove } from 'lodash'
import { reactive, toRefs, inject } from 'vue'
// import { AuthStore } from '@/composables/stores/auth'
import Multiselect from '@vueform/multiselect'
import { adminApi, usersApi } from '@/api'
import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'set-moderators-modal',
  props: ['show', 'board'],
  emits: ['close'],
  components: { Modal, Multiselect },
  setup(props, { emit }) {
    /* Template Methods */
    const setModerators = () => {
      const modsToAdd = v.modTagsInput.value
      const modsToRemove = v.modsToRemove
      const mods = props.board.moderators

      // figure out which are duplicates
      const inter = intersection(modsToAdd, modsToRemove)
      inter.forEach(interName => {
        remove(modsToAdd, name => name === interName)
        remove(modsToRemove, name => name === interName)
      })

      // build save params
      let addData = {
        usernames: modsToAdd,
        board_id: props.board.id
      }
      let removeData = {
        usernames: modsToRemove,
        board_id: props.board.id
      }
      // remove moderators if needed
      return new Promise(resolve => {
        if (!modsToRemove.length) return resolve()
        let promise = adminApi.moderators.remove(removeData)
        .then(users => {
          users.forEach(u => remove(mods, mod => mod.username === u.username))
          return users
        })
        return resolve(promise)
      })
      // add moderators if needed
      .then(() => {
        if (!modsToAdd.length) return
        return adminApi.moderators.add(addData)
        .then(users => {
          users.forEach(user => mods.push({ username: user.username, id: user.id }))
          return users
        })
        .then(users => $auth.permissionUtils.checkModPermissions(users))
        .then(bpUsers => v.modsWithBadPermissions = bpUsers)
      })
      .then(() => v.moderators = cloneDeep(mods))
      .then(() => $alertStore.success('Moderators successfully updated'))
      .catch(() => $alertStore.error('There was an error updating moderators'))
      .finally(() => { if (!v.modsWithBadPermissions.length) close() })
    }

    const removeModerator = username => {
      const oldLen = v.moderators.length
      v.moderators = v.moderators.filter(u => u.username !== username)
      if (v.moderators.length < oldLen) v.modsToRemove.push(username)
    }

    const close = () => {
      emit('close')
      v.modTagsInput.value = []
      v.modsToRemove = []
      v.modsWithBadPermissions = []
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')
    const $auth = inject(AuthStore)

    /* Template Data */
    // const initMods = []

    const v = reactive({
      boardName: props.board.name,
      moderators: props.board.moderators,
      modsToRemove: [],
      modsWithBadPermissions: [],
      modTagsInput: {
        mode: 'tags',
        value: [],
        placeholder: 'Type username of moderator(s) to add',
        noOptionsText: 'Enter a username to start lookup...',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        maxHeight: 100,
        options: async q => {
          return await usersApi.search(q)
          // filter out existing mods
          .then(d => d.filter(u => !v.moderators.find(o => o.username === u)))
          // convert array into array of objects
          .then(d => d.reduce((o, k) => (o[k] = k, o), {}))
        }
      }
    })

    return { ...toRefs(v), setModerators, removeModerator, close }
  }
}
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
<style lang="scss">
.no-mods { margin-bottom: .45rem; }
.mod-list-bp {
  margin-top: 1rem;
  display: block;
  padding-left: 0;
  font-size: 0.6375rem;
  margin-left: 2rem;
}
.mod-tags {
  display: inline-flex;
  &.multiselect-tag {
    background: #2299DD;
    i:before { color: $base-background-color; }
  }
}
.multiselect-tag { background: $color-primary; }
.multiselect-tag i:before { color: $color-primary-alt; }
.multiselect-options { overflow-x: hidden; }
</style>
