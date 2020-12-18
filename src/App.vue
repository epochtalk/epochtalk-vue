<template>
  <ProvidePreferences>
    <ProvideAuth>
      <div id="wrapper">
          <!-- <nav id="navigation">
            <h1 class="title">Epochtalk</h1>
            <div class="right" id="nav">
              <router-link to="/">Boards</router-link> |
              <router-link to="/about">About</router-link>
            </div>
          </nav> -->
          <Header></Header>
          <main>
            <div id="public-content">
              <router-view />
            </div>
        </main>
      </div>
    </ProvideAuth>
  </ProvidePreferences>
</template>

<script>
import Header from '@/components/layout/Header.vue'
import ProvidePreferences from '@/composables/stores/prefs'
import ProvideAuth from '@/composables/stores/auth'

export default {
  name: 'Epochtalk',
  components: { Header, ProvidePreferences, ProvideAuth }
}
</script>

<style lang="scss">
/*-- View Layout Wrappers --*/
#public-content {
  margin-top: $header-bottom-margin;
  @include break-mobile-sm {
    margin-top: -0.5rem;
  }
}

/*-------------- Index File -------------- */
#wrapper {
  min-height: calc(100vh - (#{$header-offset} + 1rem));
  position:relative;
  margin-top: calc(#{$header-offset} + 1rem);

  .motd-visible & {
    margin-top: calc(#{$header-offset} + 4rem);

    @include break-mobile-sm {
      margin-top: calc(#{$header-offset} + 3rem);
    }
  }

  @include break-mobile-sm {
    overflow-x: hidden;
    margin-top: calc(#{$header-offset} - 0.5rem);
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
    padding: 0 1rem;

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
