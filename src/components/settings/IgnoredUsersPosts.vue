<template>
  <div id="ignored-users-posts-settings" class="settings-section">
    <h3 class="thin-underline">Ignored Users Posts</h3>

    <div class="input-button-wrap">
      <!-- <autocomplete-user-id admin="false" user-id="vmIgnoreUserPosts.userToIgnore.user_id" username="vmIgnoreUserPosts.userToIgnore.username" input-placeholder="Type username to add to ignored posts list"></autocomplete-user-id> -->
      <Multiselect v-model="ignoredTagsInput.value" v-bind="ignoredTagsInput" />
      <button class="fill-row" @click="ignoreUser()" :disabled="!userToIgnore.user_id">Add to Ignore List</button>
    </div>
    <div class="clear"></div>
    <!-- All Users -->
    <table class="striped ignored-users" width="100%">
      <thead>
        <tr>
          <th></th>
          <th>Username</th>
          <th>Action</th>
        </tr>
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
import { usersApi } from '@/api'
import Multiselect from '@vueform/multiselect'

export default {
  name: 'ignored-users-posts',
  components: { Multiselect },
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
      userToIgnore: {},
      ignoredTagsInput: {
        mode: 'single',
        value: [],
        placeholder: 'Type username of user to ignore',
        noOptionsText: 'Enter a username to start lookup...',
        minChars: 1,
        resolveOnLoad: false,
        delay: 0,
        searchable: true,
        maxHeight: 100,
        options: async q => {
          return await usersApi.search(q)
          // filter out existing mods
          .then(d => d.filter(u => !v.ignored.find(o => o.username === u)))
          // convert array into array of objects
          .then(d => d.reduce((o, k) => (o[k] = k, o), {}))
        }
      }
    })

    return { ignoreUser, unignoreUser, pullPage, ...toRefs(v) }
  }
}
</script>

<style lang="scss">
.multiselect { margin: 0; }
.input-button-wrap { margin-top: .25rem; }
table.striped.ignored-users {
  table-layout: fixed;
  thead th:first-child { width: 4rem; }
  .user-avatar {
    @include bg-cover;
    background: no-repeat center center;
    text-align: center;
    &.circle {
      img {
        @include border-radius(100px);
        height: 1.5rem;
        width: 1.5rem;
        object-fit: cover;
      }
    }
    &.rect {
     img {
       height: 1.5rem;
       width: 1.5rem;
       object-fit: cover;
     }
    }
  }
  .user-username {
    font-weight: 900;
    color: $color-primary;
    padding-right: 0.5rem;
  }
  .no-data-mobile { display: none; }
  @include break-mobile-sm {
    .no-data-mobile { display: table-cell; }
    .no-data { display: none; }
  }
}
</style>
