const io = require('socket.io-client');
const axios = require('axios');

// Configuration
const SERVER_URL = 'http://localhost:3000';
const API_BASE = `${SERVER_URL}/api`;

// Test user credentials (you may need to adjust these based on your existing users)
const TEST_USERS = {
  barista: { phoneNumber: '+77007247003', password: 'password' },
  admin: { phoneNumber: '+1987654321', password: 'password123' },
  client: { phoneNumber: '+1234567890', password: 'password123' }
};

let tokens = {};
let sockets = {};

async function login(userType) {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, TEST_USERS[userType]);
    tokens[userType] = response.data.accessToken;
    console.log(`✅ ${userType} logged in successfully`);
    return response.data;
  } catch (error) {
    console.error(`❌ ${userType} login failed:`, error.response?.data?.message || error.message);
    throw error;
  }
}

async function connectWebSocket(userType) {
  return new Promise((resolve, reject) => {
    const socket = io(SERVER_URL, {
      auth: {
        token: tokens[userType]
      }
    });

    socket.on('connect', () => {
      console.log(`🔗 ${userType} WebSocket connected`);
      sockets[userType] = socket;
      resolve(socket);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 ${userType} WebSocket disconnected`);
    });

    socket.on('connect_error', (error) => {
      console.error(`❌ ${userType} WebSocket connection error:`, error.message);
      reject(error);
    });

    socket.on('newOrder', (order) => {
      console.log(`📦 ${userType} received new order notification:`, {
        id: order.id,
        total: order.total,
        branchId: order.branchId
      });
    });

    socket.on('orderStatusUpdate', (data) => {
      console.log(`📋 ${userType} received order status update:`, data);
    });

    socket.on('joinedBaristaRoom', (data) => {
      console.log(`🏪 ${userType} joined barista room:`, data);
    });
  });
}

async function joinBaristaRoom(userType, branchId) {
  const socket = sockets[userType];
  if (socket) {
    socket.emit('joinBaristaRoom', branchId);
    console.log(`🏪 ${userType} attempting to join barista room for branch ${branchId}`);
  }
}

async function getBranches() {
  try {
    const response = await axios.get(`${API_BASE}/branches`, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get branches:', error.response?.data?.message || error.message);
    return [];
  }
}

async function getProducts() {
  try {
    const response = await axios.get(`${API_BASE}/products`, {
      headers: { Authorization: `Bearer ${tokens.admin}` }
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get products:', error.response?.data?.message || error.message);
    return [];
  }
}

async function createOrder(branchId, items) {
  try {
    const response = await axios.post(`${API_BASE}/orders`, {
      branchId,
      items
    }, {
      headers: { Authorization: `Bearer ${tokens.client}` }
    });
    console.log(`📦 Order created successfully:`, {
      id: response.data.id,
      total: response.data.total,
      branchId: response.data.branchId
    });
    return response.data;
  } catch (error) {
    console.error('❌ Failed to create order:', error.response?.data?.message || error.message);
    throw error;
  }
}

async function runTest() {
  console.log('🚀 Starting WebSocket order notification test...\n');

  try {
    // 1. Login all users
    console.log('📝 Step 1: Logging in users...');
    await login('admin');
    await login('barista');
    await login('client');
    console.log();

    // 2. Connect WebSockets
    console.log('🔗 Step 2: Connecting WebSockets...');
    await connectWebSocket('admin');
    await connectWebSocket('barista');
    await connectWebSocket('client');
    console.log();

    // 3. Get branches and products
    console.log('📋 Step 3: Getting branches and products...');
    const branches = await getBranches();
    const products = await getProducts();
    
    if (branches.length === 0) {
      console.log('⚠️ No branches found. Creating a test branch...');
      const branchResponse = await axios.post(`${API_BASE}/branches`, {
        name: 'Test Branch',
        address: '123 Test Street'
      }, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      branches.push(branchResponse.data);
    }

    if (products.length === 0) {
      console.log('⚠️ No products found. Creating a test product...');
      const productResponse = await axios.post(`${API_BASE}/products`, {
        name: 'Test Coffee',
        basePrice: 5.99,
        category: 'COFFEE',
        description: 'Test coffee for WebSocket testing'
      }, {
        headers: { Authorization: `Bearer ${tokens.admin}` }
      });
      products.push(productResponse.data);
    }

    const firstBranch = branches[0];
    const firstProduct = products[0];
    
    console.log(`🏪 Using branch: ${firstBranch.name} (ID: ${firstBranch.id})`);
    console.log(`☕ Using product: ${firstProduct.name} (ID: ${firstProduct.id})`);
    console.log();

    // 4. Join barista rooms
    console.log('🏪 Step 4: Joining barista rooms...');
    await joinBaristaRoom('admin', firstBranch.id);
    await joinBaristaRoom('barista', firstBranch.id);
    
    // Wait a moment for room joins to complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log();

    // 5. Create a test order
    console.log('📦 Step 5: Creating test order...');
    const orderItems = [{
      productId: firstProduct.id,
      quantity: 2
    }];
    
    await createOrder(firstBranch.id, orderItems);
    console.log();

    // 6. Wait for WebSocket notifications
    console.log('⏳ Step 6: Waiting for WebSocket notifications (5 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log('✅ Test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    // Cleanup
    console.log('\n🧹 Cleaning up...');
    Object.values(sockets).forEach(socket => {
      if (socket) socket.disconnect();
    });
    process.exit(0);
  }
}

// Run the test
runTest();
