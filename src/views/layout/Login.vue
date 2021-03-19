<template>
  <div class="login-view">
    <h1 class="view-title">Login to Forum</h1>
    <form action="." class="css-form">
      <div class="input-section">
        <label for="login-user">Username</label>
        <input id="login-user" type="text" class="input-text" placeholder="Enter your username" v-model="user.username" :class="{'invalid': user.username.length < 3 && user.username.length }" ref="focusInput" required />
      </div>
      <div class="input-section">
        <label for="login-pass">Password</label>
        <input id="login-pass" type="password" placeholder="Enter your password" v-model="user.password" :class="{'invalid': user.password.length < 8 && user.password.length }" required />
        <div class="input-info">Minimum 8 characters</div>
      </div>

      <label class="checkbox-container">
        <input type="checkbox" id="remember-me" v-model="user.rememberMe" />
        Remember Me
      </label>
      <br><br>
      <button id="login-btn" class="fill" @click.prevent="login()" type="submit" :disabled="user.username.length < 3 || user.password.length < 8">
        Login
      </button>
      <div v-if="hasGoogleCredentials" class="login-form-actions-sso-google">
        <span class="separator-text">or</span>
        <button class="fill" @click.prevent="signInWithGoogle()">
          <svg height="18" viewBox="0 0 18 18" width="18" xmlns="http://www.w3.org/2000/svg"><g fill="none" fill-rule="evenodd"><path d="m17.64 9.20454545c0-.63818181-.0572727-1.25181818-.1636364-1.84090909h-8.4763636v3.48136364h4.8436364c-.2086364 1.125-.8427273 2.0781818-1.7959091 2.7163636v2.2581819h2.9086363c1.7018182-1.5668182 2.6836364-3.874091 2.6836364-6.61500005z" fill="#4285f4"/><path d="m9 18c2.43 0 4.4672727-.8059091 5.9563636-2.1804545l-2.9086363-2.2581819c-.8059091.54-1.8368182.8590909-3.0477273.8590909-2.34409091 0-4.32818182-1.5831818-5.03590909-3.7104545h-3.00681818v2.3318182c1.48090909 2.9413636 4.52454545 4.9581818 8.04272727 4.9581818z" fill="#34a853"/><path d="m3.96409091 10.71c-.18-.54-.28227273-1.11681818-.28227273-1.71s.10227273-1.17.28227273-1.71v-2.33181818h-3.00681818c-.60954546 1.215-.95727273 2.58954545-.95727273 4.04181818 0 1.4522727.34772727 2.8268182.95727273 4.0418182z" fill="#fbbc05"/><path d="m9 3.57954545c1.3213636 0 2.5077273.45409091 3.4404545 1.3459091l2.5813637-2.58136364c-1.5586364-1.45227273-3.5959091-2.34409091-6.0218182-2.34409091-3.51818182 0-6.56181818 2.01681818-8.04272727 4.95818182l3.00681818 2.33181818c.70772727-2.12727273 2.69181818-3.71045455 5.03590909-3.71045455z" fill="#ea4335"/><path d="m0 0h18v18h-18z"/></g></svg>

          Sign in with Google
        </button>
      </div>
    </form>
    <div class="login-form-dialog-secondary-actions">
      <a href="/recover" target="_blank" rel="noopener noreferrer">Help, I forgot my password!</a>
    </div>
  </div>
</template>

<script>
import { reactive, inject, toRefs, nextTick } from 'vue'
import { AuthStore } from '@/composables/stores/auth'
import { useRouter } from 'vue-router'

export default {
  name: 'Login',
  props: ['redirectTo'],
  setup(props) {
    nextTick(() => v.focusInput.focus())
    /* Template Methods */
    const login = () => {
      $auth.login(v.user.username, v.user.password, v.user.rememberMe)
      .then(() => {
        $router.push( { name: props.redirectTo })
      })
    }

    const signInWithGoogle = () => console.log('Sign in with Google!')


    /* Internal Data */
    const $auth = inject(AuthStore)
    const $router = useRouter()

    /* Template Data */
    const v = reactive({
      user: { username: '', password: '', rememberMe: false },
      hasGoogleCredentials: true,
      focusInput: null
    })

    return { ...toRefs(v), login, signInWithGoogle }
  }
}
</script>

<style lang="scss">
  .login-view {
    max-width: 37.5rem;
    width: calc(100vw - 2rem);
  }

  .login-form-actions {
    margin-top: 2rem;
    button { width: 100%}
  }

  .login-form-actions-sso-google {
    text-align: center;
    button {
      background: #fff;
      border: $border;
      color: rgba(0, 0, 0, 0.54);
      display: flex;
      svg { margin-right: 1.5rem; }
    }
    .separator-text {
      color: $secondary-font-color;
      display: block;
      font-size: $font-size-sm;
      padding: 1rem 0;
    }
  }

  .login-form-dialog-secondary-actions {
    font-size: $font-size-sm;
    margin: 0 -1rem -1rem;
    padding: 1rem;
    text-align: center;
  }
</style>
