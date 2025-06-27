#!/usr/bin/env node

// Use built-in fetch (Node.js 18+) or provide a polyfill
if (typeof fetch === 'undefined') {
  global.fetch = require('node-fetch');
}

const BASE_URL = 'http://localhost:3000/api';

async function testRefreshTokenFlow() {
  console.log('🧪 Testing Refresh Token Flow...\n');

  try {
    // Step 1: Register a new user
    // Use a fixed phone number for testing
    const testPhone = '+1234567890';
    
    console.log('1. Trying to register/login user...');
    
    // Try registration first
    let registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        phoneNumber: testPhone,
        password: 'Test123!',
      }),
    });

    let authData;
    let cookies;
    
    if (registerResponse.status === 409) {
      // User exists, try login
      console.log('User exists, attempting login...');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: testPhone,
          password: 'Test123!',
        }),
      });
      
      if (!loginResponse.ok) {
        throw new Error(`Login failed: ${loginResponse.status} ${loginResponse.statusText}`);
      }
      
      authData = await loginResponse.json();
      cookies = loginResponse.headers.get('set-cookie');
      console.log('✅ Login successful');
    } else if (registerResponse.ok) {
      authData = await registerResponse.json();
      cookies = registerResponse.headers.get('set-cookie');
      console.log('✅ Registration successful');
    } else {
      throw new Error(`Registration failed: ${registerResponse.status} ${registerResponse.statusText}`);
    }
    
    console.log('Access Token:', authData.accessToken.substring(0, 20) + '...');
    console.log('Cookies:', cookies);

    // Step 2: Try to refresh the token
    console.log('\n2. Attempting to refresh token...');
    const refreshResponse = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Cookie': cookies,
      },
    });

    console.log('Refresh Response Status:', refreshResponse.status);
    console.log('Refresh Response Headers:', Object.fromEntries(refreshResponse.headers.entries()));

    if (!refreshResponse.ok) {
      const errorText = await refreshResponse.text();
      console.log('❌ Refresh failed:', errorText);
      throw new Error(`Refresh failed: ${refreshResponse.status} ${refreshResponse.statusText}`);
    }

    const refreshData = await refreshResponse.json();
    console.log('✅ Token refresh successful');
    console.log('New Access Token:', refreshData.accessToken.substring(0, 20) + '...');

    console.log('\n🎉 All tests passed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testRefreshTokenFlow();
