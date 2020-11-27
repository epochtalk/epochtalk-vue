<template>
  <modal :name="$options.name" :show="show" @close="this.$emit('close')">
    <template v-slot:header>Register</template>

    <template v-slot:body>
      <label>
        Username
        <input type="text" />
      </label>

      <label>
        Password
        <input type="password" />
      </label>

      <button class="fill">Sign Up</button>
      &nbsp;
      <button class="fill" @click="this.$emit('close')">Cancel</button>
    </template>
  </modal>
</template>

<script>
  import Modal from "@/components/layout/Modal.vue";

  export default {
    name: 'register-modal',
    props: ['show'],
    emits: ['close'],
    components: { Modal }
  }
</script>
