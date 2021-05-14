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
    <thread-notifications />
    <div id="ignore-boards" class="settings-section">
      <h3 class="thin-underline">Ignore Boards</h3>
      <div class="clear boards-check-list">
        <div v-for="cat in boards" :key="cat.id">
          <label v-if="cat.boards.length" class="bold">{{cat.name}}</label>
          <ul>
            <li v-for="board in cat.boards" :key="board.id">
              <ignored-boards-partial @toggle-ignored-board="toggleIgnoredBoard" :current-board="board" :checked-inputs="checkedBoardInputs" :disabled-inputs="disabledBoardInputs" />
            </li>
          </ul>
        </div>
      </div>
    </div>
    <ignored-settings />
  </div>
</template>

<script>
import { inject, reactive, toRefs, watch } from 'vue'
import { PreferencesStore } from '@/composables/stores/prefs'
import IgnoredBoardsPartial from '@/components/settings/IgnoredBoardsPartial.vue'
import IgnoredSettings from '@/components/settings/IgnoredSettings.vue'
import ThreadNotifications from '@/components/settings/ThreadNotifications.vue'
import { usersApi, messagesApi, mentionsApi, boardsApi } from '@/api'

export default {
  name: 'Settings',
  components: { IgnoredBoardsPartial, ThreadNotifications, IgnoredSettings },
  beforeRouteEnter(to, from, next) {
    next(vm => boardsApi.getBoards(true).then(d => vm.boards = d.boards).catch(() => {}))
  },
  beforeRouteUpdate(to, from, next) {
    boardsApi.getBoards(true).then(d => this.boards = d.boards).catch(() => {})
    next()
  },
  setup() {
    /* Internal Methods */
    const initCheckedBoardInputs = (boards, checkedBoardInputs) => {
      if (!boards || !boards.length) return checkedBoardInputs
      for (let i = 0; i < boards.length; i++) {
        let curBoard = boards[i]
        checkedBoardInputs = initCheckedBoardInputs(curBoard.boards || curBoard.children || [], checkedBoardInputs)
        if (curBoard.category_id || curBoard.parent_id) {
          checkedBoardInputs[curBoard.id] = $prefs.readonly.ignored_boards.indexOf(curBoard.id) > -1
        }
      }
      return checkedBoardInputs
    }

    /* View Methods */
    const resetLimitPrefs = () => {
      v.posts_per_page = $prefs.readonly.posts_per_page
      v.threads_per_page = $prefs.readonly.threads_per_page
      $alertStore.info('Reset limit preferences.')
    }
    const saveLimitPrefs = () => {
      const updatedLimits = {
        posts_per_page: Number(v.posts_per_page),
        threads_per_page: Number(v.threads_per_page)
      }
      $prefs.update(updatedLimits)
      .then(() => $alertStore.success('Successfully updated limit preferences.'))
    }

    const resetTimezonePrefs = () => {
      v.timezone_offset_sign = $prefs.readonly.timezone_offset.sign
      v.timezone_offset_hours = $prefs.readonly.timezone_offset.hours
      v.timezone_offset_minutes = $prefs.readonly.timezone_offset.minutes
      $alertStore.info('Reset timezone preferences.')
    }
    const saveTimezonePrefs = () => {
      const updatedTimezone = {
        timezone_offset: v.timezone_offset_sign +  v.timezone_offset_hours + v.timezone_offset_minutes
      }
      $prefs.update(updatedTimezone)
      .then(() => $alertStore.success('Successfully updated timezone preferences.'))
    }
    const timezonePrefsValid = () => {
      const sign = v.timezone_offset_sign
      const hours = v.timezone_offset_hours
      const mins = v.timezone_offset_minutes
      return (sign && hours && mins) || (!sign && !hours && !mins) // all or none set
    }

    const togglePatroller = () => $prefs.update({ patroller_view: !v.patroller_view })
      .then(() => $alertStore.success('Successfully updated patroller view preferences.'))

    const toggleIgnoredBoard = boardId => {
      const index = $prefs.readonly.ignored_boards.indexOf(boardId)
      let ignoredBoards = [...$prefs.readonly.ignored_boards]
      v.disabledBoardInputs[boardId] = true
      if (index > -1) { ignoredBoards.splice(index, 1) }
      else { ignoredBoards.push(boardId) }
      return $prefs.update({ ignored_boards: ignoredBoards })
      .catch(() => $alertStore.error('Ignored boards could not be updated, try again later.'))
      .finally(() => v.disabledBoardInputs[boardId] = false)
    }

    /* Internal Data */
    // const $auth = inject(AuthStore)
    const $prefs = inject(PreferencesStore)
    const $alertStore = inject('$alertStore')

    const v = reactive({
      boards: [],
      checkedBoardInputs: {},
      disabledBoardInputs: {},
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

    watch(() => v.boards, () => v.checkedBoardInputs = initCheckedBoardInputs(v.boards, v.checkedBoardInputs))

    return { ...toRefs(v), resetLimitPrefs, saveLimitPrefs, resetTimezonePrefs, saveTimezonePrefs, timezonePrefsValid, togglePatroller, toggleIgnoredBoard, usersApi, messagesApi, mentionsApi }
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

.boards-check-list {
  @include pad(0.5rem);
  margin-top: 0.25rem;
  margin-bottom: 1rem;
  max-height: 18.75rem;
  overflow-y: scroll;
  background-color: $sub-header-color;
  border: 1px solid $border-color;
  li {
    list-style: none;
    input {
      margin-bottom: 0;
      & + label { margin: 0 0 0 .2rem; display: inline; padding-bottom: 0; }
      &:disabled + label { color: $secondary-font-color; }
    }
    ul { margin-left: 1.25rem; }
  }
}
</style>
