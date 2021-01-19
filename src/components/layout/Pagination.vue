<template>
  <div class="pagination-wrap">
    <input class="pagination" type="range" />
  </div>
</template>

<script>
// import { inject } from 'vue'
// import truncate from '@/composables/filters/truncate'

export default {
  setup() {

    return { }
  }
}
</script>

<style lang="scss">
.pagination-wrap {
  display: flex;
  flex-direction: column;
  height: 45vh;

  input[type=range] {
    margin: 1.85px 0;
    background-color: transparent;
    -webkit-appearance: none;
    color: red;
  }
  input[type=range]:focus {
    outline: none;
  }
  input[type=range]::-webkit-slider-runnable-track {
    background: $border-color;
    border: 0px solid $border-color;
    border: 0;
    border-radius: 25px;
    width: 100%;
    height: 1.3px;
    cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    margin-top: -1.85px;
    width: 43px;
    height: 5px;
    background: $color-primary;
    border: 0px solid $border-color;
    border: 0;
    border-radius: 50px;
    cursor: pointer;
    -webkit-appearance: none;
  }
  input[type=range]:focus::-webkit-slider-runnable-track {
    background: $border-color;
  }
  input[type=range]::-moz-range-track {
    background: $border-color;
    border: 0px solid $border-color;
    border: 0;
    border-radius: 25px;
    width: 100%;
    height: 1.3px;
    cursor: pointer;
  }
  input[type=range]::-moz-range-thumb {
    width: 43px;
    height: 5px;
    background: $color-primary;
    border: 0px solid $border-color;
    border: 0;
    border-radius: 50px;
    cursor: pointer;
  }
  input[type=range]::-ms-track {
    background: transparent;
    border-color: transparent;
    border-width: 1.85px 0;
    color: transparent;
    width: 100%;
    height: 1.3px;
    cursor: pointer;
  }
  input[type=range]::-ms-fill-lower {
    background: $border-color;
    border: 0px solid $border-color;
    border: 0;
    border-radius: 50px;
  }
  input[type=range]::-ms-fill-upper {
    background: $border-color;
    border: 0px solid $border-color;
    border: 0;
    border-radius: 50px;
  }
  input[type=range]::-ms-thumb {
    width: 43px;
    height: 5px;
    background: $color-primary;
    border: 0;
    border-radius: 50px;
    cursor: pointer;
    margin-top: 0px;
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

  input.pagination {
    transform: rotate(90deg);
    transform-origin: left;
    width: 100%;
  }
}
</style>
