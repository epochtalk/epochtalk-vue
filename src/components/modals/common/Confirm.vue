<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      {{modalTitle}}
    </template>

    <template v-slot:body>
        <form class="css-form">
          <div class="col input-spacing">
            {{modalDescription}}
          </div>

          <div class="col">
            <div>
              <button ref="focusInput" class="fill-row" @click.prevent="confirmed()">Confirm</button>
            </div>
            <div>
              <button class="fill-row negative" @click.prevent="close()">Cancel</button>
            </div>
          </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs } from 'vue'
export default {
  name: 'confirm-modal',
  props: ['show', 'modalTitle', 'modalDescription'],
  emits: ['close', 'confirmed'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const close = () => emit('close')

    const confirmed = () => {
      close()
      emit('confirmed')
    }
    /* Template Data */
    const v = reactive({ focusInput: null })

    return { ...toRefs(v), confirmed, close }
  }
}
</script>

<style lang="scss">
  .input-spacing { margin-bottom: 1rem; }
  .col {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    width: 100%;
    column-gap: 0.5rem;
    div {
      flex: 1;
      button { width: 100%; }
    }
    &.wildcard input { flex: 1; text-align: center; }
  }
</style>
