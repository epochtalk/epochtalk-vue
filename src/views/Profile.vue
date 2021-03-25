<template>
  <user-posts />
</template>

<script>
import { reactive, toRefs } from 'vue'
import UserPosts from '@/components/users/UserPosts.vue'

export default {
  name: 'Profile',
  components: { UserPosts },
  setup() {
    const v = reactive({
      test: false,
    })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">

</style>
