<template>
  <div class="confirm-section">
    <h1 class="view-title">Account Confirmation</h1>
    <div class="description">Thank you for confirming your account, you will be redirected shortly.</div>
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'
import { AuthStore } from '@/composables/stores/auth'
import { inject } from 'vue'

export default {
  name: 'ConfirmAccount',
  setup() {
    const $auth = inject(AuthStore)
    const $route = useRoute()
    const $router = useRouter()
    $auth.confirmRegistration($route.params.username, $route.params.token)
    .finally(() => $router.push('/'))

    return { }
  }
}
</script>

<style lang="scss">
.confirm {
  main #public-content { grid-template-areas: 'header header' 'main main' 'sidebar sidebar'; }
  .confirm-section {
    grid-area: main;
    .view-title {
      color: $secondary-font-color;
      font-size: $font-size-xl;
      font-weight: 600;
      text-transform: none;
    }
    .description { margin: rem 0 1rem; }
  }
}
</style>
