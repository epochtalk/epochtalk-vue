<template>
  <div id="app">
    <nav id="navigation">
      <h1 class="title">Epochtalk</h1>
      <div class="right" id="nav">
        <router-link to="/">Boards</router-link> |
        <router-link to="/about">About</router-link>
      </div>
    </nav>
    <div id="content">
      <router-view />
    </div>
  </div>
</template>

<script>

export default {
  name: 'Epochtalk',
  components: {
  }
}
</script>

<style>
body { margin: 0; }
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
#navigation {
  background-color: #555;
  color: #fff;
  display: flex;
  align-items: center;
}
#navigation a { color: #fff; }
#navigation .right { margin: 1rem 10rem 1rem auto; }
#navigation .title {
  display: inline-block;
  margin: 1rem 0 1rem 10rem;
}
#content {
  margin: 1rem 10rem;
}
</style>
