<template>{{userRank}}</template>

<script>
import { reactive, toRefs, watch } from 'vue'

export default {
  name: 'RankDisplay',
  props: [ 'user' ],
  setup(props) {

    let v = reactive({
      userRank: '',
      user: props.user
    })

    const init = u => {
      const rankMap = u.metadata.ranks
      const metricToRankMaps = u.metadata.rank_metric_maps
      let ranks = Object.keys(metricToRankMaps).reduce((mappedRanks, metricName) => {
        let rank = -1
        for (let i = 0; i < metricToRankMaps[metricName].length; i++) {
          if (u[metricName] >= metricToRankMaps[metricName][i]) rank = i
          else break
        }
        mappedRanks.push(rank)
        return mappedRanks
      }, [])
      // order the ranks and pluck the lowest rank
      ranks.sort()
      const lowestRankNumber = ranks[0]

      if (lowestRankNumber >= 0) v.userRank = rankMap[lowestRankNumber].name
      else v.userRank = ''
    }

    init(v.user)

    watch(() => props.user, u => init(u))

    return { ...toRefs(v) }
  }
}
</script>
