<template>
  <div class="pagination-component">
    <label class="page-label">Page 1</label>
    <div class="input-wrap">
      <input v-model="currentPage" class="pagination" type="range" step="0.01" min="1" :max="pageCount" @change="smoothThumbDrag" />
    </div>
    <label class="page-label">Page {{pageCount}}</label>
  </div>
</template>

<script>
import { computed, reactive, toRefs } from 'vue'

export default {
  props: ['page', 'limit', 'count'],
  setup(props) {
    const v = reactive({
      currentPage: props.page
    })


    return {
      ...toRefs(v),
      smoothThumbDrag: (e) => v.currentPage = Math.round(e.target.value),
      pageCount: computed(() => Math.ceil(props.count / props.limit))
    }
  }
}
</script>

<style lang="scss">
.pagination-component {
  display: flex;
  flex-flow: row wrap;
  height: 45vh;

  label.page-label {
    display: flex;
    color: $secondary-font-color;
    font-size: 0.8125rem;
    flex: 1 100%;
  }

  div.input-wrap {
    display: flex;
    height: 45vh;
    padding-left: 0.625rem;

    input.pagination {
      transform: rotate(90deg);
      transform-origin: left;
      height: 1rem;
      width: 43vh;
    }
  }

  input[type=range] {
    background-color: transparent;
    -webkit-appearance: none;
    color: red;
  }
  input[type=range]:focus {
    outline: none;
  }
  input[type=range]::-webkit-slider-runnable-track {
    background: $border-color;
    border: 0 solid $border-color;
    border: 0;
    border-radius: 1.5625rem;
    width: 100%;
    height: 0.08125rem;
    cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    margin-top: -0.115625rem;
    width: 2.6875rem;
    height: 0.3125rem;
    background: $color-primary;
    border: 0 solid $border-color;
    border: 0;
    border-radius: 3.125rem;
    cursor: pointer;
    -webkit-appearance: none;
  }
  input[type=range]:focus::-webkit-slider-runnable-track {
    background: $border-color;
  }
  input[type=range]::-moz-range-track {
    background: $border-color;
    border: 0 solid $border-color;
    border: 0;
    border-radius: 1.5625rem;
    width: 100%;
    height: 0.08125rem;
    cursor: pointer;
  }
  input[type=range]::-moz-range-thumb {
    width: 2.6875rem;
    height: 0.3125rem;
    background: $color-primary;
    border: 0 solid $border-color;
    border: 0;
    border-radius: 3.125rem;
    cursor: pointer;
  }
  input[type=range]::-ms-track {
    background: transparent;
    border-color: transparent;
    border-width: 0.115625rem 0;
    color: transparent;
    width: 100%;
    height: 0.08125rem;
    cursor: pointer;
  }
  input[type=range]::-ms-fill-lower {
    background: $border-color;
    border: 0 solid $border-color;
    border: 0;
    border-radius: 3.125rem;
  }
  input[type=range]::-ms-fill-upper {
    background: $border-color;
    border: 0 solid $border-color;
    border: 0;
    border-radius: 3.125rem;
  }
  input[type=range]::-ms-thumb {
    width: 2.6875rem;
    height: 0.3125rem;
    background: $color-primary;
    border: 0;
    border-radius: 3.125rem;
    cursor: pointer;
    margin-top: 0;
    /*Needed to keep the Edge thumb centred*/
  }
  input[type=range]:focus::-ms-fill-lower {
    background: $border-color;
  }
  input[type=range]:focus::-ms-fill-upper {
    background: $border-color;
  }

  /*TODO: Use one of the selectors from https://stackoverflow.com/a/20541859/7077589 and figure out
  how to remove the virtical space around the range input in IE*/
  @supports (-ms-ime-align:auto) {
    /* Pre-Chromium Edge only styles, selector taken from hhttps://stackoverflow.com/a/32202953/7077589 */
    input[type=range] {
      margin: 0;
      /*Edge starts the margin from the thumb, not the track as other browsers do*/
    }
  }
}
</style>
