<template>
  <li>
    <span v-if="page === null" class="DotsHolder">
      <svg class="Dots" viewBox="0 0 8 2" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2.23975 1C2.23975 1.55556 1.7953 2 1.23975 2C0.684191 2 0.239746 1.55556 0.239746 1C0.239746 0.444444 0.684191 0 1.23975 0C1.7953 0 2.23975 0.444444 2.23975 1ZM7.57308 1C7.57308 1.55556 7.12863 2 6.57308 2C6.01752 2 5.57308 1.55556 5.57308 1C5.57308 0.444444 6.01752 0 6.57308 0C7.12863 0 7.57308 0.444444 7.57308 1Z" fill="#BBBBBB"/>
      </svg>
    </span>
    <button
      v-else
      class="Page"
      type="button"
      :aria-label="`Go to page ${page}`"
      :class="{ 'Page-active': isActive }"
      :style="`background-color: ${isActive ? activeColor : 'transparent'};`"
      @click="clickHandler"
    >
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
    },
    activeColor: {
      type: String,
      default: '#DCEDFF',
    },
  },
  emits: ['update'],
  setup(props, { emit }) {
    const isActive = computed(() => {
      return props.page === props.current;
    })

    const clickHandler = () => {
      emit('update', props.page)
    }

    return { isActive, clickHandler }
  }
}
</script>

<style scoped lang="scss">
@import './src/assets/styles/_settings.scss';

.Page {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin: 0 2px;
  color: $black_02;
  background-color: transparent;
  font-size: 14px;
  border-radius: 3px;
  box-sizing: border-box;
  border-color: transparent;
  cursor: pointer;
  outline: 0;
  user-select: none;

  &:hover {
    border: 1px solid $grey_02;
  }

  &-active {
    color: $black_01;
    border: 1px solid $grey_02;
  }
}

.DotsHolder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  margin: 0 2px;
  box-sizing: border-box;
}

.Dots {
  width: 8px;
  height: 4px;
  fill: $grey_01;
}
</style>
