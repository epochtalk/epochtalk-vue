<template>
  <div class="fill-row">
    <h5 v-if="admin" class="thin-underline section-header-top-spacing">Manage Default Trust Lists
      <span class="info-tooltip" data-balloon="Manages the trust list which all users will inherit for their default trust settings. Trust is important to prevent scamming when there are forums for selling goods and services" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>
    <div class="trust-section">
      <Multiselect v-model="trustUserInput.value" v-bind="trustUserInput" />
    </div>
<!--     <autocomplete-user-id admin="admin" user-id="vm.userToTrust.user_id_trusted" username="vm.userToTrust.username_trusted" input-placeholder="Type username to add to trust/untrust list"></autocomplete-user-id>
 -->
    <div class="trust-section split-column">
      <button class="fill-row" @click="addToTrustList()" :disabled="trustedUserExists()">Add to Trusted Users</button>
      <button class="fill-row" @click="addToUntrustList()" :disabled="untrustedUserExists()">Add to Untrusted Users</button>
    </div>
    <div class="trust-section split-column">
      <div>
        <h5 class="inline-block">Trusted Users
          <span class="info-tooltip" data-balloon="Users that you believe are trusted members to deal with" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        </h5>
        <a v-if="selectedTrustedUsers.length" class="remove-active right" href="#" @click.prevent="removeSelectedTrust()"><i class="fa fa-times"></i> Remove Selected</a>
        <span v-if="!selectedTrustedUsers.length" class="remove-inactive right"><i class="fa fa-times"></i> Remove Selected</span>
        <select id="trustList" class="trust-select" v-model="selectedTrustedUsers" multiple="multiple">
          <option :value="user" v-for="user in trustListReactive" :key="user.username_trusted">
            {{ user.username_trusted }}
          </option>
        </select>
      </div>
      <div>
        <h5 class="inline-block">Untrusted Users
          <span class="info-tooltip" data-balloon="Users that are known or are suspected scammers" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        </h5>
        <a v-if="selectedUntrustedUsers.length" class="remove-active right" href="#" @click.prevent="removeSelectedUntrust()"><i class="fa fa-times"></i> Remove Selected</a>
        <span v-if="!selectedUntrustedUsers.length" class="remove-inactive right"><i class="fa fa-times"></i> Remove Selected</span>
        <select id="untrustList" class="trust-select" v-model="selectedUntrustedUsers" multiple="multiple">
          <option :value="user" v-for="user in untrustListReactive" :key="user.username_trusted">
            {{ user.username_trusted }}
          </option>
        </select>
      </div>
    </div>
    <div class="trust-section split-column align-bottom">
      <div>
        <label v-if="!admin" for="maxdepth">Trust Depth (max 4): </label>
        <input v-if="!admin" id="maxdepth" name="maxdepth" placeholder="Trust Depth (max 4)" type="number" min="0" max="4" v-model="maxDepth" />
        <span v-if="admin">&nbsp;</span>
      </div>
      <div>
        <button class="right trust-button" @click="editTrustList()"><i class="fa fa-save"></i> Save Trust Settings</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue'
import Multiselect from '@vueform/multiselect'
import { usersApi, adminApi } from '@/api'

export default {
  name: 'TrustList',
  props: [ 'admin', 'trustList', 'untrustList', 'max' ],
  emits: ['success'],
  components: { Multiselect },
  setup(props, { emit }) {
    const editTrustList = () => {
      let params = {
        max_depth: v.maxDepth >= 0 && v.maxDepth <= 4 ? v.maxDepth : 2,
        list: v.trustListReactive.concat(v.untrustListReactive)
      }
      let editTrustListPromise = v.admin ? adminApi.trust.editDefaultTrustList(params) : usersApi.trust.editTrustList(params)
      editTrustListPromise.then(updatedLists => {
        v.trustListReactive = updatedLists.trustList;
        v.untrustListReactive = updatedLists.untrustList;
        v.maxDepth = updatedLists.maxDepth;
        emit('success')
      })
    }

    const addToTrustList = () => {
      v.trustUserInput.value.forEach(u => {
        if (!u.user_id_trusted || !u.username_trusted) return
        v.untrustListReactive = v.untrustListReactive.filter(ul => ul.user_id_trusted !== u.user_id_trusted)
        v.trustListReactive.push({ ...u, type: 0})
      })
      v.trustUserInput.value = []
    }
    const addToUntrustList = () => {
      v.trustUserInput.value.forEach(u => {
        if (!u.user_id_trusted || !u.username_trusted) return
        v.trustListReactive = v.trustListReactive.filter(ul => ul.user_id_trusted !== u.user_id_trusted)
        v.untrustListReactive.push({ ...u, type: 1})
      })
      v.trustUserInput.value = []
    }
    const removeSelectedTrust = () => v.trustListReactive = v.trustListReactive.filter(user => v.selectedTrustedUsers.filter(u => u.user_id_trusted === user.user_id_trusted).length === 0)

    const removeSelectedUntrust = () => v.untrustListReactive = v.untrustListReactive.filter(user => v.selectedUntrustedUsers.filter(u => u.user_id_trusted === user.user_id_trusted).length === 0)

    const trustedUserExists = () => {
      if (v.trustUserInput.value.length < 1) return true
      return v.trustUserInput.value.length !== v.trustUserInput.value.filter(u => !v.trustListReactive.find(o => o.username_trusted === u.username_trusted)).length
    }
    const untrustedUserExists = () => {
      if (v.trustUserInput.value.length < 1) return true
      return v.trustUserInput.value.length !== v.trustUserInput.value.filter(u => !v.untrustListReactive.find(o => o.username_trusted === u.username_trusted)).length
    }

    let v = reactive({
      admin: props.admin,
      userToTrust: {},
      trustListReactive: props?.trustList || [],
      untrustListReactive: props?.untrustList || [],
      maxDepth: props.max,
      selectedTrustedUsers: [],
      selectedUntrustedUsers: [],
      trustUserInput: {
        mode: 'tags',
        value: [],
        placeholder: 'Type username of user(s) to trust/untrust',
        noOptionsText: 'Enter a username to start lookup...',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        maxHeight: 100,
        options: async q => {
          return await usersApi.lookup(q, { restricted: !v.admin, self: v.admin })
          // convert array into array of objects
          .then(d => d.map(u =>{ return { label: u.username, value: { username_trusted: u.username, user_id_trusted: u.id } } }))
          .catch(() => { return [] })
        }
      }
    })

    watch(() => props.max, m => v.maxDepth = m)
    watch(() => props.trustList, l => v.trustListReactive = l)
    watch(() => props.untrustList, l => v.untrustListReactive = l)

    return { ...toRefs(v), editTrustList, addToTrustList, addToUntrustList, removeSelectedTrust, removeSelectedUntrust, trustedUserExists, untrustedUserExists }
  }
}
</script>

<style scoped lang="scss">
.trust-section { margin-bottom: 1rem; }
.split-column {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: .5rem;
  @include break-mobile-sm {
    grid-template-columns: 1fr;
  }
}

.trust-button {
  margin-top: 1rem;
}
.align-bottom {
  align-items: flex-end;
  justify-content: flex-end;
  input {
    margin-bottom: 0;
  }
}
.trust-select { margin-bottom: 0; }
</style>
