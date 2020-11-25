<template>
  <modal :name="$options.name" :show="show" @close="this.$emit('close')">
    <template v-slot:header>Login</template>

    <template v-slot:body>
      <label>
        Username
        <input type="text" />
      </label>

      <label>
        Password
        <input type="password" />
      </label>
    </template>

    <template v-slot:footer>
      <button class="fill">Login</button>
      <button class="fill" @click="this.$emit('close')">Cancel</button>
    </template>
  </modal>
</template>

<script>
  import Modal from "@/components/layout/Modal.vue";

  export default {
    name: 'login-modal',
    props: ['show'],
    emits: ['close'],
    components: { Modal }
  }
</script>
