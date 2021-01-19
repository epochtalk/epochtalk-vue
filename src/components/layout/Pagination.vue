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

  input.pagination {
    writing-mode: bt-lr; /* IE */
    -webkit-appearance: slider-vertical; /* WebKit */
    width: 1px;
    padding: 0 5px;
    height: 100%;
  }
}
</style>
