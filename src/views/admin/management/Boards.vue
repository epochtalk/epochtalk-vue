<template>
  <div>{{JSON.stringify(config, null, 2)}}</div>
  <div class="testContainer">
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iste debitis animi exercitationem facilis repellat recusandae sed consequatur natus? Itaque consequuntur placeat cum eligendi nostrum quos laborum nihil sit suscipit adipisci.</p>

    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est doloribus harum vero ea ullam cum optio, veritatis, et omnis incidunt eveniet esse porro. Unde cupiditate deleniti voluptate iusto neque? Impedit.</p>
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { adminApi } from '@/api'

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
    const v = reactive({ config: {} })
    return { ...toRefs(v) }
  }
}
</script>

<style lang="scss">

</style>
