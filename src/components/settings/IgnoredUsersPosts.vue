<template>
  <div id="ignored-users-posts-settings" class="settings-section">
    <h3 class="thin-underline">Ignored Users Posts</h3>

    <div class="row">
      <!-- <autocomplete-user-id admin="false" user-id="vmIgnoreUserPosts.userToIgnore.user_id" username="vmIgnoreUserPosts.userToIgnore.username" input-placeholder="Type username to add to ignored posts list"></autocomplete-user-id> -->
      <button class="fill-row" @click="ignoreUser()" :disabled="!userToIgnore.user_id">Add to Ignore List</button>
    </div>
    <div class="clear"></div>
    <!-- All Users -->
    <table class="striped ignored-users" width="100%">
      <thead>
        <th></th>
        <th>Username</th>
        <th>Action</th>
      </thead>
      <tbody v-if="!ignored?.length">
        <tr>
          <td class="centered-text no-data" colspan="3"><h5>No User Posts Being Ignored</h5></td>
        </tr>
      </tbody>
      <tbody v-for="user in ignored" :key="user.id">
        <tr>
          <td>
<!--             <div class="user-avatar {{$webConfigs.default_avatar_shape}}">
              <a href="">
                <img :src="{{::user.avatar || $webConfigs.default_avatar}}">
              </a>
            </div> -->
          </td>
          <td>
            <a class="user-username" href="">{{user.username}}</a>
          </td>
          <td v-if="user.ignored">
            <a @click="unignoreUser(user)">
              <i class="fa fa-user"></i>&nbsp;&nbsp;
              Stop Ignoring<span class="hide-mobile"> User's Posts</span>
            </a>
          </td>
          <td v-if="!user.ignored">
            <a @click="ignoreUser(user)">
              <i class="fa fa-user-times"></i>&nbsp;&nbsp;
              Ignore<span class="hide-mobile"> User's Posts</span>
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination-simple">
      <a v-show="prev" @click="pullPage(-1)">
        &#10094; Previous
      </a>
      <span v-show="!prev">&#10094; Previous</span>
      &nbsp;&nbsp;&nbsp;
      <a v-show="next" @click="pullPage(1)">
         Next &#10095;
      </a>
      <span v-show="!next">Next &#10095;</span>
    </div>


  </div>
</template>

<script>
import { reactive, onBeforeMount, toRefs } from 'vue'
// import { threadsApi } from '@/api'

export default {
  name: 'ignored-users-posts',
  setup() {
    onBeforeMount(() => v.ignored = [])
    /* View Methods */
    const ignoreUser = () => console.log('Ignore Users Posts')
    const unignoreUser = () => console.log('Unignore Users Posts')
    const pullPage = page => console.log('Pull page', page)
    // const $alertStore = inject('$alertStore')

    const v = reactive({
      next: false,
      prev: false,
      ignored: [],
      userToIgnore: {}
    })

    return { ignoreUser, unignoreUser, pullPage, ...toRefs(v) }
  }
}
</script>
