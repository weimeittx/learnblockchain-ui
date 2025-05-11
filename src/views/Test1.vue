<template>
  <div class="test-page">
    <h1>Bank合约交互</h1>
    
    <div class="contract-info">
      <div class="form-group">
        <label>合约地址：</label>
        <input type="text" v-model="contractAddress" placeholder="请输入Bank合约地址">
      </div>
      <div class="form-group">
        <label>连接状态：</label>
        <span :class="connected ? 'status-connected' : 'status-disconnected'">
          {{ connected ? '已连接' : '未连接' }}
        </span>
      </div>
      <button @click="connectContract" :disabled="!contractAddress || connected">连接合约</button>
    </div>

    <div class="contract-actions" v-if="connected">
      <h3>合约功能</h3>
      
      <div class="action-section">
        <h4>存款</h4>
        <div class="form-group">
          <label>金额 (ETH)：</label>
          <input type="number" v-model="depositAmount" min="0" step="0.001">
        </div>
        <button @click="deposit">存款</button>
      </div>
      
      <div class="action-section">
        <h4>查询余额</h4>
        <div class="form-group">
          <label>地址：</label>
          <input type="text" v-model="balanceAddress" placeholder="输入要查询的地址，默认为当前账户">
        </div>
        <button @click="checkBalance">查询</button>
        <div class="result" v-if="balance !== null">
          余额: {{ balance }} ETH
        </div>
      </div>
      
      <div class="action-section">
        <h4>提款</h4>
        <button @click="withdraw">提取全部余额</button>
      </div>
      
      <div class="action-section">
        <h4>前三名存款人</h4>
        <button @click="getTop3">查看前三名</button>
        <div class="result" v-if="top3Depositors.length">
          <ul>
            <li v-for="(depositor, index) in top3Depositors" :key="index">
              {{ index + 1 }}. {{ depositor }}
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="transaction-log">
      <h3>交易日志</h3>
      <div v-if="transactions.length === 0" class="empty-log">暂无交易</div>
      <div v-else class="log-entries">
        <div v-for="(tx, index) in transactions" :key="index" class="log-entry" :class="tx.status">
          <div class="tx-type">{{ tx.type }}</div>
          <div class="tx-status">{{ tx.statusText }}</div>
          <div class="tx-hash" v-if="tx.hash">
            Hash: <a :href="`https://etherscan.io/tx/${tx.hash}`" target="_blank">{{ tx.hash.substring(0, 10) }}...{{ tx.hash.substring(tx.hash.length - 8) }}</a>
          </div>
          <div class="tx-time">{{ tx.time }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { createPublicClient, formatEther ,custom} from 'viem';
import { mainnet } from 'viem/chains';
import bankABI from '../abi/bank.json';

export default {
  name: 'TestPageOne',
  data() {
    return {
      contractAddress: '',
      connected: false,
      depositAmount: 0.01,
      balanceAddress: '',
      balance: null,
      top3Depositors: [],
      transactions: [],
      publicClient: null,
      account: null
    }
  },
  mounted() {
    // 检查是否有MetaMask或其他钱包
    this.checkWallet();
  },
  methods: {
    async checkWallet() {
      if (window.ethereum) {
        try {
          // 请求连接钱包
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          this.account = accounts[0];
          this.balanceAddress = this.account;
          
          // 创建公共客户端
          this.publicClient = createPublicClient({
            chain: mainnet,
            transport: custom(window.ethereum)
          });
          
          // 监听账户变更
          window.ethereum.on('accountsChanged', (accounts) => {
            this.account = accounts[0];
            this.balanceAddress = this.account;
            if (this.connected) {
              this.checkBalance();
            }
          });
          
          this.addTransaction({
            type: '钱包连接',
            status: 'success',
            statusText: '成功',
            time: new Date().toLocaleString()
          });
        } catch (error) {
          this.addTransaction({
            type: '钱包连接',
            status: 'error',
            statusText: '失败: ' + error.message,
            time: new Date().toLocaleString()
          });
        }
      } else {
        this.addTransaction({
          type: '钱包检测',
          status: 'error',
          statusText: '未检测到MetaMask或其他兼容钱包',
          time: new Date().toLocaleString()
        });
      }
    },
    
    async connectContract() {
      if (!this.contractAddress) {
        return;
      }
      
      try {
        // 验证合约
        const code = await this.publicClient.getBytecode({
          address: this.contractAddress
        });
        
        if (!code || code === '0x') {
          throw new Error('无效的合约地址');
        }
        
        this.connected = true;
        this.addTransaction({
          type: '合约连接',
          status: 'success',
          statusText: '成功',
          time: new Date().toLocaleString()
        });
        
        // 连接后立即查询余额
        this.checkBalance();
        
      } catch (error) {
        this.addTransaction({
          type: '合约连接',
          status: 'error',
          statusText: '失败: ' + error.message,
          time: new Date().toLocaleString()
        });
      }
    },
    
    async deposit() {
      if (!this.connected || !this.depositAmount || this.depositAmount <= 0) {
        return;
      }
      
      try {
        // 将ETH数量转换为Wei (16进制字符串)
        const valueInWei = '0x' + Math.floor(this.depositAmount * 1e18).toString(16);
        
        // 使用MetaMask发送交易
        const hash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: this.account,
            to: this.contractAddress,
            value: valueInWei
          }]
        });
        
        this.addTransaction({
          type: '存款',
          status: 'pending',
          statusText: '处理中',
          hash,
          time: new Date().toLocaleString()
        });
        
        // 等待交易确认
        const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
        
        if (receipt.status === 'success') {
          this.addTransaction({
            type: '存款',
            status: 'success',
            statusText: '成功',
            hash,
            time: new Date().toLocaleString()
          });
          
          // 更新余额
          this.checkBalance();
        } else {
          throw new Error('交易失败');
        }
      } catch (error) {
        this.addTransaction({
          type: '存款',
          status: 'error',
          statusText: '失败: ' + error.message,
          time: new Date().toLocaleString()
        });
      }
    },
    
    async checkBalance() {
      if (!this.connected) {
        return;
      }
      
      const address = this.balanceAddress || this.account;
      
      try {
        const balance = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: bankABI,
          functionName: 'balanceOf',
          args: [address]
        });
        
        this.balance = formatEther(balance);
        
        this.addTransaction({
          type: '查询余额',
          status: 'success',
          statusText: '成功',
          time: new Date().toLocaleString()
        });
      } catch (error) {
        this.balance = null;
        this.addTransaction({
          type: '查询余额',
          status: 'error',
          statusText: '失败: ' + error.message,
          time: new Date().toLocaleString()
        });
      }
    },
    
    async withdraw() {
      if (!this.connected) {
        return;
      }
      
      try {
        // 获取ABI中withdraw函数的函数签名
        const withdrawFunction = bankABI.find(item => 
          item.type === 'function' && item.name === 'withdraw');
          
        if (!withdrawFunction) {
          throw new Error('合约中没有找到withdraw函数');
        }
        
        // 直接使用MetaMask发送交易
        const hash = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: this.account,
            to: this.contractAddress,
            data: '0x3ccfd60b' // withdraw()的函数选择器
          }]
        });
        
        this.addTransaction({
          type: '提款',
          status: 'pending',
          statusText: '处理中',
          hash,
          time: new Date().toLocaleString()
        });
        
        // 等待交易确认
        const receipt = await this.publicClient.waitForTransactionReceipt({ hash });
        
        if (receipt.status === 'success') {
          this.addTransaction({
            type: '提款',
            status: 'success',
            statusText: '成功',
            hash,
            time: new Date().toLocaleString()
          });
          
          // 更新余额
          this.checkBalance();
        } else {
          throw new Error('交易失败');
        }
      } catch (error) {
        this.addTransaction({
          type: '提款',
          status: 'error',
          statusText: '失败: ' + error.message,
          time: new Date().toLocaleString()
        });
      }
    },
    
    async getTop3() {
      if (!this.connected) {
        return;
      }
      
      try {
        const top3 = await this.publicClient.readContract({
          address: this.contractAddress,
          abi: bankABI,
          functionName: 'getTop3'
        });
        
        this.top3Depositors = top3.filter(addr => addr !== '0x0000000000000000000000000000000000000000');
        
        this.addTransaction({
          type: '查询前三名',
          status: 'success',
          statusText: '成功',
          time: new Date().toLocaleString()
        });
      } catch (error) {
        this.top3Depositors = [];
        this.addTransaction({
          type: '查询前三名',
          status: 'error',
          statusText: '失败: ' + error.message,
          time: new Date().toLocaleString()
        });
      }
    },
    
    addTransaction(tx) {
      this.transactions.unshift(tx);
      // 保留最近20条交易记录
      if (this.transactions.length > 20) {
        this.transactions = this.transactions.slice(0, 20);
      }
    }
  }
}
</script>

