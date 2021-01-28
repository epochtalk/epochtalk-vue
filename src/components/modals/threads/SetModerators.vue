<template>
  <modal :name="$options.name" :show="show" @close="close()">
    <template v-slot:header>Set Moderators for {{boardName}}</template>

    <template v-slot:body>
      {{moderators}}
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
  props: ['show', 'board'],
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
      boardName: props.board.name,
      moderators: props.board.moderators,
      modTagsInput: {
        mode: 'tags',
        value: [],
        placeholder: 'Type username of moderator(s) to add',
        noOptionsText: 'Enter a username to start lookup',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        maxHeight: 100,
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
<style lang="scss">
.multiselect-tag { background: $color-primary; }
.multiselect-tag i:before { color: $color-primary-alt; }
.multiselect-options { overflow-x: hidden; }
</style>
