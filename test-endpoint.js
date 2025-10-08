const axios = require('axios');

const testAPI = async () => {
  try {
    console.log('🔍 Testing API endpoints...\n');
    
    // First, let's try to login as the doctor to get a token
    console.log('1. Testing doctor login...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'santoshdesai43@gmail.com',
      password: 'password123' // You'll need to provide the actual password
    });
    
    console.log('✅ Doctor login successful');
    const token = loginResponse.data.token;
    
    // Now test the getAllPatients endpoint
    console.log('\n2. Testing getAllPatients endpoint...');
    const patientsResponse = await axios.get('http://localhost:5000/api/medical-records/patients', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ getAllPatients endpoint successful');
    console.log('Response:', JSON.stringify(patientsResponse.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error testing API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 The issue might be with authentication. Please check:');
      console.log('1. Is the server running on port 5000?');
      console.log('2. Is the doctor password correct?');
      console.log('3. Are you logged in as a doctor in the frontend?');
    }
  }
};

testAPI();
