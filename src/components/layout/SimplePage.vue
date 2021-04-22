<template>
  <li>
    <span v-if="!page" class="elipsis-container">
      <svg class="elipsis" viewBox="0 0 8 2" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.23975 1C2.23975 1.55556 1.7953 2 1.23975 2C0.684191 2 0.239746 1.55556 0.239746 1C0.239746 0.444444 0.684191 0 1.23975 0C1.7953 0 2.23975 0.444444 2.23975 1ZM7.57308 1C7.57308 1.55556 7.12863 2 6.57308 2C6.01752 2 5.57308 1.55556 5.57308 1C5.57308 0.444444 6.01752 0 6.57308 0C7.12863 0 7.57308 0.444444 7.57308 1Z" fill="#BBBBBB"/>
      </svg>
    </span>
    <button
      v-else
      class="page"
      type="button"
      :aria-label="`Go to page ${page}`"
      :class="{ 'page-active': isActive }"
      @click="clickHandler">
      {{ page }}
    </button>
  </li>
</template>

<script>
import { computed } from 'vue';

export default {
  name: 'SimplePage',
  props: {
    page: {
      type: Number,
      default: null,
    },
    current: {
      type: Number,
      default: 0,
    }
  },
  emits: ['update'],
  setup(props, { emit }) {
    const isActive = computed(() => props.page === props.current)
    const clickHandler = () => emit('update', props.page)
    return { isActive, clickHandler }
  }
}
</script>

<style scoped lang="scss">
.page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  margin: 0 .125rem;
  color: $base-font-color;
  background-color: transparent;
  font-size: .875rem;
  border-radius: .1875rem;
  box-sizing: border-box;
  border: 1px solid transparent;
  cursor: pointer;
  outline: 0;
  user-select: none;

  &:focus, &:hover, &:focus:hover {
    color: $base-font-color;
    border: 1px solid $border-color;
    background-color: transparent;
    margin: 0 .125rem;
  }

  &-active, &-active:hover, &-active:focus, &-active:focus:hover {
    color: $base-background-color;
    border: 1px solid transparent;
    margin: 0 .125rem;
    background-color: $color-primary;
  }
}

.elipsis-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.375rem;
  height: 1.375rem;
  margin: 0 .125rem;
  box-sizing: border-box;
}

.elipsis {
  width: .5rem;
  height: .25rem;
  fill: $base-font-color;
}
</style>
