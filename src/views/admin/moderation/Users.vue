<template>
  <div>{{JSON.stringify(config, null, 2)}}</div>
  <div class="testContainer">
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iste debitis animi exercitationem facilis repellat recusandae sed consequatur natus? Itaque consequuntur placeat cum eligendi nostrum quos laborum nihil sit suscipit adipisci.</p>

    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est doloribus harum vero ea ullam cum optio, veritatis, et omnis incidunt eveniet esse porro. Unde cupiditate deleniti voluptate iusto neque? Impedit.</p>
  </div>
</template>

<script>
import { reactive, toRefs, onMounted, onUnmounted } from 'vue'
import { adminApi } from '@/api'
import EventBus from '@/composables/services/event-bus'

export default {
  name: 'BoardManagement',
  beforeRouteEnter(to, from, next) {
    adminApi.configurations().then(data => next(vm => vm.config = data))
  },
  beforeRouteUpdate(to, from, next) {
    adminApi.configurations().then(data => {
      this.config = data
      next()
    })
  },
  setup() {
    const saveListener = () => {
      console.log('Admin Save Moderation!')
    }
    const resetListener = () => {
      console.log('Admin Reset Moderation!')
    }
    onMounted(() => {
      EventBus.on('admin-save', saveListener)
      EventBus.on('admin-reset', resetListener)
    })
    onUnmounted(() => {
      EventBus.off('admin-save', saveListener)
      EventBus.off('admin-reset', resetListener)
    })


    const v = reactive({ config: {} })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">

</style>
