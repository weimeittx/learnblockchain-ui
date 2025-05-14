<template>
  <div class="app">
    <SidebarMenu :currentPageId="currentPage" @change-page="changePage" />
    <div class="content">
      <!-- <div class="header"> -->
        <!-- <h1>测试页面系统</h1> -->
      <!-- </div> -->
      <div class="main-content">
        <TestPageOne v-if="currentPage === 'bank'" />
        <TestPageTwo v-if="currentPage === 'tokenBank'" />
        <TestPageThree v-if="currentPage === 'page3'" />
      </div>
    </div>
  </div>
</template>

<script>
import SidebarMenu from './components/Sidebar.vue'
import TestPageOne from './views/Test1.vue'
import TestPageTwo from './views/Test2.vue'
import TestPageThree from './views/Test3.vue'

export default {
  name: 'App',
  components: {
    SidebarMenu,
    TestPageOne,
    TestPageTwo,
    TestPageThree
  },
  data() {
    return {
      currentPage: 'page1'
    }
  },
  methods: {
    changePage(pageId) {
      this.currentPage = pageId;
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Arial', sans-serif;
  font-size: 16px;
  line-height: 1.5;
  color: #333;
}

.app {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header {
  background-color: #f4f6f9;
  padding: 15px 20px;
  border-bottom: 1px solid #ddd;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.main-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #f4f6f9;
}
</style>
