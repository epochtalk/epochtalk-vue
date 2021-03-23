<template>
  <div v-if="pageCount > 1" class="pagination-component">
    <label class="page-label">Page 1</label>
    <div class="range-wrap">
      <input v-model="currentPage" ref="rangeInput" class="pagination" type="range" step="0.01" min="1" :max="pageCount" @change="smoothThumbDrag" @input="updatePageDisplay" />
      <div class="range-value" ref="valueBubble">Page {{currentPageDisplay}} of {{pageCount}}</div>
    </div>
    <label class="page-label">Page {{pageCount}}</label>
  </div>
</template>

<script>
import { computed, reactive, toRefs, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  props: ['page', 'limit', 'count'],
  setup(props) {
    /* View Methods */
    const smoothThumbDrag = e => {
      v.currentPage = Math.round(e.target.value) // Round up since were using step = 0.01

      updatePageDisplay(e, v.currentPage)
      const params = { ...$route.params, saveScrollPos: true }
      let query = { ...$route.query, page: v.currentPage }
      if (query.page === 1 || !query.page) delete query.page
      if (props.page !== v.currentPage) {
        $router.replace({ name: $route.name, params: params, query: query })
      }
    }

    const updatePageDisplay = (e, value) => {
      if (v.pageCount < 2) return
      const range = e.target || e // account for passing in ref in nextTick
      value = value || range.value // account for passing in custom page
      const newVal = Number((value - range.min) * 100 / (range.max - range.min))
      const newPos = 10 - (newVal * 0.625)
      v.valueBubble.style.top = `calc(${newVal}% + (${newPos}px))`
    }

    /* Internal Data */
    const $route = useRoute()
    const $router = useRouter()

    /* View Data */
    const v = reactive({
      rangeInput: null,
      valueBubble: null,
      currentPage: props.page,
      pageCount: computed(() => Math.ceil(props.count / props.limit)),
      currentPageDisplay: computed(() => Math.round(v.currentPage))
    })

    /* Next Tick - waits for dom to load so refs are populated */
    nextTick(() => updatePageDisplay(v.rangeInput, v.currentPage)) // set init pos of page disp
    watch(() => props.page, () => v.currentPage = props.page )

    return { ...toRefs(v), smoothThumbDrag, updatePageDisplay }
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

  div.range-wrap {
    position: relative;
    height: 45vh;
    padding-left: 0.625rem;
    input.pagination {
      transform: rotate(90deg);
      transform-origin: left;
      height: 1rem;
      width: 43vh;
    }
    .range-value {
      position: absolute;
      font-weight: bold;
      font-size: 0.8125rem;
      margin-top: 0.625rem;
      margin-left: 0.75rem;
      top: 0.625rem;
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
    border-radius: 3.125rem;
  }
  input[type=range]::-ms-thumb {
    width: 2.6875rem;
    height: 0.3125rem;
    background: $color-primary;
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
