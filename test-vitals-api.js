const axios = require('axios');

const testVitalsAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 Testing Vitals API Endpoints');
  console.log('================================\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check passed:', healthResponse.data.message);
    console.log('');

    // Test 2: Test validation with invalid data
    console.log('2. Testing validation with invalid data...');
    try {
      await axios.put(`${baseURL}/medical-records/vitals/invalid-id`, {
        weight: 'not-a-number',
        heartRate: 300 // Out of range
      });
    } catch (error) {
      if (error.response?.status === 400) {
        console.log('✅ Validation working correctly');
        console.log('   Error:', error.response.data.message);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    // Test 3: Test with valid data structure
    console.log('3. Testing with valid data structure...');
    const validData = {
      weight: 70.5,
      height: 175,
      heartRate: 72,
      bloodPressure: {
        systolic: 120,
        diastolic: 80
      },
      temperature: 36.5
    };
    
    try {
      // This will fail without authentication, but we can check the structure
      await axios.put(`${baseURL}/medical-records/vitals/507f1f77bcf86cd799439011`, validData);
    } catch (error) {
      if (error.response?.status === 401) {
        console.log('✅ Authentication required (expected)');
      } else if (error.response?.status === 400) {
        console.log('❌ Validation error:', error.response.data);
      } else {
        console.log('❌ Unexpected error:', error.response?.data || error.message);
      }
    }
    console.log('');

    console.log('🎯 API Structure Test Complete');
    console.log('Note: Full testing requires authentication token');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the server is running: npm run dev');
    }
  }
};

// Run the test
testVitalsAPI();

