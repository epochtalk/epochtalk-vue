
<template>
  <div class="trust-profile">
    <div v-if="stats">
      <span>Trust:&nbsp;&nbsp;<strong><span class="trust-score" :class="getStyle(stats.score)"><!-- <span data-balloon="Trust Score"> --><span>{{stats.score}}</span> : <!-- TODO(akinsey): <span data-balloon="Negative Feedback" ng-class="{\'neg\' : vmTrust.stats.neg !== 0 }"> --><span :class="{'neg' : stats.neg !== 0 }">-{{stats.neg}}</span> / <!-- <span data-balloon="Positive Feedback"> --><span>+{{stats.pos}}</span></span></strong></span>
    </div>
    <div v-if="stats?.score < 0">
      <span class="trust-score" :class="getStyle(stats.score)">Warning: Trade with extreme caution!</span>
    </div>
    <div>
      <a href="" class="trust-link">View Trust Feedback</a>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs, watch } from 'vue'
import { usersApi } from '@/api'

export default {
  name: 'TrustProfileDisplay',
  props: [ 'username' ],
  setup(props) {

    const getStyle = score => {
      if (score === '???') return 'unknown'
      if (score < 0) return 'low'
      if (score > 4) return 'mid'
      if (score > 14) return 'high'
    }

    let v = reactive({
      stats: null,
      username: props.username
    })

    const initTrust = u => usersApi.trust.getTrustStats(u).then(stats => v.stats = stats)

    initTrust(v.username)

    watch(() => props.username, u => initTrust(u))

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
