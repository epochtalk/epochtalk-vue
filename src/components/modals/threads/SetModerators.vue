<template>
  <modal :name="$options.name" :show="show" @close="close()">
    <template v-slot:header>Manage Moderators of {{boardName}}</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <label>Current Moderators of {{boardName}} </label>
        <div v-for="mod in moderators" :key="mod.id" class="multiselect-tag mod-tags">
          {{mod.username}} <i @click.prevent="removeModerator(mod.username)"></i>
        </div>
        <label>Moderators to Add</label>
        <Multiselect v-model="modTagsInput.value" v-bind="modTagsInput" />
        <br>
        <label>
          <strong>Note:</strong> Moderator changes will take affect upon clicking save changes.
        </label>
        <button class="fill" @click.prevent="setModerators()" type="submit" :disabled="false">
          Set Moderators
        </button>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { intersection, remove } from 'lodash'
import { reactive, toRefs, inject } from 'vue'
// import { AuthStore } from '@/composables/stores/auth'
import Multiselect from '@vueform/multiselect'

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
      console.log('Set Moderators!', mods, modsToAdd, modsToRemove)

      // Compare against original mod list, if net add/remove of mods is same just alert success

      // Call API to remove mods on v.modsToRemove

      // Call API to add mods on v.modsTagsInput.value

      // figure out which are duplicates
      let inter = intersection(modsToAdd, modsToRemove)
      inter.forEach(interName => {
        remove(modsToAdd, name => name === interName)
        remove(modsToRemove, name => name === interName)
      })

      // build save params
      let addParams = { usernames: modsToAdd, board_id: props.board.id };
      let removeParams = { usernames: modsToRemove, board_id: props.board.id };

      // remove moderators if needed
      return new Promise(resolve => {
        if (!modsToRemove.length) return resolve()

        let promise = $axios.post('/api/admin/moderators/remove', removeParams)
        .then(res => res.status === 200 ? res.data : res)
        .then(users => {
          users.forEach(user => {
            console.log(remove(mods, mod => mod.username === user.username))
          })
        })

        return resolve(promise);
      })
      // add moderators if needed
      .then(() => {
        if (!modsToAdd.length) return

        return $axios.post('/api/admin/moderators', addParams)
        .then(res => res.status === 200 ? res.data : res)
        .then(users => {
          users.forEach(user => mods.push({ username: user.username, id: user.id }))
          return users
        })
      })
      .then(function() { $alertStore.success('Moderators successfully updated'); })
      .catch(function() { $alertStore.error('There was an error updating moderators'); })
      .finally(() => {
        close()
      })
      // Moderators.add(addParams).$promise
      //   .then(function(users) {
      //     users.forEach(function(user) {
      //       ctrl.board.moderators.push({ username: user.username, id: user.id });
      //     });
      //     return users;
      //   })
      //   .then(function(users) { return ctrl.checkPermissions(users); })
      //   .then(function(bpUsers) { ctrl.usersWithBadPermissions = bpUsers; });
      // })
      // .then(function() { ctrl.mods = angular.copy(ctrl.board.moderators); })
      // .then(function() { Alert.success('Moderators successfully updated'); })
      // .catch(function() { Alert.error('There was an error updating moderators'); })
      // .finally(function() {
      //   if (!ctrl.usersWithBadPermissions.length) { ctrl.closeModerators(); }
      // });
    }

    const removeModerator = username => {
      const oldLen = v.moderators.length
      v.moderators = v.moderators.filter(u => u.username !== username)
      if (v.moderators.length < oldLen) v.modsToRemove.push(username)
    }

    const close = () => {
      emit('close')
    }

    /* Internal Data */
    // const auth = inject(AuthStore)
    const $axios = inject('$axios')
    const $alertStore = inject('$alertStore')
    // const originalModList = cloneDeep(props.board.moderators)

    /* Template Data */
    // const initMods = []

    const v = reactive({
      boardName: props.board.name,
      moderators: props.board.moderators,
      modsToRemove: [],
      modTagsInput: {
        mode: 'tags',
        value: [],
        placeholder: 'Type username of moderator(s) to add',
        noOptionsText: 'Enter a username to start lookup',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        maxHeight: 100,
        options: async q => {
          // TODO(akinsey): extract to api file
          return await $axios.get('/api/users/search?username=' + q)
          .then(res => res.status === 200 ? res.data : res)
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
