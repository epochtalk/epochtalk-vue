<template>
  <div v-if="pageCount > 1" class="pagination-component">
    <ul class="pagination no-select">
      <span v-for="pageKey in paginationKeys" :key="pageKey.val">
        <li :class="pageKey.class">
          <a href="#" @click.stop.prevent="gotoThreadPage(pageKey.page)" v-html="pageKey.val"></a>
        </li>
      </span>
    </ul>
  </div>
</template>

<script>
import { computed, reactive, toRefs, watch } from 'vue'
import { useRouter } from 'vue-router'

export default {
  props: ['limit', 'count', 'slug'],
  setup(props) {
    /* View Methods */
    const gotoThreadPage = page => {
      // do nothing if no page is specified, or if page is out of range
      if (!page || page > v.pageCount || page < 1) return

      $router.push({
        name: 'Posts',
        params: { threadSlug: props.slug },
        query: {
          page: (page === 1 || page === 'all') ? undefined : page,
          limit: page === 'all' ? 100 : undefined
        }
      })
    }

    const buildPages = () => {
      // reset pagination keys
      v.paginationKeys = []

      // max pages before truncation
      let pageMax = 5

      // variable to hold ellipsis positions
      let ellipsis

      if (v.pageCount > pageMax)
        ellipsis = [{ index: 3, nextIndex: v.pageCount - 1 }]

      generatePageKeys(ellipsis)
    }

    const generatePageKeys = (ellipsis) => {
      // Add Pagination Keys accounting for ellipsis
      let ellipsisIndex = 0
      let index = 1
      // max posts before 'all' option is no longer displayed
      let postMax = 100

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
            class: null
          }
          index++
        }
        v.paginationKeys.push(pageKey)
      }

      // Show all option if there are less than
      // or equal to postMax posts in the thread
      if (props.count <= postMax)
        v.paginationKeys.push({
          val: 'all',
          page: 'all',
          class: null
        })
    }

    /* Internal Data */
    const $router = useRouter()

    /* View Data */
    const v = reactive({
      paginationKeys: [],
      pageCount: computed(() => Math.ceil(props.count / props.limit) || 1)
    })

    buildPages()

    /* Watch - this handles when pagination data changes */
    watch(() => props.limit, () => buildPages())
    watch(() => props.count, () => buildPages())

    return { ...toRefs(v), gotoThreadPage }
  }
}
</script>

<style lang="scss">
.thread-pagination {
  margin-bottom: -0.65rem;
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
        font-size: 0.875rem;
        line-height: inherit;
        &:hover { color: $secondary-font-color-dark; background-color: $secondary-font-color-light; }
      }
    }
    li.unavailable a { cursor: default; color: $secondary-font-color; }
    li.current a {
      background: $color-primary;
      &:hover, &:focus { background: $color-primary-alt; }
    }
  }
}
</style>
