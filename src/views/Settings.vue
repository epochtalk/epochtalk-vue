<template>
  <div class="main column-grid-50-50">
    <div id="pagination" class="settings-section">
      <h3 class="panel-title">Pagination</h3>
      <!-- Preferences Fields -->
      <div class="split-input-coulmns">
        <label for="posts_per_page">Posts Per Page <small>(Min: 10, Max: 100)</small></label>
        <label for="threads_per_page">Threads Per Page <small>(Min: 10, Max: 100)</small></label>
        <input type="number" id="posts_per_page" name="posts_per_page" v-model="posts_per_page" placeholder="25" min="10" step="1" max="100" auto-focus="$parent.focus"/>
        <input type="number" id="threads_per_page" name="threads_per_page" v-model="threads_per_page" placeholder="25" min="10" step="1" max="100"/>
      </div>

      <div class="action-bar-panel">
        <button class="outline" @click.prevent="resetLimitPrefs()">Reset</button>
        <button class="" @click.prevent="saveLimitPrefs()">Save</button>
      </div>
    </div>
    <div id="patroller" class="settings-section">
      <h3 class="thin-underline">Patroller Settings</h3>

      <div class="toggle-switch-container">
        <div class="">
          <label for="enable-patroller">Patroller Page Enabled</label>
          <label class="desc-label" for="enable-patroller">View link to patroller page in drop down menu. Patroller page allows users to view the latest newbie posts.</label>
        </div>
        <div class="">
          <input id="enable-patroller" class="toggle-switch" type="checkbox" v-model="patroller_view" @click="togglePatroller()">
          <label for="enable-patroller"></label>
        </div>
      </div>
    </div>
    <div id="timezone" class="settings-section">
      <h3 class="panel-title">Timezone Offset</h3>
      <div class="fieldgroup">
        <label>+/-</label>
        <label>Hours</label>
        <label>Minutes</label>
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

    const resetTimezonePrefs = () => {
      v.timezone_offset_sign = $prefs.readonly.timezone_offset.sign
      v.timezone_offset_hours = $prefs.readonly.timezone_offset.hours
      v.timezone_offset_minutes = $prefs.readonly.timezone_offset.minutes
    }
    const saveTimezonePrefs = () => {
      const updatedTimezone = {
        timezone_offset: v.timezone_offset_sign +  v.timezone_offset_hours + v.timezone_offset_minutes
      }
      $prefs.update(updatedTimezone)
    }
    const timezonePrefsValid = () => true

    const togglePatroller = () => $prefs.update({ patroller_view: !v.patroller_view })

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
      patroller_view: $prefs.readonly.patroller_view,
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
    return { ...toRefs(v), resetLimitPrefs, saveLimitPrefs, resetTimezonePrefs, saveTimezonePrefs, timezonePrefsValid, togglePatroller }
  }
}
</script>

<style lang="scss">
.settings main #public-content { grid-template-areas: 'header header' 'main main' 'main main'; }

.css-form {
  label {
    height: auto;
    padding-right: 0;
    input:last-child { margin-bottom: 0; }
  }
}

@include break-mobile-sm {
  .settings-section { padding: 1rem 0; }
  .settings-section:first-child { padding-top: 0; }
}

.split-input-coulmns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: .5rem;
  @include break-mobile-sm {
    grid-template-columns: 1fr;
  }
}
</style>
