<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>
      <span v-if="add">Add Role</span>
      <span v-if="edit">Edit Role</span>
      <span v-if="reset">Reset Role</span>
    </template>

    <template v-slot:body>
        <form class="css-form">
          <div v-if="add || edit" class="col input-spacing">
            <div>
              <label>
                Role Name
                <input type="text" v-model="role.name" placeholder="Role Name" :disabled="requestSubmitted" required />
              </label>
            </div>
          </div>

          <div v-if="reset" class="col input-spacing">
            <div>
              <p>
                Are you sure you want to reset the role named <strong>{{role.name}}</strong>? This will change all permissions for this role back to their Epochtalk defaults.
              </p>
            </div>
          </div>

          <div class="col">
            <div>
              <button class="fill-row" @click.prevent="modifyRole()" :disabled="requestSubmitted" v-html="saveRuleBtnLabel"></button>
            </div>
            <div>
              <button class="fill-row negative" @click.prevent="close()" :disabled="requestSubmitted">Cancel</button>
            </div>
          </div>
      </form>
    </template>
  </modal>
</template>

<script>
import Modal from '@/components/layout/Modal.vue'
import { reactive, toRefs, inject, watch } from 'vue'
// import { adminApi } from '@/api'
import { cloneDeep } from 'lodash'

export default {
  name: 'role-manager-modal',
  props: ['show', 'add', 'edit', 'reset', 'selected'],
  emits: ['close', 'success'],
  components: { Modal },
  setup(props, { emit }) {
    /* Template Methods */
    const resetForm = () => {
      v.requestSubmitted = false
      v.saveRuleBtnLabel = props.reset ? 'Reset' : 'Save'
    }

    const modifyRole = () => {
      v.requestSubmitted = true
      $alertStore.success('Modify Role')
    }

    const close = () => {
      resetForm()
      emit('close')
    }

    /* Internal Data */
    const $alertStore = inject('$alertStore')

    /* Template Data */
    const v = reactive({
      focusInput: null,
      role: {},
      saveRuleBtnLabel: props.reset ? 'Reset' : 'Save',
      requestSubmitted: false,
    })

    watch(() => props.show, () => {
      v.role = cloneDeep(props.selected)
      v.saveRuleBtnLabel = props.reset ? 'Reset' : 'Save'
    })

    return { ...toRefs(v), modifyRole, close }
  }
}
</script>

<style lang="scss" scoped>

</style>
