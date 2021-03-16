<template>
  <div class="settings-section">

    <div class="input-button-wrap">
      <Multiselect v-model="ignoredTagsInput.value" ref="ignoredInput" v-bind="ignoredTagsInput" />
      <button class="fill-row" @click="ignoreUser({ id: ignoredTagsInput.value })" :disabled="!ignoredTagsInput.value">Ignore</button>
    </div>
    <div class="clear"></div>
    <table class="striped ignored-users" width="100%">
      <thead>
        <tr>
          <th></th>
          <th>Username</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody v-if="!ignored?.data?.length">
        <tr>
          <td class="centered-text no-data" colspan="3"><h5>No User Posts Being Ignored</h5></td>
        </tr>
      </tbody>
      <tbody v-for="user in ignored?.data" :key="user.id">
        <tr>
          <td>
            <img class="avatar-small" :class="defaultAvatarShape" :src="user.avatar || defaultAvatar" @error="$event.target.src=defaultAvatar" />
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
            <a @click="ignoreUser(user, true)">
              <i class="fa fa-user-times"></i>&nbsp;&nbsp;
              Ignore<span class="hide-mobile"> User's Posts</span>
            </a>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="pagination-simple">
      <button @click="pullPage(-1)" :disabled="!ignored?.prev">&#10094; Prev</button>
      <button @click="pullPage(1)" :disabled="!ignored?.next">Next &#10095;</button>
    </div>
  </div>
</template>

<script>
import { reactive, inject, onBeforeMount, toRefs } from 'vue'
import { usersApi } from '@/api'
import Multiselect from '@vueform/multiselect'

export default {
  name: 'ignored-users-posts',
  props: ['ignoreApi', 'unignoreApi', 'listApi'],
  components: { Multiselect },
  setup(props) {
    onBeforeMount(() => pullPage(1))
    /* View Methods */
    const ignoreUser = (user, noPull) => props.ignoreApi(user.id)
    .then(() => {
      user.ignored = !user.ignored
      v.ignoredInput.clear()
      if (!noPull) pullPage(0)
    })
    .catch(() => {
      v.ignoredInput.clear()
      $alertStore.warn('This user is already being ignored.')
    })

    const unignoreUser = user => props.unignoreApi(user.id).then(() => user.ignored = !user.ignored)

    const pullPage = inc => props.listApi({
      page: v.ignored?.page ? v.ignored.page + inc : 1,
      limit: 10
    }).then(d => v.ignored = d)

    const $alertStore = inject('$alertStore')

    const v = reactive({
      ignoredInput: null,
      ignored: {},
      defaultAvatar: window.default_avatar,
      defaultAvatarShape: window.default_avatar_shape,
      ignoredTagsInput: {
        mode: 'single',
        placeholder: 'Type username of user to ignore',
        noOptionsText: 'Enter a username to start lookup...',
        minChars: 1,
        resolveOnLoad: false,
        clearOnSearch: true,
        clearonSelect: true,
        delay: 0,
        value: null,
        searchable: true,
        maxHeight: 100,
        options: async q => {
          return await usersApi.lookup(q, { restricted: true })
          // convert array into array of objects
          .then(d => d.map(u =>{ return { label: u.username, value: u.id } }))
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
