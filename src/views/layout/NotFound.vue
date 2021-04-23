<template>
  <div class="main" id="http-error">
    <div class="code">404</div>
    <div class="message">Sorry, the page you're looking for doesn't seem to exist.</div>
    If you think this page should exist please contact an administrator.
    <br /><br />
    <router-link class="button" to="/">Home</router-link>
  </div>
</template>

<style lang="scss">
  .not-found main #public-content { grid-template-areas: 'header header' 'main main' 'main main'; }
</style>
