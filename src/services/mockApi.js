// Mock API implementation for development and testing
// This provides realistic data structures matching the real API

import { CONSTANTS } from '../types/index';

// Mock data generators
class MockDataGenerator {
  constructor() {
    this.users = [];
    this.utxos = [];
    this.transactions = [];
    this.committee = null;
    this.initialized = false;
  }

  // Generate random Bitcoin address
  generateAddress() {
    const prefixes = ['1', '3', 'bc1'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = prefix;
    const length = prefix === 'bc1' ? 42 : 34;
    
    for (let i = address.length; i < length; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  }

  // Generate random transaction ID
  generateTxId() {
    const chars = '0123456789abcdef';
    let txid = '';
    for (let i = 0; i < 64; i++) {
      txid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return txid;
  }

  // Generate random public key
  generatePublicKey() {
    const prefixes = ['02', '03'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return prefix + Math.random().toString(16).substr(2, 62).padEnd(62, '0');
  }

  // Generate users
  generateUsers(count = 50) {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: `U_${i}`,
        name: `User_${i}`,
        address: this.generateAddress(),
        publicKey: this.generatePublicKey(),
        role: CONSTANTS.USER_ROLES.USER,
        type: 'user',
        createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
        lastActive: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        status: Math.random() > 0.1 ? 'active' : 'inactive'
      });
    }
    return users;
  }

  // Generate committee
  generateCommittee() {
    return {
      id: 'committee_main',
      name: 'Fiamma Bridge Committee',
      members: [
        {
          id: 'C_0',
          name: 'Committee Node 1',
          address: this.generateAddress(),
          publicKey: this.generatePublicKey(),
          role: CONSTANTS.USER_ROLES.COMMITTEE,
          type: 'committee',
          votingPower: 1,
          joinedAt: new Date('2024-01-01')
        }
      ],
      requiredConsensus: 1,
      totalVotingPower: 1,
      createdAt: new Date('2024-01-01')
    };
  }

  // Generate multisig configuration
  generateMultisigConfig(user, committee) {
    return {
      id: `multisig_${user.id}_${committee.members[0].id}`,
      m: 2,
      n: 2,
      signers: [user, committee.members[0]],
      scriptType: CONSTANTS.SCRIPT_TYPES.P2WSH,
      description: '2-of-2 Multisig: User + Committee',
      redeemScript: '5221' + user.publicKey + committee.members[0].publicKey + '52ae',
      createdAt: new Date()
    };
  }

  // Generate UTXOs with new amount ranges: <0.001, 0.001-0.1, >1
  generateUTXOs(users, committee, count = 100) {
    const utxos = [];
    
    // Generate amount ranges for all five color categories
    const amountRanges = [
      // <0.001 (20% of UTXOs) - Blue
      ...Array(20).fill().map(() => Math.random() * 0.001),
      // 0.001-0.1 (30% of UTXOs) - Green
      ...Array(30).fill().map(() => 0.001 + Math.random() * 0.099),
      // 0.1-1 (25% of UTXOs) - Yellow
      ...Array(25).fill().map(() => 0.1 + Math.random() * 0.9),
      // 1-10 (15% of UTXOs) - Red
      ...Array(15).fill().map(() => 1 + Math.random() * 9),
      // >10 (10% of UTXOs) - Purple
      ...Array(10).fill().map(() => 10 + Math.random() * 90)
    ];

    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const amount = amountRanges[i];
      const multisig = this.generateMultisigConfig(user, committee);

      utxos.push({
        id: `utxo_${i}`,
        amount: amount,
        txid: this.generateTxId(),
        vout: Math.floor(Math.random() * 10),
        confirmations: Math.floor(Math.random() * 1000) + 1,
        multisig,
        status: Math.random() > 0.1 ? CONSTANTS.UTXO_STATUSES.UNSPENT : CONSTANTS.UTXO_STATUSES.PENDING,
        createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
        lastUpdated: new Date(),
        blockHeight: 800000 + Math.floor(Math.random() * 50000),
        position: {
          x: Math.random() * 1200 + 50,
          y: Math.random() * 700 + 50,
          vx: (Math.random() - 0.5) * 2,
          vy: (Math.random() - 0.5) * 2
        }
      });
    }
    return utxos;
  }

