<template>
  <div class="main" id="http-error">
    <div class="message">This forum is Private</div>
    <h5>You must have an account and be logged in to view this forum</h5>
    <br /><br />
    <a class="button" @click.prevent="showLogin = true">Login</a>
  </div>
  <login-modal :show="showLogin" @close="router.push('/')"></login-modal>
</template>

<script>
import LoginModal from '@/components/modals/auth/Login.vue'
import {ref} from 'vue'
import { useRouter } from 'vue-router'

export default {
  components: { LoginModal },
  setup() { return { showLogin: ref(false), router: useRouter() } }
}
</script>

<style lang="scss">
  .forbidden main #public-content { grid-template-areas: 'header header' 'main main' 'main main'; }
</style>
