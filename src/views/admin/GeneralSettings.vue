<template>
  <!-- <pre>{{config}}</pre> -->
  <div class="testContainerOne">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Autem, voluptates labore deserunt cumque incidunt dicta commodi eveniet eaque voluptatem sapiente, rerum quas repellat quo quisquam quam? Ratione voluptatem distinctio veritatis.</div>
  <div class="testContainer">
    <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Iste debitis animi exercitationem facilis repellat recusandae sed consequatur natus? Itaque consequuntur placeat cum eligendi nostrum quos laborum nihil sit suscipit adipisci.</p>

    <p>Lorem ipsum dolor sit, amet consectetur adipisicing elit. Est doloribus harum vero ea ullam cum optio, veritatis, et omnis incidunt eveniet esse porro. Unde cupiditate deleniti voluptate iusto neque? Impedit.</p>

    <p>Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows. Some pilots get picked and become television programs. Some don't, become nothing. She starred in one of the ones that became nothing. </p>

    <p>Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends. </p>

    <p>Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows. Some pilots get picked and become television programs. Some don't, become nothing. She starred in one of the ones that became nothing. </p>

    <p>Your bones don't break, mine do. That's clear. Your cells react to bacteria and viruses differently than mine. You don't get sick, I do. That's also clear. But for some reason, you and I react the exact same way to water. We swallow it too fast, we choke. We get some in our lungs, we drown. However unreal it may seem, we are connected, you and I. We're on the same curve, just on opposite ends. </p>

    <p>The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men. Blessed is he who, in the name of charity and good will, shepherds the weak through the valley of darkness, for he is truly his brother's keeper and the finder of lost children. And I will strike down upon thee with great vengeance and furious anger those who would attempt to poison and destroy My brothers. And you will know My name is the Lord when I lay My vengeance upon thee. </p>

    <p>Look, just because I don't be givin' no man a foot massage don't make it right for Marsellus to throw Antwone into a glass motherfuckin' house, fuckin' up the way the nigger talks. Motherfucker do that shit to me, he better paralyze my ass, 'cause I'll kill the motherfucker, know what I'm sayin'? </p>

    <p>The path of the righteous man is beset on all sides by the iniquities of the selfish and the tyranny of evil men. Blessed is he who, in the name of charity and good will, shepherds the weak through the valley of darkness, for he is truly his brother's keeper and the finder of lost children. And I will strike down upon thee with great vengeance and furious anger those who would attempt to poison and destroy My brothers. And you will know My name is the Lord when I lay My vengeance upon thee. </p>    
  </div>
</template>

<script>
import { reactive, toRefs } from 'vue'
import { adminApi } from '@/api'

export default {
  name: 'GeneralSettings',
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