  // Generate transactions
  generateTransactions(utxos, count = 50) {
    const transactions = [];
    const statuses = Object.values(CONSTANTS.TRANSACTION_STATUSES);

    for (let i = 0; i < count; i++) {
      const inputUTXOs = utxos.slice(i * 2, i * 2 + 2); // Use 2 UTXOs as inputs
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdAt = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

      transactions.push({
        txid: this.generateTxId(),
        inputs: inputUTXOs.map(utxo => ({
          txid: utxo.txid,
          vout: utxo.vout,
          amount: utxo.amount,
          address: utxo.multisig.signers[0].address,
          scriptSig: ''
        })),
        outputs: [
          {
            index: 0,
            amount: inputUTXOs.reduce((sum, utxo) => sum + utxo.amount, 0) - 0.001, // Minus fee
            address: this.generateAddress(),
            scriptPubKey: ''
          }
        ],
        status,
        fee: 0.001,
        size: 250 + Math.floor(Math.random() * 200),
        confirmations: status === CONSTANTS.TRANSACTION_STATUSES.CONFIRMED ? 
                      Math.floor(Math.random() * 100) + 1 : 0,
        createdAt,
        broadcastAt: status !== CONSTANTS.TRANSACTION_STATUSES.DRAFT ? createdAt : null,
        confirmedAt: status === CONSTANTS.TRANSACTION_STATUSES.CONFIRMED ? 
                    new Date(createdAt.getTime() + Math.random() * 60 * 60 * 1000) : null,
        signatures: inputUTXOs.flatMap(utxo => 
          utxo.multisig.signers.map(signer => ({
            signerId: signer.id,
            signerType: signer.type,
            signature: Math.random() > 0.3 ? this.generateTxId().substr(0, 64) : null,
            publicKey: signer.publicKey,
            signedAt: Math.random() > 0.3 ? new Date() : null,
            verified: Math.random() > 0.1
          }))
        ),
        metadata: {
          purpose: 'Bridge operation',
          priority: Math.random() > 0.5 ? 'high' : 'normal'
        }
      });
    }
    return transactions;
  }

  // Initialize all mock data
  initialize() {
    if (this.initialized) return;

    console.log('Initializing mock data...');
    
    this.users = this.generateUsers(50);
    this.committee = this.generateCommittee();
    this.utxos = this.generateUTXOs(this.users, this.committee, 100);
    this.transactions = this.generateTransactions(this.utxos, 50);
    
    this.initialized = true;
    console.log('Mock data initialized:', {
      users: this.users.length,
      utxos: this.utxos.length,
      transactions: this.transactions.length
    });
  }

  // Force regenerate all data (for development/testing)
  forceRegenerate() {
    console.log('🔄 Force regenerating mock data with new amount ranges...');
    
    this.users = this.generateUsers(50);
    this.committee = this.generateCommittee();
    this.utxos = this.generateUTXOs(this.users, this.committee, 100);
    this.transactions = this.generateTransactions(this.utxos, 50);
    
    console.log('✅ Mock data regenerated:', {
      users: this.users.length,
      utxos: this.utxos.length,
      transactions: this.transactions.length
    });
    
    // Log amount distribution for verification
    const amounts = this.utxos.map(u => u.amount);
    const blueCount = amounts.filter(a => a < 0.001).length;
    const greenCount = amounts.filter(a => a >= 0.001 && a < 0.1).length;
    const yellowCount = amounts.filter(a => a >= 0.1 && a < 1).length;
    const redCount = amounts.filter(a => a >= 1 && a < 10).length;
    const purpleCount = amounts.filter(a => a >= 10).length;
    
    console.log('🎨 Color distribution:', {
      'Blue (<0.001)': blueCount,
      'Green (0.001-0.1)': greenCount,
      'Yellow (0.1-1)': yellowCount,
      'Red (1-10)': redCount,
      'Purple (>10)': purpleCount
    });
  }

  // Get statistics
  getStatistics() {
    const amounts = this.utxos.map(u => u.amount);
    return {
      totalUTXOs: this.utxos.length,
      uniqueUsers: this.users.filter(u => u.status === 'active').length,
      totalAmount: amounts.reduce((sum, amount) => sum + amount, 0),
      largestUTXO: Math.max(...amounts),
      smallestUTXO: Math.min(...amounts),
      averageAmount: amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length,
      pendingTransactions: this.transactions.filter(tx => 
        tx.status === CONSTANTS.TRANSACTION_STATUSES.PENDING_SIGNATURES
      ).length,
      lastUpdated: new Date()
    };
  }
}

// Create singleton instance
const mockDataGenerator = new MockDataGenerator();

