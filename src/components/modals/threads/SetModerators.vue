<template>
  <modal :name="$options.name" :show="show" @close="close()">
    <template v-slot:header>Set Moderators for {{boardName}}</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <div class="input-section">
          <label for="mods-to-add">Moderators</label>
          <br>
          <Multiselect v-model="modTagsInput.value" v-bind="modTagsInput" />
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
import { reactive, toRefs, inject } from 'vue'
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
    const $axios = inject('$axios')

    /* Template Data */
    // const initMods = []

    const v = reactive({
      boardName: props.boardName,
      modTagsInput: {
        mode: 'tags',
        value: [],
        placeholder: 'Choose your stack',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        options: async q => {
          return await $axios.get('/api/users/search?username=' + q)
          .then(res => res.status === 200 ? res.data : res)
          .then(d => d.reduce((o, k) => (o[k] = k, o), {}))
        }
      }
    })

    return { ...toRefs(v), setModerators, close }
  }
}
</script>

<style src="@vueform/multiselect/themes/default.css"></style>
