<template>
  <!-- Column One -->
  <div class="settings half-column">

    <blacklist></blacklist>

    <rank-manager></rank-manager>

    <auto-moderation></auto-moderation>
  </div>

  <!-- Column Two -->
  <div class="settings half-column">
    <!-- Rate Limiting -->
    <h5 class="thin-underline section-header-top-spacing">API Rate Limiting (Global Defaults)
      <span class="info-tooltip" data-balloon="Allows the forum owners to apply rate limits to different types of data requests" data-balloon-pos="down" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
    </h5>

    <section class="boxed-section">
      <div class="header"><span class="get large">GET Requests</span></div>
      <div class="content input-three-col">
        <div>
          <label class="desc-label" for="get-interval">Interval
            <span class="info-tooltip" data-balloon="The amount of time to which you are limiting the number of request to (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.get.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="get-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-max-in-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.get.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="get-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="get-min-difference" ng-model="AdminSettingsCtrl.settings.rate_limiting.get.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <section class="boxed-section">
      <div class="header"><span class="post large">POST Requests</span></div>
      <div class="content input-three-col">
        <div>
          <label class="desc-label" for="post-interval">Interval
            <span class="info-tooltip" data-balloon="The amount of time to which you are limiting the number of request to (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.post.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="post-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-max-in-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.post.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="post-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="post-min-difference" ng-model="AdminSettingsCtrl.settings.rate_limiting.post.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <section class="boxed-section">
      <div class="header"><span class="put large">PUT Requests</span></div>
      <div class="content input-three-col">
        <div>
          <label class="desc-label" for="put-interval">Interval
            <span class="info-tooltip" data-balloon="The amount of time to which you are limiting the number of request to (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.put.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="put-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-max-in-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.put.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="put-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="put-min-difference" ng-model="AdminSettingsCtrl.settings.rate_limiting.put.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <section class="boxed-section">
      <div class="header"><span class="delete large">DELETE Requests</span></div>
        <div class="content input-three-col">
        <div>
          <label class="desc-label" for="delete-interval">Interval
            <span class="info-tooltip" data-balloon="The amount of time to which you are limiting the number of request to (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.delete.interval" placeholder="In MS (Ex: 1000)" />
        </div>
        <div>
          <label class="desc-label" for="delete-max-in-interval">Max In Interval
            <span class="info-tooltip" data-balloon="How many requests you can make within the interval (e.g. 'Max in Interval' requests every 'Interval' milliseconds)" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-max-in-interval" ng-model="AdminSettingsCtrl.settings.rate_limiting.delete.max_in_interval" placeholder="Ex: 1" />
        </div>
        <div>
          <label class="desc-label" for="delete-min-difference">Min Difference
            <span class="info-tooltip" data-balloon="How long between each request (e.g. how much time between each 'Max in Interval')" data-balloon-pos="up" data-balloon-length="large" data-balloon-break><i class="fa fa-info-circle"></i></span>
          </label>
          <input type="text" class="input-text" id="delete-min-difference" ng-model="AdminSettingsCtrl.settings.rate_limiting.delete.min_difference" placeholder="In MS (Ex: 100)" />
        </div>
      </div>
    </section>

    <trust-admin-settings></trust-admin-settings>
  </div>

  <trust-list default-trust="true"></trust-list>

  <!-- Full Row -->
  <div class="ad-settings">
    <ad-manager></ad-manager>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted } from 'vue'
// import { adminApi, motdApi, boardsApi } from '@/api'
import EventBus from '@/composables/services/event-bus'

export default {
  name: 'AdvancedSettings',
  // beforeRouteEnter(to, from, next) {
  //   adminApi.configurations().then(data => next(vm => {
  //     vm.config = data
  //     vm.originalConfig = cloneDeep(data)
  //     vm.localImageServer = data.images.storage === 'local'
  //     motdApi.get().then(mData => vm.motdData = mData)
  //     boardsApi.movelist()
  //     .then(ml => groupBy(ml, 'parent_name'))
  //     .then(movelist => vm.boardsMovelist = movelist)
  //   }))
  // },
  // beforeRouteUpdate(to, from, next) {
  //   adminApi.configurations().then(data => {
  //     this.config = data
  //     this.originalConfig = cloneDeep(data)
  //     this.localImageServer = data.images.storage === 'local'
  //     motdApi.get().then(mData => this.motdData = mData)
  //     boardsApi.movelist()
  //     .then(ml => groupBy(ml, 'parent_name'))
  //     .then(movelist => this.boardsMovelist = movelist)
  //     next()
  //   })
  // },
  setup() {
    const saveListener = () => console.log('save')
    const resetListener = () => console.log('reset')

    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })

    const v = reactive({

    })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">
</style>
