<template>
  <div class="sidebar">
    <div class="logo">
      <h2>区块链</h2>
    </div>
    <nav class="menu">
      <ul>
        <li v-for="item in menuItems" :key="item.id">
          <a href="#" class="menu-item" :class="{ active: currentPageId === item.id }" @click.prevent="changePage(item.id)">
            <span class="icon">{{ item.icon }}</span>
            <span class="label">{{ item.name }}</span>
          </a>
        </li>
      </ul>
    </nav>
    <!-- <div class="sidebar-footer"> -->
      <!-- <p>© {{ new Date().getFullYear() }} 测试平台</p> -->
    <!-- </div> -->
  </div>
</template>

<script>
export default {
  name: 'SidebarMenu',
  props: {
    currentPageId: {
      type: String,
      default: 'page1'
    }
  },
  data() {
    return {
      menuItems: [
        { id: 'bank', name: 'Bank合约', icon: '💰' },
        // { id: 'page2', name: '测试页面2', icon: '📋' },
        // { id: 'page3', name: '测试页面3', icon: '📊' }
      ]
    }
  },
  methods: {
    changePage(pageId) {
      this.$emit('change-page', pageId);
    }
  }
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100%;
  background-color: #2c3e50;
  color: #fff;
  display: flex;
  flex-direction: column;
}

.logo {
  padding: 20px;
  text-align: center;
  border-bottom: 1px solid #3d556c;
}

.logo h2 {
  margin: 0;
  font-size: 1.5rem;
}

.menu {
  flex: 1;
  padding: 20px 0;
}

.menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #b8c7ce;
  text-decoration: none;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #374a5e;
  color: #fff;
}

.menu-item.active {
  background-color: #3c8dbc;
  color: #fff;
}

.icon {
  margin-right: 10px;
  font-size: 18px;
}

.sidebar-footer {
  padding: 15px;
  text-align: center;
  font-size: 0.8rem;
  color: #b8c7ce;
  border-top: 1px solid #3d556c;
}
</style> 