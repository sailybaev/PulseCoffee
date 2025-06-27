// Quick test script to check backend connectivity
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

console.log('Testing backend connectivity...');
console.log('API URL:', API_URL);

// Test basic connectivity
fetch(`${API_URL}/products/public`)
  .then(response => {
    console.log('Products endpoint status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Products data received:', data?.length || 0, 'items');
  })
  .catch(error => {
    console.error('Failed to connect to backend:', error.message);
  });

// Test branches endpoint
fetch(`${API_URL}/branches-public`)
  .then(response => {
    console.log('Branches endpoint status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Branches data received:', data?.length || 0, 'branches');
    data?.forEach(branch => {
      console.log('- Branch:', branch.id, branch.name);
    });
  })
  .catch(error => {
    console.error('Failed to fetch branches:', error.message);
  });
