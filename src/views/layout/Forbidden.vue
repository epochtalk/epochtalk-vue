<template>
  <div class="main" id="http-error">
    <div class="message">This forum is Private</div>
    <h5 v-if="!loggedIn">You must have an account and be logged in to view this forum.</h5>
    <h5 v-if="loggedIn">You do not have the proper permissions to view this portion of the forum.</h5>
    <br /><br />
    <a class="button" v-if="!loggedIn" @click.prevent="showLogin = true">Login</a>
    <router-link v-if="loggedIn" class="button" to="/">Home</router-link>
  </div>
  <login-modal :show="showLogin" @close="showLogin = false"></login-modal>
</template>

<script>
import LoginModal from '@/components/modals/auth/Login.vue'
import { reactive, toRefs, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { AuthStore } from '@/composables/stores/auth'

export default {
  components: { LoginModal },
  props: ['redirectName', 'redirectParams', 'redirectQuery'],
  setup(props) {
    const redirect = () => {
      if (props.redirectName) { // props are present, router redirect
        $router.push({
          name: props.redirectName,
          params: JSON.parse(props.redirectParams), // Cannot pass as obj, gets converted to str
          query: JSON.parse(props.redirectQuery)
        })
      }
      // props not present use redirect query or redirect home
      else $router.push($route.query.redirect || '/')
    }

    const $auth = inject(AuthStore)
    const $router = useRouter()
    const $route = useRoute()

    const v = reactive({
      showLogin: false,
      loggedIn: $auth.loggedIn
    })

    watch(() => v.loggedIn, loggedIn => loggedIn ? redirect() : null)

    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">
  .forbidden main #public-content { grid-template-areas: 'header header' 'main main' 'main main'; }
</style>