// Mock API implementation
export const mockAPI = {
  // Initialize mock data
  initialize() {
    mockDataGenerator.initialize();
  },

  // Simulate API delay
  async delay(ms = 100 + Math.random() * 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  // Wrap response in API format
  wrapResponse(data, message = 'Success') {
    return {
      success: true,
      data,
      message,
      timestamp: Date.now()
    };
  },

  // User endpoints
  users: {
    async getAll() {
      await mockAPI.delay();
      return mockAPI.wrapResponse(mockDataGenerator.users);
    },

    async getById(userId) {
      await mockAPI.delay();
      const user = mockDataGenerator.users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');
      return mockAPI.wrapResponse(user);
    },

    async getByAddress(address) {
      await mockAPI.delay();
      const user = mockDataGenerator.users.find(u => u.address === address);
      if (!user) throw new Error('User not found');
      return mockAPI.wrapResponse(user);
    }
  },

  // UTXO endpoints
  utxos: {
    async getAll(params = {}) {
      await mockAPI.delay();
      let utxos = [...mockDataGenerator.utxos];

      // Apply filters
      if (params.min_amount) {
        utxos = utxos.filter(u => u.amount >= parseFloat(params.min_amount));
      }
      if (params.max_amount) {
        utxos = utxos.filter(u => u.amount <= parseFloat(params.max_amount));
      }
      if (params.status) {
        utxos = utxos.filter(u => u.status === params.status);
      }

      return mockAPI.wrapResponse(utxos);
    },

    async getByUser(userId) {
      await mockAPI.delay();
      const utxos = mockDataGenerator.utxos.filter(u => 
        u.multisig.signers.some(s => s.id === userId)
      );
      return mockAPI.wrapResponse(utxos);
    },

    async getByTxOut(txid, vout) {
      await mockAPI.delay();
      const utxo = mockDataGenerator.utxos.find(u => 
        u.txid === txid && u.vout === parseInt(vout)
      );
      if (!utxo) throw new Error('UTXO not found');
      return mockAPI.wrapResponse(utxo);
    }
  },

  // Transaction endpoints
  transactions: {
    async getAll(params = {}) {
      await mockAPI.delay();
      return mockAPI.wrapResponse(mockDataGenerator.transactions);
    },

    async getById(txid) {
      await mockAPI.delay();
      const tx = mockDataGenerator.transactions.find(t => t.txid === txid);
      if (!tx) throw new Error('Transaction not found');
      return mockAPI.wrapResponse(tx);
    },

    async getByUser(userId) {
      await mockAPI.delay();
      const transactions = mockDataGenerator.transactions.filter(tx =>
        tx.inputs.some(input => {
          const utxo = mockDataGenerator.utxos.find(u => 
            u.txid === input.txid && u.vout === input.vout
          );
          return utxo && utxo.multisig.signers.some(s => s.id === userId);
        })
      );
      return mockAPI.wrapResponse(transactions);
    },

    async getPending() {
      await mockAPI.delay();
      const pending = mockDataGenerator.transactions.filter(tx => 
        tx.status === CONSTANTS.TRANSACTION_STATUSES.PENDING_SIGNATURES
      );
      return mockAPI.wrapResponse(pending);
    }
  },

  // Committee endpoints
  committee: {
    async getInfo() {
      await mockAPI.delay();
      return mockAPI.wrapResponse(mockDataGenerator.committee);
    },

    async getMembers() {
      await mockAPI.delay();
      return mockAPI.wrapResponse(mockDataGenerator.committee.members);
    }
  },

  // Combined endpoints
  bridge: {
    async getCompleteData() {
      await mockAPI.delay(800); // Longer delay for complex operation
      
      // Force regenerate data to ensure we have the latest amount ranges
      mockDataGenerator.forceRegenerate();
      
      return mockAPI.wrapResponse({
        utxos: mockDataGenerator.utxos,
        users: mockDataGenerator.users,
        committee: mockDataGenerator.committee,
        statistics: mockDataGenerator.getStatistics(),
        timestamp: new Date().toISOString()
      });
    },

    async getUserDashboard(userId) {
      await mockAPI.delay(400);
      const user = mockDataGenerator.users.find(u => u.id === userId);
      if (!user) throw new Error('User not found');

      const utxos = mockDataGenerator.utxos.filter(u => 
        u.multisig.signers.some(s => s.id === userId)
      );
      
      const transactions = mockDataGenerator.transactions.filter(tx =>
        tx.inputs.some(input => {
          const utxo = mockDataGenerator.utxos.find(u => 
            u.txid === input.txid && u.vout === input.vout
          );
          return utxo && utxo.multisig.signers.some(s => s.id === userId);
        })
      );

      return mockAPI.wrapResponse({
        user,
        utxos,
        transactions,
        summary: {
          totalUTXOs: utxos.length,
          totalAmount: utxos.reduce((sum, utxo) => sum + utxo.amount, 0),
          pendingTransactions: transactions.filter(tx => 
            tx.status === CONSTANTS.TRANSACTION_STATUSES.PENDING_SIGNATURES
          ).length
        }
      });
    }
  }
};

// Initialize mock data when module is imported
mockAPI.initialize();

export default mockAPI;
