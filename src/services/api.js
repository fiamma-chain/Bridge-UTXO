// API Service for Fiamma Bridge UTXO Management
// This module handles all API calls for user, UTXO, and transaction data

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// API endpoints
const ENDPOINTS = {
  USERS: '/users',
  UTXOS: '/utxos',
  TRANSACTIONS: '/transactions',
  MULTISIG: '/multisig',
  COMMITTEE: '/committee'
};

// HTTP client wrapper with error handling
class ApiClient {
  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return this.request(url, { method: 'GET' });
  }

  // POST request
  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // PUT request
  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE request
  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
const apiClient = new ApiClient();

// User API functions
export const userAPI = {
  // Get all users
  async getAllUsers() {
    return apiClient.get(ENDPOINTS.USERS);
  },

  // Get user by ID
  async getUserById(userId) {
    return apiClient.get(`${ENDPOINTS.USERS}/${userId}`);
  },

  // Get user by address
  async getUserByAddress(address) {
    return apiClient.get(`${ENDPOINTS.USERS}/address/${address}`);
  },

  // Create new user
  async createUser(userData) {
    return apiClient.post(ENDPOINTS.USERS, userData);
  },

  // Update user
  async updateUser(userId, userData) {
    return apiClient.put(`${ENDPOINTS.USERS}/${userId}`, userData);
  }
};

// UTXO API functions
export const utxoAPI = {
  // Get all UTXOs
  async getAllUTXOs(params = {}) {
    return apiClient.get(ENDPOINTS.UTXOS, params);
  },

  // Get UTXOs by user ID
  async getUTXOsByUser(userId) {
    return apiClient.get(`${ENDPOINTS.UTXOS}/user/${userId}`);
  },

  // Get UTXO by transaction ID and output index
  async getUTXOByTxOut(txid, vout) {
    return apiClient.get(`${ENDPOINTS.UTXOS}/${txid}/${vout}`);
  },

  // Get UTXOs by amount range
  async getUTXOsByAmountRange(minAmount, maxAmount) {
    return apiClient.get(ENDPOINTS.UTXOS, {
      min_amount: minAmount,
      max_amount: maxAmount
    });
  },

  // Get UTXOs by status
  async getUTXOsByStatus(status) {
    return apiClient.get(ENDPOINTS.UTXOS, { status });
  }
};

// Transaction API functions
export const transactionAPI = {
  // Get all transactions
  async getAllTransactions(params = {}) {
    return apiClient.get(ENDPOINTS.TRANSACTIONS, params);
  },

  // Get transaction by ID
  async getTransactionById(txid) {
    return apiClient.get(`${ENDPOINTS.TRANSACTIONS}/${txid}`);
  },

  // Get transactions by user
  async getTransactionsByUser(userId) {
    return apiClient.get(`${ENDPOINTS.TRANSACTIONS}/user/${userId}`);
  },

  // Get pending transactions
  async getPendingTransactions() {
    return apiClient.get(`${ENDPOINTS.TRANSACTIONS}/pending`);
  },

  // Create new transaction
  async createTransaction(transactionData) {
    return apiClient.post(ENDPOINTS.TRANSACTIONS, transactionData);
  },

  // Sign transaction
  async signTransaction(txid, signatureData) {
    return apiClient.post(`${ENDPOINTS.TRANSACTIONS}/${txid}/sign`, signatureData);
  },

  // Broadcast transaction
  async broadcastTransaction(txid) {
    return apiClient.post(`${ENDPOINTS.TRANSACTIONS}/${txid}/broadcast`);
  }
};

// Multisig API functions
export const multisigAPI = {
  // Get multisig configuration
  async getMultisigConfig(configId) {
    return apiClient.get(`${ENDPOINTS.MULTISIG}/${configId}`);
  },

  // Create multisig configuration
  async createMultisigConfig(configData) {
    return apiClient.post(ENDPOINTS.MULTISIG, configData);
  },

  // Get signatures for transaction
  async getTransactionSignatures(txid) {
    return apiClient.get(`${ENDPOINTS.MULTISIG}/signatures/${txid}`);
  }
};

// Committee API functions
export const committeeAPI = {
  // Get committee information
  async getCommitteeInfo() {
    return apiClient.get(ENDPOINTS.COMMITTEE);
  },

  // Get committee members
  async getCommitteeMembers() {
    return apiClient.get(`${ENDPOINTS.COMMITTEE}/members`);
  },

  // Get committee consensus status
  async getConsensusStatus(proposalId) {
    return apiClient.get(`${ENDPOINTS.COMMITTEE}/consensus/${proposalId}`);
  }
};

// Combined API functions for complex operations
export const bridgeAPI = {
  // Get complete UTXO data with user and multisig info
  async getCompleteUTXOData() {
    try {
      const [utxos, users, committee] = await Promise.all([
        utxoAPI.getAllUTXOs(),
        userAPI.getAllUsers(),
        committeeAPI.getCommitteeInfo()
      ]);

      return {
        utxos,
        users,
        committee,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to fetch complete UTXO data:', error);
      throw error;
    }
  },

  // Get user dashboard data
  async getUserDashboard(userId) {
    try {
      const [user, utxos, transactions] = await Promise.all([
        userAPI.getUserById(userId),
        utxoAPI.getUTXOsByUser(userId),
        transactionAPI.getTransactionsByUser(userId)
      ]);

      return {
        user,
        utxos,
        transactions,
        summary: {
          totalUTXOs: utxos.length,
          totalAmount: utxos.reduce((sum, utxo) => sum + utxo.amount, 0),
          pendingTransactions: transactions.filter(tx => tx.status === 'pending').length
        }
      };
    } catch (error) {
      console.error('Failed to fetch user dashboard:', error);
      throw error;
    }
  }
};

export default apiClient;
