<template>
  <h1>Home Page</h1>
  <p>{{boards}}</p>
  <p><strong>{{error}}</strong></p>
</template>

<script>
import useSWRV from 'swrv'
import { inject } from 'vue'

export default {
  name: 'Boards',
  props: {},
  setup() {
    const $api = inject('$api');
    const $swrvCache = inject('$swrvCache');

    const { data: boards, error: error } = useSWRV(`/api/boards`, path => $api(`${path}`), {
      cache: $swrvCache
    })

    return {
      boards,
      error
    }
  }
}
// export default {
//   data() {
//     return {
//       boards: null,
//       error: null
//     };
//   },
//   created() {
//     // Simple GET request using axios
//     const { data: boards, error } = useSWRV(`/boards`, path => root.$api(`${path}`), {
//       cache: root.$swrvCache
//     })
//   }
// }
</script>
