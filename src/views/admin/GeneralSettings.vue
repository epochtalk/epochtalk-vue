<template>
  <h1>General Settings</h1>
  <div class="description">Hello World</div>
  {{config}}
</template>

<script>
import { reactive, toRefs } from 'vue'
import { adminApi } from '@/api'

export default {
  name: 'GeneralSettings',
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
.general-settings {
  main #public-content {
    max-width: unset;
    grid-template-areas: 'header header' 'main main' 'main main';
  }
}
</style>
