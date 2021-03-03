<template>
  <div class="main">
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
          <button class="outline" @click.prevent="resetLimitPrefs()">Reset</button>
          <button class="" @click.prevent="saveLimitPrefs()">Save</button>
        </div>
      </form>
    </div>
    <div>
      <h3 class="panel-title">Timezone Offset</h3>
      <div class="fieldgroup">
        <select v-model="timezone_offset_sign">
          <option v-for="offset_sign in timezone_offset_sign_options" :key="offset_sign.value" :value="offset_sign.value" :selected="timezone_offset_sign === offset_sign.value">
            {{offset_sign.label}}
          </option>
        </select>
        <select v-model="timezone_offset_hours">
          <option v-for="offset_hours in timezone_offset_hours_options" :key="offset_hours.value" :value="offset_hours.value">
            {{offset_hours.label}}
          </option>
        </select>
        <select v-model="timezone_offset_minutes">
          <option v-for="offset_minutes in timezone_offset_minutes_options" :key="offset_minutes.value" :value="offset_minutes.value" :disabled="offset_minutes.disabled">
            {{offset_minutes.label}}
          </option>
        </select>
      </div>
      <br />

      <div class="action-bar-panel">
        <button class="outline" @click.prevent="resetTimezonePrefs()">
          Reset
        </button>
        <button @click="saveTimezonePrefs()" :disabled="!timezonePrefsValid()">
          Save
        </button>
      </div>
    </div>
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
    const resetLimitPrefs = () => {
      v.posts_per_page = $prefs.readonly.posts_per_page
      v.threads_per_page = $prefs.readonly.threads_per_page
    }
    const saveLimitPrefs = () => {
      const updatedLimits = {
        posts_per_page: Number(v.posts_per_page),
        threads_per_page: Number(v.threads_per_page)
      }
      $prefs.update(updatedLimits)
    }
    const resetTimezonePrefs = () => console.log('resetTimezonePrefs')
    const saveTimezonePrefs = () => console.log('saveTimezonePrefs')
    const timezonePrefsValid = () => true


    /* Internal Data */
    // const $auth = inject(AuthStore)
    const $prefs = inject(PreferencesStore)
    // const prefsCopy = cloneDeep($prefs.readonly)

    const v = reactive({
      posts_per_page: $prefs.readonly.posts_per_page,
      threads_per_page: $prefs.readonly.threads_per_page,
      timezone_offset_sign: $prefs.readonly.timezone_offset.sign,
      timezone_offset_hours: $prefs.readonly.timezone_offset.hours,
      timezone_offset_minutes: $prefs.readonly.timezone_offset.minutes,
      timezone_offset_sign_options: [
        { value: '', label: '+/-' },
        { value: '+', label: '+' },
        { value: '-', label: '-' }
      ],
      timezone_offset_hours_options: [
        { value: '', label: 'HH' },
        { value: '00', label: '00' },
        { value: '01', label: '01' },
        { value: '02', label: '02' },
        { value: '03', label: '03' },
        { value: '04', label: '04' },
        { value: '05', label: '05' },
        { value: '06', label: '06' },
        { value: '07', label: '07' },
        { value: '08', label: '08' },
        { value: '09', label: '09' },
        { value: '10', label: '10' },
        { value: '11', label: '11' },
        { value: '12', label: '12' },
        { value: '13', label: '13' },
        { value: '14', label: '14' }
      ],
      timezone_offset_minutes_options: [
        { value: '', label: 'MM'},
        { value: '00', label: '00' },
        { value: '15', label: '15' },
        { value: '30', label: '30' },
        { value: '45', label: '45' }
      ]
    })
    return { ...toRefs(v), resetLimitPrefs, saveLimitPrefs, resetTimezonePrefs, saveTimezonePrefs, timezonePrefsValid }
  }
}
</script>

<style lang="scss">
.settings main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }

.css-form {
  label {
    height: auto;
    padding-right: 0;
    input { margin-bottom: 0; }
  }
}
</style>
