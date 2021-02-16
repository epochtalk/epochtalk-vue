<template>
  <div id="pagination">
    <h3 class="panel-title">Pagination</h3>
    <form action="." class="css-form" novalidate>
      <!-- Preferences Fields -->
      <label>Posts Per Page <small>(Min: 10, Max: 100)</small>
        <input type="number" name="posts_per_page" v-model="posts_per_page" placeholder="25" min="10" step="1" max="100" auto-focus="$parent.focus"/>
      </label>
      <label>Threads Per Page <small>(Min: 10, Max: 100)</small>
        <input type="number" name="threads_per_page" v-model="threads_per_page" placeholder="25" min="10" step="1" max="100"/>
      </label>

      <!-- Save Button -->
      <div class="action-bar-panel">
        <button class="outline" @click.prevent="resetPrefrences()">Reset</button>
        <button class="" @click.prevent="savePreferences()">Save</button>
      </div>
    </form>
  </div>
</template>

<script>
import { inject, reactive, toRefs } from 'vue'
// import { AuthStore } from '@/composables/stores/auth'
import { PreferencesStore } from '@/composables/stores/prefs'

export default {
  name: 'Settings',
  setup() {
    /* View Methods */
    const resetPrefrences = () => console.log('resetPrefrences')
    const savePreferences = () => console.log('savePreferences')

    /* Internal Data */
    // const $auth = inject(AuthStore)
    const $prefs = inject(PreferencesStore)

    const v = reactive({
      posts_per_page: $prefs.data.posts_per_page,
      threads_per_page: $prefs.data.threads_per_page
    })
    return { ...toRefs(v), resetPrefrences, savePreferences }
  }
}
</script>

<style lang="scss">
.css-form {
  label {
    height: auto;
    padding-right: 0;
    input { margin-bottom: 0; }
  }
}
</style>
