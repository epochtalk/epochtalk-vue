<template>
  <div id="ignored-users-posts-settings" class="settings-section">
    <h3 class="thin-underline">Ignored Users Posts</h3>


  </div>
</template>

<script>
import { reactive, inject, onBeforeMount, toRefs } from 'vue'
import { threadsApi } from '@/api'

export default {
  name: 'ignored-users-posts',
  setup() {
    onBeforeMount(() => v.ignored = [])
    /* View Methods */
    const ignoreUser = () => console.log('Ignored Users Posts')

    // const $alertStore = inject('$alertStore')

    const v = reactive({ ignored: [] })

    return { ignoreUser, ...toRefs(v) }
  }
}
</script>
