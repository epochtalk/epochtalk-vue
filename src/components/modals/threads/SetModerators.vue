<template>
  <modal :name="$options.name" :show="show" @close="close()">
    <template v-slot:header>Set Moderators for {{boardName}}</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <label>Current Moderators of {{boardName}} </label>
        <div v-for="mod in moderators" :key="mod.id" class="multiselect-tag mod-tags">
          {{mod.username}} <i></i>
        </div>
        <label>Moderators to Add</label>
        <Multiselect v-model="modTagsInput.value" v-bind="modTagsInput" />
        <br>
        <label>
          <strong>Note:</strong> Moderator changes will take affect upon clicking save changes.
        </label>
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
          // filter out existing mods
          .then(d => d.filter(u => !v.moderators.find(o => o.username === u)))
          // convert array into array of objects
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
.mod-tags {
  display: inline-flex;
  &.multiselect-tag {
    background: #2299DD;
    i:before { color: $base-background-color; }
  }
}
.multiselect-tag { background: $color-primary; }
.multiselect-tag i:before { color: $color-primary-alt; }
.multiselect-options { overflow-x: hidden; }
</style>
