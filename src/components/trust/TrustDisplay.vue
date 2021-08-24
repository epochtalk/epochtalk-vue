
<template>
  <div class="trust-profile" v-if="username">
    <div v-if="stats">
      <span>Trust:&nbsp;&nbsp;<strong><span class="trust-score" :class="getStyle(stats.score)"><span data-balloon="Trust Score">{{stats.score}}</span> : <span data-balloon="Negative Feedback" :class="{'neg' : stats.neg !== 0 }">-{{stats.neg}}</span> / <span data-balloon="Positive Feedback">+{{stats.pos}}</span></span></strong></span>
    </div>
    <div v-if="stats?.score < 0">
      <span class="trust-score" :class="getStyle(stats.score)">Warning: Trade with extreme caution!</span>
    </div>
    <div>
      <router-link class="trust-link" :to="{ name: 'Trust', params: { username: username.toLowerCase() }}">View Trust Feedback</router-link>
    </div>
  </div>
  <router-link v-if="user" :to="{ name: 'Trust', params: { username: user.username.toLowerCase() }}"><span class="trust-score" :class="getStyle(stats.score)">{{stats.score}} : <span :class="negStyle">-{{stats.neg}}</span> / +{{stats.pos}}</span></router-link>
</template>

<script>
import { reactive, toRefs, watch } from 'vue'
import { usersApi } from '@/api'

export default {
  name: 'TrustDisplay',
  props: [ 'username', 'user' ],
  setup(props) {

    const getStyle = score => {
      if (score === '???') return 'unknown'
      if (score < 0) return 'low'
      if (score > 4) return 'mid'
      if (score > 14) return 'high'
    }

    let v = reactive({
      stats: null,
      negStyle: '',
      username: props.username
    })

    const initTrustProfile = u => usersApi.trust.getTrustStats(u).then(stats => v.stats = stats)

    const initTrustPost = () => {
      v.stats = props.user.stats
      v.negStyle = props.user.stats.neg === 0 ? '' : 'neg'
    }

    props.username ? initTrustProfile(v.username) : initTrustPost()

    watch(() => props.username, u => initTrustProfile(u))

    return { ...toRefs(v), getStyle }
  }
}
</script>

<style scoped lang="scss">
.trust-section {
  display: inline-block;
  margin-right: 1rem;
}
.trust-score {
  color: $text-gray-med;
  &.unknown { color: #FA8072; }
  &.low { color: #DC143C; }
  &.mid { color: #74C365; }
  &.high { color: #008000; }
  .neg { color: orange; }
}
</style>
