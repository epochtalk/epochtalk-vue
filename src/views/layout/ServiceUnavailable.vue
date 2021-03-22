<template>
  <div class="main" id="http-error">
    <div class="code">503</div>
    <div class="message">The server is currently down for maintenance or over capacity.</div>
    Keep hitting this button or come back later. If the problem persists contact an administrator.
    <br /><br />
    <router-link class="button" to="/">Home</router-link>
  </div>
</template>

<style lang="scss">
  .service-unavailable main #public-content { grid-template-areas: 'header header' 'main main' 'main main'; }
</style>
