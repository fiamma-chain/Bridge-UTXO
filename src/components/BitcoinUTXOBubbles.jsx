import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Wallet, Bitcoin, RefreshCw, Info, Users, Key, AlertCircle, Loader2, Target, Zap, RotateCcw } from 'lucide-react';
import apiService from '../services/apiService';

const BitcoinUTXOBubbles = () => {
  const [utxos, setUtxos] = useState([]);
  const [selectedUTXO, setSelectedUTXO] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 1300, height: 800 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiConfig, setApiConfig] = useState(null);
  const [clusterMode, setClusterMode] = useState('normal'); // 'normal', 'cluster', 'scatter'
  const [modeTransition, setModeTransition] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(1);

  // Update canvas size and scale factor based on window size - Responsive scaling
  useEffect(() => {
    const updateCanvasSize = () => {
      // Calculate responsive dimensions
      const baseWidth = 1400;
      const baseHeight = 900;
      const availableWidth = window.innerWidth - 40;
      const availableHeight = window.innerHeight - 200;
      
      // Calculate scale factor based on available space
      const scaleX = availableWidth / baseWidth;
      const scaleY = availableHeight / baseHeight;
      const scale = Math.min(scaleX, scaleY, 1.5); // Max scale of 1.5x
      
      // Apply responsive scaling
      const width = Math.max(baseWidth, availableWidth);
      const height = Math.max(baseHeight, availableHeight);
      
      setCanvasSize({ width, height });
      setScaleFactor(scale);
      
      console.log(`📐 Canvas updated: ${width}x${height}, Scale: ${scale.toFixed(2)}x`);
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Generate random address
  const generateAddress = () => {
    const prefixes = ['1', '3', 'bc1'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let address = prefix;
    const length = prefix === 'bc1' ? 42 : 34;
    
    for (let i = address.length; i < length; i++) {
      address += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return address;
  };

  // Generate user pool with unique identifiers
  const generateUserPool = (count = 50) => {
    const users = [];
    for (let i = 0; i < count; i++) {
      users.push({
        id: `U_${i}`,
        address: generateAddress(),
        publicKey: `02${Math.random().toString(16).substr(2, 64)}`,
        name: `User_${i}`,
        role: 'User',
        type: 'user'
      });
    }
    return users;
  };

  // Generate multisig configuration - Fixed 2-2 P2WSH, User and Committee
  const generateMultisigConfig = (userPool) => {
    // Randomly select a user from the pool
    const selectedUser = userPool[Math.floor(Math.random() * userPool.length)];
    
    const signers = [
      selectedUser,
      {
        address: generateAddress(),
        publicKey: `03${Math.random().toString(16).substr(2, 64)}`,
        name: 'C',
        role: 'Committee',
        type: 'committee'
      }
    ];
    
    return {
      m: 2,
      n: 2,
      signers,
      scriptType: 'P2WSH',
      description: '2-of-2 Multisig: User + Committee'
    };
  };

  // Load UTXO data from API
  const loadUTXOData = useCallback(async () => {
    try {
      console.log('🔄 Starting to load UTXO data...');
      setLoading(true);
      setError(null);
      
      console.log('📡 Calling apiService.getCompleteUTXOData()...');
      const response = await apiService.getCompleteUTXOData();
      console.log('📨 API Response:', response);
      
      if (response.success) {
        const { utxos: apiUTXOs } = response.data;
        console.log('✅ Received UTXOs:', apiUTXOs.length);
        
        // Add position data for visualization if not present
        const utxosWithPosition = apiUTXOs.map((utxo, index) => {
          const size = Math.sqrt(Math.max(0.001, utxo.amount)) * 20 + 10;
          return {
            ...utxo,
            x: Math.random() * (canvasSize.width - size * 2) + size,
            y: Math.random() * (canvasSize.height - size * 2) + size,
            vx: (Math.random() - 0.5) * 2,
            vy: (Math.random() - 0.5) * 2,
            size: size
          };
        });
        
        console.log('🎯 Setting UTXOs with random positions:', utxosWithPosition.length);
        setUtxos(utxosWithPosition);
      } else {
        throw new Error(response.error || 'Failed to load UTXO data');
      }
    } catch (err) {
      console.error('❌ Failed to load UTXO data:', err);
      setError(err.message);
      
      // Fallback to generated data if API fails
      console.log('🔄 Using fallback data...');
      const fallbackData = generateFallbackUTXOs();
      console.log('📦 Fallback data generated:', fallbackData.length);
      setUtxos(fallbackData);
    } finally {
      setLoading(false);
      console.log('✅ Loading completed');
    }
  }, [canvasSize]);


  // Fallback UTXO generation with new amount ranges
  const generateFallbackUTXOs = useCallback(() => {
    const utxoData = [];
    // Five color ranges: Blue, Green, Yellow, Red, Purple
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
    
    const userPool = generateUserPool(50);
    
    for (let i = 0; i < 100; i++) {
      const amount = amountRanges[i];
      const multisig = generateMultisigConfig(userPool);
      const size = Math.sqrt(Math.max(0.001, amount)) * 20 + 10;
      
      utxoData.push({
        id: `fallback_${i}`,
        amount: amount,
        txid: `${Math.random().toString(36).substr(2, 8)}...${Math.random().toString(36).substr(2, 8)}`,
        vout: Math.floor(Math.random() * 10),
        confirmations: Math.floor(Math.random() * 1000) + 1,
        multisig,
        status: 'unspent',
        x: Math.random() * (canvasSize.width - size * 2) + size,
        y: Math.random() * (canvasSize.height - size * 2) + size,
        vx: (Math.random() - 0.5) * 2 * scaleFactor,
        vy: (Math.random() - 0.5) * 2 * scaleFactor,
        size: size
      });
    }
    
    return utxoData;
  }, [canvasSize]);

  // Calculate bubble size based on amount - optimized for text display
  const getBubbleSize = (amount) => {
    let baseSize;
    
    if (amount < 0.001) {
      // Micro bubbles for amounts < 0.001 BTC (blue - smallest)
      baseSize = 8 + Math.random() * 4; // 8-12px
    } else if (amount < 0.1) {
      // Small bubbles for amounts 0.001-0.1 BTC (green - small)
      const minSize = 15;
      const maxSize = 28;
      const logAmount = Math.log10(amount);
      const minLogAmount = Math.log10(0.001);
      const maxLogAmount = Math.log10(0.1);
      baseSize = minSize + ((logAmount - minLogAmount) / (maxLogAmount - minLogAmount)) * (maxSize - minSize);
    } else {
      // Larger bubbles for amounts >= 0.1 BTC (text will be inside)
      const minSize = 40; // Minimum size to fit text inside
      const maxSize = 80;
      const logAmount = Math.log10(amount);
      const maxLogAmount = Math.log10(101);
      const minLogAmount = Math.log10(0.1);
      baseSize = minSize + ((logAmount - minLogAmount) / (maxLogAmount - minLogAmount)) * (maxSize - minSize);
    }
    
    // Apply responsive scaling
    return baseSize * scaleFactor;
  };

  // Calculate color based on amount - Updated ranges
  const getBubbleColor = (amount) => {
    if (amount < 0.001) return '#3B82F6'; // Blue - micro amount (<0.001)
    if (amount < 0.1) return '#10B981'; // Green - small amount (0.001-0.1)
    if (amount < 1) return '#F59E0B'; // Yellow - medium amount (0.1-1)
    if (amount < 10) return '#EF4444'; // Red - large amount (1-10)
    return '#8B5CF6'; // Purple - very large amount (>10)
  };

  // Physics simulation - Dynamic clustering and scattering
  const updatePhysics = (utxos) => {
    const centerX = canvasSize.width / 2;
    const centerY = canvasSize.height / 2;

    return utxos.map(utxo => {
      let newX = utxo.x + utxo.vx;
      let newY = utxo.y + utxo.vy;
      let newVx = utxo.vx * 0.995; // Reduced damping to maintain motion
      let newVy = utxo.vy * 0.995;

      const radius = getBubbleSize(utxo.amount) / 2;

      // Enhanced random forces with responsive scaling
      const baseRandomForce = clusterMode === 'normal' ? 0.04 : clusterMode === 'scatter' ? 0.03 : 0.02;
      const randomForce = baseRandomForce * scaleFactor;
      newVx += (Math.random() - 0.5) * randomForce;
      newVy += (Math.random() - 0.5) * randomForce;

      // Mode-specific forces
      if (clusterMode === 'cluster') {
        // Strong clustering force - pull towards center
        const distanceToCenter = Math.sqrt((utxo.x - centerX) ** 2 + (utxo.y - centerY) ** 2);
        if (distanceToCenter > 50 * scaleFactor) {
          const clusterForce = 0.03 * scaleFactor; // Responsive attraction
          const directionX = (centerX - utxo.x) / distanceToCenter;
          const directionY = (centerY - utxo.y) / distanceToCenter;
          newVx += directionX * clusterForce;
          newVy += directionY * clusterForce;
        }

        // Add inter-particle attraction for tighter clustering
        utxos.forEach(otherUtxo => {
          if (otherUtxo.id !== utxo.id) {
            const dx = otherUtxo.x - utxo.x;
            const dy = otherUtxo.y - utxo.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < 200 * scaleFactor) {
              const attractionForce = (0.008 * scaleFactor) / distance;
              newVx += (dx / distance) * attractionForce;
              newVy += (dy / distance) * attractionForce;
            }
          }
        });

      } else if (clusterMode === 'scatter') {
        // Enhanced scattering force - push away from center with extended range
        const distanceToCenter = Math.sqrt((utxo.x - centerX) ** 2 + (utxo.y - centerY) ** 2);
        const maxScatterDistance = Math.min(canvasSize.width, canvasSize.height) * 0.6; // 60% of canvas
        
        if (distanceToCenter < maxScatterDistance) {
          const scatterForce = 0.06 * scaleFactor; // Responsive scatter force
          const directionX = (utxo.x - centerX) / Math.max(distanceToCenter, 1);
          const directionY = (utxo.y - centerY) / Math.max(distanceToCenter, 1);
          newVx += directionX * scatterForce;
          newVy += directionY * scatterForce;
        }

        // Enhanced inter-particle repulsion for maximum spreading
        utxos.forEach(otherUtxo => {
          if (otherUtxo.id !== utxo.id) {
            const dx = utxo.x - otherUtxo.x;
            const dy = utxo.y - otherUtxo.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0 && distance < 200 * scaleFactor) { // Responsive repulsion range
              const repulsionForce = (0.025 * scaleFactor) / distance; // Responsive repulsion force
              newVx += (dx / distance) * repulsionForce;
              newVy += (dy / distance) * repulsionForce;
            }
          }
        });

      } else {
        // Normal mode - gentle center attraction with extended range
        const distanceToCenter = Math.sqrt((utxo.x - centerX) ** 2 + (utxo.y - centerY) ** 2);
        const maxNormalDistance = Math.min(canvasSize.width, canvasSize.height) * 0.4; // 40% of canvas
        
        if (distanceToCenter > maxNormalDistance) {
          const gravityForce = 0.003 * scaleFactor; // Responsive gravity force
          newVx += (centerX - utxo.x) * gravityForce / distanceToCenter;
          newVy += (centerY - utxo.y) * gravityForce / distanceToCenter;
        }
      }

      // Enhanced boundary collision - utilize full canvas range
      const margin = 5; // Minimal margin for maximum range
      if (newX - radius <= margin || newX + radius >= canvasSize.width - margin) {
        newVx = -newVx * 0.95; // Higher energy retention for more active movement
        newX = Math.max(radius + margin, Math.min(canvasSize.width - radius - margin, newX));
        // Add random energy to maintain activity
        newVx += (Math.random() - 0.5) * 0.8;
      }
      if (newY - radius <= margin || newY + radius >= canvasSize.height - margin) {
        newVy = -newVy * 0.95; // Higher energy retention for more active movement
        newY = Math.max(radius + margin, Math.min(canvasSize.height - radius - margin, newY));
        // Add random energy to maintain activity
        newVy += (Math.random() - 0.5) * 0.8;
      }

      // Enhanced velocity limits with responsive scaling
      const baseMaxVel = clusterMode === 'scatter' ? 6 : clusterMode === 'cluster' ? 4 : 3;
      const maxVel = baseMaxVel * scaleFactor;
      if (Math.abs(newVx) > maxVel) newVx = Math.sign(newVx) * maxVel;
      if (Math.abs(newVy) > maxVel) newVy = Math.sign(newVy) * maxVel;

      // Enhanced minimum velocity with responsive scaling
      const minVel = 0.2 * scaleFactor;
      if (Math.abs(newVx) < minVel && Math.abs(newVy) < minVel) {
        newVx += (Math.random() - 0.5) * 0.6 * scaleFactor;
        newVy += (Math.random() - 0.5) * 0.6 * scaleFactor;
      }

      return {
        ...utxo,
        x: newX,
        y: newY,
        vx: newVx,
        vy: newVy
      };
    });
  };

  const refreshUTXOs = async () => {
    setAnimating(true);
    setSelectedUTXO(null);
    
    try {
      await loadUTXOData();
    } catch (err) {
      console.error('Failed to refresh UTXO data:', err);
    } finally {
      setAnimating(false);
    }
  };

  // Mode switching functions
  const switchToClusterMode = () => {
    setModeTransition(true);
    setClusterMode('cluster');
    setTimeout(() => setModeTransition(false), 1000);
  };

  const switchToScatterMode = () => {
    setModeTransition(true);
    setClusterMode('scatter');
    setTimeout(() => setModeTransition(false), 1000);
  };

  const switchToNormalMode = () => {
    setModeTransition(true);
    setClusterMode('normal');
    setTimeout(() => setModeTransition(false), 1000);
  };

  // Initialize API config and load data
  useEffect(() => {
    const initializeData = async () => {
      try {
        console.log('🚀 Initializing application...');
        const config = apiService.getConfig();
        console.log('⚙️ API Config:', config);
        setApiConfig(config);
        await loadUTXOData();
        console.log('✅ Application initialized successfully');
      } catch (err) {
        console.error('❌ Failed to initialize:', err);
        setError('Failed to initialize application');
      }
    };
    
    initializeData();
  }, [loadUTXOData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setUtxos(current => updatePhysics(current));
    }, 50);

    return () => clearInterval(interval);
  }, []);

  // Statistics including unique users count
  const stats = useMemo(() => {
    if (!utxos.length) return { total: 0, count: 0, largest: 0, smallest: Infinity, uniqueUsers: 0 };
    
    const total = utxos.reduce((sum, utxo) => sum + utxo.amount, 0);
    const amounts = utxos.map(u => u.amount);
    
    // Get unique user addresses
    const uniqueUserAddresses = new Set(
      utxos.map(utxo => 
        utxo.multisig.signers.find(signer => signer.type === 'user')?.address
      ).filter(Boolean)
    );
    
    return {
      total,
      count: utxos.length,
      largest: Math.max(...amounts),
      smallest: Math.min(...amounts),
      uniqueUsers: uniqueUserAddresses.size
    };
  }, [utxos]);

  return (
    <div className="w-full max-w-none mx-auto bg-white text-gray-900 rounded-lg">
      {/* Header - Light Theme */}
      <div className="border-b border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Bitcoin className="w-8 h-8 text-orange-500" />
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Fiamma Bridge UTXO Visualization
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  ISA-Based Bitcoin UTXO Management
                  {apiConfig && (
                    <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded">
                      {apiConfig.mode.toUpperCase()} API
                    </span>
                  )}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>API Error</span>
                </div>
              )}
              
              {/* Mode Control Buttons */}
              <div className="flex items-center gap-2 border border-gray-300 rounded-lg overflow-hidden">
                <button
                  onClick={switchToNormalMode}
                  disabled={loading}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    clusterMode === 'normal' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Normal</span>
                </button>
                <button
                  onClick={switchToClusterMode}
                  disabled={loading}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    clusterMode === 'cluster' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  <span>Cluster</span>
                </button>
                <button
                  onClick={switchToScatterMode}
                  disabled={loading}
                  className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                    clusterMode === 'scatter' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>Scatter</span>
                </button>
              </div>

              {/* Mode Status Indicator */}
              {modeTransition && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Switching mode...</span>
                </div>
              )}

              {/* Scale Factor Indicator */}
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Scale: {scaleFactor.toFixed(2)}x</span>
                <span className="text-xs">({canvasSize.width}×{canvasSize.height})</span>
              </div>

              <button
                onClick={refreshUTXOs}
                disabled={animating || loading}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-50 text-gray-800 border border-gray-300 rounded-lg transition-colors"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className={`w-4 h-4 ${animating ? 'animate-spin' : ''}`} />
                )}
                <span>{loading ? 'Loading...' : 'Refresh Data'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-2">

        {/* Statistics - Light Theme */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total UTXOs</div>
            <div className="text-xl font-bold text-gray-800">{stats.count}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Unique Users</div>
            <div className="text-xl font-bold text-cyan-600">{stats.uniqueUsers}</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Total Amount</div>
            <div className="text-xl font-bold text-orange-600">{stats.total.toFixed(3)} BTC</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Largest UTXO</div>
            <div className="text-xl font-bold text-gray-800">{stats.largest.toFixed(3)} BTC</div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="text-sm text-gray-600">Smallest UTXO</div>
            <div className="text-xl font-bold text-gray-800">{stats.smallest.toFixed(6)} BTC</div>
          </div>
        </div>

      {/* Color Legend */}
      <div className="flex items-center gap-6 mb-4 text-sm">
        {/* UTXO Amount Legend */}
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-700">UTXO Amount:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
            <span>&lt; 0.001 BTC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
            <span>0.001 - 0.1 BTC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span>0.1 - 1 BTC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
            <span>1 - 10 BTC</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-purple-500 rounded-full"></div>
            <span>&gt; 10 BTC</span>
          </div>
        </div>
        
        {/* Signer Legend */}
        <div className="flex items-center gap-4 border-l border-gray-300 pl-6">
          <span className="font-semibold text-gray-700">Signers:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-cyan-500 rounded-full border-2 border-gray-300"></div>
            <span className="text-gray-700">User</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-pink-500 rounded-full border-2 border-gray-300"></div>
            <span className="text-gray-700">Committee</span>
          </div>
        </div>
      </div>

        {/* UTXO Bubble Chart - Light Theme */}
        <div className="relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg border border-gray-200 flex items-center justify-center z-20">
              <div className="text-center">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-800 text-lg font-medium">Loading UTXO Data...</p>
                <p className="text-gray-400 text-sm mt-2">Fetching from {apiConfig?.mode || 'API'}</p>
              </div>
            </div>
          )}
          
          {error && !loading && (
            <div className="absolute top-4 left-4 bg-red-900/80 backdrop-blur-sm p-3 rounded-lg border border-red-500/50 z-10">
              <div className="flex items-center gap-2 text-red-300">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">API Error: {error}</span>
              </div>
              <p className="text-xs text-red-400 mt-1">Using fallback data</p>
            </div>
          )}
          
          <svg 
            width={canvasSize.width} 
            height={canvasSize.height} 
            className="bg-gray-50 rounded-lg border border-gray-200 w-full max-w-none"
            style={{ overflow: 'visible', minHeight: '900px' }}
            viewBox={`0 0 ${canvasSize.width} ${canvasSize.height}`}
          >
            {/* Light Grid Background */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#D1D5DB" strokeWidth="1" opacity="0.3"/>
              </pattern>
            </defs>
            
            <rect width={canvasSize.width} height={canvasSize.height} fill="url(#grid)" />

          {/* UTXO Bubbles */}
          {utxos.map((utxo) => {
            const size = getBubbleSize(utxo.amount);
            const color = getBubbleColor(utxo.amount);
            const isSelected = selectedUTXO?.id === utxo.id;
            
            return (
              <g key={utxo.id}>
                {/* Main Bubble with Split Design for Multisig */}
                <defs>
                  <mask id={`mask-${utxo.id}`}>
                    <circle cx={utxo.x} cy={utxo.y} r={size / 2} fill="white" />
                  </mask>
                </defs>
                
                {/* Main UTXO Circle - Unified */}
                <circle
                  cx={utxo.x}
                  cy={utxo.y}
                  r={size / 2}
                  fill={color}
                  opacity={isSelected ? 0.9 : 0.7}
                  stroke={isSelected ? '#fff' : '#374151'}
                  strokeWidth={isSelected ? 3 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onClick={() => setSelectedUTXO(utxo)}
                  style={{
                    filter: isSelected ? 'drop-shadow(0 0 8px rgba(255,255,255,0.3))' : 'none'
                  }}
                />
                
                {/* Amount Label - Inside bubble for >= 0.1 BTC, outside for < 0.1 BTC */}
                {utxo.amount >= 0.1 ? (
                  <text
                    x={utxo.x}
                    y={utxo.y + 4}
                    textAnchor="middle"
                    className="font-bold fill-white pointer-events-none"
                    style={{ 
                      fontSize: `${14 * scaleFactor}px`,
                      textShadow: '1px 1px 3px rgba(0,0,0,0.9)' 
                    }}
                  >
                    {utxo.amount < 0.01 ? utxo.amount.toFixed(4) : utxo.amount.toFixed(2)}
                  </text>
                ) : (
                  <text
                    x={utxo.x}
                    y={utxo.y - size / 2 - 8}
                    textAnchor="middle"
                    className="font-bold pointer-events-none"
                    fill="#1F2937"
                    style={{ 
                      fontSize: `${12 * scaleFactor}px`,
                      textShadow: '1px 1px 2px rgba(255,255,255,0.8)' 
                    }}
                  >
                    {utxo.amount < 0.01 ? utxo.amount.toFixed(4) : utxo.amount.toFixed(2)}
                  </text>
                )}
                
                {/* Combined User & Committee Label (below bubble) */}
                <text
                  x={utxo.x}
                  y={utxo.y + size/2 + 18}
                  textAnchor="middle"
                  className="font-bold pointer-events-none"
                  style={{ 
                    fontSize: `${10 * scaleFactor}px`,
                    textShadow: '1px 1px 2px rgba(255,255,255,0.8)' 
                  }}
                >
                  <tspan fill="#0891B2">{utxo.multisig.signers.find(s => s.type === 'user')?.id}</tspan>
                  <tspan fill="#4B5563"> & </tspan>
                  <tspan fill="#DB2777">C</tspan>
                </text>
              </g>
            );
          })}

          {/* Mode Indicator */}
          <g className="mode-indicator">
            <rect 
              x={canvasSize.width - 150} 
              y={20} 
              width={120} 
              height={60} 
              fill="rgba(255,255,255,0.9)" 
              stroke="#D1D5DB" 
              strokeWidth="1" 
              rx="8"
            />
            <text 
              x={canvasSize.width - 90} 
              y={40} 
              textAnchor="middle" 
              className="font-bold fill-gray-700"
              style={{ fontSize: `${14 * scaleFactor}px` }}
            >
              Mode: {clusterMode.charAt(0).toUpperCase() + clusterMode.slice(1)}
            </text>
            <text 
              x={canvasSize.width - 90} 
              y={60} 
              textAnchor="middle" 
              className="fill-gray-500"
              style={{ fontSize: `${12 * scaleFactor}px` }}
            >
              {clusterMode === 'cluster' && '🎯 Clustering'}
              {clusterMode === 'scatter' && '💥 Scattering'}
              {clusterMode === 'normal' && '🌊 Normal Flow'}
            </text>
            
            {/* Mode transition effect */}
            {modeTransition && (
              <circle 
                cx={canvasSize.width - 90} 
                cy={50} 
                r="40" 
                fill="none" 
                stroke={clusterMode === 'cluster' ? '#10B981' : clusterMode === 'scatter' ? '#EF4444' : '#3B82F6'} 
                strokeWidth="2" 
                opacity="0.6"
              >
                <animate 
                  attributeName="r" 
                  values="40;60;40" 
                  dur="1s" 
                  repeatCount="1"
                />
                <animate 
                  attributeName="opacity" 
                  values="0.6;0.2;0.6" 
                  dur="1s" 
                  repeatCount="1"
                />
              </circle>
            )}
          </g>
        </svg>

        {/* UTXO Details Panel */}
        {selectedUTXO && (
            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-lg border border-gray-300 shadow-lg min-w-80 max-w-96 max-h-[600px] overflow-y-auto z-10">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-gray-800">UTXO Details</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              {/* Basic Information */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-mono font-bold text-gray-800" style={{ color: getBubbleColor(selectedUTXO.amount) }}>
                    {selectedUTXO.amount.toFixed(6)} BTC
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-xs text-gray-700">{selectedUTXO.txid}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Output Index:</span>
                  <span className="font-mono text-gray-700">{selectedUTXO.vout}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Confirmations:</span>
                  <span className="font-mono text-green-600">{selectedUTXO.confirmations}</span>
                </div>
              </div>

              {/* Multisig Information */}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-blue-600">Multisig Configuration</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Signature Scheme:</span>
                    <span className="font-mono text-yellow-600">
                      {selectedUTXO.multisig.m}-of-{selectedUTXO.multisig.n} (2-2 Multisig)
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-gray-600">Script Type:</span>
                    <span className="font-mono text-purple-600">
                      {selectedUTXO.multisig.scriptType}
                    </span>
                  </div>
                  
                  <div className="text-xs text-gray-300 mt-2">
                    {selectedUTXO.multisig.description}
                  </div>
                </div>
              </div>

              {/* Signers List */}
              <div className="border-t border-gray-300 pt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-green-600">Signers</span>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {selectedUTXO.multisig.signers.map((signer, index) => (
                    <div key={index} className="bg-gray-100 p-3 rounded text-xs">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full border-2 border-gray-300 ${
                          signer.type === 'user' ? 'bg-cyan-500' : 'bg-pink-500'
                        }`}></div>
                        <span className="font-bold text-gray-800 text-sm">
                          {signer.type === 'user' ? `${signer.name} (${signer.id})` : signer.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          signer.type === 'user' 
                            ? 'bg-cyan-100 text-cyan-700' 
                            : 'bg-pink-100 text-pink-700'
                        }`}>
                          {signer.role}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div>
                          <span className="text-gray-600">Address: </span>
                          <span className="font-mono text-blue-600">
                            {signer.address.slice(0, 12)}...{signer.address.slice(-8)}
                          </span>
                        </div>
                        
                        <div>
                          <span className="text-gray-600">Public Key: </span>
                          <span className="font-mono text-purple-600">
                            {signer.publicKey.slice(0, 12)}...{signer.publicKey.slice(-8)}
                          </span>
                        </div>
                        
                        <div className="text-xs text-gray-400 mt-1">
                          {signer.type === 'user' 
                            ? '🔐 Requires user private key signature' 
                            : '🏛️ Requires Committee consensus signature'
                          }
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => setSelectedUTXO(null)}
              className="mt-3 text-xs text-gray-400 hover:text-white"
            >
              Click to close
            </button>
          </div>
        )}
      </div>

        {/* Instructions - Light Theme */}
        <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div className="flex items-start gap-3 text-sm text-gray-700">
            <Info className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-500" />
            <div className="space-y-1">
              <p><strong className="text-gray-800">Multi-signature Control:</strong> Each UTXO requires both User (cyan) & Committee (pink) signatures</p>
              <p><strong className="text-gray-800">UTXO Colors:</strong> 
                <span className="text-blue-600">Blue (&lt;0.001)</span>, 
                <span className="text-green-600">Green (0.001-0.1)</span>, 
                <span className="text-yellow-600">Yellow (0.1-1)</span>, 
                <span className="text-red-600">Red (1-10)</span>, 
                <span className="text-purple-600">Purple (&gt;10)</span>
              </p>
              <p><strong className="text-gray-800">Layout:</strong> Amount above bubble, User & Committee identifiers below</p>
              <p><strong className="text-gray-800">Modes:</strong> 
                <span className="text-blue-600">Normal (gentle flow)</span>, 
                <span className="text-green-600">Cluster (gather together)</span>, 
                <span className="text-red-600">Scatter (spread apart)</span>
              </p>
              <p><strong className="text-gray-800">Responsive:</strong> Automatically scales with screen size and zoom level</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BitcoinUTXOBubbles;
