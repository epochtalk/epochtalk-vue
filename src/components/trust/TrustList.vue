<template>
  <div class="fill-row">
    <h5 v-if="admin" class="thin-underline section-header-top-spacing">Manage Default Trust Lists
      <span class="info-tooltip" data-balloon="Manages the trust list which all users will inherit for their default trust settings. Trust is important to prevent scamming when there are forums for selling goods and services" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>

    <Multiselect v-model="trustUserInput.value" v-bind="trustUserInput" />

<!--     <autocomplete-user-id admin="admin" user-id="vm.userToTrust.user_id_trusted" username="vm.userToTrust.username_trusted" input-placeholder="Type username to add to trust/untrust list"></autocomplete-user-id>
 -->
    <div class="trust-section">
      <div class="half-column">
        <button class="fill-row" @click="addToTrustList()" :disabled="trustedUserExists()">Add to Trusted Users</button>
      </div>
      <div class="half-column">
        <button class="fill-row" @click="addToUntrustList()" :disabled="untrustedUserExists()">Add to Untrusted Users</button>
      </div>
    </div>
    <div class="trust-section">
      <div class="half-column">
        <h5 class="inline-block">Trusted Users
          <span class="info-tooltip" data-balloon="Users that you believe are trusted members to deal with" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        </h5>
        <a v-if="selectedTrustedUsers.length" class="remove-active right" href="#" @click.prevent="removeSelectedTrust()"><i class="fa fa-times"></i> Remove Selected</a>
        <span v-if="!selectedTrustedUsers.length" class="remove-inactive right"><i class="fa fa-times"></i> Remove Selected</span>
        <select id="trustList" class="trust-select" v-model="selectedTrustedUsers" multiple="multiple">
          <option :value="user.username_trusted" v-for="user in trustList" :key="user.username_trusted">
            {{ user.username_trusted }}
          </option>
        </select>
<!--         <select ng-options="u.username_trusted for u in vm.trustList track by u.username_trusted" ng-model="vm.selectedTrustedUsers" multiple="multiple">
        </select> -->
      </div>
      <div class="half-column">
        <h5 class="inline-block">Untrusted Users
          <span class="info-tooltip" data-balloon="Users that are known or are suspected scammers" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
        </h5>
        <a v-if="selectedUntrustedUsers.length" class="remove-active right" href="#" @click.prevent="removeSelectedUntrust()"><i class="fa fa-times"></i> Remove Selected</a>
        <span v-if="!selectedUntrustedUsers.length" class="remove-inactive right"><i class="fa fa-times"></i> Remove Selected</span>
        <select id="untrustList" class="trust-select" v-model="selectedUntrustedUsers" multiple="multiple">
          <option :value="user.username_trusted" v-for="user in untrustList" :key="user.username_trusted">
            {{ user.username_trusted }}
          </option>
        </select>
      </div>
    </div>
    <div class="trust-section">
      <div class="half-column">
        <label v-if="!admin" for="maxdepth">Trust Depth (max 4): </label>
        <input v-if="!admin" id="maxdepth" name="maxdepth" placeholder="Trust Depth (max 4)" type="number" min="0" max="4" v-model="maxDepth" />
        <span v-if="admin">&nbsp;</span>
      </div>
      <div class="half-column">
        <button class="right trust-button" @click="editTrustList()"><i class="fa fa-save"></i> Save Trust Settings</button>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue'
import Multiselect from '@vueform/multiselect'
import { usersApi } from '@/api'

export default {
  name: 'TrustList',
  props: [ 'admin', 'trustList', 'untrustList', 'max' ],
  emits: ['success'],
  components: { Multiselect },
  setup(props) {

    const editTrustList = () => console.log('editTrustList')
    const addToTrustList = () => console.log('addToTrustList')
    const addToUntrustList = () => console.log('addToUntrustList')
    const removeSelectedTrust = () => console.log('removeSelectedTrust')
    const removeSelectedUntrust = () => console.log('removeSelectedUntrust')
    const trustedUserExists = () => {
      if (v.trustUserInput.value.length < 1) return true
      return v.trustUserInput.value.length !== v.trustUserInput.value.filter(u => !v.trustList.find(o => o.username_trusted === u)).length
    }
    const untrustedUserExists = () => {
      if (v.trustUserInput.value.length < 1) return true
      return v.trustUserInput.value.length !== v.trustUserInput.value.filter(u => !v.untrustList.find(o => o.username_trusted === u)).length
    }

    let v = reactive({
      admin: props.admin,
      userToTrust: {},
      trustList: props?.trustList || [],
      untrustList: props?.untrustList || [],
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
          return await usersApi.search(q)
          // convert array into array of objects
          .then(d => d.reduce((o, k) => (o[k] = k, o), {}))
        }
      }
    })

    watch(() => props.max, m => v.maxDepth = m)
    watch(() => props.trustList, l => v.trustList = l)
    watch(() => props.untrustList, l => v.untrustList = l)

    return { ...toRefs(v), editTrustList, addToTrustList, addToUntrustList, removeSelectedTrust, removeSelectedUntrust, trustedUserExists, untrustedUserExists }
  }
}
</script>

<style scoped lang="scss">

</style>
