<template>
  <div class="trust-summary">
    <h1 class="view-title">Trust Summary for {{user.username}}</h1>

    <div class="trust-section">
      Risked BTC amount is money that the person could have stolen or did steal. For example, if you do a currency trade where the other person sends first, your feedback for them would have 0 risked BTC and their feedback for you would have risked BTC equal to the BTC value of the trade.
    </div>

    <div class="trust-section">
      <h2 class="section-header">Trusted feedback</h2 >
      <span v-if="!userFeedback.trusted.length">
        {{user.username}} has no trusted feedback.
      </span>
      <table width="100%" class="striped" v-if="userFeedback.trusted.length">
        <thead>
          <tr>
            <th>Type</th>
            <th>Feedback By User</th>
            <th>Date</th>
            <th>Risked BTC</th>
            <th class="centered-text">Reference</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="feedback in userFeedback.trusted" :key="feedback.id">
            <td>
              <span :data-balloon="(feedback.scammer === null ? 'Neutral' : (feedback.scammer ? 'Negative' : 'Positive')) + ' Feedback'" data-balloon-pos="left">
                <i class="fa" :class="{'fa-plus-circle pos-feedback': feedback.scammer === false, 'fa-circle neu-feedback': feedback.scammer === null, 'fa-minus-circle neg-feedback': feedback.scammer === true}"></i>
              </span>
            </td>
            <td><a ui-sref="profile.posts({ username: feedback.reporter.username })">{{feedback.reporter.username}}</a> <trust-display :username="feedback.reporter" /></td>
            <td v-html="humanDate(feedback.created_at, false, 'MM/DD/YYYY, h:mm A')"></td>
            <td v-html="feedback.risked_btc"></td>
            <td class="centered-text">
              <i v-if="!feedback.reference" class="fa fa-external-link-square"></i>
              <a v-if="feedback.reference" :href="feedback.reference.indexOf('://') > -1 ? feedback.reference : '//' + feedback.reference" target="_blank" :data-balloon="feedback.reference" data-balloon-pos="left"><i class="fa fa-external-link-square"></i></a>
            </td>
            <td v-html="feedback.comments" width="35%"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="trust-section">
      <h2 class="section-header">Untrusted feedback</h2 >

      <p>These ratings are from people who are not in your trust network. They may be totally inaccurate.</p>

      <span v-if="!userFeedback.untrusted.length">
        {{user.username}} has no untrusted feedback.
      </span>
      <a href="" v-if="userFeedback.untrusted.length && !showUntrusted" @click.prevent="showUntrusted = true">Show untrusted feedback</a>
      <a href="" v-if="userFeedback.untrusted.length && showUntrusted" @click.prevent="showUntrusted = false">Hide untrusted feedback</a>

      <div v-if="showUntrusted">
        <br />
        <table width="100%" class="striped">
          <thead>
            <tr>
              <th>Type</th>
              <th>Feedback By User</th>
              <th>Date</th>
              <th>Risked BTC</th>
              <th class="centered-text">Reference</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="feedback in userFeedback.untrusted" :key="feedback.id">
              <td>
                <span :data-balloon="(feedback.scammer === null ? 'Neutral' : (feedback.scammer ? 'Negative' : 'Positive')) + ' Feedback'" data-balloon-pos="left">
                  <i class="fa" :class="{'fa-plus-circle pos-feedback': feedback.scammer === false, 'fa-circle neu-feedback': feedback.scammer === null, 'fa-minus-circle neg-feedback': feedback.scammer === true}"></i>
                </span>
              </td>
              <td><a ui-sref="profile.posts({ username: feedback.reporter.username })">{{feedback.reporter.username}}</a> <trust-display :username="feedback.reporter" /></td>
              <td v-html="humanDate(feedback.created_at, false, 'MM/DD/YYYY, h:mm A')"></td>
              <td v-html="feedback.risked_btc"></td>
              <td class="centered-text">
                <i v-if="!feedback.reference" class="fa fa-external-link-square"></i>
                <a v-if="feedback.reference" :href="feedback.reference.indexOf('://') > -1 ? feedback.reference : '//' + feedback.reference" target="_blank" :data-balloon="feedback.reference" data-balloon-pos="left"><i class="fa fa-external-link-square"></i></a>
              </td>
              <td v-html="feedback.comments" width="35%"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>


    <div class="trust-section">
      <h2 class="section-header">Sent feedback</h2>

      <span v-if="!userFeedback.sent.length">{{user.username}} hasn't sent any feedback.</span>

      <table v-if="userFeedback.sent.length" width="100%" class="striped">
        <thead>
          <tr>
            <th>Type</th>
            <th>Feedback Left for User</th>
            <th>Date</th>
            <th>Risked BTC</th>
            <th>Reference</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="feedback in userFeedback.sent" :key="feedback.id">
            <td>
              <span :data-balloon="(feedback.scammer === null ? 'Neutral' : (feedback.scammer ? 'Negative' : 'Positive')) + ' Feedback'" data-balloon-pos="left">
                <i class="fa" :class="{'fa-plus-circle pos-feedback': feedback.scammer === false, 'fa-circle neu-feedback': feedback.scammer === null, 'fa-minus-circle neg-feedback': feedback.scammer === true}"></i>
              </span>
            </td>
            <td><a ui-sref="profile.posts({ username: feedback.reporter.username })">{{feedback.user.username}}</a> <trust-display :username="feedback.user" /></td>
            <td v-html="humanDate(feedback.created_at, false, 'MM/DD/YYYY, h:mm A')"></td>
            <td v-html="feedback.risked_btc"></td>
            <td class="centered-text">
              <i v-if="!feedback.reference" class="fa fa-external-link-square"></i>
              <a v-if="feedback.reference" :href="feedback.reference.indexOf('://') > -1 ? feedback.reference : '//' + feedback.reference" target="_blank" :data-balloon="feedback.reference" data-balloon-pos="left"><i class="fa fa-external-link-square"></i></a>
            </td>
            <td v-html="feedback.comments" width="35%"></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="sidebar">
    <div class="trust-section" v-if="loggedIn">
      <a v-if="!hideAddFeedback" class="button" href="#" @click.prevent="showFeedbackModal = true">Leave feedback for {{user.username}}</a>

      <a class="" ui-sref="trust-settings"><i class="fa fa-cog"></i> Edit My Trust Settings</a>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { trustApi } from '@/api'
// import { useRoute, useRouter } from 'vue-router'
import humanDate from '@/composables/filters/humanDate'
import TrustDisplay from '@/components/trust/TrustDisplay.vue'

export default {
  name: 'Trust',
  components: { TrustDisplay },
  beforeRouteEnter(to, from, next) {
    const query = {
      limit: 10,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    next(vm => usersApi.memberSearch(query).then(d => vm.searchData = d).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    const query = {
      limit: 10,
      page: to.query.page || 1,
      field: to.query.field,
      desc: to.query.desc,
      search: to.query.search
    }
    usersApi.memberSearch(query).then(d => this.searchData = d).catch(() => {})
    next()
  },
  setup() {
    // const $route = useRoute()
    // const $router = useRouter()

    const v = reactive({
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
    })

    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">
.trust main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }
.trust-summary { grid-area: main; }
.sidebar {
  grid-area: sidebar;

  .sidebar-block {
    display: block;
    position: sticky;
    top: $header-offset;
  }
}
</style>
