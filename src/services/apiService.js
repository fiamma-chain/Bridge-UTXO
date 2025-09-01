// API Service Adapter
// This module provides a unified interface that can switch between real API and mock API

import { userAPI, utxoAPI, transactionAPI, committeeAPI, bridgeAPI } from './api';
import { mockAPI } from './mockApi';

// Configuration
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API !== 'false'; // Default to true for development

console.log(`API Service initialized with ${USE_MOCK_API ? 'MOCK' : 'REAL'} API`);

// API Service class that adapts between real and mock APIs
class APIService {
  constructor(useMock = USE_MOCK_API) {
    this.useMock = useMock;
    this.isInitialized = false;
  }

  // Initialize the service
  async initialize() {
    if (this.isInitialized) return;
    
    if (this.useMock) {
      mockAPI.initialize();
    }
    
    this.isInitialized = true;
    console.log('API Service initialized');
  }

  // Switch between mock and real API
  setMockMode(useMock) {
    this.useMock = useMock;
    console.log(`Switched to ${useMock ? 'MOCK' : 'REAL'} API`);
  }

  // Error handler wrapper
  async handleRequest(apiCall, mockCall) {
    try {
      if (this.useMock) {
        return await mockCall();
      } else {
        const response = await apiCall();
        // Wrap real API response to match mock format
        return {
          success: true,
          data: response,
          message: 'Success',
          timestamp: Date.now()
        };
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw {
        success: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }

  // User methods
  async getAllUsers() {
    return this.handleRequest(
      () => userAPI.getAllUsers(),
      () => mockAPI.users.getAll()
    );
  }

  async getUserById(userId) {
    return this.handleRequest(
      () => userAPI.getUserById(userId),
      () => mockAPI.users.getById(userId)
    );
  }

  async getUserByAddress(address) {
    return this.handleRequest(
      () => userAPI.getUserByAddress(address),
      () => mockAPI.users.getByAddress(address)
    );
  }

  async createUser(userData) {
    return this.handleRequest(
      () => userAPI.createUser(userData),
      async () => {
        // Mock implementation for creating user
        await mockAPI.delay();
        const newUser = {
          id: `U_${Date.now()}`,
          ...userData,
          createdAt: new Date(),
          lastActive: new Date(),
          status: 'active'
        };
        return mockAPI.wrapResponse(newUser);
      }
    );
  }

  // UTXO methods
  async getAllUTXOs(params = {}) {
    return this.handleRequest(
      () => utxoAPI.getAllUTXOs(params),
      () => mockAPI.utxos.getAll(params)
    );
  }

  async getUTXOsByUser(userId) {
    return this.handleRequest(
      () => utxoAPI.getUTXOsByUser(userId),
      () => mockAPI.utxos.getByUser(userId)
    );
  }

  async getUTXOByTxOut(txid, vout) {
    return this.handleRequest(
      () => utxoAPI.getUTXOByTxOut(txid, vout),
      () => mockAPI.utxos.getByTxOut(txid, vout)
    );
  }

  async getUTXOsByAmountRange(minAmount, maxAmount) {
    return this.handleRequest(
      () => utxoAPI.getUTXOsByAmountRange(minAmount, maxAmount),
      () => mockAPI.utxos.getAll({ min_amount: minAmount, max_amount: maxAmount })
    );
  }

  async getUTXOsByStatus(status) {
    return this.handleRequest(
      () => utxoAPI.getUTXOsByStatus(status),
      () => mockAPI.utxos.getAll({ status })
    );
  }

  // Transaction methods
  async getAllTransactions(params = {}) {
    return this.handleRequest(
      () => transactionAPI.getAllTransactions(params),
      () => mockAPI.transactions.getAll(params)
    );
  }

  async getTransactionById(txid) {
    return this.handleRequest(
      () => transactionAPI.getTransactionById(txid),
      () => mockAPI.transactions.getById(txid)
    );
  }

  async getTransactionsByUser(userId) {
    return this.handleRequest(
      () => transactionAPI.getTransactionsByUser(userId),
      () => mockAPI.transactions.getByUser(userId)
    );
  }

  async getPendingTransactions() {
    return this.handleRequest(
      () => transactionAPI.getPendingTransactions(),
      () => mockAPI.transactions.getPending()
    );
  }

  async createTransaction(transactionData) {
    return this.handleRequest(
      () => transactionAPI.createTransaction(transactionData),
      async () => {
        await mockAPI.delay();
        const newTransaction = {
          txid: `tx_${Date.now()}`,
          ...transactionData,
          status: 'draft',
          createdAt: new Date()
        };
        return mockAPI.wrapResponse(newTransaction);
      }
    );
  }

  // Committee methods
  async getCommitteeInfo() {
    return this.handleRequest(
      () => committeeAPI.getCommitteeInfo(),
      () => mockAPI.committee.getInfo()
    );
  }

  async getCommitteeMembers() {
    return this.handleRequest(
      () => committeeAPI.getCommitteeMembers(),
      () => mockAPI.committee.getMembers()
    );
  }

  // Combined methods
  async getCompleteUTXOData() {
    return this.handleRequest(
      () => bridgeAPI.getCompleteUTXOData(),
      () => mockAPI.bridge.getCompleteData()
    );
  }

  async getUserDashboard(userId) {
    return this.handleRequest(
      () => bridgeAPI.getUserDashboard(userId),
      () => mockAPI.bridge.getUserDashboard(userId)
    );
  }

  // Utility methods
  async healthCheck() {
    try {
      if (this.useMock) {
        return {
          success: true,
          status: 'healthy',
          mode: 'mock',
          timestamp: Date.now()
        };
      } else {
        // Implement real API health check
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/health`);
        return {
          success: response.ok,
          status: response.ok ? 'healthy' : 'unhealthy',
          mode: 'real',
          timestamp: Date.now()
        };
      }
    } catch (error) {
      return {
        success: false,
        status: 'error',
        error: error.message,
        mode: this.useMock ? 'mock' : 'real',
        timestamp: Date.now()
      };
    }
  }

  // Get current configuration
  getConfig() {
    return {
      useMock: this.useMock,
      isInitialized: this.isInitialized,
      apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
      mode: this.useMock ? 'mock' : 'real'
    };
  }
}

// Create and export singleton instance
const apiService = new APIService();

// Initialize on module load
apiService.initialize().catch(console.error);

export default apiService;

// Also export individual methods for convenience
export const {
  getAllUsers,
  getUserById,
  getUserByAddress,
  createUser,
  getAllUTXOs,
  getUTXOsByUser,
  getUTXOByTxOut,
  getUTXOsByAmountRange,
  getUTXOsByStatus,
  getAllTransactions,
  getTransactionById,
  getTransactionsByUser,
  getPendingTransactions,
  createTransaction,
  getCommitteeInfo,
  getCommitteeMembers,
  getCompleteUTXOData,
  getUserDashboard,
  healthCheck,
  getConfig,
  setMockMode
} = apiService;
