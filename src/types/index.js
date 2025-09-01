// Type definitions for Fiamma Bridge UTXO Management System

/**
 * User data structure
 * @typedef {Object} User
 * @property {string} id - Unique user identifier (e.g., "U_0", "U_1")
 * @property {string} name - User display name
 * @property {string} address - Bitcoin address
 * @property {string} publicKey - User's public key
 * @property {string} role - User role ("User")
 * @property {string} type - User type ("user")
 * @property {Date} createdAt - Account creation timestamp
 * @property {Date} lastActive - Last activity timestamp
 * @property {UserStatus} status - User account status
 */

/**
 * User status enumeration
 * @typedef {"active" | "inactive" | "suspended"} UserStatus
 */

/**
 * Committee member data structure
 * @typedef {Object} CommitteeMember
 * @property {string} id - Committee member ID
 * @property {string} name - Committee member name
 * @property {string} address - Bitcoin address
 * @property {string} publicKey - Committee member's public key
 * @property {string} role - Role ("Committee")
 * @property {string} type - Type ("committee")
 * @property {number} votingPower - Voting power weight
 * @property {Date} joinedAt - When joined committee
 */

/**
 * Multisig configuration
 * @typedef {Object} MultisigConfig
 * @property {string} id - Configuration ID
 * @property {number} m - Required signatures (e.g., 2)
 * @property {number} n - Total signers (e.g., 2)
 * @property {Array<User|CommitteeMember>} signers - Array of signers
 * @property {string} scriptType - Script type ("P2WSH")
 * @property {string} description - Human readable description
 * @property {string} redeemScript - Redeem script hex
 * @property {Date} createdAt - Creation timestamp
 */

/**
 * UTXO data structure
 * @typedef {Object} UTXO
 * @property {string} id - Unique UTXO identifier
 * @property {number} amount - Amount in BTC
 * @property {string} txid - Transaction ID
 * @property {number} vout - Output index
 * @property {number} confirmations - Number of confirmations
 * @property {MultisigConfig} multisig - Multisig configuration
 * @property {UTXOStatus} status - UTXO status
 * @property {Date} createdAt - When UTXO was created
 * @property {Date} lastUpdated - Last update timestamp
 * @property {number} blockHeight - Block height when created
 * @property {Object} position - Display position for visualization
 * @property {number} position.x - X coordinate
 * @property {number} position.y - Y coordinate
 * @property {number} position.vx - X velocity
 * @property {number} position.vy - Y velocity
 */

/**
 * UTXO status enumeration
 * @typedef {"unspent" | "pending" | "spent" | "locked"} UTXOStatus
 */

/**
 * Transaction data structure
 * @typedef {Object} Transaction
 * @property {string} txid - Transaction ID
 * @property {Array<TransactionInput>} inputs - Transaction inputs
 * @property {Array<TransactionOutput>} outputs - Transaction outputs
 * @property {TransactionStatus} status - Transaction status
 * @property {number} fee - Transaction fee in BTC
 * @property {number} size - Transaction size in bytes
 * @property {number} confirmations - Number of confirmations
 * @property {Date} createdAt - Transaction creation time
 * @property {Date} broadcastAt - When transaction was broadcast
 * @property {Date} confirmedAt - When transaction was confirmed
 * @property {Array<Signature>} signatures - Collected signatures
 * @property {Object} metadata - Additional metadata
 */

/**
 * Transaction status enumeration
 * @typedef {"draft" | "pending_signatures" | "ready_to_broadcast" | "broadcast" | "confirmed" | "failed"} TransactionStatus
 */

/**
 * Transaction input
 * @typedef {Object} TransactionInput
 * @property {string} txid - Previous transaction ID
 * @property {number} vout - Previous output index
 * @property {number} amount - Input amount in BTC
 * @property {string} address - Input address
 * @property {string} scriptSig - Script signature
 */

/**
 * Transaction output
 * @typedef {Object} TransactionOutput
 * @property {number} index - Output index
 * @property {number} amount - Output amount in BTC
 * @property {string} address - Destination address
 * @property {string} scriptPubKey - Script public key
 */

