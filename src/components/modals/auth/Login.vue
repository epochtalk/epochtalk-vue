<template>
  <modal :name="$options.name" :show="show" @close="this.$emit('close')">
    <template v-slot:header>Login</template>

    <template v-slot:body>
      <form action="." class="css-form" @submit="console.log('submit');">
        <div class="input-section">
          <label for="login-user">Username</label>
          <input id="login-user" type="text" class="input-text" placeholder="Enter your username" v-model="username" :class="{'invalid': username.length < 3 && username.length }" required />
        </div>
        <div class="input-section">
          <label for="login-pass">Password</label>
          <input id="login-pass" type="password" placeholder="Enter your password" v-model="password" :class="{'invalid': password.length < 8 && password.length }" required />
          <div class="input-info">Minimum 8 characters</div>
        </div>

        <label class="checkbox-container">
          <input type="checkbox" id="remember-me" v-model="rememberMe" />
          Remember Me
        </label>
        <br><br>
        <button id="login-btn" class="fill" @click.prevent="login()" type="submit" :disabled="username.length < 3 || password.length < 8">
          Login
        </button>
        <div v-if="hasGoogleCredentials" class="modal-actions-sso-google">
          <span class="separator-text">or</span>
          <button class="fill" @click.prevent="signInWithGoogle()">
            <svg height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="m17.64 9.20454545c0-.63818181-.0572727-1.25181818-.1636364-1.84090909h-8.4763636v3.48136364h4.8436364c-.2086364 1.125-.8427273 2.0781818-1.7959091 2.7163636v2.2581819h2.9086363c1.7018182-1.5668182 2.6836364-3.874091 2.6836364-6.61500005z" fill="#4285f4"/><path d="m9 18c2.43 0 4.4672727-.8059091 5.9563636-2.1804545l-2.9086363-2.2581819c-.8059091.54-1.8368182.8590909-3.0477273.8590909-2.34409091 0-4.32818182-1.5831818-5.03590909-3.7104545h-3.00681818v2.3318182c1.48090909 2.9413636 4.52454545 4.9581818 8.04272727 4.9581818z" fill="#34a853"/><path d="m3.96409091 10.71c-.18-.54-.28227273-1.11681818-.28227273-1.71s.10227273-1.17.28227273-1.71v-2.33181818h-3.00681818c-.60954546 1.215-.95727273 2.58954545-.95727273 4.04181818 0 1.4522727.34772727 2.8268182.95727273 4.0418182z" fill="#fbbc05"/><path d="m9 3.57954545c1.3213636 0 2.5077273.45409091 3.4404545 1.3459091l2.5813637-2.58136364c-1.5586364-1.45227273-3.5959091-2.34409091-6.0218182-2.34409091-3.51818182 0-6.56181818 2.01681818-8.04272727 4.95818182l3.00681818 2.33181818c.70772727-2.12727273 2.69181818-3.71045455 5.03590909-3.71045455z" fill="#ea4335"/><path d="m0 0h18v18h-18z"/></g></svg>

            Sign in with Google
          </button>
        </div>
      </form>
      <div class="secondary-actions">
        <a href="/recover" target="_blank" rel="noopener noreferrer">Help, I forgot my password!</a>
      </div>
    </template>
  </modal>
</template>

<script>
  import store from "../../../store/vuex.js"
  import Modal from "@/components/layout/Modal.vue";
  import { reactive, ref, toRefs } from "vue"

  export default {
    name: 'login-modal',
    props: ['show'],
    emits: ['close'],
    components: { Modal },
    setup(props, { emit }) {
      function login() {
        console.log('Login!', user.username, user.password, user.rememberMe)
        store.dispatch('login', {
          username: user.username,
          password: user.password,
          rememberMe: user.rememberMe
        });
        emit('close')
      }

       function signInWithGoogle() {
        console.log('Sign in with Google!')
        emit('close')
      }

      const user = reactive({ username: '', password: '', rememberMe: false })
      const hasGoogleCredentials = ref(true)
      return { ...toRefs(user), hasGoogleCredentials, login, signInWithGoogle }
    }
  }
</script>
