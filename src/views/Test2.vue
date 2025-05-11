<template>
  <div class="test-page">
    <h1>测试页面2</h1>
    <p>这是第二个测试页面的内容</p>
    <div class="form-test">
      <h3>表单测试</h3>
      <form @submit.prevent="submitForm">
        <div class="form-group">
          <label>名称：</label>
          <input type="text" v-model="formData.name" required>
        </div>
        <div class="form-group">
          <label>邮箱：</label>
          <input type="email" v-model="formData.email" required>
        </div>
        <div class="form-group">
          <label>消息：</label>
          <textarea v-model="formData.message" required></textarea>
        </div>
        <button type="submit">提交表单</button>
      </form>
    </div>
    <div class="form-result" v-if="submitted">
      <h3>提交结果：</h3>
      <pre>{{ JSON.stringify(formData, null, 2) }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestPageTwo',
  data() {
    return {
      formData: {
        name: '',
        email: '',
        message: ''
      },
      submitted: false
    }
  },
  methods: {
    submitForm() {
      // 表单提交逻辑
      this.submitted = true;
      // 实际项目中这里会有API调用等
      console.log('表单已提交:', this.formData);
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
}
.form-test {
  margin-top: 20px;
  max-width: 600px;
}
.form-group {
  margin-bottom: 15px;
}
label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}
input, textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}
textarea {
  height: 100px;
}
button {
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #0b7dda;
}
.form-result {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 4px;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style> 