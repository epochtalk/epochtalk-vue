<template>
  <div v-if="pageCount > 1" class="pagination-component">
    <ul class="pagination no-select">
      <li class="jump">
        <span @click="toggleJump()">GOTO</span>
        <div class="jump-tooltip" v-if="showJump">
          <div class="jump-to-page">
           <input v-model="currentPage" type="number" min="1" :max="pageCount" @keyup="$event.which === 13 && changePage(currentPage)" ref="pageInput" @focus="$event.target.select()" />
           <button @click="changePage(currentPage)">Go</button>
         </div>
        </div>
      </li>
      <span v-for="pageKey in paginationKeys" :key="pageKey.val">
        <li :class="pageKey.class">
          <a href="#" @click.stop.prevent="changePage(pageKey.page)" v-html="pageKey.val"></a>
        </li>
      </span>
    </ul>
  </div>
</template>

<script>
import { computed, reactive, toRefs, nextTick, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  props: ['page', 'limit', 'count'],
  setup(props) {
    /* View Methods */
    const changePage = page => {
      // do nothing if no page is specified, or if page is out of range
      if (!page || page > v.pageCount || page < 1) return

      // update current page var
      v.currentPage = page

      // redirect while saving query params
      const params = { ...$route.params }
      let query = { ...$route.query, page: v.currentPage }
      if (query.page === 1 || !query.page) delete query.page
      if (query.start) delete query.start
      if (props.page !== v.currentPage) {
        $router.replace({ name: $route.name, params: params, query: query })
      }
    }

    const toggleJump = () => {
      v.showJump = !v.showJump
      if (v.showJump) nextTick(() => v.pageInput.focus())
    }

    const buildPages = () => {
      // reset pagination keys
      v.paginationKeys = []

      // close jump to page widget
      if (v.showJump) v.showJump = false

      // truncate if more than 15 pages
      let truncate = v.pageCount > 15

      // variable to hold ellipsis positions
      let ellipsis

      // Case 1: No Truncation up to 15 pages
      // [1] 2 3 4 5 6 7 8 9 10 11 13 14 15
      if (!truncate)
        ellipsis = undefined

      // Case 2: Truncate Tail
      // 1 2 3 4 5 [6] 7 8 ... 14 15 16
      if (truncate && v.currentPage <= 6)
        ellipsis = [{ index: 9, nextIndex: v.pageCount - 2 }]

      // Case 3: Truncate Head
      // 1 2 3 ... 9 10 [11] 12 13 14 15 16
      else if (truncate && v.currentPage >= v.pageCount - 5)
        ellipsis = [{ index: 4, nextIndex: v.pageCount - 8 }]

      // Case 4: Truncate Head and Tail
      // 1 2 3 ... 7 8 [9] 10 11 ... 14 15 16
      else if (truncate && v.currentPage > 6 && v.currentPage < v.pageCount - 5)
        ellipsis = [
          { index: 4, nextIndex: v.currentPage - 2 },
          { index: v.currentPage + 3, nextIndex: v.pageCount - 2 }
        ]

      generatePageKeys(ellipsis)
    }

    const generatePageKeys = (ellipsis) => {
      // Add Previous Button
      let prevBtnKey = { val: '&#10094;' }
      if (v.currentPage > 1) {
        prevBtnKey.class = 'arrow'
        prevBtnKey.page = v.currentPage - 1
        v.paginationKeys.push(prevBtnKey)
      }
      else {
        prevBtnKey.class = 'arrow unavailable'
        prevBtnKey.page = null
        v.paginationKeys.push(prevBtnKey)
      }

      // Add Pagination Keys accounting for ellipsis
      let ellipsisIndex = 0
      let index = 1
      while (index <= v.pageCount) {
        let pageKey
        // Insert ellipsis if index matches
        if (ellipsis && ellipsis[ellipsisIndex] && ellipsis[ellipsisIndex].index === index) {
          pageKey = {
            val: '&hellip;',
            page: null,
            class: 'unavailable'
          }
          index = ellipsis[ellipsisIndex].nextIndex
          ellipsisIndex++
        }
        // Otherwise generate page key
        else {
          pageKey = {
            val: index,
            page: index,
            class: index === v.currentPage ? 'current' : null
          }
          index++
        }
        v.paginationKeys.push(pageKey)
      }

      // Add Next Button
      let nextBtnKey = { val: '&#10095;' }
      if (v.currentPage < v.pageCount) {
        nextBtnKey.class = 'arrow'
        nextBtnKey.page = v.currentPage + 1
        v.paginationKeys.push(nextBtnKey)
      }
      else {
        nextBtnKey.class = 'arrow unavailable'
        nextBtnKey.page = null
        v.paginationKeys.push(nextBtnKey)
      }
    }

    /* Internal Data */
    const $route = useRoute()
    const $router = useRouter()

    /* View Data */
    const v = reactive({
      showJump: false,
      pageInput: null,
      paginationKeys: [],
      currentPage: props.page,
      pageCount: computed(() => Math.ceil(props.count / props.limit) || 1)
    })

    buildPages()

    /* Watch - this handles when pagination data changes */
    watch(() => props.page, () => reloadPagination())
    watch(() => props.limit, () => reloadPagination())
    watch(() => props.count, () => reloadPagination())

    let reloadPagination = () => {
      v.currentPage = props.page
      buildPages()
    }

    return { ...toRefs(v), changePage, toggleJump }
  }
}
</script>

