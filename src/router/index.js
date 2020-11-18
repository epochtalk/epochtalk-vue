import { createWebHistory, createRouter } from "vue-router"
import Boards from "@/views/Boards.vue"
import About from "@/views/About.vue"
import NotFound from "@/views/NotFound.vue"

const routes = [
  {
    path: "/",
    name: "Boards",
    component: Boards
  },
  {
    path: "/about",
    name: "About",
    component: About
  },
  {
    path: "/:catchAll(.*)",
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
