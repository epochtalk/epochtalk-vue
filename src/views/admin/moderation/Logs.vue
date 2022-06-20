<template>
  <pre>{{JSON.stringify(config, null, 2)}}</pre>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { adminApi } from '@/api'

export default {
  name: 'LogModeration',
  beforeRouteEnter(to, from, next) {
    adminApi.configurations().then(data => next(vm => vm.config = data))
  },
  beforeRouteUpdate(to, from, next) {
    adminApi.configurations().then(data => {
      this.config = data
      next()
    })
  },
  setup() {
    const v = reactive({ config: {} })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">

</style>
