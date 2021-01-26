<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Set Moderators</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <div class="input-section">
          <label for="mods-to-add">Moderators</label>
          <input id="mods-to-add" type="text" class="input-text" placeholder="Enter moderator username" v-model="mods" ref="focusInput" required />
        </div>
        <br><br>
        <button class="fill" @click.prevent="setModerators()" type="submit" :disabled="false">
          Set Moderators
        </button>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { cloneDeep } from 'lodash'
import { reactive, toRefs } from 'vue'
// import { AuthStore } from '@/composables/stores/auth'

export default {
  name: 'set-moderators-modal',
  props: ['show'],
  emits: ['close'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const setModerators = () => {
      console.log('Set Moderators!')
      close()
    }

    const close = () => {
      v.mods = cloneDeep(initMods)
      emit('close')
    }

    /* Internal Data */
    // const auth = inject(AuthStore)

    /* Template Data */
    const initMods = []

    const v = reactive({
      mods: cloneDeep(initMods),
      focusInput: null
    })

    return { ...toRefs(v), setModerators, close }
  }
}
</script>
