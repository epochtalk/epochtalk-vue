<template>
  <!-- Breadcrumbs -->
  <div id="breadcrumbs-wrap">
    <div id="breadcrumbs">
      <ul>
        <li v-for="(breadcrumb, i) in breadcrumbs" :key="i" :class="{ active: (i + 1) === breadcrumbs.length }">
          <router-link v-if="(i + 1) !== breadcrumbs.length && breadcrumb.routeName && breadcrumb.label" :title="breadcrumb.label" :to="{ name: breadcrumb.routeName, params: breadcrumb.opts, hash: breadcrumb.hash }"><span v-html="truncate(breadcrumb.label, 30)"></span></router-link>
          <router-link v-if="(i + 1) !== breadcrumbs.length && breadcrumb.routePath && breadcrumb.label" :title="breadcrumb.label" :to="{ path: breadcrumb.routePath }"><span v-html="truncate(breadcrumb.label, 30)"></span></router-link>
          <span v-if="((i + 1) === breadcrumbs.length || (!breadcrumb.routeName && !breadcrumb.routePath)) && breadcrumb.label" :title="breadcrumb.label"><span v-html="truncate(breadcrumb.label, 30)"></span></span>
          <span v-if="((i + 1) === breadcrumbs.length || (!breadcrumb.routeName && !breadcrumb.routePath)) && breadcrumb.opts && breadcrumb.opts.locked" title="Locked" class="breadcrumbs-locked"><strong>(locked)</strong></span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import { inject } from 'vue'
import truncate from '@/composables/filters/truncate'
import { BreadcrumbStore } from '@/composables/stores/breadcrumbs'

export default {
  setup() {
    const $breadcrumbs = inject(BreadcrumbStore)

    return { breadcrumbs: $breadcrumbs.breadcrumbs, truncate }
  }
}
</script>

<style lang="scss">
header {
  #breadcrumbs-wrap {
    @include clearfix();
    @include pad(0 $base-grid-padding);
    @include break-mobile-sm { padding: 0 1rem; }
    background-color: $sub-header-color;
    border-bottom: 1px solid $breadcrumbs-border-color;
    text-align: center;
    height: $breadcrumbs-height;
    #breadcrumbs {
      @include base-layout-width;
      min-width: 0;
      padding: 0;
      background: none;
      text-transform: uppercase;
      ul {
        float: left;
        display: inline-block;
        margin: 0;
        line-height: $breadcrumbs-height;
        padding: 0;
        list-style-type: none;
        white-space: nowrap;
        li { color: $breadcrumbs-dead-link-color; display: inline-block; }
        li::before { content: "/"; padding: 0 0.4rem; }
        li:first-child::before { content: none; }
        li a { color: $breadcrumbs-dead-link-color; font-size: $breadcrumbs-font-size; cursor: pointer; }
        li span { color: $breadcrumbs-link-color; font-size: $breadcrumbs-font-size; }
        li a, li span { &.ng-enter, &.ng-leave { @include transition(none !important); } }
      }
    }

    // Mobile Breadcrumbs Layout
    @include break-mobile-sm {
      #breadcrumbs::-webkit-scrollbar { height: 0; width: 0; }
      #breadcrumbs { overflow: hidden; overflow-x: scroll; }
    }
  }
}
</style>
