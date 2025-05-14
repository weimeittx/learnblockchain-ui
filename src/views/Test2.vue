<template>
  <div class="test-page">
    <h2>TokenBank 交互</h2>
    
    <div class="form-test">
      <div class="form-group">
        <label>代币地址</label>
        <input type="text" v-model="tokenAddress" placeholder="输入代币合约地址" />
      </div>
      
      <div class="form-group">
        <label>数量</label>
        <input type="text" v-model="amount" placeholder="输入存款/取款数量" />
      </div>
      
      <div class="buttons">
        <button @click="deposit">普通存款</button>
        <button @click="depositWithPermit2">Permit2 签名存款</button>
        <button @click="withdraw">取款</button>
      </div>
      
      <div v-if="txHash" class="form-result">
        <h3>交易结果</h3>
        <p>交易哈希: {{ txHash }}</p>
      </div>
      
      <div v-if="error" class="form-result error">
        <h3>错误信息</h3>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script>
// 避免在Vue响应式系统中包装ethers对象
let provider = null;
let signer = null;
let tokenBankContract = null;

// 导入ethers v6
import { ethers } from 'ethers';
// 检查ethers版本
console.log('当前使用的ethers版本:', ethers.version);

import TokenBankABI from '../abi/TokenBank.json';
import ERC20ABI from '../abi/ERC20.json';

