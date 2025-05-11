<template>
  <div class="test-page">
    <h1>测试页面3</h1>
    <p>这是第三个测试页面的内容</p>
    
    <div class="data-test">
      <h3>数据展示测试</h3>
      <div class="controls">
        <button @click="loadData">加载数据</button>
        <button @click="clearData">清除数据</button>
      </div>
      
      <div v-if="loading" class="loading">
        数据加载中...
      </div>
      
      <div v-else-if="items.length > 0" class="data-grid">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>名称</th>
              <th>描述</th>
              <th>状态</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.description }}</td>
              <td>
                <span :class="'status ' + item.status.toLowerCase()">
                  {{ item.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-else class="no-data">
        暂无数据，请点击"加载数据"按钮
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestPageThree',
  data() {
    return {
      items: [],
      loading: false
    }
  },
  methods: {
    loadData() {
      this.loading = true;
      
      // 模拟API请求延迟
      setTimeout(() => {
        // 模拟数据
        this.items = [
          { id: 1, name: '测试项目1', description: '这是测试项目1的描述', status: 'Active' },
          { id: 2, name: '测试项目2', description: '这是测试项目2的描述', status: 'Pending' },
          { id: 3, name: '测试项目3', description: '这是测试项目3的描述', status: 'Completed' },
          { id: 4, name: '测试项目4', description: '这是测试项目4的描述', status: 'Failed' },
          { id: 5, name: '测试项目5', description: '这是测试项目5的描述', status: 'Active' }
        ];
        this.loading = false;
      }, 1000);
    },
    clearData() {
      this.items = [];
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}
.data-test {
  margin-top: 20px;
}
.controls {
  margin-bottom: 15px;
}
button {
  padding: 8px 16px;
  background-color: #673AB7;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
}
button:hover {
  background-color: #5e35b1;
}
.loading {
  padding: 20px;
  text-align: center;
  font-style: italic;
  color: #666;
}
.no-data {
  padding: 20px;
  text-align: center;
  color: #666;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}
th {
  background-color: #f2f2f2;
  font-weight: bold;
}
tr:hover {
  background-color: #f5f5f5;
}
.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}
.active {
  background-color: #4CAF50;
  color: white;
}
.pending {
  background-color: #FFC107;
  color: black;
}
.completed {
  background-color: #2196F3;
  color: white;
}
.failed {
  background-color: #F44336;
  color: white;
}
</style> 