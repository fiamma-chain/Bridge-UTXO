# Fiamma Bridge UTXO API Documentation

## Overview

This document describes the API interface for the Fiamma Bridge UTXO Management System. The API provides endpoints for managing users, UTXOs, transactions, and committee operations.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │   API Service   │    │   Backend API   │
│                 │    │   Adapter       │    │                 │
│ - Components    │◄──►│ - Real API      │◄──►│ - REST Endpoints│
│ - State Mgmt    │    │ - Mock API      │    │ - Database      │
│ - UI Logic      │    │ - Error Handle  │    │ - Business Logic│
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## API Service Usage

### Basic Setup

```javascript
import apiService from './services/apiService.js';

// Initialize the service (happens automatically)
await apiService.initialize();

// Check API configuration
const config = apiService.getConfig();
console.log('API Mode:', config.mode); // 'mock' or 'real'
```

### Environment Configuration

```bash
# .env file
REACT_APP_API_URL=http://localhost:8080/api
REACT_APP_USE_MOCK_API=false  # Set to 'true' for development
```

## API Endpoints

### User Management

#### Get All Users
```javascript
const response = await apiService.getAllUsers();
// Returns: { success: true, data: User[], message: string, timestamp: number }
```

#### Get User by ID
```javascript
const response = await apiService.getUserById('U_0');
// Returns: { success: true, data: User, message: string, timestamp: number }
```

#### Get User by Address
```javascript
const response = await apiService.getUserByAddress('1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa');
// Returns: { success: true, data: User, message: string, timestamp: number }
```

#### Create User
```javascript
const userData = {
  name: 'New User',
  address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  publicKey: '02...',
  role: 'User',
  type: 'user'
};

const response = await apiService.createUser(userData);
// Returns: { success: true, data: User, message: string, timestamp: number }
```

### UTXO Management

#### Get All UTXOs
```javascript
// Basic usage
const response = await apiService.getAllUTXOs();

// With filters
const response = await apiService.getAllUTXOs({
  min_amount: 0.01,
  max_amount: 10.0,
  status: 'unspent'
});
// Returns: { success: true, data: UTXO[], message: string, timestamp: number }
```

#### Get UTXOs by User
```javascript
const response = await apiService.getUTXOsByUser('U_0');
// Returns: { success: true, data: UTXO[], message: string, timestamp: number }
```

#### Get UTXO by Transaction Output
```javascript
const response = await apiService.getUTXOByTxOut('txid123...', 0);
// Returns: { success: true, data: UTXO, message: string, timestamp: number }
```

#### Get UTXOs by Amount Range
```javascript
const response = await apiService.getUTXOsByAmountRange(0.01, 1.0);
// Returns: { success: true, data: UTXO[], message: string, timestamp: number }
```

#### Get UTXOs by Status
```javascript
const response = await apiService.getUTXOsByStatus('unspent');
// Returns: { success: true, data: UTXO[], message: string, timestamp: number }
```

### Transaction Management

#### Get All Transactions
```javascript
const response = await apiService.getAllTransactions();
// Returns: { success: true, data: Transaction[], message: string, timestamp: number }
```

#### Get Transaction by ID
```javascript
const response = await apiService.getTransactionById('txid123...');
// Returns: { success: true, data: Transaction, message: string, timestamp: number }
```

#### Get Transactions by User
```javascript
const response = await apiService.getTransactionsByUser('U_0');
// Returns: { success: true, data: Transaction[], message: string, timestamp: number }
```

#### Get Pending Transactions
```javascript
const response = await apiService.getPendingTransactions();
// Returns: { success: true, data: Transaction[], message: string, timestamp: number }
```

#### Create Transaction
```javascript
const transactionData = {
  inputs: [
    { txid: 'prev_txid', vout: 0, amount: 1.0 }
  ],
  outputs: [
    { address: '1A1z...', amount: 0.999 }
  ],
  fee: 0.001
};

const response = await apiService.createTransaction(transactionData);
// Returns: { success: true, data: Transaction, message: string, timestamp: number }
```

### Committee Operations

#### Get Committee Information
```javascript
const response = await apiService.getCommitteeInfo();
// Returns: { success: true, data: Committee, message: string, timestamp: number }
```

#### Get Committee Members
```javascript
const response = await apiService.getCommitteeMembers();
// Returns: { success: true, data: CommitteeMember[], message: string, timestamp: number }
```

### Combined Operations

#### Get Complete UTXO Data
```javascript
const response = await apiService.getCompleteUTXOData();
// Returns: {
//   success: true,
//   data: {
//     utxos: UTXO[],
//     users: User[],
//     committee: Committee,
//     statistics: Statistics,
//     timestamp: string
//   },
//   message: string,
//   timestamp: number
// }
```

