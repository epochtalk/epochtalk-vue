<template>
  <li v-for="user in trustTree" :key="user">
    <span v-if="user.type === 0">{{ user.username_trusted }}</span>
    <span v-if="user.type === 1"><s>{{ user.username_trusted }}</s></span>
    <ul v-if="user.trusted">
      <trust-hierarchy-partial :trust-tree="user.trusted" />
    </ul>
  </li>
</template>

<script>
export default {
  name: 'trust-hierarchy-partial',
  props: ['trustTree'],
  setup() {
    return {}
  }
}
</script>