<style scoped>
.test-page {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1, h3, h4 {
  color: #2c3e50;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 10px;
  margin-bottom: 10px;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.contract-info, .contract-actions, .transaction-log {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f5f5;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.action-section {
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ddd;
}

.action-section:last-child {
  border-bottom: none;
}

.result {
  margin-top: 10px;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
}

.status-connected {
  color: #4CAF50;
  font-weight: bold;
}

.status-disconnected {
  color: #F44336;
  font-weight: bold;
}

.log-entries {
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  padding: 10px;
  margin-bottom: 8px;
  border-radius: 4px;
  border-left: 4px solid #ccc;
}

.log-entry.success {
  background-color: #e8f5e9;
  border-left-color: #4CAF50;
}

.log-entry.error {
  background-color: #ffebee;
  border-left-color: #F44336;
}

.log-entry.pending {
  background-color: #fff8e1;
  border-left-color: #FFC107;
}

.tx-type {
  font-weight: bold;
  margin-bottom: 3px;
}

.tx-hash {
  word-break: break-all;
  font-size: 0.9em;
  margin: 3px 0;
}

.tx-hash a {
  color: #2196F3;
  text-decoration: none;
}

.tx-hash a:hover {
  text-decoration: underline;
}

.tx-time {
  font-size: 0.8em;
  color: #757575;
}

.empty-log {
  padding: 15px;
  text-align: center;
  color: #757575;
  font-style: italic;
}
</style> 