#### Get User Dashboard
```javascript
const response = await apiService.getUserDashboard('U_0');
// Returns: {
//   success: true,
//   data: {
//     user: User,
//     utxos: UTXO[],
//     transactions: Transaction[],
//     summary: {
//       totalUTXOs: number,
//       totalAmount: number,
//       pendingTransactions: number
//     }
//   },
//   message: string,
//   timestamp: number
// }
```

## Data Types

### User
```typescript
interface User {
  id: string;                    // e.g., "U_0", "U_1"
  name: string;                  // e.g., "User_0"
  address: string;               // Bitcoin address
  publicKey: string;             // Public key hex
  role: "User";                  // User role
  type: "user";                  // User type
  createdAt: Date;               // Account creation
  lastActive: Date;              // Last activity
  status: "active" | "inactive" | "suspended";
}
```

### UTXO
```typescript
interface UTXO {
  id: string;                    // Unique identifier
  amount: number;                // Amount in BTC
  txid: string;                  // Transaction ID
  vout: number;                  // Output index
  confirmations: number;         // Confirmation count
  multisig: MultisigConfig;      // Multisig configuration
  status: "unspent" | "pending" | "spent" | "locked";
  createdAt: Date;               // Creation timestamp
  lastUpdated: Date;             // Last update
  blockHeight: number;           // Block height
  position?: {                   // For visualization
    x: number;
    y: number;
    vx: number;
    vy: number;
  };
}
```

### MultisigConfig
```typescript
interface MultisigConfig {
  id: string;                    // Configuration ID
  m: number;                     // Required signatures (2)
  n: number;                     // Total signers (2)
  signers: (User | CommitteeMember)[];
  scriptType: "P2WSH";           // Script type
  description: string;           // Human readable
  redeemScript: string;          // Redeem script hex
  createdAt: Date;               // Creation time
}
```

### Transaction
```typescript
interface Transaction {
  txid: string;                  // Transaction ID
  inputs: TransactionInput[];    // Transaction inputs
  outputs: TransactionOutput[];  // Transaction outputs
  status: "draft" | "pending_signatures" | "ready_to_broadcast" | "broadcast" | "confirmed" | "failed";
  fee: number;                   // Fee in BTC
  size: number;                  // Size in bytes
  confirmations: number;         // Confirmation count
  createdAt: Date;               // Creation time
  broadcastAt?: Date;            // Broadcast time
  confirmedAt?: Date;            // Confirmation time
  signatures: Signature[];       // Collected signatures
  metadata: object;              // Additional data
}
```

## Error Handling

All API calls return a standardized response format:

```javascript
// Success response
{
  success: true,
  data: any,
  message: string,
  timestamp: number
}

// Error response
{
  success: false,
  error: string,
  timestamp: number
}
```

### Error Handling Example
```javascript
try {
  const response = await apiService.getAllUTXOs();
  
  if (response.success) {
    console.log('UTXOs:', response.data);
  } else {
    console.error('API Error:', response.error);
  }
} catch (error) {
  console.error('Network Error:', error.message);
}
```

## Mock API vs Real API

### Development Mode (Mock API)
- Generates realistic test data
- No external dependencies
- Consistent response times
- Perfect for development and testing

### Production Mode (Real API)
- Connects to actual backend
- Real-time data
- Requires backend server
- Production-ready

### Switching Modes
```javascript
// Switch to mock mode
apiService.setMockMode(true);

// Switch to real API mode
apiService.setMockMode(false);

// Check current mode
const config = apiService.getConfig();
console.log('Current mode:', config.mode);
```

## Health Check

```javascript
const health = await apiService.healthCheck();
console.log('API Health:', health);
// Returns: {
//   success: boolean,
//   status: 'healthy' | 'unhealthy' | 'error',
//   mode: 'mock' | 'real',
//   timestamp: number
// }
```

## Integration Example

```javascript
import React, { useState, useEffect } from 'react';
import apiService from './services/apiService.js';

function UTXODashboard() {
  const [utxos, setUtxos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await apiService.getAllUTXOs();
        
        if (response.success) {
          setUtxos(response.data);
        } else {
          setError(response.error);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>UTXOs ({utxos.length})</h1>
      {utxos.map(utxo => (
        <div key={utxo.id}>
          {utxo.amount} BTC - {utxo.status}
        </div>
      ))}
    </div>
  );
}
```

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Use loading states**: Show loading indicators during API calls
3. **Implement fallbacks**: Provide fallback data when API fails
4. **Cache responses**: Consider caching for frequently accessed data
5. **Validate data**: Validate API responses before using them
6. **Monitor performance**: Track API response times and errors

## Troubleshooting

### Common Issues

1. **API not responding**: Check network connection and API URL
2. **CORS errors**: Ensure backend allows cross-origin requests
3. **Authentication errors**: Verify API keys and tokens
4. **Data format errors**: Check data types and structure

### Debug Mode
```javascript
// Enable debug logging
localStorage.setItem('DEBUG_API', 'true');

// Check API configuration
console.log('API Config:', apiService.getConfig());

// Test API health
const health = await apiService.healthCheck();
console.log('API Health:', health);
```
