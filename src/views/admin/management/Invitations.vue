<template>
  <div class="full-width">
    <div class="admin-table-header">
      <div class="nested-input-container">
        <button @click="inviteUser()" class="nested-btn" :disabled="!validEmail">Invite</button>
        <input class="input-text nested-input" v-model="emailToInvite" type="text" id="invite-user" placeholder="Type email of the person you would like to invite to the forum" @keydown="$event.which === 13 && inviteUser()" @keyup="$event.which === 27 && clearSearch()" />
      </div>
    </div>
    <div class="invitations-content fill-row centered-text" v-if="inviteData?.invitations?.length < 1">
      <h4>No user invitations to display</h4>
    </div>
    <div class="invitations-content fill-row" v-if="inviteData?.invitations?.length">
      <table class="underlined" width="100%">
        <thead>
          <th>Email</th>
          <th>Sent</th>
          <th class="user-actions">Actions</th>
        </thead>
        <tbody>
          <tr v-for="invite in inviteData?.invitations" :key="invite">
            <td v-html="invite.email"></td>
            <td v-html="humanDate(invite.created_at) || 'N/A'"></td>
            <td class=user-actions>
              <button class="icon" data-balloon="Resend Invitation" @click="resendInvitation(invite.email)">
                <i class="fas fa-retweet"></i>
              </button>

              <button class="icon" data-balloon="Delete Invitation" @click="deleteInvitation(invite.email)">
                <i class="fa fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <div class="pagination-wrap" v-if="inviteData.page > 1 || inviteData.has_more">
        <div class="pagination-simple">
          <button @click="pageResults(inviteData.page - 1)" :disabled="inviteData.page <= 1">&#10094; Prev</button>
          <button @click="pageResults(inviteData.page + 1)" :disabled="!inviteData.has_more">Next &#10095;</button>
        </div>
      </div>
    </div>
  </div>
  <InvitationManagerModal :selected="selectedEmail" :show="showResendInvite || showDeleteInvite" :resendInvite="showResendInvite" :deleteInvite="showDeleteInvite" @success="reloadData()" @close="showResendInvite=showDeleteInvite=false"  />
</template>

<script>
import { reactive, toRefs, watch, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { adminApi, authApi } from '@/api'
import { debounce } from 'lodash'
import humanDate from '@/composables/filters/humanDate'
import { emailRegex } from '@/composables/utils/globalRegex'
import InvitationManagerModal from '@/components/modals/admin/management/InvitationManager.vue'

export default {
  name: 'Invitations',
  components: { InvitationManagerModal },
  beforeRouteEnter(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || 15,
      page: Number(to.query.page) || 1
    }
    adminApi.invitations.all(queryParams)
    .then(inviteData => next(vm => vm.inviteData = inviteData))
  },
  beforeRouteUpdate(to, from, next) {
    let queryParams = {
      limit: Number(to.query.limit) || 15,
      page: Number(to.query.page) || 1
    }
    adminApi.invitations.all(queryParams)
    .then(inviteData => {
      this.inviteData = inviteData
      next()
    })
  },
  setup() {
    /* Template Methods */
    const pageResults = page => {
      let query = { ...$route.query, page: page }
      if (query.page <= 1 || !query.page) delete query.page
      $router.replace({ name: $route.name, params: $route.params, query: query })
    }

    const reloadData = () => {
      let queryParams = {
        limit: Number($route.query.limit) || 15,
        page: Number($route.query.page) || 1
      }
      adminApi.invitations.all(queryParams)
      .then(inviteData => {
        v.inviteData = inviteData
      })
    }

    const resendInvitation = email => {
      v.selectedEmail = email
      v.showResendInvite = true
    }

    const deleteInvitation = email => {
      v.selectedEmail = email
      v.showDeleteInvite = true
    }

    const inviteUser = () => {
      authApi.invite(v.emailToInvite)
      .then(() => {
        $alertStore.success(`Successfully sent invite to ${v.emailToInvite}!`)
        v.emailToInvite = null
        reloadData()
      })
      .catch(err => {
        let msg = `There was an error inviting ${v.emailToInvite}`
        if (err.response.status === 400) msg += ', ensure this email is valid'
        else if (err.response.status === 422) msg = err.response.data.message
        $alertStore.error(msg)
      })
    }

    /* Internal Data */
    const $router = useRouter()
    const $route = useRoute()
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      inviteData: {},
      emailToInvite: null,
      selectedEmail: null,
      validEmail: false,
      showResendInvite: false,
      showDeleteInvite: false
    })

    /* Watch Data */
    watch(() => v.emailToInvite, debounce(async () => v.validEmail = emailRegex.test(v.emailToInvite)))

    return { ...toRefs(v), pageResults, inviteUser, humanDate, deleteInvitation, reloadData, resendInvitation }
  }
}
</script>

<style lang="scss" scoped>
.invitations-content { margin-top: 6rem; }
.nested-btn {
  position: absolute;
  line-height: 0;
}
</style>
