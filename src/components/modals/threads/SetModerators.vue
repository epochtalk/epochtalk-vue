<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Set Moderators for {{boardName}}</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <div class="input-section">
          <label for="mods-to-add">Moderators</label>
          <Multiselect
            v-model="multi.value"
            v-bind="multi"
          ></Multiselect>

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
// import { cloneDeep } from 'lodash'
import { reactive, toRefs } from 'vue'
// import { AuthStore } from '@/composables/stores/auth'
import Multiselect from '@vueform/multiselect'

export default {
  name: 'set-moderators-modal',
  props: ['show', 'boardName'],
  emits: ['close'],
  components: { Modal, Multiselect },
  setup(props, { emit }) {
    /* Template Methods */
    const setModerators = () => {
      console.log('Set Moderators!')
      close()
    }

    const close = () => {
      // v.mods = cloneDeep(initMods)
      emit('close')
    }

    /* Internal Data */
    // const auth = inject(AuthStore)

    /* Template Data */
    // const initMods = []

    const v = reactive({
      boardName: props.boardName,
      focusInput: null,
      multi: {
        mode: 'multiple',
        value: ['robin'],
        options: {
          batman: 'Batman',
          robin: 'Robin',
          joker: 'Joker'
        }
      }
    })

    return { ...toRefs(v), setModerators, close }
  }
}
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
