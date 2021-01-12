<template>
  <div class="about-section">
    <h1 class="view-title">About {{ decode(title) }}</h1>
    <div class="description">{{description}}</div>

    <span class="copyright">&copy; {{currentYear}} {{ decode(title) }}</span>
  </div>

  <div class="sidebar">
    <ul class="about-links">
      <span class="section-header">
        Legal Info
      </span>
      <li>
        <a ng-href="/legal#tos" target="_blank" rel="noopener noreferrer">
          Terms of Service
        </a>
      </li>
      <li>
        <a ng-href="/legal#privacy" target="_blank" rel="noopener noreferrer">
          Privacy Policy
        </a>
      </li>
      <li>
        <a ng-href="/legal#disclaimer" target="_blank" rel="noopener noreferrer">
          Disclaimer
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import decode from '@/composables/filters/decode'
import { reactive, toRefs } from 'vue'

export default {
  name: 'About',
  setup() {
    const v = reactive({
      title: window.title,
      description: window.description,
      currentYear: window.currentYear
    })
    return { ...toRefs(v), decode }
  }
}
</script>

<style lang="scss">
.about {
  main #public-content { grid-template-areas: 'header header' 'main sidebar' 'main sidebar'; }

  .about-section {
    grid-area: main;

    .view-title {
      color: $secondary-font-color;
      font-size: $font-size-xl;
      font-weight: 600;
      text-transform: none;
    }

    .description {
      margin: 2rem 0 1rem;
    }
  }

  .sidebar {
    grid-area: sidebar;

    .section-header {
      color: $secondary-font-color;
      font-size: $font-size-sm;
      text-transform: uppercase;
    }

    .about-links {
      line-height: 2;
      list-style: none;
      margin: 0;
      padding: 0;

      li {
        font-weight: 600;
      }
    }
  }
}
</style>
