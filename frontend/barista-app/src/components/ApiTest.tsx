'use client';

import { useState } from 'react';

export default function ApiTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testEndpoint = async (endpoint: string, method: string = 'GET') => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const token = localStorage.getItem('auth_token');
      const user = localStorage.getItem('user_data');
      let userData = null;
      
      try {
        userData = user ? JSON.parse(user) : null;
      } catch (e) {
        userData = null;
      }

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('🧪 Testing endpoint:', endpoint);
      console.log('🔐 Token present:', !!token);
      console.log('👤 User data:', userData);

      const response = await fetch(endpoint, {
        method,
        headers,
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch (e) {
        responseData = responseText;
      }
      
      setResult(`
🧪 ENDPOINT TEST RESULTS
================================
URL: ${endpoint}
Method: ${method}

🔐 AUTHENTICATION
Token Present: ${!!token}
Token Preview: ${token ? token.substring(0, 30) + '...' : 'None'}
User Role: ${userData?.role || 'Unknown'}
User ID: ${userData?.id || 'Unknown'}

📡 RESPONSE
Status: ${response.status} ${response.statusText}
Success: ${response.ok ? '✅' : '❌'}

📋 RESPONSE HEADERS
${JSON.stringify(Object.fromEntries(response.headers.entries()), null, 2)}

📦 RESPONSE BODY
${typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData}
      `);
    } catch (error) {
      setResult(`
🚨 ERROR OCCURRED
================================
${error instanceof Error ? error.message : String(error)}

Stack Trace:
${error instanceof Error ? error.stack : 'N/A'}
      `);
    } finally {
      setLoading(false);
    }
  };

  const testEndpoints = [
    'http://localhost:3000/api/auth/validate',
    'http://localhost:3000/api/orders',
    'http://localhost:3000/api/orders/branch?branch=81a0bc8c-94b6-43d0-9496-1832ba5fb36d',
    'http://localhost:3000/api/orders/branch/81a0bc8c-94b6-43d0-9496-1832ba5fb36d',
  ];

  const testLogin = async () => {
    const phoneNumber = prompt('Enter phone number:', '+1234567891');
    const password = prompt('Enter password:', 'password123');
    
    if (!phoneNumber || !password) return;

    await testWithBody('http://localhost:3000/api/auth/login', 'POST', {
      phoneNumber,
      password
    });
  };

  const testWithBody = async (endpoint: string, method: string, body: any) => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(body)
      });

      const responseText = await response.text();
      let responseData;
      try {
        responseData = JSON.parse(responseText);
        
        // If it's a login response with a token, save it
        if (responseData.access_token) {
          localStorage.setItem('auth_token', responseData.access_token);
          if (responseData.user) {
            localStorage.setItem('user_data', JSON.stringify(responseData.user));
          }
          setResult(`✅ Login successful! Token saved.\n\n${JSON.stringify(responseData, null, 2)}`);
          return;
        }
      } catch (e) {
        responseData = responseText;
      }
      
      setResult(`
Status: ${response.status} ${response.statusText}
Body: ${typeof responseData === 'object' ? JSON.stringify(responseData, null, 2) : responseData}
      `);
    } catch (error) {
      setResult(`Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">API Connection Test</h2>
      
      <div className="space-y-2 mb-4">
        {testEndpoints.map((endpoint) => (
          <button
            key={endpoint}
            onClick={() => testEndpoint(endpoint)}
            disabled={loading}
            className="block w-full text-left p-2 bg-blue-100 hover:bg-blue-200 rounded text-sm"
          >
            Test: {endpoint}
          </button>
        ))}
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Result:</h3>
        <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap">
          {result || 'Click a button to test an endpoint'}
        </pre>
      </div>

      <div className="mt-4 text-sm text-gray-600">
        <p><strong>Current auth token:</strong> {localStorage.getItem('auth_token') ? 'Present' : 'Missing'}</p>
        <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}</p>
      </div>
    </div>
  );
}
