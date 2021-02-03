<template>
  <teleport to="#modals">
    <transition name="modal">
      <div v-if="open" :id="name" class="modal-mask">
        <div class="modal-wrapper" @click="closeFromWrapper">
          <div class="modal-container">
            <div class="modal-close" @click="this.$emit('close')">
              <svg enable-background="new 0 0 16 16" viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
                <path clip-rule="evenodd" d="m12.7 5.2-1.2-1.2-3.1 3.2-3.2-3.2-1.2 1.2 3.2 3.2-3.2 3.1 1.2 1.2 3.2-3.2 3.1 3.2 1.2-1.2-3.2-3.1z" fill-rule="evenodd"></path>
              </svg>
            </div>

            <h1 class="modal-header">
              <slot name="header">
                Title Goes Here
              </slot>
            </h1>

            <div class="modal-body">
              <slot name="body">
                Modal body goes here
                <br><br>
                <button class="fill" @click="this.$emit('close')">
                  Close
                </button>
                <div class="secondary-actions">Optional secondary content</div>
              </slot>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { ref, watch, nextTick } from 'vue'

export default {
  props: ['name', 'show', 'focusInput'],
  emits: ['close'],
  setup(props, { emit }) {
    /* Internal Methods */
    const toggle = () => {
      // Show for first time
      if (props.show && !open.value) {
        open.value = true
        nextTick(() => { if (props.focusInput) props.focusInput.focus() })
      }
      // Hide for first time, emit event to parent
      else if (props.show && open.value) { emit('close') }
      // Watch will retrigger because of emit close and set open to false
      else if (!props.show && open.value) { open.value = false }
    }

    /* Template Methods */
    const closeFromWrapper = e => {
      // Allows us to close via the wrapper, without closing when clicking on modal body
      if (e.target.classList.contains('modal-wrapper')) { emit('close') }
    }

    /* Template Data */
    const open = ref(false)

    /* Watch Data */
    watch(() => props.show, toggle)

    return { open, closeFromWrapper }
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
  transition: transform .2s ease;
}

.modal-container {
  border-radius: 8px;
  left: 0;
  right: 0;
  top: 10vh;
  margin: 0 auto;
  padding: 1rem;
  position: fixed;
  z-index: 10000;
  background-color: $base-background-color;
  box-shadow: 4px 4px 80px #000;
  overflow-y: auto;
  max-height: 80vh;
  max-width: 600px;
  width: 50vw;

  .modal-close {
    position: absolute;
    top: 0.75rem;
    right: 1rem;
    color: $secondary-font-color-light;
    cursor: pointer;
    svg {
        width: 1rem;
        height: 100%;
        fill: #8c8c96;
    }
  }

  .modal-header {
    line-height: 2.5rem;
    border-bottom: $border;
    color: $secondary-font-color;
    font-size: $font-size-sm;
    font-weight: normal;
    margin: -1rem -1rem 0;
    padding-left: 1rem;
    text-transform: uppercase;

    @include break-mobile-sm {
      padding-left: 1rem;
    }
  }

  .modal-body {
    padding: 1rem;

    .secondary-actions {
      border-top: $border;
      margin: 0 -3rem -3rem;
      margin-top: 2rem;
      padding: 1rem;
      text-align: center;
    }

    @include break-mobile-sm {
      padding: 1rem 0 2rem;
    }
  }

  .modal-actions {
    margin-top: 2rem;

    button {
      width: 100%
    }
  }

  .modal-actions-sso-google {
    text-align: center;

    button {
      background: #fff;
      border: $border;
      color: rgba(0, 0, 0, 0.54);

      svg {
        margin-right: 1.5rem;
      }
    }

    .separator-text {
      color: $secondary-font-color;
      display: block;
      font-size: $font-size-sm;
      padding: 1rem 0;
    }
  }

  @include break-mobile-sm { top: 5vh; max-height: 90vh; width: 90vw; }
}
</style>
