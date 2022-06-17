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
</template>

<script>
import { reactive, toRefs, watch, inject } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { adminApi, authApi } from '@/api'
import { debounce } from 'lodash'
import humanDate from '@/composables/filters/humanDate'
import { emailRegex } from '@/composables/utils/globalRegex'

export default {
  name: 'Invitations',
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
      console.log('Resend Invitation', email)
    }

    const deleteInvitation = email => {
      console.log('Delete Invitation', email)
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

    const $router = useRouter()
    const $route = useRoute()
    const $alertStore = inject('$alertStore')

    const v = reactive({
      inviteData: {},
      emailToInvite: null,
      validEmail: false
    })

    watch(() => v.emailToInvite, debounce(async () => v.validEmail = emailRegex.test(v.emailToInvite)))

    return { ...toRefs(v), pageResults, inviteUser, humanDate, deleteInvitation, reloadData, resendInvitation }
  }
}
</script>

<style lang="scss" scoped>
.admin-table-header {
  background-color: $sub-header-color;
  position: absolute;
  left: 0;
  right: 0;
  padding: 1rem;
  padding-top: 2rem;
  top: 0.4rem;
  @include break-mobile-sm { padding: 1.25rem 1rem 0; margin: 0 -1rem 2rem; }
}
.nested-input-container {
  .nested-input { margin-bottom: 0; }
  .nested-btn, .nested-btn:focus, .nested-btn:active {
    position: absolute;
    line-height: 0;
    font-size: 0.8125rem;
  }
}

.invitations-content {
  margin-top: 6rem;
}
table.underlined {
  border: none;
  margin-bottom: 1rem;
  thead {
    text-align: left;
    font-size: 0.875rem;
    background-color: transparent;
    border-bottom: $border-alt;
    th { color: $secondary-font-color; font-weight: 400; padding-bottom: 0.5rem; padding-left: 0.5rem; }
    th.left-icon-col { width: 1.5rem; }
    // th.mod-actions { width: 5.25rem; }
    // th.user-actions { width: 8rem; }
  }
  tr {
    border-bottom: 1px solid $border-color-alt;
    vertical-align: top;
    &.selectable-row { @include no-select; }
    &.selectable-row:hover { background-color: $sub-header-color; }
    &.active-row, &.active-row:nth-of-type(even) { background-color: $color-primary; }
    &.active-row.selectable-row:hover { background-color: $color-primary }
    &.active-row td { color: $button-text-color; }
    &.active-row td a, &.active-row td button { color: darken($color-primary-alt, 10%); }
    &.active-row td a:hover, &.active-row td button:not([disabled]):hover { color: $color-primary-alt; }
    &:nth-of-type(even) { background: transparent; }
    &:nth td { padding-top: 1.5rem; padding-bottom: 1.5rem; }
    &.active-row td.left-icon-col { color: $button-text-color; }
    td.left-icon-col {
      @include pad(0 0 0 0.5rem);
      color: $secondary-font-color;
      padding-top: 0.5rem;
    }
    td {
      padding-top: 0.5rem;
      padding-right: 0.5rem;
      padding-bottom: 0.5rem;
      vertical-align: top;

      &:last-child {
        padding-right: 0;
      }
    }

    td input { margin-bottom: 0; }
  }

  .user-actions,
  .mod-actions {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