<style lang="scss">
.actions-bottom ul.pagination li.jump .jump-tooltip,
.mobile-pagination ul.pagination li.jump .jump-tooltip {
  margin-left: -1.5rem;
  margin-top: -.25rem;
}

ul.pagination {
  display: inline-block;
  min-height: 1.3rem;
  li {
    line-height: 1.3rem;
    font-size: 0.875rem;
    margin-left: 0.125rem;
    float: left;
    display: block;
    &.unavailable a:hover { background-color: transparent; }
    &.current a, &.current a:hover { color: $button-text-color; }
    &.arrow { font-family: 'Zapf Dingbats'; }
    a {
      @include transition(background-color 300ms ease-out);
      display: block;
      padding: 0.0325rem 0.325rem 0.0325rem;
      color: $secondary-font-color;
      background: none;
      border-radius: 3px;
      font-weight: normal;
      font-size: 1rem;
      line-height: inherit;
      &:hover { color: $secondary-font-color-dark; background-color: $secondary-font-color-light; }
    }
  }
  li.unavailable a { cursor: default; color: $secondary-font-color; }
  li.current a {
    background: $color-primary;
    &:hover, &:focus { background: $color-primary-alt; }
  }
  li.jump {
    @include transition(background-color 300ms ease-out);
    display: block;
    padding: 0.0325rem 0.325rem 0.0325rem 0;
    color: $secondary-font-color;
    background: none;
    border-radius: 3px;
    font-weight: normal;
    font-size: 0.8rem;
    line-height: inherit;
    cursor: pointer;
    position: relative;
    .jump-tooltip {
      text-align: center;
      color: $secondary-font-color;
      background: $secondary-font-color-light;
      background-clip: padding-box;
      border-radius: 3px;
      position: absolute;
      width: 10rem;
      left: 50%;
      margin-left: -5rem;
      top: -4rem;
      padding: 0.5rem;
      z-index: 100;

      &:before, &:after {
        content: "";
        position: absolute;
        border-left: 10px solid transparent;
        border-right: 10px solid transparent;
        top: 100%;
        left: 50%;
        margin-left: -10px;
      }

      &:after{
        border-top: 10px solid $secondary-font-color-light;
        z-index: 1;
      }

      .jump-to-page {
        display: flex;
        align-items: center;
        width: 100%;
        input,
        button {
          margin-bottom: 0;
        }

        input {
          flex: 1 1 auto;
        }

        button {
          flex: 1 0 auto;
          padding-bottom: .375rem;
          padding-top: .375rem;
        }
      }
    }
  }

  .sidebar & {
    @include break-mobile-tablet {
      display: flex;
      flex-direction: column;
      justify-content: center;

      .arrow {
        transform: rotate(90deg);
      }

      li {
        line-height: 1.5;
        margin: 0.3125rem 0;

        &.jump {
          .jump-tooltip {
            left: 0;
            top: inherit;
            bottom: 140%;
          }

          input[type='number'] {
            margin-right: 0.5rem;
          }
        }
      }
    }
  }
}
</style>
