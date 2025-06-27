// Test script to validate frontend-backend integration
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

async function testIntegration() {
  console.log('🧪 Testing Frontend-Backend Integration...\n');

  try {
    // Test 1: Get Products
    console.log('1️⃣ Testing GET /products/public');
    const productsResponse = await axios.get(`${API_BASE_URL}/products/public`);
    console.log(`✅ Products loaded: ${productsResponse.data.length} items`);
    
    if (productsResponse.data.length > 0) {
      const sampleProduct = productsResponse.data[0];
      console.log(`   Sample product: ${sampleProduct.name} - ${sampleProduct.basePrice} KZT`);
      
      // Test 2: Get Customizations for first product
      console.log(`\n2️⃣ Testing GET /products/public/${sampleProduct.id}/customizations`);
      const customizationsResponse = await axios.get(`${API_BASE_URL}/products/public/${sampleProduct.id}/customizations`);
      console.log(`✅ Customizations loaded: ${customizationsResponse.data.length} options`);
      
      if (customizationsResponse.data.length > 0) {
        const sampleCustomization = customizationsResponse.data[0];
        console.log(`   Sample customization: ${sampleCustomization.name} (+${sampleCustomization.price} KZT)`);
      }
    }

    // Test 3: Create Order
    console.log(`\n3️⃣ Testing POST /orders/public`);
    const orderData = {
      branchId: 'default-branch',
      items: [
        {
          productId: productsResponse.data[0]?.id || 'espresso',
          quantity: 1,
          price: productsResponse.data[0]?.basePrice || 800,
          customizations: []
        }
      ],
      totalPrice: productsResponse.data[0]?.basePrice || 800,
      customerPhone: '+77771234567',
      customerName: 'Integration Test Customer'
    };

    const orderResponse = await axios.post(`${API_BASE_URL}/orders/public`, orderData);
    console.log(`✅ Order created: ${orderResponse.data.orderNumber}`);
    console.log(`   Order ID: ${orderResponse.data.id}`);
    console.log(`   Status: ${orderResponse.data.status}`);
    console.log(`   Total: ${orderResponse.data.total} KZT`);

    console.log('\n🎉 All integration tests passed! Frontend can successfully communicate with backend.');
    
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

// Run the test
testIntegration();
