module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended'
  ],
  parserOptions: {
    parser: '@babel/eslint-parser'
  },
  rules: {
    'no-console': 'off',
    'no-debugger': 'off',
    'vue/multi-word-component-names': 'off',
    // 关闭所有规则
    'vue/no-unused-components': 'off',
    'no-unused-vars': 'off'
  },
  // 完全禁用ESLint
  ignorePatterns: ['**/*']
} 