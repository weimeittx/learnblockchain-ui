import { createRouter, createWebHistory } from 'vue-router'

// 测试页面
import TestPageOne from '../views/Test1.vue'
import TestPageTwo from '../views/Test2.vue'
import TestPageThree from '../views/Test3.vue'

const routes = [
  {
    path: '/',
    redirect: '/test1'
  },
  {
    path: '/test1',
    name: 'TestPageOne',
    component: TestPageOne
  },
  {
    path: '/test2',
    name: 'TestPageTwo',
    component: TestPageTwo
  },
  {
    path: '/test3',
    name: 'TestPageThree',
    component: TestPageThree
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router 