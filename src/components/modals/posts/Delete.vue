<template>
  <modal :name="$options.name" :show="show" @close="close()" :focusInput="focusInput">
    <template v-slot:header>Hide Post</template>

    <template v-slot:body>
      <form action="." class="css-form">
        <h3 class="thin-underline">Hide Post</h3>
        <p>Are you sure you want to hide this post?</p>
        <label v-if="canPostLockQuick(deletePostIndex) && deletePostLocked === false" class="checkbox-container">
          <input type="checkbox" id="lock-post" v-model="deleteAndLock" ref="focusInput" />
          Lock Post (poster cannot hide/edit this post)?
        </label>
        <div class="clear">
          <button id="login-btn" class="fill-row" @click.prevent="deletePost(post)" type="submit">
            Hide Post
          </button>
        </div>
      </form>
    </template>
  </modal>
</template>
