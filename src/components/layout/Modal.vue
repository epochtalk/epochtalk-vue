<template>
  <teleport to="#modals">
    <transition name="modal">
      <div v-if="open" :id="name" class="modal-mask">
        <div class="modal-wrapper" @click="closeFromWrapper">
          <div class="modal-container">

            <div class="modal-header">
              <slot name="header">
                default header
              </slot>
            </div>

            <div class="modal-body">
              <slot name="body">
                default body
              </slot>
            </div>

            <div class="modal-footer">
              <slot name="footer">
                <div>default footer</div>
                <button @click="this.$emit('close')">
                  OK
                </button>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
export default {
  props: ['name', 'show'],
  emits: ['close'],
  data() {
    return { open: false  }
  },
  watch: {
    show() { this.toggle() }
  },
  methods: {
    toggle() {
      // Show for first time
      if (this.show && !this.open) { this.open = true  }
      // Hide for first time, emit event to parent
      else if (this.show && this.open) { this.$emit('close') }
      // Watch will retrigger because of emit close and set open to false
      else if (!this.show && this.open) { this.open = false }
    },
    closeFromWrapper(e) {
      // Allows us to close via the wrapper, without closing when clicking on modal body
      if (e.target.classList.contains('modal-wrapper')) { this.$emit('close') }
    }
  }
}
</script>

<style lang="scss">
  .modal-mask {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: table;
  }

  .modal-wrapper {
    display: table-cell;
    vertical-align: middle;
  }

  .modal-container {
    width: 300px;
    margin: 0px auto;
    padding: 20px 30px;
    background-color: #fff;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
    transition: all 0.3s ease;
  }

  .modal-header h3 {
    margin-top: 0;
    color: #42b983;
  }

  .modal-body {
    margin: 20px 0;
  }

  .modal-enter-from, .modal-leave-to {
    opacity: 0;
  }

  .modal-leave-active, .modal-enter-active  {
    transition: opacity .2s ease;
  }

  .modal-enter-from .modal-container,
  .modal-leave-active .modal-container {
    -webkit-transform: scale(1.1);
    transform: scale(1.1);
  }
</style>
