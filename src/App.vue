<template>
  <div id="app">
    <nav id="navigation">
      <h1 class="title">Epochtalk</h1>
      <div class="right" id="nav">
        <router-link to="/">Boards</router-link> |
        <router-link to="/about">About</router-link>
      </div>
    </nav>
    <main>
      <div id="public-content">
        <div class="main">
          <router-view />
        </div>
      </div>
  </main>
  </div>
</template>

<script>
export default {
  name: 'Epochtalk'
}
</script>

<style lang="scss">
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
    row-gap: 1rem;
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
