<template>
  <div class="join-section">
    <h1 class="view-title">Register and Join</h1>
    <div class="form"></div>
  </div>
</template>

<script>
// import { useRoute, useRouter } from 'vue-router'
// import { AuthStore } from '@/composables/stores/auth'
// import { inject } from 'vue'

export default {
  name: 'Join',
  setup() {
    // const $auth = inject(AuthStore)
    // const $route = useRoute()
    // const $router = useRouter()
    // $auth.confirmRegistration($route.params.username, $route.params.token)
    //.finally(() => $router.push('/'))

    return { }
  }
}
</script>

<style lang="scss">
.join {
  main #public-content { grid-template-areas: 'header header' 'main main' 'sidebar sidebar'; }
  .join-section {
    grid-area: main;
    .view-title {
      color: $secondary-font-color;
      font-size: $font-size-xl;
      font-weight: 600;
      text-transform: none;
    }
    .form { margin: rem 0 1rem; }
  }
}
</style>
