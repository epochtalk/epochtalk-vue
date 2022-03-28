<template>
  <div class="legal-container" v-if="legal">
    <!-- Legal Text -->
    <h5 class="thin-underline">Terms of Service
      <span class="info-tooltip" data-balloon="Allows editing of the html that will be displayed on the Terms of Service page" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>
    <textarea v-model="legal.tos"></textarea>
    <br />

    <h5 class="thin-underline">Privacy Policy
      <span class="info-tooltip" data-balloon="Allows editing of the html that will be displayed on the Privacy Policy page" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>
    <textarea v-model="legal.privacy"></textarea>
    <br />

    <h5 class="thin-underline">Disclaimers
      <span class="info-tooltip" data-balloon="Allows editing of the html that will be displayed on the Disclaimers page" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>
    <textarea v-model="legal.disclaimer"></textarea>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted, inject } from 'vue'
import { legalApi } from '@/api'
import EventBus from '@/composables/services/event-bus'
import { cloneDeep } from 'lodash'

export default {
  name: 'LegalSettings',
  beforeRouteEnter(to, from, next) {
    legalApi.get().then(data => next(vm => {
      vm.legal = data
      vm.originalLegal = cloneDeep(data)
    }))
  },
  beforeRouteUpdate(to, from, next) {
    legalApi.get().then(data => {
      this.legal = data
      this.originalLegal = cloneDeep(data)
      next()
    })
  },
  setup() {
    const saveListener = () => {
      legalApi.save(v.legal)
      .then(() => $alertStore.success('Successfully updated legal settings!'))
      .catch(() => $alertStore.error('Error saving legal settings'))
    }
    const resetListener = () => v.legal = cloneDeep(v.originalLegal)

    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })

    const $alertStore = inject('$alertStore')

    const v = reactive({
      originalLegal: null,
      legal: null
    })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">
  .legal-container {
    grid-column: 1 / 3;
    textarea { height: 12rem; }
  }
</style>