// 添加十六进制转换辅助函数
function bytesToHex(bytes) {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// 添加BigInt序列化处理函数
function replaceBigInt(key, value) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

export default {
  name: 'TestPageTwo',
  data() {
    return {
      tokenBankAddress: '0x38AF69c4cDac781D454e5B9AA310F9d7E5155075',
      tokenAddress: '',
      amount: '',
      txHash: '',
      error: '',
      cachedChainId: null,
    }
  },
  async mounted() {
    await this.initEthers();
  },
  methods: {
    async initEthers() {
      try {
        // 连接到以太坊网络
        if (window.ethereum) {
          // ethers v6中Web3Provider更名为BrowserProvider
          provider = new ethers.BrowserProvider(window.ethereum);
          
          // 请求用户连接钱包
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // 获取链ID - 直接从ethereum对象获取
          try {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            this.cachedChainId = parseInt(chainIdHex, 16);
            console.log('缓存的chainId:', this.cachedChainId);
          } catch (err) {
            console.error('获取chainId失败:', err);
          }
          
          // 在ethers v6中获取签名者方法是异步的
          signer = await provider.getSigner();
          
          // 初始化TokenBank合约
          tokenBankContract = new ethers.Contract(
            this.tokenBankAddress,
            TokenBankABI,
            signer
          );
        } else {
          this.error = '请安装MetaMask或其他兼容的钱包扩展';
        }
      } catch (error) {
        this.error = `初始化错误: ${error.message}`;
      }
    },
    
    async deposit() {
      try {
        this.error = '';
        this.txHash = '';
        
        if (!this.tokenAddress || !this.amount) {
          this.error = '请输入代币地址和数量';
          return;
        }
        
        // ethers v6中parseUnits现在是单独的函数
        const amountWei = ethers.parseUnits(this.amount, 18);
        
        // 创建代币合约
        const tokenContract = new ethers.Contract(
          this.tokenAddress,
          ERC20ABI,
          signer
        );
        
        // 授权代币
        const approveTx = await tokenContract.approve(this.tokenBankAddress, amountWei);
        await approveTx.wait();
        
        // 执行存款
        const tx = await tokenBankContract.deposit(this.tokenAddress, amountWei);
        const receipt = await tx.wait();
        
        this.txHash = receipt.hash; // ethers v6中是hash而不是transactionHash
      } catch (error) {
        this.error = `存款失败: ${error.message}`;
      }
    },
    
    async depositWithPermit2() {
      try {
        this.error = '';
        this.txHash = '';
        
        if (!this.tokenAddress || !this.amount) {
          this.error = '请输入代币地址和数量';
          return;
        }
        
        // ethers v6中parseUnits现在是单独的函数
        const amountWei = ethers.parseUnits(this.amount, 18);
        
        // 获取permit2合约地址
        const permit2Address = await tokenBankContract.PERMIT2();
        console.log('Permit2地址:', permit2Address);
        
        // 获取用户地址
        const userAddress = await signer.getAddress();
        
        // 使用缓存的chainId或从ethereum对象获取
        let chainId = this.cachedChainId;
        if (!chainId) {
          try {
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            chainId = parseInt(chainIdHex, 16);
            console.log('重新获取的chainId:', chainId);
          } catch (error) {
            console.error('获取chainId失败:', error);
            this.error = '无法获取链ID，请刷新页面重试';
            return;
          }
        }
        
        // 使用简单nonce
        const nonce = BigInt(Math.floor(Math.random() * 1000000));
        console.log('使用的nonce:', nonce.toString());
        
        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1小时后过期
        
        // 构建permit2签名消息
        const domain = {
          name: 'Permit2',
          chainId: chainId,
          verifyingContract: permit2Address
        };
        
        const types = {
          PermitSingle: [
            { name: 'token', type: 'address' },
            { name: 'amount', type: 'uint256' },
            { name: 'spender', type: 'address' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
          ]
        };
        
        const value = {
          token: this.tokenAddress,
          amount: amountWei.toString(), // 确保是字符串
          spender: this.tokenBankAddress,
          nonce: nonce.toString(), // 确保是字符串
          deadline: deadline
        };
        
        console.log('Domain:', domain);
        console.log('Value:', value);
        
        // 签名 - 避免使用ethers对象的签名方法，直接使用ethereum对象
        let signature;
        try {
          // ethers v6中使用signTypedData方法代替_signTypedData
          // 但为了避免proxy问题，我们直接使用window.ethereum对象
          const typedData = JSON.stringify({
            types: {
              EIP712Domain: [
                { name: 'name', type: 'string' },
                { name: 'chainId', type: 'uint256' },
                { name: 'verifyingContract', type: 'address' }
              ],
              ...types
            },
            primaryType: 'PermitSingle',
            domain,
            message: value
          }, replaceBigInt);
          
          console.log('待签名数据:', typedData);
          
          signature = await window.ethereum.request({
            method: 'eth_signTypedData_v4',
            params: [userAddress, typedData]
          });
        } catch (signError) {
          console.error('签名失败:', signError);
          this.error = `签名失败: ${signError.message}`;
          return;
        }
        
        console.log('获取的签名:', signature);
        console.log('参数分别为:', 
          this.tokenAddress,
          amountWei.toString(),
          nonce.toString(),
          deadline,
          signature);
        
        // 执行带签名的存款
        const tx = await tokenBankContract.depositWithPermit2(
          this.tokenAddress,
          amountWei,
          nonce,
          deadline,
          signature,
          { gasLimit: 500000 } // 手动设置gas限制
        );
        
        const receipt = await tx.wait();
        this.txHash = receipt.hash; // ethers v6中是hash而不是transactionHash
      } catch (error) {
        console.error('详细错误:', error);
        this.error = `Permit2签名存款失败: ${error.message}`;
        
        // 尝试解析错误原因
        if (error.data) {
          console.log('错误数据:', error.data);
        }
        
        // 检查是否有 error.reason
        if (error.reason) {
          console.log('错误原因:', error.reason);
        }
      }
    },
    
    async withdraw() {
      try {
        this.error = '';
        this.txHash = '';
        
        if (!this.tokenAddress || !this.amount) {
          this.error = '请输入代币地址和数量';
          return;
        }
        
        // ethers v6中parseUnits现在是单独的函数
        const amountWei = ethers.parseUnits(this.amount, 18);
        
        // 执行取款
        const tx = await tokenBankContract.withdraw(this.tokenAddress, amountWei);
        const receipt = await tx.wait();
        
        this.txHash = receipt.hash; // ethers v6中是hash而不是transactionHash
      } catch (error) {
        this.error = `取款失败: ${error.message}`;
      }
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
  margin-right: 10px;
  margin-bottom: 10px;
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
.error {
  background-color: #ffebee;
  color: #c62828;
}
pre {
  white-space: pre-wrap;
  word-wrap: break-word;
}
.buttons {
  margin-bottom: 20px;
}
</style> 