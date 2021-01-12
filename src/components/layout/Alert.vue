<template>
  <div class="alertService">
    <transition-group name="alert">
      <div class="alert-box" :class="alert.type" v-for="alert in visibleAlerts" :key="alert.id" @click="removeAlert(alert.id)">
        <i v-if="alert.type ==='warning'" class="fas fa-exclamation-circle"></i>
        <i v-if="alert.type ==='info'" class="fas fa-info-circle"></i>
        <i v-if="alert.type ==='success'" class="fas fa-check-circle"></i>
        <i v-if="alert.type ==='error'" class="fas fa-minus-circle"></i>
        {{ alert.message }}
        <a href="" @click.prevent="removeAlert(alert.id)" class="right">&times;</a>
      </div>
    </transition-group>
  </div>
</template>

<script>
import { toRefs, watch, reactive, inject } from 'vue'
import { remove } from 'lodash'

export default {
  setup() {
    /* Internal Methods */
    const addAlert = alert => {
      v.visibleAlerts.unshift(alert)
      setTimeout(() => { removeAlert(alert.id) }, 10000)
    }

    const syncAlerts = () => {
      for (let i = 0; i < v.alerts.length; i++) {
        var temp = v.alerts.shift();
        if (temp) { addAlert(temp); }
      }
    }

    /* Template Methods */
    const removeAlert = id => {
      remove(v.visibleAlerts, alert => alert.id === id)
      syncAlerts()
    }

    /* Internal Data */
    const $alert = inject('$alertStore')

    // setTimeout(() => {
    //   $alert.warning('This is a sample warning alert!')
    //   $alert.success('This is a sample success alert!')
    //   $alert.error('This is a sample error alert!')
    //   $alert.info('This is a sample info alert!')
    // }, 1000)

    /* Template Data */
    const v = reactive({
      alerts: $alert.alerts,
      visibleAlerts: []
    })

    /* Watch Data */
    watch(() => v.alerts, syncAlerts, { deep: true })

    return { ...toRefs(v), removeAlert }
  }
}
</script>

<style lang="scss">
  .alert-enter-from, .alert-leave-to { opacity: 0; }

  .alert-leave-active, .alert-enter-active  { @include transition(0.15s linear all); }

  .alertService {
    width: 100%;
    margin: auto;
    left: 0;
    right: 0;
    z-index: 9000;
    @include border-radius(0 0 4px 4px);
    background-color: $header-dropdown-bg-color;
    max-height: 6.75rem;
    max-width: 1300px;
    overflow: auto;
    position: fixed;

    .is-hidden & { pointer-events: initial; }

    .alert-box {
      display: block;
      padding: 0.5rem 1rem;
      color: #fff;
      &:hover {
        background-color: $header-bg-color;
        cursor: pointer;
      }
      .right { float: right; }
      &:first-child { padding-bottom: 0.5rem; }
      &.warning i { color: #FD8D40; }
      &.info i { color: #49AED0; }
      &.success i { color: #43AC6A; }
      &.error i { color: #E65239; }
      i { padding-right: 0.5rem; }
    }

    @include break-mobile-sm { width: 90%; }
  }
</style>
