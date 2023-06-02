<template>
  <ProvidePreferences>
    <ProvideAuth>
      <ProvideWebsocket>
        <ProvideBreadcrumbs>
          <div id="wrapper" :class="{ 'admin': adminMode }">
            <HeaderComponent></HeaderComponent>
            <main>
              <div id="public-content">
                <router-view />
              </div>
            </main>
          </div>
        </ProvideBreadcrumbs>
      </ProvideWebsocket>
    </ProvideAuth>
  </ProvidePreferences>
</template>

<script>
import HeaderComponent from './components/layout/HeaderComponent.vue'
import ProvidePreferences from '@/composables/stores/prefs'
import ProvideAuth from '@/composables/stores/auth'
import ProvideWebsocket from '@/composables/services/websocket'
import ProvideBreadcrumbs from '@/composables/stores/breadcrumbs'
import { reactive, toRefs, watch } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Epochtalk',
  components: { HeaderComponent, ProvidePreferences, ProvideWebsocket, ProvideBreadcrumbs, ProvideAuth },
  setup() {
    const v = reactive({ adminMode: false })
    const $route = useRoute()
    // Modify css when in admin routes
    watch(() => $route.path, p => v.adminMode = p.indexOf('/admin') === 0)
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">
/*-- View Layout Wrappers --*/
#public-content {
  margin-top: $header-bottom-margin;
  @include break-mobile-sm {
    margin-top: -0.5rem;
  }

  .admin & {
    grid-template-areas: unset;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    max-width: unset;
  }
}

/*-------------- Index File -------------- */
#wrapper {
  min-height: calc(100vh - (#{$header-offset} + 1rem));
  position:relative;
  margin-top: calc(#{$header-offset} + 1rem);
  &.admin {
    // margin-top: calc(#{$header-height} + 6.25rem);
    overflow-x: unset;
    main { padding-top: .5rem; }
    @include break-mobile-sm {
      main { padding-top: $header-offset; }
    }
  }
  .motd-visible & {
    margin-top: calc(#{$header-offset} + 4rem);

    @include break-mobile-sm {
      margin-top: calc(#{$header-offset} + 3rem);
    }
  }

  @include break-mobile-sm {
    overflow-x: hidden;
    margin-top: $header-offset;
  }
}

#wrapper #preview-banner {
  @include pad(0 $base-grid-padding);
  background-color: orange;
  height: 2rem;
  line-height: 2rem;
  color: $dark-text-default;
  border-bottom: 1px solid darken(orange, 10%);
  a {
    @include border-radius(2px);
    padding: 0 0.5rem;
    color: $dark-text-default;
    &:hover { color: black; }
    &:last-child { margin-right: 0; }
  }
  @include break-mobile-sm { a span { display: none; } }
}
main {
  @include clearfix();
  @include pad(0 $base-grid-padding);
  min-height: 100%;
  // padding-bottom: 58px;
  #public-content {
    @include base-layout-width;
    @include grid-base-layout;
    @include grid-columns-base;
    // margin-top: $header-bottom-margin;
    grid-template-areas:
      "header header"
      "main main"
      "sidebar sidebar";
    grid-gap: 2rem;
    row-gap: 0;
    margin-bottom: 2rem;

    @include break-mobile-sm {
      column-gap: 0;
      grid-template-columns: 1fr;
    }
  }

  .main { grid-area: main; }

  @include break-mobile-sm {
    padding: 0 1rem 0;

    #public-content,
    .posts #public-content {
      column-gap: 0;
      grid-template-columns: 1fr;
      justify-items: center;
    }
  }
}

#navigation {
  background-color: #555;
  color: #fff;
  display: flex;
  align-items: center;
  a { color: #fff; }
  .right { margin: 1rem 10rem 1rem auto; }
  .title {
    display: inline-block;
    margin: 1rem 0 1rem 10rem;
  }
}
</style>
