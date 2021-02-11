<template>
  <h1>{{title}}</h1>
</template>

<script>
import { reactive, toRefs } from 'vue'

export default {
  name: 'Settings',
  setup() {
    const v = reactive({
      title: 'Settings Page'
    })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">
</style>
