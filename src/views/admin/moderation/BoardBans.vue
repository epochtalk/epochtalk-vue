<template>
  <div class="full-width">
    <div class="admin-table-header row">
      <div class="column">
        Hey
      </div>
      <div class="column">
        Hey
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
// import { adminApi } from '@/api'

export default {
  name: 'BoardBanModeration',
  beforeRouteEnter(to, from, next) {
    next()
    // adminApi.configurations().then(data => next(vm => vm.config = data))
  },
  beforeRouteUpdate(to, from, next) {
    // adminApi.configurations().then(data => {
    //   this.config = data
    //   next()
    // })
    next()
  },
  setup() {
    const v = reactive({ config: {} })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">
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
.row {
  display: flex;
  flex-flow: row;
  row-gap: 0;
}
.column { flex: 50%; }
</style>
