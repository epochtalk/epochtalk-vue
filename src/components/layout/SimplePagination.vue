<template>
  <ul class="Pagination">
    <li v-if="!hideFirstButton" class="PaginationControl">
      <svg class="Control"
        :class="{ 'Control-active': isPrevControlsActive }"
        @click="goToFirst" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 24 24"><path d="M18.41,16.59L13.82,12L18.41,7.41L17,6L11,12L17,18L18.41,16.59M6,6H8V18H6V6Z" /></svg>
    </li>
    <li class="PaginationControl">
      <svg class="Control"
        :class="{ 'Control-active': isPrevControlsActive }"
        @click="goToPrev" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 24 24"><path d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" /></svg>
    </li>
    <simple-page
      v-for="page in pagination"
      :key="`pagination-page-${page}`"
      :page="page"
      :current="modelValue"
      :active-color="activeColor"
      @update="updatePageHandler"
    />
    <li class="PaginationControl">
      <svg class="Control"
        :class="{ 'Control-active': isNextControlsActive }"
        @click="goToNext" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 24 24"><path d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" /></svg>
    </li>
    <li v-if="!hideLastButton" class="PaginationControl">
      <svg class="Control"
        :class="{ 'Control-active': isNextControlsActive }"
        @click="goToLast" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" viewBox="0 0 24 24"><path d="M5.59,7.41L10.18,12L5.59,16.59L7,18L13,12L7,6L5.59,7.41M16,6H18V18H16V6Z" /></svg>
    </li>
  </ul>
</template>

<script>
import { computed } from 'vue'
import SimplePage from '@/components/layout/SimplePage.vue'

export default {
  name: 'SimplePagination',
  components: { SimplePage },
  props: {
    pages: {
      type: Number,
      default: 0,
    },
    rangeSize: {
      type: Number,
      default: 1,
    },
    modelValue: {
      type: Number,
      default: 0,
    },
    activeColor: {
      type: String,
      default: '#DCEDFF',
    },
    hideFirstButton: {
      type: Boolean,
      default: false,
    },
    hideLastButton: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    // pagination
    const pagination = computed(() => {
      const res = []
      const minPaginationElems = 5 + props.rangeSize * 2

      let rangeStart = props.pages <= minPaginationElems ? 1 : props.modelValue - props.rangeSize
      let rangeEnd =
        props.pages <= minPaginationElems ? props.pages : props.modelValue + props.rangeSize

      rangeEnd = rangeEnd > props.pages ? props.pages : rangeEnd
      rangeStart = rangeStart < 1 ? 1 : rangeStart

      if (props.pages > minPaginationElems) {
        const isStartBoundaryReached = rangeStart - 1 < 3
        const isEndBoundaryReached = props.pages - rangeEnd < 3

        if (isStartBoundaryReached) {
          rangeEnd = minPaginationElems - 2
          for (let i = 1; i < rangeStart; i++) res.push(i)
        }
        else {
          res.push(1)
          res.push(null)
        }

        if (isEndBoundaryReached) {
          rangeStart = props.pages - (minPaginationElems - 3)
          for (let i = rangeStart; i <= props.pages; i++) res.push(i)
        }
        else {
          for (let i = rangeStart; i <= rangeEnd; i++) res.push(i)

          res.push(null)
          res.push(props.pages)
        }
      }
      else for (let i = rangeStart; i <= rangeEnd; i++) res.push(i)
      return res

    })

    const updatePageHandler = params => emit('update:modelValue', params)


    // controls
    const isPrevControlsActive = computed(() => props.modelValue > 1)

    const isNextControlsActive = computed(() => {
      return props.modelValue < props.pages
    })

    const goToFirst = () => {
      if (isPrevControlsActive.value) {
        emit('update:modelValue', 1)
      }
    }

    const goToPrev = () => {
      if (isPrevControlsActive.value) {
        emit('update:modelValue', props.modelValue - 1)
      }
    }

    const goToLast = () => {
      if (isNextControlsActive.value) {
        emit('update:modelValue', props.pages)
      }
    }

    const goToNext = () => {
      if (isNextControlsActive.value) {
        emit('update:modelValue', props.modelValue + 1)
      }
    }

    return {
      pagination,
      updatePageHandler,
      isPrevControlsActive,
      isNextControlsActive,
      goToFirst,
      goToLast,
      goToPrev,
      goToNext,
    }
  }
}
</script>

<style scoped lang="scss">
@import './src/assets/styles/_settings.scss';

.Pagination {
  display: flex;
  flex-flow: row;
  flex-wrap: wrap;
  align-items: center;
  margin: 0;
  padding: 0;
  list-style-type: none;
}

.PaginationControl {
  display: flex;
  align-items: center;
}

.Control {
  position: relative;
  display: block;
  width: 18px;
  height: 18px;
  margin: 0 2px;
  fill: $grey_01;

  &-active {
    fill: $black_01;
    cursor: pointer;
    transition: fill 0.2s ease-in-out;

    &:hover {
      fill: $black_00;
      transition: fill 0.2s ease-in-out;
    }
  }
}
</style>
