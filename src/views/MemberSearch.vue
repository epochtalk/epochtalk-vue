<template>
Member Search
</template>

<script>
import { reactive, toRefs } from 'vue'

export default {
  name: 'About',
  setup() {
    const v = reactive({
      title: window.title,
      description: window.description,
      currentYear: window.currentYear
    })
    return { ...toRefs(v) }
  }
}
</script>

<style scoped lang="scss">

</style>
