<template>
  <!-- use the modal component, pass in the prop -->
  <modal :name="$options.name" :show="show" @close="this.$emit('close')">
    <!--
      you can use custom content here to overwrite
      default content
    -->
    <template v-slot:header>
      <h3>Login</h3>
    </template>

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
      <button>Login</button>
      <button @click="this.$emit('close')">Cancel</button>
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