/**
 * Signature data structure
 * @typedef {Object} Signature
 * @property {string} signerId - ID of the signer
 * @property {string} signerType - Type of signer ("user" | "committee")
 * @property {string} signature - Signature hex
 * @property {string} publicKey - Signer's public key
 * @property {Date} signedAt - When signature was created
 * @property {boolean} verified - Whether signature is verified
 */

/**
 * API Response wrapper
 * @typedef {Object} ApiResponse
 * @property {boolean} success - Whether request was successful
 * @property {*} data - Response data
 * @property {string} message - Response message
 * @property {number} timestamp - Response timestamp
 * @property {Object} pagination - Pagination info (if applicable)
 */

/**
 * Pagination info
 * @typedef {Object} Pagination
 * @property {number} page - Current page
 * @property {number} limit - Items per page
 * @property {number} total - Total items
 * @property {number} totalPages - Total pages
 * @property {boolean} hasNext - Has next page
 * @property {boolean} hasPrev - Has previous page
 */

/**
 * Statistics data structure
 * @typedef {Object} Statistics
 * @property {number} totalUTXOs - Total number of UTXOs
 * @property {number} uniqueUsers - Number of unique users
 * @property {number} totalAmount - Total amount in BTC
 * @property {number} largestUTXO - Largest UTXO amount
 * @property {number} smallestUTXO - Smallest UTXO amount
 * @property {number} averageAmount - Average UTXO amount
 * @property {number} pendingTransactions - Number of pending transactions
 * @property {Date} lastUpdated - When statistics were last updated
 */

/**
 * Committee consensus data
 * @typedef {Object} ConsensusData
 * @property {string} proposalId - Proposal ID
 * @property {string} type - Proposal type
 * @property {Object} proposal - Proposal details
 * @property {Array<Vote>} votes - Committee votes
 * @property {ConsensusStatus} status - Consensus status
 * @property {number} requiredVotes - Required votes for approval
 * @property {number} currentVotes - Current vote count
 * @property {Date} createdAt - Proposal creation time
 * @property {Date} expiresAt - Proposal expiration time
 */

/**
 * Consensus status enumeration
 * @typedef {"pending" | "approved" | "rejected" | "expired"} ConsensusStatus
 */

/**
 * Committee vote
 * @typedef {Object} Vote
 * @property {string} memberId - Committee member ID
 * @property {VoteType} vote - Vote type
 * @property {string} reason - Vote reason (optional)
 * @property {Date} votedAt - When vote was cast
 */

/**
 * Vote type enumeration
 * @typedef {"approve" | "reject" | "abstain"} VoteType
 */

// Export types for JSDoc usage
export const Types = {
  User: 'User',
  CommitteeMember: 'CommitteeMember',
  MultisigConfig: 'MultisigConfig',
  UTXO: 'UTXO',
  Transaction: 'Transaction',
  Signature: 'Signature',
  ApiResponse: 'ApiResponse',
  Statistics: 'Statistics',
  ConsensusData: 'ConsensusData'
};

// Constants
export const CONSTANTS = {
  MULTISIG_TYPE: {
    TWO_OF_TWO: '2-2',
    TWO_OF_THREE: '2-3',
    THREE_OF_FIVE: '3-5'
  },
  
  SCRIPT_TYPES: {
    P2WSH: 'P2WSH',
    P2SH: 'P2SH',
    P2WPKH: 'P2WPKH'
  },
  
  USER_ROLES: {
    USER: 'User',
    COMMITTEE: 'Committee',
    ADMIN: 'Admin'
  },
  
  TRANSACTION_STATUSES: {
    DRAFT: 'draft',
    PENDING_SIGNATURES: 'pending_signatures',
    READY_TO_BROADCAST: 'ready_to_broadcast',
    BROADCAST: 'broadcast',
    CONFIRMED: 'confirmed',
    FAILED: 'failed'
  },
  
  UTXO_STATUSES: {
    UNSPENT: 'unspent',
    PENDING: 'pending',
    SPENT: 'spent',
    LOCKED: 'locked'
  }
};

export default Types;
