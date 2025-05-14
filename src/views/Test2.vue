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
import { ethers } from 'ethers';
import TokenBankABI from '../abi/TokenBank.json';
import ERC20ABI from '../abi/ERC20.json'; // 请确保你有ERC20的ABI

export default {
  name: 'TestPageTwo',
  data() {
    return {
      provider: null,
      signer: null,
      tokenBankAddress: '0x1234567890123456789012345678901234567890', // 替换为你的TokenBank合约地址
      tokenBankContract: null,
      tokenAddress: '',
      amount: '',
      txHash: '',
      error: '',
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
          this.provider = new ethers.providers.Web3Provider(window.ethereum);
          
          // 请求用户连接钱包
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          this.signer = this.provider.getSigner();
          
          // 初始化TokenBank合约
          this.tokenBankContract = new ethers.Contract(
            this.tokenBankAddress,
            TokenBankABI,
            this.signer
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
        
        const amountWei = ethers.utils.parseUnits(this.amount, 18); // 假设18位小数，你可能需要动态获取
        
        // 首先需要授权TokenBank合约使用代币
        const tokenContract = new ethers.Contract(
          this.tokenAddress,
          ERC20ABI,
          this.signer
        );
        
        // 授权代币
        const approveTx = await tokenContract.approve(this.tokenBankAddress, amountWei);
        await approveTx.wait();
        
        // 执行存款
        const tx = await this.tokenBankContract.deposit(this.tokenAddress, amountWei);
        const receipt = await tx.wait();
        
        this.txHash = receipt.transactionHash;
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
        
        const amountWei = ethers.utils.parseUnits(this.amount, 18); // 假设18位小数
        
        // 获取permit2合约地址
        const permit2Address = await this.tokenBankContract.PERMIT2();
        
        // 构建permit2签名数据
        const userAddress = await this.signer.getAddress();
        const chainId = (await this.provider.getNetwork()).chainId;
        const nonce = ethers.BigNumber.from(ethers.utils.randomBytes(32)); // 随机nonce
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
          amount: amountWei,
          spender: this.tokenBankAddress,
          nonce: nonce,
          deadline: deadline
        };
        
        // 签名
        const signature = await this.signer._signTypedData(domain, types, value);
        
        // 执行带签名的存款
        const tx = await this.tokenBankContract.depositWithPermit2(
          this.tokenAddress,
          amountWei,
          nonce,
          deadline,
          signature
        );
        
        const receipt = await tx.wait();
        this.txHash = receipt.transactionHash;
      } catch (error) {
        this.error = `Permit2签名存款失败: ${error.message}`;
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
        
        const amountWei = ethers.utils.parseUnits(this.amount, 18); // 假设18位小数
        
        // 执行取款
        const tx = await this.tokenBankContract.withdraw(this.tokenAddress, amountWei);
        const receipt = await tx.wait();
        
        this.txHash = receipt.transactionHash;
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